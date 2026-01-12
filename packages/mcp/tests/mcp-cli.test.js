import { describe, it, afterEach } from "vitest";
import assert from "node:assert";
import childProcess from "node:child_process";
import path from "node:path";

const forkedProcesses = new Set();
const EXECUTABLE_PATH = path.resolve("./bin/port-key-mcp.js");

function runServer(options) {
	const newProcess = childProcess.fork(
		EXECUTABLE_PATH,
		[],
		Object.assign({ silent: true }, options),
	);

	forkedProcesses.add(newProcess);
	return newProcess;
}

describe("MCP server", () => {
	it("should start MCP server", done => {
		const child = runServer();

		// should not have anything on std out
		child.stdout.on("data", data => {
			assert.fail(`Unexpected stdout data: ${data}`);
		});

		child.stderr.on("data", data => {
			assert.match(data.toString(), /PortKey MCP server is running/u);
			done();
		});
	});

	afterEach(() => {
		// Clean up all the processes after every test.
		forkedProcesses.forEach(child => child.kill());
		forkedProcesses.clear();
	});
});
