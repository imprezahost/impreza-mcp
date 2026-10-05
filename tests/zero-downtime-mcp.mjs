import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
// Zero-downtime redeploys: the setting tool, the per-redeploy choice and
// the create opt-in reach the documented routes; anything malformed stays local.
const mcp=loggedClient('zero-downtime-test',{host:'zero-downtime.invalid'});const client=mcp.client;
try {
 await mcp.connect();
 const tools = await client.listTools();
 const set = tools.tools.find(t => t.name === 'impreza_set_zero_downtime');
 assert(set, 'impreza_set_zero_downtime is listed');
 assert.equal(set.annotations.idempotentHint, true, 'setting the same policy twice changes nothing');
 assert.notEqual(set.annotations.readOnlyHint, true, 'it writes');
 assert.deepEqual([...set.inputSchema.required].sort(), ['deployment_id', 'enabled']);
 const redeploy = tools.tools.find(t => t.name === 'impreza_redeploy_deployment');
 assert.equal(redeploy.inputSchema.properties.zero_downtime.type, 'boolean');
 const create = tools.tools.find(t => t.name === 'impreza_deploy_custom');
 assert.equal(create.inputSchema.properties.zero_downtime.type, 'boolean');

 // The setting → POST on the zero-downtime route, without the id in the body.
 {
  const r = await client.callTool({name: 'impreza_set_zero_downtime', arguments: {deployment_id: 'dpl_test', enabled: true, path: '/healthz', status_min: 200, status_max: 204, timeout_seconds: 90, drain_seconds: 10}});
  assert(!r.isError, JSON.stringify(r));
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/custom/dpl_test/zero-downtime');
  assert.deepEqual(data.body, {enabled: true, path: '/healthz', status_min: 200, status_max: 204, timeout_seconds: 90, drain_seconds: 10});
 }
 {
  const r = await client.callTool({name: 'impreza_set_zero_downtime', arguments: {deployment_id: 'dpl_test', enabled: false}});
  assert(!r.isError, JSON.stringify(r));
  assert.deepEqual(mcp.last().body, {enabled: false});
 }
 // Malformed settings are refused before any HTTP call.
 for (const bad of [
  {deployment_id: 'dpl_test'},
  {deployment_id: 'dpl_test', enabled: 'yes'},
  {deployment_id: 'dpl_test', enabled: true, path: 'healthz'},
  {deployment_id: 'dpl_test', enabled: true, path: '/../etc/passwd'},
  {deployment_id: 'dpl_test', enabled: true, path: '/a\r\nHost: evil'},
  {deployment_id: 'dpl_test', enabled: true, timeout_seconds: 5},
  {deployment_id: 'dpl_test', enabled: true, drain_seconds: 61},
  {deployment_id: 'dpl_test', enabled: true, status_min: 99},
  {deployment_id: 'dpl_test', enabled: true, unknown: 1},
  {deployment_id: '../dpl_test', enabled: true},
 ]) {
  const r = await client.callTool({name: 'impreza_set_zero_downtime', arguments: bad});
  assert.equal(r.isError, true, JSON.stringify(bad));
 }
 // The per-redeploy choice rides the redeploy body; only a boolean.
 {
  const r = await client.callTool({name: 'impreza_redeploy_deployment', arguments: {deployment_id: 'dpl_test', zero_downtime: false}});
  assert(!r.isError, JSON.stringify(r));
  assert.deepEqual(r.structuredContent, sample('impreza_redeploy_deployment:image_with_vars'));
  const data = mcp.last();
  assert.equal(data.method, 'POST');
  assert.equal(data.path, '/v1/platform/deployments/custom/dpl_test/redeploy');
  assert.deepEqual(data.body, {zero_downtime: false});
 }
 {
  const r = await client.callTool({name: 'impreza_redeploy_deployment', arguments: {deployment_id: 'dpl_test', zero_downtime: 'true'}});
  assert.equal(r.isError, true);
 }
 // The eligibility read → GET on the deployment's zero-downtime route,
 // the answer validated against the outputSchema and carried whole.
 const get = tools.tools.find(t => t.name === 'impreza_get_zero_downtime');
 assert(get, 'impreza_get_zero_downtime is listed');
 assert.equal(get.annotations.readOnlyHint, true, 'it only reads');
 assert.deepEqual(get.inputSchema.required, ['deployment_id']);
 assert(get.outputSchema && get.outputSchema.properties.zero_downtime, 'it declares the outputSchema');
 for (const [dep, key, codes] of [
  ['dpl_15e0000000000001', 'eligible', []],
  ['dpl_15e0000000000002', 'old_agent_opted_in', ['agent_unsupported']],
  ['dpl_15e0000000000003', 'several_reasons', ['multiple_services', 'fixed_host_port', 'writable_volume']],
  ['dpl_1a00000000000001', 'catalog', ['catalog_app']],
 ]) {
  const r = await client.callTool({name: 'impreza_get_zero_downtime', arguments: {deployment_id: dep}});
  assert(!r.isError, JSON.stringify(r));
  assert.deepEqual(r.structuredContent, sample('impreza_get_zero_downtime:' + key));
  assert.deepEqual(r.structuredContent.zero_downtime.reasons.map(x => x.code), codes);
  assert.equal(r.structuredContent.zero_downtime.eligible, codes.length === 0, 'eligible only with no reason at all');
  const data = mcp.last();
  assert.equal(data.method, 'GET');
  assert.equal(data.path, '/v1/platform/deployments/' + dep + '/zero-downtime');
 }
 for (const bad of [{}, {deployment_id: '../dpl_test'}, {deployment_id: 'dpl_test/../x'}, {deployment_id: 'dpl_test', extra: 1}]) {
  const r = await client.callTool({name: 'impreza_get_zero_downtime', arguments: bad});
  assert.equal(r.isError, true, JSON.stringify(bad));
 }
 // Eight HTTP calls reached the API: two settings, one redeploy, four reads and this last setting.
 const last = await client.callTool({name: 'impreza_set_zero_downtime', arguments: {deployment_id: 'dpl_test', enabled: false}});
 assert(!last.isError, JSON.stringify(last));
 assert.equal(mcp.count(), 8, 'every refusal stayed local');
 console.log('PASS: local zero-downtime tools post the setting, carry the per-redeploy choice, read the eligibility with every reason (validated against the outputSchema) and refuse malformed input locally');
} finally {
 await mcp.close();
}
