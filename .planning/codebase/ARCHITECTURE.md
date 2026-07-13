<!-- refreshed: 2026-07-13 -->
# Architecture

**Analysis Date:** 2026-07-13

## System Overview

PortKey 是一个"项目名 → 端口号"的键盘映射工具。整体采用 pnpm monorepo 的三层分包结构,严格遵循"核心无依赖、外围按需引入"的设计哲学。

```text
┌────────────────────────────────────────────────────────────────────┐
│                      消费层 (Consumer Layer)                         │
├──────────────────┬───────────────────────┬─────────────────────────┤
│   终端用户 CLI   │     AI Agent (MCP)    │   Skill-aware Agent     │
│  `bin/port-key`  │  MCP Client (stdio /  │  读取 SKILL.md +        │
│   直接调用       │  HTTP Streamable)     │  references/*.md        │
└────────┬─────────┴──────────┬────────────┴──────────┬──────────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌────────────────────────────────────────────────────────────────────┐
│                        接口层 (Interface)                           │
├────────────────────────────┬───────────────────────────────────────┤
│  packages/core/src/cli.js  │  packages/mcp/src/mcp-server.ts       │
│  依赖注入的 runCli(argv,    │  MCPServerApp 类,                     │
│  stdout, stderr, deps)     │  registerTools / registerResources    │
└────────┬───────────────────┴───────────────┬───────────────────────┘
         │                                   │
         ▼                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                     核心算法层 (Pure Core)                          │
│   packages/core/src/port-key.js (纯 JS ESM,无运行时依赖)            │
│   normalizeInput → buildReverseMap → mapToDigits                    │
│   → pickPortFromDigits → mapToPort                                  │
└────────┬───────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│  支持系统 (Supporting Subsystems)                                   │
│  ├── config.js   配置加载 + 路径回退 + 运行计数                     │
│  ├── i18n.js     多语言消息(模块级 cache)                          │
│  └── ~/.port-key/{config.json, log.json, logs/}  用户态持久化       │
└────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|------------|----------------|------|
| `port-key.js` | 纯函数算法管道:字母→数字映射、候选生成、端口筛选 | `packages/core/src/port-key.js` |
| `cli.js` | 参数解析、配置合并、i18n 加载、输出生成、退出码 | `packages/core/src/cli.js` |
| `config.js` | 配置文件路径解析(新/旧回退)、配置读写、运行计数日志 | `packages/core/src/config.js` |
| `i18n.js` | 多语言消息加载与语言回退,模块级缓存 | `packages/core/src/i18n.js` |
| `bin/port-key.js` | Node shebang 入口,转发到 `runCli` | `packages/core/bin/port-key.js` |
| `port-key.d.ts` | 给 TypeScript 消费者(core 自身是 JS)的类型声明 | `packages/core/src/port-key.d.ts` |
| `mcp-server.ts` | MCP Server 注册中心,支持 stdio / HTTP 两种传输 | `packages/mcp/src/mcp-server.ts` |
| `mcp-cli.ts` | MCP CLI 入口,解析参数并启动 server | `packages/mcp/src/mcp-cli.ts` |
| `tools/*.ts` | 每个工具一个文件,导出 `{ name, description, inputSchema, execute }` | `packages/mcp/src/tools/` |
| `resources/*.ts` | MCP resources,暴露配置/常量给 client | `packages/mcp/src/resources/` |
| `utils/logger.ts` | winston + daily rotate 文件日志 | `packages/mcp/src/utils/logger.ts` |
| `utils/session-manager.ts` | HTTP 会话管理(sliding-window TTL + 定时清理) | `packages/mcp/src/utils/session-manager.ts` |
| `SKILL.md` | Agent skill 入口(前置说明 + 触发条件 + 操作步骤) | `packages/skills/skills/smart-port-allocation/SKILL.md` |

## Pattern Overview

**Overall:** 三层分包 + 纯函数核心 + 依赖注入外围。

**Key Characteristics:**
- 核心算法零运行时依赖(`packages/core/package.json` 的 `dependencies: {}`),保证发布体积最小、npx 冷启动快。
- 所有副作用(I/O、env、fs、os)通过 `deps` 参数注入,`packages/core/src/cli.js`、`config.js`、`i18n.js` 均遵循此模式。
- MCP tools 与 resources 以扁平数组聚合(`tools/index.ts`、`resources/index.ts`),新增工具只改两个文件。
- 配置三级优先级:CLI 参数 > 用户配置文件 > 代码内默认值。

## Layers

### 核心算法层 (Pure Core)

- **Purpose:** 将任意输入文本确定性映射为一个合法端口号
- **Location:** `packages/core/src/port-key.js`
- **Contains:** 纯函数 + 两个 frozen 常量(`DEFAULT_MAP`、`DEFAULT_BLOCKED_PORTS`)
- **Depends on:** 仅 JavaScript 内置(`Object.freeze`、`Map`、`Set`、`Number`、`String`)
- **Used by:** `packages/core/src/cli.js`、`packages/mcp/src/tools/map-project-name-to-port.ts`、`packages/mcp/src/resources/port-mapping-config.ts`

### CLI 接口层

- **Purpose:** 解析 argv、合并配置、调度算法、按语言输出
- **Location:** `packages/core/src/cli.js`
- **Contains:** `formatHelp` / `parseArgv` / `runCli` 三个函数
- **Depends on:** `port-key.js`、`config.js`、`i18n.js`,均通过命名 import
- **Used by:** `packages/core/bin/port-key.js`

### 配置子系统

- **Purpose:** 解析用户 home 下的 JSON 配置,维护运行计数(用于首次运行引导)
- **Location:** `packages/core/src/config.js`
- **Contains:** 路径解析、同步读配置、字段级合并、运行计数读写
- **Depends on:** `node:path`、`node:fs`、`node:os`(可通过 `deps` 替换)
- **Used by:** `packages/core/src/cli.js`

### i18n 子系统

- **Purpose:** 加载 `locales/<lang>.json` 消息包,提供语言回退
- **Location:** `packages/core/src/i18n.js`
- **Contains:** `getLangOrDefault` / `loadMessages`,模块级 `let cache = {}`
- **Depends on:** `node:fs`、`node:path`
- **Used by:** `packages/core/src/cli.js`

### MCP 服务层

- **Purpose:** 把核心算法暴露为 MCP tools 与 resources,支持 stdio 和 HTTP 两种传输
- **Location:** `packages/mcp/src/`
- **Contains:** `MCPServerApp` 类 + 工具/资源聚合 + 日志 + 会话管理
- **Depends on:** `@modelcontextprotocol/sdk`、`fastify`、`@fastify/cors`、`winston`、`zod`、`dotenv`、以及 `@lionad/port-key`
- **Used by:** MCP client(stdio 调用、HTTP `/mcp` endpoint)

### Skill 文档层

- **Purpose:** 给 Skill-aware Agent(如 Claude Code)提供触发说明与操作步骤
- **Location:** `packages/skills/skills/smart-port-allocation/`
- **Contains:** `SKILL.md`(入口,含 frontmatter) + `references/*.md`(按需加载的领域知识)
- **Depends on:** 无代码,纯 markdown;运行时依赖 `npx @lionad/port-key`

## Data Flow

### Primary Request Path (CLI)

1. **入口** (`packages/core/bin/port-key.js:4`):`runCli(process.argv.slice(2))` 进入 CLI。
2. **加载配置** (`packages/core/src/cli.js:117`):`loadUserConfigSync(deps)` 返回 `{ path, config, configReadError, configExists }`。
3. **首次运行检测** (`packages/core/src/cli.js:118`):`loadRunCount(deps)` 读 `~/.port-key/log.json`。
4. **累加运行计数** (`packages/core/src/cli.js:133`):`incrementRunCount(deps)` 写回 log.json(无论后续是否失败,都会累加)。
5. **解析参数** (`packages/core/src/cli.js:137`):`parseArgv(argv)` 处理 `--`、`-h/--help`、`--lang`、`-m/--map`、`-d/--digits`、`--padding-zero`。
6. **合并配置** (`packages/core/src/cli.js:146`):`mergeConfig(config, parsed)` 字段级 `??` 合并。
7. **算法执行** (`packages/core/src/cli.js:171`):`mapToPort(input, map, options)` 返回 `{ digits, port, rejectedCandidates, reason }`。
8. **输出**:成功写入 stdout(`packages/core/src/cli.js:191`),失败/帮助/错误写入 stderr 并返回非零退出码。

### Primary Algorithm Pipeline

1. **规范化输入** (`packages/core/src/port-key.js:55`):`normalizeInput(text)` 小写化并过滤,仅保留 `[a-z0-9]`。
2. **构建反查 Map** (`packages/core/src/port-key.js:38`):`buildReverseMap(map)` 把 `{ 1: 'qaz' }` 翻转为 `{ q→1, a→1, z→1 }`。
3. **字母→数字** (`packages/core/src/port-key.js:63`):`mapToDigits` 逐字符查表;若输入中**有字母**,纯数字字符会被丢弃(避免字母与数字混输时的歧义);若输入**纯数字**,则透传。
4. **候选生成** (`packages/core/src/port-key.js:112`):
   - 长度 ≥ `preferDigitCount`:滑动窗口取所有 N-gram
   - 长度 < `preferDigitCount` 且 `padToPreferredDigits`:用 `'0'` 右补齐(`padEnd`)
   - 长度 ≥ 2:原串作为唯一候选
5. **候选筛选** (`packages/core/src/port-key.js:125`):依次校验前导零、`isValidPort`、`[minPort, maxPort]`、`isPortBlocked`(< 1024 永远 blocked);**第一个通过的候选即返回**。
6. **5 位回退** (`packages/core/src/port-key.js:146`):`preferDigitCount === 5` 且无候选时,递归调用 `pickPortFromDigits` 改用 `preferDigitCount: 4`。
7. **组合出口** (`packages/core/src/port-key.js:168`):`mapToPort` 把 digits 与 port 结果合并返回。

### MCP Request Path (HTTP)

1. **启动** (`packages/mcp/src/mcp-cli.ts:84`):`mcpServerApp.run(options)`。
2. **路由分流** (`packages/mcp/src/mcp-server.ts:301`):根据 `options.streamable` 走 `runHttp` 或 `runStdio`。
3. **HTTP 初始化** (`packages/mcp/src/mcp-server.ts:149`):POST `/mcp` 收到 `InitializeRequest` 时创建新 `StreamableHTTPServerTransport`,配置 DNS rebinding protection(`enableDnsRebindingProtection: true`,`allowedHosts` 限定为本机端口)。
4. **会话存储** (`packages/mcp/src/mcp-server.ts:158`):`onsessioninitialized` 把 transport 存入 `SessionManager`(sliding window TTL,默认 3600s,每分钟清理过期)。
5. **每会话独立 server** (`packages/mcp/src/mcp-server.ts:176`):`createServer()` 为每个 HTTP 会话生成新的 `McpServer` 实例,**保持状态隔离**。
6. **请求处理** (`packages/mcp/src/mcp-server.ts:191`):`transport.handleRequest(request.raw, reply.raw, request.body)` 转给 MCP SDK。
7. **关闭**:`SIGINT` / `SIGTERM` 触发 `sessionManager.destroy()` + `process.exit(0)`(`packages/mcp/src/mcp-server.ts:260`)。

**State Management:**
- CLI 无全局可变状态;所有副作用通过 `deps` 注入,运行结束后进程退出。
- MCP HTTP 模式用 `SessionManager`(`packages/mcp/src/utils/session-manager.ts`)管理 transport,基于内存 `Map<string, SessionWrapper<T>>`,进程重启即丢失。
- MCP stdio 模式无显式 session,因为 stdio 本身是单会话长连接。

## Key Abstractions

**DigitLetterMap:**
- Purpose: 数字 → 字母串的键盘映射表
- Examples: `packages/core/src/port-key.js:3`(`DEFAULT_MAP` 冻结)、`packages/core/src/port-key.d.ts:3`(`DigitLetterMap` 类型)
- Pattern: `Object.freeze` + `Record<DigitKey, string>` 双重保证不可变

**deps (Dependency Injection Object):**
- Purpose: 把 `fs` / `os` / `path` / `env` 从硬编码解耦,便于在 vitest 中传 `{ env: { HOME: tmpDir } }` 隔离用户真实配置
- Examples: `packages/core/src/config.js:21`、`packages/core/src/cli.js:116`
- Pattern: 函数签名末位 `deps = {}`,内部 `const fsModule = deps.fs || fs;` 兜底

**MCP Tool Descriptor:**
- Purpose: 统一描述一个 MCP 工具,被 `tools/index.ts` 聚合后批量注册
- Examples: `packages/mcp/src/tools/map-project-name-to-port.ts:4`、`packages/mcp/src/tools/check-port-availability.ts:7`
- Pattern: 对象字面量 `{ name, title, description, inputSchema, execute, isLocal? }`;`isLocal: true` 标记需要本地命令的工具,云端部署时被过滤

## Entry Points

**CLI Entry (`bin`):**
- Location: `packages/core/bin/port-key.js`
- Triggers: `npx @lionad/port-key ...` 或 `node packages/core/bin/port-key.js ...`
- Responsibilities: 调用 `runCli`,设置 `process.exitCode`,不抛异常到顶层

**MCP Entry (`bin`):**
- Location: `packages/mcp/bin/port-key-mcp.js`(`import "../dist/mcp-cli.js"`)
- Triggers: `npx @lionad/port-key-mcp ...` 或 MCP client 配置
- Responsibilities: 从 dist(已编译 JS)加载 `mcp-cli.ts` 的等价 ESM

**MCP Programmatic Entry:**
- Location: `packages/mcp/src/mcp-server.ts:310`(`export const mcpServerApp`)
- Triggers: 测试或其他 TS 消费者 import
- Responsibilities: 单例模式暴露 `MCPServerApp` 实例

## Architectural Constraints

- **Threading:** 全链路单线程 Node.js 事件循环;MCP 的 `check-port-availability.ts` 与 `get-port-occupancy.ts` 用 `child_process.exec` + `util.promisify` 调用 `lsof`,不使用 worker threads。
- **Global state:**
  - `packages/core/src/i18n.js:7` 的模块级 `let cache = {}`(进程内消息缓存,跨调用复用)
  - `packages/mcp/src/mcp-server.ts:16` 的 `const sessionManager`(单例 session 池)
  - `packages/mcp/src/mcp-server.ts:310` 的 `export const mcpServerApp`(单例 server app,测试隔离性较差)
- **Circular imports:** 未检测到。core 子系统内 `cli.js` 单向依赖 `port-key.js / config.js / i18n.js`;mcp 子系统内 `mcp-cli.ts → mcp-server.ts → tools/resources → @lionad/port-key` 是单向无环的。
- **跨包版本协议(关键约束):** `packages/mcp/package.json:57` 声明 `"@lionad/port-key": "^0.3.0"` 而非 `workspace:*`。本地开发时 pnpm 会从 npm registry 解析而非链接本地 core,**core 的改动不会立即被 mcp 测试感知**,需 `pnpm publish` 或手动 `pnpm link` 才能联动(详见 CONCERNS 记录)。
- **纯 JS 核心 + TS 外围:** core 刻意保持纯 JS 以最小化发布体积与依赖,仅提供 `port-key.d.ts` 作为可选类型声明;所有 TS 消费者必须用 `import { ... } from "@lionad/port-key"` 并依赖该 d.ts。
- **版本号统一来源:** `packages/mcp/src/version.ts` 导出 `VERSION` 常量，所有 `new McpServer()` 位置统一引用（2026-07-13 重构，`bump-version.sh` 已移除，发版改用 `/release-project`）。

## Anti-Patterns

### run() 中重建 McpServer 时硬编码旧版本号

**What happens:** `packages/mcp/src/mcp-server.ts:289` 在 `isLocal === false` 分支里重新 `new McpServer({ name: "PortKey", version: "0.1.5" })`,版本号是硬编码字面量。
**Why it's wrong:** 与 `createServer()` 中的 `version: "0.5.0"`(由 `bump-version.sh` 维护)不一致,云端部署模式下注册的 server 版本会永久滞后在 0.1.5。注释 `// Should match what was in createServer` 说明已知问题但未修复。
**Do this instead:** 在 `createServer()` 增加可选参数 `createServer(options?: { isLocal?: boolean })`,在构造期就根据 options 注册正确的工具集,消除 run() 中的二次重建;版本号从一个共享常量(`packages/mcp/src/version.ts`)导入,bump 脚本同步更新该常量。

### MCP 单例导出污染测试隔离

**What happens:** `packages/mcp/src/mcp-server.ts:310` `export const mcpServerApp = new MCPServerApp()` 在模块加载时就实例化。
**Why it's wrong:** vitest 测试用例共享同一个 `mcpServerApp`(`packages/mcp/tests/mcp-server.test.ts:46` 直接 `mcpServerApp.getMcpServer()`),如果一个测试修改了 server 状态(如手动注册 tool),后续测试会受影响。
**Do this instead:** 导出 `MCPServerApp` 类作为主 API,测试中 `new MCPServerApp()` 创建独立实例;保留单例仅为 CLI 入口的便捷引用。

### 根 index.js 指向不存在的路径

**What happens:** `/Users/lionad/Github/Lionad-Morotar/port-key/index.js:3` 是 `module.exports = require('./src/portkey')`,但 `./src/portkey` 在当前 monorepo 结构下不存在,且根包是 `"type": "module"` 却用了 CommonJS 的 `require`。
**Why it's wrong:** 任何人 `import "port-key-workspace"` 或 `node index.js` 都会报错,是历史重构遗留。
**Do this instead:** 删除该文件,或改为 re-export core(如 `export * from './packages/core/src/port-key.js'`)。

### Logger 硬编码日志路径,未走 deps 注入

**What happens:** `packages/mcp/src/utils/logger.ts:8` `const LOG_DIR = join(homedir(), '.port-key', 'logs')` 在模块加载时确定路径,不可测试替换。
**Why it's wrong:** 与 core 包 `config.js` 通过 `deps.env.PORTKEY_HOME` 优先解析的设计不一致;无法在测试中重定向日志输出到 tmp 目录。
**Do this instead:** 参考 `packages/core/src/config.js` 的 `getPortKeyDirPath(deps)` 模式,把 logger 改为工厂函数 `createLogger(deps?)`,在 `mcp-server.ts` 中按需实例化。

## Error Handling

**Strategy:** "捕获即降级,显式退出码"。

**Patterns:**
- **算法层不抛异常**:`pickPortFromDigits` 在无有效候选时返回 `{ port: null, reason, rejectedCandidates }`(`packages/core/src/port-key.js:161`),由调用方决定如何呈现。
- **CLI 层 try/catch 包裹参数解析**:`parseArgv` 抛出的 `Error` 在 `runCli` 中被捕获,写入 stderr 并打印 help(`packages/core/src/cli.js:138-144`)。
- **CLI 退出码语义**:成功 `0`,任何用户错误/校验失败 `1`。
- **配置读取失败不阻断**:`loadUserConfigSync` 在 JSON 解析失败时返回 `configReadError: true`,CLI 仅打印一条 info 提示后继续用默认配置(`packages/core/src/cli.js:120-124`)。
- **MCP 工具执行失败返回 `isError: true`**:所有 `tools/*.ts` 的 `execute` 函数在 catch 中返回 `{ content: [{ type: "text", text: ... }], isError: true }`,不抛异常给 MCP 框架(`packages/mcp/src/tools/map-project-name-to-port.ts:37-49` 等)。
- **MCP HTTP 端口占用重用**:`runHttp` 捕获 `EADDRINUSE` 后探测 `/health`,若确认是自身实例则静默退出而非报错(`packages/mcp/src/mcp-server.ts:236-251`)。

## Cross-Cutting Concerns

**Logging:**
- core CLI:无 logger,直接写 `stdout` / `stderr`。
- MCP:winston + `winston-daily-rotate-file`,JSON 格式 + 时间戳,按日志级别分文件(error / combined),每个文件 maxSize 10m / maxFiles 14d,自动 zip 归档。开发环境额外加 colorize console transport(`packages/mcp/src/utils/logger.ts`)。
- 日志落盘位置:`~/.port-key/logs/`(注意:仓库内 `packages/mcp/logs/` 也存在历史日志文件,但运行时实际写入用户 home)。

**Validation:**
- 算法层:`isPlainObject` / 正则 `/^[0-9]$/` / `ch >= 'a' && ch <= 'z'` 等内置校验,不引入 zod 等 schema 库。
- CLI:`parseArgv` 对 `-d/--digits` 限制为 `4 | 5`,对 `--padding-zero` 限制为 `true | false | 空值`。
- MCP:用 zod 4.x 定义 `inputSchema`,SDK 自动验证 client 输入(`packages/mcp/src/tools/*.ts`)。

**Authentication:**
- 无认证。MCP HTTP 模式绑定 `127.0.0.1`,仅本机访问;配合 DNS rebinding protection 的 `allowedHosts` 白名单(本机端口)防止跨域攻击。生产环境若需暴露,需自行加反向代理鉴权。

**i18n:**
- core:`packages/core/src/i18n.js` 支持 `cn` / `en`,默认 `cn`;`loadMessages` 通过 `import.meta.url` 解析 locales 路径,有模块级 `cache`。
- MCP:扩展到 10 种语言(`cn / es / fr / de / ja / ko / ru / ar / pt / it`),通过 `scripts/build-locales.js` 从 `docs/README.<lang>.md` 提取"## Brief"段落生成 `locales/<lang>.json`(`packages/mcp/scripts/build-locales.js`)。
- 不一致点:core 的 `cn / en` 与 mcp 的 10 语言集合**不重合**(`en` 在 mcp 中反而缺失)。

## 发布流 (Release Pipeline)

**版本号统一:** 所有子包当前共享同一版本号(如 `0.5.0`),由 `scripts/bump-version.sh` 维护。

**bump 流程** (`scripts/bump-version.sh`):
1. 校验所有 `packages/*/CHANGELOG.md` 已被 git 跟踪修改(未更新则 fail-fast)。
2. `pnpm -r exec npm version <patch|minor|major> --no-git-tag-version` 批量改 package.json。
3. Node 脚本读取 `packages/mcp/src/mcp-server.ts` 中的 `// ! AUTO GENERATED VERSION - DO NOT EDIT` 标记,替换下一行的 `version: "..."`。
4. `pnpm install` 刷新 lockfile。
5. `git add . && git commit -m "release: v<NEW>" --no-verify && git tag "v<NEW>"`。

