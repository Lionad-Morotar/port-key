# PortKey MCP Server

## Description

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for PortKey. It provides tools to map project names to port numbers using keyboard-based letter-to-number mapping and get design philosophy.

## Installation

Install MCP server package:

```shell
npm install @lionad/port-key-mcp
```

## Usage

### Running the Server

The PortKey MCP server is designed to be run by an IDE-based MCP client like [Visual Studio Code's Copilot](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode).

```shell
npx @lionad/port-key-mcp
```

### Available Tools

The MCP server provides following tools:

- **map-project-name-to-port**: Map a project name to a port number using keyboard-based letter-to-number mapping
- **get-design-philosophy**: Get design philosophy and background of PortKey

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

##### Example Tool Call

```json
{
  "name": "get-design-philosophy",
  "arguments": {
    "lang": "en"
  }
}
```

##### Example Response

```
以下是 PortKey 的设计理念：

## 核心思路

PortKey 基于键盘布局将项目名称映射为数字，使端口号既可读又易记。
...
```

##### Supported Languages

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

## Development

Build locales (generates from docs/ directory):

```shell
npm run build:locales
```

Run tests:

```shell
npm test
```

Run tests in watch mode:

```shell
npm run test:watch
```
