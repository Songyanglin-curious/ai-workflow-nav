# 个人AI工作流导航器-代码文件组织

## 1. 目标

本文件用于定义代码文件组织的稳定骨架，服务以下三个目标：

- 固化仓库级、模块级、文件级边界
- 为后续实现、重构与审查提供统一参照
- 为 AI 任务拆分提供可直接落地的模块责任基础

## 2. 总原则

### 2.1 仓库级原则

- 一级目录按运行边界拆分：`docs / sql / shared / web / server`
- 前后端共享契约统一落在根目录 `shared/`，不与 `web/src/shared/` 混用

### 2.2 模块级原则

- 整体组织遵循“先模块，后功能”
- 只有当某个模块明显膨胀时，才允许继续向下拆分
- 当模块出现独立责任分叉时，优先拆子模块，不优先增加支撑性文件
- 命名与落点未敲定的能力，必须显式标记为“待定”，不能以半悬空状态写入结构

### 2.3 文件级原则

- 文件级拆分优先按责任主干进行，而不是优先按 `types / mapper / utils` 这类支撑物分类
- 文件是否继续拆分，优先看是否还能用一句话说清主题，而不是只看文件长度
- `index.ts` 默认只作为跨模块边界的统一出口；模块内部默认不通过 `index.ts` 相互导入

### 2.4 “先模块，后功能”的具体含义

- 推荐：`prompts/errors`、`projects/dto`、`workflows/requests`
- 不推荐：`errors/prompts`、`dto/projects`、`requests/workflows`

## 3. 仓库骨架

```text
ai-workflow-nav/
├─ docs/                        # 设计文档、接口契约、模块边界、任务说明
│  ├─ 个人AI工作流导航器-系统设计-v1.1.md
│  ├─ 个人AI工作流导航器-模块设计-v1.md
│  ├─ 个人AI工作流导航器-数据库表结构设计-v1.md
│  ├─ 个人AI工作流导航器-代码文件组织.md
│  └─ 接口与数据契约-v1/
├─ sql/                         # 数据库结构、迁移、初始化 SQL
├─ shared/                      # 前后端共享契约层
├─ web/                         # 前端代码
├─ server/                      # 后端代码
├─ package.json
├─ pnpm-workspace.yaml
└─ README.md
```

## 4. `shared`

### 4.1 定位

`shared` 是前后端共享契约层，只承接双方共同认知且需要保持一致的内容。

适合放：

- DTO
- 请求体与响应体类型
- 通用响应结构
- 错误码与错误响应语义
- 前后端共享的稳定枚举与常量

不应放：

- 数据库访问逻辑
- 文件系统操作逻辑
- 服务编排逻辑
- React 组件或前端专属 hooks
- Node 专属运行时代码

### 4.2 模块结构

```text
shared/
├─ common/              # 跨领域基础契约
├─ prompts/             # Prompt 领域共享契约
├─ workflows/           # Workflow 领域共享契约
├─ projects/            # Project / Solution 领域共享契约
├─ project-nodes/       # ProjectNode 领域共享契约
├─ deliberations/       # deliberations 契约
├─ summaries/           # summaries 契约
├─ inspections/         # 巡检契约
├─ imports-exports/     # 导入导出契约
└─ startup/             # 启动自检 / 初始化契约
```

模块覆盖范围：

- `prompts`：Prompt 资源契约
- `workflows`：Workflow、节点动作绑定、运行时动作契约
- `projects`：Project、Solution 契约
- `project-nodes`：ProjectNode 契约
- `deliberations`：`deliberations` 目录信息、文件列表、追加写入契约
- `summaries`：`summaries` 目录信息、文件列表契约
- `inspections`：巡检项、巡检结果、严重级别、执行结果契约
- `imports-exports`：导入导出 `manifest`、导入结果、导出结果契约
- `startup`：启动自检、初始化、修复报告契约
- `common`：无法稳定归属单一领域的跨领域基础契约

### 4.3 领域模块内部规则

除 `common` 外，所有 `shared` 领域模块统一采用：

```text
shared/<module>/
├─ index.ts
├─ dto.ts
├─ requests.ts
├─ responses.ts
└─ errors.ts
```

职责约定：

- `dto.ts`：该领域核心 DTO
- `requests.ts`：该领域请求体类型
- `responses.ts`：该领域响应载荷类型，不重复定义统一顶层响应壳
- `errors.ts`：该领域特有错误码或错误语义
- `index.ts`：跨模块边界的统一导出入口

补充约束：

- 通用错误结构与跨领域错误语义不放在各领域 `errors.ts`
- 领域模块默认不继续增加下一级目录
- 模块内部默认不通过 `index.ts` 相互导入

### 4.4 `shared/common`

`common` 是跨领域基础层，不采用业务模块式的 `dto / requests / responses / errors` 拆法。

```text
shared/common/
├─ index.ts
├─ primitives.ts
├─ response.ts
└─ errors.ts
```

职责约定：

- `primitives.ts`：基础类型与基础字段语义
- `response.ts`：统一成功响应、统一错误响应等顶层响应结构
- `errors.ts`：通用错误结构、通用错误码、校验错误项结构
- `index.ts`：跨模块边界的统一导出入口

当前明确不设置：

- `pagination.ts`

## 5. `server`

### 5.1 划分依据

`server` 仍然遵循“先模块，后功能”，但模块划分优先按责任边界，而不是按技术类型。

判断一个能力归属时，当前采用以下标准：

- 是否是稳定业务对象或稳定业务配置
- 是否具备独立生命周期
- 是否能脱离父对象独立存在
- 是否会被跨多个对象复用
- 父对象删除时是否必须一起清理
- 它更像资源本体，还是过程执行

### 5.2 总体结构

```text
server/
└─ src/
   ├─ app/
   ├─ http/
   ├─ domains/
   ├─ processes/
   └─ infra/
```

### 5.3 `domains`

`domains` 承接稳定业务对象与稳定业务配置。

归属规则：

- 单一资源的 CRUD 与其自身规则归 `domains`
- 不能因为“有关系”就合并模块
- 是否归并，应看生命周期、独立存在性、复用性、附着性

当前结构倾向：

```text
domains/
├─ prompts/
├─ workflows/
├─ projects/
│  ├─ project-nodes/
│  ├─ view-config/
│  ├─ deliberations/
│  └─ summaries/
└─ solutions/
```

归属说明：

- `prompts`：独立存在、可复用，属于独立 domain
- `workflows`：独立存在、可复用，属于独立 domain
- `projects`：核心父域
- `project-nodes`：强附着于 `projects`
- `view-config`：项目级配置，强附着于 `projects`
- `deliberations`：强附着于 `project-nodes`
- `summaries`：强附着于 `project-nodes`
- `solutions`：当前更偏独立 domain，而不是 `projects` 的从属子域

#### 5.3.1 `prompts` 模块定稿

`server/src/domains/prompts/` 当前定稿为：

```text
server/src/domains/prompts/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`service.ts` 职责：

- 承接 Prompt 领域主干业务逻辑
- 协调 `repo.ts` 与 `infra/filesystem` 完成单领域内一致性操作
- 承接存在性判断、受唯一约束字段或路径冲突判断、基础字段校验
- 承接 Prompt 正文文件的路径规则与生命周期规则
- 返回领域结果或共享契约对象
- 不处理 HTTP 请求解析、统一响应壳映射、SQL 细节、跨 domain 编排、通用文件系统实现

`repo.ts` 职责：

- 仅承接 Prompt 领域的持久化读写与具体条件查询
- 不提供抽象字段驱动的万能查询方法

当前保留的最小方法集：

- `listPrompts(query)`
- `getPromptById(id)`
- `getPromptByFilePath(filePath)`
- `createPrompt(record)`
- `updatePrompt(record)`
- `deletePromptById(id)`
- `promptFilePathExists(filePath)`

当前不默认加入：

- `getPromptByName(name)`
- `promptNameExists(name)`

`errors.ts` 职责：

- 只承接 Prompt 领域稳定且明确的错误语义

当前保留的最小错误集：

- `PromptNotFound`
- `PromptFilePathConflict`
- `PromptValidationFailed`
- `PromptFileMissing`

当前不默认加入：

- `PromptNameConflict`
- `PromptFileWriteFailed`
- `PromptFileDeleteFailed`

`index.ts` 职责：

- 作为 `prompts` 模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的领域错误
- 不直接暴露 `repo.ts` 与模块内部私有细节

#### 5.3.2 `workflows` 模块定稿

`server/src/domains/workflows/` 当前定稿为：

```text
server/src/domains/workflows/
├─ index.ts
├─ service.ts
├─ repo.ts
├─ errors.ts
└─ node-actions/
   ├─ index.ts
   ├─ service.ts
   ├─ repo.ts
   └─ errors.ts
