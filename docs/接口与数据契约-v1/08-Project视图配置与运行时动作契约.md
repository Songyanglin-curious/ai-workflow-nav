# 08. Project 视图配置与运行时动作契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 15-16 节 / L4-10 ~ L4-11

---

## 15. `L4-10` Project 视图配置契约

### 15.1 能力定位

`Project` 视图配置用于承载：

- 项目内各节点的持久化坐标
- 项目画布的最终视角位置与缩放

这部分数据的需求边界如下：

- 它们属于可同步视图配置数据
- 它们不属于纯本机 UI 状态
- 它们不应并入 `projects` 或 `project_nodes` 主表
- 每个 `Project` 当前只维护一套布局与最终视角

因此当前版本不把它们混进 `Project` / `ProjectNode` 基础 CRUD，而是单独定义视图配置契约。

### 15.2 与本地运行时状态的边界

当前版本明确区分：

1. 可同步视图配置包括节点坐标与最终视角位置，这部分需要入库并参与同步。
2. 本地运行时状态
   包括 `activeProjectNodeId`、`activeWorkflowNodeId`、面板展开状态、临时搜索词等，这部分只保存在前端本地缓存中。

补充说明：

- 用户交互过程中的临时拖拽、临时缩放可以属于本地 UI 状态
- 当界面决定“保存当前最终结果”时，才写入本节定义的视图配置接口

### 15.3 路由清单

当前版本先定义以下接口：

- `GET /api/projects/{projectId}/node-layouts`
- `PATCH /api/projects/{projectId}/node-layouts`
- `GET /api/projects/{projectId}/viewport`
- `PATCH /api/projects/{projectId}/viewport`

说明：

- 节点坐标属于项目作用域下的一组配置
- 视角配置属于项目作用域下的单实例配置
- 这两类能力都挂在 `Project` 下，而不是挂在单个 `ProjectNode` 下

### 15.4 DTO 约定

#### 15.4.1 ProjectNodeLayoutItem

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "positionX": 120,
  "positionY": 240,
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `projectNodeId`：节点 ID
- `positionX`：节点横坐标
- `positionY`：节点纵坐标
- `createdAt`：创建时间
- `updatedAt`：更新时间

#### 15.4.2 ProjectViewport

```json
{
  "projectId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "viewportX": 0,
  "viewportY": 0,
  "zoom": 1,
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `projectId`：项目 ID
- `viewportX`：视角横向偏移
- `viewportY`：视角纵向偏移
- `zoom`：缩放比例
- `createdAt`：创建时间
- `updatedAt`：更新时间

#### 15.4.3 NodeLayoutsPatchRequest

```json
{
  "items": [
    {
      "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
      "positionX": 120,
      "positionY": 240
    }
  ]
}
```

字段规则：

- `items`：必填，数组
- 每项都必须包含：
  - `projectNodeId`
  - `positionX`
  - `positionY`

当前版本语义：

- `PATCH /node-layouts` 采用批量 upsert 语义
- 只更新请求体中明确给出的节点坐标
- 不在一次更新中隐式删除未出现的其他节点布局记录

#### 15.4.4 ProjectViewportPatchRequest

```json
{
  "viewportX": 0,
  "viewportY": 0,
  "zoom": 1
}
```

字段规则：

- `viewportX`：必填，数值
- `viewportY`：必填，数值
- `zoom`：必填，数值，必须大于 `0`

### 15.5 节点布局读取接口

#### 15.5.1 `GET /api/projects/{projectId}/node-layouts`

用途：

- 读取某个项目下全部节点的持久化坐标
- 用于树关系画布恢复布局

返回：

- `data.items` 为 `ProjectNodeLayoutItem[]`

当前默认排序：

- 按 `projectNodeId` 升序

错误码建议：

- `PROJECT_NOT_FOUND`

### 15.6 节点布局保存接口

#### 15.6.1 `PATCH /api/projects/{projectId}/node-layouts`

请求体：

```json
{
  "items": [
    {
      "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
      "positionX": 120,
      "positionY": 240
    },
    {
      "projectNodeId": "018f3f2b-5555-7b1b-9a12-123456789abc",
      "positionX": 300,
      "positionY": 480
    }
  ]
}
```

成功返回示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "updatedCount": 2
    }
  },
  "meta": {}
}
```

字段说明：

- `updatedCount`：本次成功写入（新增或更新）的节点布局记录数量

当前版本规则：

- 必须先校验 `projectId` 存在
- 请求体中的每个 `projectNodeId` 都必须存在且属于该项目
- 同一个请求体中不允许重复出现同一个 `projectNodeId`
- 保存行为采用新增或更新，不隐式删除未出现的布局记录

错误码建议：

- `PROJECT_NOT_FOUND`
- `PROJECT_NODE_NOT_FOUND`
- `VALIDATION_ERROR`

### 15.7 项目视角读取接口

#### 15.7.1 `GET /api/projects/{projectId}/viewport`

用途：

