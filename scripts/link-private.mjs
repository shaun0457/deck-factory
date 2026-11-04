// Link private decks into this repo without committing them.
//
// private/ is a separate git repo (ignored here) with the same layout:
//   private/slides/<id>/index.tsx, private/plan/<id>/...
// For each <id>, this adds /slides/<id> and /plan/<id> to this clone's
// info/exclude (local, never pushed), checks that git now ignores the path,
// and only then creates a directory junction into private/. pnpm dev and
// pnpm verify see the private decks; git status and GitHub do not.
//
// Git for Windows treats a junction as a real folder, so the exclude entry is
// the only thing keeping `git add -A` away from private files. If git does not
// confirm the path is ignored, no link is created.
//
//   node scripts/link-private.mjs
import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  symlinkSync,
} from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PRIVATE = join(ROOT, 'private');
// Characters that are literal in gitignore patterns; anything else could be a glob.
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const git = (...args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 30_000 });

if (!existsSync(PRIVATE)) {
  console.log('link-private: no private/ folder, nothing to link');
  process.exit(0);
}

// info/exclude lives under the git dir, which is a file in a worktree.
const gitPath = git('rev-parse', '--git-path', 'info/exclude');
if (gitPath.status !== 0) {
  console.error('link-private: not inside a git repo');
  process.exit(1);
}
const exclude = (() => {
  const p = gitPath.stdout.trim();
  return isAbsolute(p) ? p : join(ROOT, p);
})();
mkdirSync(dirname(exclude), { recursive: true });

const lines = () => (existsSync(exclude) ? readFileSync(exclude, 'utf8') : '');
const addExclude = (pattern) => {
  const text = lines();
  if (text.split(/\r?\n/).includes(pattern)) return;
  const sep = text === '' || text.endsWith('\n') ? '' : '\n';
  appendFileSync(exclude, `${sep}${pattern}\n`);
};
const isIgnored = (path) => git('check-ignore', '-q', '--', path).status === 0;
const lstatOrNull = (p) => {
  try {
    return lstatSync(p);
  } catch {
    return null;
  }
};

let failed = 0;
const fail = (message) => {
  console.error(`link-private: ${message}`);
  failed++;
};

for (const kind of ['slides', 'plan']) {
  const source = join(PRIVATE, kind);
  if (!existsSync(source)) continue;
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const id = entry.name;
    const rel = `${kind}/${id}`;
    if (!SAFE_ID.test(id)) {
      fail(`${rel}: name must match ${SAFE_ID} so the exclude pattern is literal; not linked`);
      continue;
    }
    const link = join(ROOT, kind, id);
    const target = join(source, id);
    const existing = lstatOrNull(link);
    if (existing && !existing.isSymbolicLink()) {
      fail(`${rel} exists as a real folder; move it into private/${kind}/ first`);
      continue;
    }
    addExclude(`/${rel}`);
    if (!isIgnored(rel)) {
      fail(`${rel}: git does not ignore it after adding /${rel} to ${exclude}; not linked`);
      continue;
    }
    if (existing) {
      let points = null;
      try {
        points = realpathSync(link);
      } catch {
        points = null;
      }
      if (points !== realpathSync(target)) {
        fail(`${rel} is a link to ${points ?? 'a missing target'}, not private/${rel}; remove it and run again`);
      } else {
        console.log(`linked already: ${rel}`);
      }
      continue;
    }
    mkdirSync(join(ROOT, kind), { recursive: true });
    symlinkSync(target, link, 'junction');
    console.log(`linked: ${rel} -> private/${rel}`);
  }
}

process.exitCode = failed ? 1 : 0;
