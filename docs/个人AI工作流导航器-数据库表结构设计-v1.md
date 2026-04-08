# 个人 AI 工作流导航器数据库表结构设计 v1

## 1. 文档目标

本文档用于定义当前版本的 SQLite 数据库表结构设计，作为后续建表、迁移、导入导出和接口实现的依据。

本文档关注：

- 表清单
- 字段设计
- 主键与唯一约束
- 外键与删除策略
- 索引建议
- 与同步导出文件的对应关系

本文档不关注：

- 具体 SQL 迁移脚本
- ORM 选型
- 前端 DTO 细节

---

## 2. 总体设计原则

### 2.1 运行时数据库职责

SQLite 是运行时元数据、关系和查询能力的唯一数据源。  
数据库中不直接保存所有真实内容正文，但负责承载这些内容的索引、关系和定位信息。

### 2.2 路径字段规则

所有文件路径和文件夹路径字段统一保存相对路径。  
数据库中不保存业务数据层的绝对路径。

### 2.3 主键规则

所有主键统一使用 `TEXT` 类型存储 `UUIDv7`。

### 2.4 时间字段规则

所有通用实体表建议包含：

- `created_at`
- `updated_at`

时间格式建议统一为 ISO 8601 字符串，使用 UTC。

### 2.5 删除策略

当前版本采用级联删除策略。  
当上游实体删除时，相关关系记录、附属记录和从属记录应一并删除。

### 2.6 排序规则

所有排序字段统一采用：

- `sort_order INTEGER NOT NULL`

语义：

- 数值越小越靠前
- 只在同一父级范围内有意义

---

## 3. 命名约定

### 3.1 表命名

表名统一使用小写蛇形命名。

### 3.2 字段命名

字段统一使用小写蛇形命名。

### 3.3 布尔字段

SQLite 中布尔值统一使用 `INTEGER`，取值约定：

- `0` = false
- `1` = true

### 3.4 状态字段

状态字段统一使用 `TEXT`，通过应用层枚举约束。

---

## 4. 表总览

当前版本建议包含以下表：

1. `prompts`
2. `workflows`
3. `workflow_node_actions`
4. `projects`
5. `project_nodes`
6. `project_node_relations`
7. `project_node_workflows`
8. `solutions`
9. `solution_projects`
10. `conversation_records`
11. `insight_records`
12. `runtime_views`

说明：

- `runtime_views` 用于承载当前版本需要持久化的运行时视图状态。
- 如果后续确定某些运行时状态只保存在内存，也可以把该表改为可选。

---

## 5. 实体表设计

### 5.1 `prompts`

用途：保存提示词元数据。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `name` | `TEXT` | `NOT NULL` | 提示词名称 |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | 描述 |
| `tags` | `TEXT` | `NOT NULL DEFAULT ''` | 标签原始文本，当前版本先不拆标签表 |
| `category` | `TEXT` | `NOT NULL DEFAULT ''` | 类别 |
| `content_file_path` | `TEXT` | `NOT NULL UNIQUE` | 正文文件相对路径 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

建议索引：

- `idx_prompts_name` on `name`
- `idx_prompts_category` on `category`

导出文件对应：

- `dbSyncs/prompts.csv`

### 5.2 `workflows`

用途：保存工作流元数据和 Mermaid 源码。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `name` | `TEXT` | `NOT NULL` | 工作流名称 |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | 描述 |
| `tags` | `TEXT` | `NOT NULL DEFAULT ''` | 标签原始文本 |
| `category` | `TEXT` | `NOT NULL DEFAULT ''` | 类别 |
| `mermaid_source` | `TEXT` | `NOT NULL DEFAULT ''` | Mermaid 源码文本 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

建议索引：

- `idx_workflows_name` on `name`
- `idx_workflows_category` on `category`

导出文件对应：

- `dbSyncs/workflows.csv`

### 5.3 `workflow_node_actions`

用途：保存工作流节点动作绑定关系。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `workflow_id` | `TEXT` | `NOT NULL` | 关联工作流 |
| `mermaid_node_id` | `TEXT` | `NOT NULL` | Mermaid 节点标识 |
| `action_type` | `TEXT` | `NOT NULL` | `prompt` / `tool` / `link` |
| `target_ref` | `TEXT` | `NOT NULL DEFAULT ''` | 动作目标引用 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

约束建议：

- `UNIQUE(workflow_id, mermaid_node_id)`

外键建议：

- `workflow_id` references `workflows(id)` on delete cascade

说明：

- 当前版本不对 `target_ref` 建外键，因为它可能引用不同类型对象。
- `action_type = prompt` 时由应用层校验 `target_ref` 是否存在于 `prompts.id`
- `action_type = tool` 时由应用层校验 `target_ref` 是否存在于本地工具配置中的 `tool_key`

建议索引：

- `idx_workflow_node_actions_workflow_id` on `workflow_id`
- `idx_workflow_node_actions_action_type` on `action_type`

导出文件对应：

- `dbSyncs/workflow_node_actions.csv`

