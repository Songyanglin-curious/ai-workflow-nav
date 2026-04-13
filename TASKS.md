# TASKS.md

本文件是当前项目的全量实现任务清单。目标是让 AI 可以按顺序连续推进，而不需要每一步重新理解设计。

当前状态约定：

- `[ ]` 未开始
- `[-]` 进行中
- `[x]` 已完成
- `[!]` 阻塞

执行规则：

- 默认按编号顺序推进
- 非必要不跳任务
- 若任务依赖未满足，不得强行执行
- 完成任务后应更新任务状态与相关文档；测试默认按后续测试阶段集中补齐，除非某任务明确要求同步补测试
- 当前文件先用于任务规划，不代表已经开始执行

## 阶段 A：基础骨架与共享契约

### [x] T001 建立 `shared/common` 基础契约

- 目标：建立共享基础类型、统一响应结构、通用错误结构
- 主要范围：`shared/common/`
- 依赖：无
- 完成标准：`primitives.ts / response.ts / errors.ts / index.ts` 成形并与契约文档对齐

### [x] T002 建立 `shared/prompts` 契约

- 目标：落 Prompt 资源的 DTO、请求、响应、错误契约
- 主要范围：`shared/prompts/`
- 依赖：`T001`
- 完成标准：与 Prompt 资源 API 契约一致

### [x] T003 建立 `shared/workflows` 契约

- 目标：落 Workflow、节点动作绑定、运行时动作契约
- 主要范围：`shared/workflows/`
- 依赖：`T001`
- 完成标准：覆盖 Workflow CRUD、node-actions、runtime-actions

### [x] T004 建立 `shared/projects` 契约

- 目标：落 Project、Solution 相关共享契约
- 主要范围：`shared/projects/`
- 依赖：`T001`
- 完成标准：覆盖 Project、Solution 资源与关系语义

### [x] T005 建立 `shared/project-nodes` 契约

- 目标：落 ProjectNode 资源共享契约
- 主要范围：`shared/project-nodes/`
- 依赖：`T001`
- 完成标准：覆盖列表、详情、创建、更新、关系校验与错误语义

### [x] T006 建立 `shared/deliberations` 契约

- 目标：落 deliberations 目录信息、文件列表、追加、新建契约
- 主要范围：`shared/deliberations/`
- 依赖：`T001`
- 完成标准：与 deliberations 内容契约一致

### [x] T007 建立 `shared/summaries` 契约

- 目标：落 summaries 目录信息、文件列表契约
- 主要范围：`shared/summaries/`
- 依赖：`T001`
- 完成标准：与 summaries 内容契约一致

### [x] T008 建立 `shared/imports-exports` 契约

- 目标：落导入导出 manifest、结果与错误契约
- 主要范围：`shared/imports-exports/`
- 依赖：`T001`
- 完成标准：与导入导出契约一致，包含严格缺文件失败语义

### [x] T009 建立 `shared/inspections` 契约

- 目标：落巡检项、巡检结果、严重级别契约
- 主要范围：`shared/inspections/`
- 依赖：`T001`
- 完成标准：可支撑 inspections process 与前端展示

### [x] T010 建立 `shared/startup` 契约

- 目标：落启动自检、初始化与报告契约
- 主要范围：`shared/startup/`
- 依赖：`T001`
- 完成标准：可支撑 startup process 与前端启动报告页

## 阶段 B0：工程化底座对齐

### [x] T010A 对齐 `server` 工程化底座

- 目标：补齐 `server` 的包配置、脚本与基础开发运行约束
- 主要范围：`server/package.json` 及其直接关联配置
- 依赖：无
- 完成标准：`server` 具备明确的开发、构建、类型检查与测试入口；不再停留在占位脚本状态

### [x] T010B 对齐 `web` 工程化底座

- 目标：补齐 `web` 的包配置、Vue/Vite 基础依赖、脚本与基础开发运行约束
- 主要范围：`web/package.json`、必要时连同根工作区脚本与相关配置一起调整
- 依赖：无
- 完成标准：`web` 具备明确的开发、构建、类型检查与测试入口；Vue/Vite 基础依赖齐全，能支撑后续模块实现

## 阶段 B：后端基础设施与启动骨架

