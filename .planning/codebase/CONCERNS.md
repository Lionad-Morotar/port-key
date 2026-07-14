# Codebase Concerns

**Analysis Date:** 2026-07-13

> **更新备忘（2026-07-13 同日代码改动后）：** 本快照生成于下列改动之前，部分条目状态已变更：
> - ✅ **已修复**：mcp 依赖 `^0.3.0` → `workspace:*`；mcp-server.ts 两处版本号统一抽到 `packages/mcp/src/version.ts`（顺带修复云端模式 `0.1.5` 滞后）；mcp-cli.test.js 断言对齐实际启动日志
> - ❌ **误报**：「bump-version.sh 使用 `--no-git-checks`」实际为 `--no-verify`（合法 flag），系分析误差
> - ℹ️ **作废引用**：`scripts/bump-version.sh`、`.github/copilot-instructions.md`、`.trae/`、`AGENT.md` 均已移除；发版改用 `/release-project`；core 测试用例 29 → 39
> - 其余条目（logger maxSize、死代码、Biome 等）仍有效，见正文

## 整体健康度评估

PortKey 是一个体量小巧（core 约 227 行核心逻辑 + 267 行 CLI、mcp 约 700 行 TS 源码）的 monorepo，单元测试在 `packages/core` 覆盖较为扎实（29 个用例覆盖端口映射、配置合并、CLI 解析、首次运行等关键路径），代码风格整体清晰、命名一致。

但在 **工程基础设施** 与 **跨包一致性** 上存在明显短板：

- 无 ESLint/Prettier/Biome 等代码约束工具，无 husky/lint-staged，无 CI workflow
- 跨包版本依赖未使用 `workspace:` 协议（`packages/mcp/package.json:57` 写死 `^0.3.0`），发布到 npm 后 mcp 包将拉取错误的 core 版本
- mcp 包测试依赖 `dist/` 产物（`pnpm run build && vitest run`），易测到过期代码
- `mcp-server.ts` 存在硬编码版本号、规划性注释残留、`@ts-ignore` 滥用
- 多处文档（`.github/copilot-instructions.md`）已与代码现状脱节

风险分级：**Critical 4 项 / High 7 项 / Medium 9 项 / Low 7 项**。Critical 项均已在下文标注并附证据文件与行号。

---

## 架构与依赖

### [Critical] 跨包依赖未使用 `workspace:` 协议，发布版会拉错误 core

**现象：** `packages/mcp/package.json:57` 声明 `"@lionad/port-key": "^0.3.0"`，但当前 `packages/core/package.json:3` 是 `0.5.0`。`^0.3.0` 按 semver 解析为 `>=0.3.0 <0.4.0`，**不接受 0.5.0**。

**证据：**
- `packages/mcp/package.json:57` — `"@lionad/port-key": "^0.3.0"`
- `packages/core/package.json:3` — `"version": "0.5.0"`
- `pnpm-workspace.yaml` 已配置 `packages: - packages/*`，本地开发时 pnpm 会通过名称解析拉到本地版本，所以本地测试通过；但 `pnpm publish` 后，npm registry 上的 `@lionad/port-key-mcp@0.5.0` 安装时只会拉到 `@lionad/port-key@0.3.x`。

**影响：**
- 发布后的 mcp 包使用过期 core（缺 `paddingZero` 默认行为修正、`parseUserMap` 增强、`pickPortFromDigits` 5 位回退逻辑等 0.4-0.5 的改进）
- 任何 npm 用户安装 `@lionad/port-key-mcp@latest` 都拿到不一致的行为

**建议缓解：** 改为 `"@lionad/port-key": "workspace:*"`（或精确版本 `"0.5.0"`）。`workspace:*` 在 `pnpm publish` 时会自动替换为当前 workspace 版本，从根上解决漂移。

### [High] `mcp-server.ts` 在 `isLocal === false` 分支硬编码 `version: "0.1.5"`

