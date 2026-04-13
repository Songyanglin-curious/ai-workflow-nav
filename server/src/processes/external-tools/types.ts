import type { LocalConfig } from '../../infra/config/index.js';
import type { ToolActionType, ToolActionDefinition, ToolDefinition, ToolRegistry } from '../../infra/tools/index.js';
import type { WorkspacePaths } from '../../infra/workspace/index.js';

export interface ExternalToolInvocationInput {
  toolKey?: string;
  targetPath: string;
  line?: number;
  column?: number;
}

export interface ExternalToolExecutionContext {
  config: LocalConfig;
  workspacePaths: WorkspacePaths;
  toolRegistry: ToolRegistry;
}

export interface ExternalToolResolvedAction {
  actionType: ToolActionType;
  toolKey: string;
  toolLabel: string;
  toolDefinition: ToolDefinition;
  actionDefinition: ToolActionDefinition;
  targetPath: string;
  resolvedTargetPath: string;
  routeSource: 'toolKey' | 'extension' | 'default';
}

export interface ExternalToolCallResult {
  actionType: ToolActionType;
  toolKey: string;
  toolLabel: string;
  exePath: string;
  args: string[];
  targetPath: string;
  resolvedTargetPath: string;
  routeSource: 'toolKey' | 'extension' | 'default';
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface OpenAtLineExternalToolInvocationInput extends ExternalToolInvocationInput {
  line: number;
}

export interface ExternalToolsService {
  toolExists(toolKey: string): boolean;
  getToolLabel(toolKey: string): string | undefined;
  openFile(input: ExternalToolInvocationInput): Promise<ExternalToolCallResult>;
  openFolder(input: ExternalToolInvocationInput): Promise<ExternalToolCallResult>;
  openPath(input: ExternalToolInvocationInput): Promise<ExternalToolCallResult>;
  openAtLine(input: OpenAtLineExternalToolInvocationInput): Promise<ExternalToolCallResult>;
}
