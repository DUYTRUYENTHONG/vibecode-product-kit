const toolKinds = new Set(['test', 'build', 'format', 'status', 'metrics']);
const planningKinds = new Set(['planning', 'specification', 'review']);
const implementationKinds = new Set(['coding', 'research', 'documentation', 'debugging']);

// Opt-in owner policy, not a claim about provider availability or relative prices.
export function routeTask(kind, { preset, complexity = 'routine', sensitive = false } = {}) {
  if (preset !== 'stos-approved') throw new Error('Use the explicitly adopted --preset stos-approved');
  if (!['simple', 'routine', 'complex'].includes(complexity)) throw new Error('Invalid complexity');
  if (typeof sensitive !== 'boolean') throw new Error('Invalid sensitive flag');
  let execution = 'agent'; let model; let effort;
  if (toolKinds.has(kind)) { execution = 'tools'; model = null; effort = null; }
  else if (planningKinds.has(kind)) { model = 'gpt-6-astra'; effort = 'high'; }
  else if (!implementationKinds.has(kind)) throw new Error('Unknown task kind');
  else if (sensitive || complexity === 'complex') { model = 'gpt-5.6-sol'; effort = 'high'; }
  else if (complexity === 'simple') { model = 'gpt-5.6-luna'; effort = 'low'; }
  else { model = 'gpt-5.6-terra'; effort = 'medium'; }
  return { preset, kind, complexity, sensitive, execution, model, effort, dispatched: false,
    note: 'Validate availability and apply an explicit override to the existing owner. No fallback or model switch was performed.' };
}