### 5.4 `projects`

用途：保存项目元数据。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `name` | `TEXT` | `NOT NULL` | 项目名称 |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | 描述 |
| `tags` | `TEXT` | `NOT NULL DEFAULT ''` | 标签原始文本 |
| `category` | `TEXT` | `NOT NULL DEFAULT ''` | 类别 |
| `folder_path` | `TEXT` | `NOT NULL UNIQUE` | 项目目录相对路径 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

说明：

- `folder_path` 记录项目目录落点，例如 `projects/project-name__shortId`

建议索引：

- `idx_projects_name` on `name`
- `idx_projects_category` on `category`

导出文件对应：

- `dbSyncs/projects.csv`

### 5.5 `project_nodes`

用途：保存项目节点元数据。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `project_id` | `TEXT` | `NOT NULL` | 所属项目 |
| `name` | `TEXT` | `NOT NULL` | 节点名称 |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | 描述 |
| `status` | `TEXT` | `NOT NULL DEFAULT 'default'` | `default` / `todo` / `fix` |
| `folder_path` | `TEXT` | `NOT NULL UNIQUE` | 节点目录相对路径 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

外键建议：

- `project_id` references `projects(id)` on delete cascade

说明：

- `folder_path` 记录节点目录落点，例如 `projects/project-name__shortId/node-name__shortId`
- 当前版本节点不允许跨项目复用，因此节点表显式带 `project_id`

建议索引：

- `idx_project_nodes_project_id` on `project_id`
- `idx_project_nodes_status` on `status`
- `idx_project_nodes_name` on `name`

导出文件对应：

- `dbSyncs/project_nodes.csv`

### 5.6 `project_node_relations`

用途：保存项目中的父子结构关系。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `project_id` | `TEXT` | `NOT NULL` | 所属项目 |
| `parent_project_node_id` | `TEXT` | `NULL` | 父节点，为空表示根层 |
| `child_project_node_id` | `TEXT` | `NOT NULL` | 子节点 |
| `sort_order` | `INTEGER` | `NOT NULL` | 同级排序 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |

约束建议：

- `UNIQUE(project_id, child_project_node_id)`
- `UNIQUE(project_id, parent_project_node_id, child_project_node_id)`

外键建议：

- `project_id` references `projects(id)` on delete cascade
- `parent_project_node_id` references `project_nodes(id)` on delete cascade
- `child_project_node_id` references `project_nodes(id)` on delete cascade

说明：

- 当前设计默认一个节点在同一个项目内只有一个父节点，因此 `child_project_node_id` 在同一项目内唯一
- 根节点可通过 `parent_project_node_id IS NULL` 表达

建议索引：

- `idx_project_node_relations_project_parent_sort` on `(project_id, parent_project_node_id, sort_order)`
- `idx_project_node_relations_child` on `child_project_node_id`

导出文件对应：

- `dbSyncs/project_node_relations.csv`

### 5.7 `project_node_workflows`

用途：绑定项目节点与工作流。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `project_node_id` | `TEXT` | `NOT NULL UNIQUE` | 节点 ID |
| `workflow_id` | `TEXT` | `NOT NULL` | 工作流 ID |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

外键建议：

- `project_node_id` references `project_nodes(id)` on delete cascade
- `workflow_id` references `workflows(id)` on delete cascade

说明：

- 当前版本限定一个项目节点最多绑定一个工作流，因此 `project_node_id` 唯一

建议索引：

- `idx_project_node_workflows_workflow_id` on `workflow_id`

导出文件对应：

- `dbSyncs/project_node_workflows.csv`

### 5.8 `solutions`

用途：保存方案元数据。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `name` | `TEXT` | `NOT NULL` | 方案名称 |
| `description` | `TEXT` | `NOT NULL DEFAULT ''` | 描述 |
| `tags` | `TEXT` | `NOT NULL DEFAULT ''` | 标签原始文本 |
| `category` | `TEXT` | `NOT NULL DEFAULT ''` | 类别 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

建议索引：

- `idx_solutions_name` on `name`
- `idx_solutions_category` on `category`

导出文件对应：

- `dbSyncs/solutions.csv`

### 5.9 `solution_projects`

用途：保存方案与项目之间的集合关系。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `solution_id` | `TEXT` | `NOT NULL` | 方案 ID |
| `project_id` | `TEXT` | `NOT NULL` | 项目 ID |
| `sort_order` | `INTEGER` | `NOT NULL` | 项目在方案中的顺序 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |

约束建议：

- `UNIQUE(solution_id, project_id)`

外键建议：

- `solution_id` references `solutions(id)` on delete cascade
- `project_id` references `projects(id)` on delete cascade

建议索引：

- `idx_solution_projects_solution_sort` on `(solution_id, sort_order)`
- `idx_solution_projects_project_id` on `project_id`

导出文件对应：

- `dbSyncs/solution_projects.csv`

### 5.10 `conversation_records`

用途：保存节点对话记录目录入口。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `project_node_id` | `TEXT` | `NOT NULL UNIQUE` | 节点 ID |
| `folder_path` | `TEXT` | `NOT NULL UNIQUE` | 对话目录相对路径 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

