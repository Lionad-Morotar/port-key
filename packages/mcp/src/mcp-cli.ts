import { mcpServer } from "./mcp-server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

function disconnect() {
	mcpServer.close();
	process.exitCode = 0;
}

await mcpServer.connect(new StdioServerTransport());

// ! never use console.log in stdio MCP servers, but stderr is safe
// @see https://modelcontextprotocol.io/docs/develop/build-server#logging-in-mcp-servers-2
console.error(`PortKey MCP server is running. cwd: ${process.cwd()}`);

process.on("SIGINT", disconnect);
process.on("SIGTERM", disconnect);
