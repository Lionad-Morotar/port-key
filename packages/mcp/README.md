# PortKey MCP Server

## Description

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for PortKey. It provides a tool to map project names to port numbers using keyboard-based letter-to-number mapping.

## Installation

Install the MCP server package:

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

The MCP server provides the following tool:

- **map-project-name-to-port**: Map a project name to a port number using keyboard-based letter-to-number mapping

#### Tool Parameters

- `projectName` (string, required): The project name to map to a port number
- `map` (string, optional): Custom mapping in JSON format (e.g., `{ "1": "qaz", "2": "wsx", ... }`)
- `preferDigitCount` (number, optional): Preferred digit count for the port (2-5, default: 4)
- `minPort` (number, optional): Minimum port number (0-65535, default: 0)
- `maxPort` (number, optional): Maximum port number (0-65535, default: 65535)
- `blockedPorts` (array of numbers, optional): List of blocked port numbers to avoid

#### Example Tool Call

```json
{
  "name": "map-project-name-to-port",
  "arguments": {
    "projectName": "cfetch",
    "preferDigitCount": 4
  }
}
```

#### Example Response

```json
{
  "digits": "343536",
  "port": 3435,
  "rejectedCandidates": []
}
```

## Configuration

You can configure the MCP server in your MCP client's configuration file (e.g., for VS Code Copilot, configure in your `.copilot/settings.json`):

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

Run tests:

```shell
npm test
```

Run tests in watch mode:

```shell
npm run test:watch
```
