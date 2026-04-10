# 个人AI工作流导航器-接口与数据契约-v1

## 1. 文档定位

本文档用于承接当前版本已经确认的系统设计、模块设计、技术路线与数据库表结构设计，给出 `L4` 层的正式接口与数据契约。

本文档当前重点解决：

- Web API 的整体风格
- API 路径设计原则
- API 方法语义边界
- 请求体、响应体与错误语义的约束范围
- 文件与目录契约、初始化契约、自检契约在 `L4` 中的归属方式

本文档当前不直接展开：

- 每一个接口的完整字段级 DTO 明细
- 具体 SQL 建表脚本
- 前端页面组件实现
- 单个任务的 AI 执行提示包
- 具体采用数据库级联、服务层编排还是事务封装的实现细节

---

## 2. 设计依据

本文档基于以下已确认文档：

- `docs/个人AI工作流导航器-系统设计-整理稿-v1.1.md`
- `docs/个人AI工作流导航器-模块设计-v1.md`
- `docs/个人AI工作流导航器-技术路线与技术选型-v1.md`
- `docs/个人AI工作流导航器-数据库表结构设计-v1.md`
- `docs/从系统设计到AI可执行的落地步骤.md`

若本文档与上游文档冲突，以系统设计、模块边界与已确认数据库语义为准；本文档负责把这些约束收敛为可实现的正式契约。

补充说明：

- 本文档优先约束对外可观察的结果语义，不强制唯一实现手段
- 只要不违反接口行为、数据一致性和错误语义，数据库级联、服务层编排、事务封装都可以作为合法实现方式
- `个人AI工作流导航器-接口实现清单-v1.md` 属于实现展开文档；若它与本文档冲突，以本文档为准

---

## 3. `L4` 的范围

`L4` 不只包含 HTTP API 契约。

当前版本的 `L4` 至少包含三类正式契约：

1. API 契约
2. 文件与目录契约
3. 初始化 / 自检 / 修复契约

其中：

- API 契约负责定义 Web API 的路径、方法、请求结构、响应结构与错误语义。
- 文件与目录契约负责定义路径边界、固定目录、文件命名与文件行为规则。
- 初始化 / 自检 / 修复契约负责定义启动检查、自修复边界、失败语义与降级策略。

数据库表结构设计属于 `L4` 的数据契约组成部分，但不替代本文件中的 API 与行为契约。

---

## 4. Web API 总体定位

当前版本的 Web API 定位如下：

- 它是网站前端进入服务层的唯一正式入口
- 它提供本地 HTTP JSON API
- 它负责请求参数校验、调用服务层、统一响应结构与映射错误语义
- 它不负责重新定义业务规则
- 它不应在控制器层堆叠复杂业务逻辑

因此，真正长期稳定的规则应先在 `L4` 契约中写清，再由 Web API 承载。

---

## 5. 当前已确认的路由风格

### 5.1 结论

当前版本正式采用：

`资源 CRUD + 显式动作接口` 的混合模式。

### 5.2 采用原因

当前系统的接口天然分成两类：

1. 资源对象接口  
   例如：`Prompt`、`Workflow`、`Project`、`ProjectNode`、`Solution`、布局与视角配置。

2. 业务动作接口  
   例如：触发节点动作、追加到最新对话文件、删除前检查、执行巡检、执行导入导出。

若统一为全 `POST`，虽然实现层可以更机械一致，但会把“读取资源”和“执行动作”混成同一种语义，降低契约的自解释性。

当前项目虽然是本地服务，但仍需要让接口层清楚表达：

- 哪些是资源读取
- 哪些是资源维护
- 哪些是显式命令
- 哪些错误属于资源不存在
- 哪些错误属于业务动作失败

因此当前版本不采用“全部接口统一为 `POST`”的风格。

### 5.3 资源接口规则

资源接口用于承载标准 CRUD 或资源查询语义。

推荐方式：

- `GET` 用于读取资源或资源列表
- `POST` 用于创建资源
- `PATCH` 用于更新资源
- `DELETE` 用于删除资源

当前版本统一使用 `PATCH` 表达资源更新；当前版本先确认“不把资源更新统一伪装为动作型 `POST`”。

### 5.4 动作接口规则

当某个操作不适合被表达为资源本身的 CRUD 时，应建模为显式动作接口。

这类接口通常具有以下特征之一：

- 它表示一次命令，而不是资源增删改查
- 它带有明显业务语义
- 它可能触发多个底层步骤
- 它需要单独的确认、检查或执行结果结构

动作接口当前统一采用 `POST`。

推荐命名方式：

- `POST /api/workflows/{workflowId}/node-actions/sync`
- `POST /api/project-nodes/{projectNodeId}/workflow-runtime/nodes/{mermaidNodeId}/trigger`
- `POST /api/project-nodes/{projectNodeId}/conversation-records/append-latest`
- `POST /api/project-nodes/{projectNodeId}/deletion-check`
- `POST /api/inspections/run`
- `POST /api/sync/export`

### 5.5 命名边界

当前版本优先按资源边界组织 API，而不是直接按页面名组织 API。

但对于明显属于业务命令的能力，允许在资源路径下追加显式动作名，而不强行伪装成资源字段更新。

这意味着当前版本采用的是：

- 基础骨架按资源拆分
- 特殊行为按动作补充

而不是：

- 纯页面用例接口风格
- 全部接口统一为 RPC 风格

---

## 6. `L4-01` 通用 HTTP 契约

### 6.1 API 前缀与传输格式

当前版本统一采用：

- API 前缀：`/api`
- 传输格式：`application/json`
- 字符编码：`UTF-8`

除文件下载等后续单独定义的特殊接口外，当前版本所有 Web API 默认返回 JSON。

### 6.2 路径命名规则

当前版本统一采用以下路径规则：

- 资源路径使用复数名词
- 路径段使用 `kebab-case`
- 单资源路径统一为 `/{resource}/{id}`
- 动作接口挂在资源路径或顶层动作路径下

示例：

- `/api/prompts`
- `/api/prompts/{id}`
- `/api/workflows/{id}`
- `/api/project-nodes/{id}`
- `/api/project-nodes/{id}/conversation-records/append-latest`
- `/api/inspections/run`

### 6.3 JSON 字段命名规则

当前版本明确区分三类命名：

