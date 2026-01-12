import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
      // Use lsof to check port usage (works on macOS/Linux)
      // For Windows, netstat might be needed, but assuming macOS environment as per context
      try {
        await execAsync(`lsof -i :${port}`);
        // If lsof returns success (exit code 0), the port is occupied
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
        // If lsof returns error (exit code 1), the port is likely free
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
