import path from 'node:path';
import { ensureDirectory, listDirectory, movePath, pathExists, removePath } from '../../infra/filesystem/index.js';
import { runInTransaction } from '../../infra/db/index.js';
import { resolveProjectPath, resolveSummaryArchivePath, } from '../../infra/workspace/index.js';
import { ProjectNodeNotFoundError } from '../../domains/projects/project-nodes/errors.js';
import { ProjectNodeDeletionBlockedError, ProjectNodeDeletionConfirmationRequiredError, ProjectNodeDeletionExecutionFailedError, ProjectNodeSummaryArchiveFailedError, } from './errors.js';
import { createProjectNodeDeletionRepo } from './repo.js';
const rootSortOrderStep = 1000;
async function countSummaryFiles(summaryDirectoryPath) {
    const entries = await listDirectory(summaryDirectoryPath);
    return entries.filter((entry) => entry.kind === 'file').length;
}
function createCheckResult(snapshot, summaryFileCount) {
    const requiresSecondConfirmation = summaryFileCount > 0;
    return {
        projectNodeId: snapshot.projectNodeId,
        requiresSecondConfirmation,
        directChildCount: snapshot.directChildren.length,
        summaryFileCount,
        allowedStrategies: requiresSecondConfirmation ? ['archive_then_delete', 'direct_delete'] : ['direct_delete'],
    };
}
async function archiveSummaries(workspacePaths, snapshot) {
    const sourcePath = resolveProjectPath(workspacePaths, snapshot.summaryFolderPath);
    const archivePath = resolveSummaryArchivePath(workspacePaths, snapshot.nodeFolderPath);
    if (await pathExists(archivePath)) {
        throw new ProjectNodeSummaryArchiveFailedError(`总结归档目录已存在：${snapshot.nodeFolderPath}`);
    }
    try {
        await ensureDirectory(path.dirname(archivePath));
        await movePath(sourcePath, archivePath);
    }
    catch (error) {
        throw new ProjectNodeSummaryArchiveFailedError(`节点总结归档失败：${snapshot.projectNodeId}`, error);
    }
    return {
        sourcePath,
        archivePath,
    };
}
async function restoreArchivedSummaries(archiveRecord) {
    if (!archiveRecord) {
        return;
    }
    if (!(await pathExists(archiveRecord.archivePath))) {
        return;
    }
    await movePath(archiveRecord.archivePath, archiveRecord.sourcePath).catch(() => undefined);
}
export function createProjectNodeDeletionService(database, workspacePaths) {
    const repo = createProjectNodeDeletionRepo(database);
    return {
        async checkProjectNodeDeletion(projectNodeId) {
            const snapshot = repo.getProjectNodeDeletionSnapshot(projectNodeId);
            if (!snapshot) {
                throw new ProjectNodeNotFoundError(projectNodeId);
            }
            const summaryFileCount = await countSummaryFiles(resolveProjectPath(workspacePaths, snapshot.summaryFolderPath));
            return createCheckResult(snapshot, summaryFileCount);
        },
        async executeProjectNodeDeletion(projectNodeId, input) {
            if (!input.confirmDelete) {
                throw new ProjectNodeDeletionConfirmationRequiredError('删除节点前必须先明确确认删除。');
            }
            const snapshot = repo.getProjectNodeDeletionSnapshot(projectNodeId);
            if (!snapshot) {
                throw new ProjectNodeNotFoundError(projectNodeId);
            }
            const checkResult = await this.checkProjectNodeDeletion(projectNodeId);
            if (checkResult.requiresSecondConfirmation && !input.secondConfirmation) {
                throw new ProjectNodeDeletionConfirmationRequiredError('当前节点 summaries 非空，必须完成二次确认。');
            }
            if (!checkResult.allowedStrategies.includes(input.strategy)) {
                throw new ProjectNodeDeletionBlockedError(`当前删除策略不允许：${input.strategy}`);
            }
            const nodeDirectoryPath = resolveProjectPath(workspacePaths, snapshot.nodeFolderPath);
            const archiveRecord = input.strategy === 'archive_then_delete'
                ? await archiveSummaries(workspacePaths, snapshot)
                : undefined;
            const targetRootSortStart = snapshot.rootTailSortOrder === undefined ? 0 : snapshot.rootTailSortOrder + rootSortOrderStep;
            try {
                const promotedToRootCount = runInTransaction(database, () => {
                    const promotedCount = repo.promoteDirectChildrenToRoot(snapshot.projectNodeId, targetRootSortStart, rootSortOrderStep);
                    repo.deleteProjectNodeWorkflowByNodeId(snapshot.projectNodeId);
                    repo.deleteProjectNodeRelationByNodeId(snapshot.projectNodeId);
                    repo.deleteDeliberationsRecordByNodeId(snapshot.projectNodeId);
                    repo.deleteSummaryRecordByNodeId(snapshot.projectNodeId);
                    repo.deleteProjectNodeById(snapshot.projectNodeId);
                    return promotedCount;
                });
                await removePath(nodeDirectoryPath);
                return {
                    projectNodeId: snapshot.projectNodeId,
                    deleted: true,
                    usedStrategy: input.strategy,
                    archived: archiveRecord !== undefined,
                    promotedToRootCount,
                };
            }
            catch (error) {
                await restoreArchivedSummaries(archiveRecord);
                throw new ProjectNodeDeletionExecutionFailedError(`节点删除执行失败：${projectNodeId}`, error);
            }
        },
    };
}
//# sourceMappingURL=service.js.map