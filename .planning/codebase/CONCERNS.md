# Codebase Concerns

**Analysis Date:** 2026-07-14

## 整体健康度评估

PortKey 是一个体量小巧（core 约 227 行核心逻辑 + 267 行 CLI、mcp 约 700 行 TS 源码）的 monorepo，单元测试在 `packages/core` 覆盖较为扎实（42 个用例覆盖端口映射、配置合并、CLI 解析、首次运行等关键路径），代码风格整体清晰、命名一致。

剩余短板集中在 **工程基础设施** 与 **测试隔离**：

- 无 ESLint/Prettier/Biome 等代码约束工具，无 husky/lint-staged，无 CI workflow
- mcp 包测试依赖 `dist/` 产物（`pnpm run build && vitest run`），易测到过期代码
- `mcp-server.ts` 存在 `@ts-ignore` / `as any` 滥用，HTTP 模式无单元测试
- 两个本地工具（`check-port-availability` / `get-port-occupancy`）仅支持 macOS/Linux

风险分级：**Critical 0 项 / High 1 项 / Medium 11 项 / Low 6 项**。

---

## 架构与依赖

### [Medium] mcp 测试依赖 `dist/` 产物，可能测到过期代码

**现象：** `packages/mcp/package.json:36` 的 `test` 脚本是 `pnpm run build && vitest run`。测试通过 `bin/port-key-mcp.js` 间接 `import("../dist/mcp-cli.js")`（`packages/mcp/bin/port-key-mcp.js:3`），即测试运行的是 TS 编译后的 JS 而非源码。

**证据：**
- `packages/mcp/package.json:36` — `"test": "pnpm run build && vitest run"`
- `packages/mcp/bin/port-key-mcp.js:3` — `import "../dist/mcp-cli.js";`

**影响：**
- 开发者修改 `src/*.ts` 后忘了 `pnpm run build`，IDE 或单文件 `vitest run` 会测到旧 `dist/`
- TS 类型错误只能在 build 阶段暴露，而非测试阶段

**建议缓解：** 用 `vitest` 直接跑 TS 源码（vitest 原生支持 TS），仅 e2e 测试走 `dist/` 路径。

---

## 配置与隔离

### [Medium] mcp 包无独立 vitest 配置，且未启用 coverage

**现象：** `packages/core/vitest.config.js` 仅设定 `environment: 'node'`，未启 coverage；`packages/mcp/` 完全没有 vitest 配置文件，使用默认值。

**证据：**
- `packages/core/vitest.config.js`（5 行，无 coverage 配置）
- `packages/mcp/` 下不存在 `vitest.config.*`

**影响：** 无法量化测试覆盖率，无法在 CI 中卡 coverage 阈值，重构时缺乏安全网。

**建议缓解：** 在两个包都加 `coverage: { provider: 'v8', reporter: ['text', 'html'], thresholds: { lines: 80 } }`。

### [Low] core 测试通过 `env: { HOME: tmpHome }` 已良好隔离，但 `--help` 测试未隔离

**现象：** `packages/core/test/cli.test.js` 大部分用例都注入了 `env: { HOME: tmpHome }`，但第一个 `prints help when requested`（line 28-37）未注入。

**证据：**
- `packages/core/test/cli.test.js:32` — `runCli(['--lang', 'en', '--help'], stdout, stderr)`（无第四参数 deps）
- `packages/core/src/config.js:8` — 会回退到 `osModule.homedir()` 读真实 `~/.port-key/config.json`

**影响：** `--help` 测试若开发者本地有异常 config，可能行为不一致；同时 `incrementRunCount(deps)`（`cli.js:133`）会污染开发者真实的 `~/.port-key/log.json` 计数。

**建议缓解：** 该测试也注入 `env: { HOME: tmpHome }`。

### [Low] 旧路径 `~/.portkey/config.json` 回退策略未文档化废弃时间表

**现象：** `packages/core/src/config.js:12-18` 优先用新路径 `~/.port-key/config.json`，找不到则回退到 `~/.portkey/config.json`。

**证据：** `packages/core/src/config.js:11-18`

**影响：** 老用户的配置迁移路径未明确，未来若删除回退会静默丢失用户配置。

**建议缓解：** 在 `loadUserConfigSync` 读到旧路径时输出一次性 deprecation warning，并在 README 标注废弃版本。

---

## 代码质量

