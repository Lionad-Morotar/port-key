# Copilot Coding Agent 指南（port-key）

## 这个仓库是做什么的

PortKey 是一个“项目名 → 端口号”的命名策略与 CLI：
- 将输入字符串中的字母/数字提取后，用键盘映射（`1qaz,2wsx,3edc,4rfv,5tgb,6yhn,7ujm,8ik,9ol,0p`）把字母映射为数字。
- 结合位数偏好与端口限制，生成一个可用端口。
- 支持 CLI 参数与用户配置文件（`~/.port-key/config.json`，兼容旧路径 `~/.portkey/config.json`）。
- 支持 i18n（`cn`/`en`）。

仓库规模较小，纯 JavaScript（Node.js），核心代码集中在 `packages/core`。

## 技术栈与运行时

- Node.js：仓库声明 `>=16`（本地验证在 Node `v24.11.1` 通过）。
- 包管理：pnpm monorepo（根目录 `pnpm-workspace.yaml`）。
- 测试：Vitest `4.0.16`（Node 环境）。
- 模块系统：`packages/core/package.json` 为 `"type": "module"`，核心包使用 ESM。

## 一定要知道的“坑”（避免 CI/本地验证失败）

- CLI 会读取用户 Home 下的配置文件（`~/.port-key/config.json` 或旧的 `~/.portkey/config.json`）。
  - 这会影响默认行为（例如 `preferDigitCount`），导致测试/本地行为因个人配置而变化。
  - 测试中应显式注入 `env: { HOME: <tmp> }` 或设置 `PORTKEY_HOME`，确保不读取真实 Home。
- 由于 core 包是 ESM，源代码与测试里都应使用 `import ... from ...`（不要 `require('vitest')`）。
- 仓库根目录同时存在 `pnpm-lock.yaml` 与 `package-lock.json`：日常开发请优先使用 pnpm，避免锁文件冲突。

## 常用命令（已验证可用）

### 1) 安装依赖（bootstrap）

在根目录执行（推荐）：
- `pnpm install`

说明：根 `npm test` 会调用 `pnpm -C packages/core test`，因此没有 pnpm 会失败。

### 2) 运行测试（validate）

- 根目录：`npm test`（会转到 `packages/core`）
- 仅 core：`pnpm -C packages/core test`
- 监听模式：`pnpm -C packages/core test:watch`

已验证：上述命令在当前工作区可通过（29 tests）。

### 3) 本地运行 CLI（run）

在仓库根目录：
- `node packages/core/bin/port-key.js -- cfetch`

或用 npx（发布包名）：
- `npx @lionad/port-key cfetch`

可选参数：
- `--lang <cn|en>`
- `-m, --map <object>`（JSON 或 JS-like 对象字面量字符串）
- `-d, --digits <4|5>`（偏好端口位数）
- `-h, --help`

### 4) 构建/打包（build）

该仓库目前没有独立 build 产物（无 TS 编译/打包脚本）。发布内容主要来自 `packages/core` 的 `files` 列表。

### 5) Lint/格式化（lint/format）

当前未发现 ESLint/Prettier 配置与对应脚本；如需添加，请确保不引入与 ESM/Node 版本不兼容的规则。

## 项目结构（找代码最快的路径）

根目录：
- `README.md`：产品说明、CLI 用法、配置说明、开发者命令。
- `package.json`：workspace 脚本（`npm test` 委托到 pnpm）。
- `pnpm-workspace.yaml`：monorepo 配置。

核心包：`packages/core`
- `package.json`：包信息、`bin`、`type: module`、vitest 版本。
- `src/port-key.js`：核心映射与端口选择逻辑（`mapToDigits` / `mapToPort` / `pickPortFromDigits` 等）。
- `src/cli.js`：CLI 参数解析与输出，负责读取 config 与 i18n。
- `src/config.js`：用户配置文件路径/读取/合并；支持旧路径回退；也包含 run-count 日志。
- `src/i18n.js` + `locales/*.json`：多语言消息。
- `bin/port-key.js`：CLI 入口（Node shebang + 调用 `runCli`）。
- `test/*.test.js`：vitest 覆盖（核心逻辑、CLI、i18n、用户配置）。
- `CHANGELOG.md`：版本变更记录。

## 提交前自检（建议顺序）

1. `pnpm install`
2. `pnpm -C packages/core test`
3. 如修改 CLI 行为：再跑一次 `node packages/core/bin/port-key.js -- <sample>` 做手动 sanity check。

最后：优先信任本文件中的路径与命令；只有当这里的信息过期或不完整时，才去全仓库 grep/搜索。
