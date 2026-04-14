# 03. Workflow 与节点动作绑定契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 8-9 节 / L4-03 ~ L4-04

---

## 8. `L4-03` Workflow 资源 API 契约

### 8.1 资源定位

`Workflow` 资源用于管理可复用工作流对象。

它对应的需求边界如下：

- `Workflow` 的核心内容是 `mermaidSource`
- 工作流结构、元数据和关系由数据库承载
- 当前版本不单独建立 `workflows/` 落盘目录
- 工作流节点动作绑定与 `Workflow` 同模块维护，但不等于必须并入基础 CRUD

因此，`Workflow` 资源 API 需要体现“源码型结构资源”的特点，而不是机械复制 `Prompt` 的正文文件模型。

### 8.2 路由清单

当前版本先定义以下 Workflow 资源接口：

- `GET /api/workflows`
- `GET /api/workflows/{id}`
- `POST /api/workflows`
- `PATCH /api/workflows/{id}`
- `DELETE /api/workflows/{id}`

当前版本先把 `workflow_node_actions` 作为后续单独细化的子资源 / 动作契约，不直接并入本节基础 CRUD。

### 8.3 Workflow DTO 约定

#### 8.3.1 WorkflowSummary

用于列表展示。

```json
{
  "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "需求分析工作流",
  "description": "用于需求拆解与任务澄清。",
  "tags": "",
  "category": "analysis",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `id`：Workflow 主键 ID
- `name`：工作流名称
- `description`：描述
- `tags`：标签原始文本；当前版本不在 API 层拆成数组
- `category`：分类
- `createdAt`：创建时间
- `updatedAt`：更新时间

#### 8.3.2 WorkflowDetail

用于单资源读取与创建、更新后的返回。

```json
{
  "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "需求分析工作流",
  "description": "用于需求拆解与任务澄清。",
  "tags": "",
  "category": "analysis",
  "mermaidSource": "flowchart TD\\n    A[开始] --> B[分析需求]",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

补充规则：

- `WorkflowDetail` 包含 `mermaidSource`
- 当前版本不暴露任何 `workflow` 文件路径字段，因为工作流没有独立正文文件目录
- `workflow_node_actions` 不直接并入 `WorkflowDetail`，后续在独立契约中细化

### 8.4 列表接口

#### 8.4.1 `GET /api/workflows`

用途：

- 读取 Workflow 列表
- 用于工作流维护页列表展示与基础筛选

查询参数：

- `keyword`：可选，按名称或描述做模糊过滤
- `category`：可选，按分类过滤

当前返回：

- `data.items` 为 `WorkflowSummary[]`

当前默认排序：

- 按 `updatedAt` 倒序
- 若更新时间相同，则按 `name` 升序

成功响应示例：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
        "name": "需求分析工作流",
        "description": "用于需求拆解与任务澄清。",
        "tags": "",
        "category": "analysis",
        "createdAt": "2026-04-09T08:00:00Z",
        "updatedAt": "2026-04-09T08:00:00Z"
      }
    ]
  },
  "meta": {}
}
```

### 8.5 单资源读取接口

#### 8.5.1 `GET /api/workflows/{id}`

用途：

- 读取单个 Workflow 的完整详情
- 用于工作流维护页编辑 Mermaid 源码与查看工作流详情

返回：

- `data.workflow` 为 `WorkflowDetail`

`404` 错误码建议：

- `WORKFLOW_NOT_FOUND`

### 8.6 创建接口

#### 8.6.1 `POST /api/workflows`

请求体：

```json
{
  "name": "需求分析工作流",
  "description": "用于需求拆解与任务澄清。",
  "tags": "",
  "category": "analysis",
  "mermaidSource": "flowchart TD\\n    A[开始] --> B[分析需求]"
}
```

字段规则：

- `name`：必填，去除首尾空白后不能为空
- `description`：可选，默认 `""`
- `tags`：可选，默认 `""`
- `category`：可选，默认 `""`
- `mermaidSource`：可选，默认 `""`

当前版本禁止客户端传入：

- `id`
- `createdAt`
- `updatedAt`

成功语义：

- 创建工作流元数据
- 保存 `mermaidSource`
- 成功后返回 `201 Created`
- `data.workflow` 返回完整 `WorkflowDetail`

当前版本说明：

- `Workflow` 的创建不涉及文件目录初始化
- `Workflow` 的创建不自动生成节点动作绑定

### 8.7 更新接口

#### 8.7.1 `PATCH /api/workflows/{id}`

请求体：

```json
{
  "name": "需求分析工作流（更新版）",
  "description": "用于更细致地拆解需求与任务。",
  "mermaidSource": "flowchart TD\\n    A[开始] --> B[澄清目标] --> C[拆分任务]"
}
```

字段规则：

- 请求体所有字段均为可选
- 允许部分更新
- 若传入 `name`，则去除首尾空白后不能为空
- 若传入 `description`、`tags`、`category`、`mermaidSource`，则必须为字符串

当前版本禁止客户端更新：

- `id`
- `createdAt`
- `updatedAt`

成功语义：

- 工作流元数据更新写入数据库
- `mermaidSource` 更新写入数据库
- 成功后返回 `200 OK`
- `data.workflow` 返回更新后的完整 `WorkflowDetail`

需求边界说明：

- 前端负责根据 `mermaidSource` 做渲染
- `PATCH /api/workflows/{id}` 本身不承担“触发节点动作”职责
- `PATCH /api/workflows/{id}` 本身也不替代节点动作绑定维护接口
- 若 `mermaidSource` 发生变化，服务端必须在同一次更新流程中重新计算合法节点集合，并自动清理已失效的 `workflow_node_actions`
- 以上自动清理只负责移除失效绑定，不负责自动补建缺失绑定
- 若发生自动清理，可在 `meta.bindingSync` 中返回摘要，但不改变 `data.workflow` 的主结构

错误码建议：

- `WORKFLOW_NOT_FOUND`

### 8.8 删除接口

#### 8.8.1 `DELETE /api/workflows/{id}`

用途：

- 删除 Workflow 资源本身

成功返回：

```json
{
  "success": true,
  "data": {
    "result": {
      "deleted": true
    }
  },
  "meta": {}
}
```

成功语义：

- 删除工作流元数据
- 级联删除该工作流下的 `workflow_node_actions`
- 级联删除引用该工作流的 `project_node_workflows` 绑定关系

实现边界说明：

- 上述清理结果可以通过数据库级联、服务层编排或同事务删除流程实现
- `L4` 只要求最终结果一致，不强制底层必须依赖某一种实现手段

当前版本规则：

- 删除 Workflow 不应删除任何 `ProjectNode`
- 删除 Workflow 后，原先绑定该工作流的项目节点会变为“未绑定工作流”状态
- 若目标 Workflow 不存在，返回 `404`

错误码建议：

- `WORKFLOW_NOT_FOUND`

### 8.9 校验与错误语义

Workflow 资源当前优先使用以下错误语义：

- `404 + WORKFLOW_NOT_FOUND`
- `409 + CONFLICT`
- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

说明：

- `VALIDATION_ERROR` 用于字段类型、必填项、空字符串等契约校验失败
- `CONFLICT` 用于唯一约束冲突或其他资源冲突
- Mermaid 结构相关的更细粒度校验错误，后续可在需要时补充专用错误码

### 8.10 当前版本刻意不暴露的内容

为避免把工作流资源和动作执行、绑定维护混在一起，当前版本的 Workflow 基础 CRUD 不直接暴露：

- `workflow` 文件路径或目录路径
- 工作流节点动作执行能力
- 工作流节点动作绑定维护能力的完整写接口

这些内容将在后续动作型或子资源型契约中继续细化。

---

## 9. `L4-04` Workflow 节点动作绑定契约

### 9.1 资源定位

`workflow_node_actions` 用于维护：

- 某个 `Workflow`
- 其内部某个 `mermaidNodeId`
- 对应的动作绑定关系

它的归属主体是 `Workflow`，而不是 `Prompt`、`Tool` 或 `ProjectNode`。

原因：

- 绑定关系的主键语义依赖 `workflowId + mermaidNodeId`
- `prompt` 和 `tool` 只是被引用目标
- 绑定关系本身属于工作流结构配置的一部分

因此，这组接口应挂在 `Workflow` 之下。

### 9.2 与运行时动作执行的边界

当前契约明确区分两类能力：

1. 绑定关系维护负责把工作流节点配置成 `prompt`、`tool`
2. 运行时动作触发
   负责在项目节点上下文中真正执行或触发动作

当前章节只定义“绑定关系维护”，不定义运行时动作执行。

### 9.3 路由清单

当前版本先定义以下接口：

- `GET /api/workflows/{workflowId}/node-actions`
- `POST /api/workflows/{workflowId}/node-actions`
- `PATCH /api/workflows/{workflowId}/node-actions/{mermaidNodeId}`
- `DELETE /api/workflows/{workflowId}/node-actions/{mermaidNodeId}`
- `POST /api/workflows/{workflowId}/node-actions/sync`

说明：

- `mermaidNodeId` 在路径中使用原始节点标识语义
- 一个 `Workflow` 内的一个 `mermaidNodeId` 当前最多绑定一个主动作

### 9.4 DTO 约定

#### 9.4.1 WorkflowNodeActionItem

```json
{
  "workflowId": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "mermaidNodeId": "node-analyze",
  "actionType": "prompt",
  "targetRef": "018f3f2b-1111-7b1b-9a12-123456789abc",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `workflowId`：所属工作流 ID
- `mermaidNodeId`：Mermaid 节点标识
- `actionType`：当前支持 `prompt` / `tool`
- `targetRef`：动作目标引用
- `createdAt`：创建时间
- `updatedAt`：更新时间

#### 9.4.2 WorkflowNodeActionUpsertRequest

```json
{
  "mermaidNodeId": "node-analyze",
  "actionType": "prompt",
  "targetRef": "018f3f2b-1111-7b1b-9a12-123456789abc"
}
```

字段规则：

- `mermaidNodeId`：必填，不能为空
- `actionType`：必填，当前仅允许 `prompt`、`tool`
- `targetRef`：必填；当前版本保留为字符串

当前语义：

- `actionType = prompt` 时，`targetRef` 指向 `Prompt.id`
- `actionType = tool` 时，`targetRef` 指向本地工具配置中的 `tool_key`

### 9.5 列表接口

#### 9.5.1 `GET /api/workflows/{workflowId}/node-actions`

用途：

- 读取某个工作流下全部节点动作绑定
- 用于工作流维护页展示和编辑绑定信息

返回：

- `data.items` 为 `WorkflowNodeActionItem[]`

当前默认排序：

- 按 `mermaidNodeId` 升序

错误码建议：

- `WORKFLOW_NOT_FOUND`

### 9.6 创建接口

#### 9.6.1 `POST /api/workflows/{workflowId}/node-actions`

请求体：

```json
{
  "mermaidNodeId": "node-analyze",
  "actionType": "prompt",
  "targetRef": "018f3f2b-1111-7b1b-9a12-123456789abc"
}
```

成功语义：

- 为指定工作流中的指定 Mermaid 节点创建绑定关系
- 成功后返回 `201 Created`
- `data.nodeAction` 返回 `WorkflowNodeActionItem`

约束：

- 同一 `workflowId` 下，同一 `mermaidNodeId` 只能存在一条绑定
- 创建时必须校验目标 `workflowId` 存在
- 创建时必须基于当前工作流的 `mermaidSource` 校验 `mermaidNodeId` 是否存在于节点集合中
- `actionType = prompt` 时必须校验 `targetRef` 对应的 Prompt 存在
- `actionType = tool` 时必须校验 `targetRef` 对应的 `tool_key` 在本地工具配置中存在

错误码建议：

- `WORKFLOW_NOT_FOUND`
- `MERMAID_NODE_NOT_FOUND`
- `PROMPT_NOT_FOUND`
- `TOOL_TARGET_NOT_FOUND`
- `CONFLICT`

### 9.7 更新接口

#### 9.7.1 `PATCH /api/workflows/{workflowId}/node-actions/{mermaidNodeId}`

请求体：

```json
{
  "actionType": "tool",
  "targetRef": "openai-cli"
}
```

字段规则：

- 当前版本更新接口不允许修改路径中的 `mermaidNodeId`
- 请求体允许更新 `actionType` 与 `targetRef`
- 若传入 `actionType`，则必须是允许值
- 若传入 `targetRef`，则必须为字符串且不能为空
- 若 `actionType` 发生变化（相对当前记录），则必须同时提交配套 `targetRef`
- 更新校验必须基于“更新后的最终有效状态”进行联合校验，不允许拆分为单字段独立放行
- 若 `actionType` 变化但缺少配套 `targetRef`，返回 `422 + VALIDATION_ERROR`

成功语义：

- 更新指定节点绑定关系
- 成功后返回 `200 OK`
- `data.nodeAction` 返回更新后的 `WorkflowNodeActionItem`

错误码建议：

- `WORKFLOW_NOT_FOUND`
- `WORKFLOW_NODE_ACTION_NOT_FOUND`
- `PROMPT_NOT_FOUND`
- `TOOL_TARGET_NOT_FOUND`
- `VALIDATION_ERROR`

### 9.8 删除接口

#### 9.8.1 `DELETE /api/workflows/{workflowId}/node-actions/{mermaidNodeId}`

用途：

- 删除指定节点的动作绑定

成功返回：

```json
{
  "success": true,
  "data": {
    "result": {
      "deleted": true
    }
  },
  "meta": {}
}
```

当前版本规则：

- 删除绑定不会删除 `Workflow` 本身
- 删除绑定不会删除 `Prompt` 或工具配置
- 若指定绑定不存在，返回 `404`

错误码建议：

- `WORKFLOW_NOT_FOUND`
- `WORKFLOW_NODE_ACTION_NOT_FOUND`

### 9.9 同步接口

#### 9.9.1 `POST /api/workflows/{workflowId}/node-actions/sync`

用途：

- 基于当前 `mermaidSource` 校验节点绑定是否失效
- 清理已不存在的 Mermaid 节点绑定
- 返回同步后的绑定结果摘要

请求体：

当前版本可为空对象：

```json
{}
```

成功返回示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "removedCount": 1,
      "remainingCount": 3
    }
  },
  "meta": {}
}
```

当前版本规则：

- 必须基于当前工作流的 `mermaidSource` 重新计算合法节点集合
- 对于已不在节点集合中的绑定，必须清理
- 对于仍然合法的绑定，保留原值
- 该接口是配置同步接口，不是运行时动作执行接口
- `PATCH /api/workflows/{id}` 在更新 `mermaidSource` 时，也必须隐式执行同等的失效绑定清理
- 本接口保留为显式人工重扫入口，用于导入恢复后、人工修表后或需要独立清理时调用

错误码建议：

- `WORKFLOW_NOT_FOUND`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

### 9.10 校验与错误语义

Workflow 节点动作绑定当前优先使用以下错误语义：

- `404 + WORKFLOW_NOT_FOUND`
- `404 + WORKFLOW_NODE_ACTION_NOT_FOUND`
- `404 + MERMAID_NODE_NOT_FOUND`
- `404 + PROMPT_NOT_FOUND`
- `404 + TOOL_TARGET_NOT_FOUND`
- `409 + CONFLICT`
- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

补充说明：

- `MERMAID_NODE_NOT_FOUND` 表示目标节点不在当前 `mermaidSource` 中
- `WORKFLOW_NODE_ACTION_NOT_FOUND` 表示目标绑定记录不存在
- `TOOL_TARGET_NOT_FOUND` 表示配置中的工具目标不存在

### 9.11 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 项目节点上下文中的动作触发
- `activeWorkflowNodeId` 等本地运行时状态
- Mermaid 图中的点击交互细节

这些内容属于运行时交互或项目节点上下文契约，后续单独定义。

---
