# Codebase Structure

**Analysis Date:** 2026-07-13

## Directory Layout

```
port-key/                          # 仓库根(port-key-workspace)
├── packages/                      # pnpm monorepo 子包
│   ├── core/                      # @lionad/port-key 核心包(纯 JS ESM)
│   ├── mcp/                       # @lionad/port-key-mcp MCP Server(TS)
│   └── skills/                    # @lionad/port-key-skills Agent skills
├── docs/                          # README 的 10 种语言翻译(自动生成)
├── scripts/                       # 版本管理 + pre-commit + 翻译脚本
├── public/                        # 静态资源(logo.png)
├── .github/                       # copilot-instructions.md
├── .vscode/                       # 编辑器配置 + code-counter 缓存
├── .planning/                     # GSD 规划输出(本文件所在)
├── AGENT.md                       # 开发代理(LLM)指南
├── README.md                      # 产品说明(CLI 用法 + 配置示例)
├── LICENSE                        # ISC
├── index.js                       # ⚠ 死代码(指向不存在的 ./src/portkey)
├── package.json                   # workspace 根配置
├── pnpm-workspace.yaml            # workspace 声明(packages/*)
├── pnpm-lock.yaml                 # pnpm 锁文件(73KB)
├── tsconfig.base.json             # 共享 TS 基础配置
├── tsconfig.json                  # 根 TS 配置(引用 base,noEmit)
├── vitest.config.js               # 根级 vitest 配置(15s 超时)
├── .npmrc                         # registry 指向 npmjs.org
├── .gitignore                     # node_modules / dist / logs 等
└── .cspell.json                   # 拼写检查白名单
```

## Directory Purposes

**`packages/core/`:**
- Purpose: 核心算法 + CLI,零运行时依赖
- Contains: 纯 JS 源码 + d.ts + 测试 + locales + CLI bin
- Key files: `src/port-key.js`、`src/cli.js`、`src/config.js`、`src/i18n.js`、`bin/port-key.js`

**`packages/mcp/`:**
- Purpose: MCP Server 实现,封装核心算法为 tools/resources
- Contains: TypeScript 源码 + dist 构建产物 + locales + 测试 + 日志
- Key files: `src/mcp-server.ts`、`src/mcp-cli.ts`、`src/tools/*.ts`、`src/resources/*.ts`

**`packages/skills/`:**
- Purpose: 纯 markdown 形式的 Agent skills,供 Skill-aware 客户端消费
- Contains: 一个 skill 目录(`smart-port-allocation`),含 SKILL.md 与 references
- Key files: `skills/smart-port-allocation/SKILL.md`

**`docs/`:**
- Purpose: README 的多语言翻译(由 pre-commit hook 自动生成)
- Contains: 10 个 `README.<lang>.md`(cn / es / fr / de / ja / ko / ru / ar / pt / it;英文直接用根 README.md)
- Generated: 是(由 `scripts/translate-readme.sh` + `scripts/pre-commit-hook.js`)
- Committed: 是

**`scripts/`:**
- Purpose: 仓库级自动化(版本管理 + 翻译 + git hook)
- Contains: `bump-version.sh`、`translate-readme.sh`、`pre-commit-hook.js`

**`public/`:**
- Purpose: 静态资源
- Contains: `logo.png`、`.DS_Store`(误入库)

**`.github/`:**
- Purpose: GitHub/Copilot 配置
- Contains: `copilot-instructions.md`(给 GitHub Copilot 的项目指南)

**`.vscode/`:**
- Purpose: 编辑器配置
- Contains: `settings.json`、`code-counter/code-counter.db`(代码统计缓存)

**`.planning/`:**
- Purpose: GSD 工作流规划产物(本次 codebase map 输出位置)
- Generated: 是(由 `/gsd:map-codebase` 触发)

## Key File Locations

**Entry Points:**
- `packages/core/bin/port-key.js`:CLI shebang 入口,调用 `runCli`
- `packages/mcp/bin/port-key-mcp.js`:MCP 入口,从 dist 加载已编译的 mcp-cli(CLI-only,package.json 无 `main`/`exports`,不可 import)
- `packages/skills/skills/smart-port-allocation/SKILL.md`:Skill 入口(frontmatter 触发)

