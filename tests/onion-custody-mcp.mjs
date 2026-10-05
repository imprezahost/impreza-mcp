import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp = loggedClient('onion-custody-test', {host: 'onion-custody.invalid'}); const client = mcp.client;
let secrets = 0; // the fixture numbers its synthetic one-time secrets per server process
const PUB = Buffer.alloc(32, 7).toString('base64'); // canonical base64 of 32 bytes
const ONION = 'a'.repeat(56) + '.onion';
try {
 await mcp.connect();
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
 assert.equal(mcp.count(), 0, 'refused export input must make no HTTP request');

 // export → POST {recipient_pubkey, confirm:true} on the export route.
 {
  const result = await client.callTool({name: 'impreza_export_onion_key', arguments: {deployment_id: 'dpl_test', recipient_pubkey: PUB, confirm: true}});
  assert(!result.isError);
  assert.deepEqual(result.structuredContent, sample('impreza_export_onion_key:queue_export_after_confirmation'));
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/export');
  assert.deepEqual(data.body, {recipient_pubkey: PUB, confirm: true});
 }

 // fetch: bad command_id refused locally; real read works ONCE, second read 404s.
 {
  const bad = await client.callTool({name: 'impreza_fetch_onion_key_export', arguments: {deployment_id: 'dpl_test', command_id: '../escape'}});
  assert.equal(bad.isError, true);
  assert.equal(mcp.count(), 1, 'a malformed command_id must make no HTTP request');
  const first = await client.callTool({name: 'impreza_fetch_onion_key_export', arguments: {deployment_id: 'dpl_test', command_id: 'cmd_export1'}});
  assert(!first.isError, JSON.stringify(first));
  const read = mcp.last();
  assert.equal(read.method, 'GET');
  assert.equal(read.path, '/v1/platform/deployments/dpl_test/onion/export/cmd_export1');
  assert.equal(mcp.count(), 2);
  // The sealed blob is a one-time secret: in the text, never in structuredContent or the log.
  const exported = sample('impreza_fetch_onion_key_export:read_sealed_once');
  assert.deepEqual(first.structuredContent, exported);
  mcp.secretKept(first, 'sealed', 'synthetic-secret-' + (++secrets));
  const data = JSON.parse(first.content[0].text);
  assert.equal(data.command_id, exported.command_id);
  assert.equal(data.onion, exported.onion);
  const second = await client.callTool({name: 'impreza_fetch_onion_key_export', arguments: {deployment_id: 'dpl_test', command_id: 'cmd_export1'}});
  assert.equal(second.isError, true, 'second read must fail — the blob is burned');
  assert.equal(second.structuredContent, undefined, 'an error carries no structured content');
  assert.equal(mcp.last().path, read.path);
  assert.equal(mcp.count(), 3);
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
 assert.equal(mcp.count(), 3, 'refused rotate input must make no HTTP request');
 {
  const result = await client.callTool({name: 'impreza_rotate_onion_key', arguments: {deployment_id: 'dpl_test', confirm: true, confirm_address: ONION}});
  assert(!result.isError);
  assert.deepEqual(result.structuredContent, sample('impreza_rotate_onion_key:queue_rotation_after_confirmation'));
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/rotate');
  assert.deepEqual(data.body, {confirm: true, confirm_address: ONION});
 }

 // deploy bodies: onion_import (BOTH key files) forwarded with onion; refused without it.
 const IMPORT = {secret_key_b64: Buffer.alloc(96, 3).toString('base64'), public_key_b64: Buffer.alloc(64, 4).toString('base64')};
 {
  const ok = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't1', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_import: IMPORT}});
  assert(!ok.isError, ok.content?.[0]?.text);
  assert.deepEqual(ok.structuredContent, sample('impreza_deploy_custom:image_onion_only'));
  assert.equal(mcp.last().path, '/v1/platform/deployments/custom');
  assert.deepEqual(mcp.last().body.onion_import, IMPORT);
  const beforeRefusals = mcp.count();
  const refused = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't2', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion_import: IMPORT}});
  assert.equal(refused.isError, true, 'onion_import without onion must be refused');
  const missingPub = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't3', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_import: {secret_key_b64: IMPORT.secret_key_b64}}});
  assert.equal(missingPub.isError, true, 'secret file without the public file must be refused');
  const wrongSize = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't4', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_import: {secret_key_b64: IMPORT.public_key_b64, public_key_b64: IMPORT.public_key_b64}}});
  assert.equal(wrongSize.isError, true, 'wrong-size key files must be refused');
  assert.equal(mcp.count(), beforeRefusals, 'refused imports must make no HTTP request');
  const cat = await client.callTool({name: 'impreza_deploy_catalog_app', arguments: {app_name: 'vaultwarden', agent_id: 'agt_test', onion: true, onion_import: IMPORT}});
  assert(!cat.isError);
  // Credentials generated at creation are shown once: in the text, never in structuredContent or the log.
  assert.deepEqual(cat.structuredContent, sample('impreza_deploy_catalog_app:generated_credentials'));
  mcp.secretKept(cat, 'credentials', {ADMIN_PASSWORD: 'synthetic-secret-' + (++secrets)});
  assert.equal(mcp.last().path, '/v1/platform/deployments');
  assert.deepEqual(mcp.last().body.onion_import, IMPORT);
 }

 // Purge and private preview requests preserve explicit gates and exact bodies.
 const purge=tools.tools.find(t=>t.name==='impreza_purge_onion_key');
 assert.equal(purge.annotations.destructiveHint,true);
 const beforePurge=mcp.count();
 for(const args of [{deployment_id:'dpl_test',confirm_address:ONION},{deployment_id:'dpl_test',confirm:true,confirm_address:'bad'}]) {
  assert.equal((await client.callTool({name:purge.name,arguments:args})).isError,true);
 }
 assert.equal(mcp.count(),beforePurge,'refused purge input must make no HTTP request');
 const purged=await client.callTool({name:purge.name,arguments:{deployment_id:'dpl_test',confirm:true,confirm_address:ONION}});
 assert(!purged.isError,JSON.stringify(purged));
 assert.deepEqual(purged.structuredContent,sample('impreza_purge_onion_key:agent_mode_retained_identity'));
 const pg=mcp.last();
 assert.equal(pg.method,'POST');
 assert.equal(pg.path,'/v1/platform/deployments/dpl_test/onion/purge');
 assert.deepEqual(pg.body,{confirm:true,confirm_address:ONION});
 const dep='dpl_'+'a'.repeat(16);
 const clients=[{name:'reviewer',pubkey:'A'.repeat(52)}];
 for(const privacy of [{private:true},{onion_clients:clients}]) {
  const result=await client.callTool({name:'impreza_create_preview',arguments:{deployment_id:dep,branch:'review',...privacy}});
  assert(!result.isError,result.content?.[0]?.text);
  const sent=mcp.last();
  assert.equal(sent.method,'POST');assert.equal(sent.path,'/v1/platform/deployments/custom/'+dep+'/previews');
  assert.deepEqual(sent.body,{branch:'review',...privacy});
  if(privacy.private){
   // A minted reviewer key is a one-time secret: in the text, never in structuredContent or the log.
   assert.deepEqual(result.structuredContent,sample('impreza_create_preview:private_minted_key'));
   mcp.secretKept(result,'reviewer_private_key','synthetic-secret-'+(++secrets));
  } else {
   assert.deepEqual(result.structuredContent,sample('impreza_create_preview:private_given_keys'));
   assert(!result.content[0].text.includes('reviewer_private_key'),'customer-supplied keys mint no private key');
  }
 }
 const beforeInvalid=mcp.count();
 for(const invalid of [{onion_clients:[]},{private:true,protect:true},{onion_clients:clients,protect:true},{onion_clients:[{name:'../escape',pubkey:'A'.repeat(52)}]}]) {
  assert.equal((await client.callTool({name:'impreza_create_preview',arguments:{deployment_id:dep,branch:'review',...invalid}})).isError,true);
 }
 assert.equal(mcp.count(),beforeInvalid,'invalid previews must make no HTTP request');
 console.log('PASS: onion custody tools — schema, annotations, sealed export dispatch, read-once burn, rotate gates, onion_import forwarding.');
} finally { await mcp.close(); }
