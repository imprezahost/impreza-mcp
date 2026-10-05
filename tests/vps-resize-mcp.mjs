import assert from 'node:assert/strict';
import { loggedClient } from './fixtures/request-log.mjs';

// Resizing the configurable VPS through the local server: impreza_vps_resize
// sends the new sizes, and max_amount when given, to POST
// /v1/services/{id}/resize. The API checks every size against the VPS; this
// pins the endpoint and the body, and that calls which cannot be a resize
// make no request at all. Requests are asserted from the request log.
const mcp = loggedClient('vps-resize-test', { host: 'vps-offer.invalid' });
const client = mcp.client;
const call = async (name, args) => {
  const out = await client.callTool({ name, arguments: args });
  return { error: !!out.isError, text: out.content[0].text };
};
try {
  await mcp.connect();
  const tools = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t]));
  const tool = tools.impreza_vps_resize;
  assert(tool, 'impreza_vps_resize is listed');
  assert.equal(tool.annotations?.destructiveHint, true, 'a resize spends and cannot be walked back');
  assert.deepEqual(tool.inputSchema.required, ['service_id']);
  for (const f of ['cpu_cores', 'memory_gb', 'disk_gb', 'max_amount']) assert(tool.inputSchema.properties[f], 'resize takes ' + f);
  assert.equal(tool.inputSchema.properties.location, undefined, 'a resize takes no location');

  let r = await call('impreza_vps_resize', { service_id: 501, cpu_cores: 2, memory_gb: 4, disk_gb: 40, max_amount: '7.00' });
  assert(!r.error, r.text);
  assert.equal(mcp.last().method, 'POST');
  assert.equal(mcp.last().path, '/v1/services/501/resize');
  assert.deepEqual(mcp.last().body, { cpu_cores: 2, memory_gb: 4, disk_gb: 40, max_amount: '7.00' });
  r = await call('impreza_vps_resize', { service_id: '501', memory_gb: '8' });
  assert(!r.error, r.text);
  assert.equal(mcp.last().path, '/v1/services/501/resize');
  assert.deepEqual(mcp.last().body, { memory_gb: 8 }, 'only the sizes that change, as numbers');
  const before = mcp.count();

  for (const [args, why] of [
    [{ memory_gb: 4 }, /service_id is required/],
    [{ service_id: '501; rm', memory_gb: 4 }, /service_id is required/],
    [{ service_id: 501 }, /at least one new size/],
    [{ service_id: 501, memory_gb: 1.5 }, /whole number/],
    [{ service_id: 501, cpu_cores: 0 }, /whole number/],
    [{ service_id: 501, disk_gb: '40GB' }, /whole number/],
    [{ service_id: 501, memory_gb: 4, max_amount: '1e3' }, /max_amount must be an amount/],
  ]) {
    const bad = await call('impreza_vps_resize', args);
    assert(bad.error && why.test(bad.text), 'refused: ' + JSON.stringify(args) + ' -> ' + bad.text);
  }
  r = await call('impreza_vps_offer', {});
  assert(!r.error, r.text);
  assert.equal(mcp.count(), before + 1, 'refused resizes made no request');

  console.log('PASS: resize body and endpoint, only sizes as whole numbers, refusals before any request.');
} finally {
  await mcp.close();
}
