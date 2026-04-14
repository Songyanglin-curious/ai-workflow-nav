
**推荐规范**

```txt
src/
  app/
    router/
      index.ts                 # 路由实例创建
      routes.ts                # 路由表定义
      guards.ts                # 路由守卫（鉴权、重定向）
    providers/
      pinia.ts                 # Pinia 初始化
      i18n.ts                  # 全局 provider 初始化
    layouts/
      DefaultLayout.vue        # 应用级布局
      BlankLayout.vue

  pages/
    prompt/
      PromptPage.vue # 路由页面入口，只负责组装页面
      components/              # 当前页面专属组件，不跨页面复用
        PromptSidebar.vue
        PromptSearchBar.vue
        PromptList.vue
        PromptListItem.vue
        PromptDetailPanel.vue
        PromptMetaForm.vue
        PromptActionBar.vue
        PromptDeleteDialog.vue
      composables/
        usePromptPage.ts   # 页面编排逻辑
      types.ts                 # 当前页面领域类型
      constants.ts             # 当前页面常量
      mock.ts                  # 可选，页面级 mock 数据
      adapters.ts              # 可选，接口数据转页面模型

  components/
    ui/
      BaseButton.vue           # 纯展示、弱业务、可全局复用
      BaseInput.vue
      BaseTagInput.vue
      BaseSelect.vue
      BaseDialog.vue
      BaseEmpty.vue
      BaseSection.vue
    shared/
      PageHeader.vue           # 跨页面复用，但带轻业务语义
      TwoPaneLayout.vue
      SearchToolbar.vue
      ConfirmDialog.vue

  services/
    prompt.service.ts          # API 请求、数据读写、后端交互
    http.ts                    # 可选，请求实例封装
    types.ts                   # 可选，接口 DTO 类型

  stores/
    prompt.store.ts            # Pinia store，全局/跨组件共享状态
    app.store.ts               # 可选，全局 UI 状态

  utils/
    clipboard.ts               # 无状态纯函数
    fileName.ts
    guards.ts

  types/
    global.d.ts                # 可选，全局类型声明
```

**每层职责**

- `app/`: 应用启动层，只放“应用壳”能力，不放业务代码。
- `pages/`: 路由页面目录。一个目录对应一个页面或一个页面域。
- `pages/*/components`: 只给当前页面用，别的页面不要直接依赖。
- `pages/*/composables`: 页面级状态编排、交互流程、事件处理。
- `components/ui`: 基础组件，重点是通用、稳定、低业务含义。
- `components/shared`: 共享业务组件，有语义，但可跨多个页面复用。
- `services/`: 负责请求、持久化、数据装配，不负责页面交互。
- `stores/`: 负责跨组件共享状态，不把所有临时状态都塞进去。
- `utils/`: 纯函数工具，不依赖 Vue 实例、不持有业务状态。

**核心边界**

- 页面组件可以调用 `composables`、`store`、`service`。
- `service` 不要依赖 Vue 组件，也不要直接操作 DOM。
- `store` 不要写成“第二个 service 层”；请求逻辑可以调 service，但不要在每个 action 里堆复杂转换。
- `ui` 组件不要 import `stores/` 或 `services/`。
- `shared` 组件尽量通过 `props` / `emits` 交互，不要偷偷耦合某个页面 store。
- `utils` 不要放业务判断；明显属于 prompt 领域的判断，放回 `pages/prompt-management/`。

**命名规范**

- 页面：`XxxPage.vue`
- 布局：`XxxLayout.vue`
- 基础组件：`BaseXxx.vue`
- 共享组件：`XxxPanel.vue`、`XxxToolbar.vue`、`XxxDialog.vue`
- composable：`useXxx.ts`
- store：`xxx.store.ts`
- service：`xxx.service.ts`
- 类型：页面内放 `types.ts`，跨模块通用类型再放 `src/types/`
