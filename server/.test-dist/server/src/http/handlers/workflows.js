import { presentError } from '../presenter.js';
import { presentWorkflowDeleteEnvelope, presentWorkflowDetailEnvelope, presentWorkflowListEnvelope, presentWorkflowUpdateEnvelope, } from '../presenter/workflows.js';
import { createWorkflowBodySchema, updateWorkflowBodySchema, workflowListQueryHttpSchema, workflowParamsSchema, } from '../schema/workflows.js';
function getErrorCode(error) {
    if (typeof error !== 'object' || error === null) {
        return undefined;
    }
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
}
function mapWorkflowError(error) {
    const code = getErrorCode(error);
    const message = error instanceof Error ? error.message : '工作流接口请求失败。';
    switch (code) {
        case 'WORKFLOW_NOT_FOUND':
            return { statusCode: 404, code, message };
        case 'WORKFLOW_VALIDATION_FAILED':
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
function replyWithWorkflowError(reply, error) {
    const mappedError = mapWorkflowError(error);
    return reply.status(mappedError.statusCode).send(presentError(mappedError.code, mappedError.message, mappedError.statusCode === 422 ? mapValidationIssues(error) : undefined));
}
export async function registerWorkflowRoutes(app, options) {
    app.get('/api/workflows', async (request, reply) => {
        const parsedQuery = workflowListQueryHttpSchema.safeParse(request.query);
        if (!parsedQuery.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流列表查询参数校验失败。', mapValidationIssues(parsedQuery.error)));
        }
        try {
            const items = options.workflowService.listWorkflows(parsedQuery.data);
            return reply.send(presentWorkflowListEnvelope(items));
        }
        catch (error) {
            return replyWithWorkflowError(reply, error);
        }
    });
    app.get('/api/workflows/:id', async (request, reply) => {
        const parsedParams = workflowParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        try {
            const workflow = options.workflowService.getWorkflowById(parsedParams.data.id);
            return reply.send(presentWorkflowDetailEnvelope(workflow));
        }
        catch (error) {
            return replyWithWorkflowError(reply, error);
        }
    });
    app.post('/api/workflows', async (request, reply) => {
        const parsedBody = createWorkflowBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流创建请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const workflow = options.workflowService.createWorkflow(parsedBody.data);
            return reply.status(201).send(presentWorkflowDetailEnvelope(workflow));
        }
        catch (error) {
            return replyWithWorkflowError(reply, error);
        }
    });
    app.patch('/api/workflows/:id', async (request, reply) => {
        const parsedParams = workflowParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        const parsedBody = updateWorkflowBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流更新请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const result = options.workflowService.updateWorkflow(parsedParams.data.id, parsedBody.data);
            return reply.send(presentWorkflowUpdateEnvelope(result));
        }
        catch (error) {
            return replyWithWorkflowError(reply, error);
        }
    });
    app.delete('/api/workflows/:id', async (request, reply) => {
        const parsedParams = workflowParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        try {
            options.workflowService.deleteWorkflowById(parsedParams.data.id);
            return reply.send(presentWorkflowDeleteEnvelope());
        }
        catch (error) {
            return replyWithWorkflowError(reply, error);
        }
    });
}
//# sourceMappingURL=workflows.js.map