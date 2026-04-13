import { presentResult } from '../presenter.js';
import { syncExportBodySchema, syncImportBodySchema } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
export function createSyncExportHandler(importsExportsProcess) {
    return async function syncExportHandler(request, reply) {
        const body = parseRequestValue(reply, syncExportBodySchema, request.body ?? {});
        if (!body) {
            return;
        }
        try {
            const result = await importsExportsProcess.exportSync();
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
export function createSyncImportHandler(importsExportsProcess) {
    return async function syncImportHandler(request, reply) {
        const body = parseRequestValue(reply, syncImportBodySchema, request.body);
        if (!body) {
            return;
        }
        try {
            const result = await importsExportsProcess.importSync(body.mode);
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=imports-exports.js.map