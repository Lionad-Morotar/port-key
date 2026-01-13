# Changelog

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
