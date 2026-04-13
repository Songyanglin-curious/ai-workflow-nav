import { pathExists, readTextFile } from '../../infra/filesystem/index.js';
import { resolvePromptPath, type WorkspacePaths } from '../../infra/workspace/index.js';
import { ProjectNodeNotFoundError, ProjectNodeWorkflowNotFoundError } from '../../domains/projects/project-nodes/errors.js';
import { PromptNotFoundError } from '../../domains/prompts/errors.js';
import {
  MermaidNodeNotFoundError,
  ToolTargetNotFoundError,
  WorkflowNodeActionNotFoundError,
} from '../../domains/workflows/node-actions/errors.js';
import { createWorkflowRuntimeActionsRepo, type WorkflowRuntimeActionContext } from './repo.js';
import type { ExternalToolsService } from '../external-tools/index.js';

export interface WorkflowRuntimeAction {
  actionType: 'prompt' | 'tool';
  targetRef: string;
  targetName: string;
  isExecutable: boolean;
  failureReason: 'prompt_not_found' | 'tool_target_not_found' | null;
}

export interface WorkflowRuntimeNodeDetail {
  projectNodeId: string;
  workflowId: string;
  mermaidNodeId: string;
  hasBinding: boolean;
  action: WorkflowRuntimeAction | null;
}

export type WorkflowRuntimeTriggerResult =
  | {
      actionType: 'prompt';
      promptId: string;
      promptName: string;
      copyText: string;
    }
  | {
      actionType: 'tool';
      toolKey: string;
      launched: boolean;
    };

const ignoredMermaidLinePatterns = [
  /^(flowchart|graph)\b/i,
  /^subgraph\b/i,
  /^end\b/i,
  /^(class|classDef|click|style|linkStyle)\b/i,
];

function getWorkflowNodeIds(mermaidSource: string): Set<string> {
  const nodeIds = new Set<string>();
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

    for (const match of normalizedLine.matchAll(
      /\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:@?\{|\[\[|\(\(|\[|\(|\{))/g,
    )) {
      nodeIds.add(match[1]);
    }

    for (const match of normalizedLine.matchAll(
      /\b([A-Za-z0-9_][A-Za-z0-9_-]*)\b(?=\s*(?:-->|---|==>|==|-.->|-\.-|~~~|--o|o--|--x|x--))/g,
    )) {
      nodeIds.add(match[1]);
    }

    for (const match of normalizedLine.matchAll(
      /(?:-->|---|==>|==|-.->|-\.-|~~~|--o|o--|--x|x--)\s*([A-Za-z0-9_][A-Za-z0-9_-]*)\b/g,
    )) {
      nodeIds.add(match[1]);
    }
  }

  return nodeIds;
}

function assertMermaidNodeExists(context: WorkflowRuntimeActionContext, mermaidNodeId: string): void {
  if (!context.workflowId || !context.mermaidSource) {
    throw new ProjectNodeWorkflowNotFoundError(context.projectNodeId);
  }

  if (!getWorkflowNodeIds(context.mermaidSource).has(mermaidNodeId)) {
    throw new MermaidNodeNotFoundError(context.workflowId, mermaidNodeId);
  }
}

function createPromptActionDetail(
  context: WorkflowRuntimeActionContext,
  isExecutable: boolean,
): WorkflowRuntimeNodeDetail['action'] {
  return {
    actionType: 'prompt',
    targetRef: context.targetRef ?? '',
    targetName: context.promptName ?? context.targetRef ?? '',
    isExecutable,
    failureReason: isExecutable ? null : 'prompt_not_found',
  };
}

function createToolActionDetail(
  context: WorkflowRuntimeActionContext,
  externalToolsService: ExternalToolsService,
): WorkflowRuntimeNodeDetail['action'] {
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

export function createWorkflowRuntimeActionsService(
  database: Parameters<typeof createWorkflowRuntimeActionsRepo>[0],
  workspacePaths: WorkspacePaths,
  externalToolsService: ExternalToolsService,
) {
  const repo = createWorkflowRuntimeActionsRepo(database);

  return {
    async getWorkflowRuntimeNodeDetail(
      projectNodeId: string,
      mermaidNodeId: string,
    ): Promise<WorkflowRuntimeNodeDetail> {
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
        const isExecutable =
          context.promptName !== null &&
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

    async triggerWorkflowRuntimeNodeAction(
      projectNodeId: string,
      mermaidNodeId: string,
    ): Promise<WorkflowRuntimeTriggerResult> {
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

export type WorkflowRuntimeActionsService = ReturnType<typeof createWorkflowRuntimeActionsService>;