**现象：** `packages/mcp/src/mcp-server.ts:286-290` 当用户传入 `--local false` 时，重建 McpServer 实例时硬编码了 `0.1.5` 旧版本号，旁边的注释甚至自承 `"// Should match what was in createServer"`。

**证据：**
- `packages/mcp/src/mcp-server.ts:289` — `version: "0.1.5", // Should match what was in createServer`
- `packages/mcp/src/mcp-server.ts:29` — 同文件 `createServer()` 内是 `version: "0.5.0"`

**影响：**
- 云端模式启动的 MCP Server 自报版本为 0.1.5，MCP 客户端可见错误版本号
- `scripts/bump-version.sh:96-118` 的版本同步脚本只更新 `// ! AUTO GENERATED VERSION` 标记的下一行（即 createServer 中的版本），**不会更新第 289 行的硬编码**

**建议缓解：** 在 `MCPServerApp` 中将 version 提取为 `private static readonly VERSION = "0.5.0"` 或常量导入，所有创建 McpServer 的位置引用同一来源。

### [Medium] mcp 测试依赖 `dist/` 产物，可能测到过期代码

**现象：** `packages/mcp/package.json:36` 的 `test` 脚本是 `pnpm run build && vitest run`。测试通过 `bin/port-key-mcp.js` 间接 `import("../dist/mcp-cli.js")`（`packages/mcp/bin/port-key-mcp.js:3`），即测试运行的是 TS 编译后的 JS 而非源码。

**证据：**
- `packages/mcp/package.json:36` — `"test": "pnpm run build && vitest run"`
- `packages/mcp/bin/port-key-mcp.js:3` — `import "../dist/mcp-cli.js";`

**影响：**
- 开发者修改 `src/*.ts` 后忘了 `pnpm run build`，IDE 或单文件 `vitest run` 会测到旧 `dist/`
- TS 类型错误只能在 build 阶段暴露，而非测试阶段

**建议缓解：** 用 `vitest` 直接跑 TS 源码（vitest 原生支持 TS），仅 e2e 测试走 `dist/` 路径。

### [Low] `preferredRanges` 配置项是死代码

**现象：** `packages/core/src/cli.js:175` 和 `packages/core/src/config.js:55` 都处理 `preferredRanges`，但 `packages/core/src/port-key.js` 的 `pickPortFromDigits` 从未读取该字段。

**证据：**
- `packages/core/src/config.js:55` — `preferredRanges: b.preferredRanges ?? a.preferredRanges,`
- `packages/core/src/port-key.js` 中无任何 `preferredRanges` 引用

**影响：** 用户在 `config.json` 配 `preferredRanges` 完全无效，是隐性欺骗。

**建议缓解：** 要么实现该功能，要么从 `mergeConfig` 中移除以避免误导。

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

### [High] `mcp-server.ts` 第 273-299 行存在大量规划性注释残留

**现象：** `packages/mcp/src/mcp-server.ts:273-299` 的 `run()` 方法内有大段"应该这样改 / 不能那样改 / Let's modify..."的开发追踪式注释，违反 CLAUDE.md "禁止夹带开发追踪标记" 的规则。

**证据：**
- `packages/mcp/src/mcp-server.ts:273-285` — 包含 `// Better approach:`, `// But since constructor calls createServer, let's just create a NEW server instance...` 等讨论性注释
- `packages/mcp/src/mcp-server.ts:289` — `version: "0.1.5", // Should match what was in createServer`（与上面 Critical 项关联）

**影响：** 代码可读性下降，未来维护者难以判断哪些是"已实现"哪些是"待办"。

**建议缓解：** 删除所有讨论性注释，保留描述当前行为 Why 的简洁注释；将版本号提取为常量。

### [High] `mcp-server.ts` 体积 310 行，已破 FILE_LEN=300 警戒线

**现象：** `wc -l packages/mcp/src/mcp-server.ts` = 310 行，且承担了 server 创建、tool/resource 注册、Stdio/HTTP 两种 transport、health check、session 管理、graceful shutdown 等多重职责。

**证据：** `packages/mcp/src/mcp-server.ts`（310 行）

