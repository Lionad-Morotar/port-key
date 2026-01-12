import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import Fastify from "fastify";
import cors from "@fastify/cors";

import { tools } from "./tools/index.js";
import { resources } from "./resources/index.js";
import config from "./config/index.js";
import logger from "./utils/logger.js";
import { SessionManager } from "./utils/session-manager.js";

// Session manager for HTTP transport
const sessionManager = new SessionManager<StreamableHTTPServerTransport>(config.session);

export class MCPServerApp {
  private server: McpServer;

  constructor() {
    this.server = this.createServer();
  }

  private createServer(): McpServer {
    const server = new McpServer({
      name: "PortKey",
      // ! AUTO GENERATED VERSION - DO NOT EDIT
      version: "0.1.5",
    });

    this.registerTools(server);
    this.registerResources(server);

    return server;
  }

  private registerTools(server: McpServer, isLocal: boolean = true) {
    for (const tool of tools) {
      // 云端执行时，不注册依赖本地工具的工具
      if (!isLocal && (tool as any).isLocal) {
        continue;
      }
      server.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema,
        },
        tool.execute as any
      );
    }
  }

  private registerResources(server: McpServer) {
    for (const resource of resources) {
      if (typeof resource.resourceUri === 'string') {
        server.registerResource(
          resource.name,
          resource.resourceUri,
          {
            title: resource.title,
            description: resource.description,
            mimeType: (resource as any).mimeType,
          },
          async (uri) => {
            const result = await resource.execute(uri);
            return result;
          }
        );
      } else {
        server.registerResource(
          resource.name,
          resource.resourceUri,
          {
            title: resource.title,
            description: resource.description,
            mimeType: (resource as any).mimeType,
          },
          async (uri, params) => {
            const result = await (resource as any).execute(uri, params);
            return result;
          }
        );
      }
    }
  }

  public getMcpServer(): McpServer {
    return this.server;
  }

  public async runStdio() {
    logger.info("Starting PortKey MCP Server in Stdio mode");
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      logger.info("PortKey MCP Server connected to Stdio transport");
    } catch (error) {
      logger.error("Failed to start Stdio server", error);
      process.exit(1);
    }
  }

  public async runHttp(port: number = config.server.port) {
    logger.info(`Starting PortKey MCP Server in HTTP mode on port ${port}`);

    const fastify = Fastify({
      logger: false, // We use our own logger
    });

    // Register CORS
    await fastify.register(cors, {
      origin: true, // Allow all origins for now, can be configured
      exposedHeaders: ["mcp-session-id"],
      allowedHeaders: ["Content-Type", "mcp-session-id", "mcp-protocol-version"],
    });

    // Health check endpoint
    fastify.get("/health", async () => {
      // Basic health check
      const memoryUsage = process.memoryUsage();
      const healthStatus = {
        status: "ok",
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + "MB",
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + "MB",
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + "MB",
        },
        sessions: sessionManager.size,
      };
      
      return healthStatus;
    });

    // Handle POST requests for client-to-server communication
    fastify.post("/mcp", async (request, reply) => {
      const sessionId = request.headers["mcp-session-id"] as string | undefined;
      
      let transport: StreamableHTTPServerTransport | undefined;

      // Reuse existing transport if session ID provided
      if (sessionId) {
        transport = sessionManager.get(sessionId);
      }

      // Initialize new transport
      if (!transport && isInitializeRequest(request.body)) {
        const allowedHosts = [
          `127.0.0.1:${port}`,
          `localhost:${port}`,
          `[::1]:${port}`,
        ];

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            if (transport) {
              sessionManager.set(id, transport);
            }
          },
          // DNS rebinding protection
          enableDnsRebindingProtection: true,
          allowedHosts,
        });

        transport.onclose = () => {
          if (transport?.sessionId) {
            sessionManager.remove(transport.sessionId);
          }
        };

        // Connect a new server instance to this transport
        // Each HTTP session needs its own server instance to maintain state isolation
        const sessionServer = this.createServer();
        await sessionServer.connect(transport);
      } else if (!transport) {
        return reply.code(400).send({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided or invalid initialization",
          },
          id: null,
        });
      }

      // Handle the request
      // @ts-ignore - Fastify types compatibility
      await transport.handleRequest(request.raw, reply.raw, request.body);
    });

    // Handle GET requests for server-to-client notifications
    fastify.get("/mcp", async (request, reply) => {
      const sessionId = request.headers["mcp-session-id"] as string | undefined;
      
      if (!sessionId) {
        return reply.code(400).send("Invalid or missing session ID");
      }

      const transport = sessionManager.get(sessionId);
      if (!transport) {
        return reply.code(400).send("Session not found");
      }

      // @ts-ignore
      await transport.handleRequest(request.raw, reply.raw);
    });

    // Handle DELETE requests for session termination
    fastify.delete("/mcp", async (request, reply) => {
      const sessionId = request.headers["mcp-session-id"] as string | undefined;
      
      if (!sessionId) {
        return reply.code(400).send("Invalid or missing session ID");
      }

      const transport = sessionManager.get(sessionId);
      if (!transport) {
        return reply.code(400).send("Session not found");
      }

      // @ts-ignore
      await transport.handleRequest(request.raw, reply.raw);
      sessionManager.remove(sessionId);
    });

    try {
      await fastify.listen({ port, host: "0.0.0.0" });
      logger.info(`PortKey MCP Server listening on http://0.0.0.0:${port}`);
      logger.info(`Health check available at http://0.0.0.0:${port}/health`);
      logger.info(`MCP endpoint available at http://0.0.0.0:${port}/mcp`);
    } catch (err) {
      logger.error("Failed to start HTTP server", err);
      process.exit(1);
    }
  }

  public async run(options: { streamable?: boolean; port?: number; local?: boolean } = {}) {
    // Graceful shutdown
    const shutdown = () => {
      logger.info("Shutting down PortKey MCP Server...");
      sessionManager.destroy();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // Re-register tools based on options.local
    // By default local is true unless explicitly set to false
    const isLocal = options.local !== false;
    
    // Clear existing tools registration and re-register
    // Note: Since we register in createServer(), we might need to recreate server or just register again
    // But sdk doesn't support unregister. So we should create server with correct tools from start or
    // modify registerTools to take options. 
    // Since createServer is called in constructor, we need a way to re-init or filter tools.
    
    // Better approach: We should register tools in run() or have a separate init()
    // But since constructor calls createServer, let's just create a NEW server instance if we need to filter tools
    // However, this.server is already assigned.
    
    // Let's modify createServer to accept options, but we can't change constructor signature easily without breaking things.
    // Instead, let's re-create the server instance here if we need to filter tools.
    
    if (isLocal === false) {
       this.server = new McpServer({
        name: "PortKey",
        version: "0.1.5", // Should match what was in createServer
      });
      // Register only non-local tools
      this.registerTools(this.server, false);
      this.registerResources(this.server);
    } else {
       // If isLocal is true (default), we already registered all tools in constructor
       // But to be safe and consistent, we could re-register or just ensure constructor did the right thing.
       // The constructor calls createServer which calls registerTools without args (so all tools).
       // So if isLocal is true, we are good with default instance.
    }

    if (options.streamable || config.server.streamable) {
      await this.runHttp(options.port || config.server.port);
    } else {
      await this.runStdio();
    }
  }
}

// Export a singleton for backward compatibility if needed, though class usage is preferred
export const mcpServerApp = new MCPServerApp();