### [Medium] 类型安全多处被 `as any` / `@ts-ignore` 绕过

**现象：** `packages/mcp/src/mcp-server.ts` 多次使用 `@ts-ignore` 与 `as any`，主要是 Fastify 与 MCP SDK 类型不兼容的妥协。

**证据：**
- `packages/mcp/src/mcp-server.ts:191, 208, 225` — 三处 `@ts-ignore`
- `packages/mcp/src/mcp-server.ts:41, 50, 64, 78, 81, 236, 245` — 多处 `as any`
- `packages/mcp/src/tools/map-project-name-to-port.ts:16` — `execute: async ({ projectName, map, ... }: any)` 把整个 zod schema 类型抹掉
- `packages/mcp/src/tools/get-design-philosophy.ts:29` — 同上
- `packages/mcp/src/tools/get-port-occupancy.ts:21` — `const processes: any[] = []`

**影响：** TS 强类型保护被绕开，zod schema 与 execute 入参类型脱钩，未来 schema 字段重命名不会触发编译期错误。

**建议缓解：**
- 为每个 tool 定义 `z.infer<typeof inputSchema>` 作为 execute 入参类型
- Fastify 路由用 `FastifyInstance` 与 `FastifyRequest`/`FastifyReply` 替代 `@ts-ignore`
- 或升级 `@modelcontextprotocol/sdk` 到对 Fastify 友好的版本

### [Medium] `mcp-cli.ts` 使用 `console.log` 而非 winston logger

**现象：** `packages/mcp/src/mcp-cli.ts` 使用 `console.log`（line 9, 79）而非项目已引入的 winston logger。

**证据：**
- `packages/mcp/src/mcp-cli.ts:9` — `console.log(\`Usage: port-key-mcp [options]\`)`
- `packages/mcp/src/mcp-cli.ts:79` — `console.log(\`PortKey MCP Server already running...\`)`

**影响：** `console.log` 绕过 winston 的格式化、级别控制与文件轮转。

**建议缓解：** 统一用 logger 替代 `console.log`。

### [Low] 无 ESLint / Prettier / Biome 配置

**现象：** 仓库根与子包均无 `.eslintrc*`、`.prettierrc*`、`eslint.config.*`、`biome.json`。

**证据：** `ls .eslintrc* .prettierrc* eslint.config.* biome.json 2>/dev/null` 全部不存在

**影响：** 风格漂移（如 core 用单引号、mcp 混用单双引号；core 无分号、mcp 部分有分号），review 成本上升。

**建议缓解：** 引入 Biome（一体式、零配置、极快），在根 `package.json` 加 `"lint": "biome check ."` 与 `"format": "biome format --write"`。

---

## 安全与健壮性

### [High] `check-port-availability.ts` 与 `get-port-occupancy.ts` 仅支持 macOS/Linux

**现象：** 两个工具都依赖 `lsof`，而 `lsof` 仅在 macOS/Linux 可用。

**证据：**
- `packages/mcp/src/tools/check-port-availability.ts:19` — `// lsof 仅在 macOS/Linux 可用`
- `packages/mcp/src/tools/check-port-availability.ts:35` — 命令不存在（如 Windows 无 lsof）时显式报错
- `packages/mcp/src/tools/get-port-occupancy.ts:19` — `execFileAsync("lsof", ["-i", "-P", "-n"])`

**影响：** Windows 用户调用这两个 MCP tool 会得到 `lsof is not available` 错误。

**建议缓解：** `process.platform === 'win32'` 时切换到 `netstat -ano | findstr :<port>` 或引入 `node-netstat` 库。

### [Medium] `parseUserMap` 正则 fallback 接受畸形输入

**现象：** `packages/core/src/port-key.js:200` 的正则 `([0-9])\s*:\s*(['"])(.*?)\2` 用非贪婪 `.*?` 匹配引号内容，对未闭合引号、嵌套引号等畸形输入容错过度。

**证据：**
- `packages/core/src/port-key.js:200` — `const re = /([0-9])\s*:\s*(['"])(.*?)\2/g;`
- 测试 `packages/core/test/port-key.test.js:70-96` 仅覆盖合法 JSON、合法 JS 字面量、明显非法输入，未覆盖 `{ 1: 'qaz, 0: p }` 这类混合畸形

**影响：** 用户传入意外字符串时静默解析出部分结果，调试困难。

**建议缓解：** 正则匹配失败时记录原始字符串与解析结果到 stderr；或直接移除 fallback 只接受 JSON。

