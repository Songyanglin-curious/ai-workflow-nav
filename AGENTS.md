# AGENTS.md

本文件定义本仓库内 AI 协作的长期公共约束。除非用户在当前对话中明确覆盖，否则后续任务默认遵守本文件。

## 1. 目标

- 为 AI 提供稳定的实现边界、风格约束与执行规则
- 降低不同轮次、不同代理之间的理解偏差
- 让实现、审查、补丁与任务推进都基于同一套规则

## 2. 仓库说明

当前仓库骨架如下：

```text
ai-workflow-nav/
├─ docs/       # 设计文档、系统设计、模块设计、接口契约、代码组织
├─ shared/     # 前后端共享契约层
├─ server/     # 后端实现
├─ web/        # 前端实现
├─ sql/        # 数据库 schema 与表结构 SQL
├─ AGENTS.md   # AI 公共约束
└─ TASKS.md    # 项目任务清单
```

## 3. 文档真相源

默认按以下顺序理解设计与实现边界：

1. 当前用户明确确认过的最新要求
2. `docs/个人AI工作流导航器-系统设计-v1.1.md`
3. `docs/个人AI工作流导航器-模块设计-v1.md`
4. `docs/个人AI工作流导航器-代码文件组织.md`
5. `docs/接口与数据契约-v1/`
6. `docs/个人AI工作流导航器-数据库表结构设计-v1.md`
7. `docs/个人AI工作流导航器-技术路线与技术选型-v1.md`

补充规则：

- 代码落点、目录边界优先遵守 `代码文件组织.md`
- 行为语义、模块职责优先遵守系统设计与模块设计
- API 与字段语义优先遵守接口契约与 SQL
- 发现文档冲突时，不允许自行折中实现，必须先指出冲突再处理

## 4. 全局实现原则

- 遵循“先模块，后功能”
- 优先按责任主干拆分，不优先按 `types / mappers / utils` 这类支撑物分类
- 不为了“形式整齐”制造空文件、空抽象、空目录
- 不提前抽象未来能力，只实现当前设计已经确定的边界
- 一个文件应能用一句话说清主题；说不清时再继续拆分
- `index.ts` 默认只作为跨模块边界的统一出口，模块内部默认不通过 `index.ts` 相互导入

## 5. 编码风格约束

### 5.1 注释

- 注释统一使用中文
- 只写帮助理解结构、意图、边界的注释
- 不写“把变量赋值给变量”这类低信息注释

### 5.2 错误处理

- 禁止防御性编程
- 错误就是错误，应显式暴露出来
- 不允许通过默认值、静默 fallback、吞错、模糊返回值来掩盖问题
- 不允许为了“程序继续跑”而偷偷改写设计语义
- 如果上层需要兜底，必须由明确模块负责，且语义在设计中已存在

### 5.3 代码可读性

- 主体逻辑前置，放在最突出的位置
- 不把真正的主流程埋进多层 helper 或回调
- 变量名、函数名、类型名不要过长
- 不要为了命名绝对精准而让名字变得拗口难读
- 命名应优先可读、稳定、易扫视

### 5.4 抽象与复用

- 只有出现稳定复用再抽公共层
- 不为了“未来可能复用”提前做公共抽象
- 不把业务语义下沉到基础设施层
- 不把过程语义混回资源 CRUD

## 6. 前后端边界

### 6.1 `shared/`

- 根目录 `shared/` 是前后端共享契约层
- 只放 DTO、请求体、响应体、统一错误语义、稳定枚举与常量
- 不放前端组件
- 不放后端 repo、service、文件系统、数据库逻辑

### 6.2 `server/`

- `domains/` 承接稳定资源与稳定配置
- `processes/` 承接显式过程型能力
- `infra/` 只承接基础设施能力，不承接业务语义
- `http/` 只承接协议适配
- `app/` 只承接装配与启动

### 6.3 `web/`

- 技术栈固定为：`Vue 3 + Vite + Vue Router + Pinia + @vue-flow/core + mermaid + Naive UI`
- `pages/` 只做页面装配
- `modules/` 承接业务模块语义
- `runtime/` 只承接前端本地运行时状态，不承接服务端真值
- `web/src/shared/` 只承接前端内部共享能力，不与根目录 `shared/` 混用

## 7. 已确认的关键项目约束

- `project-deletion` 是独立 process，不并回 `projects/service.ts`
- `project-node-deletion` 是独立 process，不并回 `project-nodes/service.ts`
- `infra/workspace` 负责工作区根、固定目录、相对路径解析与允许根目录校验
- `infra/tools` 只保留注册表读取与执行器
- `external-tools` 负责工具路由、安全校验、参数拼装与统一调用结果
- `deleteProjectNodeWorkflowByNodeId(projectNodeId)` 是 ProjectNode 工作流解绑的明确 repo 方法
- `ProjectNode` 错误模型必须包含 `ParentProjectNodeNotFound` 与 `ProjectNodeCycleDetected`
- `workflow-runtime-actions` 复用 `WorkflowNodeActionNotFound`，不新造平行错误
- `deliberations.csv` 与 `summaries.csv` 在导入时缺失即失败，内容非法也失败，不允许导入阶段补建
- 前端 `workflow runtime actions` 挂在 `web/src/modules/projects/project-nodes/runtime-actions/`
- 前端 `ProjectCanvas.vue` 是主工作区唯一画布中心
- 前端 `ProjectNodeSidebarTree.vue` 是左侧结构列表，不与主画布形成双中心
- 前端 `settings` 当前只按展示/摘要页处理，不预设完整编辑流程

## 8. 任务执行规则

- 默认以 `TASKS.md` 作为项目任务推进清单
- 执行任务时应先确认前置依赖已满足
- 一次只推进一个主任务；若拆子任务，应在同一任务上下文内完成
- 完成任务后应同步更新相关文档与任务状态；测试默认按 `TASKS.md` 的测试阶段集中补齐，除非某任务明确要求同步补测试
- 未经用户要求，不擅自扩展范围
- 遇到以下情况必须暂停并说明：
  - 设计文档之间存在冲突
  - 当前任务需要用户做产品决策
  - 现有代码与已确认设计正面冲突且无法安全兼容

## 9. 交付要求

- 改动应尽量小而完整
- 修改后应能说明：为什么这样放、为什么不放到别处
- 若实现落点偏离 `代码文件组织.md`，必须先回改文档再落代码
- 若发现任务清单本身缺依赖或顺序不合理，应先补任务再执行

## 10. 环境排障入口

- 若是新机器从 GitHub 同步仓库后准备联调，且问题集中在 `local.config.jsonc`、`better-sqlite3` 绑定、SQLite 运行库或 `startup self-check`，优先参考 `docs/Windows环境排障-better-sqlite3绑定与启动自检.md`
- 这类问题默认先按文档中的“基础环境 -> 本地配置 -> 原生绑定 -> 源码入口自检”顺序排查，不要直接把 `dist` 入口报错当作机器环境结论
