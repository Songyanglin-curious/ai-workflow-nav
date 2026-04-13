import { loadLocalConfig } from '../../infra/config/index.js';
import { listDirectory, pathExists } from '../../infra/filesystem/index.js';
import { resolvePromptPath } from '../../infra/workspace/index.js';
const promptIndexedFileMissingSuggestion = '检查文件是否被移动或删除，必要时重建正文文件或修正索引。';
const promptUnindexedFileSuggestion = '检查文件是否应当纳入提示词索引，必要时补建数据库记录。';
const workflowNodeActionStaleSuggestion = '检查 Mermaid 源码是否已删除该节点，必要时同步清理残留绑定。';
const bindingTargetMissingSuggestion = '检查绑定目标是否已被删除，必要时重建引用或删除失效绑定。';
const toolTargetMissingSuggestion = '检查本地工具定义是否仍然存在，必要时修正 targetRef。';
function createIssue(issueType, severity, entityType, entityId, message, suggestion) {
    return {
        issueType,
        severity,
        entityType,
        entityId,
        message,
        suggestion,
    };
}
function createWorkflowNodeIds(mermaidSource) {
    const nodeIds = new Set();
    const lines = mermaidSource.replaceAll(/\r\n/g, '\n').replaceAll(/^%%.*$/gm, '').split('\n');
    const ignoredLinePatterns = [
        /^(flowchart|graph)\b/i,
        /^subgraph\b/i,
        /^end\b/i,
        /^(class|classDef|click|style|linkStyle)\b/i,
    ];
    for (const line of lines) {
        const normalizedLine = line
            .replaceAll(/:::[A-Za-z0-9_-]+/g, '')
            .replaceAll(/\|[^|]*\|/g, ' ')
            .trim();
        if (normalizedLine.length === 0) {
            continue;
        }
        if (ignoredLinePatterns.some((pattern) => pattern.test(normalizedLine))) {
            continue;
        }
        for (const match of normalizedLine.matchAll(/\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:@?\{|\[\[|\(\(|\[|\(|\{))/g)) {
            nodeIds.add(match[1]);
        }
        for (const match of normalizedLine.matchAll(/\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:-->|---|==>|==|-.->|-\.->|~~~|--o|o--|--x|x--))/g)) {
            nodeIds.add(match[1]);
        }
        for (const match of normalizedLine.matchAll(/(?:-->|---|==>|==|-.->|-\.->|~~~|--o|o--|--x|x--)\s*([A-Za-z0-9_][A-Za-z0-9_-]*)\b/g)) {
            nodeIds.add(match[1]);
        }
    }
    return nodeIds;
}
function createIssueSummary(items) {
    let errorCount = 0;
    let warningCount = 0;
    for (const item of items) {
        if (item.severity === 'error') {
            errorCount += 1;
            continue;
        }
        warningCount += 1;
    }
    return {
        total: items.length,
        errorCount,
        warningCount,
    };
}
export function createInspectionsProcess(database, workspacePaths, options = {}) {
    return {
        async runInspection() {
            void options.mustBindWorkflowNodeAction;
            const items = [];
            const toolKeys = new Set((await loadLocalConfig(workspacePaths.localConfigPath)).tools.map((tool) => tool.toolKey));
            const prompts = database
                .prepare(`
          SELECT
            id,
            content_file_path
          FROM prompts
          ORDER BY id ASC
        `)
                .all();
            const promptFileNames = new Set();
            for (const entry of await listDirectory(workspacePaths.promptsDirectoryPath)) {
                if (entry.kind === 'file') {
                    promptFileNames.add(entry.name);
                }
            }
            for (const prompt of prompts) {
                const absolutePromptPath = resolvePromptPath(workspacePaths, prompt.content_file_path);
                if (await pathExists(absolutePromptPath)) {
                    promptFileNames.delete(prompt.content_file_path);
                    continue;
                }
                items.push(createIssue('INDEXED_FILE_MISSING', 'warning', 'prompt', prompt.id, '提示词正文文件不存在。', promptIndexedFileMissingSuggestion));
            }
            for (const fileName of promptFileNames) {
                items.push(createIssue('UNINDEXED_FILE_FOUND', 'warning', 'prompt', null, `提示词正文文件存在但未建立索引：${fileName}`, promptUnindexedFileSuggestion));
            }
            const workflows = database
                .prepare(`
          SELECT
            id,
            mermaid_source
          FROM workflows
          ORDER BY id ASC
        `)
                .all();
            const workflowIds = new Set(workflows.map((workflow) => workflow.id));
            const workflowNodeIdsById = new Map(workflows.map((workflow) => [workflow.id, createWorkflowNodeIds(workflow.mermaid_source)]));
            const workflowNodeActionRows = database
                .prepare(`
          SELECT
            id,
            workflow_id,
            mermaid_node_id,
            action_type,
            target_ref
          FROM workflow_node_actions
          ORDER BY workflow_id ASC, mermaid_node_id ASC
        `)
                .all();
            for (const nodeAction of workflowNodeActionRows) {
                const workflowNodeIds = workflowNodeIdsById.get(nodeAction.workflow_id);
                if (!workflowNodeIds || !workflowNodeIds.has(nodeAction.mermaid_node_id)) {
                    items.push(createIssue('WORKFLOW_NODE_ACTION_STALE', 'warning', 'workflow_node_action', nodeAction.id, `工作流节点动作已失效：${nodeAction.workflow_id} / ${nodeAction.mermaid_node_id}`, workflowNodeActionStaleSuggestion));
                    continue;
                }
                if (nodeAction.action_type === 'prompt') {
                    const promptExists = database
                        .prepare(`
              SELECT id
              FROM prompts
              WHERE id = @id
            `)
                        .get({ id: nodeAction.target_ref });
                    if (!promptExists) {
                        items.push(createIssue('BINDING_TARGET_NOT_FOUND', 'error', 'workflow_node_action', nodeAction.id, `工作流节点动作引用的提示词不存在：${nodeAction.target_ref}`, bindingTargetMissingSuggestion));
                    }
                    continue;
                }
                if (!toolKeys.has(nodeAction.target_ref)) {
                    items.push(createIssue('TOOL_TARGET_NOT_FOUND', 'error', 'workflow_node_action', nodeAction.id, `工作流节点动作引用的本地工具不存在：${nodeAction.target_ref}`, toolTargetMissingSuggestion));
                }
            }
            const projectNodeWorkflows = database
                .prepare(`
          SELECT
            id,
            project_node_id,
            workflow_id
          FROM project_node_workflows
          ORDER BY project_node_id ASC
        `)
                .all();
            for (const binding of projectNodeWorkflows) {
                if (workflowIds.has(binding.workflow_id)) {
                    continue;
                }
                items.push(createIssue('BINDING_TARGET_NOT_FOUND', 'error', 'project_node_workflow', binding.id, `项目节点工作流绑定引用的工作流不存在：${binding.workflow_id}`, bindingTargetMissingSuggestion));
            }
            return {
                summary: createIssueSummary(items),
                items,
            };
        },
    };
}
//# sourceMappingURL=service.js.map