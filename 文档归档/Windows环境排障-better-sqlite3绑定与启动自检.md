# Windows 环境排障：`better-sqlite3` 绑定与启动自检

## 1. 适用场景

本文用于处理以下场景：

- 仓库从 GitHub 同步到新的 Windows 机器后，准备开始前后端联调
- `server` 与 `web` 的 `typecheck / build` 能通过，但服务端运行前自检失败
- `better-sqlite3` 报错找不到 `better_sqlite3.node`
- `startup self-check` 或容器创建阶段数据库初始化失败

本文记录的是一次真实排障过程，目标不是只给结论，而是保留可复用的排查路径。

## 2. 当时的直接现象

### 2.1 首轮检查结果

先确认了基础环境：

- `node -v` 为 `v22.12.0`
- `pnpm -v` 为 `10.33.0`
- `server` 下 `pnpm typecheck` 通过
- `server` 下 `pnpm build` 通过
- `web` 下 `pnpm typecheck` 与 `pnpm build` 之前也已通过

这说明：

- 代码本身没有明显的 TypeScript 级错误
- 前后端构建链基本是通的
- 阻塞点更可能落在“运行环境”而不是“编译环境”

### 2.2 首个明确阻塞

最早发现了两个问题：

1. 根目录缺少 `local.config.jsonc`
2. `better-sqlite3` 无法加载，报错找不到 `better_sqlite3.node`

典型报错形态类似：

```text
Could not locate the bindings file. Tried:
... better_sqlite3.node
```

### 2.3 首轮误判风险

第一次看到 `better_sqlite3.node` 缺失时，容易把问题直接归因为：

- 机器没装 C++ 编译环境
- `better-sqlite3` 与 `pnpm` 不兼容

这两个判断都可能“部分正确”，但都不足以直接下最终结论。

## 3. 真实根因拆解

这次排障最终拆出了四个彼此独立的问题，它们叠在一起，才让现象显得很乱。

### 3.1 `local.config.jsonc` 缺失

这是服务端启动的硬前提。

仓库里 `server/src/app/container.ts` 会先读取工作区配置，再创建固定目录、打开数据库。缺少该文件时，后续启动路径一定会失败。

### 3.2 `better-sqlite3` 原生绑定确实没有生成

仓库里的 `better-sqlite3@12.9.0` 支持 `Node 22.x`，所以问题不是版本天然不兼容，而是本机没有真正生成：

```text
node_modules/.pnpm/better-sqlite3@12.9.0/node_modules/better-sqlite3/build/Release/better_sqlite3.node
```

### 3.3 机器其实已经装了 VS2022 和 C++

后续验证发现：

- `vswhere.exe` 能找到 Visual Studio 2022
- `VsDevCmd.bat` 存在
- `cl.exe` 也存在

说明“机器没有 C++ 环境”这个判断不成立。

真正的问题是：

- 当前普通 PowerShell 会话没有进入 VS 开发者环境
- 仅执行 `pnpm rebuild better-sqlite3` 时，没有拿到足够清晰的底层编译日志

### 3.4 后续又出现了两个“假阻塞”

在 `better-sqlite3` 编译成功后，又出现了两个容易误导判断的现象：

1. `runtime.sqlite` 切换 `journal_mode` 时出现 `SQLITE_IOERR_DELETE`
2. 直接运行 `dist` 入口时，报 `server/dist/sql/schema/v1/tables` 不存在

这两个都不是“机器环境坏了”。

真实原因分别是：

- `SQLITE_IOERR_DELETE` 发生在当前 Codex shell 的受限执行环境里，会影响 SQLite 清理 `journal` 文件，不能直接代表真实机器行为
- `dist` 入口的相对路径指向 `server/dist/sql/...`，这是构建产物运行路径问题，不是本机环境问题

## 4. 本次排障的完整过程

### 4.1 先补本地配置

在仓库根目录创建：

[`local.config.jsonc`](/D:/code/ai-workflow-nav/local.config.jsonc)

本次使用的最小可用模板是：

