import { presentError } from '../presenter.js';
export function parseRequestValue(reply, schema, value) {
    const parsedResult = schema.safeParse(value);
    if (parsedResult.success) {
        return parsedResult.data;
    }
    reply.status(422).send(presentError('VALIDATION_ERROR', '请求参数不合法。', {
        issues: parsedResult.error.issues,
    }));
    return undefined;
}
//# sourceMappingURL=request-validation.js.map