外键建议：

- `project_node_id` references `project_nodes(id)` on delete cascade

说明：

- 当前设计下，一个节点对应一个对话目录入口
- 目录内允许有多个实际对话文件

建议索引：

- `idx_conversation_records_folder_path` on `folder_path`

导出文件对应：

- `dbSyncs/conversations.csv`

### 5.11 `insight_records`

用途：保存节点总结/认知目录入口。

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `project_node_id` | `TEXT` | `NOT NULL UNIQUE` | 节点 ID |
| `folder_path` | `TEXT` | `NOT NULL UNIQUE` | 总结目录相对路径 |
| `record_type` | `TEXT` | `NOT NULL DEFAULT 'summary'` | 类型标记 |
| `created_at` | `TEXT` | `NOT NULL` | 创建时间 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

外键建议：

- `project_node_id` references `project_nodes(id)` on delete cascade

建议索引：

- `idx_insight_records_record_type` on `record_type`

导出文件对应：

- `dbSyncs/insights.csv`

---

## 6. 运行时视图状态表

### 6.1 `runtime_views`

用途：保存当前版本需要跨刷新保留的运行时视图状态。

说明：

- 该表不属于长期业务数据本体
- 但当前设计中，`active_project_node_id`、`active_workflow_node_id` 这类状态存在被持久化的可能
- 为避免把运行时状态混入业务主表，建议单独建表

建议字段：

| 字段名 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUIDv7 |
| `scope_type` | `TEXT` | `NOT NULL` | 例如 `project_view` |
| `scope_ref` | `TEXT` | `NOT NULL` | 例如某个 `project_id` |
| `active_project_node_id` | `TEXT` | `NULL` | 当前选中项目节点 |
| `active_workflow_node_id` | `TEXT` | `NULL` | 当前选中工作流节点 |
| `updated_at` | `TEXT` | `NOT NULL` | 更新时间 |

约束建议：

- `UNIQUE(scope_type, scope_ref)`

说明：

- 如果后续决定这类状态完全不落库，可移除此表
- 当前先保留，方便后续实现有落点

---

## 7. 外键策略说明

### 7.1 当前建议

当前数据库外键建议尽量开启，并采用 `ON DELETE CASCADE`。

适用原因：

- 当前项目是单人、本地优先、人工控制流程
- 删除策略已经明确为级联删除
- 外键能帮助避免脏关系残留

### 7.2 例外情况

以下字段当前不建议做数据库级外键：

- `workflow_node_actions.target_ref`
- 所有引用本地工具配置 `tool_key` 的字段

原因：

- 它们引用的目标不总是数据库表中的单一主键
- 更适合由应用层做业务校验

---

## 8. 索引设计原则

### 8.1 必要索引

必须优先覆盖：

- 外键字段
- 名称检索字段
- 状态字段
- 排序字段组合
- 常用查询入口字段

### 8.2 当前不建议过度索引

由于当前是单人项目、低频操作、本地 SQLite，暂不建议为了理论优化过度增加索引。  
索引数量应以“支撑主要查询路径”为准。

---

## 9. 同步导出文件对应表

当前一表一文件的建议对应关系如下：

| 表名 | 导出文件 |
|---|---|
| `prompts` | `prompts.csv` |
| `workflows` | `workflows.csv` |
| `workflow_node_actions` | `workflow_node_actions.csv` |
| `projects` | `projects.csv` |
| `project_nodes` | `project_nodes.csv` |
| `project_node_relations` | `project_node_relations.csv` |
| `project_node_workflows` | `project_node_workflows.csv` |
| `solutions` | `solutions.csv` |
| `solution_projects` | `solution_projects.csv` |
| `conversation_records` | `conversations.csv` |
| `insight_records` | `insights.csv` |

说明：

- `runtime_views` 不建议参与同步导出
- 它属于运行时状态，不属于跨机器同步的核心业务数据

---

## 10. 当前版本的实现建议

### 10.1 第一批必须建表

1. `prompts`
2. `workflows`
3. `workflow_node_actions`
4. `projects`
5. `project_nodes`
6. `project_node_relations`
7. `project_node_workflows`
8. `solutions`
9. `solution_projects`
10. `conversation_records`
11. `insight_records`

### 10.2 第二批可选表

1. `runtime_views`

如果前端运行时状态不需要落库，可以延后。

---

## 11. 当前结论

基于当前系统设计，数据库表结构 v1 的结论如下：

1. 当前版本的主业务表结构已经足够支撑系统核心功能。
2. 表命名与字段命名已统一切换到 `Solution / Project / ProjectNode` 语义。
3. 真实文件内容不直接搬进数据库，数据库只负责结构、关系和定位。
4. 同步采用“一表一文件”的 CSV 导出方案，数据库表结构与同步文件结构一一对应。
5. 当前版本优先追求语义清晰、关系稳定、实现简单，而不是为高并发或多用户场景做过度设计。
