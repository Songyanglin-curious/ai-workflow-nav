import { randomBytes } from 'node:crypto';
import { ensureDirectory, removePath } from '../../../infra/filesystem/index.js';
import { runInTransaction } from '../../../infra/db/index.js';
import { resolveProjectPath } from '../../../infra/workspace/index.js';
import { WorkflowNotFoundError } from '../../workflows/errors.js';
import { createWorkflowRepo } from '../../workflows/repo.js';
import { ProjectNotFoundError, ProjectValidationFailedError } from '../errors.js';
import { createProjectRepo } from '../repo.js';
import { createDeliberationsRecord, createDeliberationsRepo } from '../deliberations/repo.js';
import { createSummaryRecord, createSummaryRepo } from '../summaries/repo.js';
import { ParentProjectNodeNotFoundError, ProjectNodeCycleDetectedError, ProjectNodeNotFoundError, ProjectNodeValidationFailedError, } from './errors.js';
import { createProjectNodeRepo, } from './repo.js';
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
const projectNodeStatusValues = new Set(['default', 'todo', 'fix']);
const defaultSortOrderStep = 1000;
function createUuidV7() {
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
function createShortId(id) {
    return id.replaceAll('-', '').slice(0, 8);
}
function createTimestamp() {
    return new Date().toISOString();
}
function assertNodeName(name) {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        throw new ProjectNodeValidationFailedError('ProjectNode 名称不能为空。');
    }
    if (forbiddenFileNameCharacters.test(trimmedName)) {
        throw new ProjectNodeValidationFailedError(`ProjectNode 名称包含非法文件名字符：${trimmedName}`);
    }
    if (trimmedName.endsWith(' ') || trimmedName.endsWith('.')) {
        throw new ProjectNodeValidationFailedError(`ProjectNode 名称不能以空格或点号结尾：${trimmedName}`);
    }
    if (reservedFileNames.has(trimmedName.toUpperCase())) {
        throw new ProjectNodeValidationFailedError(`ProjectNode 名称不能使用系统保留名：${trimmedName}`);
    }
    return trimmedName;
}
function assertProjectNodeStatus(status) {
    if (!projectNodeStatusValues.has(status)) {
        throw new ProjectNodeValidationFailedError(`ProjectNode 状态非法：${status}`);
    }
    return status;
}
function assertSortOrder(value) {
    if (!Number.isInteger(value)) {
        throw new ProjectNodeValidationFailedError(`sortOrder 必须是整数：${value}`);
    }
    return value;
}
function buildProjectNodeFolderPath(projectFolderPath, nodeName, nodeId) {
    return `${projectFolderPath}/${nodeName}__${createShortId(nodeId)}`;
}
function toProjectNodeSummary(record) {
    return {
        id: record.id,
        projectId: record.projectId,
        name: record.name,
        description: record.description,
        status: record.status,
        parentNodeId: record.parentNodeId,
        sortOrder: record.sortOrder,
        workflowId: record.workflowId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
function resolveNextSortOrder(repo, projectId, parentNodeId, inputSortOrder) {
    if (inputSortOrder !== undefined) {
        return assertSortOrder(inputSortOrder);
    }
    const maxSortOrder = repo.getMaxSortOrderByParent(projectId, parentNodeId);
    return maxSortOrder === undefined ? 0 : maxSortOrder + defaultSortOrderStep;
}
function assertNoCycle(nodeId, parentNodeId, relations) {
    if (!parentNodeId) {
        return;
    }
    if (nodeId === parentNodeId) {
        throw new ProjectNodeCycleDetectedError(nodeId, parentNodeId);
    }
    const relationMap = new Map(relations.map((relation) => [relation.childProjectNodeId, relation]));
    const visited = new Set();
    let currentNodeId = parentNodeId;
    while (currentNodeId) {
        if (currentNodeId === nodeId) {
            throw new ProjectNodeCycleDetectedError(nodeId, parentNodeId);
        }
        if (visited.has(currentNodeId)) {
            throw new ProjectNodeCycleDetectedError(nodeId, parentNodeId);
        }
        visited.add(currentNodeId);
        currentNodeId = relationMap.get(currentNodeId)?.parentProjectNodeId ?? null;
    }
}
export function createProjectNodeService(database, workspacePaths) {
    const projectRepo = createProjectRepo(database);
    const workflowRepo = createWorkflowRepo(database);
    const repo = createProjectNodeRepo(database);
    const deliberationsRepo = createDeliberationsRepo(database);
    const summaryRepo = createSummaryRepo(database);
    return {
        listProjectNodes(projectId, query = {}) {
            if (!projectRepo.getProjectById(projectId)) {
                throw new ProjectNotFoundError(projectId);
            }
            return repo.listProjectNodes(projectId, query).map(toProjectNodeSummary);
        },
        getProjectNodeById(id) {
            const record = repo.getProjectNodeById(id);
            if (!record) {
                throw new ProjectNodeNotFoundError(id);
            }
            return toProjectNodeSummary(record);
        },
        async createProjectNode(projectId, input) {
            const projectRecord = projectRepo.getProjectById(projectId);
            if (!projectRecord) {
                throw new ProjectNotFoundError(projectId);
            }
            const parentNodeId = input.parentNodeId ?? null;
            const workflowId = input.workflowId ?? null;
            if (parentNodeId !== null) {
                const parentRecord = repo.getProjectNodeById(parentNodeId);
                if (!parentRecord || parentRecord.projectId !== projectId) {
                    throw new ParentProjectNodeNotFoundError(parentNodeId);
                }
            }
            if (workflowId !== null && !workflowRepo.getWorkflowById(workflowId)) {
                throw new WorkflowNotFoundError(workflowId);
            }
            const nodeId = createUuidV7();
            const now = createTimestamp();
            const nodeName = assertNodeName(input.name);
            const nodeFolderPath = buildProjectNodeFolderPath(projectRecord.folderPath, nodeName, nodeId);
            const absoluteNodePath = resolveProjectPath(workspacePaths, nodeFolderPath);
            const absoluteDeliberationsPath = resolveProjectPath(workspacePaths, `${nodeFolderPath}/deliberations`);
            const absoluteSummariesPath = resolveProjectPath(workspacePaths, `${nodeFolderPath}/summaries`);
            const sortOrder = resolveNextSortOrder(repo, projectId, parentNodeId, input.sortOrder);
            const nodeRecord = {
                id: nodeId,
                projectId,
                name: nodeName,
                description: input.description ?? '',
                status: assertProjectNodeStatus(input.status ?? 'default'),
                folderPath: nodeFolderPath,
                createdAt: now,
                updatedAt: now,
            };
            const relationRecord = {
                id: createUuidV7(),
                projectId,
                parentProjectNodeId: parentNodeId,
                childProjectNodeId: nodeId,
                sortOrder,
                createdAt: now,
            };
            const workflowRecord = workflowId === null
                ? undefined
                : {
                    id: createUuidV7(),
                    projectNodeId: nodeId,
                    workflowId,
                    createdAt: now,
                    updatedAt: now,
                };
            await ensureDirectory(absoluteNodePath);
            await ensureDirectory(absoluteDeliberationsPath);
            await ensureDirectory(absoluteSummariesPath);
            try {
                runInTransaction(database, () => {
                    repo.createProjectNode(nodeRecord);
                    repo.createProjectNodeRelation(relationRecord);
                    if (workflowRecord) {
                        repo.createProjectNodeWorkflow(workflowRecord);
                    }
                    deliberationsRepo.createDeliberationsRecord(createDeliberationsRecord(nodeId, `${nodeFolderPath}/deliberations`, now, createUuidV7()));
                    summaryRepo.createSummaryRecord(createSummaryRecord(nodeId, `${nodeFolderPath}/summaries`, now, createUuidV7()));
                });
            }
            catch (error) {
                await removePath(absoluteNodePath).catch(() => undefined);
                throw error;
            }
            return this.getProjectNodeById(nodeId);
        },
        updateProjectNode(id, patch) {
            const currentRecord = repo.getProjectNodeById(id);
            if (!currentRecord) {
                throw new ProjectNodeNotFoundError(id);
            }
            const parentNodeId = patch.parentNodeId !== undefined ? patch.parentNodeId : currentRecord.parentNodeId;
            const nextWorkflowId = patch.workflowId !== undefined ? patch.workflowId : currentRecord.workflowId;
            if (parentNodeId !== null) {
                const parentRecord = repo.getProjectNodeById(parentNodeId);
                if (!parentRecord || parentRecord.projectId !== currentRecord.projectId) {
                    throw new ParentProjectNodeNotFoundError(parentNodeId);
                }
            }
            if (nextWorkflowId !== null && nextWorkflowId !== undefined && !workflowRepo.getWorkflowById(nextWorkflowId)) {
                throw new WorkflowNotFoundError(nextWorkflowId);
            }
            assertNoCycle(id, parentNodeId, repo.listProjectNodeRelationsByProjectId(currentRecord.projectId));
            const nextEntityRecord = {
                id: currentRecord.id,
                projectId: currentRecord.projectId,
                name: patch.name !== undefined ? assertNodeName(patch.name) : currentRecord.name,
                description: patch.description ?? currentRecord.description,
                status: patch.status !== undefined ? assertProjectNodeStatus(patch.status) : currentRecord.status,
                folderPath: currentRecord.folderPath,
                createdAt: currentRecord.createdAt,
                updatedAt: createTimestamp(),
            };
            const nextSortOrder = patch.parentNodeId !== undefined && patch.sortOrder === undefined
                ? resolveNextSortOrder(repo, currentRecord.projectId, parentNodeId, undefined)
                : patch.sortOrder !== undefined
                    ? assertSortOrder(patch.sortOrder)
                    : currentRecord.sortOrder;
            const currentRelation = repo.getProjectNodeRelationByChildId(currentRecord.projectId, currentRecord.id);
            if (!currentRelation) {
                throw new ProjectValidationFailedError(`ProjectNode 缺少结构关系记录：${currentRecord.id}`);
            }
            runInTransaction(database, () => {
                repo.updateProjectNode(nextEntityRecord);
                if (parentNodeId !== currentRecord.parentNodeId || nextSortOrder !== currentRecord.sortOrder) {
                    repo.updateProjectNodeRelationByChildId(currentRecord.projectId, currentRecord.id, {
                        parentProjectNodeId: parentNodeId,
                        sortOrder: nextSortOrder,
                    });
                }
                const currentWorkflowBinding = repo.getProjectNodeWorkflowByNodeId(currentRecord.id);
                if (patch.workflowId === undefined) {
                    return;
                }
                if (nextWorkflowId === null) {
                    if (currentWorkflowBinding) {
                        repo.deleteProjectNodeWorkflowByNodeId(currentRecord.id);
                    }
                    return;
                }
                if (currentWorkflowBinding) {
                    repo.updateProjectNodeWorkflowByNodeId(currentRecord.id, nextWorkflowId, nextEntityRecord.updatedAt);
                    return;
                }
                repo.createProjectNodeWorkflow({
                    id: createUuidV7(),
                    projectNodeId: currentRecord.id,
                    workflowId: nextWorkflowId,
                    createdAt: nextEntityRecord.updatedAt,
                    updatedAt: nextEntityRecord.updatedAt,
                });
            });
            return this.getProjectNodeById(id);
        },
    };
}
//# sourceMappingURL=service.js.map