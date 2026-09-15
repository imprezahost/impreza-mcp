import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const tests = readdirSync(new URL('./', import.meta.url)).filter(name => name.endsWith('-mcp.mjs')).sort();
if (!tests.length) throw new Error('No MCP contract tests found.');
for (const name of tests) {
  console.log('\nRunning ' + name);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(name, import.meta.url))], { cwd: root, stdio: 'inherit', timeout: 120000 });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || ('Contract failed: ' + name));
    process.exit(1);
  }
}
console.log('\nPASS: ' + tests.length + ' MCP contract suites.');