```

`workflows/service.ts` 职责：

- 承接 Workflow 本体主干业务逻辑
- 负责 Workflow 列表、详情、创建、更新、删除
- 承接 Workflow 本体范围内的存在性判断、基础字段校验、已确认约束冲突判断
- 不负责节点动作绑定的日常 CRUD 细节
- 负责 `mermaidSource` 变更时，对 `node-actions` 子模块发起失效绑定清理
- 负责在需要时返回与绑定清理相关的领域结果摘要
- 返回领域结果或共享契约对象
- 不处理 HTTP 请求解析、统一响应壳映射、SQL 细节、跨 domain 编排

`workflows/repo.ts` 职责：

- 只承接 Workflow 本体的持久化读写与具体条件查询
- 不提供抽象字段驱动的万能查询方法

当前保留的最小方法集：

- `listWorkflows(query)`
- `getWorkflowById(id)`
- `createWorkflow(record)`
- `updateWorkflow(record)`
- `deleteWorkflowById(id)`

当前不默认加入：

- 按未确认唯一字段的查询方法
- 与节点动作绑定批量清理相关的方法

`workflows/errors.ts` 职责：

- 只承接 Workflow 本体稳定且明确的错误语义

当前保留的最小错误集：

- `WorkflowNotFound`
- `WorkflowValidationFailed`

`workflows/index.ts` 职责：

- 作为 `workflows` 模块的统一对外出口
- 导出 Workflow 本体 `service.ts` 的公共领域能力
- 导出 Workflow 本体 `errors.ts` 中需要被外部识别的错误
- 导出 `node-actions` 子模块公共能力
- 不直接暴露内部 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

`workflows/node-actions/service.ts` 职责：

- 承接 Workflow 节点动作绑定的主干业务逻辑
- 负责节点动作绑定列表、创建、更新、删除、同步
- 负责基于当前 Workflow 的 `mermaidSource` 节点集合做合法性判断
- 负责动作绑定存在性判断、受约束组合键冲突判断、目标引用基础校验
- 负责 `workflow node action sync`，但该能力仍属于 `workflows` 域内，不提升为顶层 `process`
- 返回领域结果或共享契约对象
- 不处理 HTTP 请求解析、统一响应壳映射、SQL 细节、跨 domain 编排

目标校验依赖来源当前明确如下：

- `Prompt` 目标存在性校验：允许依赖 `domains/prompts` 暴露的只读公共能力
- `tool` 目标存在性校验：允许依赖 `infra/tools` 暴露的工具目标校验能力

`workflows/node-actions/repo.ts` 职责：

- 只承接节点动作绑定的持久化读写与具体条件查询
- 以 `workflowId + mermaidNodeId` 作为天然业务定位键
- 不提供抽象字段驱动的万能查询方法
- 不默认以内部表主键 `id` 作为主入口方法

当前保留的最小方法集：

- `listNodeActionsByWorkflowId(workflowId)`
- `getNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId)`
- `createNodeAction(record)`
- `updateNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId, patch)`
- `deleteNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId)`

当前不默认加入：

- `getNodeActionById(id)`
- `deleteNodeActionsByWorkflowId(workflowId)`

`workflows/node-actions/errors.ts` 职责：

- 只承接节点动作绑定稳定且明确的错误语义
- 保持具体错误语义，不回退到泛化的 `TargetNotFound`
- 直接复用 `domains/prompts` 导出的 `PromptNotFound`，不重复定义同名错误

当前保留的最小错误集：

- `WorkflowNodeActionNotFound`
- `WorkflowNodeActionValidationFailed`
- `WorkflowNodeActionConflict`
- `MermaidNodeNotFound`
- `ToolTargetNotFound`
- `PromptNotFound`（复用 `domains/prompts` 导出的领域错误）

当前不默认加入：

- `WorkflowNodeActionTargetNotFound`

`workflows/node-actions/index.ts` 职责：

- 作为 `node-actions` 子模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

#### 5.3.3 `projects` 模块定稿

`server/src/domains/projects/` 当前定稿为：

```text
server/src/domains/projects/
├─ index.ts
├─ service.ts
├─ repo.ts
├─ errors.ts
├─ project-nodes/
│  ├─ index.ts
│  ├─ service.ts
│  ├─ repo.ts
│  └─ errors.ts
├─ view-config/
│  ├─ index.ts
│  ├─ service.ts
│  ├─ repo.ts
│  └─ errors.ts
├─ deliberations/
│  ├─ index.ts
│  ├─ service.ts
│  ├─ repo.ts
│  └─ errors.ts
└─ summaries/
   ├─ index.ts
   ├─ service.ts
   ├─ repo.ts
   └─ errors.ts
```

`projects/service.ts` 职责：

- 承接 Project 本体主干业务逻辑
- 负责 Project 列表、详情、创建、更新
- 承接 Project 本体范围内的存在性判断、基础字段校验、已确认约束冲突判断
- 协调 `repo.ts` 与 `infra/filesystem` 完成 Project 本体的单领域一致性操作
- 负责 Project 生命周期触发的项目根目录初始化等单领域协调
- 不负责 Project 删除流程
- 不负责 `project-nodes / view-config / deliberations / summaries` 的日常 CRUD 细节
- 不处理 HTTP、SQL 细节、跨 domain 编排

补充边界：

- Project 删除不是普通 domain CRUD
- `deletion-check / deletion-execute / 二次确认 / summaryArchives / 联动清理` 等删除语义，后续应进入独立过程模块处理

`projects/repo.ts` 职责：

- 只承接 Project 本体的持久化读写与具体条件查询
- 不提供抽象字段驱动的万能查询方法

当前保留的最小方法集：

- `listProjects(query)`
- `getProjectById(id)`
- `getProjectByFolderPath(folderPath)`
- `createProject(record)`
- `updateProject(record)`

当前不默认加入：

- `deleteProjectById(id)` 作为 Project 本体默认方法

`projects/errors.ts` 职责：

- 只承接 Project 本体稳定且明确的错误语义

当前保留的最小错误集：

- `ProjectNotFound`
- `ProjectValidationFailed`
- `ProjectFolderPathConflict`

当前不默认加入：

- `ProjectDeleteBlocked`

`projects/index.ts` 职责：

- 作为 `projects` 模块的统一对外出口
- 导出 Project 本体公共能力与错误
- 导出 `project-nodes / view-config / deliberations / summaries` 子模块公共能力
- 不直接暴露内部 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

`projects/project-nodes/service.ts` 职责：

- 承接 ProjectNode 主干业务逻辑
- 负责节点列表、详情、创建、更新
- 负责节点树关系维护
- 负责节点工作流绑定协调
- 协调 `repo.ts` 与 `infra/filesystem` 完成节点级目录初始化
- 保留 `deliberations / summaries` 的初始化协调
- 不承接删除保护流程本身
- 不处理 HTTP、SQL 细节、跨 domain 编排

`projects/project-nodes/repo.ts` 职责：

- 承接 ProjectNode 本体、节点结构关系、节点工作流绑定相关的持久化读写
- 不提供抽象字段驱动的万能查询方法

当前保留的最小方法集应至少覆盖三类持久化责任：

- 节点本体：
  - `listProjectNodesByProjectId(projectId, query)`
  - `getProjectNodeById(id)`
  - `createProjectNode(record)`
  - `updateProjectNode(record)`
- 结构关系：
  - `createProjectNodeRelation(record)`
  - `updateProjectNodeRelation(record)`
  - `getProjectNodeRelationByNodeId(projectNodeId)`
- 工作流绑定：
  - `bindWorkflowToProjectNode(projectNodeId, workflowId)`
  - `updateProjectNodeWorkflow(projectNodeId, workflowId)`
  - `deleteProjectNodeWorkflowByNodeId(projectNodeId)`
  - `getProjectNodeWorkflowByNodeId(projectNodeId)`

补充边界：

- 当前最小方法集不能只覆盖节点表本体 CRUD
- 因为 `project-nodes/service.ts` 已明确承接结构关系维护与节点工作流绑定协调

`projects/project-nodes/errors.ts` 职责：

- 只承接 ProjectNode 稳定且明确的错误语义

当前保留的最小错误集：

- `ProjectNodeNotFound`
- `ParentProjectNodeNotFound`
- `ProjectNodeCycleDetected`
- `ProjectNodeValidationFailed`
- `ProjectNodeRelationInvalid`

`projects/project-nodes/index.ts` 职责：

- 作为 `project-nodes` 子模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

`projects/view-config/service.ts` 职责：

- 承接项目视图配置主干逻辑
- 负责节点布局读取与保存
- 负责项目视角读取与保存
- 不负责前端运行时瞬时状态
- 不处理 HTTP、SQL 细节、跨 domain 编排

`projects/view-config/repo.ts` 当前保留的最小方法集：

- `getProjectLayoutsByProjectId(projectId)`
- `saveProjectLayouts(projectId, layouts)`
- `getProjectViewportByProjectId(projectId)`
- `saveProjectViewport(projectId, viewport)`

`projects/view-config/errors.ts` 当前保留的最小错误集：

- `ProjectViewConfigValidationFailed`
- `ProjectViewportNotFound`

`projects/view-config/index.ts` 职责：

- 作为 `view-config` 子模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

`projects/deliberations/service.ts` 职责：

- 承接 `deliberations` 目录与目录入口记录的主干业务逻辑
- 负责目录信息读取、文件列表、追加到最新文件、手动新建文件
- 协调 `repo.ts` 与 `infra/filesystem` 完成单领域一致性操作
- 负责 `deliberations` 目录路径规则、文件命名规则、最新可写文件判定规则
- 读取路径不触发目录入口补齐或目录补建
- 写入路径在符合契约前提下允许先补齐目录入口与目录
- 不处理 HTTP、跨 domain 编排

`projects/deliberations/repo.ts` 当前保留的最小方法集：

- `getDeliberationsRecordByProjectNodeId(projectNodeId)`
- `createDeliberationsRecord(record)`
- `deleteDeliberationsRecordByProjectNodeId(projectNodeId)`

`projects/deliberations/errors.ts` 当前保留的最小错误集：

- `DeliberationsRecordNotFound`
- `DeliberationsValidationFailed`
- `DeliberationsFileMissing`

`projects/deliberations/index.ts` 职责：

- 作为 `deliberations` 子模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

`projects/summaries/service.ts` 职责：

- 承接 `summaries` 目录与目录入口记录的主干业务逻辑
- 负责目录信息读取、文件列表读取
- 协调 `repo.ts` 与 `infra/filesystem` 完成单领域一致性操作
- 负责 `summaries` 目录路径规则与生命周期规则
- 不处理 HTTP、跨 domain 编排

`projects/summaries/repo.ts` 当前保留的最小方法集：

- `getSummaryRecordByProjectNodeId(projectNodeId)`
- `createSummaryRecord(record)`
- `deleteSummaryRecordByProjectNodeId(projectNodeId)`

`projects/summaries/errors.ts` 当前保留的最小错误集：

- `SummaryRecordNotFound`
- `SummariesValidationFailed`
- `SummaryFileMissing`

`projects/summaries/index.ts` 职责：

- 作为 `summaries` 子模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

#### 5.3.4 `solutions` 模块定稿

`server/src/domains/solutions/` 当前定稿为：

```text
server/src/domains/solutions/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`solutions/service.ts` 职责：

