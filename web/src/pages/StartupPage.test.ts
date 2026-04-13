import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StartupPage from './StartupPage.vue';

const api = vi.hoisted(() => ({
  getStartupReport: vi.fn(),
  runSelfCheck: vi.fn(),
}));

vi.mock('../modules/system/startup/api.js', () => api);

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
}

describe('StartupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('挂载后会读取启动报告', async () => {
    api.getStartupReport.mockResolvedValue({
      startupStatus: 'ready',
      checks: [],
    });

    const wrapper = mount(StartupPage, {
      global: {
        stubs: {
          NAlert: {
            template: '<div><slot /></div>',
          },
          NButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          NTag: {
            template: '<span><slot /></span>',
          },
          NSpin: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    await flushPromises();

    expect(api.getStartupReport).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('ready');
  });

  it('执行手动自检后会再次刷新报告', async () => {
    api.getStartupReport
      .mockResolvedValueOnce({
        startupStatus: 'failed',
        checks: [],
      })
      .mockResolvedValueOnce({
        startupStatus: 'ready',
        checks: [],
      });
    api.runSelfCheck.mockResolvedValue({
      status: 'ready',
      checks: [],
    });

    const wrapper = mount(StartupPage, {
      global: {
        stubs: {
          NAlert: {
            template: '<div><slot /></div>',
          },
          NButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          NTag: {
            template: '<span><slot /></span>',
          },
          NSpin: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    await flushPromises();
    await wrapper.getComponent({ name: 'SelfCheckButton' }).vm.$emit('trigger');
    await flushPromises();

    expect(api.runSelfCheck).toHaveBeenCalledTimes(1);
    expect(api.getStartupReport).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('最近一次手动自检：已满足启动条件');
  });
});
