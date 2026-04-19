# 接口与数据契约-v1 导览与索引

本目录由 [`../个人AI工作流导航器-接口与数据契约-v1.md`](../个人AI工作流导航器-接口与数据契约-v1.md) 拆分而来，目标是把原来的单一超长文档整理成可维护、可跳转、可按主题查阅的分册结构。

## 目录结构

```text
docs/
├─ 个人AI工作流导航器-接口与数据契约-v1.md
└─ 接口与数据契约-v1/
   ├─ README.md
   ├─ 01-总则与通用HTTP契约.md
   ├─ 02-Prompt资源API契约.md
   ├─ 03-Workflow与节点动作绑定契约.md
   ├─ 04-Project与Solution契约.md
   ├─ 05-ProjectNode资源API契约.md
   ├─ 06-deliberations与summaries内容契约.md
   ├─ 07-节点删除保护与summaryArchives契约.md
   ├─ 08-Project视图配置与运行时动作契约.md
   ├─ 09-巡检与导入导出契约.md
   ├─ 10-启动自检与初始化契约.md
   └─ 11-文档组织与当前结论.md
```

## 建议阅读顺序

1. 先读 [01-总则与通用HTTP契约.md](./01-总则与通用HTTP契约.md)，统一 API 风格、状态码、错误码、ID 与时间字段规则。
2. 再按业务对象进入资源契约：[02-Prompt资源API契约.md](./02-Prompt资源API契约.md)、[03-Workflow与节点动作绑定契约.md](./03-Workflow与节点动作绑定契约.md)、[04-Project与Solution契约.md](./04-Project与Solution契约.md)、[05-ProjectNode资源API契约.md](./05-ProjectNode资源API契约.md)。
3. 与文件内容相关的契约集中看 [06-deliberations与summaries内容契约.md](./06-deliberations与summaries内容契约.md)。
4. 与动作执行相关的契约重点看 [07-节点删除保护与summaryArchives契约.md](./07-节点删除保护与summaryArchives契约.md)、[08-Project视图配置与运行时动作契约.md](./08-Project视图配置与运行时动作契约.md)、[09-巡检与导入导出契约.md](./09-巡检与导入导出契约.md)。
5. 启动、自检、初始化相关内容集中在 [10-启动自检与初始化契约.md](./10-启动自检与初始化契约.md)。
6. 需要看拆分原则、当前落定事项与结论时，查 [11-文档组织与当前结论.md](./11-文档组织与当前结论.md)。

## 快速索引

| 主题 | 分册 |
| --- | --- |
| 文档定位、设计依据、`L4` 范围、Web API 总体定位、路由风格、通用 HTTP 契约 | [01-总则与通用HTTP契约.md](./01-总则与通用HTTP契约.md) |
| Prompt 资源接口 | [02-Prompt资源API契约.md](./02-Prompt资源API契约.md) |
| Workflow 资源接口、Workflow 节点动作绑定 | [03-Workflow与节点动作绑定契约.md](./03-Workflow与节点动作绑定契约.md) |
| Project 资源接口、Project 删除保护、`Solution` 归属约定 | [04-Project与Solution契约.md](./04-Project与Solution契约.md) |
| ProjectNode 资源接口 | [05-ProjectNode资源API契约.md](./05-ProjectNode资源API契约.md) |
| `deliberations`、`summaries` 文件内容与目录契约 | [06-deliberations与summaries内容契约.md](./06-deliberations与summaries内容契约.md) |
| 节点删除保护、`summaryArchives` 转存 | [07-节点删除保护与summaryArchives契约.md](./07-节点删除保护与summaryArchives契约.md) |
| Project 视图配置、项目节点运行时动作 | [08-Project视图配置与运行时动作契约.md](./08-Project视图配置与运行时动作契约.md) |
| 巡检、导入导出 | [09-巡检与导入导出契约.md](./09-巡检与导入导出契约.md) |
| 启动自检、初始化、自动修复边界 | [10-启动自检与初始化契约.md](./10-启动自检与初始化契约.md) |
| 文档组织方式、当前已落定事项、当前结论 | [11-文档组织与当前结论.md](./11-文档组织与当前结论.md) |

## 维护约定

- 后续新增接口时，优先补到对应主题分册，不再继续向单一总文档无序追加。
- 如果某一主题再次膨胀，可以在当前分册下继续二次拆分，但应保持 `README.md` 中的索引同步更新。
- 原始总文档可保留为汇总入口；日常查阅与维护优先使用本目录。


