import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
// Inbound access (per-deployment ingress allowlists): read, and the complete
// desired state as a write that needs confirm=true when it restricts.
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/ingress-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://ingress.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'ingress-test', version: '1.0.0'});
const parse = (result) => JSON.parse(result.content[0].text);
const restrict = {deployment_id: 'dpl_test', base_revision: 3, rules: [{port: 5432, protocol: 'tcp', sources: ['203.0.113.0/24', '2001:db8::/48']}]};
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const get = tools.tools.find(t => t.name === 'impreza_get_ingress');
 const set = tools.tools.find(t => t.name === 'impreza_set_ingress');
 assert(get && set, 'both tools are listed');
 assert.equal(get.annotations.readOnlyHint, true, 'the read is read-only');
 assert.equal(set.annotations.destructiveHint, true, 'restricting can block the caller: destructive');
 assert.deepEqual(set.inputSchema.required.sort(), ['base_revision', 'deployment_id', 'rules']);
 assert.equal(set.inputSchema.properties.confirm.const, true);

 // read → GET on the ingress route.
 {
  const data = parse(await client.callTool({name: 'impreza_get_ingress', arguments: {deployment_id: 'dpl_test'}}));
  assert.equal(data.method, 'GET');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/ingress');
 }
 // Restricting without confirm, or with anything but true, is refused before any HTTP call.
 for (const extra of [{}, {confirm: false}, {confirm: 'true'}]) {
  const r = await client.callTool({name: 'impreza_set_ingress', arguments: {...restrict, ...extra}});
  assert.equal(r.isError, true, JSON.stringify(extra));
 }
 // Malformed rules are refused before any HTTP call.
 for (const bad of [
  {...restrict, rules: [{port: 0, protocol: 'tcp', sources: ['203.0.113.0/24']}]},
  {...restrict, rules: [{port: 5432, protocol: 'sctp', sources: ['203.0.113.0/24']}]},
  {...restrict, rules: [{port: 5432, protocol: 'tcp', sources: []}]},
  {...restrict, rules: [{port: 5432, protocol: 'tcp', sources: ['203.0.113.0/24'], extra: 1}]},
  {...restrict, base_revision: -1},
  {...restrict, unknown: 1},
 ]) {
  const r = await client.callTool({name: 'impreza_set_ingress', arguments: {...bad, confirm: true}});
  assert.equal(r.isError, true, JSON.stringify(bad));
 }
 // With confirm → PUT with the complete state, nothing else.
 {
  const r = await client.callTool({name: 'impreza_set_ingress', arguments: {...restrict, confirm: true}});
  assert(!r.isError);
  const data = parse(r);
  assert.equal(data.method, 'PUT');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/ingress');
  assert.deepEqual(data.body, {base_revision: 3, rules: restrict.rules});
 }
 // Opening every port needs no confirmation.
 {
  const data = parse(await client.callTool({name: 'impreza_set_ingress', arguments: {deployment_id: 'dpl_test', base_revision: 4, rules: []}}));
  assert.deepEqual(data.body, {base_revision: 4, rules: []});
 }
 // Four HTTP calls reached the API: two reads, the confirmed write and the open.
 const last = parse(await client.callTool({name: 'impreza_get_ingress', arguments: {deployment_id: 'dpl_test'}}));
 assert.equal(last.request_count, 4, 'every refusal stayed local');
 console.log('PASS: local inbound access tools read, refuse to restrict without confirm=true, validate the rules locally and PUT the complete state');
} finally {
 await client.close();
}
