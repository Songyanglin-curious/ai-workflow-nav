import { randomBytes } from 'node:crypto';

import { ensureDirectory, removePath } from '../../infra/filesystem/index.js';
import { runInTransaction, type SqliteDatabase } from '../../infra/db/index.js';
import { resolveProjectPath, type WorkspacePaths } from '../../infra/workspace/index.js';
import {
  ProjectFolderPathConflictError,
  ProjectNotFoundError,
  ProjectValidationFailedError,
} from './errors.js';
import { createProjectRepo, type ProjectQuery, type ProjectRecord } from './repo.js';

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectSummary {}

export interface CreateProjectInput {
  name: string;
  description?: string;
  tags?: string;
  category?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  tags?: string;
  category?: string;
}

const forbiddenFileNameCharacters = /[<>:"/\\|?*]/;
const reservedFileNames = new Set([
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
]);

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

function createShortId(id: string): string {
  return id.replaceAll('-', '').slice(0, 8);
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function assertProjectName(name: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    throw new ProjectValidationFailedError('Project 名称不能为空。');
  }

  if (forbiddenFileNameCharacters.test(trimmedName)) {
    throw new ProjectValidationFailedError(`Project 名称包含非法文件名字符：${trimmedName}`);
  }

  if (trimmedName.endsWith(' ') || trimmedName.endsWith('.')) {
    throw new ProjectValidationFailedError(`Project 名称不能以空格或点号结尾：${trimmedName}`);
  }

  if (reservedFileNames.has(trimmedName.toUpperCase())) {
    throw new ProjectValidationFailedError(`Project 名称不能使用系统保留名：${trimmedName}`);
  }

  return trimmedName;
}

function buildProjectFolderPath(name: string, id: string): string {
  return `${name}__${createShortId(id)}`;
}

function toProjectSummary(record: ProjectRecord): ProjectSummary {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    tags: record.tags,
    category: record.category,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function createProjectService(database: SqliteDatabase, workspacePaths: WorkspacePaths) {
  const repo = createProjectRepo(database);

  return {
    listProjects(query: ProjectQuery = {}): ProjectSummary[] {
      return repo.listProjects(query).map(toProjectSummary);
    },

    getProjectById(id: string): ProjectDetail {
      const record = repo.getProjectById(id);

      if (!record) {
        throw new ProjectNotFoundError(id);
      }

      return toProjectSummary(record);
    },

    async createProject(input: CreateProjectInput): Promise<ProjectDetail> {
      const id = createUuidV7();
      const name = assertProjectName(input.name);
      const now = createTimestamp();
      const folderPath = buildProjectFolderPath(name, id);

      if (repo.getProjectByFolderPath(folderPath)) {
        throw new ProjectFolderPathConflictError(folderPath);
      }

      const record: ProjectRecord = {
        id,
        name,
        description: input.description ?? '',
        tags: input.tags ?? '',
        category: input.category ?? '',
        folderPath,
        createdAt: now,
        updatedAt: now,
      };
      const absoluteProjectPath = resolveProjectPath(workspacePaths, folderPath);

      await ensureDirectory(absoluteProjectPath);

      try {
        runInTransaction(database, () => repo.createProject(record));
      } catch (error) {
        await removePath(absoluteProjectPath).catch(() => undefined);
        throw error;
      }

      return toProjectSummary(record);
    },

    updateProject(id: string, patch: UpdateProjectInput): ProjectDetail {
      const currentRecord = repo.getProjectById(id);

      if (!currentRecord) {
        throw new ProjectNotFoundError(id);
      }

      const nextRecord: ProjectRecord = {
        ...currentRecord,
        name: patch.name !== undefined ? assertProjectName(patch.name) : currentRecord.name,
        description: patch.description ?? currentRecord.description,
        tags: patch.tags ?? currentRecord.tags,
        category: patch.category ?? currentRecord.category,
        updatedAt: createTimestamp(),
      };

      runInTransaction(database, () => repo.updateProject(nextRecord));
      return toProjectSummary(nextRecord);
    },
  };
}

export type ProjectService = ReturnType<typeof createProjectService>;
