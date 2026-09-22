import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/onion-profile-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://onion-profile.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'onion-profile-test', version: '1.0.0'});
const parse = (result) => JSON.parse(result.content[0].text);
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const setProfile = tools.tools.find(t => t.name === 'impreza_set_onion_profile');
 const addOnion = tools.tools.find(t => t.name === 'impreza_add_onion');
 const deployCatalog = tools.tools.find(t => t.name === 'impreza_deploy_catalog_app');
 const deployCustom = tools.tools.find(t => t.name === 'impreza_deploy_custom');
 assert(setProfile && addOnion && deployCatalog && deployCustom);
 assert.deepEqual(setProfile.inputSchema.required.sort(), ['deployment_id', 'profile']);
 assert.deepEqual(setProfile.inputSchema.properties.profile.enum, ['standard', 'hardened', 'max']);
 assert.equal(setProfile.annotations.readOnlyHint, false);
 assert.equal(setProfile.annotations.idempotentHint, true, 'same tier twice converges');
 for (const t of [addOnion, deployCatalog, deployCustom]) {
  assert.deepEqual(t.inputSchema.properties.onion_profile?.enum, ['standard', 'hardened', 'max'], t.name + ' exposes the tier enum');
 }

 // set_onion_profile: invalid tier and missing args refused before any HTTP call.
 for (const args of [
  {deployment_id: 'dpl_test'},
  {deployment_id: 'dpl_test', profile: 'ultra'},
  {profile: 'max'},
 ]) {
  const result = await client.callTool({name: 'impreza_set_onion_profile', arguments: args});
  assert.equal(result.isError, true, JSON.stringify(args));
 }

 // set_onion_profile → POST {profile} on the profile route.
 {
  const result = await client.callTool({name: 'impreza_set_onion_profile', arguments: {deployment_id: 'dpl_test', profile: 'hardened'}});
  assert(!result.isError);
  const data = parse(result);
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/profile');
  assert.deepEqual(data.body, {profile: 'hardened'});
 }

 // add_onion forwards the tier when given, and posts an empty body without it.
 {
  const withTier = parse(await client.callTool({name: 'impreza_add_onion', arguments: {deployment_id: 'dpl_test', onion_profile: 'max'}}));
  assert.equal(withTier.path, '/v1/platform/deployments/dpl_test/onion/add');
  assert.deepEqual(withTier.body, {onion_profile: 'max'});
  const plain = parse(await client.callTool({name: 'impreza_add_onion', arguments: {deployment_id: 'dpl_test'}}));
  assert.deepEqual(plain.body, {});
 }

 // catalog deploy forwards onion + onion_profile.
 {
  const result = await client.callTool({name: 'impreza_deploy_catalog_app', arguments: {app_name: 'vaultwarden', agent_id: 'agt_test', onion: true, onion_profile: 'hardened'}});
  assert(!result.isError);
  const data = parse(result);
  assert.equal(data.path, '/v1/platform/deployments');
  assert.equal(data.body.onion, true);
  assert.equal(data.body.onion_profile, 'hardened');
 }

 // custom deploy (image mode) forwards the tier; tier without onion is refused locally.
 {
  const ok = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't1', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_profile: 'max'}});
  assert(!ok.isError, ok.content?.[0]?.text);
  const data = parse(ok);
  assert.equal(data.body.onion, true);
  assert.equal(data.body.onion_profile, 'max');
  const refused = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't2', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion_profile: 'max'}});
  assert.equal(refused.isError, true, 'onion_profile without onion must be refused');
 }
 console.log('PASS: onion profile tools — tier enum, exact dispatch, deploy/add_onion forwarding, tier-without-onion refused.');
} finally { await client.close(); }
