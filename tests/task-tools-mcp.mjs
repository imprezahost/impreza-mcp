import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

// Creating and changing a scheduled task are two tools with the hosted connector's names:
// impreza_create_task (POST /v1/tasks, needs deployment_id) and impreza_update_task
// (POST /v1/tasks/{id}, needs task_id). The old impreza_schedule_task chose by omitting
// task_id, which is the catch-all shape the plugin directories reject, and an agent saw a
// different surface on the local package than on the hosted connector.
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--import', new URL('./fixtures/vps-offer-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))],
  env: { ...process.env, IMPREZA_BASE_URL: 'https://vps-offer.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' },
});
const client = new Client({ name: 'task-tools-test', version: '1.0.0' });
const call = async (name, args) => {
  const out = await client.callTool({ name, arguments: args });
  return { error: !!out.isError, text: out.content[0].text, data: out.isError ? null : JSON.parse(out.content[0].text) };
};
try {
  await client.connect(transport);
  const tools = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t]));
  assert.equal(tools.impreza_schedule_task, undefined, 'the catch-all impreza_schedule_task is gone, as on the hosted connector');
  const create = tools.impreza_create_task;
  const update = tools.impreza_update_task;
  assert(create && update, 'impreza_create_task and impreza_update_task are listed');
  assert.deepEqual(create.inputSchema.required, ['deployment_id']);
  assert.equal(create.inputSchema.properties.task_id, undefined, 'creating takes no task_id');
  assert.deepEqual(update.inputSchema.required, ['task_id']);
  for (const f of ['name', 'kind', 'http_path', 'http_method', 'image', 'command', 'schedule', 'at_hour', 'at_weekday', 'enabled', 'keep_runs']) {
    assert(create.inputSchema.properties[f] && update.inputSchema.properties[f], 'both take ' + f);
  }
  assert.equal(create.annotations?.idempotentHint, false, 'every create makes a new task');
  assert.equal(update.annotations?.idempotentHint, true, 'the same change twice converges');
  for (const t of [create, update]) assert.equal(t.annotations?.destructiveHint, false, t.name + ' destroys nothing');
  assert.match(tools.impreza_delete_task.description, /impreza_update_task with enabled=false/, 'delete points at the tool that pauses');

  let r = await call('impreza_create_task', { deployment_id: 'dpl_a1b2c3d4e5f60718', name: 'nightly cleanup', kind: 'http', http_path: '/cron.php', schedule: 'daily', at_hour: 3 });
  assert.equal(r.data.method, 'POST');
  assert.equal(r.data.path, '/v1/tasks');
  assert.deepEqual(r.data.body, { deployment_id: 'dpl_a1b2c3d4e5f60718', name: 'nightly cleanup', kind: 'http', http_path: '/cron.php', schedule: 'daily', at_hour: 3 });
  r = await call('impreza_update_task', { task_id: 'tsk_a1b2c3d4e5f60718a1b2c3d4', enabled: false });
  assert.equal(r.data.path, '/v1/tasks/tsk_a1b2c3d4e5f60718a1b2c3d4');
  assert.deepEqual(r.data.body, { enabled: false }, 'only the fields that change; task_id is the path, not the body');
  r = await call('impreza_update_task', { task_id: 'tsk_x/../y', name: 'x' });
  assert.equal(r.data.path, '/v1/tasks/tsk_x%2F..%2Fy', 'the id is one encoded path segment');
  const before = r.data.request_count;

  for (const [tool, args, why] of [
    ['impreza_create_task', { name: 'no app' }, /deployment_id is required/],
    ['impreza_create_task', { deployment_id: '  ', name: 'blank app' }, /deployment_id is required/],
    ['impreza_update_task', { enabled: false }, /task_id is required/],
    ['impreza_update_task', { task_id: '   ' }, /task_id is required/],
  ]) {
    const bad = await call(tool, args);
    assert(bad.error && why.test(bad.text), 'refused: ' + tool + ' ' + JSON.stringify(args) + ' -> ' + bad.text);
  }
  r = await call('impreza_create_task', { deployment_id: 'dpl_a1b2c3d4e5f60718' });
  assert.equal(r.data.request_count, before + 1, 'refused calls made no request');

  console.log('PASS: create and update are separate tools with the hosted names, each on its endpoint, refusals before any request.');
} finally {
  await client.close();
}
