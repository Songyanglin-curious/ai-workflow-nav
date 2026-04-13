import { presentSuccess, presentSuccessWithMeta } from '../presenter.js';
import type {
  WorkflowNodeActionItem,
  WorkflowNodeActionSyncResult,
} from '../../domains/workflows/node-actions/service.js';
import type {
  WorkflowDetail,
  WorkflowSummary,
  UpdateWorkflowResult,
} from '../../domains/workflows/service.js';

export interface WorkflowListData {
  items: WorkflowSummary[];
}

export interface WorkflowDetailData {
  workflow: WorkflowDetail;
}

export interface WorkflowDeleteData {
  result: {
    deleted: true;
  };
}

export interface WorkflowNodeActionListData {
  items: WorkflowNodeActionItem[];
}

export interface WorkflowNodeActionData {
  nodeAction: WorkflowNodeActionItem;
}

export interface WorkflowNodeActionDeleteData {
  result: {
    deleted: true;
  };
}

export interface WorkflowNodeActionSyncData {
  result: WorkflowNodeActionSyncResult;
}

export function presentWorkflowListData(items: WorkflowSummary[]): WorkflowListData {
  return {
    items,
  };
}

export function presentWorkflowDetailData(workflow: WorkflowDetail): WorkflowDetailData {
  return {
    workflow,
  };
}

export function presentWorkflowDeleteData(): WorkflowDeleteData {
  return {
    result: {
      deleted: true,
    },
  };
}

export function presentWorkflowNodeActionListData(items: WorkflowNodeActionItem[]): WorkflowNodeActionListData {
  return {
    items,
  };
}

export function presentWorkflowNodeActionData(nodeAction: WorkflowNodeActionItem): WorkflowNodeActionData {
  return {
    nodeAction,
  };
}

export function presentWorkflowNodeActionDeleteData(): WorkflowNodeActionDeleteData {
  return {
    result: {
      deleted: true,
    },
  };
}

export function presentWorkflowNodeActionSyncData(result: WorkflowNodeActionSyncResult): WorkflowNodeActionSyncData {
  return {
    result,
  };
}

export function presentWorkflowListEnvelope(items: WorkflowSummary[]) {
  return presentSuccess(presentWorkflowListData(items));
}

export function presentWorkflowDetailEnvelope(workflow: WorkflowDetail) {
  return presentSuccess(presentWorkflowDetailData(workflow));
}

export function presentWorkflowDeleteEnvelope() {
  return presentSuccess(presentWorkflowDeleteData());
}

export function presentWorkflowNodeActionListEnvelope(items: WorkflowNodeActionItem[]) {
  return presentSuccess(presentWorkflowNodeActionListData(items));
}

export function presentWorkflowNodeActionEnvelope(nodeAction: WorkflowNodeActionItem) {
  return presentSuccess(presentWorkflowNodeActionData(nodeAction));
}

export function presentWorkflowNodeActionDeleteEnvelope() {
  return presentSuccess(presentWorkflowNodeActionDeleteData());
}

export function presentWorkflowNodeActionSyncEnvelope(result: WorkflowNodeActionSyncResult) {
  return presentSuccess(presentWorkflowNodeActionSyncData(result));
}

export function presentWorkflowUpdateEnvelope(result: UpdateWorkflowResult) {
  if (result.bindingSync) {
    return presentSuccessWithMeta(presentWorkflowDetailData(result.workflow), {
      bindingSync: result.bindingSync,
    });
  }

  return presentSuccess(presentWorkflowDetailData(result.workflow));
}
