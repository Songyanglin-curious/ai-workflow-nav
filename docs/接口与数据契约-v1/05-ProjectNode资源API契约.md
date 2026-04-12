# 05. ProjectNode 资源 API 契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 11 节 / L4-06

---

## 11. `L4-06` ProjectNode 资源 API 契约

### 11.1 资源定位

`ProjectNode` 是系统的核心使用单位，承载实际工作上下文。

按当前需求分析，`ProjectNode` 不只是单纯元数据对象，还天然关联两类结构信息：

- 它在项目树中的父子位置
- 它与 `Workflow` 的一对一绑定关系

因此当前版本不把 `ProjectNode` 写成“纯字段表的机械 CRUD”，而是采用：

- 节点元数据
- 节点结构关系
- 节点工作流绑定

三者一起收敛到节点资源写接口中。

但与 `ProjectNode` 强相关的扩展能力不在本节展开：

- 节点下的对话与总结内容，见第 12 节与第 13 节
- 节点删除保护与总结转存，见第 14 节
- 节点运行时动作读取与触发，见第 16 节

### 11.2 路由清单

当前版本先定义以下 ProjectNode 资源接口：

- `GET /api/projects/{projectId}/nodes`
- `POST /api/projects/{projectId}/nodes`
- `GET /api/project-nodes/{id}`
- `PATCH /api/project-nodes/{id}`

路由说明：

- 节点列表与创建挂在所属项目下，因为节点天然归属于某个项目
- 单节点读取与更新使用全局节点 ID，因为节点详情、动作和上下文面板都更适合直接按节点定位
- 节点删除不走裸资源删除接口，而走删除保护动作接口

补充说明：

- 若要读取节点下的推敲记录或总结文件，不应追加到本节基础 CRUD，而应进入第 12 节与第 13 节
- 若要删除节点，应直接进入第 14 节
- 若要读取或触发当前工作流节点动作，应直接进入第 16 节

### 11.3 ProjectNode DTO 约定

#### 11.3.1 ProjectNodeSummary