**Configuration:**
- `pnpm-workspace.yaml`:workspace 声明(`packages/*`)+ `onlyBuiltDependencies`(esbuild)
- `tsconfig.base.json`:共享 TS 配置(esnext + Node16)
- `tsconfig.json`:根配置,noEmit,include `packages/*/src`
- `packages/core/package.json`:core 包声明,`type: module`,`files` 白名单
- `packages/mcp/package.json`:mcp 包声明,`dependencies` 含 fastify/winston/zod
- `packages/mcp/tsconfig.build.json`:mcp 编译配置(declaration + sourceMap)
- `packages/mcp/tsconfig.json`:mcp IDE/类型检查配置(noEmit)
- `packages/core/vitest.config.js`:core 测试(node 环境,无超时配置)
- `vitest.config.js`:根级测试(15s 超时)
- `.npmrc`:registry 指向 npmjs.org

**Core Logic:**
- `packages/core/src/port-key.js`:算法管道(纯函数)
- `packages/core/src/cli.js`:CLI 调度层
- `packages/core/src/config.js`:配置加载 + 路径解析 + 运行计数
- `packages/core/src/i18n.js`:多语言消息加载
- `packages/core/src/port-key.d.ts`:TypeScript 类型声明

**MCP Logic:**
- `packages/mcp/src/mcp-server.ts`:`MCPServerApp` 类,server 注册中心
- `packages/mcp/src/mcp-cli.ts`:CLI 入口,参数解析 + 端口检测 + 启动
- `packages/mcp/src/tools/index.ts`:工具聚合(数组)
- `packages/mcp/src/resources/index.ts`:资源聚合(数组)
- `packages/mcp/src/config/index.ts`:配置加载(dotenv + env)

**Testing:**
- `packages/core/test/port-key.test.js`:算法测试
- `packages/core/test/blocked-ports.test.js`:blocked 列表测试
- `packages/core/test/cli.test.js`:CLI 行为测试(含 deps 注入)
- `packages/core/test/i18n.test.js`:i18n 测试
- `packages/core/test/user-config.test.js`:配置加载测试
- `packages/mcp/tests/mcp-server.test.ts`:MCP server 行为测试
- `packages/mcp/tests/mcp-cli.test.js`:MCP CLI 测试
- `packages/mcp/tests/e2e/mcp-cli.e2e.test.ts`:E2E 测试
- `packages/mcp/tests/tools/*.test.ts`:每个工具的单元测试
- `packages/mcp/tests/resources/*.test.ts`:资源测试
- `packages/mcp/tests/utils/*.test.ts`:logger / session-manager 测试

**Build Output:**
- `packages/mcp/dist/`:已编译 JS + d.ts + source map + 资源目录(`config/`、`tools/`、`resources/`、`utils/`)
- `packages/mcp/logs/`:历史日志文件(运行时实际写入 `~/.port-key/logs/`)

## Naming Conventions

**Files:**
- kebab-case:所有 `.js` / `.ts` / `.json` 文件名(如 `port-key.js`、`mcp-server.ts`、`session-manager.ts`、`map-project-name-to-port.ts`)
- 测试文件:`<source-name>.test.js` 或 `<source-name>.test.ts`,与源文件同名(如 `port-key.js` ↔ `port-key.test.js`)
- E2E 测试:`<scope>.e2e.test.ts`(如 `mcp-cli.e2e.test.ts`)
- TypeScript 声明:`<source>.d.ts`(如 `port-key.d.ts`)
- locales:`<lang>.json`(如 `cn.json`、`en.json`)
- 翻译 README:`README.<lang>.md`(如 `README.cn.md`)

**Directories:**
- 复数名词:工具目录 `tools/`、资源目录 `resources/`、工具/资源索引目录的 `utils/`
- 单数职能:`config/`(配置加载)、`bin/`(CLI 入口)、`locales/`(语言包)
- 测试目录:core 用 `test/`(单数),mcp 用 `tests/`(复数)—— 注意两包不一致

