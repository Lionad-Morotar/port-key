# Agents.md

PortKey 是基于 QWERTY 键盘字母到数字映射的"项目名 → 端口号"命名策略 CLI 工具，采用 pnpm monorepo 结构，包含三个子包：`@lionad/port-key`（纯 JS ESM 核心 CLI）、`@lionad/port-key-mcp`（TypeScript MCP Server）、`@lionad/port-key-skills`（Agent skills）。

* 现实层你有无限时间和资源，不要因上下文压缩简化任务执行

## 项目上下文

| 文档 | 说明 |
| --- | --- |
| [README.md](./README.md) | 产品说明、CLI 用法、配置、开发者命令 |
| [STACK.md](./.planning/codebase/STACK.md) | 技术栈、运行时、关键依赖、版本快照 |
| [STRUCTURE.md](./.planning/codebase/STRUCTURE.md) | 目录结构、命名约定、文件速查表 |
| [ARCHITECTURE.md](./.planning/codebase/ARCHITECTURE.md) | 架构模式、核心管道、反模式 |
| [CONVENTIONS.md](./.planning/codebase/CONVENTIONS.md) | 代码风格、开发约定、提交规范 |
| [TESTING.md](./.planning/codebase/TESTING.md) | 测试规范、运行命令、隔离策略 |
| [INTEGRATIONS.md](./.planning/codebase/INTEGRATIONS.md) | MCP 协议、外部服务、环境变量 |
| [CONCERNS.md](./.planning/codebase/CONCERNS.md) | 技术债务、关注点分级、修复清单 |
| [SPEC 文档](./.trae/documents/) | 重构与发布的设计决策（禁止更新或删除） |

你可以自行读取项目上下文文档，更新时也优先更新相关文档。