- 承接 `Solution` 本体主干业务逻辑
- 负责 `Solution` 列表、详情、创建、更新、删除
- 承接 `Solution` 本体范围内的存在性判断、基础字段校验、已确认约束冲突判断
- 负责 `Solution` 与 `Project` 关联关系的读取、创建、排序调整、解除
- 返回领域结果或共享契约对象
- 不处理 HTTP、SQL 细节、跨 domain 编排

依赖来源规则：

- `solutions/service.ts` 允许依赖 `domains/projects` 暴露的只读公共能力，用于校验 `Project` 是否存在

边界说明：

- `solution_projects` 关系表当前归 `solutions` 域管理
- `projects/service.ts` 不负责日常维护 `solution_projects`
- 项目删除时对 `solution_projects` 的联动清理，不属于 `solutions/service.ts` 的日常职责

`solutions/repo.ts` 职责：

- 只承接 `Solution` 本体与 `solution_projects` 关联关系的持久化读写
- 不提供抽象字段驱动的万能查询方法

当前保留的最小方法集：

Solution 本体：

- `listSolutions(query)`
- `getSolutionById(id)`
- `createSolution(record)`
- `updateSolution(record)`
- `deleteSolutionById(id)`

Solution 与 Project 关系：

- `listProjectsBySolutionId(solutionId)`
- `listSolutionsByProjectId(projectId)`
- `createSolutionProject(record)`
- `updateSolutionProjectSortOrder(solutionId, projectId, sortOrder)`
- `deleteSolutionProject(solutionId, projectId)`

`solutions/errors.ts` 职责：

- 只承接 `Solution` 领域稳定且明确的错误语义
- 不重复定义 `ProjectNotFound`
- 项目存在性校验失败时，直接复用 `domains/projects` 导出的领域错误

当前保留的最小错误集：

- `SolutionNotFound`
- `SolutionValidationFailed`
- `SolutionProjectRelationConflict`
- `SolutionProjectRelationNotFound`

`solutions/index.ts` 职责：

- 作为 `solutions` 模块的统一对外出口
- 导出 `service.ts` 的公共领域能力
- 导出 `errors.ts` 中需要被外部识别的领域错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

### 5.4 `processes`

`processes` 承接跨领域、多步骤、带一致性和执行语义的过程能力。

进入 `processes` 的典型特征：

- 它不是单一资源的 CRUD
- 它会串联多个对象或多个模块
- 它具有明确执行流程，而不是单次读写
- 它带检查、确认、补偿、恢复、导入、触发、巡检等过程语义

当前正式模块：

- `project-deletion`
- `project-node-deletion`
- `external-tools`
- `imports-exports`
- `inspections`
- `startup`
- `workflow-runtime-actions`

补充判断：

- `workflow node action sync` 已定：归入 `domains/workflows/node-actions/`，不提升为顶层 `process`
- 它虽然不是单一 CRUD，也带有流程性，但当前仍更接近 `workflows` 领域内的动作型能力
- `imports-exports` 已定：作为 `server/processes` 下的正式过程模块命名

#### 5.4.1 `project-deletion` 模块定稿

`server/src/processes/project-deletion/` 当前定稿为：

```text
server/src/processes/project-deletion/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`project-deletion/service.ts` 职责：

- 承接 Project 删除过程主干逻辑
- 负责 `deletion-check`
- 负责 `deletion-execute`
- 负责二次确认语义判断
- 协调 `repo.ts` 与 `infra/filesystem` 完成删除过程中的一致性操作
- 负责 `summaryArchives` 转存流程
- 返回删除检查结果、删除执行结果等过程结果
- 不处理 HTTP 请求解析、统一响应壳映射、底层 SQL 细节、通用文件系统实现

依赖风格：

- 以 `project-deletion/repo.ts` 为主要数据库入口
- 只少量依赖其他 domain 的只读公共能力或可复用错误
- 不深度依赖多个 domain 的写入 service

允许依赖：

- `project-deletion/repo.ts`
- `project-deletion/errors.ts`
- `infra/filesystem`
- `domains/projects` 的只读公共能力
- `domains/projects` 导出的 `ProjectNotFound`
- `shared/common`
- 必要的共享契约类型

不应依赖：

- 多个 domain 的写入 service
- `http`
- `infra/db`

`project-deletion/repo.ts` 职责：

- 承接项目删除过程所需的数据库快照读取与数据库写入语义入口
- 方法名贴着删除过程语义，而不是贴着底层 SQL 细节
- 不提供万能查询方法

当前保留的最小方法集：

删除检查相关：

- `getProjectDeletionSnapshot(projectId)`

归档执行相关：

- `listProjectArchiveTargets(projectId)`

删除执行相关：

- `deleteProjectViewConfig(projectId)`
- `deleteProjectNodeRelationsByProjectId(projectId)`
- `deleteProjectNodeWorkflowsByProjectId(projectId)`
- `deleteProjectNodesByProjectId(projectId)`
- `deleteSolutionProjectsByProjectId(projectId)`
- `deleteProjectById(projectId)`

补充边界：

- 上述方法表示“过程语义入口”，不意味着实现上必须逐条手写 SQL
- 如果后续实现采用数据库级联，repo 内部可以收缩实现，`service.ts` 不必改变

`project-deletion/errors.ts` 职责：

- 只承接项目删除过程稳定且明确的错误语义
- 不重复定义 `ProjectNotFound`
- 项目不存在时，直接复用 `domains/projects` 导出的领域错误

当前保留的最小错误集：

- `ProjectDeletionConfirmationRequired`
- `ProjectDeletionBlocked`
- `ProjectDeletionExecutionFailed`
- `SummaryArchiveFailed`

当前不保留：

- `ProjectDeletionCheckFailed`

`project-deletion/index.ts` 职责：

- 作为 `project-deletion` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

与其他模块的边界：

- `projects/service.ts` 不负责正式项目删除流程
- `project-deletion/service.ts` 才是项目删除检查与删除执行的正式入口
- `summaryArchives` 属于删除过程语义，不属于 `summaries/service.ts` 的日常职责
- `project-deletion` 是典型 `process`，不是 `domain`
- domain 模块在这里主要提供少量只读公共能力与可复用领域错误

#### 5.4.2 `project-node-deletion` 模块定稿

`server/src/processes/project-node-deletion/` 当前定稿为：

```text
server/src/processes/project-node-deletion/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`project-node-deletion/service.ts` 职责：

- 承接 ProjectNode 删除保护过程主干逻辑
- 负责 `deletion-check`
- 负责 `deletion-execute`
- 负责二次确认语义判断
- 负责 `summaryArchives` 转存流程
- 负责直接子节点提升为根层孤岛节点
- 负责根层 `sortOrder` 重排
- 协调 `repo.ts` 与 `infra/filesystem` 完成节点目录入口与磁盘内容删除
- 返回删除检查结果、删除执行结果等过程结果
- 不处理 HTTP 请求解析、统一响应壳映射、底层 SQL 细节、通用文件系统实现

依赖风格：

- 以 `project-node-deletion/repo.ts` 为主要数据库入口
- 只少量依赖其他 domain 的只读公共能力或可复用错误
- 不深度依赖多个 domain 的写入 service

允许依赖：

- `project-node-deletion/repo.ts`
- `project-node-deletion/errors.ts`
- `infra/filesystem`
- `domains/projects/project-nodes` 的只读公共能力
- `domains/projects/project-nodes` 导出的 `ProjectNodeNotFound`
- `domains/projects/summaries` 的只读公共能力
- `shared/common`
- 必要的共享契约类型

不应依赖：

- 多个 domain 的写入 service
- `http`
- `infra/db`

`project-node-deletion/repo.ts` 职责：

- 承接节点删除过程所需的数据库快照读取与数据库写入语义入口
- 方法名贴着删除过程语义，而不是贴着底层 SQL 细节
- 不提供万能查询方法

当前保留的最小方法集：

删除检查相关：

- `getProjectNodeDeletionSnapshot(projectNodeId)`

归档执行相关：

- `listProjectNodeArchiveTargets(projectNodeId)`

删除执行相关：

- `promoteDirectChildrenToRoot(projectNodeId, targetRootSortStart)`
- `deleteProjectNodeWorkflowByNodeId(projectNodeId)`
- `deleteProjectNodeRelationByNodeId(projectNodeId)`
- `deleteDeliberationsRecordByNodeId(projectNodeId)`
- `deleteSummaryRecordByNodeId(projectNodeId)`
- `deleteProjectNodeById(projectNodeId)`

补充边界：

- 上述方法表示“过程语义入口”，不意味着实现上必须逐条手写 SQL
- 如果后续实现采用数据库级联，repo 内部可以收缩实现，`service.ts` 不必改变

`project-node-deletion/errors.ts` 职责：

- 只承接节点删除保护过程稳定且明确的错误语义
- 不重复定义 `ProjectNodeNotFound`
- 节点不存在时，直接复用 `domains/projects/project-nodes` 导出的领域错误

当前保留的最小错误集：

- `ProjectNodeDeletionConfirmationRequired`
- `ProjectNodeDeletionBlocked`
- `ProjectNodeDeletionExecutionFailed`
- `SummaryArchiveFailed`

当前不保留：

- `ProjectNodeDeletionCheckFailed`

`project-node-deletion/index.ts` 职责：

- 作为 `project-node-deletion` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

与其他模块的边界：

- `projects/project-nodes/service.ts` 不负责正式节点删除保护流程
- `project-node-deletion/service.ts` 才是节点删除检查与删除执行的正式入口
- `summaryArchives` 属于删除过程语义，不属于 `summaries/service.ts` 的日常职责
- `project-node-deletion` 是典型 `process`，不是 `domain`
- domain 模块在这里主要提供少量只读公共能力与可复用领域错误

#### 5.4.3 `external-tools` 模块定稿

`server/src/processes/external-tools/` 当前定稿为：

```text
server/src/processes/external-tools/
├─ index.ts
├─ service.ts
├─ resolver.ts
└─ errors.ts
```

`external-tools/service.ts` 职责：

