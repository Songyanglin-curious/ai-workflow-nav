import path from 'node:path';

import type { AppConfig } from '../../config/configSchema.js';

export function resolvePromptProjectRoot(config: AppConfig) {
  if (!config.promptsProject) {
    throw new Error('promptsProject 未配置');
  }

  return config.promptsProject.root;
}

export function resolvePromptFilePath(config: AppConfig, relativePath: string) {
  return path.resolve(resolvePromptProjectRoot(config), relativePath);
}
