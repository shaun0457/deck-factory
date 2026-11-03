#!/usr/bin/env node
// Editable .pptx through the pinned ppt-master submodule.
//
//   node pptx.mjs new <name> [--template tech-talk]   create pptx/projects/<name>_<date>
//   node pptx.mjs build <project dir> [--notes]       quality gate, then SVG -> native PPTX
//   node pptx.mjs render <file.pptx> --out <dir>      PowerPoint renders every slide to PNG (Windows)
//
// Wraps three things that went wrong by hand: the converter only accepts a
// checker report written with --json for the current svg_output; Windows
// MAX_PATH breaks the converter's temp folder under deep paths; and the
// render step needs PowerPoint COM, not a browser.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const PM = join(ROOT, 'pptx', 'vendor', 'ppt-master', 'skills', 'ppt-master', 'scripts');
const PROJECTS = join(ROOT, 'pptx', 'projects');
const TEMPLATES = join(ROOT, 'pptx', 'templates');
const PYTHON = process.platform === 'win32' ? join(ROOT, '.venv', 'Scripts', 'python.exe') : join(ROOT, '.venv', 'bin', 'python');
// The converter extracts into <project>/exports/.pptx-build-<pid>-<32 hex>/pptx_content/ppt/slideMasters/…
// which adds about 130 characters; Windows fails past 260.
const MAX_PROJECT_PATH = 120;
const STEP_TIMEOUT_MS = 10 * 60 * 1000;
const RENDER_TIMEOUT_MS = 3 * 60 * 1000;

const USAGE = `usage:
  node pptx.mjs new <name> [--template tech-talk]
  node pptx.mjs build <project dir> [--notes]
  node pptx.mjs render <file.pptx> --out <dir>`;

function fail(message) {
  console.error(`pptx.mjs: ${message}`);
  process.exit(1);
}

function parse(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) positional.push(a);
    else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) flags[a.slice(2)] = argv[++i];
    else flags[a.slice(2)] = true;
  }
  return { positional, flags };
}

function run(cmd, args, timeout, { capture = false } = {}) {
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  if (res.error) {
    // Show whatever was captured before the timeout or buffer limit, so the cause is visible.
    if (capture) {
      process.stdout.write(res.stdout ?? '');
      process.stderr.write(res.stderr ?? '');
    }
    fail(`${cmd} did not finish: ${res.error.code ?? res.error.message}`);
  }
  if (res.status === null) fail(`${cmd} was stopped by ${res.signal}`);
  return res;
}

function python(script, args, opts) {
  if (!existsSync(PYTHON)) fail(`no venv at ${PYTHON}; run the setup in README.md`);
  return run(PYTHON, [join(PM, script), ...args], STEP_TIMEOUT_MS, opts);
}

function newProject(name, template) {
  if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) fail('name must be kebab-case (a-z, 0-9, -)');
  // Check the template before init, so a typo does not leave a half-made project behind.
  const src = template ? join(TEMPLATES, template) : undefined;
  if (src && !(existsSync(join(src, 'svg')) && existsSync(join(src, 'spec_lock.md')))) {
    fail(`template ${template} needs svg/ and spec_lock.md under ${src}`);
  }
  const before = new Set(existsSync(PROJECTS) ? readdirSync(PROJECTS) : []);
  const res = python('project_manager.py', ['init', name, '--quick-generate', '--dir', PROJECTS]);
  if (res.status !== 0) fail(`project_manager.py init exited ${res.status}`);
  const created = readdirSync(PROJECTS).filter((d) => !before.has(d));
  if (created.length !== 1) fail(`expected one new folder in ${PROJECTS}, found ${created.length}`);
  const project = join(PROJECTS, created[0]);
  if (src) {
    cpSync(join(src, 'svg'), join(project, 'svg_output'), { recursive: true });
    cpSync(join(src, 'spec_lock.md'), join(project, 'spec_lock.md'));
  }
  console.log(project);
}