**影响：** 单文件高耦合，HTTP transport 部分（line 105-256）与 Stdio（line 93-103）混在一起，修改一处易影响另一处。

**建议缓解：** 拆分为 `mcp-server.ts`（核心 McpServerApp）+ `transports/http.ts`（Fastify 路由）+ `transports/stdio.ts`。

### [Medium] 类型安全多处被 `as any` / `@ts-ignore` 绕过

**现象：** `packages/mcp/src/mcp-server.ts` 多次使用 `@ts-ignore` 与 `as any`，主要是 Fastify 与 MCP SDK 类型不兼容的妥协。

**证据：**
- `packages/mcp/src/mcp-server.ts:190` — `// @ts-ignore - Fastify types compatibility`
- `packages/mcp/src/mcp-server.ts:207, 224` — 另两处 `@ts-ignore`
- `packages/mcp/src/mcp-server.ts:41, 50, 64, 78, 81` — 多处 `as any`
- `packages/mcp/src/tools/map-project-name-to-port.ts:16` — `execute: async ({ projectName, map, ... }: any)` 把整个 zod schema 类型抹掉
- `packages/mcp/src/tools/get-design-philosophy.ts:29` — 同上
- `packages/mcp/src/tools/get-port-occupancy.ts:27` — `const processes: any[] = []`

**影响：** TS 强类型保护被绕开，zod schema 与 execute 入参类型脱钩，未来 schema 字段重命名不会触发编译期错误。

**建议缓解：**
- 为每个 tool 定义 `z.infer<typeof inputSchema>` 作为 execute 入参类型
- Fastify 路由用 `FastifyInstance` 与 `FastifyRequest`/`FastifyReply` 替代 `@ts-ignore`
- 或升级 `@modelcontextprotocol/sdk` 到对 Fastify 友好的版本

### [Medium] `mcp-cli.ts` 顶层副作用 + `console.log` 不走 logger

**现象：** `packages/mcp/src/mcp-cli.ts` 在模块顶层即执行 `process.argv.slice(2)` 解析（line 5）、`fetch` 健康检查（line 77）、`mcpServerApp.run(options)`（line 84），且使用 `console.log`（line 9, 79）而非项目已引入的 winston logger。

**证据：**
- `packages/mcp/src/mcp-cli.ts:9` — `console.log(\`Usage: port-key-mcp [options]\`)`
- `packages/mcp/src/mcp-cli.ts:79` — `console.log(\`PortKey MCP Server already running...\`)`
- `packages/mcp/src/mcp-cli.ts:84` — `await mcpServerApp.run(options);`（顶层 await 副作用）

**影响与现状：**
- 顶层副作用原本的风险是"`import` 该模块即触发 CLI 运行"。此风险**已通过 CLI-only 模式消除**（2026-07-14）：`packages/mcp/package.json` 移除了 `main`/`exports`/`types`，包不可被 `import`（`ERR_MODULE_NOT_FOUND` 安全失败），顶层副作用只剩"作为可执行程序启动"这一条路径——与官方 TS MCP server（filesystem/memory/everything）一致，属预期行为。
- 剩余小问题：`console.log` 绕过 winston 的格式化、级别控制、文件轮转；且因入口带顶层副作用，无法直接单测（需 fork 子进程，现有 `mcp-cli.test.js` 与 e2e 即如此）。

**说明（原守护建议已否决）：** 曾考虑 `if (import.meta.url === \`file://${process.argv[1]}\`) main()` 守护，但调研发现它与 bin 两层转发（`bin/port-key-mcp.js` → `import "../dist/mcp-cli.js"`）冲突——经 bin 调用时 `process.argv[1]` 是 bin 脚本而非 mcp-cli，守护为假导致 main 不执行。官方 TS MCP server 不用守护，靠"不提供库入口"让副作用入口安全，故采此模式。仍建议：统一用 logger 替代 `console.log`。

### [Low] 无 ESLint / Prettier / Biome 配置

**现象：** 仓库根与子包均无 `.eslintrc*`、`.prettierrc*`、`eslint.config.*`、`biome.json`。

