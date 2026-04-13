import { fileURLToPath } from 'node:url';

import { ensureDirectory } from '../infra/filesystem/index.js';
import {
  type LocalConfig,
  loadLocalConfig,
} from '../infra/config/index.js';
import {
  type MigrationResult,
  type SqliteDatabase,
  closeDatabase,
  openDatabase,
  runMigrations,
} from '../infra/db/index.js';
import {
  type WorkspacePaths,
  createWorkspacePaths,
} from '../infra/workspace/index.js';
import { createPromptService, type PromptService } from '../domains/prompts/index.js';
import {
  createWorkflowNodeActionService,
  createWorkflowService,
  type WorkflowNodeActionService,
  type WorkflowService,
} from '../domains/workflows/index.js';
import {
  createProjectService,
  createProjectNodeService,
  createProjectViewConfigService,
  createDeliberationsService,
  createSummaryService,
  type ProjectService,
  type ProjectNodeService,
  type ProjectViewConfigService,
  type DeliberationsService,
  type SummaryService,
} from '../domains/projects/index.js';
import { createSolutionService, type SolutionService } from '../domains/solutions/index.js';
import {
  createProjectDeletionService,
  type ProjectDeletionService,
} from '../processes/project-deletion/index.js';
import {
  createProjectNodeDeletionService,
  type ProjectNodeDeletionService,
} from '../processes/project-node-deletion/index.js';
import {
  createExternalToolsService,
  type ExternalToolsService,
} from '../processes/external-tools/index.js';
import {
  createImportsExportsProcess,
  type ImportsExportsProcess,
} from '../processes/imports-exports/index.js';
import {
  createInspectionsProcess,
  type InspectionsProcess,
} from '../processes/inspections/index.js';
import {
  createStartupService,
  type StartupService,
} from '../processes/startup/index.js';
import {
  createWorkflowRuntimeActionsService,
  type WorkflowRuntimeActionsService,
} from '../processes/workflow-runtime-actions/index.js';

export interface AppDomainServices {
  prompts: PromptService;
  workflows: WorkflowService;
  workflowNodeActions: WorkflowNodeActionService;
  projects: ProjectService;
  projectNodes: ProjectNodeService;
  projectViewConfig: ProjectViewConfigService;
  deliberations: DeliberationsService;
  summaries: SummaryService;
  solutions: SolutionService;
}

export interface AppProcesses {
  projectDeletion: ProjectDeletionService;
  projectNodeDeletion: ProjectNodeDeletionService;
  externalTools: ExternalToolsService;
  importsExports: ImportsExportsProcess;
  inspections: InspectionsProcess;
  startup: StartupService;
  workflowRuntimeActions: WorkflowRuntimeActionsService;
}

export interface AppContainer {
  config: LocalConfig;
  workspacePaths: WorkspacePaths;
  database: SqliteDatabase;
  migrationResult: MigrationResult;
  domains: AppDomainServices;
  processes: AppProcesses;
}

export interface CreateAppContainerOptions {
  workspaceRootPath?: string;
}

function getDefaultWorkspaceRootPath(): string {
  return fileURLToPath(new URL('../../../', import.meta.url));
}

function getSchemaDirectoryPath(): string {
  return fileURLToPath(new URL('../../../sql/schema/v1/tables/', import.meta.url));
}

async function ensureWorkspaceDirectories(workspacePaths: WorkspacePaths): Promise<void> {
  await ensureDirectory(workspacePaths.dbDirectoryPath);
  await ensureDirectory(workspacePaths.syncDirectoryPath);
  await ensureDirectory(workspacePaths.promptsDirectoryPath);
  await ensureDirectory(workspacePaths.projectsDirectoryPath);
  await ensureDirectory(workspacePaths.summaryArchivesDirectoryPath);
}

export async function createAppContainer(options: CreateAppContainerOptions = {}): Promise<AppContainer> {
  const initialWorkspacePaths = createWorkspacePaths(options.workspaceRootPath ?? getDefaultWorkspaceRootPath());
  const config = await loadLocalConfig(initialWorkspacePaths.localConfigPath);
  const workspacePaths = createWorkspacePaths(config.workspaceRoot);

  await ensureWorkspaceDirectories(workspacePaths);

  const database = openDatabase({
    databasePath: workspacePaths.runtimeDatabasePath,
  });

  try {
    const migrationResult = await runMigrations(database, getSchemaDirectoryPath());
    const externalTools = createExternalToolsService({
      config,
      workspacePaths,
    });
    const domains: AppDomainServices = {
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
    const processes: AppProcesses = {
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
  } catch (error) {
    closeDatabase(database);
    throw error;
  }
}

export function disposeAppContainer(container: AppContainer): void {
  closeDatabase(container.database);
}
