# Testing Patterns

**Analysis Date:** 2026-07-13

PortKey 的测试由两个包独立维护，均用 Vitest 4.0.16，但风格、运行约束、覆盖深度差异较大。本文档同时给出"现状"与"应遵循的约定"。

**实际测试数量（2026-07-13 实跑结果）：**

| 包 | 测试文件数 | 测试用例数 | 通过 |
| --- | --- | --- | --- |
| `packages/core` | 5 | 39 | 39 |
| `packages/mcp` | 8 | 29 | 29 |
| **合计** | **13** | **68** | **68** |

旧版 `.github/copilot-instructions.md` 提到的"29 tests"是 mcp 加入前的 core 数字，现已过期 — 请勿再引用该数字。

## 测试框架

**Runner：** Vitest `4.0.16`（`packages/core/package.json` 与 `packages/mcp/package.json` 中 pin 死）

**Assertion Library：** Vitest 内置 `expect`，外加 `node:assert`（仅 `packages/mcp/tests/mcp-cli.test.js` 例外）

**Run Commands：**

```bash
# 全量（根目录聚合所有包）
pnpm test

# 单包 — core
pnpm -C packages/core test
pnpm -C packages/core test:watch

# 单包 — mcp（注意：会先跑 build！）
pnpm -C packages/mcp test

# 单文件（推荐用于 TDD 快速反馈）
pnpm -C packages/core exec vitest run test/port-key.test.js
pnpm -C packages/core exec vitest run test/cli.test.js

# Watch 单文件
pnpm -C packages/core exec vitest test/port-key.test.js
```

**关键约束：mcp 测试必须先 build**

`packages/mcp/package.json` 的 `test` 脚本是：

```json
"test": "pnpm run build && vitest run"
```

原因：mcp 源码是 TypeScript ESM（Node16 module resolution），测试中 `import { mcpServerApp } from "../src/mcp-server.js"` 依赖 `tsc` 编译后的 `.js` + `.d.ts` 产物。直接跑 `vitest run` 不带 build 会失败。

**单文件跑 mcp 测试时也要先 `pnpm -C packages/mcp run build`**，否则出现 "Cannot find module '../src/mcp-server.js'"。

## 配置

**根配置 `/Users/lionad/Github/Lionad-Morotar/port-key/vitest.config.js`：**

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
```

**`packages/core/vitest.config.js`：**

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

仅设置 environment，复用根的 timeout 设置（Vitest 配置会与上游合并）。

**`packages/mcp/`：无独立 vitest.config**

mcp 包完全复用根配置的 `testTimeout: 15000`。e2e 测试单文件耗时 13.6s（平均每用例 ~1.4s），仍在 timeout 内。

**无 Coverage 配置：** 所有 vitest config 都未启用 `coverage`。如需添加，推荐：

```javascript
coverage: {
  provider: 'v8',
  include: ['src/**/*.{js,ts}'],
  exclude: ['**/*.d.ts', 'dist/**'],
}
```

## 测试文件组织

**位置约定：**

| 包 | 测试目录 | 测试文件后缀 |
| --- | --- | --- |
| `packages/core` | `test/`（扁平） | `*.test.js` |
| `packages/mcp` | `tests/`（镜像 src 结构） | `*.test.ts`（e2e 例外见下） |

**结构：**

```
packages/core/test/
├── blocked-ports.test.js       # isPortBlocked 行为
├── cli.test.js                 # runCli 端到端（最大，16 cases）
├── i18n.test.js                # 多语言加载
├── port-key.test.js            # 核心算法（最大，17 cases）
└── user-config.test.js         # config.json 合并

packages/mcp/tests/
├── mcp-cli.test.js             # bin 启动（CommonJS assert 风格）
├── mcp-server.test.ts          # MCP SDK 集成（InMemoryTransport）
├── e2e/
│   └── mcp-cli.e2e.test.ts     # 全链路（最大，9 cases，13.6s）
├── resources/
│   └── port-mapping-config.test.ts
├── tools/
│   ├── check-port-availability.test.ts
│   └── get-port-occupancy.test.ts
└── utils/
    ├── logger.test.ts
    └── session-manager.test.ts
