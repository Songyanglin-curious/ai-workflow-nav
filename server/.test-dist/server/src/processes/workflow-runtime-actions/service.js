import { pathExists, readTextFile } from '../../infra/filesystem/index.js';
import { resolvePromptPath } from '../../infra/workspace/index.js';
import { ProjectNodeNotFoundError, ProjectNodeWorkflowNotFoundError } from '../../domains/projects/project-nodes/errors.js';
import { PromptNotFoundError } from '../../domains/prompts/errors.js';
import { MermaidNodeNotFoundError, ToolTargetNotFoundError, WorkflowNodeActionNotFoundError, } from '../../domains/workflows/node-actions/errors.js';
import { createWorkflowRuntimeActionsRepo } from './repo.js';
const ignoredMermaidLinePatterns = [
    /^(flowchart|graph)\b/i,
    /^subgraph\b/i,
    /^end\b/i,
    /^(class|classDef|click|style|linkStyle)\b/i,
];
function getWorkflowNodeIds(mermaidSource) {
    const nodeIds = new Set();
    const lines = mermaidSource
        .replaceAll(/\r\n/g, '\n')
        .replaceAll(/^%%.*$/gm, '')
        .split('\n');
    for (const line of lines) {
        const normalizedLine = line
            .replaceAll(/:::[A-Za-z0-9_-]+/g, '')
            .replaceAll(/\|[^|]*\|/g, ' ')
            .trim();
        if (normalizedLine.length === 0) {
            continue;
        }
        if (ignoredMermaidLinePatterns.some((pattern) => pattern.test(normalizedLine))) {
            continue;
        }
        for (const match of normalizedLine.matchAll(/\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:@?\{|\[\[|\(\(|\[|\(|\{))/g)) {
            nodeIds.add(match[1]);
        }
        for (const match of normalizedLine.matchAll(/\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:-->|---|==>|==|-.->|-\.-|~~~|--o|o--|--x|x--))/g)) {
            nodeIds.add(match[1]);
        }
        for (const match of normalizedLine.matchAll(/(?:-->|---|==>|==|-.->|-\.-|~~~|--o|o--|--x|x--)\s*([A-Za-z0-9_][A-Za-z0-9_-]*)\b/g)) {
            nodeIds.add(match[1]);
        }
    }
    return nodeIds;
}
function assertMermaidNodeExists(context, mermaidNodeId) {
    if (!context.workflowId || !context.mermaidSource) {
        throw new ProjectNodeWorkflowNotFoundError(context.projectNodeId);
    }
    if (!getWorkflowNodeIds(context.mermaidSource).has(mermaidNodeId)) {
        throw new MermaidNodeNotFoundError(context.workflowId, mermaidNodeId);
    }
}
function createPromptActionDetail(context, isExecutable) {
    return {
        actionType: 'prompt',
        targetRef: context.targetRef ?? '',
        targetName: context.promptName ?? context.targetRef ?? '',
        isExecutable,
        failureReason: isExecutable ? null : 'prompt_not_found',
    };
}
function createToolActionDetail(context, externalToolsService) {
    const toolKey = context.targetRef ?? '';
    const isExecutable = externalToolsService.toolExists(toolKey);
    return {
        actionType: 'tool',
        targetRef: toolKey,
        targetName: externalToolsService.getToolLabel(toolKey) ?? toolKey,
        isExecutable,
        failureReason: isExecutable ? null : 'tool_target_not_found',
    };
}
export function createWorkflowRuntimeActionsService(database, workspacePaths, externalToolsService) {
    const repo = createWorkflowRuntimeActionsRepo(database);
    return {
        async getWorkflowRuntimeNodeDetail(projectNodeId, mermaidNodeId) {
            const context = repo.getWorkflowRuntimeActionContext(projectNodeId, mermaidNodeId);
            if (!context) {
                throw new ProjectNodeNotFoundError(projectNodeId);
            }
            if (!context.workflowId) {
                throw new ProjectNodeWorkflowNotFoundError(projectNodeId);
            }
            assertMermaidNodeExists(context, mermaidNodeId);
            if (!context.actionType || !context.targetRef) {
                return {
                    projectNodeId,
                    workflowId: context.workflowId,
                    mermaidNodeId,
                    hasBinding: false,
                    action: null,
                };
            }
            if (context.actionType === 'prompt') {
                const promptFilePath = context.promptContentFilePath
                    ? resolvePromptPath(workspacePaths, context.promptContentFilePath)
                    : undefined;
                const isExecutable = context.promptName !== null &&
                    promptFilePath !== undefined &&
                    (await pathExists(promptFilePath));
                return {
                    projectNodeId,
                    workflowId: context.workflowId,
                    mermaidNodeId,
                    hasBinding: true,
                    action: createPromptActionDetail(context, isExecutable),
                };
            }
            return {
                projectNodeId,
                workflowId: context.workflowId,
                mermaidNodeId,
                hasBinding: true,
                action: createToolActionDetail(context, externalToolsService),
            };
        },
        async triggerWorkflowRuntimeNodeAction(projectNodeId, mermaidNodeId) {
            const context = repo.getWorkflowRuntimeActionContext(projectNodeId, mermaidNodeId);
            if (!context) {
                throw new ProjectNodeNotFoundError(projectNodeId);
            }
            if (!context.workflowId) {
                throw new ProjectNodeWorkflowNotFoundError(projectNodeId);
            }
            assertMermaidNodeExists(context, mermaidNodeId);
            if (!context.actionType || !context.targetRef) {
                throw new WorkflowNodeActionNotFoundError(context.workflowId, mermaidNodeId);
            }
            if (context.actionType === 'prompt') {
                if (!context.promptName || !context.promptContentFilePath) {
                    throw new PromptNotFoundError(context.targetRef);
                }
                const promptFilePath = resolvePromptPath(workspacePaths, context.promptContentFilePath);
                if (!(await pathExists(promptFilePath))) {
                    throw new PromptNotFoundError(context.targetRef);
                }
                return {
                    actionType: 'prompt',
                    promptId: context.targetRef,
                    promptName: context.promptName,
                    copyText: await readTextFile(promptFilePath),
                };
            }
            if (!externalToolsService.toolExists(context.targetRef)) {
                throw new ToolTargetNotFoundError(context.targetRef);
            }
            await externalToolsService.openFolder({
                toolKey: context.targetRef,
                targetPath: context.projectNodeFolderPath,
            });
            return {
                actionType: 'tool',
                toolKey: context.targetRef,
                launched: true,
            };
        },
    };
}
//# sourceMappingURL=service.js.map