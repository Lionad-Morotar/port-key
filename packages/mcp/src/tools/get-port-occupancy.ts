import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// execFile 以参数数组传参，不经 shell 插值，根除注入面
const execFileAsync = promisify(execFile);

export const getPortOccupancyTool = {
  name: "get-port-occupancy",
  title: "Get Port Occupancy",
  isLocal: true,
  description: "Get information about processes occupying specific ports on the local machine. This tool executes local system commands (lsof) and will not work in cloud/serverless environments.",
  inputSchema: {
    ports: z.array(z.number().int().min(0).max(65535)).optional(),
  },
  execute: async ({ ports }: { ports?: number[] }) => {
    try {
      // 拉取全部监听端口后在 JS 层按 ports 过滤；lsof 不便一次传多个 -i :port
      const { stdout } = await execFileAsync("lsof", ["-i", "-P", "-n"]);
      const lines = stdout.split('\n').filter(line => line.trim() !== '');
      const processes: any[] = [];
      
      // Parse lsof output
      // COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].replace(/\s+/g, ' ').split(' ');
        if (parts.length >= 9) {
          const namePart = parts.slice(8).join(' ');
          const portMatch = namePart.match(/:(\d+)/);
          if (portMatch) {
            const port = parseInt(portMatch[1], 10);
            if (!ports || ports.includes(port)) {
              processes.push({
                command: parts[0],
                pid: parts[1],
                user: parts[2],
                port,
                details: namePart
              });
            }
          }
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(processes, null, 2),
          },
        ],
      };
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