- 读取某个项目的最终视角位置与缩放
- 用于进入项目页面时恢复上次持久化视角

返回：

- `data.viewport` 为 `ProjectViewport`

当前版本说明：

- 接口不做默认值返回策略，不伪造视角对象
- 若项目尚未保存过视角，返回 `404 + PROJECT_VIEWPORT_NOT_FOUND`
- 前端可在该场景下本地使用 `(0,0)` 作为默认展示位置

错误码建议：

- `PROJECT_NOT_FOUND`
- `PROJECT_VIEWPORT_NOT_FOUND`

### 15.8 项目视角保存接口

#### 15.8.1 `PATCH /api/projects/{projectId}/viewport`

请求体：

```json
{
  "viewportX": 0,
  "viewportY": 0,
  "zoom": 1
}
```

成功语义：

- 保存或更新该项目的最终视角配置
- 成功后返回 `200 OK`
- `data.viewport` 返回最新 `ProjectViewport`

当前版本规则：

- 必须先校验 `projectId` 存在
- `zoom` 必须大于 `0`
- 每个项目当前只维护一条视角配置记录

错误码建议：

- `PROJECT_NOT_FOUND`
- `VALIDATION_ERROR`

### 15.9 校验与错误语义

Project 视图配置当前优先使用以下错误语义：

- `404 + PROJECT_NOT_FOUND`
- `404 + PROJECT_NODE_NOT_FOUND`
- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

补充说明：

- `PROJECT_NODE_NOT_FOUND` 主要用于布局保存时请求体中的节点不存在
- `VALIDATION_ERROR` 主要用于非法坐标值、重复节点、非法 `zoom` 等问题

### 15.10 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动布局算法
- 画布拖拽交互细节
- 前端临时缩放状态缓存
- `activeProjectNodeId` 与 `activeWorkflowNodeId`

这些内容属于交互层本地状态或更高层 UI 行为，不属于本节的可同步视图配置契约。

---

## 16. `L4-11` 项目节点运行时动作契约

### 16.1 能力定位

项目节点运行时动作，指的是：

- 当前用户位于某个 `ProjectNode`
- 该节点已绑定某个 `Workflow`
- 用户在 Mermaid 渲染结果中选中了某个 `mermaidNodeId`
- 前端需要读取该节点动作详情或真正触发动作

这部分能力的核心边界如下：

- 动作绑定关系仍归属于 `Workflow`
- 运行时触发发生在 `ProjectNode` 上下文中
- 当前选中的 `activeWorkflowNodeId` 只保存在前端本地缓存中，不进入共享数据库
- 服务端接口应保持无状态，由调用方显式传入当前 `mermaidNodeId`

### 16.2 与绑定维护契约的边界

当前版本明确区分：

1. 绑定维护负责把工作流节点配置成 `prompt` / `tool`
2. 运行时动作
   负责在项目节点上下文中读取当前 Mermaid 节点动作详情并触发动作

因此：

- `workflow_node_actions` 的创建、更新、删除属于绑定维护契约
- 本节只定义“读当前动作详情”和“触发当前动作”

阅读边界：

- `ProjectNode` 的基础元数据与 `workflowId` 绑定字段，见第 11 节
- `workflow_node_actions` 的配置维护，见第 9 节
- 本节只处理“在某个项目节点上下文中读取/触发某个工作流节点动作”

### 16.3 与本地运行时状态的边界

当前版本不提供以下服务端接口：

- 设置 `activeProjectNodeId`
- 设置 `activeWorkflowNodeId`
- 保存 Mermaid 节点当前选中状态

原因：

- 这些状态属于前端本地运行时缓存
- 它们不参与同步
- 它们不应混入共享数据库或服务端长期契约

### 16.4 路由清单

当前版本先定义以下接口：

- `GET /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}`
- `POST /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}/trigger`

说明：

- `projectNodeId` 表达运行时上下文归属
- `mermaidNodeId` 表达当前前端选中的工作流节点
- 服务端基于 `projectNodeId -> workflowId -> workflow_node_actions` 完成解析

补充说明：

- 因此本节依赖第 11 节中的节点工作流绑定
- 也依赖第 9 节中的工作流节点动作绑定配置

### 16.5 DTO 约定