```

**命名约定：**

- 文件名 = 被测源文件名（去 `.ts`/`.js`）+ `.test.ts`/`.test.js`
- e2e 文件加 `.e2e.` 中缀：`mcp-cli.e2e.test.ts`
- 测试目录镜像 `src/` 子目录（tools、resources、utils）

## 测试结构

**统一模式：`describe` + `it`，断言用 `expect`。**

```javascript
// packages/core/test/port-key.test.js
import { describe, it, expect } from 'vitest';
import { mapToDigits, parseUserMap } from '../src/port-key.js';

describe('utils: mapToDigits', () => {
  it('maps letters to their keyboard digits', () => {
    expect(mapToDigits('cfetch')).toBe('343536');
  });

  it('ignores digits when there are letters in input', () => {
    expect(mapToDigits('project-42')).toBe('0497335');
  });
});
```

**嵌套 describe 用于分组：**

```typescript
// packages/mcp/tests/mcp-server.test.ts
describe("MCP Server", () => {
  describe("Tools", () => {
    it("should list tools", async () => { /* ... */ });

    describe("map-project-name-to-port", () => {
      it("should map a simple project name to port", async () => { /* ... */ });
      it("should support preferDigitCount", async () => { /* ... */ });
    });
  });
});
```

**describe / it 文案约定：**

- core 多用陈述句：`'maps letters to their keyboard digits'`、`'picks a valid port under 65535'`
- mcp 多用 `should ...` 前缀：`"should start MCP server"`、`"should map a simple project name to port"`

两种风格并存，新代码遵循所在包的习惯。

**断言风格：** `expect(x).toBe(y)` 严格等价、`toEqual` 深等价、`toContain` 子串/数组元素、`toThrow()` / `toThrow('message')` 异常、`toHaveLength` / `toBeGreaterThan` 等。

**表格驱动测试：**

```javascript
// packages/core/test/port-key.test.js
it('maps many words correctly', () => {
  const testCases = [
    { input: 'x', digits: '2', port: 2000 },
    { input: 'ab', digits: '15', port: 1500 },
    { input: 'cfetch', digits: '343536', port: 3435 },
    { input: 'd000', digits: '3', port: null }, // 3000 blocked
    // ...
  ];
  testCases.forEach(({ input, digits, port }) => {
    const result = mapToPort(input);
    expect(result.digits).toBe(digits);
    expect(result.port).toBe(port);
  });
});
```

## Mocking 与隔离策略

**core 包：不使用 `vi.fn()` / `vi.mock()`，完全依赖 deps 注入。**

core 的隔离策略与一般 Vitest 项目不同 — 它通过 deps 参数把 mock 能力"内建"到源码中。新加的 fs/os/env 依赖必须遵循 `packages/core/src/config.js` 的模式，否则无法测试。

```javascript
// packages/core/test/cli.test.js
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function createEmptyHome() {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-empty-home-'));
  fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpHome, '.port-key', 'log.json'),
    JSON.stringify({ count: 1 }, null, 2),
    'utf8'
  );
  return tmpHome;
}

// 用法：把临时 HOME 注入 deps.env
runCli(['--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });
```

**mcp 包：用 `vi.useFakeTimers()` 测时间相关逻辑。**

```typescript
// packages/mcp/tests/utils/session-manager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  sessionManager = new SessionManager({ ttl: 60, timeout: 300 });
});

afterEach(() => {
  sessionManager.destroy();
  vi.useRealTimers();
});

it('should expire session after TTL', () => {
  sessionManager.set('session1', { id: 1 });
  vi.advanceTimersByTime(61000);
  expect(sessionManager.get('session1')).toBeUndefined();
});
```

**MCP 集成测试：用 `InMemoryTransport` 模拟 client/server 全双工。**

```typescript
// packages/mcp/tests/mcp-server.test.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

