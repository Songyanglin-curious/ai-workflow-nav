import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PromptDetail, PromptSummary } from '../../../../shared/prompts';
import { usePromptsModule } from './usePromptsModule';

const api = vi.hoisted(() => ({
  listPrompts: vi.fn(),
  getPrompt: vi.fn(),
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
  deletePrompt: vi.fn(),
}));

vi.mock('./api', () => api);

function createPromptSummary(overrides: Partial<PromptSummary> = {}): PromptSummary {
  return {
    id: '018f2f4e-6f84-7cc2-8d55-4ec8df75e111',
    name: '提示词 A',
    description: '说明',
    tags: 'tag',
    category: 'cat',
    createdAt: '2026-04-13T00:00:00.000Z',
    updatedAt: '2026-04-13T00:00:00.000Z',
    ...overrides,
  };
}

function createPromptDetail(overrides: Partial<PromptDetail> = {}): PromptDetail {
  return {
    ...createPromptSummary(),
    content: 'prompt-content',
    ...overrides,
  };
}

describe('usePromptsModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初始化时会读取列表并自动选中首个 Prompt', async () => {
    api.listPrompts.mockResolvedValue([
      createPromptSummary(),
      createPromptSummary({
        id: '018f2f4e-6f84-7cc2-8d55-4ec8df75e222',
        name: '提示词 B',
      }),
    ]);
    api.getPrompt.mockResolvedValue(createPromptDetail());

    const module = usePromptsModule();

    await module.initialize();

    expect(api.listPrompts).toHaveBeenCalledWith({
      keyword: undefined,
      category: undefined,
    });
    expect(api.getPrompt).toHaveBeenCalledWith('018f2f4e-6f84-7cc2-8d55-4ec8df75e111');
    expect(module.promptCount.value).toBe(2);
    expect(module.selectedPromptId.value).toBe('018f2f4e-6f84-7cc2-8d55-4ec8df75e111');
    expect(module.selectedPrompt.value?.content).toBe('prompt-content');
  });

  it('创建保存成功后会关闭编辑器并刷新列表', async () => {
    api.listPrompts.mockResolvedValue([createPromptSummary()]);
    api.createPrompt.mockResolvedValue(
      createPromptDetail({
        id: '018f2f4e-6f84-7cc2-8d55-4ec8df75e333',
        name: '新提示词',
      }),
    );

    const module = usePromptsModule();

    module.openCreate();
    await module.savePrompt({
      name: '新提示词',
      description: '新的说明',
      tags: '',
      category: '',
      content: 'new-content',
    });

    expect(api.createPrompt).toHaveBeenCalledWith({
      name: '新提示词',
      description: '新的说明',
      tags: '',
      category: '',
      content: 'new-content',
    });
    expect(api.listPrompts).toHaveBeenCalledTimes(1);
    expect(module.editorOpen.value).toBe(false);
    expect(module.selectedPromptId.value).toBe('018f2f4e-6f84-7cc2-8d55-4ec8df75e333');
    expect(module.selectedPrompt.value?.name).toBe('新提示词');
  });
});
