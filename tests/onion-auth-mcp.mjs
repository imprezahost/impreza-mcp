import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/onion-auth-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://onion-auth.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'onion-auth-test', version: '1.0.0'});
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const list = tools.tools.find(t => t.name === 'impreza_onion_auth_list');
 const add = tools.tools.find(t => t.name === 'impreza_onion_auth_add');
 const revoke = tools.tools.find(t => t.name === 'impreza_onion_auth_revoke');
 assert(list && add && revoke, 'the three onion-auth tools are registered');
 assert.equal(list.annotations.readOnlyHint, true);
 assert.equal(add.annotations.readOnlyHint, false);
 assert.equal(add.annotations.idempotentHint, false, 'add refuses duplicate names — not idempotent');
 assert.equal(revoke.annotations.readOnlyHint, false);
 assert.deepEqual(add.inputSchema.required, ['deployment_id', 'name']);
 assert.deepEqual(revoke.inputSchema.required, ['deployment_id', 'name']);

 // Missing / conflicting input is refused before any network call.
 for (const args of [
  {name: 'impreza_onion_auth_list', arguments: {}},
  {name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test'}},
  {name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test', name: 'alice'}},
  {name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test', name: 'alice', pubkey: 'p', generate: true}},
  {name: 'impreza_onion_auth_revoke', arguments: {deployment_id: 'dpl_test'}},
 ]) {
  const result = await client.callTool(args);
  assert.equal(result.isError, true, JSON.stringify(args));
 }

 // list → GET on the clients collection.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_list', arguments: {deployment_id: 'dpl_test'}});
  assert(!result.isError);
  const data = JSON.parse(result.content[0].text);
  assert.equal(data.method, 'GET');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/clients');
  assert.equal(data.restricted, true);
  assert.deepEqual(data.clients, [{name: 'alice', created_at: '2026-09-21T00:00:00Z'}]);
 }

 // add with a customer-supplied pubkey → POST {name, pubkey}, no private_key back.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test', name: 'alice', pubkey: 'x25519-pub-alice'}});
  assert(!result.isError);
  const data = JSON.parse(result.content[0].text);
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/clients');
  assert.deepEqual(data.body, {name: 'alice', pubkey: 'x25519-pub-alice'});
  assert.equal(data.private_key, undefined);
 }

 // add with generate → POST {name, generate:true}, private_key shown once with a warning.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test', name: 'bob', generate: true}});
  assert(!result.isError);
  const text = result.content[0].text;
  assert.match(text, /SAVE THIS PRIVATE KEY NOW/);
  assert.match(text, /shown exactly once/);
  assert.match(text, /never stored/);
  assert(text.includes('generated-x25519-private-key'), 'private_key is present in the one-time output');
  const json = JSON.parse(text.slice(text.indexOf('{')));
  assert.deepEqual(json.body, {name: 'bob', generate: true});
  assert.equal(json.private_key, 'generated-x25519-private-key');
 }

 // revoke → DELETE on the named client, path-escaped.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_revoke', arguments: {deployment_id: 'dpl_test', name: 'alice'}});
  assert(!result.isError);
  const data = JSON.parse(result.content[0].text);
  assert.equal(data.method, 'DELETE');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/clients/alice');
 }
 console.log('PASS: onion-auth tools — schema, annotations, exact REST dispatch, one-time private_key warning.');
} finally { await client.close(); }