beforeEach(async () => {
  client = new Client({ name: "test client", version: "1.0" }, { capabilities: {} });
  [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  // 注意顺序：必须先 connect server，否则 client 挂起
  const mcpServer = mcpServerApp.getMcpServer();
  await mcpServer.connect(serverTransport);
  await client.connect(clientTransport);
});
```

**e2e：真实 fork 子进程**

```typescript
// packages/mcp/tests/e2e/mcp-cli.e2e.test.ts
const childProcess = spawn("node", [MCP_PATH, ...args], {
  cwd: ROOT_DIR,
  env: { ...process.env, NODE_ENV: "test" },
});
```

**何时不 mock：** core 的纯算法函数（`mapToDigits`、`pickPortFromDigits`、`parseUserMap`）直接断言结果，不需要任何 mock。

**何时不该 mock：** MCP e2e 已显式禁止绕过 API（用户全局约定），所有 server 行为都通过真实 HTTP/SSE 验证。

## Fixtures 与工厂

**无独立 fixtures 目录。** Test data 在测试文件顶部用工厂函数构造。

**core 常用工厂：**

```javascript
// packages/core/test/cli.test.js
function createStream() {
  return {
    output: '',
    write(chunk) { this.output += chunk; },
  };
}

function createEmptyHome() {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-empty-home-'));
  fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpHome, '.port-key', 'log.json'),
    JSON.stringify({ count: 1 }, null, 2),
    'utf8'
  );
  return tmpHome;
}
```

`createStream` 同时存在于 `cli.test.js` 和 `user-config.test.js` — 是复制粘贴而非共享工具。如要新增第三个用例，请先考虑抽取到 `packages/core/test/helpers.js`。

**mcp 工厂（e2e）：**

```typescript
// packages/mcp/tests/e2e/mcp-cli.e2e.test.ts
async function getFreePort(): Promise<number> { /* 用 net.createServer 探测 */ }
async function startServer(args, type, port): Promise<ServerProcess> { /* spawn + 等待 ready */ }
async function waitForServer(port, maxAttempts = 50, interval = 100): Promise<boolean> { /* 轮询 /health */ }
```

## Setup / Teardown

| 钩子 | 用途 | 文件 |
| --- | --- | --- |
| `beforeEach` | 重置 client/transport、初始化 fake timers | `mcp-server.test.ts`、`session-manager.test.ts` |
| `afterEach` | `child.kill()`、`sessionManager.destroy()`、`vi.useRealTimers()`、清理 forked 进程 | `mcp-cli.test.js`、`session-manager.test.ts`、`mcp-cli.e2e.test.ts` |

**e2e 的 afterEach 责任重大：** 必须杀掉所有 spawned 子进程并等 1 秒 drain，否则下个用例端口冲突。当前实现（`mcp-cli.e2e.test.ts:24-41`）已正确处理。

## 测试覆盖范围

### core 包（5 文件 / 39 用例）

| 测试文件 | 被测对象 | 用例数 | 覆盖重点 |
| --- | --- | --- | --- |
| `port-key.test.js` | `src/port-key.js` | 17 | 映射算法、padding、blocked ports、5 位 fallback、parseUserMap 边界 |
| `cli.test.js` | `src/cli.js` | 16 | 全部 CLI 参数路径、退出码、首次运行提示、run count 持久化 |
| `blocked-ports.test.js` | `isPortBlocked` | 3 | 系统端口（0-1023）、黑名单、白名单 |
| `i18n.test.js` | `src/i18n.js` | 2 | en/cn 加载、默认语言 |
| `user-config.test.js` | config 合并 | 1 | `~/.port-key/config.json` 生效路径 |

### mcp 包（8 文件 / 29 用例）

| 测试文件 | 被测对象 | 用例数 | 覆盖重点 |
| --- | --- | --- | --- |
| `e2e/mcp-cli.e2e.test.ts` | bin 入口 + HTTP/Stdio transport | 9 | streamable/stdio 启动、health、SSE tools/list、多实例、SIGTERM、PORT 复用 |
| `mcp-server.test.ts` | `mcpServerApp` | 7 | tools/list、map-project-name-to-port 各分支、get-design-philosophy 多语言 |
| `utils/session-manager.test.ts` | `SessionManager` | 5 | CRUD、TTL 过期、sliding window |
| `utils/logger.test.ts` | winston logger | 3 | level 读写 |
| `resources/port-mapping-config.test.ts` | config resource | 2 | uri、返回结构 |
| `mcp-cli.test.js` | bin 启动 | 1 | stderr 输出 "is running" |
| `tools/check-port-availability.test.ts` | tool schema | 1 | name + inputSchema 存在 |
| `tools/get-port-occupancy.test.ts` | tool schema | 1 | name + inputSchema 存在 |

**已知覆盖薄区：**

- `packages/mcp/src/mcp-cli.ts` 的参数解析（`--local`、`--reuse`、`--port`）几乎无测试
- `packages/mcp/src/config/index.ts` 的 env 解析无测试
- `packages/mcp/src/tools/check-port-availability.ts` / `get-port-occupancy.ts` 的 `execute` 真实路径无测试（仅 schema）

## 测试类型

**Unit（单元）**

- 纯函数测试：`port-key.test.js`、`blocked-ports.test.js`
- 类单元测试：`session-manager.test.ts`、`logger.test.ts`

**Integration（集成）**

- `mcp-server.test.ts` — MCP SDK + 内存 transport，验证 tool 注册与调用
- `user-config.test.js` — 真实 fs + 临时 HOME，验证 config 加载链路

**E2E**

- `mcp-cli.e2e.test.ts` — fork 真实 `node bin/port-key-mcp.js` 子进程，走完 HTTP/SSE 链路，包括健康检查、tools/list、graceful shutdown
- `cli.test.js` — 介于 integration 与 e2e 之间，直接调 `runCli`（不 fork）但覆盖完整 CLI 行为

## 常见测试模式

**Async testing：**

```typescript
it("should respond to MCP endpoint in streamable mode", async () => {
  const server = await startServer(["--streamable"], "streamable");
  const isHealthy = await waitForServer(server.port!);
  // ...
  const response = await fetch(`http://127.0.0.1:${server.port}/mcp`, { /* ... */ });
  expect(response.ok).toBe(true);
});
```

**Error testing：**

```javascript
it('throws for invalid formats', () => {
  expect(() => parseUserMap('abc')).toThrow();
  expect(() => parseUserMap('')).toThrow();
});

