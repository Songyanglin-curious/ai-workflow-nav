import { randomBytes } from 'node:crypto';

import { runInTransaction, type SqliteDatabase } from '../../../infra/db/index.js';
import type { ToolRegistry } from '../../../infra/tools/index.js';
import { PromptNotFoundError } from '../../prompts/errors.js';
import { createPromptRepo } from '../../prompts/repo.js';
import { WorkflowNotFoundError } from '../errors.js';
import { createWorkflowRepo, type WorkflowRecord } from '../repo.js';
import {
  MermaidNodeNotFoundError,
  ToolTargetNotFoundError,
  WorkflowNodeActionConflictError,
  WorkflowNodeActionNotFoundError,
  WorkflowNodeActionValidationFailedError,
} from './errors.js';
import { createWorkflowNodeActionRepo, type WorkflowNodeActionRecord } from './repo.js';

export interface WorkflowNodeActionItem {
  workflowId: string;
  mermaidNodeId: string;
  actionType: 'prompt' | 'tool';
  targetRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowNodeActionInput {
  mermaidNodeId: string;
  actionType: 'prompt' | 'tool';
  targetRef: string;
}

export interface UpdateWorkflowNodeActionInput {
  actionType?: 'prompt' | 'tool';
  targetRef?: string;
}

export interface WorkflowNodeActionSyncResult {
  removedCount: number;
  remainingCount: number;
}

export interface CreateWorkflowNodeActionServiceOptions {
  toolRegistry?: Pick<ToolRegistry, 'toolExists'>;
}

const emptyToolRegistry = {
  toolExists(): boolean {
    return false;
  },
};

const ignoredMermaidLinePatterns = [
  /^(flowchart|graph)\b/i,
  /^subgraph\b/i,
  /^end\b/i,
  /^(class|classDef|click|style|linkStyle)\b/i,
];

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

function createTimestamp(): string {
  return new Date().toISOString();
}

function assertMermaidNodeId(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    throw new WorkflowNodeActionValidationFailedError('Mermaid 节点标识不能为空。');
  }

  return trimmedValue;
}

function assertTargetRef(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    throw new WorkflowNodeActionValidationFailedError('动作目标引用不能为空。');
  }

  return trimmedValue;
}

