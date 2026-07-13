# Coding Conventions

**Analysis Date:** 2026-07-13

PortKey 是 pnpm monorepo，包含三个包：`packages/core`（纯 JS ESM 核心算法 + CLI）、`packages/mcp`（TypeScript MCP Server）、`packages/skills`（纯 markdown 技能定义）。本文档归纳跨包约定，标注各约定"出处"以便追溯。

## 命名约定

**文件名（kebab-case）：**

| 模式 | 示例 |
| --- | --- |
| 源码 `.js` / `.ts` | `packages/core/src/port-key.js`、`packages/mcp/src/mcp-server.ts` |
| 工具/Tool 模块 | `packages/mcp/src/tools/check-port-availability.ts`、`map-project-name-to-port.ts` |
| 测试文件 | `<源名>.test.js`（core）、`<源名>.test.ts`（mcp） |

**函数名（camelCase，动词前缀）：**

```javascript
// packages/core/src/port-key.js
function mapToDigits(text, map) {}
function pickPortFromDigits(digits, options) {}
function normalizeInput(text) {}
function loadUserConfigSync(deps) {}    // packages/core/src/config.js
function getLangOrDefault(lang) {}      // packages/core/src/i18n.js
```

**常量（UPPER_SNAKE_CASE）：**

```javascript
// packages/core/src/port-key.js
const DEFAULT_MAP = Object.freeze({ 1: 'qaz', /* ... */ });
const DEFAULT_BLOCKED_PORTS = Object.freeze(new Set([3000, 8080, /* ... */]));

// packages/mcp/src/mcp-server.ts
const sessionManager = new SessionManager<StreamableHTTPServerTransport>(config.session); // singleton 小写
```

**类（PascalCase）：** 仅 mcp 包使用 class，core 包完全是函数式。

- `MCPServerApp` — `packages/mcp/src/mcp-server.ts`
- `SessionManager<T>` — `packages/mcp/src/utils/session-manager.ts`

**导出对象常量（camelCase）：** mcp 的 tool/resource 用单一 const 对象 + `name` 字段。

```typescript
// packages/mcp/src/tools/map-project-name-to-port.ts
export const mapProjectNameToPortTool = {
  name: "map-project-name-to-port",
  // ...
};
```

**i18n key（点分命名）：** `missingInput`、`configReadFailed`、`firstRunNoConfig`（见 `packages/core/locales/cn.json`）。

## 模块系统

**core：纯 ESM**

- `packages/core/package.json` 声明 `"type": "module"`
- 所有源码顶部 `'use strict';`（`packages/core/src/{port-key,cli,config,i18n}.js`）
- 测试中也必须用 `import`，禁止 `require`（`.github/copilot-instructions.md` 明确强调）

**mcp：TypeScript + Node16 ESM**

- `packages/mcp/package.json` 声明 `"type": "module"`
- `tsconfig.json` / `tsconfig.build.json` 设置 `module: "Node16"`、`moduleResolution: "Node16"`
- 源码用 `.ts`，但 **import 路径必须带 `.js` 后缀**（Node16 ESM 要求）

```typescript
// packages/mcp/src/tools/index.ts
import { mapProjectNameToPortTool } from './map-project-name-to-port.js';
import { checkPortAvailabilityTool } from './check-port-availability.js';
```

**Node 内置模块：统一加 `node:` 前缀**

```javascript
// packages/core/src/config.js
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
```

```typescript
// packages/mcp/src/tools/get-design-philosophy.ts
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
```

**反例：** `packages/mcp/src/utils/logger.ts` 与 `src/tools/check-port-availability.ts` 仍用旧式 `import { exec } from "child_process"`、`import { homedir } from "os"`，未加 `node:` 前缀。新代码应统一用 `node:`。

## 依赖注入（核心模式）

所有涉及外部 I/O（fs/os/path/env）的核心函数都通过 **`deps = {}` 参数对象** 接收外部依赖，便于测试替换。这是 PortKey 最关键的约定之一。

```javascript
// packages/core/src/config.js
function loadUserConfigSync(deps = {}) {
  const fsModule = deps.fs || fs;       // 不直接用模块顶层的 fs
  const osModule = deps.os || os;
  const pathModule = deps.path || path;
  const env = deps.env || process.env;
  // ...
}

function getPortKeyDirPath(deps = {}) { /* 同上解构 */ }
function loadRunCount(deps = {}) { /* 同上解构 */ }
```

```javascript
// packages/core/src/cli.js
function runCli(argv, stdout = process.stdout, stderr = process.stderr, deps = {}) {
  const { config, configReadError, path: configPath, configExists } = loadUserConfigSync(deps);
  // ...
}
```

**新增任何 I/O 函数时遵循同一模式：** 默认值用 `deps.xxx || <nativeModule>`，不要直接调用顶层 `fs.readFileSync`。

**测试侧用法：**

```javascript
// packages/core/test/cli.test.js
runCli(['--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });
```

## 错误处理

PortKey 区分两类错误：

**1. 用户输入错误 → `throw new Error('<英文信息>')`**

参数解析、用户 map 解析失败等用 throw，由 CLI 上层 catch 后写 stderr 并返回退出码 1。

