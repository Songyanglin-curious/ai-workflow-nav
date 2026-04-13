import path from 'node:path';
import { readConfigText, parseConfigText, localConfigSchema, } from '../../infra/config/index.js';
import { resolveSchemaDirectoryPath, runMigrations, } from '../../infra/db/index.js';
import { ensureDirectory, pathExists } from '../../infra/filesystem/index.js';
const startupReportKey = 'latest';
const fixedWorkspaceDirectories = [
    'dbDirectoryPath',
    'syncDirectoryPath',
    'promptsDirectoryPath',
    'projectsDirectoryPath',
    'summaryArchivesDirectoryPath',
];
function createTimestamp() {
    return new Date().toISOString();
}
function createCheck(checkType, status, message) {
    return {
        checkType,
        status,
        message,
    };
}
function createStartupStatus(checks) {
    return checks.some((check) => check.status === 'failed') ? 'failed' : 'ready';
}
function toStartupReport(result) {
    return {
        startupStatus: result.status,
        checks: result.checks,
    };
}
function ensureStartupReportTable(database) {
    database.exec(`
    CREATE TABLE IF NOT EXISTS startup_reports (
      report_key TEXT PRIMARY KEY,
      report_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}
function readLatestReportRow(database) {
    const statement = database.prepare(`
    SELECT report_json
    FROM startup_reports
    WHERE report_key = @reportKey
  `);
    const row = statement.get({ reportKey: startupReportKey });
    return row?.report_json;
}
function writeLatestReportRow(database, report) {
    const now = createTimestamp();
    const currentReportJson = JSON.stringify(report);
    const existingReportJson = readLatestReportRow(database);
    if (existingReportJson === undefined) {
        const statement = database.prepare(`
      INSERT INTO startup_reports (
        report_key,
        report_json,
        created_at,
        updated_at
      ) VALUES (
        @reportKey,
        @reportJson,
        @createdAt,
        @updatedAt
      )
    `);
        statement.run({
            reportKey: startupReportKey,
            reportJson: currentReportJson,
            createdAt: now,
            updatedAt: now,
        });
        return;
    }
    const statement = database.prepare(`
    UPDATE startup_reports
    SET
      report_json = @reportJson,
      updated_at = @updatedAt
    WHERE report_key = @reportKey
  `);
    statement.run({
        reportKey: startupReportKey,
        reportJson: currentReportJson,
        updatedAt: now,
    });
}
async function readLocalConfig(workspacePaths) {
    let sourceText;
    try {
        sourceText = await readConfigText(workspacePaths.localConfigPath);
    }
    catch (error) {
        return {
            readable: createCheck('CONFIG_READABLE', 'failed', error instanceof Error ? error.message : `本地配置文件读取失败：${workspacePaths.localConfigPath}`),
        };
    }
    const readable = createCheck('CONFIG_READABLE', 'passed', `本地配置文件可读取：${workspacePaths.localConfigPath}`);
    try {
        const parsedConfig = parseConfigText(workspacePaths.localConfigPath, sourceText);
        const validatedResult = localConfigSchema.safeParse(parsedConfig);
        if (!validatedResult.success) {
            return {
                readable,
                config: undefined,
            };
        }
        return {
            readable,
            config: validatedResult.data,
        };
    }
    catch {
        return {
            readable,
            config: undefined,
        };
    }
}
async function checkFixedDirectories(workspacePaths) {
    try {
        let fixedCount = 0;
        for (const key of fixedWorkspaceDirectories) {
            const directoryPath = workspacePaths[key];
            if (await pathExists(directoryPath)) {
                continue;
            }
            await ensureDirectory(directoryPath);
            fixedCount += 1;
        }
        return fixedCount > 0
            ? createCheck('FIXED_DIRECTORIES_READY', 'fixed', '固定目录已自动创建并就绪。')
            : createCheck('FIXED_DIRECTORIES_READY', 'passed', '固定目录已就绪。');
    }
    catch (error) {
        return createCheck('FIXED_DIRECTORIES_READY', 'failed', error instanceof Error ? error.message : '固定目录检查失败。');
    }
}
function checkWorkspaceRoot(config) {
    if (!config) {
        return createCheck('WORKSPACE_ROOT_VALID', 'failed', '工作区根路径校验失败：本地配置不可用。');
    }
    if (!path.isAbsolute(config.workspaceRoot)) {
        return createCheck('WORKSPACE_ROOT_VALID', 'failed', `工作区根路径不是绝对路径：${config.workspaceRoot}`);
    }
    return createCheck('WORKSPACE_ROOT_VALID', 'passed', `工作区根路径合法：${config.workspaceRoot}`);
}
function checkRuntimeDatabase(database) {
    try {
        database.prepare('SELECT 1').get();
        return createCheck('RUNTIME_DB_READY', 'passed', '运行时数据库已就绪。');
    }
    catch (error) {
        return createCheck('RUNTIME_DB_READY', 'failed', error instanceof Error ? error.message : '运行时数据库不可用。');
    }
}
async function checkSchemaExecuted(database, schemaDirectoryPath) {
    try {
        await runMigrations(database, schemaDirectoryPath);
        return createCheck('SCHEMA_EXECUTED', 'passed', 'schema 执行成功。');
    }
    catch (error) {
        return createCheck('SCHEMA_EXECUTED', 'failed', error instanceof Error ? error.message : `schema 执行失败：${schemaDirectoryPath}`);
    }
}
export function createStartupService(options) {
    const { database, workspacePaths } = options;
    const schemaDirectoryPath = options.schemaDirectoryPath ?? resolveSchemaDirectoryPath(workspacePaths.rootPath);
    ensureStartupReportTable(database);
    return {
        getLatestStartupReport() {
            const reportJson = readLatestReportRow(database);
            if (reportJson === undefined) {
                return undefined;
            }
            return JSON.parse(reportJson);
        },
        async runSelfCheck() {
            const configResult = await readLocalConfig(workspacePaths);
            const config = configResult.config;
            const configReadableCheck = configResult.readable;
            const configValidCheck = createCheck('CONFIG_VALID', config ? 'passed' : 'failed', config
                ? '本地配置结构校验通过。'
                : `本地配置结构校验失败：${workspacePaths.localConfigPath}`);
            const workspaceRootCheck = checkWorkspaceRoot(config);
            const fixedDirectoriesCheck = await checkFixedDirectories(workspacePaths);
            const runtimeDatabaseCheck = checkRuntimeDatabase(database);
            const schemaExecutedCheck = await checkSchemaExecuted(database, schemaDirectoryPath);
            const checks = [
                configReadableCheck,
                configValidCheck,
                workspaceRootCheck,
                fixedDirectoriesCheck,
                runtimeDatabaseCheck,
                schemaExecutedCheck,
            ];
            const result = {
                status: createStartupStatus(checks),
                checks,
            };
            writeLatestReportRow(database, toStartupReport(result));
            return result;
        },
    };
}
//# sourceMappingURL=service.js.map