```jsonc
{
  "version": 1,
  "workspaceRoot": "D:/code/ai-workflow-nav",
  "server": {
    "port": 3000
  },
  "tools": [],
  "routes": [],
  "security": {
    "allowAbsolutePaths": false,
    "allowedRoots": [
      "D:/code/ai-workflow-nav"
    ]
  }
}
```

补完后，需要确认它能被服务端配置加载逻辑正确读取。

### 4.2 先不要急着相信 `pnpm rebuild` 的“无输出成功”

曾尝试过以下命令：

```powershell
pnpm rebuild better-sqlite3 --pending
pnpm rebuild better-sqlite3
pnpm install --config.allowBuild=better-sqlite3
pnpm rebuild better-sqlite3 --config.allowBuild=better-sqlite3
```

这些命令并没有真正解决问题，原因是：

- 产物仍然不存在
- 表层命令没有给出足够直接的编译日志

所以只看“命令执行完成”是不够的，必须进一步确认：

- `better_sqlite3.node` 是否真的生成
- 直接 `import Database from 'better-sqlite3'` 能不能跑通

### 4.3 用 VS 开发者环境直接触发底层编译

真正起作用的是进入 VS 开发者环境后，直接运行 `node-gyp rebuild`，而不是继续只看 `pnpm rebuild`。

这次验证用的是：

```powershell
cmd /d /s /c "call ""D:\ProgramFiles\code\vs\install\2022\Common7\Tools\VsDevCmd.bat"" -arch=x64 -host_arch=x64 && npm exec node-gyp -- rebuild --release"
```

这一步拿到了关键日志，确认了：

- `Python 3.13` 可用
- `VS2022` 可用
- `MSBuild` 可用
- `better_sqlite3.node` 已生成

生成成功后，可以在以下目录看到产物：

```text
node_modules/.pnpm/better-sqlite3@12.9.0/node_modules/better-sqlite3/build/Release/
```

其中应包含：

- `better_sqlite3.node`
- `better_sqlite3.lib`

### 4.4 用最小探针直接验证绑定是否真的可用

不要只看文件存在，还要直接执行一次最小探针：

```powershell
@'
import Database from 'better-sqlite3';
const db = new Database(':memory:');
const row = db.prepare('select 1 as value').get();
console.log(JSON.stringify(row));
db.close();
'@ | node --input-type=module -
```

预期输出：

```json
{"value":1}
```

只有这一步成功，才能确认绑定真的能被 Node 正常加载。

### 4.5 不要直接把 `dist` 入口失败当成环境失败

本次曾使用：

```powershell
node --input-type=module -
```

去跑 `server/dist/server/src/app/index.js` 相关入口。

结果报错：

```text
ENOENT: no such file or directory, scandir 'D:\code\ai-workflow-nav\server\dist\sql\schema\v1\tables'
```

这不是机器环境坏了，而是因为：

- `getSchemaDirectoryPath()` 在源码里按相对路径定位 `sql/schema/v1/tables`
- 直接从 `dist` 运行时，相对路径落到了 `server/dist/sql/...`

因此：

- 验证本机环境时，不要优先用 `dist` 入口判断最终结论
- 更可靠的做法是从源码入口运行自检

### 4.6 `SQLITE_IOERR_DELETE` 也不能直接当成机器故障

在当前排障过程中，一度出现：

```text
SqliteError: disk I/O error
code: SQLITE_IOERR_DELETE
```

表面看像是：

- 磁盘有问题
- SQLite 不支持 `WAL`
- `runtime.sqlite` 文件损坏

但后续探针发现：

- 同目录下新建其他 SQLite 文件，可以正常切到 `WAL`
- 从源码入口、沙箱外运行时，启动前自检完全通过

所以这次 `SQLITE_IOERR_DELETE` 的判断应当是：

- 它主要受当前排障会话的文件删除限制影响
- 不能直接代表真实系统环境

这类现象在受限 shell、沙箱、某些 IDE 集成终端里都可能出现。

## 5. 最终验证方式

本次最终采用的验证方式是：从源码入口、在真实运行环境下执行启动前自检。

命令形式如下：

