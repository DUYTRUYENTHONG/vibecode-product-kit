import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, readdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { installCodex } from '../lib/codex.mjs';

const { response } = createRequire(import.meta.url)('../codex/lifecycle.cjs');
const preset = 'stos-approved';
const root = fileURLToPath(new URL('../', import.meta.url));
async function temporary(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'codex-kit-'));
  // Only delete the known test directory, never a caller-supplied project path.
  t.after(async () => { assert.equal(path.dirname(dir), tmpdir()); await rm(dir, { recursive: true, force: true }); });
  return dir;
}

test('Codex setup defaults to dry run, requires preset and preserves host policies', async t => {
  const dir = await temporary(t);
  await mkdir(path.join(dir, '.codex')); await writeFile(path.join(dir, '.codex/config.toml'), '# existing');
  await writeFile(path.join(dir, 'AGENTS.md'), 'existing owner policy');
  await assert.rejects(installCodex(dir), /preset/);
  const plan = await installCodex(dir, { preset });
  assert.equal(plan.applied, false); assert.equal(plan.roles, 7); assert.equal(plan.skills, 6);
  assert.deepEqual(await readdir(path.join(dir, '.codex')), ['config.toml']);
  const result = await installCodex(dir, { preset, apply: true });
  assert.equal(result.applied, true); assert.equal(result.hooksTrusted, false);
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), 'existing owner policy');
  assert.equal(await readFile(path.join(dir, '.codex/config.toml'), 'utf8'), '# existing');
  await assert.rejects(readFile(path.join(dir, '.codex/hooks.json')));
  await assert.rejects(installCodex(dir, { preset, apply: true }), /Existing path/);
});

test('native roles have names, prompts and approved model defaults; hashes match', async t => {
  const dir = await temporary(t); await installCodex(dir, { preset, apply: true });
  const manifest = JSON.parse(await readFile(path.join(dir, '.codex/cv-kit-installation.json'), 'utf8'));
  for (const entry of manifest.files) {
    const content = await readFile(path.join(dir, entry.path));
    assert.equal(createHash('sha256').update(content).digest('hex'), entry.sha256);
    if (entry.path.startsWith('.codex/agents/') && entry.path.endsWith('.toml')) {
      const text = content.toString();
      assert.match(text, /^name = "cv-/); assert.match(text, /developer_instructions = "/);
      assert.match(text, /model = "gpt-(6-astra|5\.6-(luna|terra|sol))"/);
      assert.doesNotMatch(text, /sandbox_mode|approval_policy|model_provider/);
    }
    if (entry.path.endsWith('/SKILL.md')) assert.match(content.toString(), /^---\r?\nname: pdk-/);
  }
  const config = await readFile(path.join(dir, '.codex/config.toml'), 'utf8');
  assert.equal((config.match(/\[agents\.cv-/g) || []).length, 7);
  assert.doesNotMatch(config, /sandbox_mode|approval_policy|model =/);
});

test('late file conflicts fail preflight without partially installing roles', async t => {
  const dir = await temporary(t); await writeFile(path.join(dir, 'CODEX_KIT.md'), 'preserve');
  await assert.rejects(installCodex(dir, { preset, apply: true }), /Existing path/);
  assert.deepEqual(await readdir(dir), ['CODEX_KIT.md']);
});

test('Codex setup rejects symlink/junction parents without writing outside target', async t => {
  const dir = await temporary(t); const outside = await temporary(t);
  await symlink(outside, path.join(dir, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(installCodex(dir, { preset, apply: true }), /Unsafe parent/);
  assert.deepEqual(await readdir(outside), []);
  assert.deepEqual(await readdir(dir), ['.agents']);
});

test('optional hooks are explicit and existing hooks are never overwritten', async t => {
  const dir = await temporary(t); await mkdir(path.join(dir, '.codex'));
  await writeFile(path.join(dir, '.codex/hooks.json'), '{"existing":true}');
  await assert.rejects(installCodex(dir, { preset, hooks: true, apply: true }), /Existing path/);
  assert.deepEqual(await readdir(path.join(dir, '.codex')), ['hooks.json']);
  await installCodex(dir, { preset, apply: true });
  assert.equal(await readFile(path.join(dir, '.codex/hooks.json'), 'utf8'), '{"existing":true}');
});

test('lifecycle handlers only emit bounded reminders and respect stop recursion', () => {
  assert.equal(response('SessionStart', {}).hookSpecificOutput.hookEventName, 'SessionStart');
  for (const event of ['Stop', 'PreCompact']) {
    const result = response(event, {});
    assert.equal(typeof result.systemMessage, 'string'); assert.equal(result.decision, undefined);
    assert.equal(result.continue, undefined);
  }
  assert.deepEqual(response('Stop', { stop_hook_active: true }), {});
  assert.throws(() => response('exec', {})); assert.throws(() => response('Stop', []));
  assert.throws(() => response('Stop', { hook_event_name: 'SessionStart' }));
});

test('hooks reject non-Git and nested install targets without writing', async t => {
  const dir = await temporary(t);
  await assert.rejects(installCodex(dir, { preset, hooks: true, apply: true }), /Git repository root/);
  assert.deepEqual(await readdir(dir), []);
  assert.equal(spawnSync('git', ['init', dir], { encoding: 'utf8' }).status, 0);
  const nested = path.join(dir, 'nested'); await mkdir(nested);
  await assert.rejects(installCodex(nested, { preset, hooks: true, apply: true }), /Git repository root/);
  assert.deepEqual(await readdir(nested), []);
});

test('configured hook commands work from nested directories with spaces', async t => {
  const dir = await temporary(t);
  assert.equal(spawnSync('git', ['init', dir], { encoding: 'utf8' }).status, 0);
  await installCodex(dir, { preset, hooks: true, apply: true });
  const nested = path.join(dir, 'nested folder'); await mkdir(nested);
  const config = JSON.parse(await readFile(path.join(dir, '.codex/hooks.json'), 'utf8'));
  for (const [event, groups] of Object.entries(config.hooks)) {
    const handler = groups[0].hooks[0];
    const result = spawnSync(handler.command, { cwd: nested, shell: true, encoding: 'utf8', input: JSON.stringify({ hook_event_name: event }), timeout: 15000 });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(typeof JSON.parse(result.stdout), 'object');
    assert.equal(handler.timeout, 10);
  }
});

test('hook runner rejects malformed/oversized payloads without echoing them', () => {
  for (const input of ['{secret-invalid', 'x'.repeat(1024 * 1024 + 1)]) {
    const result = spawnSync(process.execPath, [path.join(root, 'codex/lifecycle.cjs'), 'Stop'], { input, encoding: 'utf8' });
    assert.equal(result.status, 1); assert.equal(result.stdout, '');
    assert.ok(result.stderr.length < 400);
    assert.ok(!result.stderr.includes('secret-invalid'));
  }
});

test('CLI exposes explicit Codex install without changing init semantics', async t => {
  const dir = await temporary(t);
  const result = spawnSync(process.execPath, [path.join(root, 'bin/pdk.mjs'), 'codex-install', dir, '--preset', preset], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).applied, false);
  assert.deepEqual(await readdir(dir), []);
});
