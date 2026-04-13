import assert from 'node:assert/strict';
import test from 'node:test';
import { ZodError } from 'zod';

import {
  createPromptBodySchema,
  promptParamsSchema,
  updatePromptBodySchema,
} from './prompts.js';

test('Prompt HTTP schema 会裁剪合法输入', () => {
  const body = createPromptBodySchema.parse({
    name: '  提示词 A  ',
    description: '说明',
  });
  const patch = updatePromptBodySchema.parse({
    name: '  提示词 B  ',
  });

  assert.equal(body.name, '提示词 A');
  assert.equal(patch.name, '提示词 B');
});

test('Prompt HTTP schema 会拒绝非法 UUID 参数', () => {
  assert.throws(
    () => promptParamsSchema.parse({ id: 'not-a-uuid' }),
    ZodError,
  );
});
