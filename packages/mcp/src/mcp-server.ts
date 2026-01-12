import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mapToPort } from "@lionad/port-key";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPPORTED_LANGUAGES = ["cn", "es", "fr", "de", "ja", "ko", "ru", "ar", "pt", "it"];

async function loadLocale(lang: string): Promise<string> {
	const localePath = join(__dirname, "..", "locales", `${lang}.json`);
	try {
		const content = await readFile(localePath, "utf-8");
		const locale = JSON.parse(content);
		return locale.designPhilosophy || "";
	} catch {
		return "";
	}
}

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

mcpServer.registerTool(
	"get-design-philosophy",
	{
		title: "Get PortKey Design Philosophy",
		description: "Get design philosophy and background of PortKey",
		inputSchema: {
			lang: z.enum([...SUPPORTED_LANGUAGES] as [string, ...string[]]).default("cn"),
		},
	},
	async ({ lang = "cn" }) => {
		try {
			const philosophy = await loadLocale(lang);
			return {
				content: [
					{
						type: "text",
						text: philosophy,
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
