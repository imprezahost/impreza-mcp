// A VPS bought through this MCP defaults to the Impreza agent (app omitted or blank → '@agent'), applied before the
// quote and the order so both carry the same app. Explicit choices pass unchanged; an unknown app is the API's refusal,
// shown as is, after exactly one request; a non-text app is refused before any request. Real server entry over stdio.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const dir = mkdtempSync(join(tmpdir(), 'agent-default-'));
const log = join(dir, 'requests.jsonl');
const server = process.env.AGENT_DEFAULT_SERVER || fileURLToPath(new URL('../dist/server.js', import.meta.url));
const transport = new StdioClientTransport({ command: process.execPath,
  args: ['--import', new URL('./fixtures/agent-default-fetch.mjs', import.meta.url).href, server],
  env: { PATH: process.env.PATH, HOME: dir, IMPREZA_BASE_URL: 'https://agent-default.invalid', IMPREZA_API_KEY: 'test-key',
    IMPREZA_API_SECRET: 'test-secret-not-a-real-credential', AGENT_DEFAULT_LOG: log } });
const client = new Client({ name: 'agent-default', version: '1.0.0' });
const requests = () => existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
const call = async (name, args) => {
  const before = requests().length;
  const out = await client.callTool({ name, arguments: args });
  return { error: !!out.isError, text: out.content[0].text, sent: requests().slice(before) };
};
const vps = { billing_cycle: 'monthly', location: 'romania', os: 'ubuntu-24.04', cpu_cores: 2, memory_gb: 4, disk_gb: 40 };
try {
  await client.connect(transport);
  const tools = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t]));
  for (const name of ['impreza_vps_offer', 'impreza_order_vps']) {
    const d = tools[name].inputSchema.properties.app.description;
    ok(/Omitted[^.]{0,20}: '@agent'/.test(d) && !d.includes("'none' (default"), name + ': app description states the agent default');
    ok(!tools[name].inputSchema.required?.includes('app'), name + ': app stays optional');
  }
  ok(/defaults to app=@agent/.test(tools.impreza_order_vps.description) && /not a ready agent/.test(tools.impreza_order_vps.description),
    'order description: agent default, and an accepted order is not a ready agent');

  // Quote and order carry the same app, for each way of choosing it.
  for (const [label, app, expected] of [['omitted', undefined, '@agent'], ['blank', '', '@agent'], ['spaces', '   ', '@agent'],
    ['null', null, '@agent'], ['explicit none', 'none', 'none'], ['explicit agent', '@agent', '@agent'],
    ['agent with MCP', '@agent-mcp', '@agent-mcp'], ['catalog app', 'wordpress', 'wordpress']]) {
    const args = app === undefined ? { ...vps } : { ...vps, app };
    const quote = await call('impreza_vps_offer', args);
    ok(!quote.error && quote.sent.length === 1 && quote.sent[0].path === '/v1/products/vps/quote' && quote.sent[0].query.app === expected,
      label + ': the quote prices app ' + expected);
    const order = await call('impreza_order_vps', args);
    ok(!order.error && order.sent.length === 1 && order.sent[0].method === 'POST' && order.sent[0].path === '/v1/orders' &&
      order.sent[0].body.app === expected, label + ': the order sends app ' + expected + ' in exactly one request');
    ok(JSON.parse(quote.text).app === JSON.parse(order.text).app, label + ': quote and order agree');
  }
  // A fixed plan gets the same default (the API applies it to a fixed VPS plan, ignores it otherwise), never silently.
  ok(/configurable VPS and for fixed VPS plans alike/.test(tools.impreza_order_vps.inputSchema.properties.app.description) &&
    /fixed VPS plan\) defaults to app=@agent/.test(tools.impreza_order_vps.description), 'fixed VPS plan default stated before the call');
  const fixed = await call('impreza_order_vps', { billing_cycle: 'monthly', product_id: 682 });
  ok(!fixed.error && fixed.sent.length === 1 && fixed.sent[0].body.app === '@agent' && fixed.sent[0].body.product_id === 682 &&
    JSON.parse(fixed.text).app_requested === '@agent', 'fixed plan: app @agent sent and shown as app_requested');
  const fixedBare = await call('impreza_order_vps', { billing_cycle: 'monthly', product_id: 682, app: 'none' });
  ok(!fixedBare.error && fixedBare.sent[0].body.app === 'none' && JSON.parse(fixedBare.text).app_requested === 'none', 'fixed plan: explicit none stays none');
  // A partial configuration only reads the offer: no app is invented there.
  const partial = await call('impreza_vps_offer', { location: 'romania' });
  ok(!partial.error && partial.sent.length === 1 && partial.sent[0].path === '/v1/products/vps' && Object.keys(partial.sent[0].query).length === 0,
    'partial offer read sends no app');
  // Unknown app: the API's own refusal, literally, after one request and no retry or second purchase.
  for (const name of ['impreza_vps_offer', 'impreza_order_vps']) {
    const bad = await call(name, { ...vps, app: 'not-an-app' });
    ok(bad.error && bad.sent.length === 1 && /Unknown app 'not-an-app'/.test(bad.text), name + ': unknown app refused by the API, one request');
  }
  // Not text: refused before any request.
  for (const name of ['impreza_vps_offer', 'impreza_order_vps']) {
    for (const app of [true, false, 0, 7, 1.5, -1, { name: '@agent' }, ['@agent'], []]) {
      const refused = await call(name, { ...vps, app });
      ok(refused.error && refused.sent.length === 0 && /app must be text/.test(refused.text), name + ': non-text app refused before HTTP');
    }
  }
  console.log(`PASS agent default for VPS orders through the MCP: ${checks} checks (real stdio entry, quote and order bodies, refusals).`);
} finally {
  await client.close();
  rmSync(dir, { recursive: true, force: true });
}
