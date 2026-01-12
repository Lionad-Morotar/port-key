# PortKey MCP Server

## Description

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for PortKey. It provides tools to map project names to port numbers using keyboard-based letter-to-number mapping, check port availability, and access PortKey configuration.

## Usage

### Running the Server

The PortKey MCP server supports both Stdio and Streamable HTTP transport modes.

#### Stdio Mode (Default)

Designed to be run by an IDE-based MCP client like [Visual Studio Code's Copilot](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode).

```shell
npx @lionad/port-key-mcp
```

#### HTTP Mode (Streamable)

Runs an HTTP server implementing the Streamable HTTP transport. This mode is suitable for remote connections or when stdio is not available.

```shell
# Run on default port 3000
npx @lionad/port-key-mcp --streamable

# Run on specific port
npx @lionad/port-key-mcp --streamable --port 8080

# Reuse the already-running server on the same port (default: true)
npx @lionad/port-key-mcp --streamable --port 8080 --reuse

# Force starting a new process (will fail if the port is already in use by another service)
npx @lionad/port-key-mcp --streamable --port 8080 --reuse false
```

Environment variables are also supported:
```shell
PORT=8080 LOG_LEVEL=debug npx @lionad/port-key-mcp --streamable
```

##### Single-instance reuse (Streamable)

When you run `npx @lionad/port-key-mcp --streamable` from multiple terminals using the same port, the CLI will detect an existing PortKey MCP server (via `GET /health`) and exit successfully without starting a new server process. This keeps “one port = one MCP server instance” while allowing repeated invocations.

##### Endpoints (Streamable)

- `GET /health` returns a JSON health payload.
- `POST /mcp`, `GET /mcp`, `DELETE /mcp` implement MCP Streamable HTTP transport (stateful sessions).

### Available Tools

The MCP server provides the following tools:

- **map-project-name-to-port**: Map a project name to a port number using keyboard-based letter-to-number mapping
- **get-design-philosophy**: Get design philosophy and background of PortKey
- **check-port-availability**: Check if a specific port is available or occupied
- **get-port-occupancy**: Get information about processes occupying specific ports

#### map-project-name-to-port

##### Tool Parameters

- `projectName` (string, required): The project name to map to a port number
- `map` (string, optional): Custom mapping in JSON format (e.g., `{ "1": "qaz", "2": "wsx", ... }`)
- `preferDigitCount` (number, optional): Preferred digit count for port (2-5, default: 4)
- `minPort` (number, optional): Minimum port number (0-65535, default: 0)
- `maxPort` (number, optional): Maximum port number (0-65535, default: 65535)
- `blockedPorts` (array of numbers, optional): List of blocked port numbers to avoid

##### Example Tool Call

```json
{
  "name": "map-project-name-to-port",
  "arguments": {
    "projectName": "cfetch",
    "preferDigitCount": 4
  }
}
```

##### Example Response

```json
{
  "digits": "343536",
  "port": 3435,
  "rejectedCandidates": []
}
```

#### get-design-philosophy

##### Tool Parameters

- `lang` (string, optional): Language code for design philosophy content. Supported languages: `"cn"`, `"es"`, `"fr"`, `"de"`, `"ja"`, `"ko"`, `"ru"`, `"ar"`, `"pt"`, `"it"`. Default: `"cn"`.

#### check-port-availability

##### Tool Parameters

- `port` (number, required): The port number to check (0-65535)

#### get-port-occupancy

##### Tool Parameters

- `ports` (array of numbers, optional): List of port numbers to filter results

### Available Resources

- **config://port-mapping**: Get default port mapping configuration and blocked ports
- **projects://{projectName}/port-history**: Get history of port assignments for a project

### Supported Languages (for design philosophy)

| Code | Language   |
|-------|------------|
| cn    | 中文        |
| es    | Español    |
| fr    | Français    |
| de    | Deutsch     |
| ja    | 日本語      |
| ko    | 한국어       |
| ru    | Русский     |
| ar    | العربية     |
| pt    | Português  |
| it    | Italiano   |

## Configuration

You can configure MCP server in your MCP client's configuration file (e.g., for VS Code Copilot, configure in your `.copilot/settings.json`):

```json
{
  "mcpServers": {
    "port-key": {
      "command": "npx",
      "args": ["@lionad/port-key-mcp"]
    }
  }
}
```

For HTTP mode configuration in clients that support it:

```json
{
  "mcpServers": {
    "port-key": {
      "command": "npx",
      "args": ["@lionad/port-key-mcp", "--streamable"]
    }
  }
}
```

## Logs

In Streamable HTTP mode, logs are written under `~/.port-key/logs`.

## Development

Build locales (generates from docs/ directory):

```shell
pnpm run build:locales
```

Run tests:

```shell
pnpm test
```

Run tests in watch mode:

```shell
pnpm run test:watch
```

Run e2e tests (builds first, then spawns `node packages/mcp` in subprocesses):

```shell
pnpm run test:e2e
```

## Thanks

- **[Template-Nodejs-MCP-Server](https://github.com/HarveyYifanLi/Template-Nodejs-MCP-Server)** by HarveyYifanLi
  - Provided excellent examples of stateful session management and modular tool/resource architecture.

- **[mcp-restaurant-booking](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/servers/restaurant)** by Model Context Protocol
  - Provided reference for production-grade TypeScript project configuration and logging systems.
