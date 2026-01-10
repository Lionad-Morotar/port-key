import { describe, it, expect } from 'vitest';
import { formatHelp } from '../src/cli.js';
import { loadMessages, getLangOrDefault } from '../src/i18n.js';

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
});
