import path from 'node:path';

import { ensureDirectory, listDirectory, movePath, pathExists, removePath } from '../../infra/filesystem/index.js';
import { runInTransaction, type SqliteDatabase } from '../../infra/db/index.js';
import {
  resolveProjectPath,
  resolveSummaryArchivePath,
  type WorkspacePaths,
} from '../../infra/workspace/index.js';
import { ProjectNotFoundError } from '../../domains/projects/errors.js';
import {
  ProjectDeletionBlockedError,
  ProjectDeletionConfirmationRequiredError,
  ProjectDeletionExecutionFailedError,
  ProjectSummaryArchiveFailedError,
} from './errors.js';
import { createProjectDeletionRepo, type ProjectArchiveTarget, type ProjectDeletionSnapshot } from './repo.js';

export type DeletionStrategy = 'archive_then_delete' | 'direct_delete';

export interface ProjectDeletionCheckResult {
  projectId: string;
  projectNodeCount: number;
  summaryNodeCount: number;
  requiresSecondConfirmation: boolean;
  allowedStrategies: DeletionStrategy[];
}

export interface ProjectDeletionExecuteResult {
  projectId: string;
  deleted: boolean;
  usedStrategy: DeletionStrategy;
  archivedSummaryNodeCount: number;
}

export interface ProjectDeletionExecuteInput {
  confirmDelete: boolean;
  secondConfirmation?: boolean;
  strategy: DeletionStrategy;
}

async function countSummaryNodes(
  workspacePaths: WorkspacePaths,
  archiveTargets: ProjectArchiveTarget[],
): Promise<number> {
  let summaryNodeCount = 0;

  for (const target of archiveTargets) {
    const entries = await listDirectory(resolveProjectPath(workspacePaths, target.summaryFolderPath));

    if (entries.some((entry) => entry.kind === 'file')) {
      summaryNodeCount += 1;
    }
  }

  return summaryNodeCount;
}

function createCheckResult(snapshot: ProjectDeletionSnapshot, summaryNodeCount: number): ProjectDeletionCheckResult {
  const requiresSecondConfirmation = summaryNodeCount > 0;

  return {
    projectId: snapshot.projectId,
    projectNodeCount: snapshot.projectNodeCount,
    summaryNodeCount,
    requiresSecondConfirmation,
    allowedStrategies: requiresSecondConfirmation ? ['archive_then_delete', 'direct_delete'] : ['direct_delete'],
  };
}

async function archiveProjectSummaries(
  workspacePaths: WorkspacePaths,
  archiveTargets: ProjectArchiveTarget[],
): Promise<Array<{ sourcePath: string; archivePath: string }>> {
  const archiveRecords: Array<{ sourcePath: string; archivePath: string }> = [];

  for (const target of archiveTargets) {
    const sourcePath = resolveProjectPath(workspacePaths, target.summaryFolderPath);
    const entries = await listDirectory(sourcePath);

    if (!entries.some((entry) => entry.kind === 'file')) {
      continue;
    }

    const archivePath = resolveSummaryArchivePath(workspacePaths, target.nodeFolderPath);

    if (await pathExists(archivePath)) {
      throw new ProjectSummaryArchiveFailedError(`项目总结归档目录已存在：${target.nodeFolderPath}`);
    }

    try {
      await ensureDirectory(path.dirname(archivePath));
      await movePath(sourcePath, archivePath);
      archiveRecords.push({
        sourcePath,
        archivePath,
      });
    } catch (error) {
      throw new ProjectSummaryArchiveFailedError(`项目总结归档失败：${target.projectNodeId}`, error);
    }
  }

  return archiveRecords;
}

async function restoreProjectSummaries(
  archiveRecords: Array<{ sourcePath: string; archivePath: string }>,
): Promise<void> {
  for (const archiveRecord of [...archiveRecords].reverse()) {
    if (!(await pathExists(archiveRecord.archivePath))) {
      continue;
    }

    await movePath(archiveRecord.archivePath, archiveRecord.sourcePath).catch(() => undefined);
  }
}

export function createProjectDeletionService(database: SqliteDatabase, workspacePaths: WorkspacePaths) {
  const repo = createProjectDeletionRepo(database);

  return {
    async checkProjectDeletion(projectId: string): Promise<ProjectDeletionCheckResult> {
      const snapshot = repo.getProjectDeletionSnapshot(projectId);

      if (!snapshot) {
        throw new ProjectNotFoundError(projectId);
      }

      const summaryNodeCount = await countSummaryNodes(workspacePaths, snapshot.archiveTargets);
      return createCheckResult(snapshot, summaryNodeCount);
    },

    async executeProjectDeletion(
      projectId: string,
      input: ProjectDeletionExecuteInput,
    ): Promise<ProjectDeletionExecuteResult> {
      if (!input.confirmDelete) {
        throw new ProjectDeletionConfirmationRequiredError('删除项目之前必须先明确确认删除。');
      }

      const snapshot = repo.getProjectDeletionSnapshot(projectId);

      if (!snapshot) {
        throw new ProjectNotFoundError(projectId);
      }

      const checkResult = await this.checkProjectDeletion(projectId);

      if (checkResult.requiresSecondConfirmation && !input.secondConfirmation) {
        throw new ProjectDeletionConfirmationRequiredError('当前项目仍存在非空 summaries，必须完成二次确认。');
      }

      if (!checkResult.allowedStrategies.includes(input.strategy)) {
        throw new ProjectDeletionBlockedError(`当前删除策略不允许：${input.strategy}`);
      }

      const archiveRecords =
        input.strategy === 'archive_then_delete'
          ? await archiveProjectSummaries(workspacePaths, snapshot.archiveTargets)
          : [];

      try {
        runInTransaction(database, () => {
          repo.deleteProjectViewConfig(snapshot.projectId);
          repo.deleteSolutionProjectsByProjectId(snapshot.projectId);
          repo.deleteProjectNodeWorkflowsByProjectId(snapshot.projectId);
          repo.deleteProjectNodeRelationsByProjectId(snapshot.projectId);
          repo.deleteProjectNodesByProjectId(snapshot.projectId);
          repo.deleteProjectById(snapshot.projectId);
        });

        await removePath(resolveProjectPath(workspacePaths, snapshot.projectFolderPath));

        return {
          projectId: snapshot.projectId,
          deleted: true,
          usedStrategy: input.strategy,
          archivedSummaryNodeCount: archiveRecords.length,
        };
      } catch (error) {
        await restoreProjectSummaries(archiveRecords);
        throw new ProjectDeletionExecutionFailedError(`项目删除执行失败：${projectId}`, error);
      }
    },
  };
}

export type ProjectDeletionService = ReturnType<typeof createProjectDeletionService>;
