import { presentError, presentNamedData, presentResult } from '../presenter.js';
import { selfCheckBodySchema } from '../schema.js';
import { parseRequestValue } from './request-validation.js';
import { sendKnownHttpError } from './http-error.js';
export function createStartupReportHandler(startupService) {
    return async function startupReportHandler(_request, reply) {
        const report = startupService.getLatestStartupReport();
        if (!report) {
            reply.status(500).send(presentError('INTERNAL_ERROR', '最新启动报告不存在。'));
            return;
        }
        reply.send(presentNamedData('report', report));
    };
}
export function createSelfCheckHandler(startupService) {
    return async function selfCheckHandler(request, reply) {
        const body = parseRequestValue(reply, selfCheckBodySchema, request.body ?? {});
        if (!body) {
            return;
        }
        try {
            const result = await startupService.runSelfCheck();
            reply.send(presentResult(result));
        }
        catch (error) {
            if (!sendKnownHttpError(reply, error)) {
                throw error;
            }
        }
    };
}
//# sourceMappingURL=startup.js.map