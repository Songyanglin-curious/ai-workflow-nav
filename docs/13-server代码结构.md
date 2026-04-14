**推荐结构**

```txt
server/
  package.json
  tsconfig.json

  config/
    app.config.jsonc           # 本地配置：端口、数据库、提示词项目路径、外部工具

  sql/
    prompts.sql                # prompts 表结构

  src/
    index.ts                   # 启动入口
    app/
      createApp.ts             # 创建 Fastify 实例，注册路由

    config/
      loadConfig.ts            # 读取并解析 jsonc
      configSchema.ts          # 配置结构校验

    infra/
      db/
        sqlite.ts              # SQLite 连接
        migrate.ts             # 执行 sql 下的建表脚本
      paths/
        promptPaths.ts         # 相对路径与绝对路径转换
      tools/
        toolRunner.ts          # 调用外部工具
        openFile.ts            # 打开文件，当前可落到 VSCode

    modules/
      prompts/
        prompts.routes.ts      # 路由
        prompts.schemas.ts     # zod 入参出参
        prompts.service.ts     # 业务流程
        prompts.repo.ts        # prompts 表读写
        prompts.types.ts       # 模块内类型
        prompts.utils.ts       # 文件名、shortId 等小工具
```

**每层职责**

- `config/`: 只放本地配置文件，不放业务数据。
- `sql/`: 只放建表脚本。
- `src/app`: 应用装配层，只负责启动和注册。
- `src/config`: 配置读取与校验。
- `src/infra/db`: 数据库连接与建表。
- `src/infra/paths`: 路径解析。数据库只存相对路径，绝对路径只在这里和执行阶段出现。
- `src/infra/tools`: 外部工具调用。VSCode 只是当前实现，不是稳定领域概念。
- `src/modules/prompts`: 提示词模块本身，按 route / service / repo 拆分。

**核心边界**

- 调用顺序固定为：`routes -> service -> repo / infra`。
- `routes` 只收参数和回响应，不直接读写 SQLite 或磁盘。
- `service` 负责新建、编辑、删除、打开文件等流程。
- `repo` 只负责 `prompts` 元数据，不处理正文文件。
- 正文文件属于外部提示词项目，通过配置路径访问，不放在 `server/` 内。
- 外部工具路径从 `app.config.jsonc` 读取，不写死在代码里。

**命名建议**

- 路由：`xxx.routes.ts`
- 业务：`xxx.service.ts`
- 数据访问：`xxx.repo.ts`
- 配置读取：`loadXxx.ts`
- 配置校验：`xxxSchema.ts`
- 路径工具：`xxxPaths.ts`
