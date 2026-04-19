# 07. 节点删除保护与 summaryArchives 契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 14 节 / L4-09

---

## 14. `L4-09` 节点删除保护与 `summaryArchives` 转存契约

### 14.1 能力定位

节点删除保护不是普通 CRUD 的附属细节，而是独立编排能力。

它负责：

- 删除前一次确认
- 检查 `summaries/` 是否非空
- 在需要时触发二次确认
- 在用户选择时先转存总结到 `summaryArchives/`
- 仅在保护流程通过后才真正执行节点删除

它不负责：

- 重新定义节点结构查询规则
- 解析总结文件内容语义

阅读边界：

- 节点基础元数据、树结构和工作流绑定，见第 11 节
- `summaries/` 的基础读取能力，见第 13 节
- 本节只负责“是否能删、如何删、删之前是否转存”

### 14.2 总体流程

当前版本正式流程如下：

1. 前端先调用删除检查接口
2. 服务返回是否需要二次确认，以及允许的删除策略
3. 前端在用户确认后调用删除执行接口
4. 若选择“先转存再删除”，服务先执行转存，再执行删除
5. 若转存失败，则整个删除流程必须中止

当前版本明确：

- `deliberations/` 不触发二次提醒
- `summaries/` 非空才触发二次提醒
- `summaryArchives/` 仅作为删除保护目录存在，不参与正式同步
- 删除语义是“只删除当前节点，不删除其子分支”
- 若目标节点存在直接子节点，则删除后这些子节点应改写为根层孤岛节点
- 根层孤岛节点在数据层仍必须保留结构关系记录，并以 `parentNodeId = null` / `parent_project_node_id IS NULL` 表达

### 14.3 路由清单

当前版本先定义以下接口：

- `POST /api/project-nodes/{projectNodeId}/deletion-check`
- `POST /api/project-nodes/{projectNodeId}/deletion-execute`

说明：

- 这两个接口属于显式动作接口
- 面向前端的正式删除流程必须使用它们
- 当前版本不对前端开放 `DELETE /api/project-nodes/{id}`

补充说明：

- 这两个接口是第 11 节中 `ProjectNode` 删除能力的正式展开
- 前端在节点详情面板或树节点菜单中发起删除时，应直接走这里定义的动作接口

### 14.4 DTO 约定

#### 14.4.1 ProjectNodeDeletionCheckResult

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "requiresSecondConfirmation": true,
  "directChildCount": 2,
  "summaryFileCount": 3,
  "allowedStrategies": [
    "archive_then_delete",
    "direct_delete"
  ]
}
```

字段说明：

- `projectNodeId`：目标节点 ID
- `requiresSecondConfirmation`：是否要求二次确认
- `directChildCount`：当前节点的直接子节点数量
- `summaryFileCount`：`summaries/` 中的文件数量
- `allowedStrategies`：当前允许的删除策略

策略值定义：

- `archive_then_delete`
- `direct_delete`

当前版本规则：

- 若 `summaryFileCount = 0`，则 `requiresSecondConfirmation = false`
- 若 `summaryFileCount = 0`，则 `allowedStrategies = ["direct_delete"]`
- 若 `summaryFileCount > 0`，则 `requiresSecondConfirmation = true`
- 若 `summaryFileCount > 0`，则 `allowedStrategies = ["archive_then_delete", "direct_delete"]`
- 当需要二次确认时，允许的策略为：
  - `archive_then_delete`
  - `direct_delete`

#### 14.4.2 ProjectNodeDeletionExecuteRequest

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

当前版本规则：

- `confirmDelete` 必须为 `true`
- 执行时必须基于当前实时删除检查结果判断是否仍需二次确认
- 若当前实时删除检查结果要求二次确认，则 `secondConfirmation` 必须为 `true`
- `strategy` 必须属于当前实时 `allowedStrategies`

#### 14.4.3 ProjectNodeDeletionExecuteResult

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "deleted": true,
  "usedStrategy": "archive_then_delete",
  "archived": true,
  "promotedToRootCount": 2
}
```

字段说明：

- `projectNodeId`：目标节点 ID
- `deleted`：是否已完成删除
- `usedStrategy`：实际采用的删除策略
- `archived`：是否完成总结转存
- `promotedToRootCount`：本次被提升为根层孤岛节点的直接子节点数量

### 14.5 删除检查接口

#### 14.5.1 `POST /api/project-nodes/{projectNodeId}/deletion-check`

用途：

- 获取删除前置条件
- 判断是否需要二次确认
- 返回当前允许的删除策略

请求体：