**Exports:**
- core 的 `port-key.js`:具名导出 `DEFAULT_MAP` / `DEFAULT_BLOCKED_PORTS` / `mapToPort` / `parseUserMap` 等(`packages/core/src/port-key.js:215`)
- core 的 `cli.js`:具名导出 `formatHelp` / `parseArgv` / `runCli`(`packages/core/src/cli.js:195`)
- mcp 的工具/资源:每个文件导出一个 `<name>Tool` 或 `<name>Resource` 常量,`tools/index.ts` / `resources/index.ts` 聚合为数组

**Identifiers:**
- 常量:`UPPER_SNAKE_CASE`(如 `DEFAULT_MAP`、`DEFAULT_BLOCKED_PORTS`、`SUPPORTED_LANGUAGES`)
- 函数:`camelCase`(如 `mapToPort`、`pickPortFromDigits`、`loadUserConfigSync`)
- 类:`PascalCase`(如 `MCPServerApp`、`SessionManager`)
- 工具 name 字符串:`kebab-case`(如 `"map-project-name-to-port"`、`"check-port-availability"`)

## Where to Add New Code

**New Core Algorithm Function:**
- 实现:`packages/core/src/port-key.js` 内新增函数并在末尾 `export` 中声明
- 类型:`packages/core/src/port-key.d.ts` 同步签名
- 测试:`packages/core/test/port-key.test.js` 追加 `describe` 块

**New CLI Flag:**
- 解析:`packages/core/src/cli.js` 的 `parseArgv` 中新增分支
- 合并:`packages/core/src/cli.js` 的 `mergeConfig` 调用与 `packages/core/src/config.js:44` 的 `mergeConfig` 实现中同步字段
- 帮助:`packages/core/src/cli.js` 的 `formatHelp` 与 `packages/core/locales/{cn,en}.json` 同步文案
- 测试:`packages/core/test/cli.test.js`

**New MCP Tool:**
- 实现:`packages/mcp/src/tools/<tool-name>.ts`,导出 `{ name, title, description, inputSchema, execute, isLocal? }`
- 注册:`packages/mcp/src/tools/index.ts` 追加 import + 数组项
- 测试:`packages/mcp/tests/tools/<tool-name>.test.ts`
- 本地工具(依赖系统命令如 lsof):务必加 `isLocal: true`,云端部署自动过滤

**New MCP Resource:**
- 实现:`packages/mcp/src/resources/<resource-name>.ts`,导出 `{ name, resourceUri, title, description, mimeType, execute }`
- 注册:`packages/mcp/src/resources/index.ts` 追加 import + 数组项
- 测试:`packages/mcp/tests/resources/<resource-name>.test.ts`

**New Locale (MCP):**
- 文档源:`docs/README.<lang>.md`(手写或翻译)
- 生成:`packages/mcp/scripts/build-locales.js` 的 `LANGUAGES` 数组追加语言码后跑 `pnpm run build:locales`
- 产物:`packages/mcp/locales/<lang>.json`

**New Shared Utility (MCP):**
- 实现:`packages/mcp/src/utils/<util-name>.ts`
- 默认导出单例或导出工厂函数(参考 `logger.ts` vs `session-manager.ts`)

**New Skill:**
- 入口:`packages/skills/skills/<skill-name>/SKILL.md`(含 frontmatter `name` 与 `description`)
- 引用:`packages/skills/skills/<skill-name>/references/<topic>.md`(按需加载的领域知识)
- 描述:`packages/skills/README.md` 列出所有 skill 索引

**New Shared Type (cross-package):**
- 当前无共享 types 包;mcp 内部类型定义在各 `.ts` 文件顶部或内联
- 跨包共享类型目前通过 `packages/core/src/port-key.d.ts` 导出

## Special Directories

**`packages/mcp/dist/`:**
- Purpose: TypeScript 编译产物(由 `tsc -p tsconfig.build.json` 生成)
- Generated: 是
- Committed: 否(`.gitignore` 含 `dist`)
- 入口:`bin/port-key-mcp.js` 通过 `import "../dist/mcp-cli.js"` 加载

**`packages/mcp/logs/`:**
- Purpose: 历史 winston 日志(运行时已改写入 `~/.port-key/logs/`)
- Generated: 是(旧版本运行时产物)
- Committed: 否(`.gitignore` 含 `logs/`)
- 注意:实际运行时日志目录是 `~/.port-key/logs/`(见 `packages/mcp/src/utils/logger.ts:8`)

