# 个人AI工作流导航器-接口实现清单-v1

## 1. 文档定位

本文档用于把当前 `L4` 契约压缩成“接口线程可直接开工”的实现清单。

它不重新定义设计，只做三件事：

- 明确本轮接口实现范围
- 给出推荐开发顺序
- 给出每块的最小验收标准

设计依据：

- `个人AI工作流导航器-接口与数据契约-v1.md`
- `个人AI工作流导航器-模块设计-v1.md`
- `个人AI工作流导航器-数据库表结构设计-v1.md`

---

## 2. 本轮目标

接口线程本轮需要交付一套可供前端联调的本地 HTTP JSON API，覆盖以下能力：

1. 通用 HTTP 响应与错误壳
2. Prompt 资源接口
3. Workflow 资源接口
4. Workflow 节点动作绑定接口
5. Solution 资源与 Solution-Project 归属接口
6. Project 资源接口
7. ProjectNode 资源接口
8. conversation-records 内容接口
9. summaries 内容接口
10. 节点删除保护接口
11. Project 视图配置接口
12. ProjectNode 运行时动作接口
13. inspections 巡检接口
14. sync 导入导出接口
15. system 启动报告 / 手动自检接口

---

## 3. 开工顺序

推荐严格按下面顺序推进，减少返工：

1. 统一底座
2. Prompt / Workflow / Solution / Project 基础资源
3. Workflow 节点动作绑定
4. ProjectNode 资源
5. 节点内容接口
6. 删除保护与运行时动作
7. 视图配置
8. 巡检
9. 导入导出
10. 启动报告 / 手动自检

原因：

- 资源接口是后续动作接口的依赖
- `ProjectNode` 依赖 `Project`、`Workflow`
- 运行时动作依赖 `ProjectNode -> workflowId -> workflow_node_actions`
- 巡检、导入导出、自检都需要前面的底层能力已可复用

---

## 4. 统一底座

### 4.1 必做项

- 实现统一成功响应结构
- 实现统一错误响应结构
- 实现统一错误码映射
- 实现路由前缀 `/api`
- 实现请求 / 响应 JSON `lowerCamelCase`
- 实现统一的 ID / 时间序列化规则

### 4.2 最小验收

- 所有接口都返回统一顶层结构
- `404 / 409 / 422 / 500` 的错误体形状一致
- 所有时间字段输出 UTC ISO 8601 字符串
- 所有 ID 字段输出 UUIDv7 字符串语义

---

## 5. 资源接口实现清单

### 5.1 Prompt

必做接口：

- `GET /api/prompts`
- `GET /api/prompts/{id}`
- `POST /api/prompts`
- `PATCH /api/prompts/{id}`
- `DELETE /api/prompts/{id}`

实现要点：

- 元数据读写 `prompts`
- 正文读写 `prompts/` 下 `.md` 文件
- 创建时数据库与文件写入要么都成功，要么都失败
- 更新时不暴露 `contentFilePath`
- 名称变化不自动改正文文件路径

验收点：

- 创建后能立即读到 `content`
- 删除后数据库记录和正文文件都消失
- 文件失败不能伪装成接口成功

### 5.2 Workflow

必做接口：

- `GET /api/workflows`
- `GET /api/workflows/{id}`
- `POST /api/workflows`
- `PATCH /api/workflows/{id}`
- `DELETE /api/workflows/{id}`

实现要点：

- 元数据与 `mermaidSource` 读写 `workflows`
- 删除时依赖数据库级联清理 `workflow_node_actions`、`project_node_workflows`
- 更新 `mermaidSource` 时必须自动清理失效 `workflow_node_actions`
- 可选地在 `meta.bindingSync` 返回自动清理摘要

验收点：

- 改 Mermaid 后，不存在指向已删除 Mermaid 节点的旧绑定
- 删除 Workflow 后，ProjectNode 不被删除，只变成未绑定工作流

### 5.3 Solution

必做接口：

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

实现要点：

- `solutions` 管元数据
- `solution_projects` 管项目归属和顺序
- 项目归属写接口统一走 `Solution` 侧
- 删除 `Solution` 只删自身和关系，不删 `Project`
- 不为“未归组项目”创建虚拟 `Solution`