```json
{
  "id": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "需求澄清",
  "description": "明确目标、范围和边界。",
  "status": "todo",
  "parentNodeId": null,
  "sortOrder": 0,
  "workflowId": "018f3f2b-4444-7b1b-9a12-123456789abc",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

#### 11.3.2 ProjectNodeDetail

当前版本 `ProjectNodeDetail` 与 `ProjectNodeSummary` 保持一致：

```json
{
  "id": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "需求澄清",
  "description": "明确目标、范围和边界。",
  "status": "todo",
  "parentNodeId": null,
  "sortOrder": 0,
  "workflowId": "018f3f2b-4444-7b1b-9a12-123456789abc",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `projectId`：节点所属项目 ID
- `status`：当前仅允许 `default` / `todo` / `fix`
- `parentNodeId`：父节点 ID；为 `null` 表示根层节点
- `sortOrder`：同级排序
- `workflowId`：当前绑定的工作流 ID；未绑定时可为 `null`

补充规则：

- 每个 `ProjectNode` 必须且只对应一条 `project_node_relations` 记录
- 根节点也必须保留结构关系记录，并以 `parent_project_node_id IS NULL` 表达
- 当前版本不向前端暴露 `folderPath`
- 当前版本不把 `deliberations/`、`summaries/` 文件列表直接并入节点基础 CRUD 返回
- 当前版本不把布局坐标直接并入 `ProjectNode` 主资源

### 11.4 列表接口

#### 11.4.1 `GET /api/projects/{projectId}/nodes`

用途：

- 读取某个项目下的节点列表
- 用于项目结构页与节点管理页的基础数据加载

查询参数：

- `parentNodeId`：三态语义
  - 未传：返回项目下全量扁平节点列表
  - 传 `null` 或空值：返回根层节点列表
  - 传具体节点 ID：返回该节点下的直接子节点列表
- `status`：可选，按节点状态过滤

返回：

- `data.items` 为 `ProjectNodeSummary[]`

当前默认排序：

- 默认排序仅在当前返回集合范围内生效
- 当前集合内按 `sortOrder` 升序
- 若 `sortOrder` 相同，则按 `createdAt` 升序

错误码建议：

- `PROJECT_NOT_FOUND`

### 11.5 单资源读取接口

#### 11.5.1 `GET /api/project-nodes/{id}`

用途：

- 读取单个节点的基础详情
- 用于节点详情面板和节点维护页

返回：

- `data.projectNode` 为 `ProjectNodeDetail`

补充说明：

- 本接口只返回节点基础元数据
- `workflowId` 仅表达当前绑定关系，不展开运行时动作详情
- 运行时动作详情需通过第 16 节接口读取

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 11.6 创建接口

#### 11.6.1 `POST /api/projects/{projectId}/nodes`

请求体：

```json
{
  "name": "需求澄清",
  "description": "明确目标、范围和边界。",
  "status": "todo",
  "parentNodeId": null,
  "sortOrder": 0,
  "workflowId": "018f3f2b-4444-7b1b-9a12-123456789abc"
}
```

字段规则：

- `name`：必填，去除首尾空白后不能为空
- `description`：可选，默认 `""`
- `status`：可选，默认 `default`
- `parentNodeId`：可选，默认 `null`
- `sortOrder`：可选；未传时由服务端决定追加位置
- `workflowId`：可选；未传表示初始不绑定工作流

当前版本禁止客户端传入：

- `id`
- `createdAt`
- `updatedAt`
- `folderPath`
- `projectId` 作为 body 字段

成功语义：

- 创建节点元数据
- 创建节点结构关系
- 如传入 `workflowId`，则创建节点工作流绑定
- 初始化节点目录以及固定子目录 `deliberations/`、`summaries/`
- 创建对应的 `deliberations_records` 与 `summary_records` 目录入口记录
- 成功后返回 `201 Created`
- `data.projectNode` 返回完整 `ProjectNodeDetail`

校验规则：

- `projectId` 必须存在
- 若传入 `parentNodeId`，则其必须存在且属于同一项目
- 若传入 `workflowId`，则其必须存在
- 不允许创建跨项目父子关系

错误码建议：

- `PROJECT_NOT_FOUND`
- `PARENT_PROJECT_NODE_NOT_FOUND`
- `WORKFLOW_NOT_FOUND`
- `VALIDATION_ERROR`

### 11.7 更新接口

#### 11.7.1 `PATCH /api/project-nodes/{id}`

请求体：

```json
{
  "name": "需求澄清（更新版）",
  "status": "fix",
  "parentNodeId": "018f3f2b-5555-7b1b-9a12-123456789abc",
  "sortOrder": 2,
  "workflowId": null
}
```

字段规则：

- 请求体所有字段均为可选
- 若传入 `name`，则去除首尾空白后不能为空
- 若传入 `status`，则必须为 `default` / `todo` / `fix`
- 若传入 `parentNodeId`：
  - `null` 表示移动到根层
  - 非空时必须指向同一项目内存在的节点
- 若传入 `sortOrder`，则必须为整数
- 若传入 `workflowId`：
  - `null` 表示清除工作流绑定
  - 非空时必须指向存在的 Workflow

当前版本禁止客户端更新：

- `id`
- `projectId`
- `createdAt`
- `updatedAt`
- `folderPath`

成功语义：

- 更新节点元数据
- 必要时更新父子结构关系
- 必要时更新节点工作流绑定
- 成功后返回 `200 OK`
- `data.projectNode` 返回更新后的完整 `ProjectNodeDetail`

结构规则：

- 不允许形成父子循环
- 不允许把节点移动到其他项目下
- 节点名称变化不自动重命名目录

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `PARENT_PROJECT_NODE_NOT_FOUND`
- `WORKFLOW_NOT_FOUND`
- `PROJECT_NODE_CYCLE_DETECTED`
- `VALIDATION_ERROR`

### 11.8 当前版本不开放 ProjectNode 裸删除接口

当前版本明确：

- 节点删除属于高风险操作
- 节点删除会影响当前节点元数据、当前节点相关结构关系、当前节点工作流绑定以及当前节点目录内容
- 若存在直接子节点，删除后它们会改写为根层孤岛节点，而不是被一并删除
- 面向前端的正式删除流程必须走第 14 节定义的删除保护动作接口

当前版本结论：

- 不对前端开放 `DELETE /api/project-nodes/{id}`
- 删除能力统一通过：
  - `POST /api/project-nodes/{projectNodeId}/deletion-check`
  - `POST /api/project-nodes/{projectNodeId}/deletion-execute`
- 若实现层内部存在删除函数，也不应作为独立对外 HTTP 契约暴露

阅读指引：

- 删除前置条件、二次确认和转存规则，统一见第 14 节
- `summaries/` 与 `summaryArchives/` 的边界，也统一见第 14 节

### 11.9 校验与错误语义

ProjectNode 资源当前优先使用以下错误语义：

- `404 + PROJECT_NOT_FOUND`
- `404 + PROJECT_NODE_NOT_FOUND`
- `404 + PARENT_PROJECT_NODE_NOT_FOUND`
- `404 + WORKFLOW_NOT_FOUND`
- `409 + PROJECT_NODE_CYCLE_DETECTED`
- `412 + PRECONDITION_FAILED`
- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

补充说明：

- `PROJECT_NODE_CYCLE_DETECTED` 用于阻止形成循环结构
- `PRECONDITION_FAILED` 主要用于节点删除保护前置条件不满足

### 11.10 当前版本刻意不暴露的内容

当前版本的 ProjectNode 基础 CRUD 不直接暴露：

- `folderPath`
- `deliberations/` 与 `summaries/` 的文件列表
- 画布坐标与项目视角
- 运行时选中状态

这些内容将在节点内容契约、视图配置契约或运行时契约中继续定义。

对应关系如下：

- `deliberations/` 与 `summaries/`：见第 12 节与第 13 节
- 删除保护：见第 14 节
- 画布坐标与项目视角：见第 15 节
- 运行时选中状态与动作触发：见第 16 节

---


