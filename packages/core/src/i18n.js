'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUPPORTED = new Set(['en', 'cn']);
let cache = {};

function getLangOrDefault(lang) {
  const l = String(lang || '').toLowerCase();
  return SUPPORTED.has(l) ? l : 'cn';
}

function loadMessages(lang = 'cn', deps = {}) {
  const l = getLangOrDefault(lang);
  if (cache[l]) return cache[l];
  const fsModule = deps.fs || fs;
  const pathModule = deps.path || path;
  // 用 fileURLToPath 取得真实文件路径，避免手工剥离 file:// 前缀在 Windows 上得到 /C:/... 这类非法路径
  const moduleDir = pathModule.dirname(fileURLToPath(import.meta.url));
  const file = pathModule.join(pathModule.dirname(moduleDir), 'locales', `${l}.json`);
  const raw = fsModule.readFileSync(file, 'utf8');
  const json = JSON.parse(raw);
  cache[l] = json;
  return json;
}

export { getLangOrDefault, loadMessages };
