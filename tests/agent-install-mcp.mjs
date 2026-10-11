// The agent install through the local package: the same two calls as the
// hosted connector (the first installs nothing and explains the agent, the
// second spends the consent token), the read never hands a token, and every
// refused argument stays out of HTTP.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'agent-install-'));
const log = join(dir, 'requests.jsonl');
writeFileSync(log, '');
const requests = () => readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const t = new StdioClientTransport({ command: process.execPath, args: ['--import', new URL('./fixtures/agent-install-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))],
  env: { ...process.env, AGENT_INSTALL_LOG: log, IMPREZA_BASE_URL: 'https://agent-install-fixture.invalid', IMPREZA_API_KEY: 'fixture-only', IMPREZA_API_SECRET: 'fixture-only-not-a-real-credential' } });
const c = new Client({ name: 'agent-install-proof', version: '1.0.0' });
const token = (text) => (text.match(/confirm_token="([^"]+)"/) || [])[1] || '';
let cases = 0;
try {
  await c.connect(t);
  const tools = (await c.listTools()).tools;
  const install = tools.find((x) => x.name === 'impreza_install_agent');
  const read = tools.find((x) => x.name === 'impreza_get_agent_install');
  assert(install && read, 'both tools are listed');
  assert.equal(install.inputSchema.additionalProperties, false);
  assert.deepEqual(install.inputSchema.required, ['service_id']);
  assert(install.inputSchema.properties.confirm_token, 'install advertises confirm_token');
  assert(install.description.includes("NEEDS THE CUSTOMER'S AGREEMENT") && !install.description.includes('IRREVERSIBLE'));
  assert(install.description.includes('ONLY when what the customer asked for needs the agent'));
  assert.equal(install.annotations.readOnlyHint, false);
  assert.equal(read.annotations.readOnlyHint, true);
  cases++;

  // Refused before any request: bad arguments.
  for (const args of [{}, { service_id: 0 }, { service_id: -1 }, { service_id: '501' }, { service_id: 1.5 }, { service_id: 501, confirm: true }, { service_id: 501, confirm_token: '' }, { service_id: 501, confirm_token: 'x'.repeat(65) }]) {
    const r = await c.callTool({ name: 'impreza_install_agent', arguments: args });
    assert.equal(r.isError, true, JSON.stringify(args)); cases++;
  }
  for (const args of [{}, { service_id: '501' }, { service_id: 501, confirm_token: 'x' }]) {
    const r = await c.callTool({ name: 'impreza_get_agent_install', arguments: args });
    assert.equal(r.isError, true, JSON.stringify(args)); cases++;
  }
  assert.equal(requests().length, 0, 'a refused argument reached HTTP');

  // Not installable: the reason, no token, no POST.
  let r = await c.callTool({ name: 'impreza_install_agent', arguments: { service_id: 502 } });
  assert.equal(r.isError, true); assert.match(r.content[0].text, /NOT_INSTALLABLE: server_stopped/); assert.equal(token(r.content[0].text), ''); cases++;
  r = await c.callTool({ name: 'impreza_install_agent', arguments: { service_id: 601 } });
  assert.equal(r.isError, true); assert.match(r.content[0].text, /NOT_FOUND/); cases++;

  // Step 1: nothing installed, the agent explained, a token.
  r = await c.callTool({ name: 'impreza_install_agent', arguments: { service_id: 501 } });
  const text = r.content[0].text, t1 = token(text);
  assert.equal(r.isError, true);
  assert(text.includes('NOTHING has been installed yet') && text.includes('runs as root') && text.includes('never the content of the apps') && t1 !== '', text);
  assert(requests().every((q) => q.method === 'GET'), 'step 1 made a POST'); cases++;

  // The read never carries the token.
  r = await c.callTool({ name: 'impreza_get_agent_install', arguments: { service_id: 501 } });
  assert(!r.isError, JSON.stringify(r));
  assert(!r.content[0].text.includes('confirm_token') && !('confirm_token' in (r.structuredContent ?? {})), 'the read leaked a consent token');
  assert.equal(r.structuredContent.state, 'not_started'); cases++;

  // A token for another service does not install this one.
  r = await c.callTool({ name: 'impreza_install_agent', arguments: { service_id: 502, confirm_token: t1 } });
  assert.equal(r.isError, true); cases++;

  // Step 2: queued, pointing at the read tool.
  r = await c.callTool({ name: 'impreza_install_agent', arguments: { service_id: 501, confirm_token: t1 } });
  assert(!r.isError, JSON.stringify(r));
  const done = JSON.parse(r.content[0].text);
  assert.equal(done.status, 'queued'); assert.equal(done.job_id, 1401); assert.match(done.next, /impreza_get_agent_install/);
  const post = requests().filter((q) => q.method === 'POST');
  assert.deepEqual(post.at(-1), { method: 'POST', path: '/v1/platform/services/501/agent-install', body: { confirm_token: t1 } }); cases++;

  // The same token twice: refused by the API, nothing new queued.
  r = await c.callTool({ name: 'impreza_install_agent', arguments: { service_id: 501, confirm_token: t1 } });
  assert.equal(r.isError, true); assert.match(r.content[0].text, /CONFIRM_TOKEN_USED/); cases++;

  // Follow it.
  r = await c.callTool({ name: 'impreza_get_agent_install', arguments: { service_id: 501 } });
  assert.equal(r.structuredContent.state, 'installing'); assert.equal(r.structuredContent.job.status, 'pending'); cases++;

  console.log(JSON.stringify({ status: 'passed', cases, requests: requests().length }));
} finally {
  await c.close();
  rmSync(dir, { recursive: true, force: true });
}
