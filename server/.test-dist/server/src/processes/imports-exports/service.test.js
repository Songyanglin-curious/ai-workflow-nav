import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import test from 'node:test';
import { resolveSyncPath } from '../../infra/workspace/index.js';
import { createTestContext } from '../../test/test-context.js';
import { ImportsExportsValidationError } from './errors.js';
import { createImportsExportsProcess } from './service.js';
test('ImportsExportsProcess 支持空库导出后再导入', async () => {
    const context = await createTestContext();
    try {
        const process = createImportsExportsProcess(context.database, context.workspacePaths);
        const exportResult = await process.exportSync();
        const manifestText = await readFile(resolveSyncPath(context.workspacePaths, 'manifest.json'), 'utf8');
        const manifest = JSON.parse(manifestText);
        const importResult = await process.importSync('rebuild');
        assert.equal(exportResult.exported, true);
        assert.equal(exportResult.exportedFileCount, 13);
        assert.ok(manifest.files.includes('summaries.csv'));
        assert.deepEqual(importResult, {
            imported: true,
            mode: 'rebuild',
        });
    }
    finally {
        await context.cleanup();
    }
});
test('ImportsExportsProcess 在缺少 summaries.csv 时导入失败', async () => {
    const context = await createTestContext();
    try {
        const process = createImportsExportsProcess(context.database, context.workspacePaths);
        await process.exportSync();
        await rm(resolveSyncPath(context.workspacePaths, 'summaries.csv'));
        await assert.rejects(async () => process.importSync('rebuild'), (error) => {
            assert.ok(error instanceof ImportsExportsValidationError);
            assert.match(error.message, /summaries\.csv/);
            return true;
        });
    }
    finally {
        await context.cleanup();
    }
});
//# sourceMappingURL=service.test.js.map