### [x] T011 建立 `server/src/infra/db`

- 目标：落数据库 client、transaction、migration、errors
- 主要范围：`server/src/infra/db/`
- 依赖：`T010A`
- 完成标准：可支撑 repo 层读写与事务传递

### [x] T012 建立 `server/src/infra/filesystem`

- 目标：落通用文件与目录操作能力
- 主要范围：`server/src/infra/filesystem/`
- 依赖：无
- 完成标准：只接收已解析且已校验路径，不承接业务推导

### [x] T013 建立 `server/src/infra/workspace`

- 目标：落 workspace root、固定目录、路径解析、允许根目录校验
- 主要范围：`server/src/infra/workspace/`
- 依赖：无
- 完成标准：可为 filesystem、imports-exports、external-tools 提供受约束路径能力

### [x] T014 建立 `server/src/infra/tools`

- 目标：落工具注册表与执行器
- 主要范围：`server/src/infra/tools/`
- 依赖：无
- 完成标准：只保留 registry + executor，不混入业务路由

### [x] T015 建立 `server/src/infra/config`

- 目标：落配置读取、结构校验与访问入口
- 主要范围：`server/src/infra/config/`
- 依赖：无
- 完成标准：不扩张为配置 accessor 大全

### [x] T016 建立 `server/src/app`

- 目标：落 bootstrap、container、app errors
- 主要范围：`server/src/app/`
- 依赖：`T011` `T012` `T013` `T014` `T015`
- 完成标准：实现“先检查、后监听”的启动骨架

### [x] T017 建立 `server/src/http` 骨架

- 目标：落 routes、handlers、schema、presenter、error-mapper
- 主要范围：`server/src/http/`
- 依赖：`T016`
- 完成标准：HTTP 仅作协议适配，不承接业务规则

## 阶段 C：后端领域模块

### [x] T018 实现 `domains/prompts`

- 目标：完成 Prompt repo、service、errors
- 主要范围：`server/src/domains/prompts/`
- 依赖：`T011` `T012` `T013` `T002`
- 完成标准：Prompt CRUD + 文件路径规则闭合

### [x] T019 实现 `domains/workflows`

- 目标：完成 Workflow repo、service、errors
- 主要范围：`server/src/domains/workflows/`
- 依赖：`T011` `T003`
- 完成标准：Workflow CRUD 与 mermaidSource 读写闭合

### [x] T020 实现 `domains/workflows/node-actions`

- 目标：完成节点动作绑定 repo、service、errors
- 主要范围：`server/src/domains/workflows/node-actions/`
- 依赖：`T019` `T003`
- 完成标准：绑定读取、创建、更新、删除、同步闭合

### [x] T021 实现 `domains/projects`

- 目标：完成 Project repo、service、errors
- 主要范围：`server/src/domains/projects/`
- 依赖：`T011` `T004`
- 完成标准：Project 基础资源 CRUD 闭合，不含删除保护

### [x] T022 实现 `domains/projects/project-nodes`

- 目标：完成 ProjectNode repo、service、errors
- 主要范围：`server/src/domains/projects/project-nodes/`
- 依赖：`T021` `T005`
- 完成标准：节点 CRUD、关系校验、解绑 repo 方法闭合，包含 `deleteProjectNodeWorkflowByNodeId`

### [x] T023 实现 `domains/projects/view-config`

- 目标：完成节点布局与视角配置资源
- 主要范围：`server/src/domains/projects/view-config/`
- 依赖：`T021` `T011`
- 完成标准：布局与 viewport 读写闭合

### [x] T024 实现 `domains/projects/deliberations`

- 目标：完成 deliberations 目录信息、文件列表、追加、新建
- 主要范围：`server/src/domains/projects/deliberations/`
- 依赖：`T021` `T012` `T013` `T006`
- 完成标准：GET 不修复，写前可补齐

### [x] T025 实现 `domains/projects/summaries`

- 目标：完成 summaries 目录信息与文件列表
- 主要范围：`server/src/domains/projects/summaries/`
- 依赖：`T021` `T012` `T013` `T007`
- 完成标准：目录信息与文件列表闭合，不提前引入自动写入动作

### [x] T026 实现 `domains/solutions`