**证据：** `ls .eslintrc* .prettierrc* eslint.config.* biome.json 2>/dev/null` 全部不存在

**影响：** 风格漂移（如 core 用单引号、mcp 混用单双引号；core 无分号、mcp 部分有分号），review 成本上升。

**建议缓解：** 引入 Biome（一体式、零配置、极快），在根 `package.json` 加 `"lint": "biome check ."` 与 `"format": "biome format --write"`。

---

## 安全与健壮性

### [Critical] `mcp-cli.test.js` 断言的消息源代码并不输出（测试静默失效）

**现象：** `packages/mcp/tests/mcp-cli.test.js:30` 断言 stderr 匹配 `/PortKey MCP server is running/u`，但 `mcp-server.ts` 实际通过 winston logger 输出的是 `"Starting PortKey MCP Server in Stdio mode"`（line 94）与 `"PortKey MCP Server connected to Stdio transport"`（line 98）——大小写、措辞均不一致。

**证据：**
- `packages/mcp/tests/mcp-cli.test.js:30` — `assert.match(data.toString(), /PortKey MCP server is running/u)`
- `packages/mcp/src/mcp-server.ts:94` — `logger.info("Starting PortKey MCP Server in Stdio mode")`
- `packages/mcp/src/mcp-server.ts:98` — `logger.info("PortKey MCP Server connected to Stdio transport")`

**影响：**
- 测试用 `done` 回调，未匹配则 vitest 默认 5s 超时失败 —— 即 `pnpm test` 在 mcp 包应该是红的（或开发者从未实际运行）
- 给人"mcp 启动已被测试覆盖"的假象

**建议缓解：** 修正 regex 为 `/PortKey MCP Server/i` 或精确匹配 `"connected to Stdio transport"`；并验证 `pnpm test` 在 mcp 包是否能通过。

### [High] `get-port-occupancy.ts` 存在死代码分支

**现象：** `packages/mcp/src/tools/get-port-occupancy.ts:17-23` 有一段"如果传入 ports 则过滤"的注释与空 `if` 块，实际从未实现过滤逻辑，工具总是返回所有监听端口。

**证据：**
- `packages/mcp/src/tools/get-port-occupancy.ts:17-23` — `if (ports && ports.length > 0) { /* 注释，无代码 */ }`
- 后续 line 38 的 `if (!ports || ports.includes(port))` 是在 JS 层过滤，但注释说要在 shell 层过滤

**影响：** 工具名暗示可按端口查询，实际在大机器上会返回成百上千行 lsof 输出，性能差且信息泄漏（其他用户进程）。

**建议缓解：** 删除死代码分支；或真正实现 `lsof -i :PORT1 -i :PORT2` 拼接。

### [High] `check-port-availability.ts` 与 `get-port-occupancy.ts` 仅支持 macOS/Linux

**现象：** 两个工具都硬编码 `lsof` 命令，注释明示"For Windows, netstat might be needed, but assuming macOS environment"。

**证据：**
- `packages/mcp/src/tools/check-port-availability.ts:18` — `// For Windows, netstat might be needed, but assuming macOS environment as per context`
- `packages/mcp/src/tools/get-port-occupancy.ts:17` — `let command = "lsof -i -P -n";`

**影响：** Windows 用户调用这两个 MCP tool 会得到 `lsof: command not found` 错误。

**建议缓解：** `process.platform === 'win32'` 时切换到 `netstat -ano | findstr :<port>` 或引入 `node-netstat` 库。

### [Medium] `parseUserMap` 正则 fallback 接受畸形输入

**现象：** `packages/core/src/port-key.js:200` 的正则 `([0-9])\s*:\s*(['"])(.*?)\2` 用非贪婪 `.*?` 匹配引号内容，对未闭合引号、嵌套引号等畸形输入容错过度。

**证据：**
- `packages/core/src/port-key.js:200` — `const re = /([0-9])\s*:\s*(['"])(.*?)\2/g;`
- 测试 `packages/core/test/port-key.test.js:70-96` 仅覆盖合法 JSON、合法 JS 字面量、明显非法输入，未覆盖 `{ 1: 'qaz, 0: p }` 这类混合畸形

