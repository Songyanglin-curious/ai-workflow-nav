import { presentError } from '../../presenter.js';
import { presentWorkflowNodeActionDeleteEnvelope, presentWorkflowNodeActionEnvelope, presentWorkflowNodeActionListEnvelope, presentWorkflowNodeActionSyncEnvelope, } from '../../presenter/workflows.js';
import { createWorkflowNodeActionBodySchema, updateWorkflowNodeActionBodySchema, workflowNodeActionParamsSchema, workflowNodeActionSyncBodySchema, } from '../../schema/workflows.js';
function getErrorCode(error) {
    if (typeof error !== 'object' || error === null) {
        return undefined;
    }
    const code = error.code;
    return typeof code === 'string' ? code : undefined;
}
function mapWorkflowNodeActionError(error) {
    const code = getErrorCode(error);
    const message = error instanceof Error ? error.message : '工作流节点动作接口请求失败。';
    switch (code) {
        case 'WORKFLOW_NOT_FOUND':
        case 'WORKFLOW_NODE_ACTION_NOT_FOUND':
        case 'MERMAID_NODE_NOT_FOUND':
        case 'PROMPT_NOT_FOUND':
        case 'TOOL_TARGET_NOT_FOUND':
            return { statusCode: 404, code, message };
        case 'WORKFLOW_NODE_ACTION_CONFLICT':
            return { statusCode: 409, code, message };
        case 'WORKFLOW_NODE_ACTION_VALIDATION_FAILED':
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
function replyWithWorkflowNodeActionError(reply, error) {
    const mappedError = mapWorkflowNodeActionError(error);
    return reply.status(mappedError.statusCode).send(presentError(mappedError.code, mappedError.message, mappedError.statusCode === 422 ? mapValidationIssues(error) : undefined));
}
export async function registerWorkflowNodeActionRoutes(app, options) {
    app.get('/api/workflows/:workflowId/node-actions', async (request, reply) => {
        const parsedParams = workflowNodeActionParamsSchema.pick({ workflowId: true }).safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作列表参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        try {
            const items = options.workflowNodeActionService.listNodeActionsByWorkflowId(parsedParams.data.workflowId);
            return reply.send(presentWorkflowNodeActionListEnvelope(items));
        }
        catch (error) {
            return replyWithWorkflowNodeActionError(reply, error);
        }
    });
    app.post('/api/workflows/:workflowId/node-actions', async (request, reply) => {
        const parsedParams = workflowNodeActionParamsSchema.pick({ workflowId: true }).safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作创建路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        const parsedBody = createWorkflowNodeActionBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作创建请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const nodeAction = options.workflowNodeActionService.createNodeAction(parsedParams.data.workflowId, parsedBody.data);
            return reply.status(201).send(presentWorkflowNodeActionEnvelope(nodeAction));
        }
        catch (error) {
            return replyWithWorkflowNodeActionError(reply, error);
        }
    });
    app.patch('/api/workflows/:workflowId/node-actions/:mermaidNodeId', async (request, reply) => {
        const parsedParams = workflowNodeActionParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作更新路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        const parsedBody = updateWorkflowNodeActionBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作更新请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const nodeAction = options.workflowNodeActionService.updateNodeActionByWorkflowIdAndMermaidNodeId(parsedParams.data.workflowId, parsedParams.data.mermaidNodeId, parsedBody.data);
            return reply.send(presentWorkflowNodeActionEnvelope(nodeAction));
        }
        catch (error) {
            return replyWithWorkflowNodeActionError(reply, error);
        }
    });
    app.delete('/api/workflows/:workflowId/node-actions/:mermaidNodeId', async (request, reply) => {
        const parsedParams = workflowNodeActionParamsSchema.safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作删除路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        try {
            await options.workflowNodeActionService.deleteNodeActionByWorkflowIdAndMermaidNodeId(parsedParams.data.workflowId, parsedParams.data.mermaidNodeId);
            return reply.send(presentWorkflowNodeActionDeleteEnvelope());
        }
        catch (error) {
            return replyWithWorkflowNodeActionError(reply, error);
        }
    });
    app.post('/api/workflows/:workflowId/node-actions/sync', async (request, reply) => {
        const parsedParams = workflowNodeActionParamsSchema.pick({ workflowId: true }).safeParse(request.params);
        if (!parsedParams.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作同步路径参数校验失败。', mapValidationIssues(parsedParams.error)));
        }
        const parsedBody = workflowNodeActionSyncBodySchema.safeParse(request.body);
        if (!parsedBody.success) {
            return reply.status(422).send(presentError('VALIDATION_ERROR', '工作流节点动作同步请求校验失败。', mapValidationIssues(parsedBody.error)));
        }
        try {
            const result = options.workflowNodeActionService.syncNodeActions(parsedParams.data.workflowId);
            return reply.send(presentWorkflowNodeActionSyncEnvelope(result));
        }
        catch (error) {
            return replyWithWorkflowNodeActionError(reply, error);
        }
    });
}
//# sourceMappingURL=node-actions.js.map