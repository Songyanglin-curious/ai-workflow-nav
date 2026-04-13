import { closeDatabase, openDatabase, resolveSchemaDirectoryPath, runMigrations, } from '../infra/db/index.js';
import { createTestWorkspace } from './test-workspace.js';
export async function createTestContext() {
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
        async cleanup() {
            closeDatabase(database);
            await workspace.cleanup();
        },
    };
}
//# sourceMappingURL=test-context.js.map