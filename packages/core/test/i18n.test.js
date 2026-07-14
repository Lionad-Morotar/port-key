import { describe, it, expect } from 'vitest';
import { formatHelp } from '../src/cli.js';
import { loadMessages, getLangOrDefault } from '../src/i18n.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

describe('i18n', () => {
  it('loads English messages', () => {
    const m = loadMessages('en');
    expect(m.usage).toBe('Usage:');
    const help = formatHelp('en');
    expect(help).toContain('Usage:');
  });

  it('loads Chinese messages and is default', () => {
    const m = loadMessages('cn');
    expect(m.usage).toBe('用法：');
    const help = formatHelp();
    expect(help).toContain('用法：');
    expect(getLangOrDefault(undefined)).toBe('cn');
  });

  it('resolves the locales directory from the real module path', () => {
    // 路径解析必须基于 fileURLToPath 的真实文件路径，而非手工剥离 file:// 前缀
    const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const expectedLocale = path.join(pkgRoot, 'locales', 'cn.json');
    expect(fs.existsSync(expectedLocale)).toBe(true);
    const m = loadMessages('cn');
    expect(m.usage).toBe('用法：');
  });
});
