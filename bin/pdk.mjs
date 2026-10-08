#!/usr/bin/env node
import { initializeProject, readProject, validateProject, projectReport, jiraPlan } from '../lib/kit.mjs';

const help = `Vibecode Product Kit - offline product-delivery records

node bin/pdk.mjs init <existing-directory> --name "Product" --key DEMO [--apply]
node bin/pdk.mjs validate <directory-or-project.json> [--gate planning|qa|preview|release]
node bin/pdk.mjs report <directory-or-project.json>
node bin/pdk.mjs jira-export <directory-or-project.json>

init is a dry run unless --apply is present. No overwrite, network writes,
agent installation or shell command execution. Validation checks records,
not whether tests ran, approval is genuine, or production is healthy.
`;
async function main() {
  const [command, target, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === 'help') { console.log(help); return; }
  if (!['init', 'validate', 'report', 'jira-export'].includes(command) || !target || target.startsWith('--')) throw new Error('Invalid command or missing target. Use --help.');
  const allowed = command === 'init' ? ['--name', '--key', '--apply'] : command === 'validate' ? ['--gate'] : [];
  const flags = new Map();
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!allowed.includes(flag) || flags.has(flag)) throw new Error(`Unknown or duplicate option: ${flag}`);
    if (flag === '--apply') flags.set(flag, true);
    else { const value = args[++i]; if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`); flags.set(flag, value); }
  }
  if (command === 'init') {
    console.log(JSON.stringify(await initializeProject(target, { name: flags.get('--name'), key: flags.get('--key'), apply: flags.has('--apply') }), null, 2)); return;
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