function build(projectArg, notes) {
  if (!projectArg) fail(USAGE);
  const project = resolve(projectArg);
  if (!existsSync(join(project, 'svg_output'))) fail(`no svg_output/ in ${project}`);
  if (process.platform === 'win32' && project.length > MAX_PROJECT_PATH) {
    fail(`project path is ${project.length} characters (limit ${MAX_PROJECT_PATH}); Windows cannot hold the converter's temp folder. Move it under pptx/projects/.`);
  }
  // --json writes validation/svg_quality_report.json, which the converter requires to be fresh.
  const check = python('svg_quality_checker.py', [project, '--quick-generate', '--canonical-authoring', '--stage', 'final', '--json']);
  if (check.status !== 0) fail(`quality gate failed (exit ${check.status}); fix the errors above and rerun build`);
  const convert = python('svg_to_pptx.py', [project, '--quick-generate', ...(notes ? [] : ['--no-notes'])], { capture: true });
  process.stdout.write(convert.stdout);
  process.stderr.write(convert.stderr);
  if (convert.status !== 0) fail(`svg_to_pptx.py exited ${convert.status}`);
  const line = convert.stdout.split(/\r?\n/).find((l) => l.includes('[PPTX]'));
  if (line) console.log(`\npptx: ${resolve(ROOT, line.split('[PPTX]')[1].trim())}`);
}

// Paths go in through environment variables so they are never parsed as PowerShell code.
const RENDER_PS = `
$ErrorActionPreference = 'Stop'
$app = New-Object -ComObject PowerPoint.Application
# COM attaches to a PowerPoint the user already has open; only quit one we started.
$wasIdle = $app.Presentations.Count -eq 0
# Opening a file the user already has open can hand back their copy, and closing it
# would drop unsaved edits.
foreach ($p in $app.Presentations) {
  if ($p.FullName -eq $env:DF_PPTX) { throw "This file is open in PowerPoint; close it first." }
}
# No hidden repair or save prompts: a dialog nobody can see would hang until the timeout.
$alerts = $app.DisplayAlerts
$app.DisplayAlerts = 1
try {
  $pres = $app.Presentations.Open($env:DF_PPTX, $true, $false, $false)
  try {
    for ($i = 1; $i -le $pres.Slides.Count; $i++) {
      $pres.Slides.Item($i).Export((Join-Path $env:DF_OUT ("slide{0:D2}.png" -f $i)), 'PNG', 1600, 900)
    }
    "rendered $($pres.Slides.Count) slide(s) to $env:DF_OUT"
  } finally { $pres.Close() }
} finally {
  $app.DisplayAlerts = $alerts
  if ($wasIdle) { $app.Quit() }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($app) | Out-Null
}`;

function render(pptxArg, out) {
  if (process.platform !== 'win32') fail('render needs PowerPoint on Windows');
  if (!pptxArg || typeof out !== 'string') fail(USAGE);
  const pptx = resolve(pptxArg);
  if (!existsSync(pptx)) fail(`no file at ${pptx}`);
  const dir = resolve(out);
  mkdirSync(dir, { recursive: true });
  // Drop PNGs from an earlier render so a deleted slide does not linger as a stale image.
  for (const f of readdirSync(dir)) if (/^slide\d+\.png$/i.test(f)) rmSync(join(dir, f));
  const res = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', RENDER_PS], {
    encoding: 'utf8',
    timeout: RENDER_TIMEOUT_MS,
    stdio: 'inherit',
    env: { ...process.env, DF_PPTX: pptx, DF_OUT: dir },
  });
  if (res.error) {
    // PowerPoint runs outside powershell's process tree, so a timeout leaves it open.
    fail(`PowerPoint render did not finish: ${res.error.code ?? res.error.message}. If POWERPNT.EXE is still running with no window, end it in Task Manager before rendering again.`);
  }
  if (res.status !== 0) fail(`PowerPoint render exited ${res.status ?? res.signal}`);
}

const { positional, flags } = parse(process.argv.slice(2));
const [command, target] = positional;
if (command === 'new') newProject(target, typeof flags.template === 'string' ? flags.template : undefined);
else if (command === 'build') build(target, flags.notes === true);
else if (command === 'render') render(target, flags.out);
else fail(USAGE);
