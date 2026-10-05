import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
// A well-formed X25519 public key in the base32 form the API stores.
const PUB = 'B'.repeat(51) + 'A';
const mcp = loggedClient('onion-auth-test', {host: 'onion-auth.invalid'}); const client = mcp.client;
try {
 await mcp.connect();
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
 assert.equal(mcp.count(), 0, 'refused input must make no HTTP request');

 // list → GET on the clients collection.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_list', arguments: {deployment_id: 'dpl_test'}});
  assert(!result.isError, JSON.stringify(result));
  const data = mcp.last();
  assert.equal(data.method, 'GET');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/clients');
  const expected = sample('impreza_onion_auth_list:restricted');
  assert.deepEqual(result.structuredContent, expected);
  assert.equal(result.structuredContent.restricted, expected.restricted);
  assert.deepEqual(result.structuredContent.clients, expected.clients);
 }

 // add with a customer-supplied pubkey → POST {name, pubkey}, no private_key back.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test', name: 'alice', pubkey: PUB}});
  assert(!result.isError);
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/clients');
  assert.deepEqual(data.body, {name: 'alice', pubkey: PUB});
  assert.equal(JSON.parse(result.content[0].text).private_key, undefined);
 }

 // add with generate → POST {name, generate:true}, private_key shown once with a warning.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_add', arguments: {deployment_id: 'dpl_test', name: 'bob', generate: true}});
  assert(!result.isError);
  // The JSON is the first block (so the tool keeps its structuredContent), the
  // one-time warning the second.
  const json = JSON.parse(result.content[0].text);
  const warning = result.content[1].text;
  assert.match(warning, /SAVE THIS PRIVATE KEY NOW/);
  assert.match(warning, /shown exactly once/);
  assert.match(warning, /never stored/);
  assert.deepEqual(mcp.last().body, {name: 'bob', generate: true});
  // The private key is in the text once and never in structuredContent or the request log.
  mcp.secretKept(result, 'private_key', json.private_key);
 }

 // revoke → DELETE on the named client, path-escaped.
 {
  const result = await client.callTool({name: 'impreza_onion_auth_revoke', arguments: {deployment_id: 'dpl_test', name: 'alice'}});
  assert(!result.isError);
  const data = mcp.last();
  assert.equal(data.method, 'DELETE');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/clients/alice');
 }
 console.log('PASS: onion-auth tools — schema, annotations, exact REST dispatch, one-time private_key warning.');
} finally { await mcp.close(); }
