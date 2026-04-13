export const toolActionTypeValues = ['openFile', 'openFolder', 'openPath', 'openAtLine'] as const;
export type ToolActionType = (typeof toolActionTypeValues)[number];

export interface ToolActionDefinition {
  args: string[];
  requiresExists: boolean;
}

export interface ToolDefinition {
  toolKey: string;
  label: string;
  enabled: boolean;
  platform: string;
  exePath: string;
  actions: Partial<Record<ToolActionType, ToolActionDefinition>>;
}

export interface ToolRouteDefinition {
  toolKey: string;
  actionType: ToolActionType;
  match: {
    extension: string;
  };
}

export interface ToolDefaultsDefinition {
  toolKey?: string;
}

export interface ToolSecurityDefinition {
  allowAbsolutePaths: boolean;
  allowedRoots: string[];
}

export interface ToolRegistrySource {
  version: number;
  defaults?: ToolDefaultsDefinition;
  tools: ToolDefinition[];
  routes?: ToolRouteDefinition[];
  security?: ToolSecurityDefinition;
}

export class ToolRegistry {
  readonly version: number;
  readonly defaults?: ToolDefaultsDefinition;
  readonly routes: ToolRouteDefinition[];
  readonly security?: ToolSecurityDefinition;
  readonly #tools: Map<string, ToolDefinition>;

  constructor(source: ToolRegistrySource) {
    this.version = source.version;
    this.defaults = source.defaults;
    this.routes = source.routes ?? [];
    this.security = source.security;
    this.#tools = new Map(source.tools.map((tool) => [tool.toolKey, tool]));
  }

  getToolByKey(toolKey: string): ToolDefinition | undefined {
    return this.#tools.get(toolKey);
  }

  toolExists(toolKey: string): boolean {
    return this.#tools.has(toolKey);
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.#tools.values());
  }

  findRouteByExtension(extension: string, actionType?: ToolActionType): ToolRouteDefinition | undefined {
    return this.routes.find((route) => {
      if (route.match.extension !== extension) {
        return false;
      }

      if (!actionType) {
        return true;
      }

      return route.actionType === actionType;
    });
  }
}

export function createToolRegistry(source: ToolRegistrySource): ToolRegistry {
  return new ToolRegistry(source);
}
