import { mcpServerApp } from "./mcp-server.js";

// Parse command line arguments
const args = process.argv.slice(2);
const options: { streamable?: boolean; port?: number; local?: boolean } = {};

function printHelp() {
  console.log(`
Usage: port-key-mcp [options]

Options:
  -s, --streamable       Run in streamable mode (HTTP)
  -p, --port <number>    Specify port number (default: 3000)
  -l, --local [boolean]  Enable/disable local tools (default: true)
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
  }
}

// Start the server with parsed options
await mcpServerApp.run(options);