```javascript
// packages/core/src/cli.js
if (!value) throw new Error('Missing value for -m/--map');
if (count !== 4 && count !== 5) throw new Error('Invalid digit count. Must be 4 or 5.');

// packages/core/src/port-key.js
function parseUserMap(mapString) {
  if (!raw) throw new Error('Empty map string');
  if (!isPlainObject(maybe)) throw new Error('Map must be an object');
  // ...
}
```

**约定：throw 的 message 用英文**（不带多语言），让 CLI 在 catch 后再通过 i18n 包装为用户友好信息。

**2. 外部 I/O 失败 → 静默 try/catch 回退到默认值**

读配置/日志文件失败不抛错，回退到安全默认。

```javascript
// packages/core/src/config.js
try {
  if (!fsModule.existsSync(configPath)) return { path: configPath, config: {}, /* ... */ };
  // ...
} catch {
  return { path: configPath, config: {}, configReadError: true, configExists: true };
}
```

**3. 退出码：** `runCli` 成功返回 `0`，失败返回 `1`（见 `packages/core/src/cli.js`）。`packages/core/bin/port-key.js` 直接将返回值赋给 `process.exitCode`。

**4. 候选记录：** `pickPortFromDigits` 维护 `rejectedCandidates: [{ candidate, reason }]` 数组，记录所有被拒绝端口及原因，最终在 CLI 失败时输出给用户（`packages/core/src/port-key.js:123-164`）。

**5. MCP tool 错误：** mcp tool 的 `execute` 函数捕获异常后返回 `{ content, isError: true }`，不抛错（保持 JSON-RPC 协议）。

```typescript
// packages/mcp/src/tools/map-project-name-to-port.ts
try { /* ... */ } catch (error) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: errorMessage }) }],
    isError: true,
  };
}
```

## 不可变默认值

所有"默认配置"常量用 `Object.freeze` 冻结，防止下游意外修改。

```javascript
// packages/core/src/port-key.js
const DEFAULT_MAP = Object.freeze({ 1: 'qaz', /* ... */ });
const DEFAULT_BLOCKED_PORTS = Object.freeze(new Set([3000, /* ... */]));
```

TypeScript 声明侧也用 `Readonly<>`：

```typescript
// packages/core/src/port-key.d.ts
export const DEFAULT_MAP: Readonly<DigitLetterMap>;
export const DEFAULT_BLOCKED_PORTS: ReadonlySet<number>;
```

## 输入归一化

任何进入映射算法的字符串都先经 `normalizeInput`：

```javascript
// packages/core/src/port-key.js
function normalizeInput(text) {
  return String(text || '')
    .toLowerCase()
    .split('')
    .filter((ch) => (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))
    .join('');
}
```

强制小写 + 只保留 `[a-z0-9]`。新加的输入处理函数应先调用它。

## 配置合并

`mergeConfig(base, override)` 用 **字段级 nullish coalescing `??`**，区分"未提供"和"显式 null/false"。

```javascript
// packages/core/src/config.js
return {
  ...a,
  ...b,
  map: b.map ?? a.map,
  blockedPorts: b.blockedPorts ?? a.blockedPorts,
  preferDigitCount: b.preferDigitCount ?? a.preferDigitCount,
  paddingZero: b.paddingZero ?? a.paddingZero,
  // ...
};
```

优先级：CLI 参数 > 用户 config.json > DEFAULT_*。

## i18n（多语言）

**绝不硬编码用户可见字符串。** 所有面向用户的提示通过 `loadMessages(lang)` 取，key 集中在 `packages/core/locales/{cn,en}.json`。

```javascript
// packages/core/src/cli.js
const lang = getLangOrDefault(effective.lang);
const MSG = loadMessages(lang);
stderr.write(MSG.missingInput + '\n');
```

支持的语言白名单：`packages/core/src/i18n.js` 中的 `SUPPORTED = new Set(['en', 'cn'])`，默认 `'cn'`。

mcp 包另有更广的语言列表（10 种：`cn, es, fr, de, ja, ko, ru, ar, pt, it`），仅用于 design philosophy 文档翻译（`packages/mcp/src/tools/get-design-philosophy.ts`），由 `scripts/build-locales.js` 生成。

## 日志

**core 包：不直接 console.\***

CLI 输出只通过注入的 `stdout` / `stderr` 流，便于测试。

```javascript
// packages/core/src/cli.js
function runCli(argv, stdout = process.stdout, stderr = process.stderr, deps = {}) {
  stdout.write(String(result.port) + '\n');
}
```

`grep "console\." packages/core/src` 返回空。

**mcp 包：用 winston**

`packages/mcp/src/utils/logger.ts` 导出默认 logger，按 `NODE_ENV` 加 console transport，文件侧用 `winston-daily-rotate-file` 滚动。

```typescript
// packages/mcp/src/utils/logger.ts
logger.info(`PortKey MCP Server listening on http://127.0.0.1:${port}`);
logger.error("Failed to start HTTP server", err);
```

日志写入 `~/.port-key/logs/`。

## 注释约定

**函数级注释解释 Why，不解释 What，不带开发追踪标记。**

`SessionManager` 的方法注释示范正确风格（`packages/mcp/src/utils/session-manager.ts`）：

```typescript
/**
 * Get a session by ID. Updates the expiration time (sliding window).
 */
