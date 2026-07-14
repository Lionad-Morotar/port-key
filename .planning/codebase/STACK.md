# Technology Stack

**Analysis Date:** 2026-07-13

PortKey 是一个基于 QWERTY 键盘字母到数字映射的"项目名 → 端口号"命名策略 CLI 工具,采用 pnpm monorepo 结构,包含三个子包:`@lionad/port-key`(纯 JS ESM 核心 CLI)、`@lionad/port-key-mcp`(TypeScript MCP Server)、`@lionad/port-key-skills`(纯 markdown Agent skills)。

## Languages

**Primary:**

- JavaScript (ESM, ES2022+) — `packages/core` 全部源码与测试,`.js` 扩展,`'use strict'` 启用严格模式
- TypeScript 5.9.3 — `packages/mcp/src/**/*.ts`,严格模式 `strict: true`,目标 `esnext`

**Secondary:**

- Bash — `scripts/bump-version.sh`
- Markdown — `packages/skills/skills/smart-port-allocation/SKILL.md` 及 references、`docs/README.*.md`(10 种语言)
- JSON — i18n locales(`packages/core/locales/{cn,en}.json`、`packages/mcp/locales/*.json`)、配置(`tsconfig*.json`、`.cspell.json`)

## Runtime

**Environment:**

- Node.js `>=16`(根 `package.json` 无 `engines`,各子包 `package.json` 中均声明 `engines.node: ">=16"`)
- 本地验证环境:Node v22.22.1、pnpm 10.15.0(macOS Darwin 24.6.0 / Apple Silicon)
- 仅在 `packages/core/src/config.js` 与 `packages/mcp/src/utils/logger.ts` 中读取 `process.env`,无 Node 特定高版本 API 强依赖

**Package Manager:**

- pnpm 10.15.0(本地实测);`pnpm-workspace.yaml` 声明 workspace
- Lockfile:`pnpm-lock.yaml` 存在(lockfileVersion `9.0`),已无 `package-lock.json`(仓库历史曾共存,现已清理)
- `.npmrc`:仅一行 `registry=https://registry.npmjs.org/`,无 `auto-install-peers`、`node-linker` 等其他配置
- `onlyBuiltDependencies: [esbuild]` 白名单(见 `pnpm-workspace.yaml`),esbuild 是 vitest 间接依赖

## Frameworks

**Core:**

- 无 Web/服务端框架,`packages/core` 是纯算法库 + CLI(`process.argv` 手写解析,无 commander/yargs/meow)
- `packages/mcp` 使用 `@modelcontextprotocol/sdk` ^1.25.2(MCP server 协议实现)+ `fastify` ^5.6.2(HTTP transport)+ `@fastify/cors` ^11.2.0

**Testing:**

- Vitest `4.0.16`(根 `devDependencies` 无,各子包 `packages/{core,mcp}/package.json` 中精确锁定版本)
- 配置:根 `vitest.config.js` 设 `environment: 'node'`、`testTimeout: 15000`、`hookTimeout: 15000`;`packages/core/vitest.config.js` 仅设 `environment: 'node'`;`packages/mcp` 复用根 config

**Build/Dev:**

- `packages/core`:无构建(`build` script 为 `echo 'skip build steps in packages/core'`),直接发布 `src/`
- `packages/mcp`:`tsc -p tsconfig.build.json` 产出 `dist/`,另含 `scripts/build-locales.js`(从 `docs/README.*.md` 抽取设计理念段落生成 `locales/*.json`)
- `packages/skills`:无构建无测试(均 echo skip)

## Key Dependencies

**Critical(`packages/mcp/package.json` dependencies):**

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | `^1.25.2` | MCP 协议 SDK,提供 `McpServer`、`StdioServerTransport`、`StreamableHTTPServerTransport` |
| `@lionad/port-key` | `^0.3.0` | 引用核心映射算法;**注意**:此处使用 npm semver 而非 `workspace:` 协议,见 CONCERNS |
| `fastify` | `^5.6.2` | HTTP transport 的 Web 框架 |
| `@fastify/cors` | `^11.2.0` | CORS 中间件,`origin: true` 放开所有源 |
| `zod` | `^4.3.5` | tool inputSchema 校验 |
| `dotenv` | `^17.2.3` | 加载 `.env`,在 `src/config/index.ts` 顶部 `dotenv.config()` |
| `winston` | `^3.19.0` | 日志框架 |
| `winston-daily-rotate-file` | `^5.0.0` | 按日轮转日志文件 |

**devDependencies(`packages/mcp`):**

- `@cfworker/json-schema` ^4.1.1
- `@types/dotenv` ^8.2.3
- `@types/express` ^5.0.6(注意:mcp 实际用 fastify 而非 express,此为残留类型)
- `@types/node` ^24.10.7
- `vitest` 4.0.16