function toNodeActionItem(record: WorkflowNodeActionRecord): WorkflowNodeActionItem {
  return {
    workflowId: record.workflowId,
    mermaidNodeId: record.mermaidNodeId,
    actionType: record.actionType,
    targetRef: record.targetRef,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function getWorkflowNodeIds(record: WorkflowRecord): Set<string> {
  const nodeIds = new Set<string>();
  const lines = record.mermaidSource
    .replaceAll(/\r\n/g, '\n')
    .replaceAll(/^%%.*$/gm, '')
    .split('\n');

  for (const line of lines) {
    const normalizedLine = line
      .replaceAll(/:::[A-Za-z0-9_-]+/g, '')
      .replaceAll(/\|[^|]*\|/g, ' ')
      .trim();

    if (normalizedLine.length === 0) {
      continue;
    }

    if (ignoredMermaidLinePatterns.some((pattern) => pattern.test(normalizedLine))) {
      continue;
    }

    for (const match of normalizedLine.matchAll(
      /\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:@?\{|\[\[|\(\(|\[|\(|\{))/g,
    )) {
      nodeIds.add(match[1]);
    }

    for (const match of normalizedLine.matchAll(
      /\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:-->|---|==>|==|-.->|-\.-|~~~|--o|o--|--x|x--))/g,
    )) {
      nodeIds.add(match[1]);
    }

    for (const match of normalizedLine.matchAll(
      /(?:-->|---|==>|==|-.->|-\.-|~~~|--o|o--|--x|x--)\s*([A-Za-z0-9_][A-Za-z0-9_-]*)\b/g,
    )) {
      nodeIds.add(match[1]);
    }
  }

  return nodeIds;
}

function assertWorkflowExists(workflowRecord: WorkflowRecord | undefined, workflowId: string): WorkflowRecord {
  if (!workflowRecord) {
    throw new WorkflowNotFoundError(workflowId);
  }

  return workflowRecord;
}

export function createWorkflowNodeActionService(
  database: SqliteDatabase,
  options: CreateWorkflowNodeActionServiceOptions = {},
) {
  const workflowRepo = createWorkflowRepo(database);
  const promptRepo = createPromptRepo(database);
  const repo = createWorkflowNodeActionRepo(database);
  const toolRegistry = options.toolRegistry ?? emptyToolRegistry;

  function assertMermaidNodeExists(workflowRecord: WorkflowRecord, mermaidNodeId: string): void {
    const workflowNodeIds = getWorkflowNodeIds(workflowRecord);

    if (!workflowNodeIds.has(mermaidNodeId)) {
      throw new MermaidNodeNotFoundError(workflowRecord.id, mermaidNodeId);
    }
  }

  function assertActionTargetExists(actionType: 'prompt' | 'tool', targetRef: string): void {
    if (actionType === 'prompt') {
      if (!promptRepo.getPromptById(targetRef)) {
        throw new PromptNotFoundError(targetRef);
      }

      return;
    }

    if (!toolRegistry.toolExists(targetRef)) {
      throw new ToolTargetNotFoundError(targetRef);
    }
  }

  function syncNodeActionsInCurrentTransaction(workflowId: string): WorkflowNodeActionSyncResult {
    const workflowRecord = assertWorkflowExists(workflowRepo.getWorkflowById(workflowId), workflowId);
    const validNodeIds = getWorkflowNodeIds(workflowRecord);
    const currentNodeActions = repo.listNodeActionsByWorkflowId(workflowId);

    let removedCount = 0;

    for (const nodeAction of currentNodeActions) {
      if (validNodeIds.has(nodeAction.mermaidNodeId)) {
        continue;
      }

      repo.deleteNodeActionByWorkflowIdAndMermaidNodeId(workflowId, nodeAction.mermaidNodeId);
      removedCount += 1;
    }

    return {
      removedCount,
      remainingCount: currentNodeActions.length - removedCount,
    };
  }

  return {
    listNodeActionsByWorkflowId(workflowId: string): WorkflowNodeActionItem[] {
      assertWorkflowExists(workflowRepo.getWorkflowById(workflowId), workflowId);
      return repo.listNodeActionsByWorkflowId(workflowId).map(toNodeActionItem);
    },

    createNodeAction(workflowId: string, input: CreateWorkflowNodeActionInput): WorkflowNodeActionItem {
      const workflowRecord = assertWorkflowExists(workflowRepo.getWorkflowById(workflowId), workflowId);
      const mermaidNodeId = assertMermaidNodeId(input.mermaidNodeId);
      const targetRef = assertTargetRef(input.targetRef);

      assertMermaidNodeExists(workflowRecord, mermaidNodeId);
      assertActionTargetExists(input.actionType, targetRef);

      if (repo.getNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId)) {
        throw new WorkflowNodeActionConflictError(workflowId, mermaidNodeId);
      }

      const now = createTimestamp();
      const record: WorkflowNodeActionRecord = {
        id: createUuidV7(),
        workflowId,
        mermaidNodeId,
        actionType: input.actionType,
        targetRef,
        createdAt: now,
        updatedAt: now,
      };

      runInTransaction(database, () => repo.createNodeAction(record));
      return toNodeActionItem(record);
    },

    updateNodeActionByWorkflowIdAndMermaidNodeId(
      workflowId: string,
      mermaidNodeId: string,
      patch: UpdateWorkflowNodeActionInput,
    ): WorkflowNodeActionItem {
      const workflowRecord = assertWorkflowExists(workflowRepo.getWorkflowById(workflowId), workflowId);
      const normalizedMermaidNodeId = assertMermaidNodeId(mermaidNodeId);
      const currentRecord = repo.getNodeActionByWorkflowIdAndMermaidNodeId(workflowId, normalizedMermaidNodeId);

      if (!currentRecord) {
        throw new WorkflowNodeActionNotFoundError(workflowId, normalizedMermaidNodeId);
      }

      assertMermaidNodeExists(workflowRecord, normalizedMermaidNodeId);

      if (patch.actionType !== undefined && patch.targetRef === undefined && patch.actionType !== currentRecord.actionType) {
        throw new WorkflowNodeActionValidationFailedError('更新 actionType 时必须同时提交配套的 targetRef。');
      }

      const nextActionType = patch.actionType ?? currentRecord.actionType;
      const nextTargetRef =
        patch.targetRef !== undefined ? assertTargetRef(patch.targetRef) : currentRecord.targetRef;

      assertActionTargetExists(nextActionType, nextTargetRef);

      const nextRecord: WorkflowNodeActionRecord = {
        ...currentRecord,
        actionType: nextActionType,
        targetRef: nextTargetRef,
        updatedAt: createTimestamp(),
      };

      runInTransaction(database, () =>
        repo.updateNodeActionByWorkflowIdAndMermaidNodeId(workflowId, normalizedMermaidNodeId, {
          actionType: nextRecord.actionType,
          targetRef: nextRecord.targetRef,
          updatedAt: nextRecord.updatedAt,
        }),
      );

      return toNodeActionItem(nextRecord);
    },

    deleteNodeActionByWorkflowIdAndMermaidNodeId(workflowId: string, mermaidNodeId: string): { deleted: true } {
      assertWorkflowExists(workflowRepo.getWorkflowById(workflowId), workflowId);
      const normalizedMermaidNodeId = assertMermaidNodeId(mermaidNodeId);
      const currentRecord = repo.getNodeActionByWorkflowIdAndMermaidNodeId(workflowId, normalizedMermaidNodeId);

      if (!currentRecord) {
        throw new WorkflowNodeActionNotFoundError(workflowId, normalizedMermaidNodeId);
      }

      runInTransaction(database, () =>
        repo.deleteNodeActionByWorkflowIdAndMermaidNodeId(workflowId, normalizedMermaidNodeId),
      );

      return {
        deleted: true,
      };
    },

    syncNodeActions(workflowId: string): WorkflowNodeActionSyncResult {
      return runInTransaction(database, () => syncNodeActionsInCurrentTransaction(workflowId));
    },
  };
}

export type WorkflowNodeActionService = ReturnType<typeof createWorkflowNodeActionService>;
