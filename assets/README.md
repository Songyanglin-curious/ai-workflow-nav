# assets

`assets/` 用于存放项目级长期资产。

这些内容不直接属于某次功能实现，而是后续多个任务都可能反复复用的沉淀。

## 目录

```text
assets/
├─ rules/        # 规则沉淀
├─ skills/       # 可重复执行的方法
├─ playbooks/    # 排障与操作手册
├─ templates/    # 模板
└─ checklists/   # 检查清单
```

当前阶段先保持一级目录简单，不提前按 `web/`、`server/` 分层。

## 边界

- `docs/`：当前项目这次要做什么、怎么做
- `assets/`：以后别的任务还会反复拿来用的东西
- `web/` / `server/` 内文档：只服务该端代码实现的局部说明

## 当前约定

- 先按资产类型分，不先按 `web/`、`server/` 分
- 只有明显强绑定某一端时，再在子目录中继续分端
- 先保持目录简单，等同类资产变多后再细分

## 累计规则

- 只有会被后续多个任务重复复用的内容，才进入 `assets/`
- 业务模块这次怎么做，继续写在 `docs/`
- 某类资产未累计到足够数量前，优先继续平铺，不提前拆复杂子目录
- 某条资产长期稳定后，可再回收进对应 `AGENTS.md`

## 当前结构

```text
assets/
├─ README.md
├─ rules/
│  ├─ README.md
│  └─ 前端页面实现偏好.md
├─ skills/
│  ├─ README.md
│  └─ 项目级工作流清单.md
├─ playbooks/
│  └─ README.md
├─ templates/
│  └─ README.md
└─ checklists/
   └─ README.md
```

更完整的规划说明见 `docs/14-项目资产规划.md`。
