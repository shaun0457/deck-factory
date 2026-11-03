#!/usr/bin/env node
// Screenshot open-slide pages with a headless Chromium browser (all Steps shown).
//
//   node shoot.mjs --slide <id> --pages 1-8 --out <dir> [--base http://localhost:5173]
//
// Needs the open-slide dev server running. Writes <out>/<slide>-pNN.png.

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { assertReachable, findBrowser, parseArgs, parsePages, previewUrl, removeProfile, requireStrings } from './lib/browser.mjs';

const USAGE = 'shoot.mjs --slide <id> --pages 1-8 --out <dir> [--base http://localhost:5173]';
const args = parseArgs(process.argv.slice(2));
requireStrings(args, ['slide', 'pages', 'out'], USAGE);
const base = typeof args.base === 'string' ? args.base : 'http://localhost:5173';
const pages = parsePages(args.pages);
const out = resolve(args.out);
const browser = findBrowser();
await assertReachable(base);
mkdirSync(out, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'deck-shoot-'));

let failed = false;
try {
  for (const p of pages) {
    const file = join(out, `${args.slide}-p${String(p).padStart(2, '0')}.png`);
    try {
      execFileSync(
        browser,
        [
          '--headless=new',
          '--disable-gpu',
          '--hide-scrollbars',
          `--user-data-dir=${profile}`,
          '--window-size=1920,1080',
          '--virtual-time-budget=8000',
          `--screenshot=${file}`,
          previewUrl(base, args.slide, p),
        ],
        { stdio: 'ignore', timeout: 60_000 },
      );
      console.log(file);
    } catch (err) {
      console.error(`page ${p}: screenshot failed (${err.code ?? err.signal ?? err.message})`);
      failed = true;
    }
  }
} finally {
  removeProfile(profile);
}
process.exit(failed ? 1 : 0);
