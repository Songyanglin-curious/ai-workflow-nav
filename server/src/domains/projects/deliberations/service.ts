import {
  appendTextFile,
  ensureDirectory,
  listDirectory,
  pathExists,
  writeTextFile,
} from '../../../infra/filesystem/index.js';
import type { SqliteDatabase } from '../../../infra/db/index.js';
import { resolveProjectPath, type WorkspacePaths } from '../../../infra/workspace/index.js';
import { ProjectNodeNotFoundError } from '../project-nodes/errors.js';
import { createProjectNodeRepo } from '../project-nodes/repo.js';
import {
  DeliberationsConflictError,
  DeliberationsRecordNotFoundError,
  DeliberationsValidationFailedError,
} from './errors.js';
import { createDeliberationsRepo } from './repo.js';

export interface DeliberationsRecordFolderInfo {
  projectNodeId: string;
  exists: boolean;
  fileCount: number;
  latestWritableFileName: string | null;
}

export interface DeliberationsRecordFileItem {
  fileName: string;
  isNameCompliant: boolean;
  isLatestWritable: boolean;
}

export interface AppendLatestDeliberationsInput {
  content: string;
}

export interface AppendLatestDeliberationsResult {
  fileName: string;
  createdNewFile: boolean;
}

export interface CreateDeliberationsFileInput {
  title?: string;
}

export interface CreateDeliberationsFileResult {
  fileName: string;
}

const compliantFileNamePattern = /^(?<date>\d{8})-(?<time>\d{6})__(?<title>.+)\.md$/;
const forbiddenFileNameCharacters = /[<>:"/\\|?*]/;

function extractCompliantTimestamp(fileName: string): string | null {
  const match = fileName.match(compliantFileNamePattern);
  return match ? `${match.groups?.date}-${match.groups?.time}` : null;
}

function assertDeliberationsTitle(title: string): string {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    throw new DeliberationsValidationFailedError('Deliberations 文件标题不能为空。');
  }

  if (forbiddenFileNameCharacters.test(trimmedTitle)) {
    throw new DeliberationsValidationFailedError(`Deliberations 文件标题包含非法字符：${trimmedTitle}`);
  }

  if (trimmedTitle.endsWith(' ') || trimmedTitle.endsWith('.')) {
    throw new DeliberationsValidationFailedError(`Deliberations 文件标题不能以空格或点号结尾：${trimmedTitle}`);
  }

  return trimmedTitle;
}

function createTimestampPrefix(): string {
  const now = new Date();
  const pad = (value: number): string => value.toString().padStart(2, '0');

  return [
    now.getUTCFullYear().toString(),
    pad(now.getUTCMonth() + 1),
    pad(now.getUTCDate()),
  ].join('') + `-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
}

function buildDeliberationsFileName(title: string): string {
  return `${createTimestampPrefix()}__${title}.md`;
}

function compareDeliberationsFiles(left: string, right: string): number {
  const leftTimestamp = extractCompliantTimestamp(left);
  const rightTimestamp = extractCompliantTimestamp(right);

  if (leftTimestamp && rightTimestamp) {
    return rightTimestamp.localeCompare(leftTimestamp, 'en');
  }

  if (leftTimestamp) {
    return -1;
  }

  if (rightTimestamp) {
    return 1;
  }

  return left.localeCompare(right, 'zh-CN');
}

export function createDeliberationsService(database: SqliteDatabase, workspacePaths: WorkspacePaths) {
  const projectNodeRepo = createProjectNodeRepo(database);
  const repo = createDeliberationsRepo(database);

  async function getFolderContext(projectNodeId: string): Promise<{
    folderPath: string;
    absoluteFolderPath: string;
    projectNodeName: string;
  }> {
    const projectNode = projectNodeRepo.getProjectNodeEntityById(projectNodeId);

    if (!projectNode) {
      throw new ProjectNodeNotFoundError(projectNodeId);
    }

    const record = repo.getDeliberationsRecordByProjectNodeId(projectNodeId);

    if (!record) {
      throw new DeliberationsRecordNotFoundError(projectNodeId);
    }

    return {
      folderPath: record.folderPath,
      absoluteFolderPath: resolveProjectPath(workspacePaths, record.folderPath),
      projectNodeName: projectNode.name,
    };
  }

  async function listFiles(projectNodeId: string): Promise<DeliberationsRecordFileItem[]> {
    const { absoluteFolderPath } = await getFolderContext(projectNodeId);

    if (!(await pathExists(absoluteFolderPath))) {
      return [];
    }

    const fileNames = (await listDirectory(absoluteFolderPath))
      .filter((entry) => entry.kind === 'file')
      .map((entry) => entry.name)
      .sort(compareDeliberationsFiles);
    const latestWritableFileName =
      fileNames.find((fileName) => extractCompliantTimestamp(fileName) !== null) ?? null;

    return fileNames.map((fileName) => ({
      fileName,
      isNameCompliant: extractCompliantTimestamp(fileName) !== null,
      isLatestWritable: latestWritableFileName === fileName,
    }));
  }

  return {
    async getDeliberationsRecordFolderInfo(projectNodeId: string): Promise<DeliberationsRecordFolderInfo> {
      const { absoluteFolderPath } = await getFolderContext(projectNodeId);
      const files = await listFiles(projectNodeId);

      return {
        projectNodeId,
        exists: await pathExists(absoluteFolderPath),
        fileCount: files.length,
        latestWritableFileName: files.find((file) => file.isLatestWritable)?.fileName ?? null,
      };
    },

    async listDeliberationsRecordFiles(projectNodeId: string): Promise<DeliberationsRecordFileItem[]> {
      return listFiles(projectNodeId);
    },

    async appendLatestDeliberations(
      projectNodeId: string,
      input: AppendLatestDeliberationsInput,
    ): Promise<AppendLatestDeliberationsResult> {
      const context = await getFolderContext(projectNodeId);

      await ensureDirectory(context.absoluteFolderPath);

      const files = await listFiles(projectNodeId);
      let fileName = files.find((file) => file.isLatestWritable)?.fileName;
      let createdNewFile = false;

      if (!fileName) {
        fileName = buildDeliberationsFileName(assertDeliberationsTitle(context.projectNodeName));
        await writeTextFile(resolveProjectPath(workspacePaths, `${context.folderPath}/${fileName}`), '');
        createdNewFile = true;
      }

      await appendTextFile(
        resolveProjectPath(workspacePaths, `${context.folderPath}/${fileName}`),
        input.content,
      );

      return {
        fileName,
        createdNewFile,
      };
    },

    async createDeliberationsFile(
      projectNodeId: string,
      input: CreateDeliberationsFileInput = {},
    ): Promise<CreateDeliberationsFileResult> {
      const context = await getFolderContext(projectNodeId);

      await ensureDirectory(context.absoluteFolderPath);

      const fileName = buildDeliberationsFileName(assertDeliberationsTitle(input.title ?? '未命名'));
      const absoluteFilePath = resolveProjectPath(workspacePaths, `${context.folderPath}/${fileName}`);

      if (await pathExists(absoluteFilePath)) {
        throw new DeliberationsConflictError(fileName);
      }

      await writeTextFile(absoluteFilePath, '');

      return {
        fileName,
      };
    },
  };
}

export type DeliberationsService = ReturnType<typeof createDeliberationsService>;
