# 06. deliberations 与 summaries 内容契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 12-13 节 / L4-07 ~ L4-08

---

## 12. `L4-07` deliberations 内容契约

### 12.1 资源定位

`deliberations` 是挂载在 `ProjectNode` 下的推敲记录目录。

它的需求边界如下：

- 一个节点对应一个推敲记录目录入口
- 目录中可以包含多个 `.md` 推敲记录文件
- 默认追加到“最新合规文件”
- 若不存在任何合规文件，则自动创建新的合规文件作为写入目标
- 不合规文件允许显示，但不参与默认写入目标判定

当前版本中，`deliberations` 更适合建模为“节点下的内容能力”，而不是独立一级资源。

### 12.2 路由清单

当前版本先定义以下接口：

- `GET /api/project-nodes/{projectNodeId}/deliberations-records`
- `GET /api/project-nodes/{projectNodeId}/deliberations-records/files`
- `POST /api/project-nodes/{projectNodeId}/deliberations-records/append-latest`
- `POST /api/project-nodes/{projectNodeId}/deliberations-records/files`

说明：

- 路由资源名统一使用 `deliberations-records`，对应领域对象 `DeliberationsRecord` 与底层表 `deliberations_records`
- 同步文件名仍然是 `deliberations.csv`，但它只用于同步导入导出命名，不作为本节接口资源命名依据

### 12.3 DTO 约定

#### 12.3.1 DeliberationsRecordFolderInfo

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "exists": true,
  "fileCount": 2,
  "latestWritableFileName": "20260409-080000__需求澄清.md"
}
```

字段说明：

- `projectNodeId`：所属节点 ID
- `exists`：目录入口是否存在
- `fileCount`：目录内文件数量
- `latestWritableFileName`：当前默认追加目标；无合规文件时可为 `null`

#### 12.3.2 DeliberationsRecordFileItem

```json
{
  "fileName": "20260409-080000__需求澄清.md",
  "isNameCompliant": true,
  "isLatestWritable": true
}
```

字段说明：

- `fileName`：文件名
- `isNameCompliant`：是否符合 `yyyyMMdd-HHmmss__名称.md` 规则
- `isLatestWritable`：是否为当前默认写入目标

补充规则：

- 允许展示不合规文件
- 只有合规文件才可能成为 `isLatestWritable = true`
- 当前版本不在列表 DTO 中暴露绝对路径

#### 12.3.3 生命周期与一致性边界

`DeliberationsRecord` 当前版本不是面向前端独立创建的一级资源，而是 `ProjectNode` 的受管子对象。

生命周期规则：

- 创建 `ProjectNode` 时，服务端必须同步创建或补齐：
  - `deliberations_records` 中的一条目录入口记录
  - 节点下的 `deliberations/` 目录
- 客户端不直接创建或删除 `DeliberationsRecord` 记录本身
- 删除 `ProjectNode` 时，`deliberations_records` 记录必须随节点一起被清理
- 物理目录删除由节点删除流程统一处理，不在本节单独暴露删除接口

实现边界说明：

- 该清理可通过外键级联或节点删除流程统一编排实现
- `L4` 约束的是“不能遗留孤儿目录入口记录”，而不是具体删除机制

一致性边界：

- GET 接口只承担读取语义，不执行目录入口补齐、目录补建或其他隐式修复
- 若资源缺失，应直接返回明确错误语义，不做默认成功降级
- 自愈与修复职责不在本节 GET 契约中声明，应由启动自检、巡检修复等显式模块承担
- 在 `rebuild` 导入场景中，若 `deliberations.csv` 缺失，则导入必须失败
- 若 `deliberations.csv` 存在但内容不合法，则导入必须失败，而不是静默忽略

### 12.4 目录信息接口

#### 12.4.1 `GET /api/project-nodes/{projectNodeId}/deliberations-records`

用途：

- 读取节点推敲记录目录信息
- 用于节点详情面板判断默认写入目标和基本状态

返回：

- `data.deliberationsRecord` 为 `DeliberationsRecordFolderInfo`

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 12.5 文件列表接口

#### 12.5.1 `GET /api/project-nodes/{projectNodeId}/deliberations-records/files`

用途：

- 读取推敲记录目录下的文件列表
- 用于节点详情页展示推敲记录文件列表

返回：

- `data.items` 为 `DeliberationsRecordFileItem[]`

当前默认排序：

- 先按“是否合规”排序，合规文件在前
- 合规文件内部按文件名时间戳倒序
- 不合规文件排在后面，并按文件名升序

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 12.6 追加到最新文件接口

#### 12.6.1 `POST /api/project-nodes/{projectNodeId}/deliberations-records/append-latest`

请求体：

```json
{
  "content": "补充新的对话内容。"
}
```

字段规则：

- `content`：必填，必须为字符串

成功返回示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "fileName": "20260409-080000__需求澄清.md",
      "createdNewFile": false
    }
  },
  "meta": {}
}
```

当前版本规则：

