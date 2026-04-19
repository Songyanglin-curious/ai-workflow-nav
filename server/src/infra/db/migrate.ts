import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type Database from 'better-sqlite3';

import { resolveFromServerRoot } from '../../config/loadConfig.js';

type RunMigrationsOptions = {
  db: Database.Database;
};

export async function runMigrations(options: RunMigrationsOptions) {
  const sqlDir = resolveFromServerRoot('sql');
  const filenames = readdirSync(sqlDir)
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  for (const filename of filenames) {
    const filePath = path.join(sqlDir, filename);
    const sql = readFileSync(filePath, 'utf8');

    if (!sql.trim()) {
      continue;
    }

    options.db.exec(sql);
  }
}
