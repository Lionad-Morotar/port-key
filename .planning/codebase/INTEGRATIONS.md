# External Integrations

**Analysis Date:** 2026-07-13

PortKey 的外部集成可分为三个层面:(1) **npm 发布**(三个公开包,`publishConfig` 指向 npmjs.org);(2) **CLI/MCP 协议入口**(供用户与 Agent 调用);(3) **本地系统资源**(用户配置文件、日志文件、`lsof` 命令、locales)。无云服务依赖,无外部 API key。

## APIs & External Services

**MCP(Model Context Protocol):**

- 服务名:`PortKey`(见 `packages/mcp/src/mcp-server.ts:27`)
- 协议:JSON-RPC 2.0 over stdio 或 HTTP(StreamableHTTP)
- SDK:`@modelcontextprotocol/sdk` `^1.25.2`,使用 `McpServer`、`StdioServerTransport`、`StreamableHTTPServerTransport`、`ResourceTemplate`、`isInitializeRequest`
- 入口:`packages/mcp/bin/port-key-mcp.js` → `dist/mcp-cli.js` → `mcpServerApp.run(options)`
- 注册的 Tools(共 4 个,见 `packages/mcp/src/tools/index.ts`):

| Tool Name | 文件 | isLocal | 说明 |
|-----------|------|---------|------|
| `map-project-name-to-port` | `packages/mcp/src/tools/map-project-name-to-port.ts` | 否 | 核心映射,调 `@lionad/port-key` 的 `mapToPort` |
| `get-design-philosophy` | `packages/mcp/src/tools/get-design-philosophy.ts` | 否 | 读取 `locales/<lang>.json` 的 `designPhilosophy` |
| `check-port-availability` | `packages/mcp/src/tools/check-port-availability.ts` | 是 | 调 `lsof -i :<port>` 判断端口是否被占用 |
| `get-port-occupancy` | `packages/mcp/src/tools/get-port-occupancy.ts` | 是 | 调 `lsof -i -P -n` 列出本机所有监听进程 |

- 注册的 Resources(共 1 个,见 `packages/mcp/src/resources/index.ts`):

| Resource Name | URI | 文件 |
|---------------|-----|------|
| `config` | `config://port-mapping` | `packages/mcp/src/resources/port-mapping-config.ts`(返回 `DEFAULT_MAP` 与 `DEFAULT_BLOCKED_PORTS` 的 JSON) |

- HTTP endpoints(`packages/mcp/src/mcp-server.ts` 中 `runHttp`):
  - `POST /mcp` — 客户端到服务端消息,支持 `mcp-session-id` 头
  - `GET /mcp` — 服务端到客户端通知(SSE 流)
  - `DELETE /mcp` — 会话终止
  - `GET /health` — 健康检查(返回 `status`、`uptime`、`memory`、`sessions` 数)
- 安全:启用 `enableDnsRebindingProtection`,`allowedHosts` 限定 `127.0.0.1:<port>`、`localhost:<port>`、`[::1]:<port>`,仅监听 `127.0.0.1`
- 复用机制:`packages/mcp/src/mcp-cli.ts:58-70` 在启动前先 `fetch /health`,若已有实例在跑则直接 `process.exit(0)`

**CLI:**

- `packages/core/bin/port-key.js`(shebang `#!/usr/bin/env node`):
  - 入口:调 `import { runCli } from '../src/cli.js'`
  - 参数:`<project-name>` 位置参数,`--lang <cn|en>`、`-m/--map <object>`、`-d/--digits <4|5>`、`--padding-zero <true|false>`、`-h/--help`
  - 发布 bin 名:`port-key`(见 `packages/core/package.json` `bin` 字段)
- `packages/mcp/bin/port-key-mcp.js`(shebang `#!/usr/bin/env node`):
  - 入口:`import "../dist/mcp-cli.js"`
  - 参数:`-s/--streamable`、`-p/--port <number>`、`-l/--local [boolean]`、`--reuse [boolean]`、`-h/--help`
  - 发布 bin 名:`port-key-mcp`
  - 包形态:CLI-only,`package.json` 只声明 `bin`,不声明 `main`/`exports`/`types`(对齐官方 TS MCP server),`import "@lionad/port-key-mcp"` 会安全失败而非启动 server

## Data Storage

**Databases:**

- 无外部数据库依赖
- 内存存储:`packages/mcp/src/utils/session-manager.ts` 的 `SessionManager<T>` 用 `Map<string, SessionWrapper<T>>` 管理 HTTP 会话,默认 TTL 3600 秒(滑动窗口),每 60 秒清理一次过期会话

