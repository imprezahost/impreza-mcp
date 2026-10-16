// impreza_add_server through the local package. The schema matches the
// hosted tool (optional label, nothing else), refused arguments stay out of
// HTTP, the answer carries the plan and the next step, the quota refusal is
// passed on, and the install token never reaches the server's own output.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'add-server-'));
const log = join(dir, 'requests.jsonl');
writeFileSync(log, '');
const requests = () => readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const t = new StdioClientTransport({ command: process.execPath, args: ['--import', new URL('./fixtures/add-server-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))],
  stderr: 'pipe',
  env: { ...process.env, ADD_SERVER_LOG: log, IMPREZA_BASE_URL: 'https://add-server-fixture.invalid', IMPREZA_API_KEY: 'fixture-only', IMPREZA_API_SECRET: 'fixture-only-not-a-real-credential' } });
let stderr = '';
t.stderr?.on('data', (chunk) => { stderr += String(chunk); });
const c = new Client({ name: 'add-server-proof', version: '1.0.0' });
let cases = 0;
try {
  await c.connect(t);
  const tool = (await c.listTools()).tools.find((x) => x.name === 'impreza_add_server');
  assert(tool, 'impreza_add_server is listed');
  assert.equal(tool.inputSchema.additionalProperties, false);
  assert.deepEqual(Object.keys(tool.inputSchema.properties), ['label']);
  assert.equal(tool.inputSchema.required, undefined);
  assert.equal(tool.annotations.readOnlyHint, false);
  assert.equal(tool.annotations.destructiveHint, false);
  assert.equal(tool.annotations.idempotentHint, false);
  assert(tool.description.includes('first external server is free') && tool.description.includes('10 minutes') && tool.description.includes('Requires deploy scope'));
  cases++;

  // Refused before any request.
  for (const args of [{ label: 7 }, { label: 'x'.repeat(121) }, { confirm: true }, { label: 'a', service_id: 1 }]) {
    const r = await c.callTool({ name: 'impreza_add_server', arguments: args });
    assert.equal(r.isError, true, JSON.stringify(args)); cases++;
  }
  assert.equal(requests().length, 0, 'a refused argument reached HTTP');

  // The API's own label rule is passed on (a control character).
  let r = await c.callTool({ name: 'impreza_add_server', arguments: { label: 'bell\u0007' } });
  assert.equal(r.isError, true); assert.match(r.content[0].text, /INVALID_REQUEST/); cases++;

  // The free server: token, one-liner, plan, next.
  r = await c.callTool({ name: 'impreza_add_server', arguments: { label: 'web-01 (Hetzner)' } });
  assert(!r.isError, JSON.stringify(r));
  const d = JSON.parse(r.content[0].text);
  assert.match(d.bootstrap_token, /^bts_[0-9a-f]{32}$/);
  assert(d.one_liner.includes(d.bootstrap_token));
  assert.equal(d.tier, 'starter'); assert.equal(d.quota, 1); assert.equal(d.used, 1); assert.match(d.plan, /Bundled/);
  assert.match(d.next, /impreza_list_servers/); assert.match(d.next, /expires_at/);
  assert.deepEqual(requests().at(-1), { method: 'POST', path: '/v1/platform/servers/external/bootstrap', body: { label: 'web-01 (Hetzner)' } }); cases++;

  // No label: an empty body, not a null label.
  r = await c.callTool({ name: 'impreza_add_server', arguments: {} });
  assert.equal(r.isError, true); assert.match(r.content[0].text, /QUOTA_EXCEEDED/);
  assert(!r.content[0].text.includes(d.bootstrap_token), 'the refusal repeated the token');
  assert.deepEqual(requests().at(-1).body, {}); cases++;

  await new Promise((resolve) => setTimeout(resolve, 100));
  assert(!stderr.includes(d.bootstrap_token), 'the install token reached the server log'); cases++;
  console.log(JSON.stringify({ status: 'passed', cases, requests: requests().length }));
} finally {
  await c.close();
  rmSync(dir, { recursive: true, force: true });
}
