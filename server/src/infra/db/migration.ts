import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { SqliteDatabase } from './client.js';
import { DatabaseMigrationError } from './errors.js';

const schemaFileNamePattern = /^(?<order>\d{3})_.+\.sql$/i;
const declaredTableNamePattern = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_][A-Za-z0-9_]*)/gi;
const defaultSchemaRelativePath = path.join('sql', 'schema', 'v1', 'tables');

export interface MigrationScript {
  order: number;
  name: string;
  absolutePath: string;
  sql: string;
  declaredTableNames: string[];
}

export interface MigrationResult {
  executedCount: number;
  executedFiles: string[];
  declaredTableNames: string[];
}

function readScriptOrder(fileName: string): number {
  const matched = fileName.match(schemaFileNamePattern);

  if (!matched?.groups?.order) {
    throw new Error(`schema 脚本命名不合法：${fileName}`);
  }

  return Number(matched.groups.order);
}

function readDeclaredTableNames(sql: string): string[] {
  const tableNames = new Set<string>();
  let matched = declaredTableNamePattern.exec(sql);

  while (matched) {
    tableNames.add(matched[1]);
    matched = declaredTableNamePattern.exec(sql);
  }

  declaredTableNamePattern.lastIndex = 0;

  return [...tableNames];
}

function assertScriptOrder(fileNames: string[]): void {
  if (fileNames.length === 0) {
    throw new Error('schema 目录下未找到可执行的 SQL 脚本。');
  }

  const duplicatedOrder = new Set<number>();
  const seenOrder = new Set<number>();

  for (const fileName of fileNames) {
    const order = readScriptOrder(fileName);

    if (seenOrder.has(order)) {
      duplicatedOrder.add(order);
      continue;
    }

    seenOrder.add(order);
  }

  if (duplicatedOrder.size > 0) {
    throw new Error(`schema 脚本序号重复：${[...duplicatedOrder].join(', ')}`);
  }
}

function readExistingTableNames(database: SqliteDatabase): string[] {
  const statement = database.prepare<{ name: string }>(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);

  return statement.all().map((row) => row.name);
}

function assertDeclaredTablesCreated(
  database: SqliteDatabase,
  scripts: MigrationScript[],
): string[] {
  const declaredTableNames = [...new Set(scripts.flatMap((script) => script.declaredTableNames))];

  if (declaredTableNames.length === 0) {
    return [];
  }

  const existingTableNames = new Set(readExistingTableNames(database));
  const missingTableNames = declaredTableNames.filter((tableName) => !existingTableNames.has(tableName));

  if (missingTableNames.length > 0) {
    throw new Error(`schema 执行后缺少表：${missingTableNames.join(', ')}`);
  }

  return declaredTableNames;
}

export function resolveSchemaDirectoryPath(workspaceRootPath: string): string {
  return path.resolve(workspaceRootPath, defaultSchemaRelativePath);
}

export async function readMigrationScripts(schemaDirectoryPath: string): Promise<MigrationScript[]> {
  const directoryEntries = await readdir(schemaDirectoryPath, {
    withFileTypes: true,
  });

  const sqlFiles = directoryEntries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.sql')
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'));

  assertScriptOrder(sqlFiles);

  return Promise.all(
    sqlFiles.map(async (fileName) => {
      const absolutePath = path.join(schemaDirectoryPath, fileName);
      const sql = await readFile(absolutePath, 'utf8');

      return {
        order: readScriptOrder(fileName),
        name: fileName,
        absolutePath,
        sql,
        declaredTableNames: readDeclaredTableNames(sql),
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

    const declaredTableNames = assertDeclaredTablesCreated(database, scripts);

    return {
      executedCount: scripts.length,
      executedFiles: scripts.map((script) => script.name),
      declaredTableNames,
    };
  } catch (error) {
    throw new DatabaseMigrationError(schemaDirectoryPath, error);
  }
}