验收点：

- 一个项目可同时属于多个方案
- 未归组项目通过“项目列表 + 项目所属方案列表”即可识别

### 5.4 Project

必做接口：

- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PATCH /api/projects/{id}`

实现要点：

- 元数据读写 `projects`
- 创建时初始化项目目录
- 不暴露 `folderPath`
- 本轮不开放 Project 删除

验收点：

- 创建项目后目录可用
- 更新名称不自动改已有目录

### 5.5 ProjectNode

必做接口：

- `GET /api/projects/{projectId}/nodes`
- `POST /api/projects/{projectId}/nodes`
- `GET /api/project-nodes/{id}`
- `PATCH /api/project-nodes/{id}`

实现要点：

- 元数据写入 `project_nodes`
- 父子关系写入 `project_node_relations`
- 工作流绑定写入 `project_node_workflows`
- 创建节点时初始化：
  - 节点目录
  - `chatLogs/`
  - `summaries/`
  - `conversation_records`
  - `insight_records`
- 更新时支持改父节点、排序、工作流绑定
- 必须拦截循环结构

验收点：

- 创建节点后，数据库关系和目录入口都齐全
- `workflowId = null` 能正确清除绑定
- 不允许跨项目挂父节点

---

## 6. 动作与子资源接口清单

### 6.1 Workflow 节点动作绑定

必做接口：

- `GET /api/workflows/{workflowId}/node-actions`
- `POST /api/workflows/{workflowId}/node-actions`
- `PATCH /api/workflows/{workflowId}/node-actions/{mermaidNodeId}`
- `DELETE /api/workflows/{workflowId}/node-actions/{mermaidNodeId}`
- `POST /api/workflows/{workflowId}/node-actions/sync`

实现要点：

- 校验 `workflowId`
- 校验 `mermaidNodeId` 确实存在于当前 `mermaidSource`
- `prompt` 要校验目标 Prompt 存在
- `tool` 要校验 `toolKey` 存在
- `link` 允许配置但本轮不执行

验收点：

- 不允许创建同一 `workflowId + mermaidNodeId` 的重复绑定
- `sync` 能移除失效绑定

### 6.2 conversation-records

必做接口：

- `GET /api/project-nodes/{projectNodeId}/conversation-records`
- `GET /api/project-nodes/{projectNodeId}/conversation-records/files`
- `POST /api/project-nodes/{projectNodeId}/conversation-records/append-latest`
- `POST /api/project-nodes/{projectNodeId}/conversation-records/files`

实现要点：

- 目录入口读写 `conversation_records`
- 实际文件目录是 `chatLogs/`
- 读写前先做幂等补齐：
  - 缺记录补记录
  - 缺目录补目录
- “最新文件”只按合规文件名时间戳判定
- 不合规文件允许展示，但不参与默认写入目标

验收点：

- 没有合规文件时，`append-latest` 自动先建一个新文件
- 只有合规文件会被认成默认写入目标

### 6.3 summaries

必做接口：

- `GET /api/project-nodes/{projectNodeId}/summaries`
- `GET /api/project-nodes/{projectNodeId}/summaries/files`

实现要点：

- 目录入口读写 `insight_records`
- 实际文件目录是 `summaries/`
- 读取前先做幂等补齐：
  - 缺记录补记录
  - 缺目录补目录
- 不做“最新文件”判定

验收点：

- 任意文件名都可展示
- `isEmpty`、`fileCount` 结果稳定

### 6.4 节点删除保护

必做接口：

- `POST /api/project-nodes/{projectNodeId}/deletion-check`
- `POST /api/project-nodes/{projectNodeId}/deletion-execute`

实现要点：

- 检查 `summaries/` 是否非空
- `chatLogs/` 不作为二次确认条件
- 若选择转存，先转到 `summaryArchives/` 再删节点
- 删除流程统一处理数据库、关系和物理目录

验收点：

- `summaries/` 非空时不能直接删成功
- 转存失败必须中止删除

### 6.5 ProjectNode 运行时动作

必做接口：

- `GET /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}`
- `POST /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}/trigger`

实现要点：

- 基于 `projectNodeId -> workflowId -> workflow_node_actions` 解析
- `prompt` 返回 `copyText`
- `tool` 调用本地工具模块
- `link` 返回不支持错误
- 不持久化 `activeProjectNodeId` / `activeWorkflowNodeId`

验收点：

- 节点未绑定 Workflow 时返回 `PROJECT_NODE_WORKFLOW_NOT_FOUND`
- Mermaid 节点存在但无绑定时，详情接口返回 `200` 且 `hasBinding = false`

---

## 7. 视图、巡检、导入导出、自检

### 7.1 Project 视图配置

必做接口：

- `GET /api/projects/{projectId}/node-layouts`
- `PATCH /api/projects/{projectId}/node-layouts`
- `GET /api/projects/{projectId}/viewport`
- `PATCH /api/projects/{projectId}/viewport`

实现要点：

- 节点坐标 upsert `project_node_layouts`
- 视角 upsert `project_viewports`
- `PATCH /node-layouts` 只更新出现过的节点，不隐式删除其他布局
- `zoom > 0`

验收点：

- 同请求内重复 `projectNodeId` 返回校验错误
- 不属于该项目的节点不能写布局

### 7.2 inspections

必做接口：

- `POST /api/inspections/run`

至少覆盖的 `issueType`：

- `INDEXED_FILE_MISSING`
- `UNINDEXED_FILE_FOUND`
- `WORKFLOW_NODE_ACTION_STALE`
- `WORKFLOW_NODE_ACTION_MISSING`
- `PROJECT_NODE_WORKFLOW_MISSING`
- `BINDING_TARGET_NOT_FOUND`
- `TOOL_TARGET_NOT_FOUND`

实现要点：

- 巡检发现业务问题时仍返回成功结构
- 只有执行过程异常才返回接口级错误

验收点：

- Mermaid 已删节点但绑定残留时，能报 `WORKFLOW_NODE_ACTION_STALE`

### 7.3 sync

必做接口：

- `POST /api/sync/export`
- `POST /api/sync/import`

实现要点：

- 导出 `manifest.json` 和全部表级 CSV
- 导入仅支持 `mode = rebuild`
- `rebuild` 时不允许静默缺少：
  - `conversations.csv`
  - `insights.csv`
- `summaryArchives/` 不参与正式同步

验收点：

- 若有 `project_nodes.csv` 但缺 `conversations.csv` 或 `insights.csv`，返回 `VALIDATION_ERROR`

### 7.4 system

必做接口：

- `GET /api/system/startup-report`
- `POST /api/system/self-check`

实现要点：

- 返回最近一次启动报告
- 手动自检重复底座检查项
- 目录缺失可自动补齐
- 配置或 schema 问题以失败结果表达

验收点：

- 接口成功时，失败项应优先体现在结果结构中，不是随手抛 `500`

---

## 8. 本轮不做

- Project 删除接口
- Summary 正文写入接口
- 对话正文全文读取接口
- `link` 动作真实执行
- 自动同步
- 增量导入
- 自动冲突解决
- 自动回滚
- 只读降级模式

---

## 9. 联调前自测清单

接口线程在交前端前，至少自测以下场景：

1. 新建 `ProjectNode` 后，目录、关系、内容入口记录全部就绪
2. 修改 `Workflow.mermaidSource` 后，失效绑定被自动清理
3. `conversation-records` 在缺目录入口时能自动补齐并继续工作
4. `summaries` 在缺目录入口时能自动补齐并继续读取
5. 一个 `Project` 同时绑定两个 `Solution` 能正确读回
6. 巡检能扫出 `WORKFLOW_NODE_ACTION_STALE`
7. `sync import rebuild` 遇到缺失 `conversations.csv` / `insights.csv` 会失败

---

## 10. 建议拆任务方式

如果接口线程要拆分并行开发，推荐这样分：

1. 统一底座 + 错误映射
2. Prompt / Workflow / Solution / Project 基础资源
3. ProjectNode + 内容目录入口初始化
4. node-actions + workflow-runtime
5. conversation-records + summaries + deletion
6. view-config + inspections + sync + system

这样拆的好处是依赖关系比较清楚，冲突也相对少。
