#!/usr/bin/env node
import { initializeProject, readProject, validateProject, projectReport, jiraPlan } from '../lib/kit.mjs';
import { routeTask } from '../lib/routing.mjs';
import { installCodex } from '../lib/codex.mjs';

const help = `Codex Vibecode Pro Max Kit - product delivery and native Codex setup

node bin/pdk.mjs init <existing-directory> --name "Product" --key DEMO [--apply]
node bin/pdk.mjs validate <directory-or-project.json> [--gate planning|qa|preview|release]
node bin/pdk.mjs report <directory-or-project.json>
node bin/pdk.mjs jira-export <directory-or-project.json>
node bin/pdk.mjs route <kind> --preset stos-approved [--complexity simple|routine|complex] [--sensitive]
node bin/pdk.mjs codex-install <existing-directory> --preset stos-approved [--hooks] [--apply]

init and codex-install are dry runs unless --apply is present. No overwrite or network writes.
codex-install adds native profiles/skills; --hooks adds untrusted optional lifecycle hooks.
No agents are launched and hooks are not executed by installation. Validation checks records,
not whether tests ran, approval is genuine, or production is healthy.
`;
async function main() {
  const [command, target, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === 'help') { console.log(help); return; }
  if (!['init', 'validate', 'report', 'jira-export', 'route', 'codex-install'].includes(command) || !target || target.startsWith('--')) throw new Error('Invalid command or missing target. Use --help.');
  const allowed = command === 'init' ? ['--name', '--key', '--apply'] : command === 'validate' ? ['--gate'] : command === 'route' ? ['--preset', '--complexity', '--sensitive'] : command === 'codex-install' ? ['--preset', '--hooks', '--apply'] : [];
  const flags = new Map();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!allowed.includes(flag) || flags.has(flag)) throw new Error(`Unknown or duplicate option: ${flag}`);
    if (['--apply', '--sensitive', '--hooks'].includes(flag)) flags.set(flag, true);
    else { const value = args[++i]; if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`); flags.set(flag, value); }
  }
  if (command === 'init') {
    console.log(JSON.stringify(await initializeProject(target, { name: flags.get('--name'), key: flags.get('--key'), apply: flags.has('--apply') }), null, 2)); return;
  }
  if (command === 'route') {
    console.log(JSON.stringify(routeTask(target, { preset: flags.get('--preset'), complexity: flags.get('--complexity'), sensitive: flags.has('--sensitive') }), null, 2)); return;
  }
  if (command === 'codex-install') {
    console.log(JSON.stringify(await installCodex(target, { preset: flags.get('--preset'), hooks: flags.has('--hooks'), apply: flags.has('--apply') }), null, 2)); return;
  }
  const project = await readProject(target);
  if (command === 'validate') {
    const gate = flags.get('--gate') ?? 'planning'; const errors = validateProject(project, { gate });
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(`PASS: ${gate} record structure. Not independent QA, approval authentication or deployment verification.`);
  } else if (command === 'report') process.stdout.write(projectReport(project));
  else console.log(JSON.stringify(jiraPlan(project), null, 2));
}
main().catch(error => { console.error(`ERROR: ${error.message}`); process.exitCode = 1; });
