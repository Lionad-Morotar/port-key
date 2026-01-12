# 现代化的 MCP Server

## 概述
将 mcp-template-1 和 mcp-template-2 的优点融合到现有的 packages/mcp 中，从 stdio 协议扩展到支持 HTTP 传输，添加生产级特性，同时保留现有功能。

## HTTP 服务器选型：Fastify

选择 **Fastify** 作为 HTTP 服务器框架：

| 方案 | 性能 | 开发效率 | 选择理由 |
|------|------|----------|----------|
| Fastify | 很高（~4-5 万 req/s） | 高 | ✅ 选用 |
| Express | 中等（~2-3 万 req/s） | 极高 | - |
| Hono | 极高（~8-10 万 req/s） | 高 | - |
| 原生 http | 最高 | 低 | - |

**选择 Fastify 的理由：**
1. 性能比 Express 快约 2 倍，CPU 效率更高
2. API 风格与 Express 类似，迁移成本低
3. 支持 Express 中间件（兼容性好）
4. 内置 JSON Schema 验证（与 Zod 配合良好）
5. TypeScript 支持优秀
6. 适合 MCP 服务器的场景（轻量级请求处理）

## 主要改动

### 1. 统一 MCPServerApp 类设计
- **重构**: `src/mcp-server.ts` - 使用 MCPServerApp 类统一管理 stdio 和 HTTP 服务器
  - `createServer()` - 创建 MCP 服务器实例
  - `registerTools()` - 注册所有工具
  - `registerResources()` - 注册所有资源
  - `runStdio()` - 启动 stdio 传输模式
  - `runHttp()` - 启动 HTTP streamable 传输模式
  - `run()` - 根据参数选择启动模式

### 2. 命令行参数支持
- **更新**: `src/mcp-cli.ts` - 添加命令行参数解析
  - `--streamable` / `-s`: 启用 HTTP streamable 传输模式（默认 false，使用 stdio）
  - `--port` / `-p`: 指定 HTTP 端口（默认 3000）
  - 优先级：命令行参数 > 环境变量 > 默认值

### 3. HTTP 服务器支持（Fastify）
- **集成到 MCPServerApp**: 使用 Fastify 实现 HTTP 服务器
  - 使用 StreamableHTTPServerTransport
  - 支持 POST/GET/DELETE /mcp 端点
  - 健康检查端点 `/health`
  - CORS 配置（支持 mcp-protocol-version header）
  - DNS 重绑定保护

### 4. 会话管理（来自 template-1）
- **新增**: `src/session-manager.ts` - 会话管理模块
  - 使用 Map 存储 HTTP 传输对象（stateful 连接）
  - 会话自动清理机制（TTL）
  - 会话超时配置
  - 支持会话重用提升性能

### 5. 配置管理（来自 template-2）
- **新增**: `src/config/index.ts` - 配置管理模块
  - 环境变量配置（PORT、LOG_LEVEL 等）
  - TypeScript 类型安全的配置对象
  - 支持自定义配置项
  - 配置优先级：命令行参数 > 环境变量 > 默认值

### 6. 日志系统（来自 template-2）
- **新增**: `src/logger.ts` - Winston 日志模块
  - Console 输出（彩色）
  - File 输出（error.log、combined.log）
  - 日志级别动态调整
  - 日志轮转（log rotation）
  - 日志文件大小和数量限制
  - 兼容 MCP 服务器的 stderr 输出

### 7. 工具模块化（来自 template-1）
- **新增**: `src/tools/index.ts` - 工具注册模块
- **重构**: 将现有工具从 mcp-server.ts 拆分到独立文件
  - `src/tools/map-project-name-to-port.ts`
  - `src/tools/get-design-philosophy.ts`

### 8. 添加实用工具（真实功能）
- **新增**: `src/tools/check-port-availability.ts` - 检查端口是否可用
  - 调用系统 API 检查端口占用
  - 返回端口状态（可用/占用/被阻止）
