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

describe('CLI', () => {
  it('prints help when requested', () => {
    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--lang', 'en', '--help'], stdout, stderr);

    expect(code).toBe(0);
    expect(stdout.output).toContain('Usage:');
    expect(stderr.output).toBe('');
  });

  it('maps incoming text when supplied after --', () => {
    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--', 'cfetch'], stdout, stderr);

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('3435');
    expect(stderr.output).toBe('');
  });

  it('allows custom map via -m', () => {
    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['-m', '{"8":"abc"}', '--', 'cbaa'], stdout, stderr);

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('8888');
    expect(stderr.output).toBe('');
  });

  it('returns an error when input is missing', () => {
    const stdout = createStream();
    const stderr = createStream();

    const code = runCli([], stdout, stderr);

    expect(code).toBe(1);
    expect(stderr.output).toContain('缺少输入文本');
  });

  it('protects against missing -m value', () => {
    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['-m'], stdout, stderr);

    expect(code).toBe(1);
    expect(stderr.output).toContain('Missing value for -m/--map');
  });

  it('loads ~/.portkey/config.json (via HOME) for defaults', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-home-'));
    fs.mkdirSync(path.join(tmpHome, '.portkey'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.portkey', 'config.json'),
      JSON.stringify({ map: { 8: 'c' } }),
      'utf8'
    );

    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--', 'cccc'], stdout, stderr, {
      env: { HOME: tmpHome },
    });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('8888');
    expect(stderr.output).toBe('');
  });

  it('allows --lang en, rejects other langs', () => {
    const stdout1 = createStream();
    const stderr1 = createStream();
    const code1 = runCli(['--lang', 'en', '--', 'cfetch'], stdout1, stderr1);
    expect(code1).toBe(0);

    const stdout2 = createStream();
    const stderr2 = createStream();
    const code2 = runCli(['--lang', 'zh', '--', 'cfetch'], stdout2, stderr2);
    expect(code2).toBe(1);
    expect(stderr2.output).toContain('不支持的语言');
  });

  it('supports -d/--digits option', () => {
    const stdout1 = createStream();
    const stderr1 = createStream();
    const code1 = runCli(['-d', '4', '--', '013344'], stdout1, stderr1);
    expect(code1).toBe(0);
    expect(stdout1.output.trim()).toBe('1334');

    const stdout2 = createStream();
    const stderr2 = createStream();
    const code2 = runCli(['--digits', '5', '--', '013344'], stdout2, stderr2);
    expect(code2).toBe(0);
    expect(stdout2.output.trim()).toBe('13344');
  });

  it('rejects invalid digit count', () => {
    const stdout = createStream();
    const stderr = createStream();
    const code = runCli(['-d', '3', '--', 'test'], stdout, stderr);
    expect(code).toBe(1);
    expect(stderr.output).toContain('Invalid digit count. Must be 4 or 5.');
  });

  it('shows detailed rejection info when port generation fails', () => {
    const stdout = createStream();
    const stderr = createStream();
    const code = runCli(['--', 'x'], stdout, stderr);
    expect(code).toBe(1);
    expect(stderr.output).toContain('无法从输入生成有效端口');
  });
});
