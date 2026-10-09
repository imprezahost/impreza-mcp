// Jurisdiction failover behind its gate, through the local server: with the failover routes
// unregistered (failover_enabled off) every failover tool returns the REST
// 404 as a clear error and sends exactly one request, no retry; with them on,
// another account's deployment is refused by the API and surfaced as such,
// and repeating the same reviewed apply sends the same body again and returns
// the API's own replayed receipt untouched.
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';

const dep = 'dpl_' + 'a'.repeat(16), target = 'dpl_' + 'b'.repeat(24), foreign = 'dpl_' + 'f'.repeat(16);
const cutover_id = 'fov_' + 'b'.repeat(24), failback_id = 'fbk_' + 'c'.repeat(24), drill_id = 'fdr_' + 'd'.repeat(24);
const review_digest = 'c'.repeat(64), backup_id = 'bkp_' + 'd'.repeat(16), restore_id = 'bkp_' + 'e'.repeat(16), deploy_command_id = 'cmd_' + 'f'.repeat(16);
const ALL = [
  ['impreza_declare_external_failover_country', {agent_id: 'agt_' + 'a'.repeat(16), country_code: 'FR'}],
  ['impreza_pair_failover_standby', {deployment_id: dep, target_deployment_id: target, mode: 'cold'}],
  ['impreza_get_failover_standby', {deployment_id: dep}],
  ['impreza_confirm_failover_sync', {deployment_id: dep, backup_id, restore_id, deploy_command_id}],
  ['impreza_prepare_failover', {deployment_id: dep}],
  ['impreza_get_failover', {cutover_id}],
  ['impreza_apply_failover', {cutover_id, review_digest, confirm: true}],
  ['impreza_retry_failover_activation', {cutover_id, review_digest, confirm: true}],
  ['impreza_prepare_failback', {cutover_id}],
  ['impreza_get_failback', {failback_id}],
  ['impreza_apply_failback', {failback_id, review_digest, confirm: true}],
  ['impreza_set_failover_drill_policy', {deployment_id: dep, interval_minutes: 60}],
  ['impreza_run_failover_drill', {deployment_id: dep}],
  ['impreza_get_failover_drill', {drill_id}],
];

async function server(mode) {
  const lines = [];
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', new URL('./fixtures/failover-gate-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))],
    env: {...process.env, FIXTURE_FAILOVER: mode, IMPREZA_BASE_URL: 'https://rollback.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential'},
    stderr: 'pipe',
  });
  const client = new Client({name: 'failover-gate-fixture', version: '1'});
  await client.connect(transport);
  transport.stderr.on('data', (d) => { for (const l of String(d).split('\n')) if (l.startsWith('FIXTURE_REQUEST ')) lines.push(JSON.parse(l.slice(16))); });
  const call = async (name, args) => { const out = await client.callTool({name, arguments: args}); return {error: !!out.isError, text: out.content?.[0]?.text ?? ''}; };
  const settle = () => new Promise((r) => setTimeout(r, 50));
  return {client, call, requests: lines, settle};
}

// Gate off: every tool, one request each, the REST 404 surfaced clearly.
let s = await server('off');
try {
  const listed = new Set((await s.client.listTools()).tools.map((t) => t.name));
  for (const [name] of ALL) assert(listed.has(name), name + ' is listed by the local package');
  for (const [name, args] of ALL) {
    const before = s.requests.length;
    const r = await s.call(name, args);
    await s.settle();
    assert(r.error, name + ' succeeded with the failover routes unregistered');
    assert(/NOT_FOUND/.test(r.text) && /Endpoint not found: (GET|POST) \/platform\//.test(r.text), name + ' did not surface the REST 404 clearly: ' + r.text);
    assert.equal(s.requests.length, before + 1, name + ' sent ' + (s.requests.length - before) + ' requests (expected exactly one, no retry)');
  }
} finally { await s.client.close(); }

// Gate on: another account's deployment, and a replayed reviewed apply.
s = await server('on');
try {
  for (const [name, args] of [
    ['impreza_get_failover_standby', {deployment_id: foreign}],
    ['impreza_pair_failover_standby', {deployment_id: foreign, target_deployment_id: target, mode: 'cold'}],
    ['impreza_prepare_failover', {deployment_id: foreign}],
    ['impreza_run_failover_drill', {deployment_id: foreign}],
  ]) {
    const r = await s.call(name, args);
    assert(r.error && /NOT_FOUND/.test(r.text) && /Deployment not found/.test(r.text), name + ': another account\'s deployment not surfaced as refused: ' + r.text);
  }
  const first = await s.call('impreza_apply_failover', {cutover_id, review_digest, confirm: true});
  const again = await s.call('impreza_apply_failover', {cutover_id, review_digest, confirm: true});
  await s.settle();
  assert(!first.error && !again.error, 'apply failed: ' + first.text + ' / ' + again.text);
  assert.equal(JSON.parse(first.text).replay, false);
  assert.equal(JSON.parse(again.text).replay, true, 'the API\'s replayed receipt was not returned untouched');
  const applies = s.requests.filter((q) => q.path.endsWith('/apply'));
  assert.equal(applies.length, 2);
  assert.deepEqual(applies[0], applies[1], 'a repeated apply must send the same reviewed body');
  assert.deepEqual(applies[0].body, {review_digest, confirm: true});
} finally { await s.client.close(); }

console.log('PASS: ' + ALL.length + ' failover tools surface the gate-off REST 404 with one request each; another account\'s deployment refused; a repeated apply resends the same body and returns the replayed receipt.');
