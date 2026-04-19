import { readFileSync } from 'node:fs';
import path from 'node:path';

import { parse } from 'jsonc-parser';

import { configSchema, type AppConfig } from './configSchema.js';

const serverRoot = path.resolve(import.meta.dirname, '../..');
const configPath = path.join(serverRoot, 'config', 'app.config.jsonc');

export function loadConfig(): AppConfig {
  const source = readFileSync(configPath, 'utf8');
  const value = parse(source);

  return configSchema.parse(value);
}

export function resolveFromServerRoot(relativePath: string) {
  return path.resolve(serverRoot, relativePath);
}