**publish 流程** (`package.json:14` 根脚本 `release`):
1. `pnpm build`:触发所有子包的 build(core 跳过,mcp 执行 `build:locales + tsc -p tsconfig.build.json`,skills 跳过)。
2. `pnpm -r publish --access public --no-git-checks --registry=https://registry.npmjs.org/`。
3. core 的 `prepublishOnly` 钩子把根 `README.md` 复制到子包,`postpublish` 删除(`packages/core/package.json:37-38`)。
4. mcp 的 `prepublishOnly` 钩子跑 `pnpm run build`(`packages/mcp/package.json:35`)。

**files 白名单(发布体积控制):**
- core: `["src", "bin", "locales", "README.md", "LICENSE"]`
- mcp: `["dist", "bin", "locales", "README.md", "LICENSE"]`
- skills: `["skills", "CHANGELOG.md", "README.md", "LICENSE"]`

## 架构决策与权衡

**为什么 core 用纯 JS 而非 TS?**
- 决策:核心算法(`port-key.js`)刻意保持纯 JS ESM,仅用 `port-key.d.ts` 提供外部类型。
- 权衡:换取零运行时依赖、零构建步骤、最小发布体积(npx 冷启动关键);代价是 core 内部无静态类型检查,需要测试覆盖补偿(已用 vitest 覆盖算法路径)。
- 适用前提:算法稳定、函数边界清晰、输入域受限(端口范围 0-65535)。

**为什么 deps 注入?**
- 决策:所有涉及 `fs / os / path / env` 的函数接受 `deps` 参数。
- 权衡:测试中传 `{ env: { HOME: tmpDir } }` 即可隔离真实用户配置(已在 `packages/core/test/cli.test.js` 中使用);代价是函数签名略长,内部需要 `deps.fs || fs` 兜底。

**为什么 MCP HTTP 模式为每个会话重建 server?**
- 决策:`packages/mcp/src/mcp-server.ts:176` 中每个新 `InitializeRequest` 都 `this.createServer()` 并 connect 到新 transport。
- 权衡:换取会话间完全状态隔离(不同 client 看到的 tool 列表可以不同,如本地 vs 云端);代价是 server 实例的内存开销随会话数线性增长,被 `SessionManager` 的 TTL + 定时清理限制。

**为什么 MCP tools 用扁平数组而非装饰器/注解?**
- 决策:每个工具导出对象字面量,`tools/index.ts` 手写 import + 数组。
- 权衡:不依赖 reflect-metadata 等运行时反射,最低 TS 编译复杂度;代价是新增工具必须改 `tools/index.ts`,但仅一行 import + 一项数组元素,成本低。

---

*Architecture analysis: 2026-07-13*