**File Storage:**

- 用户配置文件:`~/.port-key/config.json`(优先)或旧路径 `~/.portkey/config.json`(`packages/core/src/config.js:11-12`,新路径不存在时回退到旧路径)
- 用户日志文件:`~/.port-key/log.json`(记录 `{ "count": <number> }`,每次 CLI 运行 +1,见 `packages/core/src/config.js:74-123`)
- MCP 日志目录:`~/.port-key/logs/`(`packages/mcp/src/utils/logger.ts:8`),按日轮转:
  - `error-%DATE%.log`(仅 error 级,`maxSize: 10m`、保留 14 天)
  - `combined-%DATE%.log`(所有级别,`maxSize: 1`、保留 14 天,zip 归档)
- 路径覆盖:`PORTKEY_HOME` 或 `HOME` 环境变量优先(`packages/core/src/config.js:8`),测试中注入 `env: { HOME: <tmp> }` 实现隔离
- 无文件存储服务(无 S3、无 GCS、无 CDN)

**Caching:**

- 无显式缓存层
- `packages/core/src/i18n.js:7` 有模块级 `cache = {}` 用于 messages 缓存(进程内,无持久化)

## Authentication & Identity

**Auth Provider:**

- **无** — MCP Server 不做任何身份认证,依赖 `127.0.0.1` 仅本机绑定 + DNS rebinding 防护
- `packages/mcp/src/mcp-server.ts:113` `@fastify/cors` 设 `origin: true`(放开所有源,适用于本地开发场景)

## Monitoring & Observability

**Error Tracking:**

- 无 Sentry / Datadog / Bugsnag 等外部错误追踪
- 错误日志通过 `winston` 写入 `~/.port-key/logs/error-*.log`

**Logs:**

- 框架:`winston` ^3.19.0 + `winston-daily-rotate-file` ^5.0.0(`packages/mcp/src/utils/logger.ts`)
- 格式:`combine(timestamp, errors({ stack: true }), json())`
- 控制台输出:当 `NODE_ENV !== 'production'` 时附加 `Console` transport,colorize + printf 格式
- 动态级别:`logger.setLevel(level)` / `logger.getLevel()`(自定义扩展)
- CLI 自身输出:`process.stdout.write` / `process.stderr.write`(无框架,见 `packages/core/src/cli.js`)

## CI/CD & Deployment

**Hosting:**

- 无云托管,所有包发布到 npm registry(`https://registry.npmjs.org/`)
- 用户通过 `npx @lionad/port-key <name>` 或 `npx @lionad/port-key-mcp` 拉取

**CI Pipeline:**

- **无 CI/CD** — `.github/` 目录下仅有 `copilot-instructions.md`,**不存在 `.github/workflows/` 目录**
- 无 GitHub Actions、无 GitLab CI、无 CircleCI 配置
- 发布流程纯手工:根 `package.json` `release` 脚本 = `pnpm build && pnpm -r publish --access public --no-git-checks --registry=https://registry.npmjs.org/`
- 版本提升:`bash scripts/bump-version.sh [patch|minor|major]`,会:
  1. 检查所有 `packages/*/CHANGELOG.md` 是否已修改(`scripts/bump-version.sh:34-66`)
  2. `pnpm -r exec npm version` 提升版本
  3. 同步更新 `packages/mcp/src/mcp-server.ts:29` 中 `// ! AUTO GENERATED VERSION - DO NOT EDIT` 标记下一行的 `version` 字段
  4. `pnpm install` 刷新 lockfile
  5. `git commit -m "release: v<ver>" --no-verify` + `git tag v<ver>`

**prepublishOnly 钩子:**

- `packages/core`:`cp ../../README.md ./README.md`(把根 README 复制到包内以随包发布),对应 `postpublish: rm ./README.md` 清理
- `packages/mcp`:`pnpm run build`(跑 `build:locales` + `tsc -p tsconfig.build.json`)
- `packages/skills`:无 prepublishOnly

## Environment Configuration

**Required env vars:**

- **无强制要求** — 全部有默认值
- 可选覆盖(见 STACK.md Configuration 章节):`PORTKEY_HOME`、`HOME`、`PORT`、`STREAMABLE`、`LOG_LEVEL`、`SESSION_TTL`、`SESSION_TIMEOUT`、`ENABLE_DISK_CHECK`、`ENABLE_MEMORY_CHECK`、`ENABLE_SESSION_CHECK`、`DISK_THRESHOLD`、`MEMORY_THRESHOLD`、`NODE_ENV`

**Secrets location:**

