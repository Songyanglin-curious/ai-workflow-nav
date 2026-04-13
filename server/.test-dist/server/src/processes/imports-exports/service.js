import { ensureDirectory, pathExists, readTextFile, writeTextFile } from '../../infra/filesystem/index.js';
import { resolveSyncPath } from '../../infra/workspace/index.js';
import { ImportsExportsInternalError, ImportsExportsValidationError } from './errors.js';
import { parseCsvRecords, stringifyCsvRows } from './csv.js';
const syncVersion = 1;
const syncManifestFileName = 'manifest.json';
const requiredTableSpecs = [
    {
        fileName: 'prompts.csv',
        columns: ['id', 'name', 'description', 'tags', 'category', 'content_file_path', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO prompts (
        id,
        name,
        description,
        tags,
        category,
        content_file_path,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @name,
        @description,
        @tags,
        @category,
        @content_file_path,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        name,
        description,
        tags,
        category,
        content_file_path,
        created_at,
        updated_at
      FROM prompts
      ORDER BY id ASC
    `,
    },
    {
        fileName: 'workflows.csv',
        columns: ['id', 'name', 'description', 'tags', 'category', 'mermaid_source', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO workflows (
        id,
        name,
        description,
        tags,
        category,
        mermaid_source,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @name,
        @description,
        @tags,
        @category,
        @mermaid_source,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        name,
        description,
        tags,
        category,
        mermaid_source,
        created_at,
        updated_at
      FROM workflows
      ORDER BY id ASC
    `,
    },
    {
        fileName: 'workflow_node_actions.csv',
        columns: ['id', 'workflow_id', 'mermaid_node_id', 'action_type', 'target_ref', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO workflow_node_actions (
        id,
        workflow_id,
        mermaid_node_id,
        action_type,
        target_ref,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @workflow_id,
        @mermaid_node_id,
        @action_type,
        @target_ref,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        workflow_id,
        mermaid_node_id,
        action_type,
        target_ref,
        created_at,
        updated_at
      FROM workflow_node_actions
      ORDER BY workflow_id ASC, mermaid_node_id ASC
    `,
    },
    {
        fileName: 'projects.csv',
        columns: ['id', 'name', 'description', 'tags', 'category', 'folder_path', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO projects (
        id,
        name,
        description,
        tags,
        category,
        folder_path,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @name,
        @description,
        @tags,
        @category,
        @folder_path,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        name,
        description,
        tags,
        category,
        folder_path,
        created_at,
        updated_at
      FROM projects
      ORDER BY id ASC
    `,
    },
    {
        fileName: 'project_nodes.csv',
        columns: ['id', 'project_id', 'name', 'description', 'status', 'folder_path', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO project_nodes (
        id,
        project_id,
        name,
        description,
        status,
        folder_path,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @project_id,
        @name,
        @description,
        @status,
        @folder_path,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_id,
        name,
        description,
        status,
        folder_path,
        created_at,
        updated_at
      FROM project_nodes
      ORDER BY id ASC
    `,
    },
    {
        fileName: 'project_node_relations.csv',
        columns: ['id', 'project_id', 'parent_project_node_id', 'child_project_node_id', 'sort_order', 'created_at'],
        insertSql: `
      INSERT INTO project_node_relations (
        id,
        project_id,
        parent_project_node_id,
        child_project_node_id,
        sort_order,
        created_at
      ) VALUES (
        @id,
        @project_id,
        @parent_project_node_id,
        @child_project_node_id,
        @sort_order,
        @created_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_id,
        parent_project_node_id,
        child_project_node_id,
        sort_order,
        created_at
      FROM project_node_relations
      ORDER BY project_id ASC, child_project_node_id ASC
    `,
        columnKinds: {
            parent_project_node_id: 'nullableText',
            sort_order: 'integer',
        },
    },
    {
        fileName: 'project_node_workflows.csv',
        columns: ['id', 'project_node_id', 'workflow_id', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO project_node_workflows (
        id,
        project_node_id,
        workflow_id,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @project_node_id,
        @workflow_id,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_node_id,
        workflow_id,
        created_at,
        updated_at
      FROM project_node_workflows
      ORDER BY project_node_id ASC
    `,
    },
    {
        fileName: 'project_node_layouts.csv',
        columns: ['id', 'project_node_id', 'position_x', 'position_y', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO project_node_layouts (
        id,
        project_node_id,
        position_x,
        position_y,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @project_node_id,
        @position_x,
        @position_y,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_node_id,
        position_x,
        position_y,
        created_at,
        updated_at
      FROM project_node_layouts
      ORDER BY project_node_id ASC
    `,
        columnKinds: {
            position_x: 'number',
            position_y: 'number',
        },
    },
    {
        fileName: 'project_viewports.csv',
        columns: ['id', 'project_id', 'viewport_x', 'viewport_y', 'zoom', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO project_viewports (
        id,
        project_id,
        viewport_x,
        viewport_y,
        zoom,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @project_id,
        @viewport_x,
        @viewport_y,
        @zoom,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_id,
        viewport_x,
        viewport_y,
        zoom,
        created_at,
        updated_at
      FROM project_viewports
      ORDER BY project_id ASC
    `,
        columnKinds: {
            viewport_x: 'number',
            viewport_y: 'number',
            zoom: 'number',
        },
    },
    {
        fileName: 'solutions.csv',
        columns: ['id', 'name', 'description', 'tags', 'category', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO solutions (
        id,
        name,
        description,
        tags,
        category,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @name,
        @description,
        @tags,
        @category,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        name,
        description,
        tags,
        category,
        created_at,
        updated_at
      FROM solutions
      ORDER BY id ASC
    `,
    },
    {
        fileName: 'solution_projects.csv',
        columns: ['id', 'solution_id', 'project_id', 'sort_order', 'created_at'],
        insertSql: `
      INSERT INTO solution_projects (
        id,
        solution_id,
        project_id,
        sort_order,
        created_at
      ) VALUES (
        @id,
        @solution_id,
        @project_id,
        @sort_order,
        @created_at
      )
    `,
        selectSql: `
      SELECT
        id,
        solution_id,
        project_id,
        sort_order,
        created_at
      FROM solution_projects
      ORDER BY solution_id ASC, sort_order ASC, project_id ASC
    `,
        columnKinds: {
            sort_order: 'integer',
        },
    },
    {
        fileName: 'deliberations.csv',
        columns: ['id', 'project_node_id', 'folder_path', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO deliberations_records (
        id,
        project_node_id,
        folder_path,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @project_node_id,
        @folder_path,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_node_id,
        folder_path,
        created_at,
        updated_at
      FROM deliberations_records
      ORDER BY project_node_id ASC
    `,
    },
    {
        fileName: 'summaries.csv',
        columns: ['id', 'project_node_id', 'folder_path', 'created_at', 'updated_at'],
        insertSql: `
      INSERT INTO summary_records (
        id,
        project_node_id,
        folder_path,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @project_node_id,
        @folder_path,
        @created_at,
        @updated_at
      )
    `,
        selectSql: `
      SELECT
        id,
        project_node_id,
        folder_path,
        created_at,
        updated_at
      FROM summary_records
      ORDER BY project_node_id ASC
    `,
    },
];
const requiredSyncFiles = requiredTableSpecs.map((spec) => spec.fileName);
const requiredFileSet = new Set(requiredSyncFiles);
function createTimestamp() {
    return new Date().toISOString();
}
function asCsvText(rows, columns) {
    const csvRows = [columns, ...rows.map((row) => columns.map((column) => String(row[column] ?? '')))];
    return `${stringifyCsvRows(csvRows)}\n`;
}
function normalizeImportedValue(column, value, kind) {
    if (kind === 'nullableText') {
        return value === '' ? null : value;
    }
    if (kind === 'integer') {
        const parsedValue = Number(value);
        if (!Number.isInteger(parsedValue)) {
            throw new ImportsExportsValidationError(`CSV 字段不是整数：${column}`);
        }
        return parsedValue;
    }
    if (kind === 'number') {
        const parsedValue = Number(value);
        if (Number.isNaN(parsedValue)) {
            throw new ImportsExportsValidationError(`CSV 字段不是数字：${column}`);
        }
        return parsedValue;
    }
    return value;
}
function buildInsertParameters(spec, record) {
    return Object.fromEntries(spec.columns.map((column) => [column, normalizeImportedValue(column, record[column], spec.columnKinds?.[column])]));
}
function clearDatabase(database) {
    const deleteStatements = [
        'DELETE FROM workflow_node_actions',
        'DELETE FROM project_node_workflows',
        'DELETE FROM project_node_layouts',
        'DELETE FROM project_viewports',
        'DELETE FROM project_node_relations',
        'DELETE FROM deliberations_records',
        'DELETE FROM summary_records',
        'DELETE FROM solution_projects',
        'DELETE FROM project_nodes',
        'DELETE FROM prompts',
        'DELETE FROM workflows',
        'DELETE FROM projects',
        'DELETE FROM solutions',
    ];
    for (const statement of deleteStatements) {
        database.prepare(statement).run();
    }
}
function checkManifest(manifestText) {
    const parsedManifest = JSON.parse(manifestText);
    if (typeof parsedManifest !== 'object' ||
        parsedManifest === null ||
        typeof parsedManifest.version !== 'number' ||
        typeof parsedManifest.exportedAt !== 'string' ||
        !Array.isArray(parsedManifest.files) ||
        !parsedManifest.files.every((fileName) => typeof fileName === 'string')) {
        throw new ImportsExportsValidationError('manifest.json 内容不合法。');
    }
    const manifest = {
        version: parsedManifest.version,
        exportedAt: parsedManifest.exportedAt,
        files: [...parsedManifest.files],
    };
    if (manifest.version !== syncVersion) {
        throw new ImportsExportsValidationError(`manifest.json 版本不支持：${manifest.version}`);
    }
    return manifest;
}
function assertRequiredFiles(manifest, availableFileNames) {
    const missingFileNames = requiredSyncFiles.filter((fileName) => !availableFileNames.has(fileName));
    if (missingFileNames.length > 0) {
        throw new ImportsExportsValidationError(`缺少必需同步文件：${missingFileNames.join(', ')}`);
    }
    if (!manifest.files.every((fileName) => requiredFileSet.has(fileName))) {
        throw new ImportsExportsValidationError('manifest.json 中存在不支持的文件列表。');
    }
}
export function createImportsExportsProcess(database, workspacePaths) {
    return {
        async exportSync() {
            await ensureDirectory(workspacePaths.syncDirectoryPath);
            for (const spec of requiredTableSpecs) {
                const rows = database.prepare(spec.selectSql).all();
                const csvText = asCsvText(rows, spec.columns);
                await writeTextFile(resolveSyncPath(workspacePaths, spec.fileName), csvText);
            }
            const manifest = {
                version: syncVersion,
                exportedAt: createTimestamp(),
                files: requiredSyncFiles,
            };
            await writeTextFile(resolveSyncPath(workspacePaths, syncManifestFileName), `${JSON.stringify(manifest, null, 2)}\n`);
            return {
                exported: true,
                manifestFile: `dbSyncs/${syncManifestFileName}`,
                exportedFileCount: requiredSyncFiles.length,
            };
        },
        async importSync(mode) {
            if (mode !== 'rebuild') {
                throw new ImportsExportsValidationError(`不支持的导入模式：${mode}`);
            }
            const availableFileNames = new Set();
            for (const fileName of requiredSyncFiles) {
                const absoluteFilePath = resolveSyncPath(workspacePaths, fileName);
                if (!(await pathExists(absoluteFilePath))) {
                    throw new ImportsExportsValidationError(`缺少必需同步文件：${fileName}`);
                }
                availableFileNames.add(fileName);
            }
            const manifestPath = resolveSyncPath(workspacePaths, syncManifestFileName);
            if (!(await pathExists(manifestPath))) {
                throw new ImportsExportsValidationError('缺少必需同步文件：manifest.json');
            }
            const manifest = checkManifest(await readTextFile(manifestPath));
            assertRequiredFiles(manifest, availableFileNames);
            const csvTexts = new Map();
            for (const spec of requiredTableSpecs) {
                csvTexts.set(spec.fileName, await readTextFile(resolveSyncPath(workspacePaths, spec.fileName)));
            }
            try {
                database.pragma('foreign_keys = OFF');
                database.transaction(() => {
                    clearDatabase(database);
                    for (const spec of requiredTableSpecs) {
                        const csvText = csvTexts.get(spec.fileName);
                        if (csvText === undefined) {
                            throw new ImportsExportsValidationError(`缺少必需同步文件：${spec.fileName}`);
                        }
                        const records = parseCsvRecords(csvText, spec.columns);
                        const statement = database.prepare(spec.insertSql);
                        for (const record of records) {
                            statement.run(buildInsertParameters(spec, record));
                        }
                    }
                    const foreignKeyViolations = database.prepare('PRAGMA foreign_key_check').all();
                    if (foreignKeyViolations.length > 0) {
                        throw new ImportsExportsValidationError('导入后的外键校验未通过。');
                    }
                })();
            }
            catch (error) {
                if (error instanceof ImportsExportsValidationError) {
                    throw error;
                }
                throw new ImportsExportsInternalError('导入过程失败。', error);
            }
            finally {
                database.pragma('foreign_keys = ON');
            }
            return {
                imported: true,
                mode: 'rebuild',
            };
        },
    };
}
//# sourceMappingURL=service.js.map