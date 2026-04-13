import { presentError } from '../presenter.js';
function readErrorCode(error) {
    if (!(error instanceof Error)) {
        return undefined;
    }
    const errorWithCode = error;
    return typeof errorWithCode.code === 'string'
        ? errorWithCode.code
        : undefined;
}
export function mapKnownHttpError(error) {
    const code = readErrorCode(error);
    if (!code) {
        return undefined;
    }
    if (code.endsWith('_NOT_FOUND')) {
        return {
            statusCode: 404,
            body: presentError(code, error instanceof Error ? error.message : '资源不存在。'),
        };
    }
    if (code === 'PRECONDITION_FAILED') {
        return {
            statusCode: 412,
            body: presentError(code, error instanceof Error ? error.message : '前置条件不满足。'),
        };
    }
    if (code === 'VALIDATION_ERROR' || code.endsWith('_VALIDATION_FAILED')) {
        return {
            statusCode: 422,
            body: presentError('VALIDATION_ERROR', error instanceof Error ? error.message : '请求参数不合法。'),
        };
    }
    if (code === 'SUMMARY_ARCHIVE_FAILED') {
        return {
            statusCode: 500,
            body: presentError(code, error instanceof Error ? error.message : '总结归档失败。'),
        };
    }
    if (code.startsWith('EXTERNAL_TOOL_')) {
        return {
            statusCode: 500,
            body: presentError('INTERNAL_ERROR', error instanceof Error ? error.message : '外部工具调用失败。'),
        };
    }
    if (code === 'PROJECT_NODE_CYCLE_DETECTED' || code === 'PROJECT_FOLDER_PATH_CONFLICT') {
        return {
            statusCode: 409,
            body: presentError(code, error instanceof Error ? error.message : '资源冲突。'),
        };
    }
    if (code === 'INTERNAL_ERROR') {
        return {
            statusCode: 500,
            body: presentError(code, error instanceof Error ? error.message : '服务端错误。'),
        };
    }
    return undefined;
}
export function sendKnownHttpError(reply, error) {
    const mappedError = mapKnownHttpError(error);
    if (!mappedError) {
        return false;
    }
    reply.status(mappedError.statusCode).send(mappedError.body);
    return true;
}
//# sourceMappingURL=http-error.js.map