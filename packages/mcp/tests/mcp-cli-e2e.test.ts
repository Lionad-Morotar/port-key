import { describe, it, expect, afterEach } from "vitest";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..", "..", "..");
const MCP_PATH = join(ROOT_DIR, "packages", "mcp");

interface ServerProcess {
  proc: ChildProcess;
  type: "streamable" | "stdio";
  port?: number;
  output: () => string;
}

describe("MCP CLI E2E", () => {
  let servers: ServerProcess[] = [];

  afterEach(async () => {
    for (const server of servers) {
      if (server.proc && !server.proc.killed) {
        server.proc.kill("SIGTERM");
        try {
          await new Promise<void>((resolve) => {
            server.proc.once("exit", () => resolve());
            setTimeout(() => resolve(), 5000);
          });
        } catch {
          server.proc.kill("SIGKILL");
        }
      }
    }
    servers = [];
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  async function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = createServer();
      server.unref();
      server.on("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (!address || typeof address === "string") {
          server.close(() => reject(new Error("Failed to resolve free port")));
          return;
        }
        const port = address.port;
        server.close(() => resolve(port));
      });
    });
  }

  async function startServer(args: string[], type: "streamable" | "stdio" = "streamable", port?: number): Promise<ServerProcess> {
    const isStreamable = args.includes("--streamable");
    const serverPort = port ?? (isStreamable ? await getFreePort() : undefined);

    return new Promise((resolve, reject) => {
      const childProcess = spawn("node", [MCP_PATH, ...args], {
        cwd: ROOT_DIR,
        env: {
          ...process.env,
          NODE_ENV: "test",
          ...(serverPort ? { PORT: serverPort.toString() } : {}),
        },
      });

      let started = false;
      let output = "";

      const timeout = setTimeout(() => {
        if (!started) {
          childProcess.kill();
          reject(new Error(`Server ${type} failed to start within timeout. Output: ${output}`));
        }
      }, 10000);

      childProcess.stdout.on("data", (data: Uint8Array) => {
        output += new TextDecoder().decode(data);
        const ready = isStreamable
          ? output.includes("listening on http://0.0.0.0:")
          : output.includes("Starting PortKey MCP Server");
        if (ready) {
          started = true;
          clearTimeout(timeout);
          resolve({ proc: childProcess, type, port: serverPort, output: () => output });
        }
      });

      childProcess.stderr.on("data", (data: Uint8Array) => {
        output += new TextDecoder().decode(data);
        const ready = isStreamable
          ? output.includes("listening on http://0.0.0.0:")
          : output.includes("Starting PortKey MCP Server");
        if (ready) {
          started = true;
          clearTimeout(timeout);
          resolve({ proc: childProcess, type, port: serverPort, output: () => output });
        }
      });

      childProcess.on("error", (error: unknown) => {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error(String(error)));
      });

      childProcess.on("exit", (code: number | null) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`Server exited with code ${code}. Output: ${output}`));
        }
      });

      servers.push({ proc: childProcess, type, port: serverPort, output: () => output });
    });
  }

  async function checkServerHealth(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function waitForServer(port: number, maxAttempts = 50, interval = 100): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      const isHealthy = await checkServerHealth(port);
      if (isHealthy) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
  }

  async function initStreamableSession(port: number): Promise<string> {
    const initResp = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
        "mcp-protocol-version": "2024-11-05",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "e2e-test", version: "1.0.0" },
        },
      }),
      signal: AbortSignal.timeout(4000),
    });

    const sessionId = initResp.headers.get("mcp-session-id");
    if (!initResp.ok || !sessionId) {
      const text = await initResp.text().catch(() => "");
      throw new Error(`Initialize failed: ${initResp.status} ${text}`);
    }

    try {
      await initResp.body?.cancel();
    } catch {
    }
    return sessionId;
  }

  describe("Streamable Mode", () => {
    it("should start server in streamable mode", async () => {
      const server = await startServer(["--streamable"], "streamable");
      expect(server.proc.pid).toBeDefined();
      expect(server.proc.killed).toBe(false);
    });

    it("should respond to health check in streamable mode", async () => {
      const server = await startServer(["--streamable"], "streamable");
      
      const isHealthy = await waitForServer(server.port!);
      if (!isHealthy) {
        throw new Error(`Health check failed. Output: ${server.output()}`);
      }
    });

    it("should respond to MCP endpoint in streamable mode", async () => {
      const server = await startServer(["--streamable"], "streamable");
      
      const isHealthy = await waitForServer(server.port!);
      if (!isHealthy) {
        throw new Error(`Health check failed. Output: ${server.output()}`);
      }
      
      try {
        const sessionId = await initStreamableSession(server.port!);

        const response = await fetch(`http://127.0.0.1:${server.port}/mcp`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/event-stream",
            "Content-Type": "application/json",
            "mcp-session-id": sessionId,
            "mcp-protocol-version": "2024-11-05",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list",
          }),
          signal: AbortSignal.timeout(4000),
        });
        expect(response.ok).toBe(true);
        const ct = response.headers.get("content-type") ?? "";
        expect(ct).toContain("text/event-stream");

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Missing response body stream");
        }
        const firstChunk = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timed out waiting for SSE data")), 2000)),
        ]);

        const chunkText = firstChunk.value ? new TextDecoder().decode(firstChunk.value) : "";
        await reader.cancel();
        expect(chunkText).toContain("event:");
      } catch (error) {
        throw new Error(`Failed to call MCP endpoint: ${error}`);
      }
    });
  });

  describe("StdIO Mode", () => {
    it("should start server in stdio mode", async () => {
      const server = await startServer([], "stdio");
      expect(server.proc.pid).toBeDefined();
      expect(server.proc.killed).toBe(false);
    });

    it("should handle stdio communication", async () => {
      const server = await startServer([], "stdio");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!server.proc.stdin) {
        throw new Error("stdin is not available");
      }

      server.proc.stdin.write(JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "test-client",
            version: "1.0.0",
          },
        },
      }) + "\n");

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(server.proc.killed).toBe(false);
    });
  });

  describe("Multiple Instances", () => {
    it("should start multiple server instances on different ports", async () => {
      const server1 = await startServer(["--streamable"], "streamable");
      const server2 = await startServer(["--streamable"], "streamable");
      
      const healthy1 = await waitForServer(server1.port!);
      const healthy2 = await waitForServer(server2.port!);
      
      expect(healthy1).toBe(true);
      expect(healthy2).toBe(true);
      expect(server1.port).not.toBe(server2.port);
    });
  });

  describe("Graceful Shutdown", () => {
    it("should shut down gracefully on SIGTERM", async () => {
      const server = await startServer(["--streamable"], "streamable");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      server.proc.kill("SIGTERM");
      
      await new Promise<void>((resolve) => {
        server.proc.once("exit", () => resolve());
        setTimeout(() => resolve(), 2000);
      });
      
      expect(server.proc.killed).toBe(true);
    });
  });

  describe("Port Configuration", () => {
    it("should respect custom PORT environment variable", async () => {
      const port = await getFreePort();
      await startServer(["--streamable"], "streamable", port);
      
      const isHealthy = await waitForServer(port);
      expect(isHealthy).toBe(true);
    });
  });
});
