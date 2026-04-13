import type { SqliteDatabase } from '../../infra/db/index.js';
import type { WorkspacePaths } from '../../infra/workspace/index.js';

export type StartupCheckType =
  | 'CONFIG_READABLE'
  | 'CONFIG_VALID'
  | 'WORKSPACE_ROOT_VALID'
  | 'FIXED_DIRECTORIES_READY'
  | 'RUNTIME_DB_READY'
  | 'SCHEMA_EXECUTED';

export type StartupCheckStatus = 'passed' | 'failed' | 'fixed';

export type StartupStatus = 'ready' | 'failed';

export interface StartupCheckItem {
  checkType: StartupCheckType;
  status: StartupCheckStatus;
  message: string;
}

export interface StartupReport {
  startupStatus: StartupStatus;
  checks: StartupCheckItem[];
}

export interface SelfCheckResult {
  status: StartupStatus;
  checks: StartupCheckItem[];
}

export interface StartupServiceOptions {
  database: SqliteDatabase;
  workspacePaths: WorkspacePaths;
  schemaDirectoryPath?: string;
}

export interface StartupService {
  getLatestStartupReport(): StartupReport | undefined;
  runSelfCheck(): Promise<SelfCheckResult>;
}