```powershell
@'
import { createAppContainer, disposeAppContainer } from './src/app/index.ts';

const container = await createAppContainer({ workspaceRootPath: 'D:/code/ai-workflow-nav' });
try {
  const result = await container.processes.startup.runSelfCheck();
  console.log(JSON.stringify(result, null, 2));
} finally {
  disposeAppContainer(container);
}
'@ | .\node_modules\.bin\tsx.CMD -
```

最终输出为：

```json
{
  "status": "ready",
  "checks": [
    { "checkType": "CONFIG_READABLE", "status": "passed" },
    { "checkType": "CONFIG_VALID", "status": "passed" },
    { "checkType": "WORKSPACE_ROOT_VALID", "status": "passed" },
    { "checkType": "FIXED_DIRECTORIES_READY", "status": "passed" },
    { "checkType": "RUNTIME_DB_READY", "status": "passed" },
    { "checkType": "SCHEMA_EXECUTED", "status": "passed" }
  ]
}
```

这说明：

- 本机 `better-sqlite3` 已正常可用
- 本机 `startup self-check` 已通过
- 当前环境已经可以进入联调

## 6. 给后续新机器的推荐排查顺序

以后如果是“新机器拉仓库下来后准备联调”，建议严格按下面顺序排查，不要跳步。

### 6.1 先查基础命令

```powershell
node -v
pnpm -v
```

### 6.2 再查前后端编译是否正常

```powershell
cd shared
pnpm typecheck
pnpm build

cd ../server
pnpm typecheck
pnpm build

cd ../web
pnpm typecheck
pnpm build
```

### 6.3 再查根目录本地配置

确认以下文件存在并可读：

- [`local.config.jsonc`](/D:/code/ai-workflow-nav/local.config.jsonc)

### 6.4 如果 `better-sqlite3` 报绑定错误

先不要直接下结论，按这个顺序做：

1. 确认 `better-sqlite3` 版本支持当前 Node 版本
2. 确认 `better_sqlite3.node` 是否真的存在
3. 直接跑内存库探针确认绑定是否可加载
4. 如果仍失败，再进入 VS 开发者环境执行 `npm exec node-gyp -- rebuild --release`

### 6.5 如果 `dist` 入口失败

优先区分：

- 是真实环境失败
- 还是构建产物的相对路径问题

本仓库当前更可靠的环境验证方式，是从源码入口跑 `startup self-check`。

### 6.6 如果出现 `SQLITE_IOERR_DELETE`

优先排查以下方向：

1. 当前命令是不是跑在受限 shell / 沙箱里
2. 当前数据库文件是不是刚由受限会话创建
3. 是否存在 IDE、杀毒、同步软件或索引器占用 SQLite 文件
4. 同目录下换一个新文件名能否正常切换 `journal_mode = WAL`

如果换新文件名正常，而固定运行库失败，不要立刻改代码，先排查会话环境和文件占用。

## 7. 本次排障的最终结论

本次问题不是单一根因，而是多层问题叠加：

1. 根目录最初缺少 `local.config.jsonc`
2. `better-sqlite3` 最初确实没有生成原生绑定
3. 机器本身其实已经装了 VS2022 和 C++，问题不在“没装环境”，而在“没有直接进入 VS 开发者环境做底层编译验证”
4. 后续的 `SQLITE_IOERR_DELETE` 与 `dist/sql/schema` 报错，分别属于受限执行环境干扰和构建产物路径问题，不应误判为机器环境损坏

## 8. 当前机器最后保留的状态

本次排障结束后，当前工作区状态如下：

- 根目录已有可用的 [`local.config.jsonc`](/D:/code/ai-workflow-nav/local.config.jsonc)
- 当前运行数据库为 [`db/runtime.sqlite`](/D:/code/ai-workflow-nav/db/runtime.sqlite)
- 为保留排障痕迹，备份目录仍保留在 [`db.backup-20260413-2209`](/D:/code/ai-workflow-nav/db.backup-20260413-2209)

如果后续确认不再需要保留这份排障备份，可由人工决定是否清理。

