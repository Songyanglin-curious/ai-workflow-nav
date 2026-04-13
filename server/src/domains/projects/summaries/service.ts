import { listDirectory, pathExists } from '../../../infra/filesystem/index.js';
import type { SqliteDatabase } from '../../../infra/db/index.js';
import { resolveProjectPath, type WorkspacePaths } from '../../../infra/workspace/index.js';
import { ProjectNodeNotFoundError } from '../project-nodes/errors.js';
import { createProjectNodeRepo } from '../project-nodes/repo.js';
import { SummaryRecordNotFoundError } from './errors.js';
import { createSummaryRepo } from './repo.js';

export interface SummaryFolderInfo {
  projectNodeId: string;
  exists: boolean;
  fileCount: number;
  isEmpty: boolean;
}

export interface SummaryFileItem {
  fileName: string;
}

export function createSummaryService(database: SqliteDatabase, workspacePaths: WorkspacePaths) {
  const projectNodeRepo = createProjectNodeRepo(database);
  const repo = createSummaryRepo(database);

  async function getFolderPath(projectNodeId: string): Promise<string> {
    if (!projectNodeRepo.getProjectNodeEntityById(projectNodeId)) {
      throw new ProjectNodeNotFoundError(projectNodeId);
    }

    const record = repo.getSummaryRecordByProjectNodeId(projectNodeId);

    if (!record) {
      throw new SummaryRecordNotFoundError(projectNodeId);
    }

    return resolveProjectPath(workspacePaths, record.folderPath);
  }

  return {
    async getSummaryFolderInfo(projectNodeId: string): Promise<SummaryFolderInfo> {
      const absoluteFolderPath = await getFolderPath(projectNodeId);

      if (!(await pathExists(absoluteFolderPath))) {
        return {
          projectNodeId,
          exists: false,
          fileCount: 0,
          isEmpty: true,
        };
      }

      const files = (await listDirectory(absoluteFolderPath))
        .filter((entry) => entry.kind === 'file')
        .map((entry) => entry.name);

      return {
        projectNodeId,
        exists: true,
        fileCount: files.length,
        isEmpty: files.length === 0,
      };
    },

    async listSummaryFiles(projectNodeId: string): Promise<SummaryFileItem[]> {
      const absoluteFolderPath = await getFolderPath(projectNodeId);

      if (!(await pathExists(absoluteFolderPath))) {
        return [];
      }

      return (await listDirectory(absoluteFolderPath))
        .filter((entry) => entry.kind === 'file')
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right, 'zh-CN'))
        .map((fileName) => ({
          fileName,
        }));
    },
  };
}

export type SummaryService = ReturnType<typeof createSummaryService>;