**影响：** 用户传入意外字符串时静默解析出部分结果，调试困难。

**建议缓解：** 正则匹配失败时记录原始字符串与解析结果到 stderr；或直接移除 fallback 只接受 JSON。

### [Low] `lsof :${port}` 命令注入面（已被 zod 缓解但应防御性记录）

**现象：** `packages/mcp/src/tools/check-port-availability.ts:20` 使用模板字符串拼 shell 命令 `lsof -i :${port}`。

**证据：** `packages/mcp/src/tools/check-port-availability.ts:20`

**影响：** 当前 zod schema `z.number().int().min(0).max(65535)` 已确保 port 是合法整数，注入面被消除；但若未来 schema 放松（如接受字符串），会立刻暴露注入风险。

**建议缓解：** 改用 `execFile('lsof', ['-i', \`:${port}\`])` 形式（参数数组），即使 schema 改动也安全。

---

## 发布与版本

### [Critical] `scripts/bump-version.sh` 使用非法 git flag `--no-git-checks`

**现象：** `scripts/bump-version.sh:128` 写的是 `git commit -m "release: v$NEW_VERSION" --no-git-checks`，但 `--no-git-checks` 是 `pnpm publish` 的 flag，**`git commit` 不识别该参数**，会以 `error: unknown option --no-git-checks` 退出。

**证据：**
- `scripts/bump-version.sh:128` — `git commit -m "release: v$NEW_VERSION" --no-git-checks`
- `git commit --help` 中无 `--no-git-checks`，仅有 `--no-verify`（跳过 pre-commit hook）

**影响：** 执行 `pnpm bump` 会在 commit 阶段失败；但 `set -e` 下 `pnpm install`（line 121）与 `git add .`（line 124）已执行，留下未提交的 staging 区，需手工 `git commit` 收尾。仓库 `release: v0.5.0` 提交存在，说明要么手工补救过，要么脚本从未走完。

**建议缓解：** 改为 `git commit -m "release: v$NEW_VERSION" --no-verify`（如果目的是跳过 hook）。

### [Medium] `bump-version.sh` 的 CHANGELOG 检查可被 `--dry-run` 绕过且不验证内容

**现象：** `scripts/bump-version.sh:34-66` 通过 `git diff --name-only HEAD | grep "^$CHANGELOG$"` 判断 CHANGELOG 是否改动，但只看"是否在 git diff 中"，不看内容是否包含新版本号。

**证据：** `scripts/bump-version.sh:51` — `if ! git diff --name-only HEAD | grep -q "^$CHANGELOG$"`

**影响：** 开发者可以只加一个空行绕过检查；dry-run 模式完全跳过检查。

**建议缓解：** 解析 CHANGELOG.md 首个 `## v` 标题，校验是否等于即将发布的 `$NEXT_VERSION`。

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

### [High] `.github/copilot-instructions.md` 与现状严重脱节

**现象：** 该指南文件存在多处过期信息：
- 第 30 行：`仓库根目录同时存在 pnpm-lock.yaml 与 package-lock.json` —— **实际 `package-lock.json` 已不存在**（`ls` 与 `git log` 均确认）
- 第 43 行：`已验证：上述命令在当前工作区可通过（29 tests）` —— mcp 包加入后总测试数已远超 29
- 第 11 行：`核心代码集中在 packages/core` —— 现已加入 mcp 包，不再是单一核心

**证据：**
- `.github/copilot-instructions.md:30` — 提及不存在的 `package-lock.json`
- `.github/copilot-instructions.md:43` — `(29 tests)`
- `ls package-lock.json` → 不存在

**影响：** Copilot agent / 其他 AI 助手读取该文件后基于错误前提工作；新贡献者被误导。

**建议缓解：** 全文校对更新，或改为引用 `packages/*/README.md` 与 `.planning/codebase/` 下文档（单一事实源）。

