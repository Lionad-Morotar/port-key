import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
      let command = "lsof -i -P -n";
      if (ports && ports.length > 0) {
        // Filter for specific ports if provided
        // lsof doesn't support multiple ports easily in one go for -i without complex syntax
        // So we'll fetch all and filter in JS, or construct a grep chain
        // Fetching all listening ports is usually fast enough
      }

      const { stdout } = await execAsync(command);
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