- 只按文件名时间戳判定“最新合规文件”
- 若不存在任何合规文件，则先创建新文件再追加
- 不合规文件永远不作为默认追加目标
- 在执行追加前，应先确保 `deliberations_records` 与 `deliberations/` 已完成补齐

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

### 12.7 手动新建推敲记录文件接口

#### 12.7.1 `POST /api/project-nodes/{projectNodeId}/deliberations-records/files`

请求体：

```json
{
  "title": "阶段二澄清"
}
```

字段规则：

- `title`：可选；未传时由服务端使用默认标题生成文件名
- 当前版本不允许客户端直接提交完整文件名

成功返回示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "fileName": "20260409-090000__阶段二澄清.md"
    }
  },
  "meta": {}
}
```

当前版本规则：

- 新文件名必须符合 `yyyyMMdd-HHmmss__名称.md`
- 创建新文件不自动追加正文内容
- 新文件创建成功后会出现在推敲记录文件列表中
- 在执行新建前，应先确保 `deliberations_records` 与 `deliberations/` 已完成补齐

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`

### 12.8 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动抓取网页对话
- 消息角色识别
- 推敲记录文件内容全文读取接口

这些内容不属于当前版本已确认的最小契约范围。

---

## 13. `L4-08` summaries 内容契约

### 13.1 资源定位

`summaries` 是挂载在 `ProjectNode` 下的总结目录。

它的需求边界如下：

- 一个节点对应一个总结目录入口
- 总结内容以目录中文件列表表达
- 文件名不强制要求时间戳格式
- 不做“最新文件”判定
- 以人工编辑和整理为主

因此当前版本中，`summaries` 以“目录信息 + 文件列表能力”为主，不定义自动写入接口。

### 13.2 路由清单

当前版本先定义以下接口：

- `GET /api/project-nodes/{projectNodeId}/summaries`
- `GET /api/project-nodes/{projectNodeId}/summaries/files`

### 13.3 DTO 约定

#### 13.3.1 SummaryFolderInfo

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "exists": true,
  "fileCount": 3,
  "isEmpty": false
}
```

字段说明：

- `projectNodeId`：所属节点 ID
- `exists`：目录入口是否存在
- `fileCount`：目录内文件数量
- `isEmpty`：是否为空目录

#### 13.3.2 SummaryFileItem

```json
{
  "fileName": "阶段总结.md"
}
```

字段说明：

- `fileName`：文件名

补充规则：

- 当前版本不要求总结文件名符合时间戳规则
- 当前版本不在列表 DTO 中暴露绝对路径

#### 13.3.3 生命周期与一致性边界

`SummaryRecord` 当前版本不是面向前端独立创建的一级资源，而是 `ProjectNode` 的受管子对象。

生命周期规则：

- 创建 `ProjectNode` 时，服务端必须同步创建或补齐：
  - `summary_records` 中的一条目录入口记录
  - 节点下的 `summaries/` 目录
- 客户端不直接创建或删除 `SummaryRecord` 记录本身
- 删除 `ProjectNode` 时，`summary_records` 记录必须随节点一起被清理
- 物理目录删除由节点删除流程统一处理，不在本节单独暴露删除接口

实现边界说明：

- 该清理可通过外键级联或节点删除流程统一编排实现
- `L4` 约束的是“不能遗留孤儿总结目录入口记录”，而不是具体删除机制

一致性边界：

- GET 接口只承担读取语义，不执行目录入口补齐、目录补建或其他隐式修复
- 若资源缺失，应直接返回明确错误语义，不做默认成功降级
- 自愈与修复职责不在本节 GET 契约中声明，应由启动自检、巡检修复等显式模块承担
- 在 `rebuild` 导入场景中，若 `summaries.csv` 缺失，则导入必须失败
- 若 `summaries.csv` 存在但内容不合法，则导入必须失败，而不是静默忽略

### 13.4 目录信息接口

#### 13.4.1 `GET /api/project-nodes/{projectNodeId}/summaries`

用途：

- 读取节点总结目录信息
- 用于删除保护判断前的基础信息展示

返回：

- `data.summary` 为 `SummaryFolderInfo`

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 13.5 文件列表接口

#### 13.5.1 `GET /api/project-nodes/{projectNodeId}/summaries/files`

用途：

- 读取总结目录下的文件列表
- 用于节点详情页展示总结文件列表

返回：

- `data.items` 为 `SummaryFileItem[]`

当前默认排序：

- 按文件名升序

当前版本规则：

- 所有文件都直接展示
- 不做“最新文件”判定

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 13.6 与删除保护契约的边界

当前版本明确：

- `summaries` 是否为空，会直接影响节点删除保护流程
- 若 `summaries/` 非空，则节点删除不应直接成功
- `summaryArchives/` 仅作为删除保护目录存在，不属于 `summaries` 基础读取接口的一部分

### 13.7 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动生成总结内容
- 总结转存到 `summaryArchives/` 的执行接口
- 删除前二次确认编排

这些内容属于删除保护或更高层编排契约。

---


