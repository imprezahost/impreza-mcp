import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

// The configurable VPS through the local server: impreza_vps_offer reads the
// offer or prices one configuration, and impreza_order_vps sends the VPS
// fields (no product_id) or a fixed plan's product_id. The API checks every
// value; this pins which endpoint each call reaches and that refused calls
// make no request at all.
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--import', new URL('./fixtures/vps-offer-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))],
  env: { ...process.env, IMPREZA_BASE_URL: 'https://vps-offer.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' },
});
const client = new Client({ name: 'vps-offer-test', version: '1.0.0' });
const call = async (name, args) => {
  const out = await client.callTool({ name, arguments: args });
  return { error: !!out.isError, text: out.content[0].text, data: out.isError ? null : JSON.parse(out.content[0].text) };
};
try {
  await client.connect(transport);
  const tools = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t]));
  assert(tools.impreza_vps_offer, 'impreza_vps_offer is listed');
  assert.equal(tools.impreza_vps_offer.annotations?.readOnlyHint, true, 'the offer is a read');
  assert.deepEqual(tools.impreza_order_vps.inputSchema.required, ['billing_cycle'], 'product_id is optional for the VPS');
  for (const f of ['location', 'os', 'cpu_cores', 'memory_gb', 'disk_gb']) {
    assert(tools.impreza_order_vps.inputSchema.properties[f], 'order_vps takes ' + f);
    assert(tools.impreza_vps_offer.inputSchema.properties[f], 'vps_offer takes ' + f);
  }

  let r = await call('impreza_vps_offer', {});
  assert.equal(r.data.path, '/v1/products/vps');
  r = await call('impreza_vps_offer', { location: 'romania', cpu_cores: 2 });
  assert.equal(r.data.path, '/v1/products/vps', 'a partial configuration reads the offer');

  const vps = { billing_cycle: 'monthly', location: 'romania', os: 'ubuntu-24.04', cpu_cores: 2, memory_gb: 4, disk_gb: 40 };
  r = await call('impreza_vps_offer', vps);
  assert.equal(r.data.path, '/v1/products/vps/quote', 'a whole configuration is priced');
  assert.deepEqual(r.data.query, { billing_cycle: 'monthly', location: 'romania', os: 'ubuntu-24.04', cpu_cores: '2', memory_gb: '4', disk_gb: '40' });

  r = await call('impreza_order_vps', { ...vps, hostname: 'web-1' });
  assert.equal(r.data.method, 'POST');
  assert.equal(r.data.path, '/v1/orders');
  assert.deepEqual(r.data.body, { ...vps, hostname: 'web-1' }, 'the VPS order carries its configuration and no product_id');

  r = await call('impreza_order_vps', { product_id: 682, billing_cycle: 'monthly' });
  assert.deepEqual(r.data.body, { billing_cycle: 'monthly', product_id: 682 }, 'a fixed plan orders by product_id');
  const before = r.data.request_count;

  const bad = await call('impreza_order_vps', { product_id: 'abc', billing_cycle: 'monthly' });
  assert(bad.error && /positive whole number/.test(bad.text));
  const noCycle = await call('impreza_order_vps', { location: 'romania' });
  assert(noCycle.error && /billing_cycle is required/.test(noCycle.text));
  r = await call('impreza_vps_offer', {});
  assert.equal(r.data.request_count, before + 1, 'refused orders made no request');

  console.log('PASS: VPS offer and quote reads, VPS and fixed-plan order bodies, refusals before any request.');
} finally {
  await client.close();
}
