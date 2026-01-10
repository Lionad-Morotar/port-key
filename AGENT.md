# PortKey 开发代理指南

此文件为开发代理（LLM）提供了关于 PortKey 项目的必要指引。

## 文档索引

以下位置包含了 PortKey 项目的详细文档，在进行开发任务时请参考这些文档：

**务必参考**

- `.github/copilot-instructions.md`：包含仓库功能介绍、技术栈、常见命令、项目结构等关键信息

**SPEC**

- `.trae/documents/准备发布 PortKey 到 npm 的计划.md`：包含发布配置、包体验证等发布相关信息
- `.trae/documents/重构为 pnpm monorepo 并拆分 core 子包.md`：包含 monorepo 结构、包配置调整等重构相关信息

其他 SPEC 文档可在 `.trae/documents/` 目录中查找。

## 开发注意事项

在进行任何开发任务时，请务必：
1. 遵循务必参考的文档以了解项目背景和技术细节
2. 了解 SPEC 文档，并在必要时参考相关内容
3. 在必要时，允许更新 `.github/copilot-instructions.md` 以保持同步
4. 永远禁止更新或删除 SPEC 文档

## 文件结构

PortKey 采用 pnpm monorepo 结构：
- 根目录：包含整体项目配置和 README 文档
- `packages/core`：核心包，包含主要逻辑和 CLI 实现