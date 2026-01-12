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

function createEmptyHome() {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-empty-home-'));
  fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpHome, '.port-key', 'log.json'),
    JSON.stringify({ count: 1 }, null, 2),
    'utf8'
  );
  return tmpHome;
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
    const tmpHome = createEmptyHome();

    const code = runCli(['--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('3435');
    expect(stderr.output).toBe('');
  });

  it('allows custom map via -m', () => {
    const stdout = createStream();
    const stderr = createStream();
    const tmpHome = createEmptyHome();

    const code = runCli(['-m', '{"8":"abc"}', '--', 'cbaa'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('8888');
    expect(stderr.output).toBe('');
  });

  it('returns an error when input is missing', () => {
    const stdout = createStream();
    const stderr = createStream();
    const tmpHome = createEmptyHome();

    const code = runCli([], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(1);
    expect(stderr.output).toContain('缺少输入文本');
  });

  it('protects against missing -m value', () => {
    const stdout = createStream();
    const stderr = createStream();
    const tmpHome = createEmptyHome();

    const code = runCli(['-m'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(1);
    expect(stderr.output).toContain('Missing value for -m/--map');
  });

  it('loads ~/.port-key/config.json (via HOME) for defaults', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-home-'));
    fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.port-key', 'config.json'),
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
    const tmpHome = createEmptyHome();
    const code1 = runCli(['--lang', 'en', '--', 'cfetch'], stdout1, stderr1, { env: { HOME: tmpHome } });
    expect(code1).toBe(0);

    const stdout2 = createStream();
    const stderr2 = createStream();
    const code2 = runCli(['--lang', 'zh', '--', 'cfetch'], stdout2, stderr2, { env: { HOME: tmpHome } });
    expect(code2).toBe(1);
    expect(stderr2.output).toContain('不支持的语言');
  });

  it('supports -d/--digits option', () => {
    const stdout1 = createStream();
    const stderr1 = createStream();
    const tmpHome = createEmptyHome();
    const code1 = runCli(['-d', '4', '--', '013344'], stdout1, stderr1, { env: { HOME: tmpHome } });
    expect(code1).toBe(0);
    expect(stdout1.output.trim()).toBe('1334');

    const stdout2 = createStream();
    const stderr2 = createStream();
    const code2 = runCli(['--digits', '5', '--', '013344'], stdout2, stderr2, { env: { HOME: tmpHome } });
    expect(code2).toBe(0);
    expect(stdout2.output.trim()).toBe('13344');
  });

  it('rejects invalid digit count', () => {
    const stdout = createStream();
    const stderr = createStream();
    const tmpHome = createEmptyHome();
    const code = runCli(['-d', '3', '--', 'test'], stdout, stderr, { env: { HOME: tmpHome } });
    expect(code).toBe(1);
    expect(stderr.output).toContain('Invalid digit count. Must be 4 or 5.');
  });

  it('shows detailed rejection info when port generation fails', () => {
    const stdout = createStream();
    const stderr = createStream();
    const tmpHome = createEmptyHome();
    // Use --padding-zero false to force failure for short input 'x'
    const code = runCli(['--padding-zero', 'false', '--', 'x'], stdout, stderr, { env: { HOME: tmpHome } });
    expect(code).toBe(1);
    expect(stderr.output).toContain('无法从输入生成有效端口');
  });

  it('shows welcome message on first run when no config exists', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-first-run-'));
    fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });

    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--lang', 'cn', '--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('3435');
    expect(stderr.output).toContain('[info] 欢迎使用 PortKey！');
    expect(stderr.output).toContain('config.json');
    expect(stderr.output).toContain('https://github.com/Lionad-Morotar/port-key#config');

    const logPath = path.join(tmpHome, '.port-key', 'log.json');
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    expect(logContent.count).toBe(1);
  });

  it('increments run count in log.json', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-increment-'));
    fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });

    const logPath = path.join(tmpHome, '.port-key', 'log.json');
    fs.writeFileSync(logPath, JSON.stringify({ count: 5 }, null, 2), 'utf8');

    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('3435');
    expect(stderr.output).toBe('');

    const logContent = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    expect(logContent.count).toBe(6);
  });

  it('does not show welcome message when config exists', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-config-exists-'));
    fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpHome, '.port-key', 'config.json'),
      JSON.stringify({ lang: 'cn' }),
      'utf8'
    );

    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('3435');
  });

  it('does not show welcome message on subsequent runs', () => {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-subsequent-'));
    fs.mkdirSync(path.join(tmpHome, '.port-key'), { recursive: true });

    const logPath = path.join(tmpHome, '.port-key', 'log.json');
    fs.writeFileSync(logPath, JSON.stringify({ count: 1 }, null, 2), 'utf8');

    const stdout = createStream();
    const stderr = createStream();

    const code = runCli(['--lang', 'cn', '--', 'cfetch'], stdout, stderr, { env: { HOME: tmpHome } });

    expect(code).toBe(0);
    expect(stdout.output.trim()).toBe('3435');

    const logContent = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    expect(logContent.count).toBe(2);
  });
});
