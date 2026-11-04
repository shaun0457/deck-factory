#!/usr/bin/env node
// Static checks on an open-slide deck file (no browser needed).
//
//   node lint-deck.mjs <slides/<id>/index.tsx> [--config <lint.config.json>]
//                      [--notes <name> --pages <name>]
//
// By default the notes are `export const notes = [...]` and the pages are
// `export default [...]`. --notes / --pages name other exported arrays instead
// (`export const <name> = [...]`), e.g. the backup arrays another deck re-exports.
//
// Checks:
//   1. banned phrases (config "banned") anywhere in the file: slides and notes
//   2. notes entries == pages in the default export
//   3. talk time: sums the leading "（約 N 秒）" / "（約 N 分鐘）" marker of each note
//      until the first note that starts with "（備用"; compares to config
//      "targetSeconds" (fails when more than 15 % over)
// Exit code 1 on a banned phrase, a count mismatch, time over target, or when a
// check could not run (no notes array, unreadable default export).

import { readFileSync } from 'node:fs';
import { splitArgs } from './lib/browser.mjs';

const { positional, opts } = splitArgs(process.argv.slice(2));
const file = positional[0];
if (!file) {
  console.error('usage: lint-deck.mjs <index.tsx> [--config lint.config.json] [--notes <name> --pages <name>]');
  process.exit(2);
}
const src = readFileSync(file, 'utf8');
const config = typeof opts.config === 'string' ? JSON.parse(readFileSync(opts.config, 'utf8')) : {};
let failed = false;

// 1. Banned phrases.
const lines = src.split(/\r?\n/);
for (const phrase of config.banned ?? []) {
  lines.forEach((line, i) => {
    if (line.includes(phrase)) {
      console.log(`banned  ${file}:${i + 1}  "${phrase}"`);
      failed = true;
    }
  });
}

// Split the array literal that opens at `open` into its top-level entries,
// skipping strings, template literals (with nested ${...}), and comments.
function splitArray(text, open) {
  const entries = [];
  let depth = 0;
  let start = open + 1;
  const skipString = (i, q) => {
    for (let j = i + 1; j < text.length; j++) {
      if (text[j] === '\\') j++;
      else if (text[j] === q) return j;
    }
    return text.length;
  };
  const skipTemplate = (i) => {
    for (let j = i + 1; j < text.length; j++) {
      if (text[j] === '\\') j++;
      else if (text[j] === '`') return j;
      else if (text[j] === '$' && text[j + 1] === '{') j = skipCode(j + 2, '}');
    }
    return text.length;
  };
  // Skip code until the matching closer, honouring nesting; returns its index.
  function skipCode(i, closer) {
    let d = 0;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (ch === '/' && text[j + 1] === '/') j = text.indexOf('\n', j) < 0 ? text.length : text.indexOf('\n', j);
      else if (ch === '/' && text[j + 1] === '*') j = text.indexOf('*/', j + 2) < 0 ? text.length : text.indexOf('*/', j + 2) + 1;
      else if (ch === "'" || ch === '"') j = skipString(j, ch);
      else if (ch === '`') j = skipTemplate(j);
      else if ('([{'.includes(ch)) d++;
      else if (')]}'.includes(ch)) {
        if (d === 0 && ch === closer) return j;
        d--;
      }
    }
    return text.length;
  }
  for (let i = open + 1; i < text.length; i++) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') i = text.indexOf('\n', i) < 0 ? text.length : text.indexOf('\n', i);
    else if (ch === '/' && text[i + 1] === '*') i = text.indexOf('*/', i + 2) < 0 ? text.length : text.indexOf('*/', i + 2) + 1;
    else if (ch === "'" || ch === '"') i = skipString(i, ch);
    else if (ch === '`') i = skipTemplate(i);
    else if ('([{'.includes(ch)) depth++;
    else if (')}'.includes(ch)) depth--;
    else if (ch === ']') {
      if (depth === 0) {
        entries.push(text.slice(start, i));
        return entries.map(stripComments).filter((e) => e.trim() !== '');
      }
      depth--;
    } else if (ch === ',' && depth === 0) {
      entries.push(text.slice(start, i));
      start = i + 1;
    }
  }
  return null;
}

