import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('onion-profile-test',{host:'onion-profile.invalid'});const client=mcp.client;
let secrets=0; // the fixture numbers its synthetic one-time secrets per server process
try {
 await mcp.connect();
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
 assert.equal(mcp.count(), 0, 'refused input must make no HTTP request');

 // set_onion_profile → POST {profile} on the profile route.
 {
  const result = await client.callTool({name: 'impreza_set_onion_profile', arguments: {deployment_id: 'dpl_test', profile: 'hardened'}});
  assert(!result.isError);
  assert.deepEqual(result.structuredContent, sample('impreza_set_onion_profile:queue_profile'));
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/dpl_test/onion/profile');
  assert.deepEqual(data.body, {profile: 'hardened'});
 }

 // add_onion forwards the tier when given, and posts an empty body without it.
 {
  const r = await client.callTool({name: 'impreza_add_onion', arguments: {deployment_id: 'dpl_test', onion_profile: 'max'}});
  assert(!r.isError, JSON.stringify(r));
  assert.deepEqual(r.structuredContent, sample('impreza_add_onion:queue_onion_mirror'));
  const withTier = mcp.last();
  assert.equal(withTier.method, 'POST');
  assert.equal(withTier.path, '/v1/platform/deployments/dpl_test/onion/add');
  assert.deepEqual(withTier.body, {onion_profile: 'max'});
  assert(!(await client.callTool({name: 'impreza_add_onion', arguments: {deployment_id: 'dpl_test'}})).isError);
  assert.deepEqual(mcp.last().body, {});
 }

 // catalog deploy forwards onion + onion_profile.
 {
  const result = await client.callTool({name: 'impreza_deploy_catalog_app', arguments: {app_name: 'vaultwarden', agent_id: 'agt_test', onion: true, onion_profile: 'hardened'}});
  assert(!result.isError);
  // Credentials generated at creation are shown once: in the text, never in structuredContent or the log.
  assert.deepEqual(result.structuredContent, sample('impreza_deploy_catalog_app:generated_credentials'));
  mcp.secretKept(result, 'credentials', {ADMIN_PASSWORD: 'synthetic-secret-' + (++secrets)});
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments');
  assert.equal(data.body.onion, true);
  assert.equal(data.body.onion_profile, 'hardened');
 }

 // custom deploy (image mode) forwards the tier; tier without onion is refused locally.
 {
  const ok = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't1', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion: true, onion_profile: 'max'}});
  assert(!ok.isError, ok.content?.[0]?.text);
  assert.deepEqual(ok.structuredContent, sample('impreza_deploy_custom:image_onion_only'));
  const data = mcp.last();
  assert.equal(data.path, '/v1/platform/deployments/custom');
  assert.equal(data.body.onion, true);
  assert.equal(data.body.onion_profile, 'max');
  const before = mcp.count();
  const refused = await client.callTool({name: 'impreza_deploy_custom', arguments: {name: 't2', agent_id: 'agt_test', mode: 'image', image: 'ghcr.io/x/y:1', onion_profile: 'max'}});
  assert.equal(refused.isError, true, 'onion_profile without onion must be refused');
  assert.equal(mcp.count(), before, 'the refused deploy made no HTTP request');
 }
 console.log('PASS: onion profile tools — tier enum, exact dispatch, deploy/add_onion forwarding, tier-without-onion refused.');
} finally { await mcp.close(); }
