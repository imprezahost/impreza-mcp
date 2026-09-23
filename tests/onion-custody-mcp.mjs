import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/onion-custody-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://onion-custody.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'onion-custody-test', version: '1.0.0'});
const parse = (result) => JSON.parse(result.content[0].text);
const PUB = Buffer.alloc(32, 7).toString('base64'); // canonical base64 of 32 bytes
const ONION = 'a'.repeat(56) + '.onion';
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const exp = tools.tools.find(t => t.name === 'impreza_export_onion_key');
 const fetchT = tools.tools.find(t => t.name === 'impreza_fetch_onion_key_export');
 const rot = tools.tools.find(t => t.name === 'impreza_rotate_onion_key');
 const deployCustom = tools.tools.find(t => t.name === 'impreza_deploy_custom');
 const deployCatalog = tools.tools.find(t => t.name === 'impreza_deploy_catalog_app');
 assert(exp && fetchT && rot && deployCustom && deployCatalog);
 assert.deepEqual(exp.inputSchema.required.sort(), ['confirm', 'deployment_id', 'recipient_pubkey']);
 assert.deepEqual(rot.inputSchema.required.sort(), ['confirm', 'confirm_address', 'deployment_id']);
 assert.equal(rot.annotations.destructiveHint, true, 'rotate kills the old address — destructive');
 assert.equal(fetchT.annotations.readOnlyHint, false, 'fetch burns the blob — not read-only');
 assert.equal(exp.annotations.readOnlyHint, false);
 for (const t of [deployCustom, deployCatalog]) {
  const oi = t.inputSchema.properties.onion_import;
  assert.equal(oi?.type, 'object', t.name + ' onion_import is the two-file object');
  assert.deepEqual(oi?.required, ['secret_key_b64', 'public_key_b64'], t.name + ' requires BOTH key files');
 }

 // export: missing confirm and malformed pubkeys refused before any HTTP call.
 for (const args of [
  {deployment_id: 'dpl_test', recipient_pubkey: PUB},
  {deployment_id: 'dpl_test', recipient_pubkey: PUB, confirm: false},
  {deployment_id: 'dpl_test', recipient_pubkey: 'not-base64!!!', confirm: true},
  {deployment_id: 'dpl_test', recipient_pubkey: Buffer.alloc(16, 1).toString('base64'), confirm: true},
  {recipient_pubkey: PUB, confirm: true},
 ]) {
  const result = await client.callTool({name: 'impreza_export_onion_key', arguments: args});
  assert.equal(result.isError, true, JSON.stringify(args));
 }

 // export → POST {recipient_pubkey, confirm:true} on the export route.
 {
  const result = await client.callTool({name: 'impreza_export_onion_key', arguments: {deployment_id: 'dpl_test', recipient_pubkey: PUB, confirm: true}});
  assert(!result.isError);
  const data = parse(result);
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/export');
  assert.deepEqual(data.body, {recipient_pubkey: PUB, confirm: true});
 }

 // fetch: bad command_id refused locally; real read works ONCE, second read 404s.
 {
  const bad = await client.callTool({name: 'impreza_fetch_onion_key_export', arguments: {deployment_id: 'dpl_test', command_id: '../escape'}});
  assert.equal(bad.isError, true);
  const first = await client.callTool({name: 'impreza_fetch_onion_key_export', arguments: {deployment_id: 'dpl_test', command_id: 'cmd_export1'}});
  assert(!first.isError);
  const data = parse(first);
  assert.equal(data.command_id, 'cmd_export1');
  assert.equal(data.sealed, 'SEALED-BLOB-B64');
  assert.equal(data.onion, ONION);
  const second = await client.callTool({name: 'impreza_fetch_onion_key_export', arguments: {deployment_id: 'dpl_test', command_id: 'cmd_export1'}});
  assert.equal(second.isError, true, 'second read must fail — the blob is burned');
 }

 // rotate: missing confirm / mismatched-shaped address refused locally; good call dispatches.
 for (const args of [
  {deployment_id: 'dpl_test', confirm_address: ONION},
  {deployment_id: 'dpl_test', confirm: true, confirm_address: 'not-an-onion'},
  {deployment_id: 'dpl_test', confirm: true, confirm_address: ONION.toUpperCase()},
  {deployment_id: 'dpl_test', confirm: true},
 ]) {
  const result = await client.callTool({name: 'impreza_rotate_onion_key', arguments: args});
  assert.equal(result.isError, true, JSON.stringify(args));
 }
 {
  const result = await client.callTool({name: 'impreza_rotate_onion_key', arguments: {deployment_id: 'dpl_test', confirm: true, confirm_address: ONION}});
  assert(!result.isError);
  const data = parse(result);
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/rotate');
  assert.deepEqual(data.body, {confirm: true, confirm_address: ONION});
 }

 // deploy bodies: onion_import (BOTH key files) forwarded with onion; refused without it.
 const IMPORT = {secret_key_b64: Buffer.alloc(96, 3).toString('base64'), public_key_b64: Buffer.alloc(64, 4).toString('base64')};
 {
  const ok = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't1', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_import: IMPORT}});
  assert(!ok.isError, ok.content?.[0]?.text);
  assert.deepEqual(parse(ok).body.onion_import, IMPORT);
  const refused = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't2', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion_import: IMPORT}});
  assert.equal(refused.isError, true, 'onion_import without onion must be refused');
  const missingPub = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't3', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_import: {secret_key_b64: IMPORT.secret_key_b64}}});
  assert.equal(missingPub.isError, true, 'secret file without the public file must be refused');
  const wrongSize = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't4', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_import: {secret_key_b64: IMPORT.public_key_b64, public_key_b64: IMPORT.public_key_b64}}});
  assert.equal(wrongSize.isError, true, 'wrong-size key files must be refused');
  const cat = await client.callTool({name: 'impreza_deploy_catalog_app', arguments: {app_name: 'vaultwarden', agent_id: 'agt_test', onion: true, onion_import: IMPORT}});
  assert(!cat.isError);
  assert.deepEqual(parse(cat).body.onion_import, IMPORT);
 }

 // Purge and private preview requests preserve explicit gates and exact bodies.
 const purge=tools.tools.find(t=>t.name==='impreza_purge_onion_key');
 assert.equal(purge.annotations.destructiveHint,true);
 for(const args of [{deployment_id:'dpl_test',confirm_address:ONION},{deployment_id:'dpl_test',confirm:true,confirm_address:'bad'}]) {
  assert.equal((await client.callTool({name:purge.name,arguments:args})).isError,true);
 }
 const pg=parse(await client.callTool({name:purge.name,arguments:{deployment_id:'dpl_test',confirm:true,confirm_address:ONION}}));
 assert.equal(pg.path,'/v1/platform/deployments/dpl_test/onion/purge');
 assert.deepEqual(pg.body,{confirm:true,confirm_address:ONION});
 const dep='dpl_'+'a'.repeat(16);
 const clients=[{name:'reviewer',pubkey:'A'.repeat(52)}];
 for(const privacy of [{private:true},{onion_clients:clients}]) {
  const result=await client.callTool({name:'impreza_create_preview',arguments:{deployment_id:dep,branch:'review',...privacy}});
  assert(!result.isError,result.content?.[0]?.text);
  assert.deepEqual(parse(result).body,{branch:'review',...privacy});
 }
 for(const invalid of [{onion_clients:[]},{private:true,protect:true},{onion_clients:clients,protect:true},{onion_clients:[{name:'../escape',pubkey:'A'.repeat(52)}]}]) {
  assert.equal((await client.callTool({name:'impreza_create_preview',arguments:{deployment_id:dep,branch:'review',...invalid}})).isError,true);
 }
 console.log('PASS: onion custody tools — schema, annotations, sealed export dispatch, read-once burn, rotate gates, onion_import forwarding.');
} finally { await client.close(); }
