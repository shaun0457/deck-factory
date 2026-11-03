#!/usr/bin/env node
// Check rendered open-slide pages for layout problems, through the Chrome
// DevTools Protocol (Node 22+ for the global WebSocket).
//
//   node check-layout.mjs --slide <id> --pages 1-8 [--base http://localhost:5173] [--json]
//
// Reports, per page:
//   outside-canvas  text that runs past the 1920×1080 canvas
//   overflow        a box whose content is taller or wider than the box
//   text-overlap    two pieces of text drawn on top of each other
// Exit code 1 when any page has an issue. Screenshots are still the final check:
// this catches the common mistakes, not bad taste.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertReachable, findBrowser, killTree, parseArgs, parsePages, previewUrl, removeProfile, requireStrings } from './lib/browser.mjs';

const args = parseArgs(process.argv.slice(2));
requireStrings(args, ['slide', 'pages'], 'check-layout.mjs --slide <id> --pages 1-8 [--base http://localhost:5173] [--json]');
const base = typeof args.base === 'string' ? args.base : 'http://localhost:5173';
const pages = parsePages(args.pages);

// Runs inside the page. Returns { issues: [...] } or { error }.
const PROBE = `(async () => {
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 1500));
  const canvas = [...document.querySelectorAll('body *')].find((e) => e.offsetWidth === 1920 && e.offsetHeight === 1080);
  if (!canvas) return { error: 'no 1920x1080 canvas element found' };
  const R = canvas.getBoundingClientRect();
  const s = R.width / 1920;
  const box = (r) => ({ x: Math.round((r.left - R.left) / s), y: Math.round((r.top - R.top) / s), w: Math.round(r.width / s), h: Math.round(r.height / s) });
  const issues = [];
  const runs = [];
  const walker = document.createTreeWalker(canvas, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || getComputedStyle(el).visibility === 'hidden') continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      runs.push({ text: text.slice(0, 40), el, b: box(r) });
    }
  }
  for (const run of runs) {
    const b = run.b;
    if (b.x < -2 || b.y < -2 || b.x + b.w > 1922 || b.y + b.h > 1082) issues.push({ type: 'outside-canvas', text: run.text, box: b });
  }
  const seen = new Set();
  for (const el of canvas.querySelectorAll('*')) {
    if (el instanceof SVGElement || el.clientHeight === 0) continue;
    const tall = el.scrollHeight - el.clientHeight;
    const wide = el.scrollWidth - el.clientWidth;
    // Glyph ascenders poke a few px past tight line-heights; only report real spill.
    if (tall / s > 8 || wide / s > 8) {
      const label = (el.textContent || '').trim().slice(0, 40);
      const b = box(el.getBoundingClientRect());
      const key = label + JSON.stringify(b);
      if (label && !seen.has(key)) {
        seen.add(key);
        issues.push({ type: 'overflow', text: label, by: { height: Math.round(tall / s), width: Math.round(wide / s) }, box: b });
      }
    }
  }
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const a = runs[i], c = runs[j];
      if (a.el === c.el || a.el.contains(c.el) || c.el.contains(a.el)) continue;
      const w = Math.min(a.b.x + a.b.w, c.b.x + c.b.w) - Math.max(a.b.x, c.b.x);
      const h = Math.min(a.b.y + a.b.h, c.b.y + c.b.h) - Math.max(a.b.y, c.b.y);
      if (w > 4 && h > 4) issues.push({ type: 'text-overlap', text: a.text + ' <> ' + c.text, box: a.b });
    }
  }
  return { issues };
})()`;

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.waiting = new Map();
    this.listeners = [];
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.waiting.has(msg.id)) {
        const { resolve, reject } = this.waiting.get(msg.id);
        this.waiting.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        for (const l of this.listeners) l(msg);
      }
    };
  }
  open() {
    const opened = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = () => reject(new Error('CDP websocket failed'));
      this.ws.onclose = () => reject(new Error('CDP websocket closed before opening'));
    });
    return withTimeout(opened, 10_000, 'CDP websocket did not open within 10 s');
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return withTimeout(
      new Promise((resolve, reject) => this.waiting.set(id, { resolve, reject })),
      30_000,
      `CDP ${method} timed out`,
    );
  }
  once(method) {
    return new Promise((resolve) => {
      const l = (msg) => {
        if (msg.method === method) {
          this.listeners = this.listeners.filter((x) => x !== l);
          resolve(msg.params);
        }
      };
      this.listeners.push(l);
    });
  }
  close() {
    this.ws.close();
  }
}

function withTimeout(promise, ms, message) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => (timer = setTimeout(() => reject(new Error(message)), ms)))]).finally(() =>
    clearTimeout(timer),
  );
}

async function waitForPort(profile) {
  const file = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100; i++) {
    if (existsSync(file)) {
      const port = readFileSync(file, 'utf8').split('\n')[0].trim();
      if (port) return port;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('browser did not open a DevTools port within 10 s');
}

const executable = findBrowser();
await assertReachable(base);
const profile = mkdtempSync(join(tmpdir(), 'deck-layout-'));
const browser = spawn(executable, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--window-size=1920,1080', 'about:blank'], {
  stdio: 'ignore',
});

let failed = false;
let cdp;
try {
  const port = await waitForPort(profile);
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT', signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`DevTools /json/new returned HTTP ${res.status}`);
  const target = await res.json();
  if (!target.webSocketDebuggerUrl) throw new Error('DevTools target has no webSocketDebuggerUrl');
  cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send('Page.enable');
  const report = [];
  for (const p of pages) {
    const loaded = cdp.once('Page.loadEventFired');
    await cdp.send('Page.navigate', { url: previewUrl(base, args.slide, p) });
    await withTimeout(loaded, 30_000, `page ${p} did not load`);
    const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', { expression: PROBE, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw new Error(`probe failed on page ${p}: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
    const value = result.value ?? { error: 'probe returned nothing' };
    report.push({ page: p, ...value });
    if (value.error || value.issues.length) failed = true;
  }
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    for (const r of report) {
      if (r.error) console.log(`p${r.page}: ERROR ${r.error}`);
      else if (!r.issues.length) console.log(`p${r.page}: ok`);
      else for (const i of r.issues) console.log(`p${r.page}: ${i.type} ${JSON.stringify(i.box)} ${i.by ? JSON.stringify(i.by) + ' ' : ''}"${i.text}"`);
    }
  }
} catch (err) {
  console.error(`check-layout: ${err.message}`);
  failed = true;
} finally {
  // Close politely (ends renderer and gpu children too), then make sure, then clean up.
  const exited = browser.exitCode !== null ? Promise.resolve() : new Promise((r) => browser.once('exit', r));
  try {
    if (cdp) await withTimeout(cdp.send('Browser.close'), 3_000, 'Browser.close timed out');
  } catch {
    // fall through to the hard kill
  }
  cdp?.close();
  try {
    await withTimeout(exited, 5_000, 'browser did not exit');
  } catch {
    killTree(browser.pid);
  }
  removeProfile(profile);
}
process.exit(failed ? 1 : 0);
