import { describe, it, beforeEach, expect } from "vitest";
import { mcpServerApp } from "../src/mcp-server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

function getSingleTextContent(content: unknown): string {
  if (!Array.isArray(content)) {
    throw new Error("Expected tool content to be an array");
  }
  if (content.length !== 1) {
    throw new Error(`Expected exactly 1 content item, got ${content.length}`);
  }

  const first = content[0];
  if (first === null || typeof first !== "object") {
    throw new Error("Expected content item to be an object");
  }

  const item = first as { type?: unknown; text?: unknown };
  if (item.type !== "text") {
    throw new Error(`Expected content item type to be 'text', got ${String(item.type)}`);
  }
  if (typeof item.text !== "string") {
    throw new Error("Expected text content to have a string 'text' field");
  }

  return item.text;
}

describe("MCP Server", () => {
  let client: Client;
  let clientTransport: InMemoryTransport;
  let serverTransport: InMemoryTransport;

  beforeEach(async () => {
    client = new Client({
      name: "test client",
      version: "1.0",
    }, {
      capabilities: {}
    });

    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Note: must connect server first or else client hangs
    const mcpServer = mcpServerApp.getMcpServer();
    await mcpServer.connect(serverTransport);
    await client.connect(clientTransport);
  });

  describe("Tools", () => {
    it("should list tools", async () => {
      const { tools } = await client.listTools();

      expect(tools.length).toBeGreaterThanOrEqual(2);
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain("map-project-name-to-port");
      expect(toolNames).toContain("get-design-philosophy");
    });

    describe("map-project-name-to-port", () => {
      it("should map a simple project name to port", async () => {
        const { content } = await client.callTool({
          name: "map-project-name-to-port",
          arguments: {
            projectName: "cfetch",
          },
        });

        const result = JSON.parse(getSingleTextContent(content));
        expect(typeof result.digits).toBe("string");
        expect(typeof result.port).toBe("number");
        expect(result.port).toBe(3435);
      });

      it("should support preferDigitCount", async () => {
        const { content } = await client.callTool({
          name: "map-project-name-to-port",
          arguments: {
            projectName: "cfetch",
            preferDigitCount: 5,
          },
        });

        const result = JSON.parse(getSingleTextContent(content));
        expect(result.port).toBe(34353);
      });

      it("should return error for invalid map JSON", async () => {
        const { content, isError } = await client.callTool({
          name: "map-project-name-to-port",
          arguments: {
            projectName: "test",
            map: "{invalid json}",
          },
        });

        expect(isError).toBe(true);

        const result = JSON.parse(getSingleTextContent(content));
        expect(typeof result.error).toBe("string");
        expect(result.error.length).toBeGreaterThan(0);
      });

      it("should handle blockedPorts", async () => {
        const { content } = await client.callTool({
          name: "map-project-name-to-port",
          arguments: {
            projectName: "cfetch",
            blockedPorts: [3435, 4353],
          },
        });

        const result = JSON.parse(getSingleTextContent(content));
        expect(result.port).not.toBe(3435);
        expect(result.port).not.toBe(4353);
      });
    });

    describe("get-design-philosophy", () => {
      it("should return design philosophy in Chinese by default", async () => {
        const { content } = await client.callTool({
          name: "get-design-philosophy",
          arguments: {},
        });

        const text = getSingleTextContent(content);
        expect(text.length).toBeGreaterThan(0);
        expect(text).toContain("设计理念");
      });

      it("should return design philosophy in Chinese when lang is cn", async () => {
        const { content } = await client.callTool({
          name: "get-design-philosophy",
          arguments: { lang: "cn" },
        });

        const text = getSingleTextContent(content);
        expect(text.length).toBeGreaterThan(0);
        expect(text).toContain("设计理念");
      });
    });
  });
});
