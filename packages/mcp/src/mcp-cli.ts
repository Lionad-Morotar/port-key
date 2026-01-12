import { mcpServerApp } from "./mcp-server.js";
import config from "./config/index.js";

// Parse command line arguments
const args = process.argv.slice(2);
const options: { streamable?: boolean; port?: number; local?: boolean; reuse?: boolean } = {};

function printHelp() {
  console.log(`
Usage: port-key-mcp [options]

Options:
  -s, --streamable       Run in streamable mode (HTTP)
  -p, --port <number>    Specify port number (default: 3000)
  -l, --local [boolean]  Enable/disable local tools (default: true)
  --reuse [boolean]      Reuse existing streamable server on same port (default: true)
  -h, --help             Show this help message

Examples:
  port-key-mcp --streamable --port 8080
  port-key-mcp --local false
`);
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else if (arg === "--streamable" || arg === "-s") {
    options.streamable = true;
  } else if (arg === "--port" || arg === "-p") {
    const port = parseInt(args[i + 1], 10);
    if (!isNaN(port)) {
      options.port = port;
      i++; // Skip next argument
    }
  } else if (arg === "--local" || arg === "-l") {
    options.local = args[i + 1] !== 'false';
    if (args[i + 1] === 'true' || args[i + 1] === 'false') {
        i++; // Skip next argument if it's a boolean value
    }
  } else if (arg === "--reuse") {
    options.reuse = args[i + 1] !== "false";
    if (args[i + 1] === "true" || args[i + 1] === "false") {
      i++;
    }
  }
}

function resolvePort(): number {
  if (typeof options.port === "number") return options.port;
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : NaN;
  if (!Number.isNaN(envPort)) return envPort;
  return config.server.port;
}

async function isPortKeyMcpServerRunning(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(1000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    return Boolean(body && typeof body === "object" && (body as any).status === "ok");
  } catch {
    return false;
  }
}

const shouldRunStreamable = options.streamable || config.server.streamable;
const reuseEnabled = options.reuse !== false;

if (shouldRunStreamable && reuseEnabled) {
  const port = resolvePort();
  const running = await isPortKeyMcpServerRunning(port);
  if (running) {
    console.log(`PortKey MCP Server already running at http://127.0.0.1:${port}`);
    process.exit(0);
  }
}

await mcpServerApp.run(options);