---

## 发布与版本

### [Medium] core 的 `prepublishOnly` / `postpublish` README 复制模式有竞态

**现象：** `packages/core/package.json:37-38` 在发布前 `cp ../../README.md ./README.md`，发布后 `rm ./README.md`。若 `pnpm publish` 中途失败（如网络错误、OTP 错误），README.md 会残留在 `packages/core/` 下，下次 `git status` 显示脏工作区。

**证据：** `packages/core/package.json:37-38`

**影响：** 发布失败后需手工清理；若开发者未注意直接 commit，会把根 README 复制件混入 packages/core（虽然 `.gitignore` 不忽略它，但 `files` 白名单已包含 README.md）。

**建议缓解：** 改为在 `prepack` 钩子中复制到 `dist/` 下并从 `files` 中读取，或用 `npmignore` 配合 `.npmrc` 的 `auto-install-peers=false` 等更稳靠的方式。

### [Low] skills 包无 build/test，仅占位 echo

**现象：** `packages/skills/package.json:23-24` 的 `build` 与 `test` 都是 `echo 'skip ...'`。

**证据：** `packages/skills/package.json:23-24`

**影响：** 根 `pnpm -r run test` 会显示 skills 通过但实际未测；skills 内容（markdown）确实无需传统测试，但可考虑加 markdownlint 或链接检查。

**建议缓解：** 加 `markdownlint-cli2` 与 `lychee`（链接检查）作为 skills 包的 test。

---

## 文档与可维护性

### [Medium] i18n 覆盖不一致：core 2 种、mcp 10 种、skills 0 种

**现象：**
- `packages/core/locales/`：仅 `cn.json`、`en.json`
- `packages/mcp/locales/`：`ar/cn/de/es/fr/it/ja/ko/pt/ru` 共 10 种
- `packages/skills/`：无 i18n

**证据：** `ls packages/core/locales/ packages/mcp/locales/`

**影响：** 用户在 core CLI 用 `--lang fr` 会被拒（`cli.js:156` 只允许 `en|cn`），但 mcp 又支持法语，体验断裂。

**建议缓解：** 要么统一为 10 种（core 补齐），要么把 i18n 抽到独立 `@lionad/port-key-locales` 包共享。

### [Medium] `mcp/config/index.ts` 顶层 `dotenv.config()` 是隐藏副作用

**现象：** `packages/mcp/src/config/index.ts:3` 在模块顶层调用 `dotenv.config()`，任何 `import config from '../config/index.js'` 都会触发 `.env` 读取。

**证据：** `packages/mcp/src/config/index.ts:1-3`

**影响：** 测试中 `import` 该模块会读项目根 `.env`（如果存在），污染环境；多个测试间状态泄漏。

**建议缓解：** 把 `dotenv.config()` 移到 `bin/port-key-mcp.js` 入口处显式调用，config 模块只做纯读取。

### [Low] README config 示例包含 `//` 注释，JSON.parse 会静默失败

**现象：** 用户照抄 README 的 config 示例（若含 `//` 注释）会导致 `JSON.parse` 抛错，`loadUserConfigSync` 的 try/catch 静默回退到默认配置，用户无感知（除非留意 stderr 的 `configReadFailed` 提示）。

**证据：**
- `packages/core/src/config.js:34` — `const parsed = JSON.parse(raw);`
- `packages/core/src/config.js:39-41` — catch 后返回 `{ configReadError: true }`

**影响：** 用户改了配置但行为没变，调试困难。

**建议缓解：** README 示例改为不带注释的纯 JSON；或支持 JSONC（用 `jsonc-parser` 替代 `JSON.parse`）。

---

## 可观测性

### [Medium] mcp 包 `logs/` 目录下残留 audit JSON 是测试副产物

**现象：** `packages/mcp/logs/` 下有 4 个 `.<hash>-audit.json` 与 `combined-2026-01-12.log`、`error-2026-01-12.log`。这些是测试运行时 winston 写入的副产物（logger 默认写到 `~/.port-key/logs/`，但测试可能改了路径或当前工作目录写入了 `packages/mcp/logs/`）。

**证据：**
- `packages/mcp/logs/.6b77785a74c362881f6fb7e95a7530280abbf9ed-audit.json` 等 4 个 audit 文件
- `git check-ignore packages/mcp/logs` 返回 `packages/mcp/logs`（即被 ignore，未入库）

