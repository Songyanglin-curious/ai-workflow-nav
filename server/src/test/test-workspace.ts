import { access, copyFile, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ensureDirectory } from '../infra/filesystem/index.js';
import { createWorkspacePaths, type WorkspacePaths } from '../infra/workspace/index.js';

export interface TestWorkspace {
  rootPath: string;
  workspacePaths: WorkspacePaths;
  cleanup(): Promise<void>;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveRepoRootPath(): Promise<string> {
  const candidatePaths = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
  ];

  for (const candidatePath of candidatePaths) {
    const schemaDirectoryPath = path.join(candidatePath, 'sql', 'schema', 'v1', 'tables');
    const agentsPath = path.join(candidatePath, 'AGENTS.md');
    const tasksPath = path.join(candidatePath, 'TASKS.md');

    if (
      await pathExists(schemaDirectoryPath) &&
      await pathExists(agentsPath) &&
      await pathExists(tasksPath)
    ) {
      return candidatePath;
    }
  }

  throw new Error('测试工作区初始化失败：未找到仓库根目录。');
}

async function ensureWorkspaceDirectories(workspacePaths: WorkspacePaths): Promise<void> {
  await ensureDirectory(workspacePaths.dbDirectoryPath);
  await ensureDirectory(workspacePaths.syncDirectoryPath);
  await ensureDirectory(workspacePaths.promptsDirectoryPath);
  await ensureDirectory(workspacePaths.projectsDirectoryPath);
  await ensureDirectory(workspacePaths.summaryArchivesDirectoryPath);
}

async function writeLocalConfigFile(workspacePaths: WorkspacePaths): Promise<void> {
  const configText = `${JSON.stringify(
    {
      version: 1,
      workspaceRoot: workspacePaths.rootPath,
      server: {
        port: 3000,
      },
      tools: [],
      routes: [],
      security: {
        allowAbsolutePaths: false,
        allowedRoots: [workspacePaths.rootPath],
      },
    },
    null,
    2,
  )}\n`;

  await writeFile(workspacePaths.localConfigPath, configText, 'utf8');
}

async function copySchemaFiles(rootPath: string): Promise<void> {
  const repoRootPath = await resolveRepoRootPath();
  const sourceDirectoryPath = path.join(repoRootPath, 'sql', 'schema', 'v1', 'tables');
  const targetDirectoryPath = path.join(rootPath, 'sql', 'schema', 'v1', 'tables');

  await ensureDirectory(targetDirectoryPath);

  const fileNames = await readdir(sourceDirectoryPath);

  for (const fileName of fileNames) {
    await copyFile(
      path.join(sourceDirectoryPath, fileName),
      path.join(targetDirectoryPath, fileName),
    );
  }
}

export async function createTestWorkspace(): Promise<TestWorkspace> {
  const rootPath = await mkdtemp(path.join(os.tmpdir(), 'ai-workflow-nav-test-'));
  const workspacePaths = createWorkspacePaths(rootPath);

  await ensureWorkspaceDirectories(workspacePaths);
  await writeLocalConfigFile(workspacePaths);
  await copySchemaFiles(rootPath);

  return {
    rootPath,
    workspacePaths,
    async cleanup(): Promise<void> {
      await rm(rootPath, { recursive: true, force: true });
    },
  };
}
