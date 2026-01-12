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

			assert.strictEqual(tools.length, 2);
			assert.strictEqual(tools[0].name, "map-project-name-to-port");
			assert.strictEqual(tools[1].name, "get-design-philosophy");
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

		describe("get-design-philosophy", () => {
			it("should return design philosophy in Chinese by default", async () => {
				const { content } = await client.callTool({
					name: "get-design-philosophy",
					arguments: {},
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				assert.ok(content[0].text.length > 0);
				assert.ok(content[0].text.includes("设计理念"));
			});

			it("should return design philosophy in Chinese when lang is cn", async () => {
				const { content } = await client.callTool({
					name: "get-design-philosophy",
					arguments: { lang: "cn" },
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				assert.ok(content[0].text.length > 0);
				assert.ok(content[0].text.includes("设计理念"));
			});

			it("should return design philosophy in Spanish when lang is es", async () => {
				const { content } = await client.callTool({
					name: "get-design-philosophy",
					arguments: { lang: "es" },
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				assert.ok(content[0].text.length > 0);
				assert.ok(content[0].text.includes("teclado"));
			});

			it("should return design philosophy in French when lang is fr", async () => {
				const { content } = await client.callTool({
					name: "get-design-philosophy",
					arguments: { lang: "fr" },
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				assert.ok(content[0].text.length > 0);
				assert.ok(content[0].text.includes("clavier"));
			});

			it("should return design philosophy in German when lang is de", async () => {
				const { content } = await client.callTool({
					name: "get-design-philosophy",
					arguments: { lang: "de" },
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				assert.ok(content[0].text.length > 0);
				assert.ok(content[0].text.includes("Tastatur"));
			});

			it("should return design philosophy in Japanese when lang is ja", async () => {
				const { content } = await client.callTool({
					name: "get-design-philosophy",
					arguments: { lang: "ja" },
				});

				assert.strictEqual(content.length, 1);
				assert.strictEqual(content[0].type, "text");
				assert.ok(content[0].text.length > 0);
				assert.ok(content[0].text.includes("キーボード"));
			});
		});
	});
});
