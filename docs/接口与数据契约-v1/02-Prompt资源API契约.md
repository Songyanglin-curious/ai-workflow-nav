# 02. Prompt 资源 API 契约

> 拆分来源：[../个人AI工作流导航器-接口与数据契约-v1.md](../个人AI工作流导航器-接口与数据契约-v1.md)
> 覆盖范围：第 7 节 / L4-02

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