**`packages/skills/skills/smart-port-allocation/references/`:**
- Purpose: Skill 的按需加载领域知识(Skill-aware Agent 在 SKILL.md 指引下读取)
- Contains: `port-key.md`(工具参数说明)、`port-best-practices.md`(端口分配最佳实践)
- Generated: 否
- Committed: 是

**`docs/`:**
- Purpose: README 多语言翻译,由 pre-commit hook 自动维护
- Generated: 是(由 `scripts/pre-commit-hook.js` + `scripts/translate-readme.sh`)
- Committed: 是
- 触发:git commit 暂存区包含 `README.md` 时,hook 自动跑翻译并把 `docs/README.*.md` 加入暂存区

**`.planning/codebase/`:**
- Purpose: GSD 工作流的 codebase map 输出(本文档系列)
- Generated: 是(由 `/gsd:map-codebase` 触发)
- Committed: 通常不入库(由项目 `.gitignore` 或全局 ignore 决定)

**`.vscode/code-counter/`:**
- Purpose: VS Code code-counter 扩展的缓存数据库
- Generated: 是
- Committed: 否(应加入 ignore)

## packages/core 详细结构

```
packages/core/
├── bin/
│   └── port-key.js              # CLI shebang 入口,5 行
├── src/
│   ├── port-key.js              # 核心算法(226 行),导出 DEFAULT_MAP 等
│   ├── port-key.d.ts            # 外部 TypeScript 类型声明
│   ├── cli.js                   # CLI 调度(formatHelp / parseArgv / runCli)
│   ├── config.js                # 配置加载 + 路径回退 + 运行计数
│   └── i18n.js                  # 多语言消息加载(模块级 cache)
├── test/
│   ├── port-key.test.js         # 算法单元测试
│   ├── blocked-ports.test.js    # blocked 端口行为
│   ├── cli.test.js              # CLI 行为(deps 注入隔离 HOME)
│   ├── i18n.test.js             # i18n 测试
│   └── user-config.test.js      # 配置加载测试
├── locales/
│   ├── cn.json                  # 中文消息包
│   └── en.json                  # 英文消息包
├── vitest.config.js             # node 环境,无超时配置
├── package.json                 # type: module, dependencies: {}
├── CHANGELOG.md                 # 版本变更记录
├── LICENSE                      # ISC
└── (README.md)                  # prepublishOnly 时从根复制,postpublish 删除
```

## packages/mcp 详细结构

```
packages/mcp/
├── bin/
│   └── port-key-mcp.js          # 3 行:import "../dist/mcp-cli.js"
├── src/
│   ├── mcp-cli.ts               # CLI 入口:参数解析 + 端口检测 + 启动
│   ├── mcp-server.ts            # MCPServerApp 类,registerTools/registerResources
│   ├── config/
│   │   └── index.ts             # 配置加载(dotenv + env,默认端口 10945)
│   ├── tools/
│   │   ├── index.ts             # 工具聚合数组
│   │   ├── map-project-name-to-port.ts    # 通用,调 core mapToPort
│   │   ├── get-design-philosophy.ts       # 通用,读 locales/<lang>.json
│   │   ├── check-port-availability.ts     # isLocal,调 lsof
│   │   └── get-port-occupancy.ts          # isLocal,调 lsof
│   ├── resources/
│   │   ├── index.ts             # 资源聚合数组
│   │   └── port-mapping-config.ts         # 暴露 DEFAULT_MAP + DEFAULT_BLOCKED_PORTS
│   └── utils/
│       ├── logger.ts            # winston + daily rotate
│       └── session-manager.ts   # HTTP 会话管理(Map + sliding TTL)
├── tests/
│   ├── mcp-server.test.ts       # 用 InMemoryTransport + Client 测 server
│   ├── mcp-cli.test.js          # CLI 行为
│   ├── e2e/
│   │   └── mcp-cli.e2e.test.ts  # 端到端
│   ├── tools/
│   │   ├── check-port-availability.test.ts
│   │   └── get-port-occupancy.test.ts
│   ├── resources/
│   │   └── port-mapping-config.test.ts
│   └── utils/
│       ├── logger.test.ts
│       └── session-manager.test.ts
├── scripts/
│   └── build-locales.js         # 从 docs/README.*.md 提取 designPhilosophy
├── locales/                     # 10 种语言,由 build-locales 生成
│   ├── cn.json / es.json / fr.json / de.json
│   ├── ja.json / ko.json / ru.json
│   └── ar.json / pt.json / it.json
├── dist/                        # tsc 编译产物(已 ignore)
├── logs/                        # 历史日志(已 ignore,实际写入 ~/.port-key/logs/)
├── tsconfig.json                # IDE / 类型检查(noEmit)
├── tsconfig.build.json          # 构建配置(declaration + sourceMap)
├── package.json                 # bin / files / dependencies
├── README.md                    # MCP 包说明
├── CHANGELOG.md
└── LICENSE
```

