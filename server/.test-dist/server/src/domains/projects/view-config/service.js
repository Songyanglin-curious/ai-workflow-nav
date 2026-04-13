import { randomBytes } from 'node:crypto';
import { runInTransaction } from '../../../infra/db/index.js';
import { ProjectNodeNotFoundError, ProjectNotFoundError, ProjectViewConfigValidationFailedError, ProjectViewportNotFoundError, } from './errors.js';
import { createProjectViewConfigRepo } from './repo.js';
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
function createTimestamp() {
    return new Date().toISOString();
}
function assertProjectExists(projectId, exists) {
    if (!exists) {
        throw new ProjectNotFoundError(projectId);
    }
}
function assertViewportPatchInput(input) {
    if (input.zoom <= 0) {
        throw new ProjectViewConfigValidationFailedError('项目视角缩放必须大于 0。');
    }
}
function assertProjectNodeLayoutsPatchInput(items) {
    const seen = new Set();
    for (const item of items) {
        if (seen.has(item.projectNodeId)) {
            throw new ProjectViewConfigValidationFailedError(`项目节点布局请求中存在重复节点：${item.projectNodeId}`);
        }
        seen.add(item.projectNodeId);
    }
}
function toProjectNodeLayoutItem(record) {
    return {
        projectNodeId: record.projectNodeId,
        positionX: record.positionX,
        positionY: record.positionY,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
function toProjectViewport(record) {
    return {
        projectId: record.projectId,
        viewportX: record.viewportX,
        viewportY: record.viewportY,
        zoom: record.zoom,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}
export function createProjectViewConfigService(database) {
    const repo = createProjectViewConfigRepo(database);
    return {
        getProjectNodeLayouts(projectId) {
            assertProjectExists(projectId, repo.getProjectById(projectId) !== undefined);
            return repo.listProjectNodeLayoutsByProjectId(projectId).map(toProjectNodeLayoutItem);
        },
        patchProjectNodeLayouts(projectId, input) {
            assertProjectExists(projectId, repo.getProjectById(projectId) !== undefined);
            assertProjectNodeLayoutsPatchInput(input.items);
            for (const item of input.items) {
                if (!repo.getProjectNodeByIdAndProjectId(projectId, item.projectNodeId)) {
                    throw new ProjectNodeNotFoundError(projectId, item.projectNodeId);
                }
            }
            const now = createTimestamp();
            const currentLayouts = new Map(repo.listProjectNodeLayoutsByProjectId(projectId).map((record) => [record.projectNodeId, record]));
            runInTransaction(database, () => {
                for (const item of input.items) {
                    const currentRecord = currentLayouts.get(item.projectNodeId);
                    const nextRecord = {
                        id: currentRecord?.id ?? createUuidV7(),
                        projectId,
                        projectNodeId: item.projectNodeId,
                        positionX: item.positionX,
                        positionY: item.positionY,
                        createdAt: currentRecord?.createdAt ?? now,
                        updatedAt: now,
                    };
                    repo.upsertProjectNodeLayout(nextRecord);
                }
            });
            return {
                updatedCount: input.items.length,
            };
        },
        getProjectViewport(projectId) {
            assertProjectExists(projectId, repo.getProjectById(projectId) !== undefined);
            const viewport = repo.getProjectViewportByProjectId(projectId);
            if (!viewport) {
                throw new ProjectViewportNotFoundError(projectId);
            }
            return toProjectViewport(viewport);
        },
        patchProjectViewport(projectId, input) {
            assertProjectExists(projectId, repo.getProjectById(projectId) !== undefined);
            assertViewportPatchInput(input);
            const currentViewport = repo.getProjectViewportByProjectId(projectId);
            const now = createTimestamp();
            const nextRecord = {
                id: currentViewport?.id ?? createUuidV7(),
                projectId,
                viewportX: input.viewportX,
                viewportY: input.viewportY,
                zoom: input.zoom,
                createdAt: currentViewport?.createdAt ?? now,
                updatedAt: now,
            };
            runInTransaction(database, () => {
                repo.upsertProjectViewport(nextRecord);
            });
            return toProjectViewport(nextRecord);
        },
    };
}
//# sourceMappingURL=service.js.map