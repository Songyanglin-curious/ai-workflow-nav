import { mkdirSync } from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

import type { AppConfig } from '../../config/configSchema.js';
import { resolveFromServerRoot } from '../../config/loadConfig.js';

export function createDatabase(config: AppConfig) {
  const dbPath = resolveFromServerRoot(config.database.path);

  mkdirSync(path.dirname(dbPath), {
    recursive: true,
  });

  return new Database(dbPath);
}