// Drop leading comments such as "// 03 Overview" so an entry starts at its value.
function stripComments(s) {
  let t = s;
  for (;;) {
    const u = t.replace(/^\s*\/\/[^\n]*(\n|$)/, '').replace(/^\s*\/\*[\s\S]*?\*\//, '');
    if (u === t) return t;
    t = u;
  }
}

function arrayAfter(text, anchor) {
  const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hit = new RegExp(`${escaped}(?![\\w$])`).exec(text);
  const at = hit ? hit.index : -1;
  if (at < 0) return null;
  let from = at + anchor.length;
  // Skip a type annotation such as `: (string | undefined)[]`; the array starts after `=`.
  if (/^\s*:/.test(text.slice(from, from + 40))) {
    const eq = text.indexOf('=', from);
    if (eq < 0) return null;
    from = eq + 1;
  }
  const open = text.indexOf('[', from);
  return open < 0 ? null : splitArray(text, open);
}

// 2. Notes vs pages.
const IDENT = /^[A-Za-z_$][\w$]*$/;
for (const key of ['notes', 'pages']) {
  if (opts[key] !== undefined && (typeof opts[key] !== 'string' || !IDENT.test(opts[key]))) {
    console.error(`lint-deck: --${key} needs an exported array name`);
    process.exit(2);
  }
}
// The anchor ends at a word boundary so `notes` does not match `notesExtra`.
const notesAnchor = opts.notes ? `export const ${opts.notes}` : 'export const notes';
const pagesAnchor = opts.pages ? `export const ${opts.pages}` : 'export default';
const notes = arrayAfter(src, notesAnchor);
const pages = arrayAfter(src, pagesAnchor);
const noteText = (n) => n.trim().replace(/^[`'"]/, '');
if (!notes) {
  console.log(`notes   could not read \`${notesAnchor} = [...]\``);
  failed = true;
} else if (!pages) {
  console.log(`notes   could not read \`${pagesAnchor} [...]\``);
  failed = true;
} else {
  const names = pages.map((p) => p.trim());
  if (notes.length !== names.length) {
    console.log(`notes   ${notes.length} notes for ${names.length} pages; they are index-aligned`);
    failed = true;
  } else {
    const empty = names.filter((_, i) => /^(undefined|''|""|``)$/.test(notes[i].trim()));
    if (empty.length) console.log(`notes   no speaker notes for: ${empty.join(', ')}`);
  }

  // 3. Talk time from the leading markers.
  let total = 0;
  const rows = [];
  for (let i = 0; i < notes.length; i++) {
    const n = noteText(notes[i]);
    if (n.trimStart().startsWith('（備用')) break;
    const m = n.match(/^\s*（約\s*(\d+(?:\.\d+)?)\s*(秒|分鐘|分)/);
    const sec = m ? Math.round(Number(m[1]) * (m[2] === '秒' ? 1 : 60)) : 0;
    total += sec;
    rows.push(`${String(i + 1).padStart(2, '0')} ${names[i] ?? '?'}: ${m ? `${sec} s` : 'no leading （約 N 秒） marker'}`);
  }
  console.log(rows.map((r) => `time    ${r}`).join('\n'));
  const mmss = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  if (config.targetSeconds) {
    const over = total > config.targetSeconds * 1.15;
    console.log(`time    main talk ${mmss} (target ${config.targetSeconds} s${over ? ', OVER by more than 15 %' : ''})`);
    if (over) failed = true;
  } else console.log(`time    main talk ${mmss}`);
}

if (!failed) console.log('lint-deck: ok');
process.exit(failed ? 1 : 0);
