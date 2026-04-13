import { presentResult } from '../presenter.js';
import { workflowRuntimeParamsSchema, workflowRuntimeTriggerRequestSchema, } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
export function createWorkflowRuntimeDetailHandler(workflowRuntimeActionsService) {
    return async function workflowRuntimeDetailHandler(request, reply) {
        const params = parseRequestValue(reply, workflowRuntimeParamsSchema, request.params);
        if (!params) {
            return;
        }
        try {
            const result = await workflowRuntimeActionsService.getWorkflowRuntimeNodeDetail(params.projectNodeId, params.mermaidNodeId);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
export function createWorkflowRuntimeTriggerHandler(workflowRuntimeActionsService) {
    return async function workflowRuntimeTriggerHandler(request, reply) {
        const params = parseRequestValue(reply, workflowRuntimeParamsSchema, request.params);
        if (!params) {
            return;
        }
        const body = parseRequestValue(reply, workflowRuntimeTriggerRequestSchema, request.body ?? {});
        if (!body) {
            return;
        }
        try {
            const result = await workflowRuntimeActionsService.triggerWorkflowRuntimeNodeAction(params.projectNodeId, params.mermaidNodeId);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=workflow-runtime-actions.js.map