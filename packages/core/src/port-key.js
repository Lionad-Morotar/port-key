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
  // well-known application ports (system ports 0-1023 are blocked by range rule)
  new Set([
    1234, // common placeholder / dev port
    1420, // Tauri dev default
    3000, // common dev port (React/Next/Express)
    3001, // common dev port
    3306, // MySQL
    4200, // Angular dev server
    5000, // macOS AirPlay / Flask
    5037, // ADB server (Android)
    5173, // Vite default
    5432, // PostgreSQL
    5555, // Prisma Studio / ADB
    5900, // VNC / Screen Sharing
    6006, // Storybook
    6379, // Redis
    7000, // macOS AirPlay
    8000, // common dev port (Django/uvicorn)
    8080, // alternative HTTP / proxies
    8081, // common HTTP alternative
    8888, // Jupyter Notebook
    9000, // common dev / PHP-FPM
    9229, // Node.js debugger
    11434, // Ollama (local LLMs)
    19000, // Expo
    27017, // MongoDB
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
  const hasLetter = /[a-z]/.test(input);

  let out = '';
  for (const ch of input) {
    if (ch >= '0' && ch <= '9') {
      if (!hasLetter) out += ch;
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
  // System Ports (0-1023) are assigned by IETF and should not be used.
  if (port < 1024) return true;
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

  const minPort = Number.isFinite(options.minPort) ? options.minPort : 0;
  const maxPort = Number.isFinite(options.maxPort) ? options.maxPort : 65535;
  const blockedPorts = options.blockedPorts || DEFAULT_BLOCKED_PORTS;
  // 位数仅接受 2~5 的整数，其余一律回退默认 4 位，避免 1 位端口或小数窗口等无意义结果
  const preferDigitCount =
    Number.isInteger(options.preferDigitCount) && options.preferDigitCount >= 2 && options.preferDigitCount <= 5
      ? options.preferDigitCount
      : 4;
  const padToPreferredDigits =
    options.padToPreferredDigits === undefined ? options.paddingZero !== false : Boolean(options.padToPreferredDigits);

  const candidates = [];
  const normalized = raw.replace(/^0+/, '');

  if (normalized.length >= preferDigitCount) {
    for (let i = 0; i <= normalized.length - preferDigitCount; i += 1) {
      candidates.push(normalized.slice(i, i + preferDigitCount));
    }
  } else if (padToPreferredDigits && normalized.length > 0) {
    candidates.push(normalized.padEnd(preferDigitCount, '0'));
  } else if (normalized.length >= 2) {
    candidates.push(normalized);
  }

  const unique = Array.from(new Set(candidates));
  const rejectedCandidates = [];
  
  for (const c of unique) {
    if (c.length > 1 && c.startsWith('0')) {
      rejectedCandidates.push({ candidate: c, reason: 'Leading zero is not allowed' });
      continue;
    }
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

  if (preferDigitCount === 5) {
    const fallback = pickPortFromDigits(raw, { ...options, preferDigitCount: 4 });
    if (fallback && fallback.port !== null) {
      return {
        port: fallback.port,
        rejectedCandidates: rejectedCandidates.concat(fallback.rejectedCandidates || []),
      };
    }
    return {
      port: null,
      reason: fallback.reason || 'No valid port could be generated from input',
      rejectedCandidates: rejectedCandidates.concat(fallback.rejectedCandidates || []),
    };
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
  isPortBlocked,
  pickPortFromDigits,
  mapToPort,
  parseUserMap,
};