- 目标：完成 Solution repo、service、errors
- 主要范围：`server/src/domains/solutions/`
- 依赖：`T011` `T004`
- 完成标准：Solution CRUD 与 Project 归属关系闭合

## 阶段 D：后端过程模块

### [x] T027 实现 `processes/project-deletion`

- 目标：完成 Project 删除检查、执行、二次确认与后续清理
- 主要范围：`server/src/processes/project-deletion/`
- 依赖：`T021` `T022` `T024` `T025` `T012` `T013`
- 完成标准：不并回 `projects/service.ts`

### [x] T028 实现 `processes/project-node-deletion`

- 目标：完成 ProjectNode 删除检查、执行、二次确认与目录/磁盘处理
- 主要范围：`server/src/processes/project-node-deletion/`
- 依赖：`T022` `T024` `T025` `T012` `T013`
- 完成标准：覆盖 summaryArchives 转存、子节点提升、排序重排、目录与磁盘删除

### [x] T029 实现 `processes/external-tools`

- 目标：完成工具路由匹配、安全校验、参数拼装与统一调用
- 主要范围：`server/src/processes/external-tools/`
- 依赖：`T013` `T014` `T015`
- 完成标准：不把业务语义下沉到 `infra/tools`

### [x] T030 实现 `processes/imports-exports`

- 目标：完成导入导出流程、manifest 校验、严格缺文件失败
- 主要范围：`server/src/processes/imports-exports/`
- 依赖：`T011` `T012` `T013` `T008`
- 完成标准：`deliberations.csv` / `summaries.csv` 缺失即失败

### [x] T031 实现 `processes/inspections`

- 目标：完成巡检执行与结果汇总
- 主要范围：`server/src/processes/inspections/`
- 依赖：`T011` `T012` `T013` `T009`
- 完成标准：输出统一巡检结果结构

### [x] T032 实现 `processes/startup`

- 目标：完成启动自检、初始化、阻断报告
- 主要范围：`server/src/processes/startup/`
- 依赖：`T011` `T012` `T013` `T015` `T010`
- 完成标准：启动检查结果可被 `app/bootstrap.ts` 直接使用

### [x] T033 实现 `processes/workflow-runtime-actions`

- 目标：完成 `projectNodeId + mermaidNodeId` 上下文下的运行时动作读取与执行
- 主要范围：`server/src/processes/workflow-runtime-actions/`
- 依赖：`T018` `T019` `T020` `T022` `T029`
- 完成标准：复用 `WorkflowNodeActionNotFound`，不新造平行错误

## 阶段 E：后端 HTTP 接口接线

### [x] T034 接入 Prompt HTTP 路由

- 目标：把 Prompt 领域能力暴露到 HTTP
- 主要范围：`server/src/http/` 对应 prompts 路由与 handler
- 依赖：`T017` `T018`
- 完成标准：Prompt 资源接口可用

### [x] T035 接入 Workflow 与 NodeActions HTTP 路由

- 目标：把 Workflow 与节点动作绑定能力暴露到 HTTP
- 主要范围：`server/src/http/` 对应 workflows 路由与 handler
- 依赖：`T017` `T019` `T020`
- 完成标准：Workflow CRUD 与 node-actions 接口可用

### [x] T036 接入 Project 与 ProjectNode HTTP 路由

- 目标：把 Project、ProjectNode、view-config、deliberations、summaries 能力暴露到 HTTP
- 主要范围：`server/src/http/` 对应 projects 路由与 handler
- 依赖：`T017` `T021` `T022` `T023` `T024` `T025`
- 完成标准：主工作区所需资源接口可用

### [x] T037 接入 Solution HTTP 路由

- 目标：把 Solution 与归属关系能力暴露到 HTTP
- 主要范围：`server/src/http/` 对应 solutions 路由与 handler
- 依赖：`T017` `T026`
- 完成标准：Solution 资源接口可用

### [x] T038 接入过程型 HTTP 路由

- 目标：把 project-deletion、project-node-deletion、imports-exports、inspections、startup、runtime-actions 暴露到 HTTP
- 主要范围：`server/src/http/` 对应 process routes/handlers/schema/presenter
- 依赖：`T017` `T027` `T028` `T030` `T031` `T032` `T033`
- 完成标准：所有显式过程接口闭合

