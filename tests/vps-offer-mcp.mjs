import assert from 'node:assert/strict';
import { loggedClient, sample } from './fixtures/request-log.mjs';

// The configurable VPS through the local server: impreza_vps_offer reads the
// offer or prices one configuration, and impreza_order_vps sends the VPS
// fields (no product_id) or a fixed plan's product_id. The API checks every
// value; this pins which endpoint each call reaches and that refused calls
// make no request at all. Requests are asserted from the request log; the
// offer and the quote answer the real controller samples (impreza_vps_offer
// declares an outputSchema, which the SDK client validates).
const mcp = loggedClient('vps-offer-test', { host: 'vps-offer.invalid' });
const client = mcp.client;
const call = async (name, args) => {
  const out = await client.callTool({ name, arguments: args });
  return { error: !!out.isError, text: out.content[0].text, structured: out.structuredContent };
};
try {
  await mcp.connect();
  const tools = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t]));
  assert(tools.impreza_vps_offer, 'impreza_vps_offer is listed');
  assert.equal(tools.impreza_vps_offer.annotations?.readOnlyHint, true, 'the offer is a read');
  assert.deepEqual(tools.impreza_order_vps.inputSchema.required, ['billing_cycle'], 'product_id is optional for the VPS');
  for (const f of ['location', 'os', 'cpu_cores', 'memory_gb', 'disk_gb']) {
    assert(tools.impreza_order_vps.inputSchema.properties[f], 'order_vps takes ' + f);
    assert(tools.impreza_vps_offer.inputSchema.properties[f], 'vps_offer takes ' + f);
  }

  let r = await call('impreza_vps_offer', {});
  assert(!r.error, r.text);
  assert.deepEqual(r.structured, sample('impreza_vps_offer:offer'));
  assert.equal(mcp.last().method, 'GET');
  assert.equal(mcp.last().path, '/v1/products/vps');
  assert.deepEqual(mcp.last().query, {});
  r = await call('impreza_vps_offer', { location: 'romania', cpu_cores: 2 });
  assert(!r.error, r.text);
  assert.equal(mcp.last().path, '/v1/products/vps', 'a partial configuration reads the offer');
  assert.deepEqual(mcp.last().query, {}, 'a partial configuration sends no query');

  const vps = { billing_cycle: 'monthly', location: 'romania', os: 'ubuntu-24.04', cpu_cores: 2, memory_gb: 4, disk_gb: 40 };
  r = await call('impreza_vps_offer', vps);
  assert(!r.error, r.text);
  assert.deepEqual(r.structured, sample('impreza_vps_offer:quote'));
  assert.equal(mcp.last().method, 'GET');
  assert.equal(mcp.last().path, '/v1/products/vps/quote', 'a whole configuration is priced');
  assert.deepEqual(mcp.last().query, { billing_cycle: 'monthly', location: 'romania', os: 'ubuntu-24.04', cpu_cores: '2', memory_gb: '4', disk_gb: '40' });

  r = await call('impreza_order_vps', { ...vps, hostname: 'web-1' });
  assert(!r.error, r.text);
  assert.equal(mcp.last().method, 'POST');
  assert.equal(mcp.last().path, '/v1/orders');
  assert.deepEqual(mcp.last().body, { ...vps, hostname: 'web-1' }, 'the VPS order carries its configuration and no product_id');

  r = await call('impreza_order_vps', { product_id: 682, billing_cycle: 'monthly' });
  assert(!r.error, r.text);
  assert.deepEqual(mcp.last().body, { billing_cycle: 'monthly', product_id: 682 }, 'a fixed plan orders by product_id');
  const before = mcp.count();

  const bad = await call('impreza_order_vps', { product_id: 'abc', billing_cycle: 'monthly' });
  assert(bad.error && /positive whole number/.test(bad.text));
  const noCycle = await call('impreza_order_vps', { location: 'romania' });
  assert(noCycle.error && /billing_cycle is required/.test(noCycle.text));
  r = await call('impreza_vps_offer', {});
  assert(!r.error, r.text);
  assert.equal(mcp.count(), before + 1, 'refused orders made no request');

  console.log('PASS: VPS offer and quote reads, VPS and fixed-plan order bodies, refusals before any request.');
} finally {
  await mcp.close();
}
