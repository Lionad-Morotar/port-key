'use strict';

const DEFAULT_MAP = Object.freeze({
  1: 'qaz',
  2: 'wsx',
  3: 'edc',
  4: 'rfv',
  5: 'tgb',
  6: 'yhn',
  7: 'ujm',
  8: 'ik',
  9: 'ol',
  0: 'p',
});

const DEFAULT_BLOCKED_PORTS = Object.freeze(
  new Set([
    0,
    20,
    21,
    22,
    23,
    25,
    53,
    67,
    68,
    80,
    110,
    123,
    143,
    161,
    162,
    389,
    443,
    445,
    465,
    587,
    636,
    993,
    995,
    3000,
    3001,
    5000,
    5173,
    5432,
    6379,
    8080,
    8081,
    9000,
    27017,
    3306,
    1234,
  ])
);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function buildReverseMap(map) {
  const reverse = new Map();

  for (const [digitKey, lettersRaw] of Object.entries(map)) {
    const digit = String(digitKey);
    if (!/^[0-9]$/.test(digit)) continue;

    const letters = String(lettersRaw || '').toLowerCase();
    for (const ch of letters) {
      if (ch < 'a' || ch > 'z') continue;
      reverse.set(ch, digit);
    }
  }

  return reverse;
}

function normalizeInput(text) {
  return String(text || '')
    .toLowerCase()
    .split('')
    .filter((ch) => (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9'))
    .join('');
}

function mapToDigits(text, map = DEFAULT_MAP) {
  const reverse = buildReverseMap(map);
  const input = normalizeInput(text);

  let out = '';
  for (const ch of input) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
      continue;
    }

    const digit = reverse.get(ch);
    if (digit) out += digit;
  }

  return out;
}

function isValidPort(port) {
  return Number.isInteger(port) && port >= 0 && port <= 65535;
}

function isPortBlocked(port, blockedPorts) {
  if (blockedPorts && typeof blockedPorts.has === 'function') {
    return blockedPorts.has(port);
  }
  if (Array.isArray(blockedPorts)) {
    return blockedPorts.includes(port);
  }
  return false;
}

function pickPortFromDigits(digits, options = {}) {
  const raw = String(digits || '').replace(/[^0-9]/g, '');
  if (!raw) return { port: null, reason: 'No digits found in input' };
  if (raw.length < 2) return { port: null, reason: 'Not enough digits to form a candidate' };

  const minPort = Number.isFinite(options.minPort) ? options.minPort : 0;
  const maxPort = Number.isFinite(options.maxPort) ? options.maxPort : 65535;
  const blockedPorts = options.blockedPorts || DEFAULT_BLOCKED_PORTS;
  const preferDigitCount = options.preferDigitCount || 4;

  const candidates = [];
  const normalized = raw.replace(/^0+/, '');
  if (preferDigitCount && normalized.length >= preferDigitCount) {
    candidates.push(normalized.slice(0, preferDigitCount));
    candidates.push(normalized.slice(normalized.length - preferDigitCount));
  } else {
    for (let len = Math.min(normalized.length, preferDigitCount); len >= 2; len -= 1) {
      candidates.push(normalized.slice(0, len));
    }
    for (let len = Math.min(normalized.length, preferDigitCount); len >= 2; len -= 1) {
      candidates.push(normalized.slice(normalized.length - len));
    }
  }

  const unique = Array.from(new Set(candidates));
  const rejectedCandidates = [];
  
  for (const c of unique) {
    const port = Number.parseInt(c, 10);
    if (!isValidPort(port)) {
      rejectedCandidates.push({ candidate: c, reason: 'Invalid port number' });
      continue;
    }
    if (port < minPort || port > maxPort) {
      rejectedCandidates.push({ candidate: c, reason: `Port ${port} out of range [${minPort}, ${maxPort}]` });
      continue;
    }
    if (isPortBlocked(port, blockedPorts)) {
      rejectedCandidates.push({ candidate: c, reason: `Port ${port} is blocked` });
      continue;
    }
    return { port, rejectedCandidates };
  }

  return { 
    port: null, 
    reason: 'No valid port could be generated from input',
    rejectedCandidates 
  };
}

function mapToPort(text, map = DEFAULT_MAP, options = {}) {
  const digits = mapToDigits(text, map);
  const result = pickPortFromDigits(digits, options);
  return { digits, port: result.port, rejectedCandidates: result.rejectedCandidates, reason: result.reason };
}

function parseUserMap(mapString) {
  const raw = String(mapString || '').trim();
  if (!raw) throw new Error('Empty map string');

  try {
    const maybe = JSON.parse(raw);
    if (!isPlainObject(maybe)) throw new Error('Map must be an object');

    const cleaned = {};
    for (const [k, v] of Object.entries(maybe)) {
      const key = String(k);
      if (!/^[0-9]$/.test(key)) {
        throw new Error('Keys must be digits, values must be mapped letters');
      }
      cleaned[key] = String(v || '').toLowerCase();
    }

    if (Object.keys(cleaned).length === 0) throw new Error('Map object is empty');
    return cleaned;
  } catch (err) {
    if (err.message === 'Keys must be digits, values must be mapped letters') {
      throw err;
    }
  }

  const extracted = {};
  const re = /([0-9])\s*:\s*(['"])(.*?)\2/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    const digit = match[1];
    const letters = String(match[3] || '').toLowerCase();
    extracted[digit] = letters;
  }

  if (Object.keys(extracted).length === 0) {
    throw new Error('Invalid map format. Expected JSON or { 1: \'qaz\', ... }');
  }

  return extracted;
}

export {
  DEFAULT_MAP,
  DEFAULT_BLOCKED_PORTS,
  buildReverseMap,
  normalizeInput,
  mapToDigits,
  isValidPort,
  pickPortFromDigits,
  mapToPort,
  parseUserMap,
};
