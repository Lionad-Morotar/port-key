import { describe, it, expect } from 'vitest';
import { runCli } from '../src/cli.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function createStream() {
  return {
    output: '',
    write(chunk) {
      this.output += chunk;
    },
  };
}

describe('User config', () => {
  it('respects ~/.portkey/config.json settings', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-home-'));
    fs.mkdirSync(path.join(tmpHome, '.portkey'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.portkey', 'config.json'),
      JSON.stringify({ lang: 'cn', preferDigitCount: 5 }),
      'utf8'
    );

    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--', '013344'], stdout, stderr, { env: { HOME: tmpHome } });
    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('13344');
  });
});