- 承接外部工具调用过程主干逻辑
- 负责工具路由匹配
- 负责动作参数拼装
- 负责相对路径转绝对路径
- 负责执行前路径安全校验
- 协调 `resolver.ts`、`infra/workspace` 与 `infra/tools`
- 返回统一工具调用结果
- 不处理 HTTP 请求解析、统一响应壳映射、底层进程执行细节

依赖风格：

- 以 `resolver.ts` 为工具调用前的过程语义入口
- 通过 `infra/workspace` 完成路径解析与允许根目录校验
- 通过 `infra/tools` 完成工具注册表读取与底层执行

允许依赖：

- `external-tools/resolver.ts`
- `external-tools/errors.ts`
- `infra/workspace`
- `infra/tools`
- `infra/config`
- `shared/common`

不应依赖：

- `http`
- 多个 domain 的写入 service

`external-tools/resolver.ts` 职责：

- 读取工具定义与路由配置
- 根据动作类型选择工具定义与动作配置
- 生成已解析完成的执行输入
- 不直接执行工具

`external-tools/errors.ts` 职责：

- 只承接外部工具调用过程稳定且明确的错误语义
- 不重复定义 `ToolNotFound`
- 工具注册表缺失或工具不存在时，允许复用 `infra/tools` 导出的基础设施错误

当前保留的最小错误集：

- `ToolRouteNotMatched`
- `ToolActionUnsupported`
- `ToolPathResolutionFailed`
- `ToolPathNotAllowed`

`external-tools/index.ts` 职责：

- 作为 `external-tools` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `resolver.ts`
- 模块内部默认不通过 `index.ts` 相互导入

与其他模块的边界：

- `infra/tools` 只负责注册表读取与底层执行
- `external-tools` 才负责路由、安全校验、参数拼装与统一结果表达
- `workflow-runtime-actions` 与其他业务模块只应依赖 `external-tools` 暴露的上层能力，而不是自行实现工具路由逻辑

#### 5.4.4 `imports-exports` 模块定稿

`server/src/processes/imports-exports/` 当前定稿为：

```text
server/src/processes/imports-exports/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`imports-exports/service.ts` 职责：

- 承接全局导出过程
- 承接全局导入过程
- 负责 `manifest` 的生成、读取、校验、解释
- 负责区分必须存在文件与内容合法性校验
- 负责导入前校验
- 负责导入执行
- 协调 `repo.ts` 与 `infra/filesystem`
- 返回导出结果、导入结果等过程结果
- 不处理 HTTP 请求解析、统一响应壳映射、底层 SQL 细节、通用文件系统实现

当前已确认规则：

- `imports-exports` 是全局同步过程，不是项目级过程
- 以系统设计与 `L4-13` 回改后的正式结论为准，`deliberations.csv` 与 `summaries.csv` 属于必须存在文件集合
- 默认零 domain 依赖
- 当前不承接“缺文件后重建目录入口索引”的语义

`imports-exports/repo.ts` 职责：

- 承接全局同步过程所需的数据库快照读取与全局重建写入入口
- 方法优先按全局聚合语义命名
- 不再按 `projectId` 主轴设计
- 不提供万能查询方法

当前保留的最小方法集：

导出相关：

- `getExportSnapshot()`

导入相关：

- `replaceImportSnapshot(payload)`

补充边界：

- `getExportSnapshot()` 返回导出所需的全局快照，至少覆盖：
  - `prompts`
  - `workflows`
  - `workflow_node_actions`
  - `projects`
  - `project_nodes`
  - `project_node_relations`
  - `project_node_workflows`
  - `project_node_layouts`
  - `project_viewports`
  - `solutions`
  - `solution_projects`
  - `deliberations_records`
  - `summary_records`
- `replaceImportSnapshot(payload)` 负责把导入后的全局数据重建进运行时数据库
- repo 可以聚合，但对应的快照结构与 `manifest` 结构必须在 `shared/imports-exports` 中明确写死

`imports-exports/errors.ts` 职责：

- 只承接全局同步过程稳定且明确的错误语义
- 错误语义围绕 `manifest / 必需文件缺失 / 文件内容非法 / 导入执行失败 / 重建失败`
- 不围绕单个项目目标

当前保留的最小错误集：

- `ExportBuildFailed`
- `ImportManifestInvalid`
- `ImportRequiredFileMissing`
- `ImportValidationFailed`
- `ImportExecutionFailed`
- `ImportRebuildFailed`

当前不保留：

- `ExportTargetNotFound`

补充边界：

- `ImportRequiredFileMissing` 只针对真正的必需文件
- `deliberations.csv` 与 `summaries.csv` 同样属于该错误的触发范围

`imports-exports/index.ts` 职责：

- 作为 `imports-exports` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

#### 5.4.5 `inspections` 模块定稿

`server/src/processes/inspections/` 当前定稿为：

```text
server/src/processes/inspections/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`inspections/service.ts` 职责：

- 承接全局巡检过程主干逻辑
- 负责发起巡检执行
- 负责组织巡检范围与巡检项
- 负责汇总巡检结果、严重级别、统计信息
- 协调 `repo.ts`、`infra/filesystem` 与 `infra/tools`
- 返回巡检结果或巡检报告
- 不处理 HTTP、统一响应壳映射、底层 SQL 细节、通用文件系统实现

依赖风格：

- 默认零 domain 依赖
- 默认通过“数据库聚合快照 + 文件系统状态 + 工具定义”完成全局巡检
- 只有极少数规则确实无法脱离某个 domain 稳定只读逻辑时，才按需引入

允许依赖：

- `inspections/repo.ts`
- `inspections/errors.ts`
- `infra/filesystem`
- `infra/tools`
- `shared/inspections`
- `shared/common`

不应依赖：

- 多个 domain 的写入 service
- 默认依赖各 domain 的 service
- `http`
- `infra/db`

`inspections/repo.ts` 职责：

- 承接巡检过程所需的数据库快照读取入口
- 方法贴着巡检过程语义命名
- 不提供万能查询方法

当前保留的最小方法集：

- `getInspectionSnapshot()`

补充边界：

- `getInspectionSnapshot()` 返回巡检所需的全局聚合信息
- 当前至少覆盖：
  - `prompts`
  - `workflows`
  - `workflow_node_actions`
  - `projects`
  - `project_nodes`
  - `project_node_relations`
  - `project_node_workflows`
  - `project_node_layouts`
  - `project_viewports`
  - `solutions`
  - `solution_projects`
  - `deliberations_records`
  - `summary_records`

`inspections/errors.ts` 职责：

- 只承接巡检过程自身稳定且明确的错误语义
- 不吞掉领域错误
- 不把巡检发现的问题误定义成过程异常

当前保留的最小错误集：

- `InspectionExecutionFailed`
- `InspectionSnapshotBuildFailed`

补充边界：

- 巡检项中的 `warning / error` 属于结果数据，不属于 `errors.ts`

`inspections/index.ts` 职责：

- 作为 `inspections` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

#### 5.4.6 `startup` 模块定稿

`server/src/processes/startup/` 当前定稿为：

