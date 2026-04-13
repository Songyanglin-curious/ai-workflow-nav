import {
  closeDatabase,
  openDatabase,
  resolveSchemaDirectoryPath,
  runMigrations,
  type SqliteDatabase,
} from '../infra/db/index.js';
import type { WorkspacePaths } from '../infra/workspace/index.js';
import { createTestWorkspace } from './test-workspace.js';

export interface TestContext {
  rootPath: string;
  workspacePaths: WorkspacePaths;
  database: SqliteDatabase;
  cleanup(): Promise<void>;
}

export async function createTestContext(): Promise<TestContext> {
  const workspace = await createTestWorkspace();
  const { rootPath, workspacePaths } = workspace;

  const database = openDatabase({
    databasePath: workspacePaths.runtimeDatabasePath,
  });

  await runMigrations(database, resolveSchemaDirectoryPath(workspacePaths.rootPath));

  return {
    rootPath,
    workspacePaths,
    database,
    async cleanup(): Promise<void> {
      closeDatabase(database);
      await workspace.cleanup();
    },
  };
}
