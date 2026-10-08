import { readFile, writeFile, mkdir, lstat, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

export const statuses = ['planned', 'in_progress', 'blocked', 'implemented', 'qa_verified', 'preview_approved', 'production_verified'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 10000;
const sha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const date = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value) && Number.isFinite(Date.parse(value));
const key = value => typeof value === 'string' && /^[A-Z][A-Z0-9]{1,15}$/.test(value);
const issue = value => typeof value === 'string' && /^[A-Z][A-Z0-9_]*-[1-9]\d*$/.test(value);
const requirement = value => typeof value === 'string' && /^[A-Z][A-Z0-9_]*-[A-Z]*\d+$/.test(value);

function safeUrl(value) {
  if (!text(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}
function artifact(value) {
  if (!text(value)) return false;
  if (value.startsWith('https://')) return safeUrl(value);
  return !/[\\:\x00-\x1f]/.test(value) && !value.startsWith('/') && value.split('/').every(segment => segment && segment !== '.' && segment !== '..');
}

/** Structural validation only: no network access, test execution or approval authentication. */
export function validateProject(project, { gate = 'planning' } = {}) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  if (!['planning', 'qa', 'preview', 'release'].includes(gate)) return ['Unknown gate'];
  if (!object(project)) return ['Project must be an object'];
  require(project.schemaVersion === 1, 'schemaVersion must be 1');
  require(object(project.product) && text(project.product.name) && key(project.product.key), 'product requires name and uppercase key (2-16 characters)');
  if (!Array.isArray(project.features) || !project.features.length || project.features.length > 1000) return [...errors, 'features requires 1-1000 entries'];
  const ids = new Set();
  const jiraKeys = new Set();
  const graph = new Map();
  for (const [index, f] of project.features.entries()) {
    const where = `features[${index}]`;
    if (!object(f)) { errors.push(`${where} must be an object`); continue; }
    require(requirement(f.id), `${where}.id must be a stable requirement key`);
    if (ids.has(f.id)) errors.push(`${where}: duplicate feature id`);
    ids.add(f.id);
    for (const field of ['title', 'owner', 'outcome']) require(text(f[field]), `${where}.${field} is required`);
    if (f.status !== 'planned') require(text(f.owner) && !['unassigned', 'tbd', 'unknown'].includes(f.owner.trim().toLowerCase()), `${where}: work beyond planning requires an assigned owner`);
    require(['low', 'medium', 'high'].includes(f.risk), `${where}.risk is invalid`);
    require(statuses.includes(f.status), `${where}.status is invalid`);
    if (f.jiraKey !== undefined) {
      require(issue(f.jiraKey), `${where}.jiraKey is invalid`);
      require(!jiraKeys.has(f.jiraKey), `${where}: duplicate Jira mapping; split features or use one canonical record`);
      jiraKeys.add(f.jiraKey);
    }
    require(Array.isArray(f.outOfScope) && f.outOfScope.length > 0 && f.outOfScope.every(text), `${where}.outOfScope requires explicit exclusions`);
    const deps = Array.isArray(f.dependencies) ? f.dependencies : [];
    require(Array.isArray(f.dependencies) && deps.every(requirement), `${where}.dependencies must contain requirement IDs`);
    require(new Set(deps).size === deps.length, `${where}: duplicate dependencies`);
    graph.set(f.id, deps);
    const acceptance = Array.isArray(f.acceptance) ? f.acceptance : [];
    require(acceptance.length > 0, `${where}.acceptance is required`);
    const criteria = new Set();
    for (const ac of acceptance) {
      if (!object(ac)) { errors.push(`${where}: acceptance must be an object`); continue; }
      require(text(ac.id) && text(ac.outcome) && text(ac.scenario), `${where}: acceptance requires id, outcome and scenario`);
      require(!criteria.has(ac.id), `${where}: duplicate acceptance id`); criteria.add(ac.id);
    }
    const metrics = Array.isArray(f.metrics) ? f.metrics : [];
    require(metrics.length > 0, `${where}.metrics is required`);
    for (const m of metrics) {
      require(object(m) && text(m.name) && text(m.definition) && text(m.target) && text(m.measurement), `${where}: metric requires name, definition, target and measurement (use not_measured when unknown)`);
    }
    require(Array.isArray(f.evidence), `${where}.evidence must be an array`);
    const evidence = Array.isArray(f.evidence) ? f.evidence : [];
    for (const e of evidence) {
      if (!object(e)) { errors.push(`${where}: evidence must be an object`); continue; }
      const ac = acceptance.find(a => object(a) && a.id === e.criterion);
      require(ac && ac.scenario === e.scenario, `${where}: evidence must reference its criterion and scenario`);
      require(sha(e.candidateSha), `${where}: evidence requires full candidate SHA`);
      require(['pass', 'fail', 'not_run'].includes(e.result), `${where}: invalid evidence result`);
      require(['local', 'qa', 'preview', 'production'].includes(e.environment), `${where}: invalid evidence environment`);
      require(['automated', 'hybrid', 'manual'].includes(e.method), `${where}: invalid evidence method`);
      require(text(e.reviewer) && date(e.recordedAt) && artifact(e.artifact), `${where}: evidence needs reviewer, UTC timestamp and safe artifact reference`);
    }
    const stage = statuses.indexOf(f.status);
    if (f.candidateSha !== null && f.candidateSha !== undefined) require(sha(f.candidateSha), `${where}: invalid candidateSha`);
    if (stage >= statuses.indexOf('implemented')) require(sha(f.candidateSha), `${where}: implemented or later requires candidateSha`);
    if (f.status === 'blocked') require(object(f.blocker) && ['reason', 'owner', 'nextAction'].every(k => text(f.blocker[k])), `${where}: blocker requires reason, owner and nextAction`);
    if (f.status !== 'blocked') require(f.blocker === null || f.blocker === undefined, `${where}: unresolved blocker requires blocked status`);
    const covered = (ac, envs) => evidence.some(e => object(e) && e.criterion === ac.id && e.scenario === ac.scenario && e.candidateSha === f.candidateSha && e.result === 'pass' && envs.includes(e.environment) && e.reviewer !== f.owner);
    if (stage >= statuses.indexOf('qa_verified')) {
      for (const ac of acceptance.filter(object)) require(covered(ac, ['qa']), `${where}: independent QA passing evidence missing for ${ac.id} at candidateSha`);
      require(!evidence.some(e => object(e) && e.candidateSha === f.candidateSha && e.result === 'fail'), `${where}: current-candidate failing evidence must be resolved before verification`);
    }
    if (stage >= statuses.indexOf('preview_approved')) {
      const a = f.previewApproval;
      require(object(a) && text(a.by) && date(a.at) && safeUrl(a.url) && a.candidateSha === f.candidateSha, `${where}: preview approval must identify approver, time, URL and matching candidateSha`);
    }
    if (f.status === 'production_verified') {
      const d = f.deployment;
      require(object(d) && text(d.id) && safeUrl(d.url) && date(d.at) && text(d.rollback) && d.candidateSha === f.candidateSha, `${where}: production deployment receipt is missing or mismatched`);
      for (const ac of acceptance.filter(object)) require(covered(ac, ['production']), `${where}: independent production smoke evidence missing for ${ac.id}`);
    }
    const minimum = { qa: 'qa_verified', preview: 'preview_approved', release: 'production_verified' }[gate];
    if (minimum) require(stage >= statuses.indexOf(minimum), `${where}: ${gate} gate requires ${minimum}`);
  }
  for (const [id, deps] of graph) for (const dep of deps) require(ids.has(dep), `${id}: unknown dependency ${dep}`);
  const active = new Set(); const visited = new Set();
  function visit(id) {
    if (active.has(id)) { errors.push(`${id}: dependency cycle`); return; }
    if (visited.has(id)) return;
    active.add(id); for (const dep of graph.get(id) ?? []) if (ids.has(dep)) visit(dep);
    active.delete(id); visited.add(id);
  }
  for (const id of graph.keys()) visit(id);
  return errors;
}

export async function readProject(input) {
  const location = path.resolve(input);
  const info = await stat(location);
  const file = info.isDirectory() ? path.join(location, 'project.json') : location;
  if ((await stat(file)).size > 1024 * 1024) throw new Error('Project JSON exceeds 1 MiB');
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function initializeProject(target, { name, key: productKey, apply = false } = {}) {
  if (!text(name) || !key(productKey)) throw new Error('Provide a name and uppercase key (2-16 letters/digits)');
  const parent = await realpath(target);
  if (!(await stat(parent)).isDirectory()) throw new Error('Target must be an existing directory');
  const destination = path.join(parent, '.product-kit');
  try { await lstat(destination); throw new Error('.product-kit already exists; no files were overwritten'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!apply) return { applied: false, destination, files: ['project.json', 'PRD.md', 'SPRINT.md', 'HANDOFF.md', 'QA.md', 'RELEASE.md'], message: 'Dry run. Add --apply to create only this directory.' };
  // mkdir is exclusive; another initializer cannot claim the same destination.
  await mkdir(destination);
  const seed = JSON.parse(await readFile(new URL('../templates/project.json', import.meta.url), 'utf8'));
  seed.product = { name, key: productKey };
  seed.features[0].id = `${productKey}-001`;
  await writeFile(path.join(destination, 'project.json'), `${JSON.stringify(seed, null, 2)}\n`, { flag: 'wx' });
  for (const file of ['PRD.md', 'SPRINT.md', 'HANDOFF.md', 'QA.md', 'RELEASE.md']) {
    await writeFile(path.join(destination, file), await readFile(new URL(`../templates/${file}`, import.meta.url)), { flag: 'wx' });
  }
  return { applied: true, destination, message: 'Scaffold only. Replace the example story and refine before development; existing agent configuration was not changed.' };
}

function assertValid(project) {
  const errors = validateProject(project);
  if (errors.length) throw new Error(errors.join('\n'));
}
export function jiraPlan(project) {
  assertValid(project);
  return { schemaVersion: 1, applied: false, purpose: 'Human-reviewed Jira reconciliation proposal; not a Jira API payload or a sync receipt.', changes: project.features.map(f => ({
    operation: f.jiraKey ? 'review_update' : 'review_create', requirementId: f.id, issueKey: f.jiraKey ?? null,
    proposed: { summary: `[${f.id}] ${f.title}`, outcome: f.outcome, acceptance: f.acceptance, dependencies: f.dependencies, exclusions: f.outOfScope, metrics: f.metrics },
    preserve: ['assignee', 'workflow status', 'sprint', 'history'], conflictPolicy: 'Read existing issue, review diff, apply only approved fields, verify readback.'
  })) };
}
const plain = value => String(value).replace(/[\x00-\x1f\x7f-\x9f]/g, ' ');
export function projectReport(project) {
  assertValid(project);
  const lines = [`${plain(project.product.name)}: ${project.features.length} features`, 'STRUCTURAL REPORT ONLY - evidence authenticity and live operation are not verified.'];
  for (const f of project.features) {
    lines.push(`${plain(f.id)} | ${f.status} | ${plain(f.owner)} | ${plain(f.title)}`);
    for (const m of f.metrics) lines.push(`  ${plain(m.name)}: ${plain(m.measurement)} (target: ${plain(m.target)})`);
    if (f.blocker) lines.push(`  BLOCKER: ${plain(f.blocker.reason)}; next: ${plain(f.blocker.nextAction)}`);
  }
  return `${lines.join('\n')}\n`;
}
