import { lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { routeTask } from './routing.mjs';

const roles = [
  ['cv-planner', 'ba', 'planning', 'routine', false, 'Refine product scope and plan a bounded delivery slice.'],
  ['cv-engineer', 'engineering', 'coding', 'routine', false, 'Implement routine integrated frontend/backend changes.'],
  ['cv-secure-engineer', 'engineering', 'coding', 'complex', true, 'Implement complex changes, authentication, migrations and tenant security.'],
  ['cv-quick-fix', 'engineering', 'coding', 'simple', false, 'Implement a small bounded non-sensitive change.'],
  ['cv-qa', 'qa', 'coding', 'routine', false, 'Design and implement independent journey tests; execute checks with tools directly.'],
  ['cv-reviewer', 'qa', 'review', 'routine', false, 'Perform one consolidated feature/release review, prioritizing correctness and risks.'],
  ['cv-release', 'release', 'coding', 'complex', true, 'Handle complex release preparation and authorized promotion without bypassing gates.']
];
const common = 'Follow repository AGENTS.md and the current user scope. Reuse existing owners. Run test/build/status commands directly; do not spawn models for command execution. This profile is a default, not permission to act. Check task-specific routing and availability before delegation. Do not invent evidence, silently substitute models, duplicate workstreams or retry unchanged infrastructure blockers.';

async function bundle(preset, hooks, registerAgents) {
  routeTask('planning', { preset });
  const files = new Map();
  const registrations = [];
  for (const [name, source, kind, complexity, sensitive, description] of roles) {
    const routing = routeTask(kind, { preset, complexity, sensitive });
    const prompt = await readFile(new URL(`../agents/${source}.md`, import.meta.url), 'utf8');
    files.set(`.codex/agents/${name}.toml`, `name = ${JSON.stringify(name)}\ndescription = ${JSON.stringify(description)}\nmodel = ${JSON.stringify(routing.model)}\nmodel_reasoning_effort = ${JSON.stringify(routing.effort)}\ndeveloper_instructions = ${JSON.stringify(`${common}\n\n${prompt}`)}\n`);
    registrations.push(`[agents.${name}]\ndescription = ${JSON.stringify(description)}\nconfig_file = "agents/${name}.toml"\n`);
  }
  const registration = '# Native role registration for runtimes using role-table discovery. No permission/model defaults.\n\n' + registrations.join('\n');
  files.set('.codex/cv-agents.config.toml', registration);
  if (registerAgents) files.set('.codex/config.toml', registration);
  const skillsRoot = new URL('../skills/', import.meta.url);
  for (const entry of await readdir(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('pdk-')) continue;
    files.set(`.agents/skills/${entry.name}/SKILL.md`, await readFile(new URL(`${entry.name}/SKILL.md`, skillsRoot), 'utf8'));
  }
  files.set('CODEX_KIT.md', await readFile(new URL('../codex/PROJECT_GUIDE.md', import.meta.url), 'utf8'));
  if (hooks) {
    files.set('.codex/hooks/cv-lifecycle.cjs', await readFile(new URL('../codex/lifecycle.cjs', import.meta.url), 'utf8'));
    const command = `node -e "const p=require('node:path');const c=require('node:child_process');const r=c.execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();const s=c.spawnSync(process.execPath,[p.join(r,'.codex/hooks/cv-lifecycle.cjs'),process.argv[1]],{stdio:'inherit',windowsHide:true,timeout:5000});process.exit(s.status??1)"`;
    files.set('.codex/hooks.json', JSON.stringify({ hooks: Object.fromEntries(['SessionStart', 'PreCompact', 'Stop'].map(event => [event, [{ hooks: [{ type: 'command', command: `${command} ${event}`, timeout: 10 }] }]])) }, null, 2) + '\n');
  }
  const manifest = { schemaVersion: 1, kit: 'codex-vibecode-pro-max-kit', version: '0.2.0', preset, registeredInProjectConfig: registerAgents, hooksConfigured: hooks, hooksTrusted: false,
    files: [...files].map(([file, content]) => ({ path: file, sha256: createHash('sha256').update(content).digest('hex') })) };
  files.set('.codex/cv-kit-installation.json', JSON.stringify(manifest, null, 2) + '\n');
  return files;
}

async function absent(file) {
  try { await lstat(file); throw new Error(`Existing path; no overwrite: ${file}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
async function parents(root, relative) {
  let current = root;
  for (const part of relative.split('/').slice(0, -1)) {
    current = path.join(current, part);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) throw new Error(`Unsafe parent directory: ${current}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

export async function installCodex(target, { preset, hooks = false, apply = false } = {}) {
  if (typeof hooks !== 'boolean' || typeof apply !== 'boolean') throw new Error('Invalid installation options');
  const root = await realpath(target);
  if (!(await lstat(root)).isDirectory()) throw new Error('Target must be an existing directory');
  let registerAgents = true;
  try { await lstat(path.join(root, '.codex/config.toml')); registerAgents = false; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const files = await bundle(preset, hooks, registerAgents);
  // Preflight all destinations, including symlink/junction parents, before any write.
  for (const file of files.keys()) { await parents(root, file); await absent(path.join(root, file)); }
  if (hooks) {
    let gitRoot;
    try { gitRoot = await realpath(execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, timeout: 5000 }).trim()); }
    catch { throw new Error('Optional hooks require an existing Git repository root'); }
    if (gitRoot !== root) throw new Error('Optional hooks must be installed at the Git repository root');
  }
  if (apply) {
    for (const [file, content] of files) {
      await parents(root, file);
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), content, { flag: 'wx' });
    }
  }
  return { applied: apply, root, files: [...files.keys()], roles: roles.length, skills: [...files.keys()].filter(f => f.endsWith('/SKILL.md')).length,
    hooksConfigured: hooks && apply, hooksTrusted: false, registeredInProjectConfig: registerAgents && apply,
    message: 'No global settings, permissions or existing configuration changed. Review discovery and trust in Codex. No agents launched.' };
}
