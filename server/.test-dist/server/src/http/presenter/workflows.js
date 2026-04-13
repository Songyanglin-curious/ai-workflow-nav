import { presentSuccess, presentSuccessWithMeta } from '../presenter.js';
export function presentWorkflowListData(items) {
    return {
        items,
    };
}
export function presentWorkflowDetailData(workflow) {
    return {
        workflow,
    };
}
export function presentWorkflowDeleteData() {
    return {
        result: {
            deleted: true,
        },
    };
}
export function presentWorkflowNodeActionListData(items) {
    return {
        items,
    };
}
export function presentWorkflowNodeActionData(nodeAction) {
    return {
        nodeAction,
    };
}
export function presentWorkflowNodeActionDeleteData() {
    return {
        result: {
            deleted: true,
        },
    };
}
export function presentWorkflowNodeActionSyncData(result) {
    return {
        result,
    };
}
export function presentWorkflowListEnvelope(items) {
    return presentSuccess(presentWorkflowListData(items));
}
export function presentWorkflowDetailEnvelope(workflow) {
    return presentSuccess(presentWorkflowDetailData(workflow));
}
export function presentWorkflowDeleteEnvelope() {
    return presentSuccess(presentWorkflowDeleteData());
}
export function presentWorkflowNodeActionListEnvelope(items) {
    return presentSuccess(presentWorkflowNodeActionListData(items));
}
export function presentWorkflowNodeActionEnvelope(nodeAction) {
    return presentSuccess(presentWorkflowNodeActionData(nodeAction));
}
export function presentWorkflowNodeActionDeleteEnvelope() {
    return presentSuccess(presentWorkflowNodeActionDeleteData());
}
export function presentWorkflowNodeActionSyncEnvelope(result) {
    return presentSuccess(presentWorkflowNodeActionSyncData(result));
}
export function presentWorkflowUpdateEnvelope(result) {
    if (result.bindingSync) {
        return presentSuccessWithMeta(presentWorkflowDetailData(result.workflow), {
            bindingSync: result.bindingSync,
        });
    }
    return presentSuccess(presentWorkflowDetailData(result.workflow));
}
//# sourceMappingURL=workflows.js.map