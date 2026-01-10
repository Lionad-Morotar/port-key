## 前置结论与假设
- 当前仓库为 Node 模块 + CLI 结构：bin、src、locales、test 等，测试用 Vitest，ESM 模块形式。
- 已存在 pnpm-workspace.yaml，但尚未声明 packages；目前是单包结构。[package.json](file:///Users/lionad/Github/Lionad-Morotar/port-key/package.json)、[pnpm-workspace.yaml](file:///Users/lionad/Github/Lionad-Morotar/port-key/pnpm-workspace.yaml)
- 你的第 1 步写的是 packages/cpre，第 2 步写的是 packages/core，推断为“core”更合理。本计划按 packages/core 执行；如需保留“cpre”命名，可在确认后改名为 cpre。

## 目标
- 将仓库改造成 pnpm monorepo，根目录作为 workspace 元数据；核心功能迁入 packages/core 子包。
- 保持 CLI 与库导出行为不变：bin 指向 core 的 bin/port-key.js，exports 指向 core 的 src/port-key.js。

## 目录与文件迁移
- 新建目录：packages/core。
- 迁移内容（原根 → core）：
  - bin → packages/core/bin（保留现有入口逻辑）
  - locales → packages/core/locales（i18n 路径逻辑依旧有效，见 [src/i18n.js](file:///Users/lionad/Github/Lionad-Morotar/port-key/src/i18n.js#L14-L23)）
  - public → packages/core/public（资源目录，当前未在代码中引用）
  - src → packages/core/src（库与 CLI 逻辑保持路径关系不变，见 [bin/port-key.js](file:///Users/lionad/Github/Lionad-Morotar/port-key/bin/port-key.js#L1-L5)）
  - test → packages/core/test（测试随包迁移）
  - CHANGELOG.md → packages/core/CHANGELOG.md（按你的要求）
  - vitest.config.js → packages/core/vitest.config.js（测试配置随包）
- 根目录保留：README.md、LICENSE、pnpm-workspace.yaml；根 README 增补 workspace 说明与子包指引。

## workspace 配置
- 更新 pnpm-workspace.yaml：
  - 声明 packages：
    - packages:
      - packages/*
  - 保留或清理 onlyBuiltDependencies（目前仅 esbuild，若无使用可移除）。

## 包配置调整
- 新建 packages/core/package.json：
  - name：沿用现有包名 @lionad/port-key（保持发包连续性）
  - version/description/type/exports：从根 package.json 迁入，exports 指向 ./src/port-key.js
  - bin：{"port-key": "bin/port-key.js"}
  - files：包含 src、bin、locales、README.md、LICENSE、（可选）public
  - scripts：迁入 test/test:watch（使用 Vitest）
  - devDependencies：迁入 vitest；dependencies：保持为空
- 根 package.json 变为 workspace 元信息：
  - private: true，name 可设为 @lionad/port-key-workspace 或 port-key-workspace
  - scripts：
    - test：pnpm -C packages/core test 或 pnpm -r --filter @lionad/port-key test
    - 可选：lint、release 编排脚本（若需要）
  - 移除 bin、exports、files 等仅属于子包的字段

## 代码路径与行为核对
- CLI 入口：packages/core/bin/port-key.js 持续通过 ../src/cli.js 调用，结构未变。
- i18n 资源定位：src/i18n.js 使用 import.meta.url + 两层 dirname 回到包根，再拼 locales，迁移后依旧成立。
- 配置文件加载：src/config.js 读取用户家目录下文件，与工作区结构无关，无需改动。
- 库导出：exports 指向 src/port-key.js，不变。

## 使用方式
- 初始化：pnpm install（根目录执行，pnpm 将识别 workspace 结构）
- 运行测试：pnpm -C packages/core test 或 pnpm -r --filter @lionad/port-key test
- CLI 调用：发包后用户仍可使用全局命令 port-key；本地开发可通过 node packages/core/bin/port-key.js 进行验证。

## 后续可选增强（非本次必做）
- 增加更多子包（如 examples、website）并在 workspace 中统一管理。
- 在根添加统一的 lint/format/commit hooks 编排。
- 若计划发布多包，考虑使用 changesets 管理版本与发布流程。

## 交付变更摘要
- 搭建 pnpm monorepo；新增 packages/core 子包并迁入核心目录与文件；
- 调整根与子包的 package.json，以保持 CLI/库行为与版本延续；
- 更新 workspace 与测试执行方式，确保迁移后可用。