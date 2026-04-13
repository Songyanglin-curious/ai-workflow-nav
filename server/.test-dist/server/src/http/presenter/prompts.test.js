import assert from 'node:assert/strict';
import test from 'node:test';
import { promptDeleteResponseSchema, promptListResponseSchema } from '../schema/prompts.js';
import { presentPromptDeleteEnvelope, presentPromptListEnvelope } from './prompts.js';
test('Prompt presenter 输出符合统一成功响应壳', () => {
    const envelope = presentPromptListEnvelope([
        {
            id: '018f2f4e-6f84-7cc2-8d55-4ec8df75e111',
            name: '提示词 A',
            description: '说明',
            tags: 'tag',
            category: 'cat',
            createdAt: '2026-04-13T00:00:00.000Z',
            updatedAt: '2026-04-13T00:00:00.000Z',
        },
    ]);
    assert.deepEqual(promptListResponseSchema.parse(envelope), envelope);
    assert.deepEqual(envelope.meta, {});
});
test('Prompt presenter 删除响应符合 result 语义', () => {
    const envelope = presentPromptDeleteEnvelope();
    assert.deepEqual(promptDeleteResponseSchema.parse(envelope), envelope);
    assert.deepEqual(envelope.data.result, { deleted: true });
});
//# sourceMappingURL=prompts.test.js.map