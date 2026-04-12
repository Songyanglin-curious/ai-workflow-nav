# 04. Project 与 Solution 契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 10 节 / L4-05

---

## 10. `L4-05` Project 资源 API 契约

### 10.1 资源定位

`Project` 资源用于承载一组项目节点及其关系，并作为布局的唯一归属实体。

当前需求边界：

- `Project` 负责项目级元数据
- `Project` 是节点树结构的归属容器
- `Project` 是布局与视角配置的唯一归属实体
- `Solution` 只负责组织和展示，不承载独立布局数据

当前版本中，`Project` 资源本身不直接承载：

- 节点列表正文
- 节点布局坐标
- 项目视角位置与缩放

这些内容由 `ProjectNode` 与视图配置契约分别承担。

### 10.2 路由清单

当前版本先定义以下 Project 资源接口：

- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PATCH /api/projects/{id}`
- `POST /api/projects/{projectId}/deletion-check`
- `POST /api/projects/{projectId}/deletion-execute`

### 10.3 Project DTO 约定

#### 10.3.1 ProjectSummary

```json
{
  "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "个人 AI 工作流导航器",
  "description": "用于组织需求、流程与节点上下文。",
  "tags": "",
  "category": "product",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

#### 10.3.2 ProjectDetail

当前版本 `ProjectDetail` 与 `ProjectSummary` 保持一致：

```json
{
  "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "个人 AI 工作流导航器",
  "description": "用于组织需求、流程与节点上下文。",
  "tags": "",
  "category": "product",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

补充规则：

- 当前版本不向前端暴露 `folderPath`
- 当前版本不把布局、视角、节点列表直接并入 `ProjectDetail`

### 10.4 列表接口

#### 10.4.1 `GET /api/projects`

用途：

- 读取 Project 列表
- 用于项目列表展示与切换当前项目

查询参数：

- `keyword`：可选，按名称或描述做模糊过滤
- `category`：可选，按分类过滤

返回：

- `data.items` 为 `ProjectSummary[]`

当前默认排序：

- 按 `updatedAt` 倒序
- 若更新时间相同，则按 `name` 升序

### 10.5 单资源读取接口

#### 10.5.1 `GET /api/projects/{id}`

用途：

- 读取单个 Project 的基础详情
- 用于项目维护页编辑项目元数据

返回：

- `data.project` 为 `ProjectDetail`

错误码建议：

- `PROJECT_NOT_FOUND`

### 10.6 创建接口

#### 10.6.1 `POST /api/projects`

请求体：

```json
{
  "name": "个人 AI 工作流导航器",
  "description": "用于组织需求、流程与节点上下文。",
  "tags": "",
  "category": "product"
}
```

字段规则：

- `name`：必填，去除首尾空白后不能为空
- `description`：可选，默认 `""`
- `tags`：可选，默认 `""`
- `category`：可选，默认 `""`

当前版本禁止客户端传入：

- `id`
- `createdAt`
- `updatedAt`
- `folderPath`

成功语义：

- 创建项目元数据
- 初始化项目目录
- 成功后返回 `201 Created`
- `data.project` 返回完整 `ProjectDetail`

当前版本说明：

- 项目目录名在创建阶段生成后保持稳定
- 当前版本不因项目名称修改而自动改名目录

### 10.7 更新接口

#### 10.7.1 `PATCH /api/projects/{id}`

请求体：

```json
{
  "name": "个人 AI 工作流导航器（更新版）",
  "description": "用于更稳定地组织需求、流程与节点上下文。"
}
```

字段规则：

- 请求体所有字段均为可选
- 若传入 `name`，则去除首尾空白后不能为空
- 若传入 `description`、`tags`、`category`，则必须为字符串

当前版本禁止客户端更新：

- `id`
- `createdAt`
- `updatedAt`
- `folderPath`

成功语义：

- 项目元数据更新写入数据库
- 成功后返回 `200 OK`
- `data.project` 返回更新后的完整 `ProjectDetail`

错误码建议：

- `PROJECT_NOT_FOUND`

### 10.8 Project 删除保护契约

当前版本明确：

- `Project` 删除属于高风险破坏性操作
- 它会影响项目元数据、项目节点、节点工作流绑定、视图配置以及项目目录
- 不对前端开放裸 `DELETE /api/projects/{id}`
- 项目删除统一通过显式动作接口处理，而不是混入基础资源 CRUD

#### 10.8.1 路由清单

- `POST /api/projects/{projectId}/deletion-check`
- `POST /api/projects/{projectId}/deletion-execute`

说明：

- 这两个接口属于项目级删除保护动作接口
- 面向前端的正式项目删除流程必须使用它们
- 当前版本不恢复裸 `DELETE /api/projects/{id}`

#### 10.8.2 DTO 约定

##### 10.8.2.1 ProjectDeletionCheckResult

```json
{
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "projectNodeCount": 6,
  "summaryNodeCount": 2,
  "requiresSecondConfirmation": true,
  "allowedStrategies": [
    "archive_then_delete",
    "direct_delete"
  ]
}
```

字段说明：

- `projectId`：目标项目 ID
- `projectNodeCount`：当前项目下的节点总数
- `summaryNodeCount`：`summaries/` 非空的节点数量
- `requiresSecondConfirmation`：是否要求二次确认
- `allowedStrategies`：当前允许的删除策略

##### 10.8.2.2 ProjectDeletionExecuteRequest

```json
{
  "confirmDelete": true,
  "secondConfirmation": true,
  "strategy": "archive_then_delete"
}
```

字段说明：

- `confirmDelete`：是否明确确认删除
- `secondConfirmation`：是否明确完成二次确认
- `strategy`：删除策略

##### 10.8.2.3 ProjectDeletionExecuteResult

```json
{
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "deleted": true,
  "usedStrategy": "archive_then_delete",
  "archivedSummaryNodeCount": 2
}
```

字段说明：

- `projectId`：目标项目 ID
- `deleted`：是否已完成删除
- `usedStrategy`：实际采用的删除策略
- `archivedSummaryNodeCount`：本次转存过总结的节点数量

#### 10.8.3 删除检查接口

##### 10.8.3.1 `POST /api/projects/{projectId}/deletion-check`

用途：

- 获取项目删除前置条件
- 返回当前允许的删除策略
- 判断是否需要二次确认

请求体：

当前版本允许空对象：

```json
{}
```

返回：

- `data.result` 为 `ProjectDeletionCheckResult`

当前版本规则：

- 必须先确认项目存在
- 必须统计项目节点数量
- 必须统计 `summaries/` 非空的节点数量
- 若 `summaryNodeCount = 0`，则 `requiresSecondConfirmation = false`
- 若 `summaryNodeCount = 0`，则 `allowedStrategies = ["direct_delete"]`
- 若 `summaryNodeCount > 0`，则 `requiresSecondConfirmation = true`
- 若 `summaryNodeCount > 0`，则 `allowedStrategies = ["archive_then_delete", "direct_delete"]`

错误码建议：

- `PROJECT_NOT_FOUND`
- `INTERNAL_ERROR`

#### 10.8.4 删除执行接口

##### 10.8.4.1 `POST /api/projects/{projectId}/deletion-execute`

请求体：

```json
{
  "confirmDelete": true,
  "secondConfirmation": true,
  "strategy": "archive_then_delete"
}
```

返回：

- `data.result` 为 `ProjectDeletionExecuteResult`

当前版本执行规则：

- 必须先校验项目存在
- 执行前必须基于当前实时状态重新计算一次项目删除检查结果，而不是直接信任前一次 `deletion-check` 返回值
- 必须校验 `confirmDelete = true`
- 若当前实时删除检查结果要求二次确认，则必须校验 `secondConfirmation = true`
- 请求中的 `strategy` 必须属于当前实时 `allowedStrategies`
- 若 `strategy = archive_then_delete`：
  - 先将项目下所有 `summaries/` 非空节点的总结转存到 `summaryArchives/<project-folder>/<node-folder>/`
  - 所有需要转存的节点都成功后才允许删除项目
- 若 `strategy = direct_delete`：
  - 直接执行删除

删除成功时的实际效果：

- 删除项目元数据
- 删除项目下全部节点元数据、结构关系、节点工作流绑定、目录入口记录与磁盘内容
- 同步移除该项目的全部 `solution_projects` 绑定，但不删除任何 `Solution`
- 删除项目级布局与视角配置
- 若采用转存策略，则保留 `summaryArchives/` 中的转存结果

错误处理规则：

- 若 `confirmDelete` 缺失或为 `false`，返回 `412 + PRECONDITION_FAILED`
- 若当前实时状态需要二次确认但 `secondConfirmation` 不满足，返回 `412 + PRECONDITION_FAILED`
- 若请求中的 `strategy` 不属于当前实时 `allowedStrategies`，返回 `412 + PRECONDITION_FAILED`
- 若任一节点的总结转存失败，则必须中止删除，并返回错误；不得出现“项目已删但部分总结未转存成功”的不一致状态

错误码建议：

- `PROJECT_NOT_FOUND`
- `PRECONDITION_FAILED`
- `SUMMARY_ARCHIVE_FAILED`
- `INTERNAL_ERROR`

当前版本结论：

- `Project` 基础资源 API 只定义读取、创建、更新
- `Project` 删除能力统一通过项目级 `deletion-check / deletion-execute` 动作接口暴露

### 10.9 当前版本刻意不暴露的内容

当前版本的 Project 基础 CRUD 不直接暴露：

- `folderPath`
- 节点布局与项目视角配置
- 方案归属关系，见 `10.10`

这些内容将在相应子契约或独立契约中继续定义。

### 10.10 `Solution` 资源与 Project 归属契约

#### 10.10.1 能力定位

`Solution` 是位于 `Project` 之上的组织资源，用于承载：

- 方案自身的元数据
- 方案与项目之间的归属关系
- 项目在方案中的展示顺序

当前版本明确：

- `Solution` 只负责组织与展示，不承载独立布局数据
- 一个 `Project` 可以不属于任何 `Solution`
- 一个 `Project` 也可以同时属于多个 `Solution`
- “未归组项目”只是一种前端视图语义，不落库为真实 `Solution`

#### 10.10.2 路由清单

当前版本先定义以下接口：

- `GET /api/solutions`
- `GET /api/solutions/{id}`
- `POST /api/solutions`
- `PATCH /api/solutions/{id}`
- `DELETE /api/solutions/{id}`
- `GET /api/solutions/{solutionId}/projects`
- `POST /api/solutions/{solutionId}/projects`
- `PATCH /api/solutions/{solutionId}/projects/{projectId}`
- `DELETE /api/solutions/{solutionId}/projects/{projectId}`
- `GET /api/projects/{projectId}/solutions`

边界说明：

- `Solution` 自身的增删改查与项目归属关系都在本节定义
- 项目归属关系的写入统一收口到 `Solution` 侧接口，避免双边写接口语义重复
- `GET /api/projects/{projectId}/solutions` 仅作为读取补充能力，不提供对称写接口

#### 10.10.3 DTO 约定

##### 10.10.3.1 SolutionSummary

```json
{
  "id": "018f3f2b-6666-7b1b-9a12-123456789abc",
  "name": "产品方案",
  "description": "面向产品能力的项目集合。",
  "tags": "",
  "category": "product",
  "projectCount": 2,
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `projectCount`：当前方案下绑定的项目数量

##### 10.10.3.2 SolutionDetail

当前版本 `SolutionDetail` 与 `SolutionSummary` 保持一致：

```json
{
  "id": "018f3f2b-6666-7b1b-9a12-123456789abc",
  "name": "产品方案",
  "description": "面向产品能力的项目集合。",
  "tags": "",
  "category": "product",
  "projectCount": 2,
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

##### 10.10.3.3 SolutionProjectItem

```json
{
  "solutionId": "018f3f2b-6666-7b1b-9a12-123456789abc",
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "sortOrder": 0,
  "projectName": "个人 AI 工作流导航器"
}
```

字段说明：

- `solutionId`：方案 ID
- `projectId`：项目 ID
- `sortOrder`：项目在方案中的顺序
- `projectName`：便于前端展示的项目名称

##### 10.10.3.4 ProjectSolutionItem

```json
{
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "solutionId": "018f3f2b-6666-7b1b-9a12-123456789abc",
  "solutionName": "产品方案",
  "sortOrder": 0
}
```

##### 10.10.3.5 SolutionProjectBindRequest

```json
{
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "sortOrder": 0
}
```

字段规则：

- `projectId`：必填，必须指向已存在的 `Project`
- `sortOrder`：可选；未传时由服务端决定追加位置

##### 10.10.3.6 SolutionProjectPatchRequest

```json
{
  "sortOrder": 2
}
```

字段规则：

- 当前版本只允许更新 `sortOrder`

#### 10.10.4 Solution 资源接口

当前版本规则：

- `GET /api/solutions` 返回 `data.items: SolutionSummary[]`
- `GET /api/solutions/{id}` 返回 `data.solution: SolutionDetail`
- `POST /api/solutions` / `PATCH /api/solutions/{id}` 的字段规则与 `Project` 类似：`name` 必填，`description` / `tags` / `category` 可选
- `DELETE /api/solutions/{id}` 只删除 `Solution` 本身及其 `solution_projects` 关系，不删除任何 `Project`

当前默认排序：

- `GET /api/solutions` 按 `updatedAt` 倒序
- 若更新时间相同，则按 `name` 升序

错误码建议：

- `SOLUTION_NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`

#### 10.10.5 Solution 与 Project 归属关系接口

当前版本规则：

- `GET /api/solutions/{solutionId}/projects` 返回 `data.items: SolutionProjectItem[]`
- `GET /api/projects/{projectId}/solutions` 返回 `data.items: ProjectSolutionItem[]`
- `POST /api/solutions/{solutionId}/projects` 为某个方案新增一个项目归属
- `PATCH /api/solutions/{solutionId}/projects/{projectId}` 仅调整该项目在当前方案下的 `sortOrder`
- `DELETE /api/solutions/{solutionId}/projects/{projectId}` 仅移除该方案与项目的绑定关系

列表默认排序：

- `GET /api/solutions/{solutionId}/projects` 按 `sortOrder` 升序
- 若 `sortOrder` 相同，则按 `projectName` 升序
- `GET /api/projects/{projectId}/solutions` 按 `updatedAt` 倒序
- 若 `updatedAt` 相同，则按 `solutionName` 升序

写入约束：

- 创建绑定时必须校验 `solutionId` 存在
- 创建绑定时必须校验 `projectId` 存在
- 同一 `solutionId + projectId` 只能存在一条绑定
- 当前版本允许同一个项目同时出现在多个方案中

#### 10.10.6 与“虚拟方案”视图的边界

当前版本明确：

- 未绑定任何 `Solution` 的 `Project`，不在数据库中创建虚拟方案记录
- 前端若需要“未归组”展示，可基于：
  - `GET /api/projects`
  - `GET /api/projects/{projectId}/solutions`
    的结果自行组合出虚拟分组
- 服务端不对外暴露真实存在的 `UNASSIGNED` 方案资源

#### 10.10.7 校验与错误语义

当前优先使用以下错误语义：

- `404 + SOLUTION_NOT_FOUND`
- `404 + PROJECT_NOT_FOUND`
- `404 + SOLUTION_PROJECT_BINDING_NOT_FOUND`
- `409 + CONFLICT`
- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

补充说明：

- `CONFLICT` 主要用于重复绑定同一组 `solutionId + projectId`
- 删除方案时若目标不存在，返回 `404 + SOLUTION_NOT_FOUND`
- 删除某条绑定时若关系不存在，返回 `404 + SOLUTION_PROJECT_BINDING_NOT_FOUND`

---