- HTTP JSON 字段：`lowerCamelCase`
- 数据库字段：`snake_case`
- 同步 CSV 列名：跟随数据库字段名，使用 `snake_case`

示例：

- HTTP DTO：`createdAt`
- 数据库字段：`created_at`
- CSV 列名：`created_at`

该规则用于避免把数据库表结构命名直接泄漏为前端接口命名。

### 6.4 请求规则

当前版本统一采用以下请求规则：

- `GET` 接口只使用路径参数和查询参数，不使用 JSON body
- `POST`、`PUT`、`PATCH` 接口使用 JSON body
- `DELETE` 接口默认只使用路径参数；如后续出现必须显式传递确认信息的删除接口，再单独在具体动作接口中定义
- 路径参数中的 `id` 默认指领域对象主键，类型为 `UUIDv7` 字符串

### 6.5 成功响应结构

当前版本统一成功响应结构如下：

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

字段语义：

- `success`：固定为 `true`
- `data`：实际业务结果
- `meta`：可选元信息；无附加信息时返回空对象

补充规则：

- 当前版本不使用“成功但无响应体”的 `204` 风格，统一返回 JSON 结果
- 删除、动作执行、检查类接口在成功时也返回同样的顶层结构
- 列表接口的结果放在 `data.items` 中，而不是直接返回裸数组

列表接口示例：

```json
{
  "success": true,
  "data": {
    "items": []
  },
  "meta": {}
}
```

单资源接口示例：

```json
{
  "success": true,
  "data": {
    "prompt": {}
  },
  "meta": {}
}
```

动作接口示例：

```json
{
  "success": true,
  "data": {
    "result": {}
  },
  "meta": {}
}
```

### 6.6 错误响应结构