- **新增**: `src/tools/get-port-occupancy.ts` - 获取端口占用情况
  - 列出当前系统中所有占用端口
  - 显示进程信息
- 这些工具提供真实的端口管理功能

### 9. 添加资源模块（来自 template-1）
- **新增**: `src/resources/index.ts` - 资源注册模块
- **新增**: `src/resources/port-mapping-config.ts` - 端口映射配置资源（静态）
  - 返回默认的键盘映射配置
  - 返回默认的阻止端口列表
- **新增**: `src/resources/project-port-history.ts` - 项目端口历史资源（动态，支持参数）
  - 根据项目名称查询历史端口分配
  - 支持参数化 URI 模板

### 10. 健康检查和错误处理
- **新增**: 健康检查端点 `/health`，返回服务状态
  - 检查磁盘空间
  - 检查内存使用
  - 检查活动会话数
- **增强**: 统一的错误处理机制
- **增强**: JSON-RPC 错误响应格式

### 11. 优雅关闭
- **新增**: SIGINT/SIGTERM 信号处理
- **新增**: 会话清理和资源释放
- **新增**: 优雅关闭 HTTP 服务器

### 12. 依赖更新
- **新增**: `fastify` - 高性能 HTTP 服务器
- **新增**: `@fastify/cors` - CORS 支持
- **新增**: `winston` - 日志系统
- **新增**: `winston-daily-rotate-file` - 日志轮转

### 13. 文档更新
- **更新**: README.md - 添加 HTTP 服务器使用说明
- **更新**: 添加新的工具和资源文档
- **新增**: 在 README.md 末尾致谢部分

## 文件结构
```
packages/mcp/
├── src/
│   ├── config/
│   │   └── index.ts               # 配置管理
│   ├── tools/
│   │   ├── index.ts               # 工具注册
│   │   ├── map-project-name-to-port.ts
│   │   ├── get-design-philosophy.ts
│   │   ├── check-port-availability.ts  # 新增
│   │   └── get-port-occupancy.ts      # 新增
│   ├── resources/
│   │   ├── index.ts               # 资源注册
│   │   ├── port-mapping-config.ts       # 新增
│   │   └── project-port-history.ts       # 新增
│   ├── session-manager.ts         # 会话管理（新增）
│   ├── logger.ts                # 日志系统（新增）
│   ├── mcp-server.ts            # MCPServerApp 类（重构）
│   └── mcp-cli.ts              # 命令行入口（更新）
├── bin/
│   └── port-key-mcp.js          # 统一入口（支持 stdio 和 HTTP）
├── package.json                 # 更新依赖
├── tsconfig.json                # 更新编译配置
└── README.md                   # 更新文档
```

## 保持兼容性
- 保留现有的 stdio 模式（默认）: `npx @lionad/port-key-mcp`
- 新增 HTTP streamable 模式: `npx @lionad/port-key-mcp --streamable --port 3000`
- 现有工具功能不变
- API 向后兼容

## 使用示例

### Stdio 模式（默认）
```bash
npx @lionad/port-key-mcp
```

### HTTP Streamable 模式
```bash
# 使用默认端口 3000
npx @lionad/port-key-mcp --streamable

# 指定端口
npx @lionad/port-key-mcp --streamable --port 8080
```

### 环境变量配置
```bash
PORT=8080 LOG_LEVEL=debug npx @lionad/port-key-mcp --streamable
```

## 致谢

本项目的 MCP 服务器许多带来来自以下优秀开源项目：

- **[Template-Nodejs-MCP-Server](https://github.com/HarveyYifanLi/Template-Nodejs-MCP-Server)** by HarveyYifanLi
  - 提供了 stateful 会话管理和模块化工具/资源架构的优秀示例

- **[mcp-restaurant-booking](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/servers/restaurant)** by Model Context Protocol
  - 提供了生产级 TypeScript 项目配置和日志系统的参考