**影响：** 不影响 git（已 ignore），但本地工作区会累积测试日志，混淆"哪些是真实运行日志"。

**建议缓解：** 在 `vitest.config.ts` 中将 logger 写入 `os.tmpdir()` 或在测试 setup 中 mock logger。

### [Medium] `session-manager.ts` 的 `setInterval` 让 Node 进程无法优雅退出

**现象：** `packages/mcp/src/utils/session-manager.ts:21` 在构造函数启动 `setInterval(() => this.cleanup(), 60000)`，`ref` 默认持有事件循环。只有显式调用 `destroy()` 才会 `clearInterval`。

**证据：**
- `packages/mcp/src/utils/session-manager.ts:21` — `this.cleanupInterval = setInterval(() => this.cleanup(), 60000);`
- `packages/mcp/src/utils/session-manager.ts:81` — `destroy()` 中 clearInterval

**影响：**
- 测试中 `new SessionManager()` 后进程不会自然退出，vitest 报 `did not exit gracefully`
- 若 SIGKILL 杀进程（非 SIGTERM/SIGINT），`destroy()` 不触发，interval 在 OS 层随进程消失但未清理

**建议缓解：** `setInterval(fn, 60000).unref()` 让 timer 不阻止退出；或在 `process.on('beforeExit')` 中调 `destroy()`。

---

## 测试覆盖缺口

### [Medium] `mcp-server.ts` HTTP 模式（runHttp）完全无单元测试

**现象：** `packages/mcp/tests/` 下只有 `mcp-cli.test.js`（测启动）、`mcp-server.test.ts`、tools/utils 单测，没有覆盖 Fastify 路由 `/health`、`/mcp` POST/GET/DELETE、session 复用、EADDRINUSE 回退等关键 HTTP 路径。

**证据：**
- `find packages/mcp/tests -name "*.test.*"` 未见 `http.test.ts` 或 `runHttp` 相关测试
- e2e 测试 `packages/mcp/tests/e2e/mcp-cli.e2e.test.ts` 存在但聚焦 CLI 启动

**影响：** HTTP transport 是 mcp 包的核心卖点（0.4.0 引入），无回归保护。

**建议缓解：** 引入 `fastify.inject()` 做 HTTP 路由单测，覆盖 initialize / message / delete / 健康检查 / 端口占用回退。

### [Low] `parseUserMap` 正则 fallback 路径无针对性测试

**现象：** `packages/core/test/port-key.test.js:70-96` 的 `parseUserMap` 测试只覆盖了 JSON 成功、JS 字面量成功、明显失败；未覆盖"JSON.parse 失败后走正则"的中间路径上的畸形输入。

**证据：** `packages/core/test/port-key.test.js:70-96`

**影响：** 正则 fallback 行为变更不会被测试捕获。

**建议缓解：** 加测试用例：`{ 1: 'qaz", 0: 'p' }`（引号不匹配）、`{ 1: qaz }`（无引号）、`{1:'qaz'`（未闭合括号）等。

---

## 快速修复优先级清单

### 短期跟进（1-2 周内）

1. **引入 Biome + husky/lint-staged**，把代码风格固化下来
2. **`session-manager.ts` 的 `setInterval` 加 `.unref()`**，避免测试进程无法优雅退出
3. **core `--help` 测试注入 `env: { HOME: tmpHome }`**，补齐隔离
4. **`mcp-cli.ts` 的 `console.log` 改用 winston logger**

### 中期（按迭代节奏推进）

5. mcp 测试改用 vitest 直接跑 TS 源码（仅 e2e 走 `dist/`）
6. 两包加 vitest coverage 阈值（`lines: 80`）
7. 为 tools 定义 `z.infer<typeof inputSchema>`，消除 `as any` / `@ts-ignore`
8. `dotenv.config()` 从 config 模块移到 bin 入口
9. 补 `runHttp` 单元测试（Fastify inject）

### 长期

10. 统一 core / mcp 的 i18n 语言覆盖
11. 加 GitHub Actions workflow 跑 `pnpm test` + `pnpm lint`
12. Windows 平台支持（lsof → netstat 切换）
13. 旧路径 `~/.portkey/` 加 deprecation warning
14. 拆分 `mcp-server.ts` 为 `transports/http.ts` + `transports/stdio.ts`

---

*Concerns audit: 2026-07-14*
