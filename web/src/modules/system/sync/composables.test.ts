import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSystemSync } from './composables';

const api = vi.hoisted(() => ({
  exportSync: vi.fn(),
  importSync: vi.fn(),
}));

vi.mock('./api', () => api);

describe('useSystemSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('执行导出后会记录最后一次结果', async () => {
    api.exportSync.mockResolvedValue({
      exported: true,
      manifestFile: 'dbSyncs/manifest.json',
      exportedFileCount: 13,
    });

    const sync = useSystemSync();

    await sync.executeExport();

    expect(sync.exportLoading.value).toBe(false);
    expect(sync.exportError.value).toBeNull();
    expect(sync.hasRecord.value).toBe(true);
    expect(sync.lastRecord.value?.kind).toBe('export');
    if (sync.lastRecord.value?.kind !== 'export') {
      throw new Error('最后一次记录不是导出结果。');
    }
    expect(sync.lastRecord.value.result.exportedFileCount).toBe(13);
  });

  it('执行导入失败时会保留错误信息', async () => {
    api.importSync.mockRejectedValue(new Error('导入失败'));

    const sync = useSystemSync();

    await sync.executeImport();

    expect(api.importSync).toHaveBeenCalledWith({
      mode: 'rebuild',
    });
    expect(sync.importLoading.value).toBe(false);
    expect(sync.importError.value).toBe('导入失败');
    expect(sync.lastRecord.value).toBeNull();
  });
});
