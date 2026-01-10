'use strict';

import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

function getConfigPath(pathModule, osModule, env) {
  const home = (env && (env.PORTKEY_HOME || env.HOME)) || (osModule && osModule.homedir && osModule.homedir());
  if (!home) return null;
  const pathToUse = pathModule || path;
  const newPath = pathToUse.join(home, '.port-key', 'config.json');
  const oldPath = pathToUse.join(home, '.portkey', 'config.json');
  try {
    if (fs.existsSync(newPath)) return newPath;
    return oldPath;
  } catch {
    return oldPath;
  }
}

function loadUserConfigSync(deps = {}) {
  const fsModule = deps.fs || fs;
  const osModule = deps.os || os;
  const pathModule = deps.path || path;
  const env = deps.env || process.env;

  const configPath = getConfigPath(pathModule, osModule, env);
  if (!configPath) return { path: null, config: {}, configReadError: false, configExists: false };

  try {
    if (!fsModule.existsSync(configPath)) return { path: configPath, config: {}, configReadError: false, configExists: false };
    const raw = fsModule.readFileSync(configPath, 'utf8');
    if (!String(raw || '').trim()) return { path: configPath, config: {}, configReadError: false, configExists: true };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { path: configPath, config: {}, configReadError: true, configExists: true };
    }
    return { path: configPath, config: parsed, configReadError: false, configExists: true };
  } catch {
    return { path: configPath, config: {}, configReadError: true, configExists: true };
  }
}

function mergeConfig(base, override) {
  const a = base && typeof base === 'object' ? base : {};
  const b = override && typeof override === 'object' ? override : {};

  return {
    ...a,
    ...b,
    map: b.map ?? a.map,
    blockedPorts: b.blockedPorts ?? a.blockedPorts,
    minPort: b.minPort ?? a.minPort,
    maxPort: b.maxPort ?? a.maxPort,
    preferredRanges: b.preferredRanges ?? a.preferredRanges,
    preferDigitCount: b.preferDigitCount ?? a.preferDigitCount,
    lang: b.lang ?? a.lang,
  };
}

function getPortKeyDirPath(deps = {}) {
  const osModule = deps.os || os;
  const pathModule = deps.path || path;
  const env = deps.env || process.env;

  const home = (env && (env.PORTKEY_HOME || env.HOME)) || (osModule && osModule.homedir && osModule.homedir());
  if (!home) return null;

  const pathToUse = pathModule || path;
  return pathToUse.join(home, '.port-key');
}

function getLogPath(deps = {}) {
  const portKeyDir = getPortKeyDirPath(deps);
  if (!portKeyDir) return null;
  const pathModule = deps.path || path;
  return pathModule.join(portKeyDir, 'log.json');
}

function loadRunCount(deps = {}) {
  const fsModule = deps.fs || fs;
  const logPath = getLogPath(deps);
  if (!logPath) return { count: 0, isFirstRun: true, logPath: null };

  try {
    if (!fsModule.existsSync(logPath)) {
      return { count: 0, isFirstRun: true, logPath };
    }
    const raw = fsModule.readFileSync(logPath, 'utf8');
    const parsed = JSON.parse(raw);
    const count = typeof parsed?.count === 'number' ? parsed.count : 0;
    return { count, isFirstRun: count === 0, logPath };
  } catch {
    return { count: 0, isFirstRun: true, logPath };
  }
}

function incrementRunCount(deps = {}) {
  const fsModule = deps.fs || fs;
  const pathModule = deps.path || path;
  const logPath = getLogPath(deps);
  const portKeyDir = getPortKeyDirPath(deps);

  if (!logPath || !portKeyDir) return;

  try {
    if (!fsModule.existsSync(portKeyDir)) {
      fsModule.mkdirSync(portKeyDir, { recursive: true });
    }

    let count = 0;
    if (fsModule.existsSync(logPath)) {
      const raw = fsModule.readFileSync(logPath, 'utf8');
      const parsed = JSON.parse(raw);
      count = typeof parsed?.count === 'number' ? parsed.count : 0;
    }

    count += 1;
    fsModule.writeFileSync(logPath, JSON.stringify({ count }, null, 2), 'utf8');
  } catch {
  }
}

export {
  getConfigPath,
  loadUserConfigSync,
  mergeConfig,
  getPortKeyDirPath,
  getLogPath,
  loadRunCount,
  incrementRunCount,
};
