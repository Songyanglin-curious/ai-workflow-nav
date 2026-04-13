import path from 'node:path';

import { createToolRegistry, type ToolActionType } from '../../infra/tools/index.js';
import { executeTool, type ToolExecutionResult } from '../../infra/tools/index.js';
import { createWorkspacePaths } from '../../infra/workspace/index.js';
import { ExternalToolConfigError } from './errors.js';
import { buildExternalToolExecutionPlan } from './resolver.js';
import type {
  ExternalToolCallResult,
  ExternalToolExecutionContext,
  ExternalToolInvocationInput,
  ExternalToolResolvedAction,
  ExternalToolsService,
  OpenAtLineExternalToolInvocationInput,
} from './types.js';

export interface CreateExternalToolsServiceOptions {
  config: ExternalToolExecutionContext['config'];
  workspacePaths?: ExternalToolExecutionContext['workspacePaths'];
}

function assertExecutablePath(toolPath: string): string {
  const trimmedPath = toolPath.trim();

  if (trimmedPath.length === 0) {
    throw new ExternalToolConfigError('外部工具 exePath 不能为空。');
  }

  if (!path.isAbsolute(trimmedPath)) {
    throw new ExternalToolConfigError(`外部工具 exePath 必须是绝对路径：${trimmedPath}`);
  }

  return trimmedPath;
}

function toExecutionContext(options: CreateExternalToolsServiceOptions): ExternalToolExecutionContext {
  const workspacePaths = options.workspacePaths ?? createWorkspacePaths(options.config.workspaceRoot);
  const toolRegistry = createToolRegistry({
    version: options.config.version,
    defaults: options.config.defaults,
    tools: options.config.tools,
    routes: options.config.routes,
    security: options.config.security,
  });

  return {
    config: options.config,
    workspacePaths,
    toolRegistry,
  };
}

function toCallResult(
  resolvedAction: ExternalToolResolvedAction,
  executionResult: ToolExecutionResult,
  args: string[],
  exePath: string,
): ExternalToolCallResult {
  return {
    actionType: resolvedAction.actionType,
    toolKey: resolvedAction.toolKey,
    toolLabel: resolvedAction.toolLabel,
    exePath,
    args,
    targetPath: resolvedAction.targetPath,
    resolvedTargetPath: resolvedAction.resolvedTargetPath,
    routeSource: resolvedAction.routeSource,
    exitCode: executionResult.exitCode,
    stdout: executionResult.stdout,
    stderr: executionResult.stderr,
  };
}

async function invokeExternalTool(
  context: ExternalToolExecutionContext,
  actionType: ToolActionType,
  input: ExternalToolInvocationInput,
): Promise<ExternalToolCallResult> {
  const executionPlan = await buildExternalToolExecutionPlan(context, actionType, input);
  const exePath = assertExecutablePath(executionPlan.resolvedAction.toolDefinition.exePath);
  const executionResult = await executeTool({
    exePath,
    args: executionPlan.args,
  });

  return toCallResult(executionPlan.resolvedAction, executionResult, executionPlan.args, exePath);
}

export function createExternalToolsService(options: CreateExternalToolsServiceOptions): ExternalToolsService {
  const context = toExecutionContext(options);

  return {
    toolExists(toolKey: string): boolean {
      return context.toolRegistry.toolExists(toolKey);
    },

    getToolLabel(toolKey: string): string | undefined {
      return context.toolRegistry.getToolByKey(toolKey)?.label;
    },

    openFile(input) {
      return invokeExternalTool(context, 'openFile', input);
    },

    openFolder(input) {
      return invokeExternalTool(context, 'openFolder', input);
    },

    openPath(input) {
      return invokeExternalTool(context, 'openPath', input);
    },

    openAtLine(input: OpenAtLineExternalToolInvocationInput) {
      return invokeExternalTool(context, 'openAtLine', input);
    },
  };
}