### [Medium] 根 `README.md` logo 用绝对路径 `/public/logo.png`，GitHub 渲染失败

**现象：** `README.md:4` 是 `<img width="200" src="/public/logo.png" />`。GitHub 渲染 README 时，`/public/logo.png` 会被解析为 `https://github.com/Lionad-Morotar/port-key/public/logo.png`（仓库网页 URL，非 raw），返回 HTML 而非图片，img 标签加载失败。

**证据：**
- `README.md:4` — `<img width="200" src="/public/logo.png" />`
- `public/logo.png` 实际存在（`ls public/` 确认）

**影响：** GitHub 仓库首页与 npm 包页面 logo 显示为破图。

**建议缓解：** 改为相对路径 `./public/logo.png`（GitHub 会自动重写为 `raw` URL）。

### [Medium] i18n 覆盖不一致：core 2 种、mcp 10 种、skills 0 种

**现象：**
- `packages/core/locales/`：仅 `cn.json`、`en.json`
- `packages/mcp/locales/`：`ar/cn/de/es/fr/it/ja/ko/pt/ru` 共 10 种
- `packages/skills/`：无 i18n

**证据：** `ls packages/core/locales/ packages/mcp/locales/`

**影响：** 用户在 core CLI 用 `--lang fr` 会被拒（`cli.js:156` 只允许 `en|cn`），但 mcp 又支持法语，体验断裂。

**建议缓解：** 要么统一为 10 种（core 补齐），要么把 i18n 抽到独立 `@lionad/port-key-locales` 包共享。

### [Medium] ✅ 已解决：`docs/README.*.md` 多语言翻译曾依赖外部 `fabric` CLI 与 macOS-only `sed`

> **已解决（2026-07-14）：** `scripts/translate-readme.sh` 与 `scripts/pre-commit-hook.js` 已移除，README 翻译改由子代理手动同步，不再依赖 `fabric`/`sponge`/`sed`。以下为历史记录。

**现象：** `scripts/translate-readme.sh:60` 使用 `fabric -p translate | sponge` 生成翻译，`sed -i ''` 修改文件头。
- `fabric` 是外部 CLI（未在 package.json 声明依赖）
- `sponge` 来自 `moreutils`（macOS 需 `brew install moreutils`）
- `sed -i ''` 是 BSD sed 语法，Linux GNU sed 不兼容

**证据：**
- `scripts/translate-readme.sh:60` — `cat ./README.md | ... | fabric -p translate | sponge "./docs/README.$lang.md"`
- `scripts/translate-readme.sh:63` — `sed -i '' '1s/^/.../' "./docs/README.$lang.md"`

**影响：** 新贡献者（Linux 用户、未装 fabric 者）运行 `bash scripts/translate-readme.sh` 直接失败；CI 无法跑该脚本。

**建议缓解：** 文档化前置依赖；改用 Node 脚本（跨平台）；考虑用 LLM API 替代 `fabric` CLI。

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

### [High] `logger.ts` 配置疑似笔误：`maxSize: '1'`

**现象：** `packages/mcp/src/utils/logger.ts:39` 配置 combined 日志的 `maxSize: '1'`。winston-daily-rotate-file 的 `maxSize` 接受如 `'10m'`、`'1k'`、`'1g'` 或字节数；裸 `'1'` 会被某些版本解释为 1 字节（每次写入都触发轮转），另一些版本直接抛错。

**证据：**
- `packages/mcp/src/utils/logger.ts:39` — `maxSize: '1',`（combined transport）
- 对比同文件 line 31：`maxSize: '10m'`（error transport，配置正确）

**影响：**
- 若解释为 1 字节：日志疯狂轮转，瞬间生成大量带时间戳的文件，磁盘与 inode 耗尽
- 若抛错：logger 初始化失败，后续所有 `logger.info/error` 静默丢失

**建议缓解：** 改为 `maxSize: '10m'` 或 `'20m'`，与 error transport 对齐。

### [Medium] mcp 包 `logs/` 目录下残留 audit JSON 是测试副产物

