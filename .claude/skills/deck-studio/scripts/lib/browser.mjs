// Shared helpers: find a Chromium browser, parse arguments, stop the browser
// and remove its temp profile. Override the browser with
// DECK_BROWSER=<path to msedge/chrome executable>.

import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

const CANDIDATES = {
  win32: [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'],
};

export function findBrowser() {
  const override = process.env.DECK_BROWSER;
  if (override) {
    if (!existsSync(override)) throw new Error(`DECK_BROWSER does not exist: ${override}`);
    return override;
  }
  const hit = (CANDIDATES[process.platform] ?? []).find((p) => existsSync(p));
  if (!hit) throw new Error('no Chromium browser found; set DECK_BROWSER');
  return hit;
}

// "1-8,12" -> [1..8, 12]
export function parsePages(spec) {
  const pages = [];
  for (const part of String(spec).split(',')) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`bad page list: ${spec}`);
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (b < a || b - a > 200) throw new Error(`bad page range: ${part}`);
    for (let p = a; p <= b; p++) pages.push(p);
  }
  return pages;
}

// --key value pairs and bare --flags; everything else is positional.
// A value that starts with "--" is not taken as a value (the key becomes a flag).
export function splitArgs(argv) {
  const opts = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      positional.push(a);
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) opts[a.slice(2)] = true;
    else {
      opts[a.slice(2)] = next;
      i++;
    }
  }
  return { positional, opts };
}

export const parseArgs = (argv) => splitArgs(argv).opts;

// Fail with usage unless every key holds a string value.
export function requireStrings(opts, keys, usage) {
  const missing = keys.filter((k) => typeof opts[k] !== 'string' || opts[k] === '');
  if (missing.length) {
    console.error(`missing value for --${missing.join(', --')}\nusage: ${usage}`);
    process.exit(2);
  }
}

export const previewUrl = (base, slide, page) => `${base.replace(/\/$/, '')}/s/${slide}/preview?p=${page}`;

// Fail fast when the dev server is not up, instead of screenshotting an error page.
export async function assertReachable(base) {
  try {
    const res = await fetch(base, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`dev server not reachable at ${base}: ${err.message}`);
    process.exit(2);
  }
}

// Kill a browser and all its child processes (renderer, gpu, crashpad).
export function killTree(pid) {
  if (!pid) return;
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore', timeout: 10_000 });
    else process.kill(-pid, 'SIGKILL');
  } catch {
    // already gone
  }
}

// Remove a temp profile; a lingering lock only warns, it never changes the result.
export function removeProfile(dir) {
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch (err) {
    console.error(`warning: could not remove temp profile ${dir}: ${err.code ?? err.message}`);
  }
}