get(id: string): T | undefined { /* ... */ }
```

**行内注释只解释隐含假设或外部约束：**

```javascript
// packages/core/src/port-key.js
// System Ports (0-1023) are assigned by IETF and should not be used.
if (port < 1024) return true;
```

```typescript
// packages/mcp/src/mcp-server.ts
// ! AUTO GENERATED VERSION - DO NOT EDIT
version: "0.5.0",
```

```typescript
// packages/mcp/src/mcp-server.ts
// DNS rebinding protection
enableDnsRebindingProtection: true,
```

## 代码风格与格式化

**未配置 ESLint / Prettier。** 仓库根目录无 `.eslintrc*`、`.prettierrc*`、`eslint.config.*`、`biome.json`。

实际风格靠 code review 与既有文件惯性维持：

- 2 空格缩进（core 与 mcp 一致）
- 单引号字符串（core JS），mcp TS 偏向双引号但不严格
- 末尾分号
- 函数声明用 `function` 关键字（core）或箭头函数（mcp tool execute）
- 文件长度软上限 300 行（参考用户全局约定）；目前 `packages/core/src/cli.js` 200 行，`packages/core/src/port-key.js` 227 行

**`.cspell.json`** 仅配置忽略路径：

```json
{ "ignorePaths": ["docs/README.*.md"] }
```

## Import 顺序

观察到约定：

1. 第三方库（`vitest`、`zod`、`@modelcontextprotocol/sdk`、`fastify`）
2. Node 内置（`node:fs`、`node:path`、`node:os`、`node:crypto`）
3. 项目内模块（`@lionad/port-key`、`../config/index.js`、`./port-key.js`）

```typescript
// packages/mcp/src/mcp-server.ts 示范
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { randomUUID } from "node:crypto";
import { tools } from "./tools/index.js";
import config from "./config/index.js";
```

**无 path alias（无 `@/*` 别名）**，跨包引用通过 npm 包名 `@lionad/port-key`。

## 桶文件（Barrel Files）

mcp 包用 `index.ts` 聚合导出：

- `packages/mcp/src/tools/index.ts` — 导出 `tools` 数组
- `packages/mcp/src/resources/index.ts` — 导出 `resources` 数组
- `packages/mcp/src/config/index.ts` — 导出默认 `config` 对象

新加 tool/resource 时同步在 `index.ts` 注册，否则不会被 `MCPServerApp.registerTools` / `registerResources` 拾取。

## 单例与全局状态

| 单例 | 位置 | 说明 |
| --- | --- | --- |
| `mcpServerApp` | `packages/mcp/src/mcp-server.ts:310` | 模块级 `export const mcpServerApp = new MCPServerApp()` |
| `sessionManager` | `packages/mcp/src/mcp-server.ts:16` | HTTP session 复用 |
| `i18n cache` | `packages/core/src/i18n.js:7` | `let cache = {}` 模块级缓存已加载的 lang |

新单例需谨慎：测试间会跨用例污染（i18n cache 当前无清理逻辑）。

## Git 提交约定

**Conventional Commits 风格，type 用英文，description 用中文。**

来自 `git log --oneline` 的真实样本：

```
feat: 增加 port-key 的 skill
fix: 修复端口生成算法以正确处理数字和补零逻辑
refactor: restructure skills & add readme
docs(skills): 更新 README 中的技能安装命令示例
chore: change default listen
release: v0.5.0
```

允许的 type：`feat`、`fix`、`refactor`、`docs`、`chore`、`release`、`style`、`test`。

**复合改动用 `&` 拼接（不推荐但存在）：**

```
feat & chore: 增加 e2e 测试用例 & 更新依赖
```

**Release 提交格式：** `release: v<version>`。

## 依赖管理

**包管理器：pnpm（强制）**

- 根 `pnpm-workspace.yaml` 声明 `packages/*`
- `.npmrc` 指向 `registry=https://registry.npmjs.org/`
- 仓库同时存在 `pnpm-lock.yaml` 与历史遗留的 `package-lock.json` — **以 `pnpm-lock.yaml` 为准**，禁用 npm/corepack（用户全局约定）

**版本同步：** 所有包共享同一版本号，通过 `scripts/bump-version.sh` 同时更新 `packages/core/package.json` 与 `packages/mcp/package.json`。

**发布流程：** `pnpm release` → build → `pnpm -r publish --access public --no-git-checks`。

## 文件长度参考

| 文件 | 行数 |
| --- | --- |
| `packages/core/src/cli.js` | 200 |
| `packages/core/src/port-key.js` | 227 |
| `packages/core/src/config.js` | 134 |
| `packages/mcp/src/mcp-server.ts` | 311 |
| `packages/mcp/tests/e2e/mcp-cli.e2e.test.ts` | 372 |

mcp-server.ts 已超过 300 行软上限，是后续拆分候选。

---

*Convention analysis: 2026-07-13*
