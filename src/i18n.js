'use strict';

import fs from 'node:fs';
import path from 'node:path';

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
  const file = pathModule.join(pathModule.dirname(pathModule.dirname(import.meta.url.replace('file://', ''))), 'locales', `${l}.json`);
  const raw = fsModule.readFileSync(file, 'utf8');
  const json = JSON.parse(raw);
  cache[l] = json;
  return json;
}

export { getLangOrDefault, loadMessages };
