#!/usr/bin/env node
// Assemble an open-slide deck from the deck-studio kit, or sync the kit blocks
// of an existing deck.
//
//   node new-deck.mjs --project <open-slide dir> --id <slide-id> --title "<title>" [--blank] [--force]
//   node new-deck.mjs --sync <path/to/index.tsx>
//
// open-slide wants one index.tsx per slide (no sibling component files), so the
// kit modules are pasted into the file between marker comments. --sync replaces
// those blocks with the current kit and leaves the deck section untouched.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, '..', 'assets', 'open-slide', 'kit');
const EXAMPLE = join(HERE, '..', 'assets', 'open-slide', 'example', 'pages.tsx');
const MODULES = ['header', 'base', 'map', 'cards'];

const marker = (name, edge) => `// ==== deck-studio:kit ${name} ${edge} ====`;

function block(name) {
  const body = readFileSync(join(KIT, `${name}.tsx`), 'utf8').replace(/\s+$/, '');
  return `${marker(name, 'start')}\n${body}\n${marker(name, 'end')}`;
}

const BLANK_PAGES = `// ---------- Deck: content for this talk ----------

const DECK = {
  name: '__TITLE__',
  byline: '設計說明 · 講者姓名',
  chapters: ['第一章', '第二章', '第三章'],
};

const Cover: Page = () => (
  <div style={root}>
    <div style={abs(GUTTER, 290, 1100)}>
      <Title>{DECK.name}</Title>
    </div>
  </div>
);

const First: Page = () => (
  <div style={root}>
    <PageHead eyebrow="第一章" size={MAIN_TITLE} at={0}>
      一句話結論
    </PageHead>
    <SoWhat>這一頁要留下的一句話。</SoWhat>
    <Footer />
  </div>
);

export const notes: (string | undefined)[] = [
  \`（約 10 秒）
開場。\`,
  \`（約 30 秒）
這一頁講什麼。\`,
];

export const meta: SlideMeta = {
  title: '__TITLE__',
  createdAt: '__CREATED_AT__',
  theme: 'fieldwork',
};

export default [Cover, First] satisfies Page[];
`;

function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out.flags.add(key);
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function fail(msg) {
  console.error(`new-deck: ${msg}`);
  process.exit(1);
}

const count = (src, s) => src.split(s).length - 1;

function sync(file) {
  if (!existsSync(file)) fail(`no such file: ${file}`);
  let src = readFileSync(file, 'utf8');
  const present = [];
  const missing = [];
  let lastEnd = -1;
  // Validate every block before touching the file, so a bad deck is never half-written.
  for (const name of MODULES) {
    const s = count(src, marker(name, 'start'));
    const e = count(src, marker(name, 'end'));
    if (s === 0 && e === 0) {
      missing.push(name);
      continue;
    }
    if (s !== 1 || e !== 1) fail(`kit ${name}: expected one start and one end marker, found ${s} and ${e} in ${file}`);
    const start = src.indexOf(marker(name, 'start'));
    const end = src.indexOf(marker(name, 'end'));
    if (end < start) fail(`kit ${name}: end marker comes before start in ${file}`);
    if (start < lastEnd) fail(`kit ${name}: block overlaps or is out of order in ${file}`);
    lastEnd = end;
    present.push(name);
  }
  if (present.length === 0) fail(`no deck-studio kit markers found in ${file}`);
  for (const name of present) {
    const endMark = marker(name, 'end');
    const start = src.indexOf(marker(name, 'start'));
    const end = src.indexOf(endMark);
    src = src.slice(0, start) + block(name) + src.slice(end + endMark.length);
  }
  writeFileSync(file, src);
  console.log(`synced kit blocks [${present.join(', ')}] into ${file}`);
  if (missing.length) {
    console.warn(`warning: no block for kit [${missing.join(', ')}] in ${file}; paste it in by hand if the deck needs it`);
  }
}

function create(args) {
  const project = args.project && resolve(args.project);
  const id = args.id;
  const title = args.title ?? id;
  if (!project || !id) fail('need --project <open-slide dir> and --id <slide-id>');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(`slide id must be kebab-case: ${id}`);
  if (!existsSync(join(project, 'open-slide.config.ts'))) fail(`not an open-slide project (no open-slide.config.ts): ${project}`);
  const dir = join(project, 'slides', id);
  const file = join(dir, 'index.tsx');
  if (existsSync(file) && !args.flags.has('force')) fail(`${file} exists; pass --force to overwrite or --sync to update the kit`);
  const pages = args.flags.has('blank') ? BLANK_PAGES : readFileSync(EXAMPLE, 'utf8');
  // __TITLE__ only appears inside single-quoted string literals; JSX reads DECK.name.
  // Function replacers keep "$&"-style patterns in the title literal.
  const escaped = title.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n');
  const created = new Date().toISOString();
  const body = [...MODULES.map(block), pages.replace(/\s+$/, '')]
    .join('\n\n')
    .replaceAll('__TITLE__', () => escaped)
    .replaceAll('__CREATED_AT__', () => created);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, `${body}\n`);
  console.log(`created ${file}`);
}

const args = parseArgs(process.argv.slice(2));
if (args.flags.has('sync')) fail('--sync needs a path to an index.tsx');
if (args.sync) sync(resolve(args.sync));
else create(args);
