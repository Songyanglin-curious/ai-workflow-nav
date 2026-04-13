import { presentError } from '../presenter.js';
import { presentPromptDeleteEnvelope, presentPromptDetailEnvelope, presentPromptListEnvelope, } from '../presenter/prompts.js';
import { createPromptBodySchema, promptListQueryHttpSchema, promptParamsSchema, updatePromptBodySchema, } from '../schema/prompts.js';
function getErrorCode(error) {
    if (typeof error !== 'object' || error === null) {
        return undefined;
    }
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
}
function mapPromptError(error) {
    const code = getErrorCode(error);
    const message = error instanceof Error ? error.message : '提示词接口请求失败。';
    switch (code) {
        case 'PROMPT_NOT_FOUND':
            return { statusCode: 404, code, message };
        case 'PROMPT_FILE_PATH_CONFLICT':
            return { statusCode: 409, code, message };
        case 'PROMPT_VALIDATION_FAILED':
            return { statusCode: 422, code, message };
        case 'VALIDATION_ERROR':
            return { statusCode: 422, code, message };
        default:
            return { statusCode: 500, code: 'INTERNAL_ERROR', message };
    }
}
function mapValidationIssues(error) {
    if (typeof error !== 'object' || error === null || !('issues' in error)) {
        return { issues: [] };
    }
    const issues = error.issues;
    return {
        issues: issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        })),
    };
}
function replyWithPromptError(reply, error) {
    const mappedError = mapPromptError(error);
    return reply.status(mappedError.statusCode).send(presentError(mappedError.code, mappedError.message, mappedError.statusCode === 422 ? mapValidationIssues(error) : undefined));
}
export async function registerPromptRoutes(app, options) {
    app.get('/api/prompts', async (request, reply) => {
        const parsedQuery = promptListQueryHttpSchema.safeParse(request.query);
        if (!parsedQuery.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '提示词列表查询参数校验失败。', mapValidationIssues(parsedQuery.error)));
        }
        try {
            const items = options.promptService.listPrompts(parsedQuery.data);
            return reply.send(presentPromptListEnvelope(items));
        }
        catch (error) {
            return replyWithPromptError(reply, error);
        }
    });
    app.get('/api/prompts/:id', async (request, reply) => {
        const parsedParams = promptParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '提示词路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        try {
            const prompt = await options.promptService.getPromptById(parsedParams.data.id);
            return reply.send(presentPromptDetailEnvelope(prompt));
        }
        catch (error) {
            return replyWithPromptError(reply, error);
        }
    });
    app.post('/api/prompts', async (request, reply) => {
        const parsedBody = createPromptBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '提示词创建请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const prompt = await options.promptService.createPrompt(parsedBody.data);
            return reply.status(201).send(presentPromptDetailEnvelope(prompt));
        }
        catch (error) {
            return replyWithPromptError(reply, error);
        }
    });
    app.patch('/api/prompts/:id', async (request, reply) => {
        const parsedParams = promptParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '提示词路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        const parsedBody = updatePromptBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '提示词更新请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const prompt = await options.promptService.updatePrompt(parsedParams.data.id, parsedBody.data);
            return reply.send(presentPromptDetailEnvelope(prompt));
        }
        catch (error) {
            return replyWithPromptError(reply, error);
        }
    });
    app.delete('/api/prompts/:id', async (request, reply) => {
        const parsedParams = promptParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '提示词路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        try {
            await options.promptService.deletePromptById(parsedParams.data.id);
            return reply.send(presentPromptDeleteEnvelope());
        }
        catch (error) {
            return replyWithPromptError(reply, error);
        }
    });
}
//# sourceMappingURL=prompts.js.map