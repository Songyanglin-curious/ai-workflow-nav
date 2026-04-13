import path from 'node:path';

import { pathExists } from '../../infra/filesystem/index.js';
import { type LocalConfig } from '../../infra/config/index.js';
import { assertAllowedPath, getWorkspaceAllowedRoots, type WorkspacePaths } from '../../infra/workspace/index.js';
import { type ToolActionType, type ToolDefinition, type ToolRegistry } from '../../infra/tools/index.js';
import {
  ExternalToolActionError,
  ExternalToolConfigError,
  ExternalToolResolutionError,
  ExternalToolSecurityError,
} from './errors.js';
import type {
  ExternalToolExecutionContext,
  ExternalToolInvocationInput,
  ExternalToolResolvedAction,
} from './types.js';

function normalizeExtension(extension: string): string {
  const trimmedExtension = extension.trim();

  if (trimmedExtension.length === 0) {
    return '';
  }

  return trimmedExtension.startsWith('.') ? trimmedExtension.toLowerCase() : `.${trimmedExtension.toLowerCase()}`;
}

function getTargetExtension(targetPath: string): string {
  return normalizeExtension(path.extname(targetPath));
}

function resolveConfiguredAllowedRoots(config: LocalConfig, workspacePaths: WorkspacePaths): string[] {
  const configuredRoots = config.security?.allowedRoots ?? [];
  const normalizedRoots = configuredRoots.map((rootPath) => {
    const resolvedRootPath = path.isAbsolute(rootPath) ? path.resolve(rootPath) : path.resolve(workspacePaths.rootPath, rootPath);

    return resolvedRootPath;
  });

  return [...getWorkspaceAllowedRoots(workspacePaths), ...normalizedRoots];
}

function resolveTargetPath(inputPath: string, context: ExternalToolExecutionContext): string {
  const trimmedPath = inputPath.trim();

  if (trimmedPath.length === 0) {
    throw new ExternalToolSecurityError('外部工具目标路径不能为空。');
  }

  if (path.isAbsolute(trimmedPath)) {
    if (!(context.config.security?.allowAbsolutePaths ?? false)) {
      throw new ExternalToolSecurityError(`当前配置不允许使用绝对路径：${trimmedPath}`);
    }
  }

  const resolvedPath = path.isAbsolute(trimmedPath)
    ? path.resolve(trimmedPath)
    : path.resolve(context.workspacePaths.rootPath, trimmedPath);

  return assertAllowedPath(resolvedPath, resolveConfiguredAllowedRoots(context.config, context.workspacePaths));
}

function findToolByKey(toolRegistry: ToolRegistry, toolKey: string): ToolDefinition {
  const toolDefinition = toolRegistry.getToolByKey(toolKey);

  if (!toolDefinition) {
    throw new ExternalToolResolutionError(`未找到外部工具：${toolKey}`);
  }

  return toolDefinition;
}

function resolveToolPlatform(toolDefinition: ToolDefinition): void {
  const configuredPlatform = toolDefinition.platform.trim().toLowerCase();
  const currentPlatform = process.platform.toLowerCase();

  if (configuredPlatform === 'all' || configuredPlatform === 'any') {
    return;
  }

  if (configuredPlatform === currentPlatform) {
    return;
  }

  if (currentPlatform === 'win32' && (configuredPlatform === 'windows' || configuredPlatform === 'win')) {
    return;
  }

  if (currentPlatform === 'darwin' && (configuredPlatform === 'mac' || configuredPlatform === 'macos' || configuredPlatform === 'osx')) {
    return;
  }

  throw new ExternalToolConfigError(`外部工具平台不匹配：${toolDefinition.toolKey} 期望 ${toolDefinition.platform}，当前 ${process.platform}`);
}

function resolveToolAction(toolDefinition: ToolDefinition, actionType: ToolActionType): NonNullable<ToolDefinition['actions'][ToolActionType]> {
  const actionDefinition = toolDefinition.actions[actionType];

  if (!actionDefinition) {
    throw new ExternalToolActionError(`工具 ${toolDefinition.toolKey} 未配置动作 ${actionType}`);
  }

  return actionDefinition;
}

