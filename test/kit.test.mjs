import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateProject, initializeProject, jiraPlan, projectReport, readProject } from '../lib/kit.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha = 'a'.repeat(40);
const timestamp = '2026-10-08T10:00:00Z';
function feature() {
  return {
    id: 'DEMO-001', title: 'Publish a page', owner: 'backend-owner', status: 'planned', risk: 'high',
    outcome: 'A seller can share a durable public page.', outOfScope: ['Billing'], dependencies: [],
    acceptance: [{ id: 'AC1', outcome: 'Saved content survives restart.', scenario: 'restart-persistence' }],
    metrics: [{ name: 'publish_success', definition: 'Successful logical publishes / valid publish attempts.', target: '>=99%', measurement: 'not_measured' }],
    evidence: [], candidateSha: null, blocker: null, previewApproval: null, deployment: null
  };
}
function project() { return { schemaVersion: 1, product: { name: 'Demo', key: 'DEMO' }, features: [feature()] }; }
function verified(status = 'qa_verified') {
  const p = project(); const f = p.features[0]; f.status = status; f.candidateSha = sha;
  f.evidence = [{ criterion: 'AC1', scenario: 'restart-persistence', candidateSha: sha, result: 'pass', environment: 'qa', reviewer: 'independent-qa', recordedAt: timestamp, artifact: 'https://example.com/runs/1', method: 'automated' }];
  return p;
}
async function temporary(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'product-kit-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
test('valid planning is not release readiness', () => {
  assert.deepEqual(validateProject(project()), []);
  assert.ok(validateProject(project(), { gate: 'release' }).some(e => e.includes('production_verified')));
});
test('empty projects and unknown status fail closed', () => {
  const p = project(); p.features = []; assert.ok(validateProject(p).length);
  p.features = [feature()]; p.features[0].status = 'done'; assert.ok(validateProject(p).length);
});
test('reject duplicate feature IDs, unknown dependencies and cycles', () => {
  const p = project(); p.features.push(feature()); assert.ok(validateProject(p).some(e => e.includes('duplicate')));
  p.features.pop(); p.features[0].dependencies = ['DEMO-404']; assert.ok(validateProject(p).some(e => e.includes('unknown dependency')));
  p.features[0].dependencies = ['DEMO-002']; const f = feature(); f.id = 'DEMO-002'; f.dependencies = ['DEMO-001']; p.features.push(f);
  assert.ok(validateProject(p).some(e => e.includes('cycle')));
});
test('require acceptance scenarios, owner, metric definitions and scope boundaries', () => {
  const p = project(); const f = p.features[0]; f.owner = ''; f.acceptance[0].scenario = ''; f.metrics[0].definition = ''; f.outOfScope = [];
  assert.ok(validateProject(p).length >= 4);
});
test('blocked work must preserve a concrete next action and blocker owner', () => {
  const p = project(); p.features[0].status = 'blocked'; assert.ok(validateProject(p).length);
  p.features[0].blocker = { reason: 'No isolated database', owner: 'platform-owner', nextAction: 'Provide synthetic QA instance' };
  assert.deepEqual(validateProject(p), []);
});
test('implemented requires a candidate SHA, not evidence of production', () => {
  const p = project(); p.features[0].status = 'implemented'; assert.ok(validateProject(p).length);
  p.features[0].candidateSha = sha; assert.deepEqual(validateProject(p), []);
});
test('work beyond planning needs an assigned owner', () => {
  for (const status of ['in_progress', 'implemented', 'qa_verified']) {
    const p = project(); p.features[0].owner = 'unassigned'; p.features[0].status = status;
    assert.ok(validateProject(p).some(e => e.includes('assigned owner')));
  }
});
test('QA requires independent passing evidence for every criterion at the candidate SHA', () => {
  assert.deepEqual(validateProject(verified()), []);
  for (const mutation of [f => f.evidence = [], f => f.evidence[0].candidateSha = 'b'.repeat(40), f => f.evidence[0].reviewer = f.owner, f => f.evidence[0].result = 'fail', f => f.evidence[0].scenario = 'unrelated']) {
    const p = verified(); mutation(p.features[0]); assert.ok(validateProject(p).length);
  }
});
test('preview approval cannot be silently reused for another candidate', () => {
  const p = verified('preview_approved'); assert.ok(validateProject(p).length);
  p.features[0].previewApproval = { by: 'product-owner', at: timestamp, candidateSha: sha, url: 'https://preview.example.com' };
  assert.deepEqual(validateProject(p), []);
  p.features[0].previewApproval.candidateSha = 'b'.repeat(40); assert.ok(validateProject(p).length);
});
test('production requires matching preview approval, deployment and production smoke evidence', () => {
  const p = verified('production_verified'); const f = p.features[0];
  f.previewApproval = { by: 'product-owner', at: timestamp, candidateSha: sha, url: 'https://preview.example.com' };
  assert.ok(validateProject(p).length);
  f.deployment = { id: 'deploy-1', candidateSha: sha, url: 'https://product.example.com', at: timestamp, rollback: 'Restore the previously verified artifact.' };
  f.evidence.push({ ...f.evidence[0], environment: 'production' });
  assert.deepEqual(validateProject(p, { gate: 'release' }), []);
  f.evidence.pop(); assert.ok(validateProject(p).length);
});
test('reject credential URLs, traversal and malformed evidence', () => {
  for (const artifact of ['../secrets.txt', 'C:/secret.txt', 'https://user:pass@example.com/run', 'javascript:alert(1)', 'evidence/../../secret', 'https://example.com/run?token=secret']) {
    const p = verified(); p.features[0].evidence[0].artifact = artifact; assert.ok(validateProject(p).length, artifact);
  }
  const p = verified(); p.features[0].evidence[0].recordedAt = 'yesterday'; assert.ok(validateProject(p).length);
});
test('malformed shapes return errors rather than crash', () => {
  for (const p of [null, [], {}, { schemaVersion: 1, product: {}, features: [null] }, { ...project(), features: [{ ...feature(), acceptance: [null], evidence: [null], metrics: [null], dependencies: [null] }] }]) {
    assert.ok(validateProject(p).length);
  }
});
test('reports retain uncertainty and Jira export is explicitly a proposal', () => {
  const p = project(); p.features[0].jiraKey = 'SCRUM-39';
  const plan = jiraPlan(p); assert.equal(plan.applied, false); assert.equal(plan.changes[0].operation, 'review_update'); assert.equal(plan.changes[0].issueKey, 'SCRUM-39');
  assert.ok(projectReport(p).includes('not_measured')); assert.ok(!JSON.stringify(plan).includes('"status":"Done"'));
  delete p.features[0].jiraKey; assert.equal(jiraPlan(p).changes[0].operation, 'review_create');
});
test('init defaults to dry-run and never overwrites existing AGENTS.md or project state', async t => {
  const dir = await temporary(t); await writeFile(path.join(dir, 'AGENTS.md'), 'existing policy');
  assert.equal((await initializeProject(dir, { name: 'Demo', key: 'DEMO' })).applied, false);
  await assert.rejects(readFile(path.join(dir, '.product-kit/project.json')));
  assert.equal((await initializeProject(dir, { name: 'Demo', key: 'DEMO', apply: true })).applied, true);
  assert.equal(await readFile(path.join(dir, 'AGENTS.md'), 'utf8'), 'existing policy');
  assert.deepEqual(validateProject(await readProject(path.join(dir, '.product-kit'))), []);
  await assert.rejects(initializeProject(dir, { name: 'Demo', key: 'DEMO', apply: true }), /already exists/);
});
test('init rejects invalid keys and existing symlink destinations', async t => {
  const dir = await temporary(t); const outside = await temporary(t);
  await assert.rejects(initializeProject(dir, { name: 'Demo', key: '../bad', apply: true }));
  await symlink(outside, path.join(dir, '.product-kit'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(initializeProject(dir, { name: 'Demo', key: 'DEMO', apply: true }), /already exists/);
});
test('CLI fails on malformed JSON, unknown command, flags and invalid release gate', async t => {
  const dir = await temporary(t); await writeFile(path.join(dir, 'project.json'), '{broken');
  for (const args of [['validate', dir], ['unknown'], ['validate', 'examples/stos', '--gate', 'magic'], ['validate', 'examples/stos', '--force']]) {
    const result = spawnSync(process.execPath, ['bin/pdk.mjs', ...args], { cwd: root, encoding: 'utf8' }); assert.notEqual(result.status, 0, result.stdout);
  }
});
test('CLI initializes, validates, reports and exports a real temporary project', async t => {
  const dir = await temporary(t);
  const run = args => spawnSync(process.execPath, [path.join(root, 'bin/pdk.mjs'), ...args], { cwd: root, encoding: 'utf8' });
  const init = run(['init', dir, '--name', 'CLI demo', '--key', 'DEMO', '--apply']);
  assert.equal(init.status, 0, init.stderr); assert.equal(JSON.parse(init.stdout).applied, true);
  const state = path.join(dir, '.product-kit');
  assert.equal(run(['validate', state]).status, 0);
  assert.match(run(['report', state]).stdout, /CLI demo/);
  assert.equal(JSON.parse(run(['jira-export', state]).stdout).applied, false);
  assert.equal(run(['validate', state, '--gate', 'release']).status, 1);
  const before = await readFile(path.join(state, 'project.json'), 'utf8');
  assert.equal(run(['init', dir, '--name', 'changed', '--key', 'DEMO', '--apply']).status, 1);
  assert.equal(await readFile(path.join(state, 'project.json'), 'utf8'), before);
});
test('readProject rejects oversized input', async t => {
  const dir = await temporary(t); await writeFile(path.join(dir, 'project.json'), ' '.repeat(1024 * 1024 + 1));
  await assert.rejects(readProject(dir), /exceeds 1 MiB/);
});
test('duplicate criteria, duplicate Jira mappings and unresolved failure block verification', () => {
  const p = verified(); p.features[0].acceptance.push({ ...p.features[0].acceptance[0] });
  assert.ok(validateProject(p).some(e => e.includes('duplicate acceptance')));
  p.features[0].acceptance.pop(); p.features[0].evidence.push({ ...p.features[0].evidence[0], result: 'fail' });
  assert.ok(validateProject(p).some(e => e.includes('failing evidence')));
  const other = project(); other.features[0].jiraKey = 'SCRUM-39'; other.features.push({ ...feature(), id: 'DEMO-002', jiraKey: 'SCRUM-39' });
  assert.ok(validateProject(other).some(e => e.includes('duplicate Jira')));
});
