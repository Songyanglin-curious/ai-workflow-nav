import { randomBytes } from 'node:crypto';
import { runInTransaction } from '../../infra/db/index.js';
import { createWorkflowNodeActionService } from './node-actions/index.js';
import { WorkflowNotFoundError, WorkflowValidationFailedError } from './errors.js';
import { createWorkflowRepo } from './repo.js';
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
function assertWorkflowName(name) {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
        throw new WorkflowValidationFailedError('Workflow 名称不能为空。');
    }
    return trimmedName;
}
function toWorkflowSummary(record) {
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
function toWorkflowDetail(record) {
    return {
        ...toWorkflowSummary(record),
        mermaidSource: record.mermaidSource,
    };
}
export function createWorkflowService(database) {
    const repo = createWorkflowRepo(database);
    const nodeActionService = createWorkflowNodeActionService(database);
    return {
        listWorkflows(query = {}) {
            return repo.listWorkflows(query).map(toWorkflowSummary);
        },
        getWorkflowById(id) {
            const record = repo.getWorkflowById(id);
            if (!record) {
                throw new WorkflowNotFoundError(id);
            }
            return toWorkflowDetail(record);
        },
        createWorkflow(input) {
            const now = createTimestamp();
            const record = {
                id: createUuidV7(),
                name: assertWorkflowName(input.name),
                description: input.description ?? '',
                tags: input.tags ?? '',
                category: input.category ?? '',
                mermaidSource: input.mermaidSource ?? '',
                createdAt: now,
                updatedAt: now,
            };
            runInTransaction(database, () => repo.createWorkflow(record));
            return toWorkflowDetail(record);
        },
        updateWorkflow(id, patch) {
            const currentRecord = repo.getWorkflowById(id);
            if (!currentRecord) {
                throw new WorkflowNotFoundError(id);
            }
            const nextRecord = {
                ...currentRecord,
                name: patch.name !== undefined ? assertWorkflowName(patch.name) : currentRecord.name,
                description: patch.description ?? currentRecord.description,
                tags: patch.tags ?? currentRecord.tags,
                category: patch.category ?? currentRecord.category,
                mermaidSource: patch.mermaidSource ?? currentRecord.mermaidSource,
                updatedAt: createTimestamp(),
            };
            runInTransaction(database, () => repo.updateWorkflow(nextRecord));
            const bindingSync = patch.mermaidSource !== undefined
                ? nodeActionService.syncNodeActions(id)
                : undefined;
            return {
                workflow: toWorkflowDetail(nextRecord),
                bindingSync,
            };
        },
        deleteWorkflowById(id) {
            const record = repo.getWorkflowById(id);
            if (!record) {
                throw new WorkflowNotFoundError(id);
            }
            runInTransaction(database, () => repo.deleteWorkflowById(id));
            return {
                deleted: true,
            };
        },
    };
}
//# sourceMappingURL=service.js.map