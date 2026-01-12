import { describe, it, expect } from 'vitest';
import { mapToDigits, parseUserMap, DEFAULT_MAP, pickPortFromDigits, mapToPort } from '../src/port-key.js';

describe('utils: mapToDigits', () => {
  it('maps letters to their keyboard digits', () => {
    expect(mapToDigits('cfetch')).toBe('343536');
  });

  it('keeps numeric characters untouched', () => {
    expect(mapToDigits('project-42')).toBe('049733542');
  });

  it('ignores punctuation and whitespace', () => {
    expect(mapToDigits('Nuxt!＠#$%^&*()')).toBe('6725');
  });
});

describe('utils: mapToPort', () => {
  it('supports padding-zero for short inputs', () => {
    // 'air' -> 184
    // paddingZero: true (default) -> 1840, 18400
    // 1840 is valid (> 1024)
    const result = mapToPort('air', DEFAULT_MAP, { preferDigitCount: 4, paddingZero: true });
    expect(result.digits).toBe('184');
    expect(result.port).toBe(1840);

    // paddingZero: false -> 184 -> null (too small)
    const result2 = mapToPort('air', DEFAULT_MAP, { preferDigitCount: 4, paddingZero: false });
    expect(result2.digits).toBe('184');
    expect(result2.port).toBe(null);
  });

  it('picks a valid port under 65535', () => {
    const { port } = mapToPort('cfetch');
    expect(port).toBe(3435);
  });

  it('avoids blocked ports when possible and tries fallbacks', () => {
    // 3000 is blocked by option.
    // 1234 is valid (> 1023).
    // Input '30001234'
    // Candidates: '3000', '1234', '30001234' (too large)
    // Actually pickPortFromDigits splits by preferDigitCount (default 4).
    // '30001234' -> '3000', '1234'.
    const result = pickPortFromDigits('30001234', { blockedPorts: new Set([3000]) });
    expect(result.port).toBe(1234);
    expect(result.rejectedCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ candidate: '3000', reason: 'Port 3000 is blocked' }),
      ])
    );
  });

  it('returns null when no candidate port is valid', () => {
    const result1 = pickPortFromDigits('000');
    expect(result1.port).toBe(null);
    expect(result1.reason).toBe('No valid port could be generated from input');
    
    const result2 = pickPortFromDigits('');
    expect(result2.port).toBe(null);
    expect(result2.reason).toBe('No digits found in input');
  });
});

describe('parseUserMap', () => {
  it('consumes valid JSON', () => {
    const mapString = '{\"1\": \"qaz\", \"2\": \"wsx\", \"0\": \"p\"}';
    expect(parseUserMap(mapString)).toEqual({
      '1': 'qaz',
      '2': 'wsx',
      '0': 'p',
    });
  });

  it('consumes JS-like object literal', () => {
    expect(parseUserMap("{ 1: 'qaz', 0: 'p' }")).toEqual({
      '1': 'qaz',
      '0': 'p',
    });
  });

  it('throws for invalid formats', () => {
    expect(() => parseUserMap('abc')).toThrow();
    expect(() => parseUserMap('')).toThrow();
  });

  it('throws for non-digit keys', () => {
    expect(() => parseUserMap('{"z": "abc"}')).toThrow('Keys must be digits, values must be mapped letters');
    expect(() => parseUserMap('{"a": "xyz"}')).toThrow('Keys must be digits, values must be mapped letters');
  });
});

describe('many words mapping test (with detailed errors)', () => {
  it('maps many words correctly', () => {
    const testCases = [
      { input: 'x', digits: '2', port: 2000 },
      { input: 'ab', digits: '15', port: 1500 }, 
      { input: 'abc', digits: '153', port: 1530 }, 
      { input: 'cfetch', digits: '343536', port: 3435 },
      { input: 'prove', digits: '04943', port: 4943 },
      { input: 'd000', digits: '3000', port: null }, // 3000 blocked
      { input: 'my-app-01', digits: '7610001', port: 7610 },
      { input: '…*1—342', digits: '1342', port: 1342 },
      { input: 'nuxt-ui', digits: '672578', port: 6725 },
      { input: 'greate', digits: '543153', port: 5431 },
      { input: '_push', digits: '0726', port: 7260 },
    ];

    testCases.forEach(({ input, digits, port }) => {
      const result = mapToPort(input);
      expect(result.digits).toBe(digits);
      expect(result.port).toBe(port);
    });
  });

  it('respects preferDigitCount option', () => {
    const result4 = mapToPort('013344', DEFAULT_MAP, { preferDigitCount: 4 });
    expect(result4.port).toBe(1334);

    const result5 = mapToPort('013344', DEFAULT_MAP, { preferDigitCount: 5 });
    expect(result5.port).toBe(13344);
  });
});