当前版本统一错误响应结构如下：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数校验失败。",
    "details": {}
  },
  "meta": {}
}
```

字段语义：

- `success`：固定为 `false`
- `error.code`：稳定错误码，供前端和日志使用
- `error.message`：可直接展示或记录的错误说明，当前版本默认使用中文
- `error.details`：可选错误详情；用于字段错误、冲突详情、检查结果摘要等
- `meta`：可选元信息；无附加信息时返回空对象

规则：

- 前端不应依赖 `message` 做分支判断，应以 `code` 为准
- `error.code` 统一使用稳定字符串标识，不使用数字错误码
- 未特殊说明时，接口返回消息默认使用中文
- `details` 的具体结构由具体接口或错误类型单独定义
- 未知异常必须映射到统一的内部错误结构，不直接透出底层堆栈

### 6.7 常用 HTTP 状态码语义

当前版本先统一以下状态码：

- `200 OK`：读取、更新、删除、动作执行成功
- `201 Created`：资源创建成功
- `400 Bad Request`：请求格式错误，例如非法 JSON、错误的 content-type、无法解析的参数
- `404 Not Found`：目标资源不存在
- `409 Conflict`：资源冲突或当前状态不允许执行，例如唯一约束冲突、重复绑定、目录已占用
- `412 Precondition Failed`：缺少必须的确认条件或前置检查未满足，例如删除需要二次确认但未提供确认信息
- `422 Unprocessable Entity`：请求结构可解析，但字段校验或契约校验失败
- `500 Internal Server Error`：未预期的服务端错误

当前版本暂不主动设计复杂的权限相关状态码；如后续引入权限系统，再单独扩展。

### 6.8 通用错误码约定

当前版本推荐先统一以下错误码前缀与基础错误码：

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `PRECONDITION_FAILED`
- `INTERNAL_ERROR`

允许具体接口在此基础上细化，例如：

- `PROMPT_NOT_FOUND`
- `WORKFLOW_NOT_FOUND`
- `PROJECT_NODE_DELETE_CONFIRMATION_REQUIRED`
- `TOOL_TARGET_NOT_FOUND`

规则：

- 能稳定复用的错误优先使用通用错误码
- 需要明确业务语义时，使用资源或动作级细分错误码
- 同一错误码在全项目中应保持稳定语义，不允许一码多义

### 6.9 ID 与时间字段规则

当前版本统一采用以下规则：

- 所有领域对象 `id` 在 HTTP DTO 中均为字符串
- 主键 ID 语义统一对应 `UUIDv7`
- 时间字段统一使用 ISO 8601 字符串
- 时间统一使用 UTC

HTTP DTO 中的通用时间字段命名：

- `createdAt`
- `updatedAt`

如存在其他时间字段，也应保持：

- 命名使用 `lowerCamelCase`
- 值使用 UTC ISO 8601 字符串

### 6.10 列表、分页与排序规则

当前版本先采用“默认不强制分页”的策略。

原因：

- 当前系统是个人本地工作流工具
- v1 阶段主要目标是先把领域边界、接口语义和行为规则稳定下来
- 暂不提前引入分页复杂度

当前统一规则：

- 列表接口默认返回完整结果集
- 列表结果统一放在 `data.items`
- 如某接口后续需要分页，再显式增加 `page` 与 `pageSize` 查询参数
- 如某接口后续需要排序，再显式增加 `sortBy` 与 `sortDirection` 查询参数

若后续引入分页，`meta` 中应增加分页信息；在真正出现该需求前，本文档不提前定义分页对象细节。

### 6.11 资源接口与动作接口的响应约定

为减少前端判断分支，当前版本统一推荐：

- 资源列表：`data.items`
- 单资源读取：`data.{resourceName}`
- 创建成功：`data.{resourceName}`
- 更新成功：`data.{resourceName}`
- 删除成功：`data.result`
- 动作执行成功：`data.result`

示例中的 `{resourceName}` 使用单数 lowerCamelCase，例如：

- `data.prompt`
- `data.workflow`
- `data.project`
- `data.projectNode`

---

## 7. `L4-02` Prompt 资源 API 契约

### 7.1 资源定位

`Prompt` 资源用于管理提示词元数据与正文内容。

它对应的底层事实边界如下：

- 元数据存于 `prompts` 表
- 正文内容存于 `prompts/` 目录下的 `.md` 文件
- 一份 Prompt 对应一个正文文件

Web API 应对前端暴露 Prompt 资源语义，而不是暴露底层 `content_file_path` 文件路径控制权。

### 7.2 路由清单

当前版本先定义以下 Prompt 资源接口：

- `GET /api/prompts`
- `GET /api/prompts/{id}`
- `POST /api/prompts`
- `PATCH /api/prompts/{id}`
- `DELETE /api/prompts/{id}`

当前版本不单独拆出 `GET /api/prompts/{id}/content`。  
读取单个 Prompt 时，允许直接返回正文内容。

### 7.3 Prompt DTO 约定

#### 7.3.1 PromptSummary

用于列表展示。

```json
{
  "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "需求分析提示词",
  "description": "用于初步拆解需求。",
  "tags": "",
  "category": "analysis",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

字段说明：

- `id`：Prompt 主键 ID
- `name`：提示词名称
- `description`：描述
- `tags`：标签原始文本；当前版本不在 API 层拆成数组
- `category`：分类
- `createdAt`：创建时间
- `updatedAt`：更新时间

#### 7.3.2 PromptDetail

用于单资源读取与创建、更新后的返回。

```json
{
  "id": "018f3f2b-2b7e-7b1b-9a12-123456789abc",
  "name": "需求分析提示词",
  "description": "用于初步拆解需求。",
  "tags": "",
  "category": "analysis",
  "content": "# 角色\\n你是一个需求分析助手。",
  "createdAt": "2026-04-09T08:00:00Z",
  "updatedAt": "2026-04-09T08:00:00Z"
}
```

补充规则：

- `PromptDetail` 包含 `content`
- 当前版本不向前端暴露 `contentFilePath`
- `contentFilePath` 属于服务层和文件层的内部实现细节

### 7.4 列表接口

#### 7.4.1 `GET /api/prompts`

用途：

- 读取 Prompt 列表
- 用于维护页列表展示与基础筛选

查询参数：

- `keyword`：可选，按名称或描述做模糊过滤
- `category`：可选，按分类过滤

当前返回：

- `data.items` 为 `PromptSummary[]`

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
        "name": "需求分析提示词",
        "description": "用于初步拆解需求。",
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

### 7.5 单资源读取接口

#### 7.5.1 `GET /api/prompts/{id}`

用途：

- 读取单个 Prompt 的完整详情
- 用于维护页编辑、查看与复制正文

返回：

- `data.prompt` 为 `PromptDetail`

`404` 错误码建议：

- `PROMPT_NOT_FOUND`

### 7.6 创建接口

#### 7.6.1 `POST /api/prompts`

请求体：

```json
{
  "name": "需求分析提示词",
  "description": "用于初步拆解需求。",
  "tags": "",
  "category": "analysis",
  "content": "# 角色\\n你是一个需求分析助手。"
}
```

字段规则：

- `name`：必填，去除首尾空白后不能为空
- `description`：可选，默认 `""`
- `tags`：可选，默认 `""`
- `category`：可选，默认 `""`
- `content`：可选，默认 `""`

当前版本禁止客户端传入：

- `id`
- `createdAt`
- `updatedAt`
- `contentFilePath`

成功语义：

- 创建数据库元数据
- 创建 Prompt 正文 `.md` 文件
- 成功后返回 `201 Created`
- `data.prompt` 返回完整 `PromptDetail`

一致性规则：

- 若正文文件创建失败，则本次创建必须整体失败
- 若数据库写入失败，则不得留下已确认成功的脏记录

### 7.7 更新接口

#### 7.7.1 `PATCH /api/prompts/{id}`

请求体：

```json
{
  "name": "需求分析提示词（更新版）",
  "description": "用于更细致地拆解需求。",
  "content": "# 角色\\n你是一个更严格的需求分析助手。"
}
```

字段规则：

- 请求体所有字段均为可选
- 允许部分更新
- 若传入 `name`，则去除首尾空白后不能为空
- 若传入 `description`、`tags`、`category`、`content`，则必须为字符串

当前版本禁止客户端更新：

- `id`
- `createdAt`
- `updatedAt`
- `contentFilePath`

成功语义：

- 元数据更新写入数据库
- `content` 更新写入 Prompt 正文文件
- 成功后返回 `200 OK`
- `data.prompt` 返回更新后的完整 `PromptDetail`

当前版本约定：

- Prompt 名称变化不强制重命名既有正文文件
- `contentFilePath` 一旦在创建阶段生成，后续不因名称修改而自动变化

错误码建议：

- `PROMPT_NOT_FOUND`

### 7.8 删除接口

#### 7.8.1 `DELETE /api/prompts/{id}`

用途：

- 删除 Prompt 元数据
- 删除对应的 Prompt 正文文件

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

- 删除数据库中的 Prompt 记录
- 删除对应正文文件

当前版本规则：

- 若目标 Prompt 不存在，返回 `404`
- 若删除过程中正文文件处理失败，则本次删除不得伪装为成功

错误码建议：

- `PROMPT_NOT_FOUND`

### 7.9 校验与错误语义

Prompt 资源当前优先使用以下错误语义：

- `404 + PROMPT_NOT_FOUND`
- `409 + CONFLICT`
- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

说明：

- `VALIDATION_ERROR` 用于字段类型、必填项、空字符串等契约校验失败
- `CONFLICT` 用于文件路径冲突、唯一约束冲突等资源冲突
- 需要更细粒度错误码时，可在后续实现阶段补充为 `PROMPT_*` 细分错误码

### 7.10 当前版本刻意不暴露的内容

为避免前端直接耦合底层存储细节，当前版本的 Prompt API 不直接暴露：

- `contentFilePath`
- Prompt 正文文件的物理命名规则
- Prompt 文件夹或绝对路径

这些内容属于文件与目录契约、服务层路径规则和底层实现细节，不属于前端直接操控的资源字段。

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

1. 绑定关系维护  
   负责把工作流节点配置成 `prompt`、`tool` 或 `link`

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
- `actionType`：当前支持 `prompt` / `tool` / `link`
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
- `actionType`：必填，当前仅允许 `prompt`、`tool`、`link`
- `targetRef`：必填；当前版本保留为字符串

当前语义：

- `actionType = prompt` 时，`targetRef` 指向 `Prompt.id`
- `actionType = tool` 时，`targetRef` 指向本地工具配置中的 `toolKey`
- `actionType = link` 时，当前仅作为预留类型保留，v1 不实现实际执行能力

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
- `actionType = tool` 时必须校验 `targetRef` 对应的 `toolKey` 在本地工具配置中存在

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

### 10.8 当前版本暂不开放 Project 删除接口

当前版本明确：

- `Project` 删除属于高风险破坏性操作
- 它会影响项目元数据、项目节点、节点工作流绑定、视图配置以及项目目录
- 在专门的项目级删除保护契约落定前，不对前端开放 `DELETE /api/projects/{id}`

当前版本结论：

- `Project` 资源 API 只定义读取、创建、更新
- 若后续需要项目删除，应单独补充项目级 `deletion-check / deletion-execute` 契约，而不是直接恢复裸 `DELETE`

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
- `GET /api/projects/{projectId}/solutions` 按 `sortOrder` 升序
- 若 `sortOrder` 相同，则按 `solutionName` 升序

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

- 若要读取节点下的对话记录或总结文件，不应追加到本节基础 CRUD，而应进入第 12 节与第 13 节
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

- 当前版本不向前端暴露 `folderPath`
- 当前版本不把 `chatLogs/`、`summaries/` 文件列表直接并入节点基础 CRUD 返回
- 当前版本不把布局坐标直接并入 `ProjectNode` 主资源

### 11.4 列表接口

#### 11.4.1 `GET /api/projects/{projectId}/nodes`

用途：

- 读取某个项目下的节点列表
- 用于项目结构页与节点管理页的基础数据加载

查询参数：

- `parentNodeId`：可选，仅返回指定父节点下的直接子节点；传空表示根层
- `status`：可选，按节点状态过滤

返回：

- `data.items` 为 `ProjectNodeSummary[]`

当前默认排序：

- 先按 `parentNodeId` 分组
- 组内按 `sortOrder` 升序
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
- 初始化节点目录以及固定子目录 `chatLogs/`、`summaries/`
- 创建对应的 `conversation_records` 与 `insight_records` 目录入口记录
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
- 节点删除会影响节点元数据、节点结构关系、节点工作流绑定以及节点目录内容
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
- `chatLogs/` 与 `summaries/` 的文件列表
- 画布坐标与项目视角
- 运行时选中状态

这些内容将在节点内容契约、视图配置契约或运行时契约中继续定义。

对应关系如下：

- `chatLogs/` 与 `summaries/`：见第 12 节与第 13 节
- 删除保护：见第 14 节
- 画布坐标与项目视角：见第 15 节
- 运行时选中状态与动作触发：见第 16 节

---

## 12. `L4-07` chatLogs 内容契约

### 12.1 资源定位

`chatLogs` 是挂载在 `ProjectNode` 下的对话记录目录。

它的需求边界如下：

- 一个节点对应一个对话目录入口
- 目录中可以包含多个 `.md` 对话文件
- 默认追加到“最新合规文件”
- 若不存在任何合规文件，则自动创建新的合规文件作为写入目标
- 不合规文件允许显示，但不参与默认写入目标判定

当前版本中，`chatLogs` 更适合建模为“节点下的内容能力”，而不是独立一级资源。

### 12.2 路由清单

当前版本先定义以下接口：

- `GET /api/project-nodes/{projectNodeId}/conversation-records`
- `GET /api/project-nodes/{projectNodeId}/conversation-records/files`
- `POST /api/project-nodes/{projectNodeId}/conversation-records/append-latest`
- `POST /api/project-nodes/{projectNodeId}/conversation-records/files`

说明：

- 路由资源名统一使用 `conversation-records`，对应领域对象 `ConversationRecord` 与底层表 `conversation_records`
- 同步文件名仍然是 `conversations.csv`，但它只用于同步导入导出命名，不作为本节接口资源命名依据

### 12.3 DTO 约定

#### 12.3.1 ConversationRecordFolderInfo

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

#### 12.3.2 ConversationRecordFileItem

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

#### 12.3.3 生命周期与自愈规则

`ConversationRecord` 当前版本不是面向前端独立创建的一级资源，而是 `ProjectNode` 的受管子对象。

生命周期规则：

- 创建 `ProjectNode` 时，服务端必须同步创建或补齐：
  - `conversation_records` 中的一条目录入口记录
  - 节点下的 `chatLogs/` 目录
- 客户端不直接创建或删除 `ConversationRecord` 记录本身
- 删除 `ProjectNode` 时，`conversation_records` 记录必须随节点一起被清理
- 物理目录删除由节点删除流程统一处理，不在本节单独暴露删除接口

实现边界说明：

- 该清理可通过外键级联或节点删除流程统一编排实现
- `L4` 约束的是“不能遗留孤儿目录入口记录”，而不是具体删除机制

自愈规则：

- 若节点存在，但 `conversation_records` 记录缺失，读取或写入接口应先按标准路径补齐目录入口记录
- 若目录入口记录存在，但对应 `chatLogs/` 目录缺失，读取或写入接口应先补齐目录
- 以上补齐属于幂等的内部修复，不改变本节对前端的接口形态

### 12.4 目录信息接口

#### 12.4.1 `GET /api/project-nodes/{projectNodeId}/conversation-records`

用途：

- 读取节点对话目录信息
- 用于节点详情面板判断默认写入目标和基本状态

返回：

- `data.conversationRecord` 为 `ConversationRecordFolderInfo`

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 12.5 文件列表接口

#### 12.5.1 `GET /api/project-nodes/{projectNodeId}/conversation-records/files`

用途：

- 读取对话目录下的文件列表
- 用于节点详情页展示对话文件列表

返回：

- `data.items` 为 `ConversationRecordFileItem[]`

当前默认排序：

- 先按“是否合规”排序，合规文件在前
- 合规文件内部按文件名时间戳倒序
- 不合规文件排在后面，并按文件名升序

错误码建议：

- `PROJECT_NODE_NOT_FOUND`

### 12.6 追加到最新文件接口

#### 12.6.1 `POST /api/project-nodes/{projectNodeId}/conversation-records/append-latest`

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
- 在执行追加前，应先确保 `conversation_records` 与 `chatLogs/` 已完成补齐

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

### 12.7 手动新建对话文件接口

#### 12.7.1 `POST /api/project-nodes/{projectNodeId}/conversation-records/files`

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
- 新文件创建成功后会出现在对话文件列表中
- 在执行新建前，应先确保 `conversation_records` 与 `chatLogs/` 已完成补齐

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`

### 12.8 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动抓取网页对话
- 消息角色识别
- 对话文件内容全文读取接口

这些内容不属于当前版本已确认的最小契约范围。

---

## 13. `L4-08` summaries 内容契约

### 13.1 资源定位

`summaries` 是挂载在 `ProjectNode` 下的总结 / 认知目录。

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

#### 13.3.3 生命周期与自愈规则

`InsightRecord` 当前版本不是面向前端独立创建的一级资源，而是 `ProjectNode` 的受管子对象。

生命周期规则：

- 创建 `ProjectNode` 时，服务端必须同步创建或补齐：
  - `insight_records` 中的一条目录入口记录
  - 节点下的 `summaries/` 目录
- 客户端不直接创建或删除 `InsightRecord` 记录本身
- 删除 `ProjectNode` 时，`insight_records` 记录必须随节点一起被清理
- 物理目录删除由节点删除流程统一处理，不在本节单独暴露删除接口

实现边界说明：

- 该清理可通过外键级联或节点删除流程统一编排实现
- `L4` 约束的是“不能遗留孤儿总结目录入口记录”，而不是具体删除机制

自愈规则：

- 若节点存在，但 `insight_records` 记录缺失，读取接口应先按标准路径补齐目录入口记录
- 若目录入口记录存在，但对应 `summaries/` 目录缺失，读取接口应先补齐目录
- 以上补齐属于幂等的内部修复，不改变本节对前端的接口形态

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

- `chatLogs/` 不触发二次提醒
- `summaries/` 非空才触发二次提醒
- `summaryArchives/` 仅作为删除保护目录存在，不参与正式同步

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
- 若删除检查结果要求二次确认，则 `secondConfirmation` 必须为 `true`
- `strategy` 当前仅允许：
  - `archive_then_delete`
  - `direct_delete`

#### 14.4.3 ProjectNodeDeletionExecuteResult

```json
{
  "projectNodeId": "018f3f2b-3333-7b1b-9a12-123456789abc",
  "deleted": true,
  "usedStrategy": "archive_then_delete",
  "archived": true
}
```

字段说明：

- `projectNodeId`：目标节点 ID
- `deleted`：是否已完成删除
- `usedStrategy`：实际采用的删除策略
- `archived`：是否完成总结转存

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
- 必须检查 `summaries/` 是否非空
- `chatLogs/` 是否非空不影响二次确认判定

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
- 必须校验 `confirmDelete = true`
- 若需要二次确认，则必须校验 `secondConfirmation = true`
- 若 `strategy = archive_then_delete`：
  - 先转存 `summaries/` 到 `summaryArchives/<project-folder>/<node-folder>/`
  - 转存成功后才允许删除
- 若 `strategy = direct_delete`：
  - 直接执行删除

删除成功时的实际效果：

- 删除节点元数据
- 删除节点结构关系与节点工作流绑定
- 删除节点目录及其磁盘内容
- 若采用转存策略，则保留 `summaryArchives/` 中的转存结果

错误处理规则：

- 若 `confirmDelete` 缺失或为 `false`，返回 `412 + PRECONDITION_FAILED`
- 若需要二次确认但 `secondConfirmation` 不满足，返回 `412 + PRECONDITION_FAILED`
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

1. 可同步视图配置  
   包括节点坐标与最终视角位置，这部分需要入库并参与同步。

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

- 若项目尚未保存过视角，可由服务端返回默认值
- 默认值策略的细节可在实现阶段补充，但返回结构仍保持 `ProjectViewport` 形状

错误码建议：

- `PROJECT_NOT_FOUND`

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

1. 绑定维护  
   负责把工作流节点配置成 `prompt` / `tool` / `link`

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
- `actionType = link` 时，当前版本仅可展示，不提供实际执行能力

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

3. `link`
   - 当前版本不实现实际执行能力
   - 触发时返回错误

错误码建议：

- `PROJECT_NODE_NOT_FOUND`
- `PROJECT_NODE_WORKFLOW_NOT_FOUND`
- `MERMAID_NODE_NOT_FOUND`
- `WORKFLOW_NODE_ACTION_NOT_FOUND`
- `PROMPT_NOT_FOUND`
- `TOOL_TARGET_NOT_FOUND`
- `LINK_ACTION_NOT_SUPPORTED`
- `INTERNAL_ERROR`

### 16.8 校验与错误语义

项目节点运行时动作当前优先使用以下错误语义：

- `404 + PROJECT_NODE_NOT_FOUND`
- `404 + PROJECT_NODE_WORKFLOW_NOT_FOUND`
- `404 + MERMAID_NODE_NOT_FOUND`
- `404 + WORKFLOW_NODE_ACTION_NOT_FOUND`
- `404 + PROMPT_NOT_FOUND`
- `404 + TOOL_TARGET_NOT_FOUND`
- `409 + LINK_ACTION_NOT_SUPPORTED`
- `500 + INTERNAL_ERROR`

补充说明：

- `PROJECT_NODE_WORKFLOW_NOT_FOUND` 表示当前项目节点尚未绑定任何工作流
- `MERMAID_NODE_NOT_FOUND` 表示当前选中的 Mermaid 节点不在工作流源码节点集合中
- `WORKFLOW_NODE_ACTION_NOT_FOUND` 表示该 Mermaid 节点存在，但未配置动作绑定
- `LINK_ACTION_NOT_SUPPORTED` 表示 `link` 类型在 v1 中仅保留展示语义，不支持实际触发

### 16.9 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 前端如何保存当前选中的 `activeWorkflowNodeId`
- Mermaid 图内高亮与复杂交互
- 动作触发后的前端反馈动画

这些内容属于前端本地运行时行为，不属于服务端运行时动作契约。

---

## 17. `L4-12` 巡检契约

### 17.1 能力定位

巡检用于扫描运行时结构化数据、文件系统和绑定关系之间的一致性问题。

当前版本的巡检目标不是自动批量修复，而是：

- 发现异常
- 结构化返回问题列表
- 给出严重级别与修复建议

### 17.2 巡检范围

当前版本至少需要支持巡检以下问题：

- 有索引但文件不存在
- 文件存在但索引缺失
- Mermaid 源码已删除节点，但数据库仍残留旧的 `workflow_node_actions`
- 工作流节点未绑定动作
- 项目节点未绑定工作流
- 绑定关系引用了不存在的对象
- `tool` 类型动作引用了不存在的本地工具定义

### 17.3 路由清单

当前版本先定义以下接口：

- `POST /api/inspections/run`

说明：

- 巡检属于显式动作接口
- 当前版本不定义“巡检历史记录资源”
- 当前版本默认按需实时执行并返回结果

### 17.4 DTO 约定

#### 17.4.1 InspectionIssue

```json
{
  "issueType": "INDEXED_FILE_MISSING",
  "severity": "warning",
  "entityType": "prompt",
  "entityId": "018f3f2b-1111-7b1b-9a12-123456789abc",
  "message": "提示词正文文件不存在。",
  "suggestion": "检查文件是否被移动或删除，必要时重建正文文件或修正索引。"
}
```

字段说明：

- `issueType`：巡检项类型
- `severity`：严重级别
- `entityType`：问题关联对象类型
- `entityId`：问题关联对象 ID；无明确对象时可为 `null`
- `message`：中文问题说明
- `suggestion`：建议修复方式

#### 17.4.2 InspectionRunResult

```json
{
  "summary": {
    "total": 2,
    "errorCount": 0,
    "warningCount": 2
  },
  "items": [
    {
      "issueType": "INDEXED_FILE_MISSING",
      "severity": "warning",
      "entityType": "prompt",
      "entityId": "018f3f2b-1111-7b1b-9a12-123456789abc",
      "message": "提示词正文文件不存在。",
      "suggestion": "检查文件是否被移动或删除，必要时重建正文文件或修正索引。"
    }
  ]
}
```

字段说明：

- `summary.total`：问题总数
- `summary.errorCount`：错误级问题数量
- `summary.warningCount`：警告级问题数量
- `items`：问题明细列表

### 17.5 巡检项类型约定

当前版本先统一以下 `issueType`：

- `INDEXED_FILE_MISSING`
- `UNINDEXED_FILE_FOUND`
- `WORKFLOW_NODE_ACTION_STALE`
- `WORKFLOW_NODE_ACTION_MISSING`
- `PROJECT_NODE_WORKFLOW_MISSING`
- `BINDING_TARGET_NOT_FOUND`
- `TOOL_TARGET_NOT_FOUND`

说明：

- `INDEXED_FILE_MISSING`：有索引但文件不存在
- `UNINDEXED_FILE_FOUND`：文件存在但索引缺失
- `WORKFLOW_NODE_ACTION_STALE`：Mermaid 节点已不存在，但绑定记录仍残留
- `WORKFLOW_NODE_ACTION_MISSING`：工作流节点未绑定动作
- `PROJECT_NODE_WORKFLOW_MISSING`：项目节点未绑定工作流
- `BINDING_TARGET_NOT_FOUND`：绑定关系引用了不存在的对象
- `TOOL_TARGET_NOT_FOUND`：`tool` 类型动作引用了不存在的本地工具定义

### 17.6 严重级别约定

当前版本先统一以下 `severity`：

- `error`
- `warning`

建议语义：

- `error`：明确异常，通常会导致功能失效或数据不一致
- `warning`：当前可运行，但存在不完整配置或潜在问题

当前版本建议：

- `INDEXED_FILE_MISSING`：`warning`
- `UNINDEXED_FILE_FOUND`：`warning`
- `WORKFLOW_NODE_ACTION_STALE`：`warning`
- `WORKFLOW_NODE_ACTION_MISSING`：`warning`
- `PROJECT_NODE_WORKFLOW_MISSING`：`warning`
- `BINDING_TARGET_NOT_FOUND`：`error`
- `TOOL_TARGET_NOT_FOUND`：`error`

### 17.7 巡检执行接口

#### 17.7.1 `POST /api/inspections/run`

请求体：

当前版本允许空对象：

```json
{}
```

成功返回：

- `data.result` 为 `InspectionRunResult`

当前版本规则：

- 巡检应覆盖当前已确认的问题类型
- 巡检结果应稳定返回结构化问题列表
- 无问题时也应返回成功结果，而不是报错

无问题示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "summary": {
        "total": 0,
        "errorCount": 0,
        "warningCount": 0
      },
      "items": []
    }
  },
  "meta": {}
}
```

### 17.8 校验与错误语义

巡检接口当前优先使用以下错误语义：

- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

说明：

- 巡检本身发现业务问题时，不应返回错误状态码
- 巡检结果中的异常应体现在 `data.result.items` 中
- 只有巡检执行过程本身失败时，才返回 `500`

### 17.9 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动批量修复接口
- 巡检历史存档
- 巡检计划任务

这些内容超出当前版本最小契约范围。

---

## 18. `L4-13` 导入导出契约

### 18.1 能力定位

导入导出用于在运行时 SQLite 与 `dbSyncs/` 之间执行手动同步。

当前版本的边界如下：

- 只处理结构化数据与可同步视图配置
- 不负责业务正文文件的 Git 同步
- 不自动触发导入导出
- 不自动回滚
- 不自动解决冲突

### 18.2 同步数据源边界

当前版本明确：

- 运行时阶段，SQLite 是结构化数据的唯一数据源
- 同步阶段，`dbSyncs/` 中的导出文件是同步过程中的唯一数据源
- 从 Git 拉取后的恢复过程，以同步文件和磁盘文件作为恢复输入源

补充说明：

- `project_node_layouts` 与 `project_viewports` 属于可同步视图配置，必须纳入导入导出
- `activeProjectNodeId` 与 `activeWorkflowNodeId` 不参与导入导出
- `summaryArchives/` 不参与正式同步

### 18.3 路由清单

当前版本先定义以下接口：

- `POST /api/sync/export`
- `POST /api/sync/import`

说明：

- 这两个接口属于显式动作接口
- 当前版本不定义同步历史资源

### 18.4 导出范围

当前版本导出范围至少包括以下表级文件：

- `prompts.csv`
- `workflows.csv`
- `workflow_node_actions.csv`
- `projects.csv`
- `project_nodes.csv`
- `project_node_relations.csv`
- `project_node_workflows.csv`
- `project_node_layouts.csv`
- `project_viewports.csv`
- `solutions.csv`
- `solution_projects.csv`
- `conversations.csv`
- `insights.csv`

并包含：

- `manifest.json`

当前版本不导出：

- `summaryArchives/`
- 前端本地缓存中的运行时状态

### 18.5 manifest 契约

当前版本要求导出时生成 `manifest.json`，用于承载全局说明信息。

当前版本最小建议结构：

```json
{
  "version": 1,
  "exportedAt": "2026-04-09T08:00:00Z",
  "files": [
    "prompts.csv",
    "workflows.csv",
    "workflow_node_actions.csv",
    "projects.csv",
    "project_nodes.csv",
    "project_node_relations.csv",
    "project_node_workflows.csv",
    "project_node_layouts.csv",
    "project_viewports.csv",
    "solutions.csv",
    "solution_projects.csv",
    "conversations.csv",
    "insights.csv"
  ]
}
```

字段说明：

- `version`：导出格式版本
- `exportedAt`：导出时间
- `files`：本次导出的文件列表

### 18.6 导出接口

#### 18.6.1 `POST /api/sync/export`

请求体：

当前版本允许空对象：

```json
{}
```

成功返回示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "exported": true,
      "manifestFile": "dbSyncs/manifest.json",
      "exportedFileCount": 13
    }
  },
  "meta": {}
}
```

当前版本规则：

- 导出由人手动触发
- 导出目标目录固定为 `dbSyncs/`
- 导出时生成或覆盖表级 CSV 与 `manifest.json`
- 导出应覆盖所有当前已确认的结构化数据与可同步视图配置

错误码建议：

- `INTERNAL_ERROR`

### 18.7 导入接口

#### 18.7.1 `POST /api/sync/import`

请求体：

```json
{
  "mode": "rebuild"
}
```

字段规则：

- `mode`：当前版本必填，固定为 `rebuild`

说明：

- `rebuild` 表示按“清空后重建”的方式导入
- 当前版本先不定义增量合并导入模式

成功返回示例：

```json
{
  "success": true,
  "data": {
    "result": {
      "imported": true,
      "mode": "rebuild"
    }
  },
  "meta": {}
}
```

当前版本规则：

- 导入由人手动触发
- 导入输入源固定为 `dbSyncs/` 目录中的同步文件
- 导入时允许先清空再重建
- 导入应恢复结构化元数据、关系和可同步视图配置
- `conversations.csv` 与 `insights.csv` 属于当前版本的必需结构化文件，不应在 `rebuild` 导入时被静默省略
- 若导入集中存在 `project_nodes.csv`，却缺少 `conversations.csv` 或 `insights.csv`，应返回 `VALIDATION_ERROR`
- 导入后由人手动刷新页面，不要求系统自动刷新 UI

失败策略：

- 导入失败时不做自动回滚
- 出错后由人排查并重新导入

错误码建议：

- `VALIDATION_ERROR`
- `INTERNAL_ERROR`

### 18.8 校验与错误语义

导入导出接口当前优先使用以下错误语义：

- `422 + VALIDATION_ERROR`
- `500 + INTERNAL_ERROR`

说明：

- `VALIDATION_ERROR` 主要用于 `manifest.json` 或导入参数不符合契约
- `INTERNAL_ERROR` 主要用于文件读写、CSV 处理或数据库重建过程失败

### 18.9 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动同步
- 自动冲突解决
- 自动回滚
- 增量导入策略
- Git 拉取流程本身

这些内容超出当前版本最小契约范围。

---

## 19. `L4-14` 启动自检 / 初始化契约

### 19.1 能力定位

启动自检 / 初始化契约用于定义服务启动前后的稳定底座行为。

当前版本主要覆盖：

- 本地配置读取与校验
- 工作目录与固定目录检查
- 运行时 SQLite 创建或打开
- schema 执行
- 启动结果与初始化报告输出

它不负责：

- 自动导入同步文件
- 自动修复任意业务脏数据
- 替代巡检模块处理业务一致性问题

### 19.2 启动阶段划分

当前版本将启动流程划分为以下阶段：

1. 配置检查
2. 工作目录检查
3. 固定目录检查 / 创建
4. 运行时数据库创建或打开
5. schema 执行
6. 基础启动报告生成

### 19.3 启动检查项

当前版本至少检查以下内容：

- `local.config.jsonc` 是否存在且可读取
- 配置结构是否通过校验
- 工作目录根路径是否合法
- 固定目录是否存在
- 运行时数据库文件是否存在或可创建
- schema 目录中的 SQL 是否可扫描并顺序执行

固定目录至少包括：

- `db/`
- `dbSyncs/`
- `prompts/`
- `projects/`
- `summaryArchives/`

### 19.4 自动创建与自动修复边界

当前版本允许自动处理的内容：

- 缺失的固定目录可自动创建
- 缺失的运行时数据库文件可自动创建

当前版本不自动处理的内容：

- 缺失或非法的 `local.config.jsonc`
- schema 执行失败后的自动修复
- 业务数据层面的自动纠错
- 自动导入 `dbSyncs/`

结论：

- 目录问题可以自动补齐
- 配置问题和 schema 问题必须显式失败

### 19.5 启动失败策略

当前版本采用“底座失败即中止启动”的策略，不定义降级启动模式。

明确规则：

- 配置读取失败：中止启动
- 配置校验失败：中止启动
- 工作目录非法：中止启动
- 数据库无法创建或打开：中止启动
- schema 执行失败：中止启动

当前版本不采用：

- 带缺陷继续启动
- 自动跳过失败的 schema
- 自动进入只读降级模式

### 19.6 路由清单

当前版本先定义以下接口：

- `GET /api/system/startup-report`
- `POST /api/system/self-check`

说明：

- `GET /api/system/startup-report` 用于读取最近一次启动结果
- `POST /api/system/self-check` 用于人工触发一次底座自检
- 本节的 `self-check` 指启动与环境自检，不等同于业务巡检
- 本节 HTTP 契约只覆盖“服务已成功启动并可对外提供 API”后的可调用接口

### 19.7 DTO 约定

#### 19.7.1 StartupCheckItem

```json
{
  "checkType": "CONFIG_VALID",
  "status": "passed",
  "message": "本地配置校验通过。"
}
```

字段说明：

- `checkType`：检查项类型
- `status`：检查状态
- `message`：中文说明

#### 19.7.2 StartupReport

```json
{
  "startupStatus": "ready",
  "checks": [
    {
      "checkType": "CONFIG_VALID",
      "status": "passed",
      "message": "本地配置校验通过。"
    },
    {
      "checkType": "FIXED_DIRECTORIES_READY",
      "status": "passed",
      "message": "固定目录已就绪。"
    },
    {
      "checkType": "SCHEMA_EXECUTED",
      "status": "passed",
      "message": "schema 执行成功。"
    }
  ]
}
```

字段说明：

- `startupStatus`：整体启动状态
- `checks`：检查项列表

#### 19.7.3 SelfCheckResult

```json
{
  "status": "passed",
  "checks": [
    {
      "checkType": "CONFIG_VALID",
      "status": "passed",
      "message": "本地配置校验通过。"
    }
  ]
}
```

字段说明：

- `status`：本次手动自检的整体状态
- `checks`：检查项列表

### 19.8 检查项类型约定

当前版本先统一以下 `checkType`：

- `CONFIG_READABLE`
- `CONFIG_VALID`
- `WORKSPACE_ROOT_VALID`
- `FIXED_DIRECTORIES_READY`
- `RUNTIME_DB_READY`
- `SCHEMA_EXECUTED`

说明：

- `CONFIG_READABLE`：`local.config.jsonc` 可读取
- `CONFIG_VALID`：配置结构合法
- `WORKSPACE_ROOT_VALID`：工作目录根路径合法
- `FIXED_DIRECTORIES_READY`：固定目录存在或已自动创建完成
- `RUNTIME_DB_READY`：运行时数据库已创建或成功打开
- `SCHEMA_EXECUTED`：schema 扫描并顺序执行成功

### 19.9 状态值约定

当前版本先统一以下状态值：

- `passed`
- `failed`
- `fixed`

说明：

- `passed`：检查通过
- `failed`：检查失败
- `fixed`：原本缺失，但已通过允许的自动创建流程修复

`startupStatus` / `status` 当前统一使用：

- `ready`
- `failed`

说明：

- `ready`：底座已满足启动条件
- `failed`：底座检查未通过，不能继续启动

### 19.10 启动报告读取接口

#### 19.10.1 `GET /api/system/startup-report`

用途：

- 读取最近一次启动结果
- 用于日志查看或页面展示启动状态

返回：

- `data.report` 为 `StartupReport`

当前版本规则：

- 若服务已经启动成功，则该接口必须可返回最近一次启动报告
- 启动报告应包含每个关键检查项的结果
- 若服务因底座失败而根本未完成启动，则该接口不可达；此时启动失败信息不通过 HTTP 契约获取

错误码建议：

- `INTERNAL_ERROR`

### 19.11 手动自检接口

#### 19.11.1 `POST /api/system/self-check`

请求体：

当前版本允许空对象：

```json
{}
```

返回：

- `data.result` 为 `SelfCheckResult`

当前版本规则：

- 手动自检应重复执行当前已定义的底座检查项
- 对允许自动创建的目录问题，可再次自动补齐
- 自检发现配置或 schema 问题时，应返回失败结果
- 本接口不负责触发业务巡检

错误码建议：

- `500 + INTERNAL_ERROR`

补充说明：

- 当前版本建议：底座检查失败时，也优先通过结果结构表达失败项
- 只有接口执行过程本身异常时，才返回 `500`

### 19.12 校验与错误语义

启动自检 / 初始化接口当前优先使用以下错误语义：

- `500 + INTERNAL_ERROR`

说明：

- 启动或自检中的失败项，优先体现在返回结果中的 `checks`
- 真正的接口级异常，才映射到 `INTERNAL_ERROR`

### 19.13 当前版本刻意不在本节处理的内容

当前版本不在本节处理：

- 自动从 `dbSyncs/` 恢复数据
- 只读降级模式
- 远程依赖健康检查

这些内容超出当前版本最小契约范围。

---

## 20. `L4` 文档组织方式

后续继续细化时，本文档建议至少拆成以下章节：

1. 通用 HTTP 契约  
   统一响应结构、统一错误结构、ID 规则、时间字段规则、分页与排序规则。

2. 资源型 API 契约  
   `prompts`、`workflows`、`projects`、`project-nodes`、`solutions`、`project-node-layouts`、`project-viewports`。

3. 动作型 API 契约  
   节点动作触发、工作流节点动作绑定同步、对话追加、新建对话文件、删除检查、巡检、导入导出、启动自检。

4. 文件与目录契约  
   固定目录结构、相对路径规则、命名规则、最新对话文件判定规则、保护目录规则。

5. 初始化 / 自检 / 修复契约  
   启动检查项、自动创建规则、失败语义、自修复边界、禁止自动执行的危险动作。

---

## 21. 当前版本已落定、后续待细化的事项

### 21.1 已落定

- `L4` 是当前阶段的正式下一层设计
- `L4` 不只包含数据库字段，还包含 API、文件目录与初始化相关契约
- Web API 采用本地 HTTP JSON 形式
- Web API 的正式路由风格采用“资源 CRUD + 显式动作接口”的混合模式
- 动作型接口统一使用 `POST`
- API 前缀统一为 `/api`
- HTTP JSON 字段统一使用 `lowerCamelCase`
- 成功响应与错误响应采用统一顶层结构
- 当前版本统一了常用状态码与基础错误码语义
- `id` 统一为 `UUIDv7` 字符串语义，时间统一为 UTC ISO 8601 字符串
- 资源更新接口当前统一采用 `PATCH`
- `Prompt` 资源的第一版 API 契约已正式定义
- `Workflow` 资源的第一版 API 契约已正式定义
- `workflow_node_actions` 已明确为挂在 `Workflow` 下的子资源 / 配置接口
- `Project`、`ProjectNode` 与 `Solution` 的第一版 API 契约已正式定义
- `chatLogs` 与 `summaries` 的第一版内容契约已正式定义
- 节点删除保护与 `summaryArchives/` 转存的第一版动作契约已正式定义
- Project 视图配置的第一版契约已正式定义
- 项目节点运行时动作的第一版契约已正式定义
- 巡检的第一版动作契约已正式定义
- 导入导出的第一版动作契约已正式定义
- 启动自检 / 初始化的第一版契约已正式定义

### 21.2 待后续继续细化

- DTO 命名与数据库表名、同步文件名之间的映射约定

---

## 22. 当前结论

截至本文档版本，`L4` 已确认的最关键结论如下：

1. `L4` 是当前阶段必须正式补齐的契约层，不再继续停留在抽象讨论。
2. `L4` 至少由 API 契约、文件与目录契约、初始化 / 自检 / 修复契约三部分组成。
3. Web API 是交互层进入服务层的唯一正式入口。
4. API 路由风格正式采用“资源 CRUD + 显式动作接口”的混合模式。
5. 资源型接口保留资源语义，动作型接口统一使用显式 `POST`。

这些结论已经足够作为后续逐项细化 `L4` 正文的稳定起点。