**根 `devDependencies`:**

- `typescript` ^5.9.3(根 `package.json`)

**`packages/core` dependencies:** 空(`"dependencies": {}`),devDeps 仅 `vitest`。

**Infrastructure(内置 Node 模块使用):**

- `node:fs` / `node:path` / `node:os` — `packages/core/src/config.js`、`src/i18n.js`
- `node:fs/promises` / `node:url` — `packages/mcp/scripts/build-locales.js`、`src/tools/get-design-philosophy.ts`、`src/resources/port-mapping-config.ts`
- `node:child_process` + `node:util.promisify` — `src/tools/check-port-availability.ts`、`src/tools/get-port-occupancy.ts`(执行 `lsof` 命令)
- `node:crypto.randomUUID` — `src/mcp-server.ts`(生成 sessionId)

## Configuration

**Environment Variables(读取处):**

`packages/core/src/config.js`(L8、L67):

- `PORTKEY_HOME`(优先级最高,用于测试隔离)
- `HOME`(fallback)

`packages/mcp/src/config/index.ts`:

- `LOG_LEVEL`(默认 `info`)
- `PORT`(HTTP 监听端口,默认 `10945`)
- `STREAMABLE`(`'true'` / `'1'` 启用 HTTP 模式)
- `SESSION_TTL`(默认 `3600` 秒)
- `SESSION_TIMEOUT`(默认 `300000` 毫秒)
- `ENABLE_DISK_CHECK` / `ENABLE_MEMORY_CHECK` / `ENABLE_SESSION_CHECK`(默认开启,设 `'false'` 关闭)
- `DISK_THRESHOLD`(默认 `1024`)、`MEMORY_THRESHOLD`(默认 `512`)

`packages/mcp/src/utils/logger.ts`:

- `NODE_ENV`(`'production'` 时禁用 console transport)

**Build Config:**

- `tsconfig.base.json`(根):`target: esnext`、`module/moduleResolution: Node16`、`strict: true`、`esModuleInterop: true`、`skipLibCheck: true`、`forceConsistentCasingInFileNames: true`
- `tsconfig.json`(根):`extends: ./tsconfig.base.json`、`include: ["packages/*/src"]`、`noEmit: true`(类型检查聚合,不产出)
- `packages/mcp/tsconfig.json`:`allowJs: true`、`resolveJsonModule: true`、`types: ["node"]`、`include: ["src/**/*", "tests/**/*"]`、`noEmit: true`
- `packages/mcp/tsconfig.build.json`:`declaration: true`、`sourceMap: true`、`rootDir: ./src`、`outDir: ./dist`、`include: ["src/**/*.ts"]`、排除 `tests`

**Lint/Format:**

- **无 ESLint/Prettier/Biome 配置**(全仓库无 `.eslintrc*`、`.prettierrc*`、`eslint.config.*`、`biome.json`)
- 拼写检查:`.cspell.json` 仅 `{"ignorePaths": ["docs/README.*.md"]}`(忽略自动生成的翻译),无自定义字典

**Spelling:**

- `.cspell.json` 仅声明忽略路径,未配置 `words` 或 `dictionaries`

## Platform Requirements

**Development:**

- macOS / Linux(`packages/mcp/src/tools/check-port-availability.ts`、`get-port-occupancy.ts` 调用 `lsof`,Windows 不兼容)
- `lsof` 必须在 PATH 中(local tools 才能正常工作)

**Production:**

- 三个 npm 公开包发布到 `https://registry.npmjs.org/`,见各包 `publishConfig.registry`
- `packages/core` 发布物:`src`、`bin`、`locales`、`README.md`、`LICENSE`(见 `files` 字段)
- `packages/mcp` 发布物:`dist`、`bin`、`locales`、`README.md`、`LICENSE`
- `packages/skills` 发布物:`skills`、`CHANGELOG.md`、`README.md`、`LICENSE`
- MCP Server 默认监听 `127.0.0.1:10945`(HTTP 模式),仅本机访问

## 版本快照

| 组件 | 版本 |
|------|------|
| `@lionad/port-key` | `0.5.0` |
| `@lionad/port-key-mcp` | `0.5.0` |
| `@lionad/port-key-skills` | `0.5.0` |
| Node.js(声明) | `>=16` |
| Node.js(本地实测) | `v22.22.1` |
| pnpm(本地实测) | `10.15.0` |
| pnpm lockfileVersion | `9.0` |
| Vitest | `4.0.16`(精确锁定,非 `^`) |
| TypeScript | `^5.9.3` |
| `@modelcontextprotocol/sdk` | `^1.25.2` |
| `fastify` | `^5.6.2` |
| `zod` | `^4.3.5` |

---

*Stack analysis: 2026-07-13*
