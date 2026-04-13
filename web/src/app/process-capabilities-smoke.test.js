// @vitest-environment node

import { access, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { bootstrapApplication, shutdownApplication } from '../../../server/src/app/bootstrap.js';
import { createTestWorkspace } from '../../../server/src/test/test-workspace.js';
import { createProject, listProjects } from '../modules/projects/api.js';
import { useProjectDeletion } from '../modules/projects/deletion/composables.js';
import { createProjectNode, listProjectNodes } from '../modules/projects/project-nodes/api.js';
import { useProjectNodeDeletion } from '../modules/projects/project-nodes/deletion/composables.js';
import { createPrompt } from '../modules/prompts/api.js';
import { httpClient } from '../shared/api/http-client.js';
import { useInspections } from '../modules/system/inspections/composables.js';
import { getStartupReport, runSelfCheck } from '../modules/system/startup/api.js';
import { useSystemSync } from '../modules/system/sync/composables.js';

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findDirectoryByPrefix(parentPath, namePrefix) {
  const entries = await readdir(parentPath, { withFileTypes: true });
  const targetEntry = entries.find((entry) => entry.isDirectory() && entry.name.startsWith(`${namePrefix}__`));

  if (!targetEntry) {
    throw new Error(`未找到目录：${parentPath} / ${namePrefix}`);
  }

  return path.join(parentPath, targetEntry.name);
}

async function findSingleFile(parentPath) {
  const entries = await readdir(parentPath, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());

  if (files.length !== 1) {
    throw new Error(`目录中的文件数量不符合预期：${parentPath}`);
  }

  return path.join(parentPath, files[0].name);
}

async function writeSummaryFile(workspace, projectName, nodeName, fileName) {
  const projectDirectoryPath = await findDirectoryByPrefix(workspace.workspacePaths.projectsDirectoryPath, projectName);
  const nodeDirectoryPath = await findDirectoryByPrefix(projectDirectoryPath, nodeName);
  const summaryFilePath = path.join(nodeDirectoryPath, 'summaries', fileName);

  await writeFile(summaryFilePath, `# ${nodeName}\n`, 'utf8');

  return summaryFilePath;
}

async function listFileNames(parentPath) {
  const entries = await readdir(parentPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

describe('process capabilities smoke', () => {
  let workspace;
  let bootstrapResult;
  let originalBaseUrl;

  beforeAll(async () => {
    workspace = await createTestWorkspace();
    bootstrapResult = await bootstrapApplication({
      workspaceRootPath: workspace.rootPath,
      port: 0,
    });

    originalBaseUrl = httpClient.baseUrl;
    httpClient.baseUrl = bootstrapResult.address;
  });

  afterAll(async () => {
    httpClient.baseUrl = originalBaseUrl;

    if (bootstrapResult) {
      await shutdownApplication(bootstrapResult);
    }

    if (workspace) {
      await workspace.cleanup();
    }
  });

  it('通过页面侧调用链跑通过程型能力主链路', async () => {
    const startupReport = await getStartupReport();
    const selfCheckResult = await runSelfCheck();

    expect(startupReport.startupStatus).toBe('ready');
    expect(startupReport.checks.some((item) => item.checkType === 'SCHEMA_EXECUTED')).toBe(true);
    expect(selfCheckResult.status).toBe('ready');

    const prompt = await createPrompt({
      name: '巡检提示词',
      description: '用于过程能力联调',
      content: '# 巡检\n这是一条用于巡检的提示词。',
    });
    const project = await createProject({
      name: '过程联调项目',
      description: '覆盖启动、自检、同步、巡检与删除保护',
    });
    const parentNode = await createProjectNode(project.id, {
      name: '父节点',
    });
    const childNode = await createProjectNode(project.id, {
      name: '子节点',
      parentNodeId: parentNode.id,
    });

    const sync = useSystemSync();

    await sync.executeExport();

    expect(sync.exportError.value).toBeNull();
    expect(sync.lastRecord.value?.kind).toBe('export');
    if (sync.lastRecord.value?.kind !== 'export') {
      throw new Error('最近一次同步记录不是导出结果。');
    }
    expect(sync.lastRecord.value.result).toMatchObject({
      exported: true,
      manifestFile: 'dbSyncs/manifest.json',
      exportedFileCount: 13,
    });

    const promptFilePath = await findSingleFile(workspace.workspacePaths.promptsDirectoryPath);
    await rm(promptFilePath);

    const inspections = useInspections();

    await inspections.execute();

    expect(inspections.error.value).toBeNull();
    expect(inspections.hasResult.value).toBe(true);
    expect(
      inspections.items.value.some(
        (item) => item.issueType === 'INDEXED_FILE_MISSING' && item.entityType === 'prompt' && item.entityId === prompt.id,
      ),
    ).toBe(true);

    await sync.executeImport();

    expect(sync.importError.value).toBeNull();
    expect(sync.lastRecord.value?.kind).toBe('import');
    if (sync.lastRecord.value?.kind !== 'import') {
      throw new Error('最近一次同步记录不是导入结果。');
    }
    expect(sync.lastRecord.value.result).toEqual({
      imported: true,
      mode: 'rebuild',
    });

    const projectsAfterImport = await listProjects();
    const nodesAfterImport = await listProjectNodes(project.id);

    expect(projectsAfterImport.some((item) => item.id === project.id)).toBe(true);
    expect(nodesAfterImport.map((item) => item.id)).toEqual([parentNode.id, childNode.id]);

    await writeSummaryFile(workspace, '过程联调项目', '父节点', 'parent-summary.md');

    const nodeDeletion = useProjectNodeDeletion();

    await nodeDeletion.openDialog(parentNode.id);

    expect(nodeDeletion.checkResult.value).toMatchObject({
      projectNodeId: parentNode.id,
      requiresSecondConfirmation: true,
      directChildCount: 1,
      summaryFileCount: 1,
      allowedStrategies: ['archive_then_delete', 'direct_delete'],
    });

    nodeDeletion.draft.value.confirmDelete = true;
    nodeDeletion.draft.value.secondConfirmation = true;

    const nodeDeletionResult = await nodeDeletion.executeDeletion();
    const nodesAfterNodeDeletion = await listProjectNodes(project.id);
    const archivedProjectDirectoryPath = await findDirectoryByPrefix(
      workspace.workspacePaths.summaryArchivesDirectoryPath,
      '过程联调项目',
    );
    const archivedParentNodeDirectoryPath = await findDirectoryByPrefix(archivedProjectDirectoryPath, '父节点');

    expect(nodeDeletionResult).toEqual({
      projectNodeId: parentNode.id,
      deleted: true,
      usedStrategy: 'archive_then_delete',
      archived: true,
      promotedToRootCount: 1,
    });
    expect(nodesAfterNodeDeletion).toHaveLength(1);
    expect(nodesAfterNodeDeletion[0]).toMatchObject({
      id: childNode.id,
      parentNodeId: null,
    });
    expect(await listFileNames(archivedParentNodeDirectoryPath)).toContain('parent-summary.md');

    await writeSummaryFile(workspace, '过程联调项目', '子节点', 'child-summary.md');

    const projectDeletion = useProjectDeletion();

    await projectDeletion.openDialog(project.id);

    expect(projectDeletion.checkResult.value).toMatchObject({
      projectId: project.id,
      projectNodeCount: 1,
      summaryNodeCount: 1,
      requiresSecondConfirmation: true,
      allowedStrategies: ['archive_then_delete', 'direct_delete'],
    });

    projectDeletion.draft.value.confirmDelete = true;
    projectDeletion.draft.value.secondConfirmation = true;

    const projectDeletionResult = await projectDeletion.executeDeletion();
    const projectsAfterDeletion = await listProjects();
    const archivedChildNodeDirectoryPath = await findDirectoryByPrefix(archivedProjectDirectoryPath, '子节点');
    const projectDirectoryStillExists = await pathExists(
      path.join(workspace.workspacePaths.projectsDirectoryPath, path.basename(archivedProjectDirectoryPath)),
    );

    expect(projectDeletionResult).toEqual({
      projectId: project.id,
      deleted: true,
      usedStrategy: 'archive_then_delete',
      archivedSummaryNodeCount: 1,
    });
    expect(projectsAfterDeletion.some((item) => item.id === project.id)).toBe(false);
    expect(await listFileNames(archivedChildNodeDirectoryPath)).toContain('child-summary.md');
    expect(projectDirectoryStillExists).toBe(false);
  });
});
