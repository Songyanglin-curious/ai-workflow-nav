import { randomBytes } from 'node:crypto';

import { type SqliteDatabase, runInTransaction, DatabaseTransactionError } from '../../infra/db/index.js';
import {
  ProjectNotFoundError,
  SolutionConflictError,
  SolutionNotFoundError,
  SolutionProjectBindingNotFoundError,
  SolutionValidationFailedError,
} from './errors.js';
import {
  createSolutionRepo,
  type ProjectRecord,
  type SolutionProjectRecord,
  type SolutionQuery,
  type SolutionRecord,
} from './repo.js';

export interface SolutionSummary {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SolutionDetail = SolutionSummary;

export interface SolutionProjectItem {
  solutionId: string;
  projectId: string;
  sortOrder: number;
  projectName: string;
}

export interface ProjectSolutionItem {
  projectId: string;
  solutionId: string;
  solutionName: string;
  sortOrder: number;
}

export interface CreateSolutionInput {
  name: string;
  description?: string;
  tags?: string;
  category?: string;
}

export interface UpdateSolutionInput {
  name?: string;
  description?: string;
  tags?: string;
  category?: string;
}

export interface CreateSolutionProjectInput {
  projectId: string;
  sortOrder?: number;
}

export interface PatchSolutionProjectInput {
  sortOrder: number;
}

function createUuidV7(): string {
  const timestamp = BigInt(Date.now());
  const bytes = randomBytes(16);

  bytes[0] = Number((timestamp >> 40n) & 0xffn);
  bytes[1] = Number((timestamp >> 32n) & 0xffn);
  bytes[2] = Number((timestamp >> 24n) & 0xffn);
  bytes[3] = Number((timestamp >> 16n) & 0xffn);
  bytes[4] = Number((timestamp >> 8n) & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Buffer.from(bytes).toString('hex');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function assertSolutionName(name: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    throw new SolutionValidationFailedError('Solution 名称不能为空。');
  }

  return trimmedName;
}

function toSolutionSummary(record: SolutionRecord): SolutionSummary {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    tags: record.tags,
    category: record.category,
    projectCount: record.projectCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toSolutionProjectItem(record: SolutionProjectRecord): SolutionProjectItem {
  return {
    solutionId: record.solutionId,
    projectId: record.projectId,
    sortOrder: record.sortOrder,
    projectName: record.projectName,
  };
}

function toProjectSolutionItem(record: {
  projectId: string;
  solutionId: string;
  solutionName: string;
  sortOrder: number;
}): ProjectSolutionItem {
  return {
    projectId: record.projectId,
    solutionId: record.solutionId,
    solutionName: record.solutionName,
    sortOrder: record.sortOrder,
  };
}

function isUniqueBindingConflict(error: unknown): boolean {
  if (!(error instanceof DatabaseTransactionError)) {
    return false;
  }

  const cause = error.cause;

  if (cause instanceof Error) {
    return (
      cause.message.includes('solution_projects.solution_id') &&
      cause.message.includes('solution_projects.project_id')
    );
  }

  return false;
}

function assertSolutionExists(solution: SolutionRecord | undefined, solutionId: string): SolutionRecord {
  if (!solution) {
    throw new SolutionNotFoundError(solutionId);
  }

  return solution;
}

function assertProjectExists(project: ProjectRecord | undefined, projectId: string): ProjectRecord {
  if (!project) {
    throw new ProjectNotFoundError(projectId);
  }

  return project;
}

function assertSolutionProjectExists(
  binding: SolutionProjectRecord | undefined,
  solutionId: string,
  projectId: string,
): SolutionProjectRecord {
  if (!binding) {
    throw new SolutionProjectBindingNotFoundError(solutionId, projectId);
  }

  return binding;
}

export function createSolutionService(database: SqliteDatabase) {
  const repo = createSolutionRepo(database);

  function assertSolutionProjectBindingSolution(
    solutionId: string,
    projectId: string,
  ): SolutionProjectRecord {
    const solution = assertSolutionExists(repo.getSolutionById(solutionId), solutionId);
    const project = assertProjectExists(repo.getProjectById(projectId), projectId);
    const binding = repo.getSolutionProjectBySolutionIdAndProjectId(solution.id, project.id);

    return assertSolutionProjectExists(binding, solution.id, project.id);
  }

  return {
    listSolutions(query: SolutionQuery = {}): SolutionSummary[] {
      return repo.listSolutions(query).map(toSolutionSummary);
    },

    getSolutionById(id: string): SolutionDetail {
      const record = repo.getSolutionById(id);

      if (!record) {
        throw new SolutionNotFoundError(id);
      }

      return toSolutionSummary(record);
    },

    createSolution(input: CreateSolutionInput): SolutionDetail {
      const now = createTimestamp();
      const record: SolutionRecord = {
        id: createUuidV7(),
        name: assertSolutionName(input.name),
        description: input.description ?? '',
        tags: input.tags ?? '',
        category: input.category ?? '',
        projectCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      runInTransaction(database, () => repo.createSolution(record));
      return toSolutionSummary(record);
    },

    updateSolution(id: string, patch: UpdateSolutionInput): SolutionDetail {
      const currentRecord = repo.getSolutionById(id);

      if (!currentRecord) {
        throw new SolutionNotFoundError(id);
      }

      const nextRecord: SolutionRecord = {
        ...currentRecord,
        name: patch.name !== undefined ? assertSolutionName(patch.name) : currentRecord.name,
        description: patch.description ?? currentRecord.description,
        tags: patch.tags ?? currentRecord.tags,
        category: patch.category ?? currentRecord.category,
        updatedAt: createTimestamp(),
      };

      runInTransaction(database, () => repo.updateSolution(nextRecord));

      return toSolutionSummary(nextRecord);
    },

    deleteSolutionById(id: string): { deleted: true } {
      const record = repo.getSolutionById(id);

      if (!record) {
        throw new SolutionNotFoundError(id);
      }

      runInTransaction(database, () => repo.deleteSolutionById(id));

      return {
        deleted: true,
      };
    },

    listSolutionProjectsBySolutionId(solutionId: string): SolutionProjectItem[] {
      assertSolutionExists(repo.getSolutionById(solutionId), solutionId);
      return repo.listSolutionProjectsBySolutionId(solutionId).map(toSolutionProjectItem);
    },

    createSolutionProject(solutionId: string, input: CreateSolutionProjectInput): SolutionProjectItem {
      const solution = assertSolutionExists(repo.getSolutionById(solutionId), solutionId);
      const project = assertProjectExists(repo.getProjectById(input.projectId), input.projectId);
      const currentBinding = repo.getSolutionProjectBySolutionIdAndProjectId(solution.id, project.id);

      if (currentBinding) {
        throw new SolutionConflictError(solution.id, project.id);
      }

      const now = createTimestamp();
      const record: SolutionProjectRecord = {
        id: createUuidV7(),
        solutionId: solution.id,
        projectId: project.id,
        sortOrder: input.sortOrder ?? repo.getNextSolutionProjectSortOrder(solution.id),
        projectName: project.name,
        createdAt: now,
      };

      try {
        runInTransaction(database, () => repo.createSolutionProject(record));
      } catch (error) {
        if (isUniqueBindingConflict(error)) {
          throw new SolutionConflictError(solution.id, project.id);
        }

        throw error;
      }

      return toSolutionProjectItem(record);
    },

    updateSolutionProjectBySolutionIdAndProjectId(
      solutionId: string,
      projectId: string,
      patch: PatchSolutionProjectInput,
    ): SolutionProjectItem {
      const binding = assertSolutionProjectBindingSolution(solutionId, projectId);

      runInTransaction(database, () =>
        repo.updateSolutionProjectSortOrder(binding.solutionId, binding.projectId, patch.sortOrder),
      );

      return {
        ...toSolutionProjectItem(binding),
        sortOrder: patch.sortOrder,
      };
    },

    deleteSolutionProjectBySolutionIdAndProjectId(solutionId: string, projectId: string): { deleted: true } {
      const binding = assertSolutionProjectBindingSolution(solutionId, projectId);

      runInTransaction(database, () =>
        repo.deleteSolutionProjectBySolutionIdAndProjectId(binding.solutionId, binding.projectId),
      );

      return {
        deleted: true,
      };
    },

    listProjectSolutionsByProjectId(projectId: string): ProjectSolutionItem[] {
      assertProjectExists(repo.getProjectById(projectId), projectId);
      return repo.listProjectSolutionsByProjectId(projectId).map((record) =>
        toProjectSolutionItem({
          projectId: record.projectId,
          solutionId: record.solutionId,
          solutionName: record.solutionName,
          sortOrder: record.sortOrder,
        }),
      );
    },
  };
}

export type SolutionService = ReturnType<typeof createSolutionService>;