function resolveRouteToolKey(toolRegistry: ToolRegistry, actionType: ToolActionType, targetPath: string): string | undefined {
  const extension = getTargetExtension(targetPath);

  if (extension.length === 0) {
    return undefined;
  }

  const route = toolRegistry.routes.find((routeDefinition) => {
    return normalizeExtension(routeDefinition.match.extension) === extension && routeDefinition.actionType === actionType;
  });

  return route?.toolKey;
}

function resolveToolKey(
  toolRegistry: ToolRegistry,
  actionType: ToolActionType,
  input: ExternalToolInvocationInput,
): { toolKey: string; routeSource: 'toolKey' | 'extension' | 'default' } {
  if (input.toolKey && input.toolKey.trim().length > 0) {
    return {
      toolKey: input.toolKey.trim(),
      routeSource: 'toolKey',
    };
  }

  const routeToolKey = resolveRouteToolKey(toolRegistry, actionType, input.targetPath);

  if (routeToolKey) {
    return {
      toolKey: routeToolKey,
      routeSource: 'extension',
    };
  }

  const defaultToolKey = toolRegistry.defaults?.toolKey?.trim();

  if (defaultToolKey) {
    return {
      toolKey: defaultToolKey,
      routeSource: 'default',
    };
  }

  throw new ExternalToolResolutionError(`未能解析外部工具目标：${actionType}`);
}

export async function resolveExternalToolAction(
  context: ExternalToolExecutionContext,
  actionType: ToolActionType,
  input: ExternalToolInvocationInput,
): Promise<ExternalToolResolvedAction> {
  const resolvedTargetPath = resolveTargetPath(input.targetPath, context);
  const { toolKey, routeSource } = resolveToolKey(context.toolRegistry, actionType, input);
  const toolDefinition = findToolByKey(context.toolRegistry, toolKey);

  if (!toolDefinition.enabled) {
    throw new ExternalToolResolutionError(`外部工具已禁用：${toolDefinition.toolKey}`);
  }

  resolveToolPlatform(toolDefinition);

  const actionDefinition = resolveToolAction(toolDefinition, actionType);

  if (actionDefinition.requiresExists) {
    const exists = await pathExists(resolvedTargetPath);

    if (!exists) {
      throw new ExternalToolSecurityError(`外部工具目标不存在：${resolvedTargetPath}`);
    }
  }

  return {
    actionType,
    toolKey: toolDefinition.toolKey,
    toolLabel: toolDefinition.label,
    toolDefinition,
    actionDefinition,
    targetPath: input.targetPath,
    resolvedTargetPath,
    routeSource,
  };
}

function renderActionArgs(
  actionDefinition: NonNullable<ToolDefinition['actions'][ToolActionType]>,
  resolvedAction: ExternalToolResolvedAction,
  input: ExternalToolInvocationInput,
): string[] {
  const line = input.line ?? 1;
  const column = input.column ?? 1;
  const replacements = {
    filePath: resolvedAction.resolvedTargetPath,
    folderPath: resolvedAction.resolvedTargetPath,
    path: resolvedAction.resolvedTargetPath,
    line: String(line),
    column: String(column),
  } as const;

  return actionDefinition.args.map((template) => {
    const rendered = template.replace(/\{(filePath|folderPath|path|line|column)\}/g, (_match, key: keyof typeof replacements) => {
      return replacements[key];
    });

    if (/\{[^}]+\}/.test(rendered)) {
      throw new ExternalToolActionError(`外部工具参数仍包含未解析占位符：${template}`);
    }

    return rendered;
  });
}

export function buildExternalToolExecutionPlan(
  context: ExternalToolExecutionContext,
  actionType: ToolActionType,
  input: ExternalToolInvocationInput,
): Promise<{ resolvedAction: ExternalToolResolvedAction; args: string[] }> {
  return resolveExternalToolAction(context, actionType, input).then((resolvedAction) => {
    return {
      resolvedAction,
      args: renderActionArgs(resolvedAction.actionDefinition, resolvedAction, input),
    };
  });
}

