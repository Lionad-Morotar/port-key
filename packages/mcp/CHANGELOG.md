# Changelog

## v0.6.0

- security: check-port-availability 与 get-port-occupancy 的 exec 改为 execFile 参数数组，消除 lsof 命令注入面
- fix: check-port-availability 区分命令缺失（ENOENT）与端口空闲，lsof 不存在时返回错误而非误判可用
- fix: logger 日志轮转 maxSize 由 '1'（1 字节）修正为 '10m'
- fix: session-manager 清理定时器加 unref()，不再阻止进程退出
- refactor: 包入口收敛为 CLI-only（移除 main/exports/types），仅可执行、不可 import（对齐官方 TS MCP server）
- chore: 移除未生效的 health 配置块与 session.timeout 死配置
- chore: [internal] 移除自动翻译 pre-commit 机制与根目录失效 index.js，README 翻译改由子代理手动同步
- docs: README logo 改用绝对 URL 并同步 10 语言翻译

## v0.5.0

- chore: sync version

## v0.4.2

- feat: 替换 logo

## v0.4.1

- fix: default listen 127.0.0.1:10945

## v0.4.0

- feat: add HTTP server support using Fastify (StreamableHTTPServerTransport)
- feat: add command line arguments `--streamable` and `--port`
- feat: add command line arguments `--resuse` to reuse port number
- feat: add stateful session management with TTL and timeout
- feat: add Winston-based logging system with file rotation
- feat: add configuration management via environment variables
- feat: add new tools: `check-port-availability` and `get-port-occupancy`
- feat: add new resources: `config://port-mapping`
- feat: add health check endpoint `/health`
- refactor: modularize tools and resources into separate files
- refactor: rewrite server using MCPServerApp class
- chore: update dependencies (fastify, winston, zod)
- docs: update README with HTTP server usage and acknowledgements
- test: add full e2e test

## v0.3.0

- chore: sync version

## v0.2.0

- chore: sync version

## v0.1.6

- chore: sync version

## v0.1.5

- Add separate MCP server package
- Implement `map-project-name-to-port` tool to map project names to port numbers
- Implement `get-design-philosophy` tool to get design philosophy and background of PortKey
- Add dependency on `@lionad/port-key` workspace package
- Add comprehensive test coverage for MCP server tools
- Update README with detailed usage instructions and tool parameters
- Support custom mapping, `preferDigitCount`, `minPort`, `maxPort`, and `blockedPorts` options
- Add `build:locales` script to automatically generate locale files from docs/ directory
- Support 9 languages: cn, es, fr, de, ja, ko, ru, ar, pt, it
- Add locales to package files for distribution
- Update mcp-server to support all 9 languages via lang parameter
