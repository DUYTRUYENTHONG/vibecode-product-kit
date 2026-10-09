import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { routeTask } from '../lib/routing.mjs';

const preset = 'stos-approved';
const cli = fileURLToPath(new URL('../bin/pdk.mjs', import.meta.url));
const route = (kind, options = {}) => routeTask(kind, { preset, ...options });

test('routing requires explicit adoption of a known preset', () => {
  assert.throws(() => routeTask('coding'), /preset/);
  assert.throws(() => route('coding', { preset: 'unknown' }), /preset/);
});

test('planning, specification and consolidated review use Astra', () => {
  for (const kind of ['planning', 'specification', 'review']) {
    const result = route(kind, { complexity: 'simple', sensitive: true });
    assert.equal(result.model, 'gpt-6-astra');
    assert.equal(result.effort, 'high');
    assert.equal(result.dispatched, false);
  }
});

test('implementation routing is deterministic and sensitive work overrides simple', () => {
  for (const kind of ['coding', 'research', 'documentation', 'debugging']) {
    for (const [complexity, model, effort] of [
      ['simple', 'gpt-5.6-luna', 'low'],
      ['routine', 'gpt-5.6-terra', 'medium'],
      ['complex', 'gpt-5.6-sol', 'high']
    ]) {
      const result = route(kind, { complexity });
      assert.equal(result.model, model); assert.equal(result.effort, effort);
      assert.equal(result.execution, 'agent'); assert.equal(result.dispatched, false);
    }
    assert.equal(route(kind, { complexity: 'simple', sensitive: true }).model, 'gpt-5.6-sol');
  }
});

test('tests, builds, formatting, status and metrics never request a model', () => {
  for (const kind of ['test', 'build', 'format', 'status', 'metrics']) {
    const result = route(kind, { complexity: 'complex', sensitive: true });
    assert.equal(result.execution, 'tools'); assert.equal(result.model, null);
    assert.equal(result.effort, null); assert.equal(result.dispatched, false);
  }
});

test('invalid routing metadata fails instead of selecting a fallback', () => {
  assert.throws(() => route('deploy'), /kind/);
  assert.throws(() => route('coding', { complexity: 'easy' }), /complexity/);
  assert.throws(() => route('coding', { sensitive: 'false' }), /sensitive/);
});

test('route CLI emits JSON and rejects ambiguous options', () => {
  const result = spawnSync(process.execPath, [cli, 'route', 'coding', '--preset', preset, '--complexity', 'simple', '--sensitive'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).model, 'gpt-5.6-sol');
  assert.equal(JSON.parse(result.stdout).dispatched, false);
  for (const args of [
    ['route', 'coding'], ['route', 'coding', '--preset', 'unknown'],
    ['route', 'coding', '--preset', preset, '--sensitive', 'false'],
    ['route', 'coding', '--preset', preset, '--preset', preset],
    ['route', 'coding', '--preset', preset, '--complexity'],
    ['route', 'coding', '--preset', preset, '--apply']
  ]) {
    assert.equal(spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }).status, 1, args.join(' '));
  }
});
