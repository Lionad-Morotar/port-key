'use strict';

import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

function getConfigPath(pathModule, osModule, env) {
  const home = (env && (env.PORTKEY_HOME || env.HOME)) || (osModule && osModule.homedir && osModule.homedir());
  if (!home) return null;
  const pathToUse = pathModule || path;
  return pathToUse.join(home, '.portkey', 'config.json');
}

function loadUserConfigSync(deps = {}) {
  const fsModule = deps.fs || fs;
  const osModule = deps.os || os;
  const pathModule = deps.path || path;
  const env = deps.env || process.env;

  const configPath = getConfigPath(pathModule, osModule, env);
  if (!configPath) return { path: null, config: {} };

  try {
    if (!fsModule.existsSync(configPath)) return { path: configPath, config: {} };
    const raw = fsModule.readFileSync(configPath, 'utf8');
    if (!String(raw || '').trim()) return { path: configPath, config: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { path: configPath, config: {} };
    }
    return { path: configPath, config: parsed };
  } catch {
    // Ignore config errors; CLI should still work.
    return { path: configPath, config: {} };
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

export {
  getConfigPath,
  loadUserConfigSync,
  mergeConfig,
};
