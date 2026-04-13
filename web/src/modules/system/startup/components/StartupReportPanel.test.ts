import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StartupReportPanel from './StartupReportPanel.vue';

describe('StartupReportPanel', () => {
  it('没有报告时显示空状态', () => {
    const wrapper = mount(StartupReportPanel, {
      props: {
        report: null,
      },
      global: {
        stubs: {
          NAlert: true,
          NTag: true,
          NSpin: true,
        },
      },
    });

    expect(wrapper.text()).toContain('还没有启动报告');
  });

  it('有报告时会展示状态统计和检查项', () => {
    const wrapper = mount(StartupReportPanel, {
      props: {
        report: {
          startupStatus: 'ready',
          checks: [
            {
              checkType: 'CONFIG_VALID',
              status: 'passed',
              message: '本地配置结构校验通过。',
            },
            {
              checkType: 'FIXED_DIRECTORIES_READY',
              status: 'fixed',
              message: '固定目录已自动创建并就绪。',
            },
            {
              checkType: 'SCHEMA_EXECUTED',
              status: 'failed',
              message: 'schema 执行失败。',
            },
          ],
        },
        selfCheckResult: {
          status: 'ready',
          checks: [],
        },
      },
      global: {
        stubs: {
          NAlert: {
            template: '<div><slot /></div>',
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

    expect(wrapper.text()).toContain('已满足启动条件');
    expect(wrapper.text()).toContain('通过');
    expect(wrapper.text()).toContain('已修复');
    expect(wrapper.text()).toContain('失败');
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('配置结构合法');
    expect(wrapper.text()).toContain('Schema 已执行');
    expect(wrapper.text()).toContain('最近一次手动自检：已满足启动条件');
  });
});