it('throws for non-digit keys', () => {
  expect(() => parseUserMap('{"z": "abc"}')).toThrow('Keys must be digits, values must be mapped letters');
});
```

**MCP tool error 返回（不抛异常）：**

```typescript
it("should return error for invalid map JSON", async () => {
  const { content, isError } = await client.callTool({
    name: "map-project-name-to-port",
    arguments: { projectName: "test", map: "{invalid json}" },
  });
  expect(isError).toBe(true);
  const result = JSON.parse(getSingleTextContent(content));
  expect(typeof result.error).toBe("string");
});
```

**退出码断言（CLI 测试核心）：**

```javascript
const code = runCli([], stdout, stderr, { env: { HOME: tmpHome } });
expect(code).toBe(1);
expect(stderr.output).toContain('缺少输入文本');
```

**stdout/stderr 双流断言：**

```javascript
expect(stdout.output.trim()).toBe('3435');
expect(stderr.output).toBe('');
```

## CI / CD 现状

**未配置 GitHub Actions / 其他 CI。** `.github/` 目录仅含 `copilot-instructions.md`，无 `workflows/` 目录。

**测试完全依赖本地手动运行 + pre-commit 钩子。** 这是一个 concern（见 CONCERNS.md）。

**pre-commit 钩子现状：**

- 当前**无 pre-commit 钩子**（原 `README.md` 自动翻译钩子已于 2026-07-14 移除：其 `fabric`/`sponge`/`sed` 链路在翻译服务不可用时曾清空 `docs/README.*.md`；README 翻译改由子代理手动同步）
- **不跑任何测试** — 不会拦截失败测试进入 commit

**.npmrc**：`registry=https://registry.npmjs.org/`，发布配置。

