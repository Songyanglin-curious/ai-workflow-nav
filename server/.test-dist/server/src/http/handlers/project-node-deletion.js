import { presentResult } from '../presenter.js';
import { projectNodeDeletionExecuteRequestSchema, projectNodeDeletionParamsSchema, } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
export function createProjectNodeDeletionCheckHandler(projectNodeDeletionService) {
    return async function projectNodeDeletionCheckHandler(request, reply) {
        const params = parseRequestValue(reply, projectNodeDeletionParamsSchema, request.params);
        if (!params) {
            return;
        }
        try {
            const result = await projectNodeDeletionService.checkProjectNodeDeletion(params.projectNodeId);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
export function createProjectNodeDeletionExecuteHandler(projectNodeDeletionService) {
    return async function projectNodeDeletionExecuteHandler(request, reply) {
        const params = parseRequestValue(reply, projectNodeDeletionParamsSchema, request.params);
        if (!params) {
            return;
        }
        const body = parseRequestValue(reply, projectNodeDeletionExecuteRequestSchema, request.body);
        if (!body) {
            return;
        }
        try {
            const result = await projectNodeDeletionService.executeProjectNodeDeletion(params.projectNodeId, body);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=project-node-deletion.js.map