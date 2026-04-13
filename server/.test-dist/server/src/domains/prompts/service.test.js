import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolvePromptPath } from '../../infra/workspace/index.js';
import { createTestContext } from '../../test/test-context.js';
import { PromptValidationFailedError } from './errors.js';
import { createPromptService } from './service.js';
test('PromptService 会写入正文文件并返回详情内容', async () => {
    const context = await createTestContext();
    try {
        const service = createPromptService(context.database, context.workspacePaths);
        const createdPrompt = await service.createPrompt({
            name: '提示词 A',
            description: '说明',
            content: 'hello prompt',
        });
        const savedContent = await readFile(resolvePromptPath(context.workspacePaths, `${createdPrompt.name}__${createdPrompt.id.replaceAll('-', '').slice(0, 8)}.md`), 'utf8');
        const detail = await service.getPromptById(createdPrompt.id);
        assert.equal(savedContent, 'hello prompt');
        assert.equal(detail.id, createdPrompt.id);
        assert.equal(detail.content, 'hello prompt');
        assert.equal(detail.description, '说明');
    }
    finally {
        await context.cleanup();
    }
});
test('PromptService 会拒绝系统保留名', async () => {
    const context = await createTestContext();
    try {
        const service = createPromptService(context.database, context.workspacePaths);
        await assert.rejects(async () => service.createPrompt({ name: 'CON' }), (error) => {
            assert.ok(error instanceof PromptValidationFailedError);
            assert.match(error.message, /系统保留名/);
            return true;
        });
    }
    finally {
        await context.cleanup();
    }
});
//# sourceMappingURL=service.test.js.map