import { fileURLToPath } from 'node:url';
import { ensureDirectory } from '../infra/filesystem/index.js';
import { loadLocalConfig, } from '../infra/config/index.js';
import { closeDatabase, openDatabase, resolveSchemaDirectoryPath, runMigrations, } from '../infra/db/index.js';
import { createWorkspacePaths, } from '../infra/workspace/index.js';
import { createPromptService } from '../domains/prompts/index.js';
import { createWorkflowNodeActionService, createWorkflowService, } from '../domains/workflows/index.js';
import { createProjectService, createProjectNodeService, createProjectViewConfigService, createDeliberationsService, createSummaryService, } from '../domains/projects/index.js';
import { createSolutionService } from '../domains/solutions/index.js';
import { createProjectDeletionService, } from '../processes/project-deletion/index.js';
import { createProjectNodeDeletionService, } from '../processes/project-node-deletion/index.js';
import { createExternalToolsService, } from '../processes/external-tools/index.js';
import { createImportsExportsProcess, } from '../processes/imports-exports/index.js';
import { createInspectionsProcess, } from '../processes/inspections/index.js';
import { createStartupService, } from '../processes/startup/index.js';
import { createWorkflowRuntimeActionsService, } from '../processes/workflow-runtime-actions/index.js';
function getDefaultWorkspaceRootPath() {
    return fileURLToPath(new URL('../../../', import.meta.url));
}
async function ensureWorkspaceDirectories(workspacePaths) {
    await ensureDirectory(workspacePaths.dbDirectoryPath);
    await ensureDirectory(workspacePaths.syncDirectoryPath);
    await ensureDirectory(workspacePaths.promptsDirectoryPath);
    await ensureDirectory(workspacePaths.projectsDirectoryPath);
    await ensureDirectory(workspacePaths.summaryArchivesDirectoryPath);
}
export async function createAppContainer(options = {}) {
    const initialWorkspacePaths = createWorkspacePaths(options.workspaceRootPath ?? getDefaultWorkspaceRootPath());
    const config = await loadLocalConfig(initialWorkspacePaths.localConfigPath);
    const workspacePaths = createWorkspacePaths(config.workspaceRoot);
    await ensureWorkspaceDirectories(workspacePaths);
    const database = openDatabase({
        databasePath: workspacePaths.runtimeDatabasePath,
    });
    try {
        const migrationResult = await runMigrations(database, resolveSchemaDirectoryPath(workspacePaths.rootPath));
        const externalTools = createExternalToolsService({
            config,
            workspacePaths,
        });
        const domains = {
            prompts: createPromptService(database, workspacePaths),
            workflows: createWorkflowService(database),
            workflowNodeActions: createWorkflowNodeActionService(database, {
                toolRegistry: externalTools,
            }),
            projects: createProjectService(database, workspacePaths),
            projectNodes: createProjectNodeService(database, workspacePaths),
            projectViewConfig: createProjectViewConfigService(database),
            deliberations: createDeliberationsService(database, workspacePaths),
            summaries: createSummaryService(database, workspacePaths),
            solutions: createSolutionService(database),
        };
        const processes = {
            projectDeletion: createProjectDeletionService(database, workspacePaths),
            projectNodeDeletion: createProjectNodeDeletionService(database, workspacePaths),
            externalTools,
            importsExports: createImportsExportsProcess(database, workspacePaths),
            inspections: createInspectionsProcess(database, workspacePaths),
            startup: createStartupService({
                database,
                workspacePaths,
            }),
            workflowRuntimeActions: createWorkflowRuntimeActionsService(database, workspacePaths, externalTools),
        };
        return {
            config,
            workspacePaths,
            database,
            migrationResult,
            domains,
            processes,
        };
    }
    catch (error) {
        closeDatabase(database);
        throw error;
    }
}
export function disposeAppContainer(container) {
    closeDatabase(container.database);
}
//# sourceMappingURL=container.js.map