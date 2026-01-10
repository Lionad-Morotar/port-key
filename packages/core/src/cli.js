'use strict';

import { DEFAULT_MAP, mapToPort, parseUserMap } from './port-key.js';
import { loadUserConfigSync, mergeConfig, getPortKeyDirPath, loadRunCount, incrementRunCount } from './config.js';
import { getLangOrDefault, loadMessages } from './i18n.js';

function formatHelp(lang = 'cn') {
  const l = getLangOrDefault(lang);
  const t = loadMessages(l);
  return [
    t.helpTitle,
    '',
    t.usage,
    t.usageLine1,
    t.usageLine2,
    '',
    t.options,
    t.optMap,
    t.optLang,
    t.optDigits,
    t.optHelp,
    '',
    t.examples,
    t.ex1,
    t.ex2,
    t.ex3,
    '',
  ].join('\n');
}

function parseArgv(argv) {
  const args = Array.from(argv || []);

  let map = DEFAULT_MAP;
  let showHelp = false;
  let lang;
  let preferDigitCount;
  const positionals = [];

  let i = 0;
  while (i < args.length) {
    const token = args[i];

    if (token === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }

    if (token === '-h' || token === '--help') {
      showHelp = true;
      i += 1;
      continue;
    }

    if (token === '--lang') {
      const value = args[i + 1];
      if (!value) throw new Error('Missing value for --lang');
      lang = String(value);
      i += 2;
      continue;
    }

    if (token === '-m' || token === '--map') {
      const value = args[i + 1];
      if (!value) throw new Error('Missing value for -m/--map');
      map = parseUserMap(value);
      i += 2;
      continue;
    }

    if (token === '-d' || token === '--digits') {
      const value = args[i + 1];
      if (!value) throw new Error('Missing value for -d/--digits');
      const count = Number.parseInt(value, 10);
      if (count !== 4 && count !== 5) throw new Error('Invalid digit count. Must be 4 or 5.');
      preferDigitCount = count;
      i += 2;
      continue;
    }

    positionals.push(token);
    i += 1;
  }

  return {
    map,
    lang,
    showHelp,
    preferDigitCount,
    input: positionals.join(' '),
  };
}

function runCli(argv, stdout = process.stdout, stderr = process.stderr, deps = {}) {
  const { config, configReadError, path: configPath, configExists } = loadUserConfigSync(deps);
  const { isFirstRun } = loadRunCount(deps);

  if (configReadError && configPath) {
    const lang = getLangOrDefault((config && config.lang) || 'cn');
    const MSG = loadMessages(lang);
    stderr.write(MSG.configReadFailed.replace('{path}', configPath) + '\n');
  }

  if (isFirstRun && !configExists) {
    const lang = getLangOrDefault((config && config.lang) || 'cn');
    const MSG = loadMessages(lang);
    const portKeyDir = getPortKeyDirPath(deps);
    stderr.write(MSG.firstRunNoConfig.replace('{configDir}', portKeyDir || '~/.port-key').replace('{readmeUrl}', MSG.readmeConfigExampleLink) + '\n');
  }

  incrementRunCount(deps);

  let parsed;
  try {
    parsed = parseArgv(argv);
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    const lang = getLangOrDefault((config && config.lang) || 'cn');
    stderr.write(message + '\n');
    stderr.write('\n' + formatHelp(lang));
    return 1;
  }

  const effective = mergeConfig(config, {
    map: parsed.map !== DEFAULT_MAP ? parsed.map : undefined,
    lang: parsed.lang,
    preferDigitCount: parsed.preferDigitCount,
  });

  const lang = getLangOrDefault(effective.lang);
  const MSG = loadMessages(lang);

  if (parsed.lang && !['en', 'cn'].includes(parsed.lang)) {
    stderr.write(MSG.invalidLang + '\n');
    return 1;
  }

  if (parsed.showHelp) {
    stdout.write(formatHelp(lang));
    return 0;
  }

  if (!parsed.input || !String(parsed.input).trim()) {
    stderr.write(MSG.missingInput + '\n\n' + formatHelp(lang));
    return 1;
  }

  const result = mapToPort(parsed.input, effective.map || DEFAULT_MAP, {
    blockedPorts: effective.blockedPorts,
    minPort: effective.minPort,
    maxPort: effective.maxPort,
    preferredRanges: effective.preferredRanges,
    preferDigitCount: effective.preferDigitCount,
  });

  if (result.port === null) {
    stderr.write(MSG.noValidPort + '\n');
    if (result.rejectedCandidates && result.rejectedCandidates.length > 0) {
      stderr.write('Rejected candidates:\n');
      result.rejectedCandidates.forEach(({ candidate, reason }) => {
        stderr.write(`  ${candidate}: ${reason}\n`);
      });
    }
    return 1;
  }

  stdout.write(String(result.port) + '\n');
  return 0;
}

export {
  formatHelp,
  parseArgv,
  runCli,
};
