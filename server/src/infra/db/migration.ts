import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { SqliteDatabase } from './client.js';
import { DatabaseMigrationError } from './errors.js';

export interface MigrationScript {
  name: string;
  absolutePath: string;
  sql: string;
}

export interface MigrationResult {
  executedCount: number;
  executedFiles: string[];
}

export async function readMigrationScripts(schemaDirectoryPath: string): Promise<MigrationScript[]> {
  const directoryEntries = await readdir(schemaDirectoryPath, {
    withFileTypes: true,
  });

  const sqlFiles = directoryEntries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.sql')
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'));

  return Promise.all(
    sqlFiles.map(async (fileName) => {
      const absolutePath = path.join(schemaDirectoryPath, fileName);
      const sql = await readFile(absolutePath, 'utf8');

      return {
        name: fileName,
        absolutePath,
        sql,
      };
    }),
  );
}

export async function runMigrations(
  database: SqliteDatabase,
  schemaDirectoryPath: string,
): Promise<MigrationResult> {
  try {
    const scripts = await readMigrationScripts(schemaDirectoryPath);

    for (const script of scripts) {
      database.exec(script.sql);
    }

    return {
      executedCount: scripts.length,
      executedFiles: scripts.map((script) => script.name),
    };
  } catch (error) {
    throw new DatabaseMigrationError(schemaDirectoryPath, error);
  }
}