## packages/skills 详细结构

```
packages/skills/
├── skills/
│   └── smart-port-allocation/
│       ├── SKILL.md             # Skill 入口(frontmatter + 操作步骤 + 示例)
│       └── references/
│           ├── port-key.md                  # 工具参数与输出格式
│           └── port-best-practices.md       # 端口分配最佳实践
├── package.json                 # files: ["skills", ...]
├── README.md                    # skill 索引与安装说明
├── CHANGELOG.md
└── LICENSE
```

## 关键文件速查表

| 我想做什么 | 应该看哪个文件 |
|------------|----------------|
| 修改键盘映射表 | `packages/core/src/port-key.js:3`(`DEFAULT_MAP`) |
| 修改默认屏蔽端口 | `packages/core/src/port-key.js:16`(`DEFAULT_BLOCKED_PORTS`) |
| 调整候选生成逻辑(位数/补零) | `packages/core/src/port-key.js:98`(`pickPortFromDigits`) |
| 修改字母到数字的映射规则 | `packages/core/src/port-key.js:38`(`buildReverseMap`) + `:63`(`mapToDigits`) |
| 加新的 CLI 参数 | `packages/core/src/cli.js:32`(`parseArgv`) + `:146`(`mergeConfig`) |
| 改帮助文案 | `packages/core/locales/cn.json` + `packages/core/locales/en.json` |
| 改配置文件路径或回退逻辑 | `packages/core/src/config.js:7`(`getConfigPath`) |
| 改运行计数存储 | `packages/core/src/config.js:81`(`loadRunCount`) + `:99`(`incrementRunCount`) |
| 加 MCP 工具 | 新建 `packages/mcp/src/tools/<name>.ts` + 改 `tools/index.ts` |
| 加 MCP 资源 | 新建 `packages/mcp/src/resources/<name>.ts` + 改 `resources/index.ts` |
| 改 MCP 默认端口(10945) | `packages/mcp/src/config/index.ts:39` |
| 改 MCP 会话 TTL | `packages/mcp/src/config/index.ts:43`(env `SESSION_TTL`) |
| 改 MCP 日志路径或级别 | `packages/mcp/src/utils/logger.ts:8`(`LOG_DIR`)+ `:19`(level) |
| 改 HTTP server 中间件(CORS) | `packages/mcp/src/mcp-server.ts:113`(fastify cors 注册) |
| 改 health 端点返回字段 | `packages/mcp/src/mcp-server.ts:120`(`/health` handler) |
| 加新语言(MCP) | `docs/README.<lang>.md` + `packages/mcp/scripts/build-locales.js:11`(`LANGUAGES`) |
| 改发布版本号或 bump 逻辑 | `scripts/bump-version.sh` |
| 改 MCP server 中硬编码版本号 | `scripts/bump-version.sh:96-118`(自动写 mcp-server.ts) |
| 改 files 白名单(发布内容) | 各包 `package.json` 的 `files` 字段 |
| 改 pre-commit 翻译触发条件 | `scripts/pre-commit-hook.js:93`(检查 README.md) |
| 修改 Copilot 项目指南 | `.github/copilot-instructions.md` |
| 修改 Skill 触发条件或步骤 | `packages/skills/skills/smart-port-allocation/SKILL.md`(frontmatter) |
| 查看默认端口范围限制 | `packages/core/src/port-key.js:82`(`isValidPort`) + `:86`(`isPortBlocked`) |
| 查看核心算法如何透传纯数字 | `packages/core/src/port-key.js:66-71`(`hasLetter` 判断) |

---

*Structure analysis: 2026-07-13*
