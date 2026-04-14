# AGENTS.md

本文件定义 `web/` 前端协作规则。除非当前任务明确覆盖，否则默认遵守本规范。

## 目录规则

- 前端代码位于 `web/src`
- 页面模块优先放在 `src/pages/*`
- 应用壳能力放在 `src/app/*`
- 请求放在 `src/services/*`
- Pinia 状态放在 `src/stores/*`

## Vue 与 Naive UI 规则

- 优先使用 `naive-ui` 组件，不要重复造一套同功能基础组件
- 在模板中统一使用 kebab-case 组件标签，如 `n-config-provider`、`n-button`、`n-input`
- 不要在模板里使用 `NConfigProvider` 这类 PascalCase Naive UI 标签风格
- 图标按钮默认配合 tooltip 使用；高频危险操作必须可一眼识别
- 删除类操作统一使用红色语义，并使用中文二次确认文案

## 样式规则

- 可复用的颜色、圆角、间距、字号优先提取到全局样式变量或共享 theme tokens
- 禁止在页面里散落大量硬编码颜色和间距；新增样式先判断能否复用
- Naive UI 主题覆盖统一从共享 theme 文件读取，不在页面内长期内联维护大对象
- 页面整体风格保持紧凑、对齐、高信息密度
- 最外层背景默认使用米黄色系，内容面板使用浅色中性底
- 列表和工具栏优先采用小尺寸控件、图标按钮和简短文案

## 命名规则

- 页面：`XxxPage.vue`
- 组合逻辑：`useXxx.ts`
- Store：`xxx.store.ts`
- Service：`xxx.service.ts`
- 页面类型：`types.ts`
- 页面常量或 mock：`constants.ts`、`mock.ts`

## 交付要求

- 优先做小而完整的改动
- 新增样式能力时，同时补充到共享变量或 theme
- 如果实现了新的 UI 约束，需要同步更新本文件
