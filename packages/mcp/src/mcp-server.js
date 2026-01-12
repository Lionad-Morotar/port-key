import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mapToPort } from "@lionad/port-key";

const mcpServer = new McpServer({
	name: "PortKey",
	version: "0.1.5",
});

mcpServer.registerTool(
	"map-project-name-to-port",
	{
		title: "Map Project Name to Port",
		description: "Map a project name to a port number using keyboard-based letter-to-number mapping",
		inputSchema: {
			projectName: z.string().min(1),
			map: z.string().optional(),
			preferDigitCount: z.number().int().min(2).max(5).optional(),
			minPort: z.number().int().min(0).max(65535).optional(),
			maxPort: z.number().int().min(0).max(65535).optional(),
			blockedPorts: z.array(z.number().int().min(0).max(65535)).optional(),
		},
	},
	async ({ projectName, map, preferDigitCount, minPort, maxPort, blockedPorts }) => {
		try {
			let customMap = undefined;
			if (map && map !== "") {
				customMap = JSON.parse(map);
			}
			const options = {
				preferDigitCount,
				minPort,
				maxPort,
				blockedPorts: blockedPorts ? new Set(blockedPorts) : undefined,
			};
			const result = mapToPort(projectName, customMap, options);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		} catch (error) {
			const errorMessage = error && typeof error === "object" && "message" in error ? String(error.message) : String(error);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ error: errorMessage }),
					},
				],
				isError: true,
			};
		}
	}
);

export { mcpServer };