#### 16.5.1 WorkflowRuntimeNodeDetail

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "workflowId": "018f3f2b-4444-7b1b-9a12-123456789abc",
  "mermaidNodeId": "node-analyze",
  "hasBinding": true,
  "action": {
    "actionType": "prompt",
    "targetRef": "018f3f2b-1111-7b1b-9a12-123456789abc",
    "targetName": "需求分析提示词",
    "isExecutable": true
  }
}
```

字段说明：

- `projectNodeId`：当前项目节点 ID
- `workflowId`：当前项目节点绑定的工作流 ID
- `mermaidNodeId`：当前选中的 Mermaid 节点 ID
- `hasBinding`：当前 Mermaid 节点是否存在动作绑定
- `action`：当前动作摘要；无绑定时为 `null`

补充规则：

- `targetName` 为便于前端展示的名称
- `actionType = prompt` 时，`targetName` 取 Prompt 名称
- `actionType = tool` 时，`targetName` 取工具显示名；取不到时可退化为 `toolKey`
- `failureReason`：动作不可执行时的失败原因；无失败时为 `null`

当前版本规则：

- 当绑定存在但目标缺失时，详情接口返回 `200 OK`
- 返回 `hasBinding = true`
- 返回 `action.isExecutable = false`
- `failureReason` 至少支持 `prompt_not_found`、`tool_target_not_found`

#### 16.5.2 WorkflowRuntimeTriggerResult

当前版本采用统一结果壳，按动作类型返回不同结果字段。

`prompt` 动作示例：

```json
{
  "actionType": "prompt",
  "promptId": "018f3f2b-1111-7b1b-9a12-123456789abc",
  "promptName": "需求分析提示词",
  "copyText": "# 角色\\n你是一个需求分析助手。"
}
```

`tool` 动作示例：

```json
{
  "actionType": "tool",
  "toolKey": "openai-cli",
  "launched": true
}
```

字段说明：

- `actionType`：本次实际触发的动作类型
- `copyText`：仅在 `prompt` 动作时返回，供前端执行复制
- `launched`：仅在 `tool` 动作时返回，表示本地工具是否已发起

当前版本规则：

- 服务端不负责操作系统剪贴板写入
- `prompt` 动作由服务端返回正文内容，由前端负责复制
- `tool` 动作由服务端调用本地工具执行能力

### 16.6 运行时 Mermaid 节点详情接口

#### 16.6.1 `GET /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}`

用途：

- 读取当前选中的工作流节点在项目节点上下文中的动作详情
- 用于节点详情面板展示“动作类型、目标信息、是否可执行”

返回：

- `data.result` 为 `WorkflowRuntimeNodeDetail`

当前版本规则：

- 必须先校验 `projectNodeId` 存在
- 当前项目节点必须已绑定 `Workflow`
- `mermaidNodeId` 必须存在于当前工作流的 `mermaidSource` 节点集合中
- 若目标 Mermaid 节点存在但未绑定动作，返回 `200 OK`，其中：
  - `hasBinding = false`
  - `action = null`
- 若目标 Mermaid 节点绑定存在但目标对象缺失，仍返回 `200 OK`，其中：
  - `hasBinding = true`
  - `action.isExecutable = false`
  - `action.failureReason` 返回缺失原因（如 `prompt_not_found`、`tool_target_not_found`）

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `PROJECT_NODE_WORKFLOW_NOT_FOUND`
- `MERMAID_NODE_NOT_FOUND`

### 16.7 触发动作接口

#### 16.7.1 `POST /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}/trigger`

请求体：

当前版本允许空对象：

```json
{}
```

返回：

- `data.result` 为 `WorkflowRuntimeTriggerResult`

当前版本触发规则：

- 必须先校验 `projectNodeId` 存在
- 当前项目节点必须已绑定 `Workflow`
- `mermaidNodeId` 必须存在于当前工作流的 `mermaidSource` 节点集合中
- 目标 Mermaid 节点必须存在动作绑定

按动作类型的行为：

1. `prompt`

   - 解析并读取目标 Prompt 正文
   - 返回 `copyText`
   - 不由服务端直接复制到系统剪贴板
2. `tool`

   - 解析目标 `toolKey`
   - 调用本地工具执行能力
   - 返回是否已发起执行
错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `PROJECT_NODE_WORKFLOW_NOT_FOUND`
- `MERMAID_NODE_NOT_FOUND`
- `WORKFLOW_NODE_ACTION_NOT_FOUND`
- `PROMPT_NOT_FOUND`
- `TOOL_TARGET_NOT_FOUND`
- `INTERNAL_ERROR`

### 16.8 校验与错误语义

项目节点运行时动作当前优先使用以下错误语义：

- `404 + PROJECT_NODE_NOT_FOUND`
- `404 + PROJECT_NODE_WORKFLOW_NOT_FOUND`
- `404 + MERMAID_NODE_NOT_FOUND`
- `404 + WORKFLOW_NODE_ACTION_NOT_FOUND`
- `404 + PROMPT_NOT_FOUND`
- `404 + TOOL_TARGET_NOT_FOUND`
- `500 + INTERNAL_ERROR`

补充说明：

- `PROJECT_NODE_WORKFLOW_NOT_FOUND` 表示当前项目节点尚未绑定任何工作流
- `MERMAID_NODE_NOT_FOUND` 表示当前选中的 Mermaid 节点不在工作流源码节点集合中
- `WORKFLOW_NODE_ACTION_NOT_FOUND` 表示该 Mermaid 节点存在，但未配置动作绑定

### 16.9 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 前端如何保存当前选中的 `activeWorkflowNodeId`
- Mermaid 图内高亮与复杂交互
- 动作触发后的前端反馈动画

这些内容属于前端本地运行时行为，不属于服务端运行时动作契约。

---
