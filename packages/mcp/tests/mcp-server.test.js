import { describe, it, beforeEach } from "vitest";
import { mcpServer } from "../src/mcp-server.js";
import assert from "node:assert";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

describe("MCP Server", () => {
	let client, clientTransport, serverTransport;

	beforeEach(async () => {
		client = new Client({
			name: "test client",
			version: "1.0",
		});

		[clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();

		// Note: must connect server first or else client hangs
		await mcpServer.connect(serverTransport);
		await client.connect(clientTransport);
	});

	describe("Tools", () => {
		it("should list tools", async () => {
			const { tools } = await client.listTools();

			assert.strictEqual(tools.length, 1);
			assert.strictEqual(tools[0].name, "map-project-name-to-port");
			assert.strictEqual(tools[0].description, "Map a project name to a port number using keyboard-based letter-to-number mapping");
		});

		describe("map-project-name-to-port", () => {
			it("should map a simple project name to port", async () => {
				const { content } = await client.callTool({
					name: "map-project-name-to-port",
					arguments: {
						projectName: "cfetch",
					},
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				const result = JSON.parse(content[0].text);
				assert.strictEqual(typeof result.digits, "string");
				assert.strictEqual(typeof result.port, "number");
				assert.strictEqual(result.port, 3435);
			});

			it("should support preferDigitCount", async () => {
				const { content } = await client.callTool({
					name: "map-project-name-to-port",
					arguments: {
						projectName: "cfetch",
						preferDigitCount: 5,
					},
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				const result = JSON.parse(content[0].text);
				assert.strictEqual(result.port, 34353);
			});

			it("should return error for invalid map JSON", async () => {
				const { content, isError } = await client.callTool({
					name: "map-project-name-to-port",
					arguments: {
						projectName: "test",
						map: "{invalid json}",
					},
				});

				assert.strictEqual(isError, true);
				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				const result = JSON.parse(content[0].text);
				assert.strictEqual(typeof result.error, "string");
				assert.ok(result.error.length > 0);
			});

			it("should handle blockedPorts", async () => {
				const { content } = await client.callTool({
					name: "map-project-name-to-port",
					arguments: {
						projectName: "cfetch",
						blockedPorts: [3435, 4353],
					},
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				const result = JSON.parse(content[0].text);
				assert.ok(result.port !== 3435);
				assert.ok(result.port !== 4353);
			});
		});
	});
});
