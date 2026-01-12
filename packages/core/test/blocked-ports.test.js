
import { describe, it, expect } from 'vitest';
import { isPortBlocked, DEFAULT_BLOCKED_PORTS } from '../src/port-key.js';

describe('isPortBlocked', () => {
  it('blocks specific ports in the blacklist', () => {
    expect(isPortBlocked(3000, DEFAULT_BLOCKED_PORTS)).toBe(true);
    expect(isPortBlocked(8080, DEFAULT_BLOCKED_PORTS)).toBe(true);
  });

  it('does NOT block random user ports not in blacklist', () => {
    // 3435 is not in default blocked ports
    expect(isPortBlocked(3435, DEFAULT_BLOCKED_PORTS)).toBe(false);
  });

  it('should block all system ports (0-1023)', () => {
    // 1 is not in the current hardcoded list
    expect(isPortBlocked(1, DEFAULT_BLOCKED_PORTS)).toBe(true);
    // 1023 is not in the current hardcoded list
    expect(isPortBlocked(1023, DEFAULT_BLOCKED_PORTS)).toBe(true);
    // 80 is in the list
    expect(isPortBlocked(80, DEFAULT_BLOCKED_PORTS)).toBe(true);
  });
});