## 已知测试隔离坑

**1. HOME 目录读取**

CLI 默认读 `~/.port-key/config.json` 与 `~/.port-key/log.json`。如果不显式注入 `env: { HOME: tmpHome }`，测试会读写开发者真实 Home，导致：

- 本地行为受个人 config 影响（如 `preferDigitCount`）
- `log.json` 的 run count 被测试篡改

**修复：** 所有 `runCli` 测试都注入 `deps.env.HOME`，或设 `PORTKEY_HOME` 环境变量。

**2. `i18n.js` 模块级 cache**

```javascript
// packages/core/src/i18n.js
let cache = {};
function loadMessages(lang) {
  // ...
  if (cache[l]) return cache[l];
  // ...
  cache[l] = json;
}
```

测试间不清理，第一次加载后所有用例共享同一对象。当前测试只读不写 cache，未触发问题；但若未来加"修改 locale 后 reload"测试，需手动清理。

**3. mcp 包 `mcpServerApp` 单例**

`packages/mcp/src/mcp-server.ts:310` 的 `export const mcpServerApp = new MCPServerApp()` 是模块级单例。测试 import 时即初始化，多次 `getMcpServer()` 返回同一实例。`mcp-server.test.ts` 通过 `beforeEach` 重新 connect transport 规避，但 server 本身的状态（注册的 tools）是共享的。

**4. e2e 端口冲突**

`mcp-cli.e2e.test.ts` 用 `getFreePort()` 探测可用端口，但若并行运行多个 vitest 实例仍可能 race。`afterEach` 中的 1s sleep 是缓解措施，非根治。

**5. mcp 测试依赖 build 产物**

`packages/mcp/tests/**/*.test.ts` import `../src/*.js`（注意 `.js` 后缀，即使源是 `.ts`），这要求 `pnpm run build` 先跑过。直接 `vitest run` 会失败。

**修复：** 永远通过 `pnpm -C packages/mcp test` 跑（脚本内含 build），或单文件时手动先 `pnpm -C packages/mcp run build`。

**6. Node 版本敏感**

`packages/*/package.json` 声明 `"engines": { "node": ">=16" }`，但实际用了：

- `AbortSignal.timeout`（Node 17.3+）
- `fetch` 全局（Node 18+）
- `node:url` 的 `fileURLToPath`（Node 16+）

推荐用 Node 18+ 跑测试，本地验证环境为 Node v24.11.1（见 `.github/copilot-instructions.md`）。

## 提交前自检清单

参考 `.github/copilot-instructions.md` 第 84-89 行扩展：

1. `pnpm install`（如改了依赖）
2. **改动 core 时：** `pnpm -C packages/core test`（应 39 passed）
3. **改动 mcp 时：** `pnpm -C packages/mcp test`（应 29 passed，含 e2e 约 14s）
4. **改动 CLI/MCP 行为时：** 手动 sanity check：
   - `node packages/core/bin/port-key.js -- cfetch` → 应输出 `3435`
   - `node packages/mcp/bin/port-key-mcp.js --streamable --port 10945` → 应启动并响应 `/health`
5. **改动 TypeScript 时：** `pnpm -r exec tsc --noEmit`（根 `tsconfig.json` 是 noEmit 类型检查）
6. **改动 i18n 时：** 同步更新 `packages/core/locales/{cn,en}.json` 与 `packages/mcp/locales/*.json`

## 性能预算

| 测试套件 | 实测耗时 |
| --- | --- |
| `packages/core` 全量 | 186ms |
| `packages/mcp` 全量（含 build） | 13.81s |
| `packages/mcp` e2e 单文件 | 13.66s |

mcp e2e 占 mcp 总耗时的 98%。快速反馈循环时优先跑非 e2e 文件：

```bash
pnpm -C packages/mcp exec vitest run --exclude '**/e2e/**'
```

---

*Testing analysis: 2026-07-13*