- 无 secrets — 项目不持有任何 API key、token 或证书
- `dotenv` ^17.2.3 仅用于加载本地 `.env`(若存在),仓库根未提交 `.env` 文件(`.gitignore` 已排除 `*.local`)

## Webhooks & Callbacks

**Incoming:**

- 无外部 webhook
- MCP HTTP endpoints(`POST/GET/DELETE /mcp`、`GET /health`)仅供 MCP 客户端调用,非 webhook

**Outgoing:**

- 无 — 不会主动向外部服务回调或推送

## Cross-Package Internal Integrations

**Workspace 依赖关系:**

```
packages/core (@lionad/port-key)        ← 纯 JS ESM,无依赖
    ↑
    │ (npm 版本号引用,非 workspace: 协议)
    │
packages/mcp (@lionad/port-key-mcp)     ← "@lionad/port-key": "^0.3.0"
    │
    │ 文档抽取生成 locales
    ↓
docs/README.<lang>.md  →  scripts/build-locales.js  →  packages/mcp/locales/<lang>.json

packages/skills (@lionad/port-key-skills)  ← 纯 markdown,通过 npx 引用其他包
```

**潜在 concern(详见 CONCERNS):**

- `packages/mcp/package.json` 中 `"@lionad/port-key": "^0.3.0"` 使用 npm semver 而非 `workspace:^0.5.0` 协议,本地开发可能拉到 npm 上的旧版本(0.3.x)而非本地最新源码(0.5.0)

**i18n 集成:**

- `packages/core/locales/`:`cn.json`、`en.json`(2 种,用于 CLI 帮助文本)
- `packages/mcp/locales/`:`cn`、`es`、`fr`、`de`、`ja`、`ko`、`ru`、`ar`、`pt`、`it`(10 种,由 `scripts/build-locales.js` 从 `docs/README.<lang>.md` 抽取"## "首段生成 `designPhilosophy` 字段)
- `docs/`:`README.cn.md`、`README.es.md`、`README.fr.md`、`README.de.md`、`README.ja.md`、`README.ko.md`、`README.ru.md`、`README.ar.md`、`README.pt.md`、`README.it.md`(10 种语言,由子代理手动同步)

**pre-commit Hook:**

- 当前**无 pre-commit 钩子**(原 `README.md` 自动翻译钩子已于 2026-07-14 移除:其 `fabric`/`sponge`/`sed` 链路在翻译服务不可用时曾清空 `docs/README.*.md`)
- README 多语言翻译改由子代理手动同步根 `README.md`
- **无 `.husky/` 目录**,无 lint-staged,无 conventional-commit 校验

**GitHub 仓库集成:**

- 仓库:`Lionad-Morotar/port-key`(`https://github.com/Lionad-Morotar/port-key`)
- Issues:`https://github.com/Lionad-Morotar/port-key/issues`(所有 `package.json` 的 `bugs.url` 指向此处)
- 无 GitHub Pages、无 Releases 自动化

**Skills 包生态集成:**

- `packages/skills/skills/smart-port-allocation/`:包含 `SKILL.md` + `references/port-best-practices.md`、`references/port-key.md`
- 安装方式(README 声明):`npx -y skills add https://github.com/Lionad-Morotar/port-key/tree/main/packages/skills`
- 内容是引导 Agent 调用 `npx -y @lionad/port-key "<name>"` 与配置 `~/.port-key/config.json`

## 集成清单

| 集成项 | 类型 | 入口 | 备注 |
|--------|------|------|------|
| npm registry | 发布 | `pnpm -r publish --registry=https://registry.npmjs.org/` | 三个公开包 |
| MCP stdio | 协议 | `port-key-mcp` 默认模式 | `StdioServerTransport` |
| MCP HTTP | 协议 | `port-key-mcp -s` 或 `STREAMABLE=true` | Fastify on `127.0.0.1:10945` |
| `lsof` | 系统命令 | `check-port-availability`、`get-port-occupancy` tool | macOS/Linux only |
| `~/.port-key/config.json` | 用户文件 | `packages/core/src/config.js` | 兼容旧 `~/.portkey/` |
| `~/.port-key/log.json` | 用户文件 | `packages/core/src/config.js` | 运行计数 |
| `~/.port-key/logs/` | 用户文件 | `packages/mcp/src/utils/logger.ts` | winston daily rotate |
| `dotenv` | 配置 | `packages/mcp/src/config/index.ts` | `.env` 可选 |
| GitHub | 仓库 | `Lionad-Morotar/port-key` | 无 Actions |
| `skills` npx 工具 | 外部生态 | `npx skills add ...` | 第三方 skill installer |

---

*Integration audit: 2026-07-13*
