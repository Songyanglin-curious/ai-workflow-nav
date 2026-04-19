import path from 'node:path';

import type { AppConfig } from '../../config/configSchema.js';

export function resolveWorkspaceRoot(config: AppConfig) {
  return config.workspace.root;
}

export function resolveWorkspacePath(config: AppConfig, relativePath: string) {
  return path.resolve(resolveWorkspaceRoot(config), relativePath);
}