### [x] T039 完成服务端启动接线

- 目标：完成 `app -> startup -> http` 装配与启动
- 主要范围：`server/src/app/`
- 依赖：`T034` `T035` `T036` `T037` `T038`
- 完成标准：后端能以正式启动顺序运行

## 阶段 F：前端基础骨架

### [x] T040 建立 `web/src/app`

- 目标：落 `main.ts / App.vue / bootstrap.ts / router.ts / routes.ts / plugins.ts / error-handler.ts`
- 主要范围：`web/src/app/`
- 依赖：`T010B`
- 完成标准：前端应用能启动，路由表为唯一真相源

### [x] T041 建立 `web/src/runtime`

- 目标：落会话态、UI 态、filters、本地持久恢复
- 主要范围：`web/src/runtime/`
- 依赖：`T040`
- 完成标准：`runtime` 与模块 store 边界清晰，不承接服务端真值

### [x] T042 建立 `web/src/shared`

- 目标：落 HTTP client、响应拆包、错误映射、共享 UI、通用 composables
- 主要范围：`web/src/shared/`
- 依赖：`T040`
- 完成标准：不与根目录 `shared/` 混层

### [x] T043 建立 `web/src/pages`

- 目标：落页面级装配骨架
- 主要范围：`web/src/pages/`
- 依赖：`T040`
- 完成标准：页面只做装配，不直接写业务主干逻辑

## 阶段 G：前端业务模块

### [x] T044 实现 `modules/prompts`

- 目标：完成 Prompt 列表、编辑、详情、删除交互
- 主要范围：`web/src/modules/prompts/`
- 依赖：`T034` `T042` `T043`
- 完成标准：Prompt 页面闭合

### [x] T045 实现 `modules/workflows`

- 目标：完成 Workflow 列表、编辑、Mermaid 预览、删除交互
- 主要范围：`web/src/modules/workflows/`
- 依赖：`T035` `T042` `T043`
- 完成标准：Workflow 页面闭合

### [x] T046 实现 `modules/workflows/node-actions`

- 目标：完成节点动作绑定列表、编辑、同步交互
- 主要范围：`web/src/modules/workflows/node-actions/`
- 依赖：`T045`
- 完成标准：node-actions 页面区域闭合

### [x] T047 实现 `modules/projects` 基础资源区块

- 目标：完成项目列表、切换、标题区等基础交互
- 主要范围：`web/src/modules/projects/`
- 依赖：`T036` `T042` `T043`
- 完成标准：Project 主资源前端闭合，不含删除保护

### [x] T048 实现 `modules/projects/deletion`

- 目标：完成 Project 删除检查、二次确认、执行交互
- 主要范围：`web/src/modules/projects/deletion/`
- 依赖：`T038` `T047`
- 完成标准：删除流程独立于 `projects/api.ts`

### [x] T049 实现 `modules/projects/project-nodes`

- 目标：完成节点侧边树、节点详情、节点编辑与模块 store
- 主要范围：`web/src/modules/projects/project-nodes/`
- 依赖：`T036` `T041` `T047`
- 完成标准：`activeProjectNodeId` 在 runtime，模块 store 承接详情/编辑态

### [x] T050 实现 `modules/projects/project-nodes/deletion`

- 目标：完成节点删除检查、二次确认、执行交互
- 主要范围：`web/src/modules/projects/project-nodes/deletion/`
- 依赖：`T038` `T049`
- 完成标准：节点删除保护前端流程闭合

### [x] T051 实现 `modules/projects/project-nodes/runtime-actions`

- 目标：完成项目节点运行时动作详情展示与触发交互
- 主要范围：`web/src/modules/projects/project-nodes/runtime-actions/`
- 依赖：`T038` `T049`
- 完成标准：挂在 `project-nodes` 下，不挂在 `workflows` 下

### [x] T052 实现 `modules/projects/view-config`

- 目标：完成主画布、视角控制与视图配置读写
- 主要范围：`web/src/modules/projects/view-config/`
- 依赖：`T036` `T041` `T047` `T049`
- 完成标准：`ProjectCanvas.vue` 为唯一主画布；组件管交互，composable 管持久化策略

### [x] T053 实现 `modules/projects/deliberations`

