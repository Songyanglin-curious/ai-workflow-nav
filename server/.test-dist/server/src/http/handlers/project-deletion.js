import { presentResult } from '../presenter.js';
import { projectDeletionExecuteRequestSchema, projectDeletionParamsSchema, } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
export function createProjectDeletionCheckHandler(projectDeletionService) {
    return async function projectDeletionCheckHandler(request, reply) {
        const params = parseRequestValue(reply, projectDeletionParamsSchema, request.params);
        if (!params) {
            return;
        }
        try {
            const result = await projectDeletionService.checkProjectDeletion(params.projectId);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
export function createProjectDeletionExecuteHandler(projectDeletionService) {
    return async function projectDeletionExecuteHandler(request, reply) {
        const params = parseRequestValue(reply, projectDeletionParamsSchema, request.params);
        if (!params) {
            return;
        }
        const body = parseRequestValue(reply, projectDeletionExecuteRequestSchema, request.body);
        if (!body) {
            return;
        }
        try {
            const result = await projectDeletionService.executeProjectDeletion(params.projectId, body);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=project-deletion.js.map