```text
server/src/processes/startup/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`startup/service.ts` 职责：

- 承接启动自检、初始化、修复边界相关的主干过程逻辑
- 负责启动检查执行
- 负责手动自检执行
- 负责检查项汇总、状态汇总、启动报告生成
- 负责判断哪些问题允许自动创建、哪些允许自动修复、哪些必须阻止启动
- 协调数据库侧聚合状态、文件系统状态、配置状态，汇总为启动结果
- 返回启动检查结果、自检结果、启动报告等过程结果
- 不处理 HTTP 请求解析、统一响应壳映射、底层 SQL 细节、通用文件系统实现

依赖风格：

- 默认零 domain 依赖
- 通过 `repo.ts + infra/workspace + infra/config + infra/db` 完成启动检查
- 只有当确实需要复用某个稳定只读规则时，才按需引入 domain

允许依赖：

- `startup/repo.ts`
- `startup/errors.ts`
- `infra/workspace`
- `infra/filesystem`
- `infra/db`
- `infra/config`
- `shared/startup`
- `shared/common`

不应依赖：

- 多个 domain 的写入 service
- 默认依赖各 domain 的 service
- `http`

`startup/repo.ts` 职责：

- 承接启动检查过程所需的数据库侧聚合状态读取入口
- 方法贴着启动检查语义命名
- 不提供万能查询方法
- 不负责配置、目录、文件、工具定义等非数据库检查

当前保留的最小方法集：

- `getStartupInspectionSnapshot()`

补充边界：

- 该方法只负责数据库侧聚合状态
- 至少覆盖：
  - 核心表是否存在
  - 必要结构是否存在
  - 运行时数据库是否可读写
  - 必要元数据是否齐备

`startup/errors.ts` 职责：

- 只承接启动过程自身稳定且明确的错误语义
- 不把具体检查项结果混入过程错误
- 不把可恢复问题与不可恢复问题混成一类

当前保留的最小错误集：

- `StartupInspectionFailed`
- `StartupBlocked`

补充边界：

- 检查项结果仍然使用既有状态枚举，不新增结果状态值
- `StartupInspectionFailed` 表示过程本身执行失败
- `StartupBlocked` 表示根据检查规则，系统必须阻止启动的过程层错误语义

当前不默认加入：

- `StartupInitializationFailed`
- `StartupRepairFailed`

`startup/index.ts` 职责：

- 作为 `startup` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

与 `app` 的边界：

- `app` 负责真正的启动入口、装配、调用时机
- `startup/service.ts` 负责被调用后的启动检查、自检和报告生成
- `app` 不自己实现启动检查规则
- `startup/service.ts` 不负责应用装配

#### 5.4.7 `workflow-runtime-actions` 模块定稿

`server/src/processes/workflow-runtime-actions/` 当前定稿为：

```text
server/src/processes/workflow-runtime-actions/
├─ index.ts
├─ service.ts
├─ repo.ts
└─ errors.ts
```

`workflow-runtime-actions/service.ts` 职责：

- 承接运行时动作触发主干逻辑
- 负责读取项目节点上下文
- 负责解析当前 Workflow 与 Mermaid 节点
- 负责判断绑定是否存在、是否可执行
- 负责触发 `prompt` 或 `tool`
- 返回运行时动作结果
- 不处理 HTTP、SQL 细节、通用工具实现

依赖风格：

- 以 `workflow-runtime-actions/repo.ts` 为主要上下文读取入口
- 允许依赖 `domains/prompts` 暴露的只读公共能力，用于读取 Prompt 正文与基础信息
- 允许依赖 `processes/external-tools` 暴露的工具调用能力与工具目标校验能力
- 不深依赖多个 domain 的写入 service

`workflow-runtime-actions/repo.ts` 职责：

- 提供运行时动作所需的聚合读取入口
- 不提供万能查询方法

当前保留的最小方法集：

- `getWorkflowRuntimeActionContext(projectNodeId, mermaidNodeId)`

该 context 至少应覆盖：

- `projectNode`
- 绑定的 `workflow`
- 当前 Mermaid 节点是否存在
- 节点动作绑定
- 绑定目标类型
- 绑定目标基础信息
- 目标是否缺失 / 不可执行的基础原因

`workflow-runtime-actions/errors.ts` 职责：

- 只承接运行时动作过程稳定且明确的错误语义
- 不把“无绑定”与“执行失败”混成同一类
- 直接复用 `domains/workflows/node-actions` 导出的 `WorkflowNodeActionNotFound`
- 直接复用 `domains/prompts` 导出的 `PromptNotFound`

当前保留的最小错误集：

- `ProjectNodeWorkflowNotFound`
- `WorkflowNodeActionNotFound`（复用 `domains/workflows/node-actions` 导出的领域错误）
- `MermaidNodeNotFound`
- `ToolTargetNotFound`
- `PromptNotFound`（复用 `domains/prompts` 导出的领域错误）

`workflow-runtime-actions/index.ts` 职责：

- 作为 `workflow-runtime-actions` 过程模块的统一对外出口
- 导出 `service.ts` 的公共过程能力
- 导出 `errors.ts` 中需要被外部识别的过程错误
- 不直接暴露 `repo.ts`
- 模块内部默认不通过 `index.ts` 相互导入

与 `workflows/node-actions` 的边界：

- `workflows/node-actions` 负责绑定配置维护
- `workflow-runtime-actions` 负责在 `projectNodeId + mermaidNodeId` 上下文里读取绑定并执行
- 该模块属于 `processes/`，不挂在 `projects` 下

前端对应关系：

- 前端不单独建立 `processes/` 层
- 当前更接近 `web/src/modules/workflows/runtime-actions/` 的语义落点

### 5.5 `infra`

`infra` 承接底层能力提供者，不承接业务对象，也不承接过程编排。

当前结构：

```text
infra/
├─ db/
├─ filesystem/
├─ workspace/
├─ tools/
└─ config/
```

模块说明：

- `db`：数据库连接、事务能力、基础查询执行、迁移执行入口
- `filesystem`：目录创建、文件读写、文件枚举、路径存在性检查、移动复制删除等底层文件操作
- `workspace`：工作目录根校验、固定目录就绪、相对路径解析与允许根目录校验
- `tools`：本地工具注册表读取与底层执行封装
- `config`：配置读取、配置结构校验与配置访问入口

边界约束：

- `infra` 不拥有业务语义
- `infra` 不负责编排
- `db` 不负责跨资源一致性判断
- `tools` 不负责业务级触发判断
- `filesystem` 只负责通用文件动作
- 凡是带目录语义、命名语义、合法性语义、生命周期语义的规则，都归业务模块或过程模块

#### 5.5.1 `infra/filesystem` 模块定稿

`server/src/infra/filesystem/` 当前定稿为：

```text
server/src/infra/filesystem/
├─ index.ts
├─ files.ts
├─ directories.ts
└─ errors.ts
```

`files.ts` 职责：

- 承接通用文件级动作

当前保留的最小能力集：

- `fileExists(path)`
- `readTextFile(path)`
- `writeTextFile(path, content)`
- `appendTextFile(path, content)`
- `copyFile(from, to)`
- `moveFile(from, to)`
- `deleteFile(path)`
- `getFileStat(path)`

边界：

- 不做业务格式解析
- 不做业务命名判断
- 不做自动目标路径推导

`directories.ts` 职责：

- 承接通用目录级动作

当前保留的最小能力集：

- `directoryExists(path)`
- `ensureDirectory(path)`
- `listDirectory(path)`
- `deleteDirectory(path)`
- `clearDirectory(path)`

语义区分：

- `deleteDirectory(path)`：删除目录本身
- `clearDirectory(path)`：清空目录内容但保留目录本身

边界：

- 不判断目录是否应该存在
- 不判断目录是否属于某个 domain
- 不承接归档策略判断

路径输入前提规则：

- `filesystem` 只接收已经解析完成且通过上层合法性判断的路径
- 不负责从业务 ID、相对片段、领域对象中推导路径

`errors.ts` 职责：

- 只承接文件系统基础设施层稳定且明确的错误语义
- 不定义业务错误
- 不重复定义 domain/process 已有错误

当前保留的最小错误集：

- `FileReadFailed`
- `FileWriteFailed`
- `FileDeleteFailed`
- `DirectoryCreateFailed`
- `DirectoryDeleteFailed`

`index.ts` 职责：

- 作为 `filesystem` 模块的统一对外出口
- 导出 `files.ts`
- 导出 `directories.ts`
- 导出 `errors.ts`
- 模块内部默认不通过 `index.ts` 相互导入

#### 5.5.2 `infra/workspace` 模块定稿

`server/src/infra/workspace/` 当前定稿为：

```text
server/src/infra/workspace/
├─ index.ts
├─ roots.ts
├─ resolver.ts
└─ errors.ts
```

模块定位：

- `infra/workspace` 只承接工作目录根、固定目录与受约束路径解析能力
- 不承接业务对象语义
- 不承接目录生命周期决策
- 不承接外部工具路由或业务级安全策略判断

`roots.ts` 职责：

- 校验 workspace root
- 校验固定目录是否存在或可自动创建
- 提供固定目录定位入口

当前保留的最小能力集：

- `validateWorkspaceRoot(path)`
- `ensureWorkspaceDirectories()`
- `getWorkspaceDirectories()`

`resolver.ts` 职责：

- 把相对路径解析为绝对路径
- 校验目标路径是否仍位于允许根目录内
- 返回已规范化、可交给 `infra/filesystem` 的路径

当前保留的最小能力集：

- `resolveWorkspacePath(relativePath, scope)`
- `assertPathWithinAllowedRoots(path, scope)`

`errors.ts` 职责：

- 只承接 workspace 基础设施层稳定且明确的错误语义
- 不定义业务错误

当前保留的最小错误集：

- `WorkspaceRootInvalid`
- `WorkspaceDirectoryMissing`
- `WorkspacePathResolutionFailed`
- `WorkspacePathNotAllowed`

`index.ts` 职责：

- 作为 `workspace` 模块的统一对外出口
- 导出 `roots.ts`
- 导出 `resolver.ts`
- 导出 `errors.ts`
- 模块内部默认不通过 `index.ts` 相互导入

与 `filesystem` 的边界：

- `workspace` 负责路径解析、固定目录与允许根目录校验
- `filesystem` 只接收已解析且已校验路径
- `filesystem` 不负责从业务 ID、相对片段或 workspace 规则中推导路径

#### 5.5.3 `infra/db` 模块定稿

`server/src/infra/db/` 当前定稿为：

```text
server/src/infra/db/
├─ index.ts
├─ client.ts
├─ transaction.ts
├─ migration.ts
└─ errors.ts
```

`client.ts` 职责：

- 承接数据库连接建立、关闭与基础执行入口
- 提供基础查询、执行、预编译等数据库运行能力
- 不承接业务语义

`transaction.ts` 职责：

- 提供数据库事务入口与事务上下文
- 不承接跨资源一致性
- 不承接业务补偿语义

事务规则：

- repo 默认不自己创建事务
- 当需要事务时，由上层 `service / process` 显式获取事务上下文并传入 repo
- `transaction.ts` 只表达纯数据库事务能力，不表达数据库 + 文件系统的一体化事务

`migration.ts` 职责：

- 承接数据库迁移执行入口
- 负责按既定顺序执行 schema / migration 相关脚本
- 不承接业务级初始化逻辑

`errors.ts` 职责：

- 只承接数据库基础设施层稳定且明确的错误语义
- 不定义业务错误

当前保留的最小错误集：

- `DatabaseConnectionFailed`
- `DatabaseQueryFailed`
- `DatabaseTransactionFailed`
- `DatabaseMigrationFailed`

`index.ts` 职责：

- 作为 `db` 模块的统一对外出口
- 导出 `client.ts`
- 导出 `transaction.ts`
- 导出 `migration.ts`
- 导出 `errors.ts`
- 模块内部默认不通过 `index.ts` 相互导入

#### 5.5.4 `infra/tools` 模块定稿

`server/src/infra/tools/` 当前定稿为：

```text
server/src/infra/tools/
├─ index.ts
├─ registry.ts
├─ executor.ts
└─ errors.ts
```

`registry.ts` 职责：

- 读取本地工具定义
- 提供工具注册表访问入口
- 提供工具存在性与基础元信息读取能力

当前保留的最小能力集：

- `listTools()`
- `getToolByKey(toolKey)`
- `toolExists(toolKey)`

补充边界：

- `toolExists(toolKey)` 只表达注册表里是否存在
- 不表达业务上是否可执行
- 不负责工具绑定是否合法
- 不负责工具路由匹配

`executor.ts` 职责：

- 承接工具执行入口
- 只执行已解析完成的工具定义
- 不负责查注册表
- 不负责业务合法性判断
- 不负责相对路径解析与安全校验

当前保留的最小能力集：

- `runTool(tool, input)`

`errors.ts` 职责：

- 只承接工具基础设施层稳定且明确的错误语义
- 不定义业务错误

当前保留的最小错误集：

- `ToolNotFound`
- `ToolExecutionFailed`
- `ToolRegistryLoadFailed`

`index.ts` 职责：

- 作为 `tools` 模块的统一对外出口
- 导出 `registry.ts`
- 导出 `executor.ts`
- 导出 `errors.ts`
- 模块内部默认不通过 `index.ts` 相互导入

模块边界总结：

- `infra/tools` 只提供工具注册表读取与底层执行能力
- `external-tools` 负责工具路由、安全校验、参数拼装与统一调用结果
- 不把业务语义下沉到工具层

#### 5.5.5 `infra/config` 模块定稿

`server/src/infra/config/` 当前定稿为：

```text
server/src/infra/config/
├─ index.ts
├─ loader.ts
├─ schema.ts
└─ errors.ts
```

模块定位：

- `infra/config` 只承接配置文件读取、配置结构校验与配置访问入口
- 不承接业务默认值决策
- 不承接启动策略判断
- 不承接领域语义解释

`loader.ts` 职责：

- 读取配置文件
- 解析配置文件内容
- 返回已解析配置对象

当前保留的最小能力集：

- `loadConfig()`
- `configFileExists()`

补充边界：

- `configFileExists()` 可以保留，但不扩展为配置访问器大全
- 不默认新增 `getConfigValue()`、`getToolConfig()`、`getWorkspaceRoot()` 这类 accessor

`schema.ts` 职责：

- 承接配置结构校验
- 定义配置对象的稳定结构
- 提供配置解析后的合法性保证

当前保留的最小能力集：

- `parseConfig(input)`

补充边界：

- `schema.ts` 只负责结构是否合法
- 不负责业务默认值解释
- 不负责“配置缺失时业务如何兜底”这类语义

`errors.ts` 职责：

- 只承接配置基础设施层稳定且明确的错误语义
- 不定义业务错误

当前保留的最小错误集：

- `ConfigFileNotFound`
- `ConfigReadFailed`
- `ConfigInvalid`

`index.ts` 职责：

- 作为 `config` 模块的统一对外出口
- 导出 `loader.ts`
- 导出 `schema.ts`
- 导出 `errors.ts`
- 模块内部默认不通过 `index.ts` 相互导入

依赖规则：

- 默认零 `shared/*` 依赖
- 不依赖 `infra/filesystem`
- 只有在确实需要极基础 primitive 时，才按需引入最小共享基础类型

### 5.6 `http`

`http` 是协议适配层，只负责把 HTTP 请求翻译成内部调用，再把内部结果翻译回 HTTP 响应。

不负责：

- 业务规则
- 跨模块编排
- 数据库或文件系统直接操作
- 领域合法性判断本体

当前定稿结构如下：

```text
server/src/http/
├─ index.ts
├─ routes/
├─ handlers/
├─ schema/
├─ presenter/
└─ error-mapper.ts
```

#### 5.6.1 `routes/`

职责：

- 只负责路由注册与 URL 对应关系
- 不放业务逻辑
- 不放复杂参数解析

#### 5.6.2 `handlers/`

职责：

- 作为 HTTP 请求处理入口
- 负责拿参数、调 `schema/`、调用对应 `domain / process`
- 负责将结果交给 `presenter/`
- 负责将错误交给 `error-mapper.ts`

硬规则：

- handler 不自己拼响应壳
- handler 不自己决定错误响应结构
- handler 不承接业务规则

#### 5.6.3 `schema/`

职责：

- 承接 HTTP 层的请求解析与输入校验
- 只校验 HTTP 形状是否合法

硬规则：

- UUID 格式、body 结构、query 类型，归 `schema/`
- Project 是否存在、Prompt 路径冲突、删除是否需要二次确认，归 `domain / process`
- `schema/` 不查库判断业务存在性

#### 5.6.4 `presenter/`

职责：

- 承接 HTTP 成功响应表达
- 把领域结果 / 过程结果映射成统一响应壳

硬规则：

- 状态码怎么定、`success / data / meta` 怎么包，只能在 HTTP 表达层决定
- `presenter/` 是成功响应表达的唯一出口
- `domain / process` 不返回 HTTP 状态码

#### 5.6.5 `error-mapper.ts`

职责：

- 承接领域错误 / 过程错误到 HTTP 状态码与错误响应结构的映射

硬规则：

- 错误码怎么映射，只能在 HTTP 表达层决定
- `error-mapper.ts` 是错误响应表达的唯一出口
- 不在该层定义 domain / process 自己的错误类

#### 5.6.6 `index.ts`

职责：

- 作为 `http` 层统一对外出口
- 导出路由装配入口
- 模块内部默认不通过 `index.ts` 相互导入

### 5.7 `app`

`app` 是装配与启动入口层，只负责把系统接起来并启动，不负责替其他层做事。

当前定稿结构如下：

```text
server/src/app/
├─ index.ts
├─ bootstrap.ts
├─ container.ts
└─ errors.ts
```

#### 5.7.1 `bootstrap.ts`

职责：

- 承接应用启动主干流程
- 负责初始化基础设施
- 负责构建 container
- 负责调用 `startup/service.ts`
- 只有检查通过，才挂载 `http` 并真正开始监听

硬规则：

- 启动顺序必须是“先检查，后监听”
- 不能先 `listen`，再做 `startup` 检查
- 不承接业务规则
- 不自己实现启动检查规则
- 不处理 HTTP 请求逻辑

#### 5.7.2 `container.ts`

职责：

- 承接依赖装配
- 负责集中构建依赖图并返回已装配模块实例
- 负责把 `domains / processes / infra / http` 接起来

硬规则：

- `container.ts` 是装配文件，不是全局 service locator
- 不作为业务代码在运行中随处查询依赖的入口
- 不承接业务逻辑

#### 5.7.3 `errors.ts`

职责：

- 只承接 `app` 层稳定且明确的错误语义
- 不重复定义 `StartupBlocked`
- 不吞掉 `startup` 过程错误

当前保留的最小错误集：

- `AppBootstrapFailed`
- `AppDependencyBuildFailed`

#### 5.7.4 `index.ts`

职责：

- 作为 `app` 层统一对外出口
- 导出 `bootstrap.ts`
- 导出 `container.ts`
- 导出 `errors.ts`
- 模块内部默认不通过 `index.ts` 相互导入

## 6. `web`

### 6.1 技术栈与组织原则

`web` 当前按既定技术路线正式采用以下技术栈：

- 前端框架：`Vue 3`
- 构建工具：`Vite`
- 路由：`Vue Router`
- 状态管理：`Pinia`
- 树与节点可视化：`@vue-flow/core`
- 工作流渲染：`mermaid`
- UI 组件库：`Naive UI`

`web` 同样遵循“先模块，后功能”，但前端组织需要额外遵守以下约束：

- `pages` 只做页面装配，不承接模块主干逻辑
- `modules` 优先按业务责任主干拆分，不优先按 `types / mappers / utils` 这类支撑物分类
- `runtime` 只放前端本地运行时状态，不放服务端真值
- `shared` 只放前端内部共享能力，不放具体业务模块归属
- 前端不单独引入 `processes` 层，过程型交互仍依附具体模块表达
- `workflow runtime actions` 在前端挂在 `projects/project-nodes` 下，而不是挂在 `workflows` 下

默认文件组织规则：

- 模块默认从最小集合开始组织：`api.ts + components/`
- 只有在确实需要时，才按需增加 `store.ts / composables.ts / types.ts / mappers.ts / index.ts`
- 不要求每个模块都长成完全一致的模板
- 目录结构服务于责任边界，不服务于“形式整齐”

### 6.2 总体结构

```text
web/
└─ src/
   ├─ app/
   ├─ pages/
   ├─ modules/
   ├─ runtime/
   └─ shared/
```

### 6.3 二级目录定位

- `app/`：前端应用装配层，负责 Vue 应用入口、路由装配、全局插件挂载、应用壳层与启动初始化
- `pages/`：页面级组合层，负责将多个模块拼装成具体页面
- `modules/`：前端业务模块层，承接业务语义、模块内交互、模块内组件与模块内数据获取
- `runtime/`：前端运行时态与本地会话态层，使用 `Pinia` 承接不入库状态
- `shared/`：前端内部共享层，承接前端统一 HTTP client、通用 UI 组件、通用组合式函数与纯工具函数

### 6.4 `app`

当前定稿结构：

```text
web/src/app/
├─ main.ts
├─ App.vue
├─ bootstrap.ts
├─ router.ts
├─ routes.ts
├─ plugins.ts
└─ error-handler.ts
```

`main.ts` 职责：

- 作为浏览器入口文件
- 创建 Vue 应用实例
- 调用 `bootstrap.ts` 完成挂载

`App.vue` 职责：

- 作为应用根组件
- 提供全局壳层与 `RouterView` 容器
- 不承接具体业务模块逻辑

`bootstrap.ts` 职责：

- 承接前端启动装配流程
- 挂载 `router`、`pinia`、`Naive UI`
- 组织前端运行时状态恢复
- 负责应用级初始化调用

`router.ts` 职责：

- 创建 `Vue Router` 实例
- 绑定路由历史模式与路由表
- 不定义页面业务逻辑

`routes.ts` 职责：

- 集中定义页面路由表
- 作为页面路由的唯一真相源
- 统一承接 `name / path / component / meta`
- 约束页面入口与 URL 的对应关系
- 不承接页面实现本体

边界补充：

- `app/routes.ts` 是前端页面路由的唯一真相源
- 若 `web/src/shared/constants/routes.ts` 保留，则只允许承接 route name 常量，不承接 path 字符串
- 前端页面路由不属于根目录 `shared/` 的前后端共享契约

`plugins.ts` 职责：

- 统一注册 `Pinia`
- 统一注册 `Naive UI`
- 统一注册需要全局挂载的前端插件或指令

`error-handler.ts` 职责：

- 承接前端全局错误处理入口
- 统一处理未捕获错误、Promise 异常与展示层降级逻辑
- 不替代业务模块内的显式错误分支处理

### 6.5 `pages`

当前定稿结构：

```text
web/src/pages/
├─ prompts/
│  └─ PromptsPage.vue
├─ workflows/
│  └─ WorkflowsPage.vue
├─ projects/
│  └─ ProjectsWorkspacePage.vue
├─ solutions/
│  └─ SolutionsPage.vue
└─ system/
   ├─ InspectionsPage.vue
   ├─ SyncPage.vue
   ├─ StartupPage.vue
   └─ SettingsPage.vue
```

页面层硬规则：

- `pages` 只负责拼装多个模块
- `pages` 不直接发裸 HTTP 请求
- `pages` 不持有复杂业务状态
- `pages` 不定义可复用业务组件

`PromptsPage.vue` 职责：

- 拼装 Prompt 列表、编辑器与详情面板

`WorkflowsPage.vue` 职责：

- 拼装 Workflow 列表、Mermaid 编辑区与节点动作绑定区

`ProjectsWorkspacePage.vue` 职责：

- 拼装项目列表、项目主工作区、节点详情面板与本地运行时状态
- 作为前端主操作场景页面

`SolutionsPage.vue` 职责：

- 拼装 Solution 列表与 Project 归属关系管理视图

`InspectionsPage.vue` 职责：

- 拼装巡检执行入口与巡检结果展示

`SyncPage.vue` 职责：

- 拼装导入导出操作与结果展示

`StartupPage.vue` 职责：

- 拼装启动报告与手动自检入口

`SettingsPage.vue` 职责：

- 拼装本地配置与工具配置摘要展示
- 当前先按展示页理解，不预设完整配置编辑与写回流程

### 6.6 `runtime`

当前定稿结构：

```text
web/src/runtime/
├─ stores/
│  ├─ session.ts
│  ├─ ui.ts
│  └─ filters.ts
├─ persistence/
│  ├─ local-storage.ts
│  └─ hydration.ts
└─ index.ts
```

`runtime` 承接：

- 本地运行时缓存
- 前端临时状态容器
- 当前会话下的 UI 状态
- 仅前端存在、不属于后端正式数据契约的状态

`runtime` 不承接：

- 前后端共享契约
- 通用 UI 组件
- 业务模块本身的归属边界
- API client

边界原则：

- `runtime` 放前端运行时状态，不放业务模块归属
- 根目录 `shared/` 与 `web/src/shared/` 不是同一层概念，前者是前后端共享契约，后者是前端内部共享
- `runtime` 只承接跨页面或跨模块共享，且需要本地持久恢复的运行时状态
- 模块内 `store` 只承接单模块生命周期内的详情数据、请求态、编辑态与临时草稿
- 同一状态不允许同时归属 `runtime` 与模块内 `store`
- 模块可以读取 `runtime` 中的选中态，但不在 `runtime` 中重复保存自己的详情数据与局部编辑态

`stores/session.ts` 职责：

- 保存 `activeProjectNodeId`
- 保存 `activeWorkflowNodeId`
- 保存当前项目或当前工作区的会话级选中状态

`stores/ui.ts` 职责：

- 保存局部弹窗显隐
- 保存纯 UI 表达状态

边界补充：

- 节点详情面板开关默认留在模块内 `store`
- 只有在明确要求刷新后恢复时，才允许把该状态提升到 `runtime`

`stores/filters.ts` 职责：

- 保存搜索词
- 保存筛选条件
- 保存排序选择等仅服务当前页面的临时状态

`persistence/local-storage.ts` 职责：

- 封装本地缓存读写
- 为运行时状态提供稳定持久化入口

`persistence/hydration.ts` 职责：

- 在应用启动时恢复本地缓存
- 将可恢复状态注入 `Pinia`

`index.ts` 职责：

- 作为 `runtime` 层统一对外出口
- 导出运行时 store 与持久化能力

### 6.7 `shared`

当前定稿结构：

```text
web/src/shared/
├─ api/
│  ├─ http-client.ts
│  ├─ response.ts
│  └─ error-mapper.ts
├─ ui/
│  ├─ PageShell.vue
│  ├─ PanelShell.vue
│  ├─ EmptyState.vue
│  ├─ LoadingBlock.vue
│  └─ ConfirmDialog.vue
├─ composables/
│  ├─ useAsyncAction.ts
│  ├─ useLoadingState.ts
│  └─ useDisclosure.ts
├─ utils/
│  ├─ time.ts
│  ├─ list.ts
│  └─ text.ts
├─ constants/
│  └─ routes.ts
└─ types/
   └─ ui.ts
```

`shared/api/http-client.ts` 职责：

- 作为前端统一 HTTP 请求入口
- 统一处理基础请求配置
- 不承接具体业务资源语义

`shared/api/response.ts` 职责：

- 统一解析 `success / data / meta` 响应壳
- 避免各模块重复手写响应拆包逻辑

`shared/api/error-mapper.ts` 职责：

- 统一处理服务端错误码到前端展示语义的映射
- 不在页面里重复散落错误码判断

`shared/ui/*` 职责：

- 提供前端通用 UI 壳组件
- 不承接具体业务语义

`shared/composables/*` 职责：

- 提供跨模块可复用的组合式函数
- 不承接具体领域业务规则

`shared/utils/*` 职责：

- 承接纯函数工具
- 不承接模块级业务语义

`shared/constants/routes.ts` 职责：

- 仅在保留时提供 route name 常量
- 不承接页面 path 字符串
- 不与后端 API 路由混用

`shared/types/ui.ts` 职责：

- 提供前端内部共享 UI 类型
- 不替代前后端共享契约类型

### 6.8 `modules`

前端展示层当前仍按业务模块拆分，不单独引入前端 `processes` 层。

组织原因：

- 前端天然更偏解耦
- 很多过程型能力在前端表现为依附具体模块的交互流程
- 当前阶段按模块组织更有利于保持结构稳定

当前结构倾向：

```text
web/src/modules/
├─ prompts/
├─ workflows/
├─ projects/
│  ├─ deletion/
│  ├─ project-nodes/
│  ├─ view-config/
│  ├─ deliberations/
│  └─ summaries/
├─ solutions/
└─ system/
```

归属说明：

- `prompts`：独立前端业务模块
- `workflows`：独立前端业务模块
- `projects`：前端主操作场景模块
- `projects/deletion`：Project 删除保护前端模块，独立于 Project 基础 CRUD
- `project-nodes`：强附着于 `projects`
- `view-config`：强附着于 `projects`
- `deliberations`：强附着于 `project-nodes`
- `summaries`：强附着于 `project-nodes`
- `solutions`：保持独立前端业务模块，不并入 `projects`
- `system`：承接巡检、同步、启动报告、设置摘要等系统级页面能力

模块层硬规则：

- 默认从最小文件集合开始组织，不强制模板化
- 一个模块默认至少有：`api.ts + components/`
- 只有在确实需要时，才增加 `store.ts / composables.ts / types.ts / mappers.ts / index.ts`
- 删除保护、运行时动作、视图配置等显式过程语义，在前端仍应维持独立子模块

#### 6.8.1 `modules/prompts`

当前定稿结构：

```text
web/src/modules/prompts/
├─ api.ts
└─ components/
   ├─ PromptList.vue
   ├─ PromptTable.vue
   ├─ PromptEditor.vue
   ├─ PromptDetailPanel.vue
   └─ PromptDeleteDialog.vue
```

`api.ts` 职责：

- 承接 Prompt 资源 CRUD 请求
- 不承接页面组合逻辑

`PromptList.vue` 职责：

- 承接 Prompt 列表区块的上层容器

`PromptTable.vue` 职责：

- 负责 Prompt 列表表格展示

`PromptEditor.vue` 职责：

- 负责 Prompt 创建与编辑表单

`PromptDetailPanel.vue` 职责：

- 负责单个 Prompt 的详情展示

`PromptDeleteDialog.vue` 职责：

- 负责 Prompt 删除确认交互

#### 6.8.2 `modules/workflows`

当前定稿结构：

```text
web/src/modules/workflows/
├─ api.ts
├─ components/
│  ├─ WorkflowList.vue
│  ├─ WorkflowEditor.vue
│  ├─ MermaidPreview.vue
│  └─ WorkflowDeleteDialog.vue
└─ node-actions/
   ├─ api.ts
   ├─ types.ts
   ├─ composables.ts
   └─ components/
      ├─ NodeActionList.vue
      ├─ NodeActionEditor.vue
      └─ NodeActionSyncButton.vue
```

`api.ts` 职责：

- 承接 Workflow 资源 CRUD 请求

`WorkflowList.vue` 职责：

- 展示 Workflow 列表

`WorkflowEditor.vue` 职责：

- 负责 Workflow 基础字段与 `mermaidSource` 编辑

`MermaidPreview.vue` 职责：

- 负责渲染 Workflow 的 Mermaid 结构
- 只承担结构展示与节点点击，不承担复杂业务画布职责

`WorkflowDeleteDialog.vue` 职责：

- 负责 Workflow 删除确认交互

`node-actions/api.ts` 职责：

- 承接 Workflow 节点动作绑定的读取、创建、更新、删除与同步请求

`node-actions/types.ts` 职责：

- 定义节点动作绑定前端展示所需类型

`node-actions/composables.ts` 职责：

- 封装节点动作绑定列表刷新、编辑态切换与同步调用逻辑

`NodeActionList.vue` 职责：

- 展示当前 Workflow 的节点动作绑定列表

`NodeActionEditor.vue` 职责：

- 编辑单个 Mermaid 节点的动作绑定

`NodeActionSyncButton.vue` 职责：

- 触发节点动作绑定同步

#### 6.8.3 `modules/projects`

当前定稿结构：

```text
web/src/modules/projects/
├─ api.ts
├─ components/
│  ├─ ProjectList.vue
│  ├─ ProjectHeader.vue
│  └─ ProjectSwitcher.vue
├─ deletion/
│  ├─ api.ts
│  ├─ types.ts
│  ├─ composables.ts
│  └─ components/
│     └─ ProjectDeleteDialog.vue
├─ project-nodes/
│  ├─ api.ts
│  ├─ store.ts
│  ├─ composables.ts
│  ├─ components/
│  │  ├─ ProjectNodeSidebarTree.vue
│  │  ├─ NodeCard.vue
│  │  ├─ NodeEditor.vue
│  │  ├─ NodeDetailPanel.vue
│  │  └─ NodeDeleteDialog.vue
│  ├─ runtime-actions/
│  │  ├─ api.ts
│  │  ├─ types.ts
│  │  ├─ composables.ts
│  │  └─ components/
│  │     ├─ RuntimeActionPanel.vue
│  │     ├─ RuntimeActionSummary.vue
│  │     └─ RuntimeTriggerButton.vue
│  └─ deletion/
│     ├─ api.ts
│     ├─ types.ts
│     └─ composables.ts
├─ view-config/
│  ├─ api.ts
│  ├─ composables.ts
│  └─ components/
│     ├─ ProjectCanvas.vue
│     └─ ViewportController.vue
├─ deliberations/
│  ├─ api.ts
│  ├─ composables.ts
│  └─ components/
│     ├─ DeliberationsPanel.vue
│     ├─ DeliberationsFileList.vue
│     ├─ AppendLatestButton.vue
│     └─ CreateDeliberationFileDialog.vue
└─ summaries/
   ├─ api.ts
   └─ components/
      ├─ SummariesPanel.vue
      └─ SummaryFileList.vue
```

`projects/api.ts` 职责：

- 只承接 Project 基础资源 CRUD 请求
- 不承接 Project 删除保护动作

`ProjectList.vue` 职责：

- 展示项目列表

`ProjectHeader.vue` 职责：

- 展示当前项目标题区、基础信息与高层操作入口

`ProjectSwitcher.vue` 职责：

- 承接项目切换控件

`projects/deletion/api.ts` 职责：

- 承接 Project 删除保护相关动作请求
- 只包括 `deletion-check / deletion-execute`

`projects/deletion/types.ts` 职责：

- 定义 Project 删除检查结果、执行请求与执行结果类型

`projects/deletion/composables.ts` 职责：

- 封装 Project 删除保护流程状态与确认逻辑

`ProjectDeleteDialog.vue` 职责：

- 承接 Project 删除确认、二次确认与策略选择交互

`project-nodes/api.ts` 职责：

- 承接 ProjectNode 基础资源请求
- 只包括列表、详情、创建、更新
- 不承接删除保护动作

`project-nodes/store.ts` 职责：

- 保存节点详情面板所需的模块级状态
- 不替代全局 `runtime` 中的当前选中状态

`project-nodes/composables.ts` 职责：

- 封装节点列表加载、详情读取与节点编辑相关逻辑

`ProjectNodeSidebarTree.vue` 职责：

- 作为左侧结构列表展示项目节点树
- 名称明确表示它是侧边树列表，而不是主工作区画布

`NodeCard.vue` 职责：

- 承接节点内容展示单元
- 用于画布节点内容渲染或列表卡片渲染

`NodeEditor.vue` 职责：

- 承接节点创建与编辑表单

`NodeDetailPanel.vue` 职责：

- 承接节点详情面板本体
- 组合工作流动作、推敲记录、总结列表等内容

`NodeDeleteDialog.vue` 职责：

- 承接节点删除保护交互壳

`project-nodes/runtime-actions/api.ts` 职责：

- 承接项目节点运行时动作详情读取与触发请求
- 该能力挂在 `project-nodes` 下，不挂在 `workflows` 下

`project-nodes/runtime-actions/types.ts` 职责：

- 定义运行时动作详情与触发结果类型

`project-nodes/runtime-actions/composables.ts` 职责：

- 封装当前 Mermaid 节点动作详情加载与触发逻辑

`RuntimeActionPanel.vue` 职责：

- 承接运行时动作区域面板

`RuntimeActionSummary.vue` 职责：

- 展示动作类型、目标信息与可执行状态

`RuntimeTriggerButton.vue` 职责：

- 触发当前 `prompt / tool` 动作

`project-nodes/deletion/api.ts` 职责：

- 承接 ProjectNode 删除保护相关动作请求

`project-nodes/deletion/types.ts` 职责：

- 定义节点删除检查结果、执行请求与执行结果类型

`project-nodes/deletion/composables.ts` 职责：

- 封装节点删除保护流程状态与确认逻辑

`view-config/api.ts` 职责：

- 承接 Project 节点布局与视角配置请求

`view-config/composables.ts` 职责：

- 封装布局保存、视角恢复与保存触发策略
- 只承接“什么时候读 / 什么时候保存 / 保存什么”
- 不接管组件内部拖拽、缩放、点击等瞬时交互细节

`ProjectCanvas.vue` 职责：

- 作为主工作区唯一画布壳层
- 使用 `@vue-flow/core` 承接项目节点的可视化导航视图
- 负责画布内部瞬时交互
- 负责监听 `@vue-flow/core` 事件
- 负责把用户操作转成组件事件或调用
- 不负责持久化规则判断本体
- 不与左侧结构列表形成双中心

`ViewportController.vue` 职责：

- 负责 Project 视角读写与恢复控制
- 不替代主画布本体

`deliberations/api.ts` 职责：

- 承接推敲记录目录信息、文件列表、追加与新建请求

`deliberations/composables.ts` 职责：

- 封装推敲记录列表刷新、追加与新建流程

`DeliberationsPanel.vue` 职责：

- 承接推敲记录区域面板

`DeliberationsFileList.vue` 职责：

- 展示推敲记录文件列表

`AppendLatestButton.vue` 职责：

- 触发追加到最新推敲记录文件

`CreateDeliberationFileDialog.vue` 职责：

- 承接手动新建推敲记录文件交互

`summaries/api.ts` 职责：

- 承接总结目录信息与文件列表请求
- 当前不承接自动写入类动作

`SummariesPanel.vue` 职责：

- 承接总结区域面板

`SummaryFileList.vue` 职责：

- 展示总结文件列表

#### 6.8.4 `modules/solutions`

当前定稿结构：

```text
web/src/modules/solutions/
├─ api.ts
├─ composables.ts
└─ components/
   ├─ SolutionList.vue
   ├─ SolutionEditor.vue
   ├─ SolutionProjectsPanel.vue
   └─ SolutionProjectBindingDialog.vue
```

`api.ts` 职责：

- 承接 Solution 资源 CRUD 与 Project 归属关系请求

`composables.ts` 职责：

- 封装 Solution 列表加载、详情切换与项目绑定交互逻辑

`SolutionList.vue` 职责：

- 展示 Solution 列表

`SolutionEditor.vue` 职责：

- 承接 Solution 创建与编辑表单

`SolutionProjectsPanel.vue` 职责：

- 展示某个 Solution 下的项目列表

`SolutionProjectBindingDialog.vue` 职责：

- 承接 Project 与 Solution 绑定、解绑或排序调整交互

#### 6.8.5 `modules/system`

当前定稿结构：

```text
web/src/modules/system/
├─ inspections/
│  ├─ api.ts
│  ├─ composables.ts
│  └─ components/
│     ├─ InspectionRunButton.vue
│     ├─ InspectionSummary.vue
│     └─ InspectionIssueTable.vue
├─ sync/
│  ├─ api.ts
│  ├─ composables.ts
│  └─ components/
│     ├─ ExportButton.vue
│     ├─ ImportButton.vue
│     └─ SyncResultPanel.vue
├─ startup/
│  ├─ api.ts
│  └─ components/
│     ├─ StartupReportPanel.vue
│     └─ SelfCheckButton.vue
└─ settings/
   └─ components/
      ├─ SettingsPanel.vue
      └─ ToolConfigSummary.vue
```

`inspections/api.ts` 职责：

- 承接巡检执行请求

`inspections/composables.ts` 职责：

- 封装巡检执行、结果刷新与问题列表状态管理

`InspectionRunButton.vue` 职责：

- 触发巡检执行

`InspectionSummary.vue` 职责：

- 展示巡检统计摘要

`InspectionIssueTable.vue` 职责：

- 展示巡检问题列表

`sync/api.ts` 职责：

- 承接导入导出请求

`sync/composables.ts` 职责：

- 封装导入导出调用与结果状态管理

`ExportButton.vue` 职责：

- 触发导出动作

`ImportButton.vue` 职责：

- 触发导入动作

`SyncResultPanel.vue` 职责：

- 展示导入导出结果

`startup/api.ts` 职责：

- 承接启动报告读取与手动自检请求

`StartupReportPanel.vue` 职责：

- 展示启动报告与检查项状态

`SelfCheckButton.vue` 职责：

- 触发手动自检

`SettingsPanel.vue` 职责：

- 承接设置页主面板
- 当前以展示与摘要为主

`ToolConfigSummary.vue` 职责：

- 展示本地工具配置摘要
- 不承担完整工具配置编辑器职责

边界补充：

- 当前不预设独立 `settings/api.ts`
- 设置页当前只允许复用既有系统级接口返回的可展示配置摘要
- 待配置读取契约正式化后，再决定是否补独立的 `settings/api.ts`

### 6.9 页面与模块映射

当前推荐映射关系如下：

- `PromptsPage.vue` -> `modules/prompts`
- `WorkflowsPage.vue` -> `modules/workflows`
- `ProjectsWorkspacePage.vue` -> `modules/projects` + `runtime`
- `SolutionsPage.vue` -> `modules/solutions`
- `InspectionsPage.vue` -> `modules/system/inspections`
- `SyncPage.vue` -> `modules/system/sync`
- `StartupPage.vue` -> `modules/system/startup`
- `SettingsPage.vue` -> `modules/system/settings`

### 6.10 当前结论

当前版本 `web` 侧代码文件组织正式结论如下：

1. 前端技术栈统一采用 `Vue 3 + Vite + Vue Router + Pinia + @vue-flow/core + mermaid + Naive UI`
2. `pages` 只做页面装配，不承接业务主干逻辑
3. `runtime` 只承接本地运行时状态，不承接服务端真值
4. 模块组织默认从最小文件集合开始，不做强制模板化
5. Project 与 ProjectNode 删除保护在前端仍保持独立子模块，不并回基础 CRUD
6. `ProjectCanvas.vue` 是主工作区唯一画布中心；左侧结构列表明确命名为 `ProjectNodeSidebarTree.vue`
7. `workflow runtime actions` 在前端正式挂在 `projects/project-nodes/runtime-actions/`
8. `settings` 当前先按展示页与摘要页设计，不超前定义完整配置编辑流程