**现象：** `packages/mcp/logs/` 下有 4 个 `.<hash>-audit.json` 与 `combined-2026-01-12.log`、`error-2026-01-12.log`。这些是测试运行时 winston 写入的副产物（logger 默认写到 `~/.port-key/logs/`，但测试可能改了路径或当前工作目录写入了 `packages/mcp/logs/`）。

**证据：**
- `packages/mcp/logs/.6b77785a74c362881f6fb7e95a7530280abbf9ed-audit.json` 等 4 个 audit 文件
- `git check-ignore packages/mcp/logs` 返回 `packages/mcp/logs`（即被 ignore，未入库）

**影响：** 不影响 git（已 ignore），但本地工作区会累积测试日志，混淆"哪些是真实运行日志"。

**建议缓解：** 在 `vitest.config.ts` 中将 logger 写入 `os.tmpdir()` 或在测试 setup 中 mock logger。

### [Medium] `session-manager.ts` 的 `setInterval` 让 Node 进程无法优雅退出

**现象：** `packages/mcp/src/utils/session-manager.ts:22` 在构造函数启动 `setInterval(() => this.cleanup(), 60000)`，`ref` 默认持有事件循环。只有显式调用 `destroy()` 才会 `clearInterval`。

**证据：**
- `packages/mcp/src/utils/session-manager.ts:22` — `this.cleanupInterval = setInterval(() => this.cleanup(), 60000);`
- `packages/mcp/src/utils/session-manager.ts:80-83` — `destroy()` 中 clearInterval

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

### 立即处理（Critical，影响发布正确性与测试有效性）

1. **修复 `packages/mcp/package.json:57`** — 把 `"@lionad/port-key": "^0.3.0"` 改为 `"workspace:*"`，否则发布版拉错 core
2. **修复 `packages/mcp/src/mcp-server.ts:289`** — 删除 `version: "0.1.5"` 硬编码，引用 `createServer` 中的同一来源
3. **修复 `packages/mcp/tests/mcp-cli.test.js:30`** — regex 与源码日志对齐，否则 mcp 测试一直是红的
4. **修复 `scripts/bump-version.sh:128`** — `--no-git-checks` 改为 `--no-verify`，否则发布脚本无法跑通

### 短期跟进（High，1-2 周内）

5. **修复 `packages/mcp/src/utils/logger.ts:39`** — `maxSize: '1'` 改为 `'10m'`
6. **修复 `README.md:4`** — logo 路径 `/public/logo.png` 改为 `./public/logo.png`
7. **更新 `.github/copilot-instructions.md`** — 移除 `package-lock.json` 引用、更新测试数描述
8. **清理 `packages/mcp/src/tools/get-port-occupancy.ts:17-23`** 的死代码分支
9. **清理 `packages/mcp/src/mcp-server.ts:273-299`** 的规划性注释
10. **补充 `packages/core/src/port-key.d.ts`** 的 `PickPortOptions` —— 加入 `paddingZero?: boolean` 与 `preferredRanges`（或删除死选项）
11. **引入 Biome + husky/lint-staged**，把代码风格固化下来

### 长期改进（Medium/Low，按迭代节奏推进）

12. 拆分 `mcp-server.ts` 为 `transports/http.ts` + `transports/stdio.ts`
13. 补 `runHttp` 单元测试（Fastify inject）
14. 统一 core / mcp 的 i18n 语言覆盖
15. ~~`translate-readme.sh` 重写为跨平台 Node 脚本~~ → 已改为**移除自动翻译机制**（2026-07-14）：脚本与 pre-commit 钩子一并删除，README 翻译改由子代理手动同步
16. 移除 `preferredRanges` 死代码或实现它
17. 加 GitHub Actions workflow 跑 `pnpm test` + `pnpm lint`
18. Windows 平台支持（lsof → netstat 切换）
19. `dotenv.config()` 从 config 模块移到 bin 入口
20. 旧路径 `~/.portkey/` 加 deprecation warning

---

*Concerns audit: 2026-07-13*
