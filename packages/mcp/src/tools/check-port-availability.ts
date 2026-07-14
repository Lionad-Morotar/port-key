import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// execFile 以参数数组传参，不经 shell 插值，根除注入面
const execFileAsync = promisify(execFile);

export const checkPortAvailabilityTool = {
  name: "check-port-availability",
  title: "Check Port Availability",
  isLocal: true,
  description: "Check if a specific port is available or occupied on the local machine. This tool executes local system commands (lsof) and will not work in cloud/serverless environments.",
  inputSchema: {
    port: z.number().int().min(0).max(65535),
  },
  execute: async ({ port }: { port: number }) => {
    try {
      try {
        // lsof 仅在 macOS/Linux 可用；exit 0 表示端口被占用
        await execFileAsync("lsof", ["-i", `:${port}`]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                port,
                available: false,
                status: "occupied",
                message: `Port ${port} is currently in use.`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        // 命令不存在（如 Windows 无 lsof）时必须报错，而非误判为端口空闲
        if (error && typeof error === "object" && (error as { code?: unknown }).code === "ENOENT") {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: `lsof is not available on this platform: ${errorMessage}` }),
              },
            ],
            isError: true,
          };
        }
        // 非零退出（exit 1）表示端口空闲
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                port,
                available: true,
                status: "available",
                message: `Port ${port} appears to be available.`,
              }, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
};
