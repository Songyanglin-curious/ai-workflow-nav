import { presentResult } from '../presenter.js';
import { inspectionsRunBodySchema } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
export function createInspectionsRunHandler(inspectionsProcess) {
    return async function inspectionsRunHandler(request, reply) {
        const body = parseRequestValue(reply, inspectionsRunBodySchema, request.body ?? {});
        if (!body) {
            return;
        }
        try {
            const result = await inspectionsProcess.runInspection();
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=inspections.js.map