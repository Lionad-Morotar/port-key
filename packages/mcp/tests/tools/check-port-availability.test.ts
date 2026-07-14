import { describe, it, expect, vi, beforeEach } from 'vitest';

// 在模块加载前替换 child_process.execFile，使工具走可预测的分支
const execFileMock = vi.fn();
vi.mock('node:child_process', () => ({
  execFile: (...args: unknown[]) => execFileMock(...args),
}));

import { checkPortAvailabilityTool } from '../../src/tools/check-port-availability.js';

function settleWith(impl: (cb: (err: unknown, stdout?: string, stderr?: string) => void) => void) {
  execFileMock.mockImplementation((...args: unknown[]) => {
    const cb = args[args.length - 1] as (err: unknown, stdout?: string, stderr?: string) => void;
    impl(cb);
  });
}

function parseText(result: { content: { text: string }[] }) {
  return JSON.parse(result.content[0].text);
}

describe('checkPortAvailabilityTool', () => {
  it('should have correct name and schema', () => {
    expect(checkPortAvailabilityTool.name).toBe('check-port-availability');
    expect(checkPortAvailabilityTool.inputSchema).toBeDefined();
    expect(checkPortAvailabilityTool.inputSchema.port).toBeDefined();
  });
});

describe('checkPortAvailabilityTool execute', () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  it('reports occupied when lsof exits 0', async () => {
    settleWith((cb) => cb(null, 'COMMAND PID USER\nnode 1 lionad\n'));
    const result = await checkPortAvailabilityTool.execute({ port: 3000 });
    expect(result.isError).toBeUndefined();
    expect(parseText(result).available).toBe(false);
  });

  it('reports available when lsof exits non-zero (port free)', async () => {
    settleWith((cb) => cb(Object.assign(new Error('Command failed'), { code: 1 })));
    const result = await checkPortAvailabilityTool.execute({ port: 3999 });
    expect(result.isError).toBeUndefined();
    expect(parseText(result).available).toBe(true);
  });

  it('returns isError when lsof command is missing (ENOENT), not a false "available"', async () => {
    settleWith((cb) => cb(Object.assign(new Error('spawn lsof ENOENT'), { code: 'ENOENT' })));
    const result = await checkPortAvailabilityTool.execute({ port: 3000 });
    expect(result.isError).toBe(true);
    expect(parseText(result).available).toBeUndefined();
  });
});