- 目标：完成推敲记录面板、文件列表、追加、新建交互
- 主要范围：`web/src/modules/projects/deliberations/`
- 依赖：`T036` `T049`
- 完成标准：与 deliberations 契约一致

### [x] T054 实现 `modules/projects/summaries`

- 目标：完成总结面板与文件列表展示
- 主要范围：`web/src/modules/projects/summaries/`
- 依赖：`T036` `T049`
- 完成标准：当前只实现目录与文件列表展示

### [x] T055 实现 `modules/solutions`

- 目标：完成 Solution 列表、编辑、Project 绑定交互
- 主要范围：`web/src/modules/solutions/`
- 依赖：`T037` `T042` `T043`
- 完成标准：Solution 页面闭合

### [ ] T056 实现 `modules/system/inspections`

- 目标：完成巡检执行与结果展示
- 主要范围：`web/src/modules/system/inspections/`
- 依赖：`T038` `T042` `T043`
- 完成标准：巡检页面闭合

### [ ] T057 实现 `modules/system/sync`

- 目标：完成导入导出交互与结果展示
- 主要范围：`web/src/modules/system/sync/`
- 依赖：`T038` `T042` `T043`
- 完成标准：同步页面闭合

### [ ] T058 实现 `modules/system/startup`

- 目标：完成启动报告与手动自检页面交互
- 主要范围：`web/src/modules/system/startup/`
- 依赖：`T038` `T042` `T043`
- 完成标准：启动报告页面闭合

### [ ] T059 实现 `modules/system/settings`

- 目标：完成设置页展示与工具配置摘要展示
- 主要范围：`web/src/modules/system/settings/`
- 依赖：`T042` `T043`
- 完成标准：只做展示页，不预设独立 `settings/api.ts`
- 数据来源边界：只允许复用既有系统级接口返回的可展示摘要；若无正式数据来源，则先完成静态展示壳，不自行发明 `settings` 读取接口

## 阶段 H：联调、测试与收口

### [ ] T060 建立 SQL 初始化与迁移验证链路

- 目标：验证 SQL schema、表结构与运行时数据库初始化可用
- 主要范围：`sql/` `server/src/infra/db/`
- 依赖：`T011`
- 完成标准：表结构可按既定顺序落库

### [ ] T061 补齐服务端单元测试

- 目标：为 domains、processes、http schema/presenter 补测试
- 主要范围：`server/`
- 依赖：`T018` 至 `T039`
- 完成标准：主链路与关键错误语义有测试覆盖

### [ ] T062 补齐前端模块测试

- 目标：为关键模块状态、主要页面交互与组件边界补测试
- 主要范围：`web/`
- 依赖：`T040` 至 `T059`
- 完成标准：核心页面主链路可验证

### [ ] T063 完成最小可运行联调

- 目标：跑通 Prompt、Workflow、Project、ProjectNode、RuntimeActions 主链路
- 主要范围：`server/` `web/`
- 依赖：`T039` `T044` `T045` `T046` `T047` `T049` `T051` `T052`
- 完成标准：核心工作区可完成从数据到交互的最小闭环

### [ ] T064 完成过程型能力联调

- 目标：跑通 deletion、imports-exports、inspections、startup 主链路
- 主要范围：`server/` `web/`
- 依赖：`T038` `T048` `T050` `T056` `T057` `T058`
- 完成标准：显式过程能力可从页面触达并闭合

### [ ] T065 完成文档回写与实现收口

- 目标：把实现过程中确认的细节回写到文档，并清理偏差
- 主要范围：`docs/`
- 依赖：`T061` `T062` `T063` `T064`
- 完成标准：设计文档、任务清单、实际代码三者一致

## 当前建议执行顺序

建议按以下顺序推进：

1. `T001` 至 `T010`
2. `T010A` 至 `T010B`
3. `T011` 至 `T017`
4. `T018` 至 `T026`
5. `T027` 至 `T033`
6. `T034` 至 `T039`
7. `T040` 至 `T043`
8. `T044` 至 `T059`
9. `T060` 至 `T065`

## 当前不做的事

- 不在任务清单阶段提前进入实现
- 不在契约未定时发明额外资源 API
- 不为了“可能以后会用”提前引入抽象层
- 不把过程型动作回并到基础 CRUD