当前版本允许空对象：

```json
{}
```

返回：

- `data.result` 为 `ProjectNodeDeletionCheckResult`

当前版本规则：

- 必须先确认节点存在
- 必须统计当前节点的直接子节点数量
- 必须检查 `summaries/` 是否非空
- `deliberations/` 是否非空不影响二次确认判定
- 删除检查只判断当前节点是否允许删除，不因存在子节点而阻塞删除

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `INTERNAL_ERROR`

### 14.6 删除执行接口

#### 14.6.1 `POST /api/project-nodes/{projectNodeId}/deletion-execute`

请求体：

```json
{
  "confirmDelete": true,
  "secondConfirmation": true,
  "strategy": "archive_then_delete"
}
```

返回：

- `data.result` 为 `ProjectNodeDeletionExecuteResult`

当前版本执行规则：

- 必须先校验节点存在
- 执行前必须基于当前实时状态重新计算一次节点删除检查结果，而不是直接信任前一次 `deletion-check` 返回值
- 必须校验 `confirmDelete = true`
- 若当前实时删除检查结果要求二次确认，则必须校验 `secondConfirmation = true`
- 请求中的 `strategy` 必须属于当前实时 `allowedStrategies`
- 若 `strategy = archive_then_delete`：
  - 先转存 `summaries/` 到 `summaryArchives/<project-folder>/<node-folder>/`
  - 转存成功后才允许删除
- 若 `strategy = direct_delete`：
  - 直接执行删除
- 若目标节点存在直接子节点：
  - 必须先将这些子节点改写为根层孤岛节点
  - 直接子节点对应的结构关系记录必须保留，但其 `parentNodeId` / `parent_project_node_id` 改写为 `null`
  - 子分支内部原有父子关系保持不变
  - 这些直接子节点在根层中的相对顺序必须保持与删除前一致
  - 这些直接子节点的根层 `sortOrder` 必须按确定规则连续分配；当前版本统一采用“追加到当前根层末尾”的方式
  - 这些直接子节点原有的持久化画布坐标默认保持不变，不因提升为根层而自动重排

删除成功时的实际效果：

- 删除当前节点元数据
- 删除当前节点与父节点之间的结构关系
- 删除当前节点自己的工作流绑定、目录入口记录与磁盘内容
- 若存在直接子节点，则将其改写为根层孤岛节点，而不是一并删除
- 子分支内部原有父子关系保持不变
- 被提升的直接子节点保持原相对顺序，并以连续的新根层 `sortOrder` 追加到当前根层末尾
- 被提升节点已有的持久化画布坐标默认保持不变
- 若采用转存策略，则保留 `summaryArchives/` 中的转存结果

错误处理规则：

- 若 `confirmDelete` 缺失或为 `false`，返回 `412 + PRECONDITION_FAILED`
- 若当前实时状态需要二次确认但 `secondConfirmation` 不满足，返回 `412 + PRECONDITION_FAILED`
- 若请求中的 `strategy` 不属于当前实时 `allowedStrategies`，返回 `412 + PRECONDITION_FAILED`
- 若转存失败，则必须中止删除，并返回错误；不得出现“数据库已删但总结未转存成功”的不一致状态

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `PRECONDITION_FAILED`
- `SUMMARY_ARCHIVE_FAILED`
- `INTERNAL_ERROR`

### 14.7 `summaryArchives` 边界

当前版本明确：

- `summaryArchives/` 是工作区顶层固定目录
- 用途仅限于节点删除前的总结转存保护
- 不进入共享数据库
- 不参与正式同步导出
- 不作为 `summaries` 基础读取接口的一部分

当前版本推荐的目标路径语义：

- `summaryArchives/<project-folder>/<node-folder>/`
- 若目标归档目录已存在，则本次归档失败
- 禁止覆盖既有归档内容，也不执行自动改名或隐式清理后重试

### 14.8 校验与错误语义

节点删除保护当前优先使用以下错误语义：

- `404 + PROJECT_NODE_NOT_FOUND`
- `412 + PRECONDITION_FAILED`
- `500 + SUMMARY_ARCHIVE_FAILED`
- `500 + INTERNAL_ERROR`

补充说明：

- `PRECONDITION_FAILED` 用于一次确认或二次确认未满足
- `SUMMARY_ARCHIVE_FAILED` 用于“先转存再删除”策略下的转存失败

### 14.9 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 更细粒度的审计日志结构
- 批量删除流程
- `summaryArchives/` 的恢复或回滚接口

这些内容不属于当前版本已确认的最小契约范围。

---

