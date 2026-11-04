// Run the deck-studio lint-deck check on every deck under slides/.
//
//   node scripts/lint-decks.mjs        (any cwd; paths resolve from the repo root)
//
// Config for slides/<id>: plan/<id>/lint.config.json, else the same with the
// last "-segment" removed once (talk-b -> plan/talk/).
// No config: lint-deck still checks notes vs pages, but not banned phrases or
// talk time; the log line says "(no config)".
//
// A deck that only re-exports another deck's arrays, e.g.
//   import { backupNotes, backupPages } from '../talk/index';
//   export const notes = backupNotes;
//   export default backupPages;
// is checked against those source arrays (lint-deck --notes/--pages).
// Every other deck goes to lint-deck as written, so a notes form the script does
// not recognise fails loudly instead of being skipped.
// Exit code 1 when any deck fails, a re-export cannot be resolved, or no deck exists.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LINT = join(ROOT, '.claude/skills/deck-studio/scripts/lint-deck.mjs');
const LINT_TIMEOUT_MS = 60_000;

const NOTES_ALIAS = /^export const notes\s*=\s*([A-Za-z_$][\w$]*)\s*;?\s*$/m;
const PAGES_ALIAS = /^export default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/m;
const NAMED_IMPORT = /import\s*(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;

const rel = (p) => relative(ROOT, p).split('\\').join('/');

function findConfig(id) {
  const names = [id];
  const cut = id.lastIndexOf('-');
  if (cut > 0) names.push(id.slice(0, cut));
  for (const name of names) {
    const candidate = join(ROOT, 'plan', name, 'lint.config.json');
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

// Local name -> { module, exported name } for every `import { a as b } from '...'`.
function namedImports(src) {
  const map = new Map();
  for (const m of src.matchAll(NAMED_IMPORT)) {
    for (const part of m[1].split(',')) {
      const [exported, local = exported] = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (exported) map.set(local.trim(), { module: m[2], name: exported.trim() });
    }
  }
  return map;
}

// Relative specifier -> an existing file, trying the extensions TS/Vite would.
function resolveModule(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = resolve(dirname(fromFile), spec);
  const isFile = (p) => existsSync(p) && statSync(p).isFile();
  return [base, `${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')].find(isFile) ?? null;
}

// Returns { file, args } to lint, or { error } when a re-export cannot be followed.
function lintTarget(file, src) {
  const notesAlias = NOTES_ALIAS.exec(src)?.[1];
  const pagesAlias = PAGES_ALIAS.exec(src)?.[1];
  if (!notesAlias && !pagesAlias) return { file, args: [] };
  if (!notesAlias || !pagesAlias) {
    return {
      error: `notes and pages must both be literal arrays or both re-exported names (found ${notesAlias ? 'notes' : 'pages'} = ${notesAlias ?? pagesAlias})`,
    };
  }
  const imports = namedImports(src);
  const n = imports.get(notesAlias);
  const p = imports.get(pagesAlias);
  if (!n || !p) return { error: `cannot find the import for ${n ? pagesAlias : notesAlias}` };
  if (n.module !== p.module) return { error: 'notes and pages come from different modules' };
  const source = resolveModule(file, n.module);
  if (!source) return { error: `cannot resolve module '${n.module}'` };
  return { file: source, args: ['--notes', n.name, '--pages', p.name] };
}

const slidesDir = join(ROOT, 'slides');
const entries = existsSync(slidesDir) ? readdirSync(slidesDir, { withFileTypes: true }) : [];
// Private decks are linked in (scripts/link-private.mjs). A link whose target is
// gone must fail, not be skipped, or verify stays green without checking it.
const broken = entries
  .filter((d) => d.isSymbolicLink() && !existsSync(join(slidesDir, d.name, 'index.tsx')))
  .map((d) => d.name);
const decks = entries
  .filter((d) => (d.isDirectory() || d.isSymbolicLink()) && existsSync(join(slidesDir, d.name, 'index.tsx')))
  .map((d) => d.name)
  .sort();

let failed = 0;
for (const id of broken) {
  console.log(`lint-decks: slides/${id} is a link without index.tsx (moved repo? rerun scripts/link-private.mjs)`);
  failed += 1;
}
for (const id of decks) {
  const file = join(slidesDir, id, 'index.tsx');
  const target = lintTarget(file, readFileSync(file, 'utf8'));
  const config = findConfig(id);
  const via = target.file && target.file !== file ? `, arrays from ${rel(target.file)}` : '';
  console.log(`== ${id} (${config ? `config ${rel(config)}` : 'no config'}${via})`);
  if (target.error) {
    console.log(`lint-decks: ${id}: ${target.error}`);
    failed += 1;
    continue;
  }
  // lint-deck scans only the source file, so check the wrapper's own text (title etc.) here.
  if (target.file !== file && config) {
    const banned = JSON.parse(readFileSync(config, 'utf8')).banned ?? [];
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const hits = banned.flatMap((phrase) =>
      lines.flatMap((line, i) => (line.includes(phrase) ? [`banned  ${rel(file)}:${i + 1}  "${phrase}"`] : [])),
    );
    if (hits.length) {
      console.log(hits.join('\n'));
      failed += 1;
      continue;
    }
  }
  const args = [LINT, target.file, ...target.args, ...(config ? ['--config', config] : [])];
  const run = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit', timeout: LINT_TIMEOUT_MS });
  if (run.error) console.log(`lint-decks: ${id}: could not run lint-deck (${run.error.code ?? run.error.message})`);
  else if (run.signal) console.log(`lint-decks: ${id}: lint-deck stopped by ${run.signal}`);
  if (run.status !== 0) failed += 1;
}

if (decks.length === 0) {
  console.error('lint-decks: no decks found under slides/');
  process.exitCode = 1;
} else {
  console.log(failed ? `lint-decks: ${failed} of ${decks.length} deck(s) failed` : `lint-decks: ${decks.length} deck(s) checked`);
  process.exitCode = failed ? 1 : 0;
}
