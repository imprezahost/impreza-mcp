// DEV profile (strict client; the target comes from the operator's environment): the REAL server entry (stdio, tools/list, tools/call, resources, prompts) with a fake
// transport. Every refusal is proven to send ZERO requests; the admitted path is the server card's own reads.
// Usage: node tests/dev-profile-mcp.mjs [path/to/dist/server.js]   (default ../dist/server.js)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const SERVER = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('../dist/server.js', import.meta.url));
const FIXTURE = new URL('./fixtures/dev-profile-fetch.mjs', import.meta.url).href;
const AGENT = 'agt_' + 'a'.repeat(16);
const OTHER = 'agt_' + 'b'.repeat(16);
// Test values only: the package carries no DEV origin, account or service of its own.
const BASE = { IMPREZA_DEV_PROFILE: 'f58-10-dev', IMPREZA_BASE_URL: 'https://dev.example.test',
  IMPREZA_API_KEY: 'imp_' + 'c'.repeat(16), IMPREZA_API_SECRET: 'test-secret-not-a-real-credential', IMPREZA_DEV_AGENT_ID: AGENT,
  IMPREZA_DEV_ORIGIN: 'https://dev.example.test', IMPREZA_DEV_CLIENT_ID: '7', IMPREZA_DEV_SERVICE_ID: '4242' };
let refusalsCount = 0;
const temp = mkdtempSync(join(tmpdir(), 'dev-profile-'));

// Only PATH and a private HOME from the parent: no inherited proxy, credential or profile variable.
function environment(extra) {
  const env = { PATH: process.env.PATH, HOME: join(temp, 'home') };
  for (const [k, v] of Object.entries(extra)) if (v !== undefined) env[k] = v;
  return env;
}

function startupRefused(label, extra, argv = [], code) {
  const log = join(temp, label.replace(/\W+/g, '_') + '.log');
  const r = spawnSync(process.execPath, ['--import', FIXTURE, SERVER, ...argv], {
    env: environment({ ...extra, DEV_FIXTURE_LOG: log }), encoding: 'utf8', timeout: 30000, input: '' });
  assert.equal(r.status, 78, `${label}: exit ${r.status} ${r.stderr}`);
  assert.equal(r.stderr.trim(), `DEV_PROFILE_DENIED: ${code}`, label);
  assert.equal(r.stdout, '', label);
  assert.ok(!existsSync(log), `${label}: a request left the process`);
  for (const value of Object.values(extra)) if (typeof value === 'string' && value.length > 8) assert.ok(!r.stderr.includes(value), `${label}: echoed a value`);
}

async function connect(mode = 'normal', extra = {}) {
  const transport = new StdioClientTransport({ command: process.execPath, args: ['--import', FIXTURE, SERVER],
    env: environment({ ...BASE, DEV_FIXTURE_MODE: mode, ...extra }), stderr: 'pipe' });
  const client = new Client({ name: 'dev-profile-test', version: '1.0.0' });
  await client.connect(transport);
  return client;
}

const text = (r) => r.content[0].text;
const denied = (r, code) => { assert.ok(r.isError, JSON.stringify(r)); assert.equal(text(r), `DEV_PROFILE_DENIED: ${code}`); };

try {
  // ── 1. startup: refused before subcommand, saved credential or HTTP client ─────────────────────────────
  // A valid private saved credential exists in HOME: the profile must refuse instead of falling back to it.
  const store = join(temp, 'home', '.impreza');
  mkdirSync(store, { recursive: true, mode: 0o700 });
  chmodSync(store, 0o700);
  writeFileSync(join(store, 'credentials.json'), JSON.stringify({ api_key: 'imp_' + 'd'.repeat(16), api_secret: 'saved_secret_value_0123456789',
    base_url: 'https://dev.example.test', scopes: ['read'], ip_mode: 'whitelist', expires_at: null }), { mode: 0o600 });
  const cases = [
    ['unknown profile', { ...BASE, IMPREZA_DEV_PROFILE: 'f58-10' }, [], 'unknown_profile'],
    ['production default', { ...BASE, IMPREZA_BASE_URL: undefined }, [], 'base_url'],
    ['production base', { ...BASE, IMPREZA_BASE_URL: 'https://api.imprezahost.com' }, [], 'base_url'],
    ['base with path', { ...BASE, IMPREZA_BASE_URL: 'https://dev.example.test/v1' }, [], 'base_url'],
    ['base with port', { ...BASE, IMPREZA_BASE_URL: 'https://dev.example.test:443' }, [], 'base_url'],
    ['base case variant', { ...BASE, IMPREZA_BASE_URL: 'https://DEV.example.test' }, [], 'base_url'],
    ['base with query', { ...BASE, IMPREZA_BASE_URL: 'https://dev.example.test/?next=x' }, [], 'base_url'],
    ['base with userinfo', { ...BASE, IMPREZA_BASE_URL: 'https://u@dev.example.test' }, [], 'base_url'],
    ['lookalike host', { ...BASE, IMPREZA_BASE_URL: 'https://dev.example.test.evil.example' }, [], 'base_url'],
    ['socks proxy', { ...BASE, IMPREZA_PROXY: 'socks5://127.0.0.1:9050' }, [], 'proxy'],
    ['https proxy', { ...BASE, HTTPS_PROXY: 'http://127.0.0.1:3128' }, [], 'proxy'],
    ['node env proxy', { ...BASE, NODE_USE_ENV_PROXY: '1' }, [], 'proxy'],
    ['saved credential fallback', { ...BASE, IMPREZA_API_KEY: undefined, IMPREZA_API_SECRET: undefined }, [], 'credential_source'],
    ['half credential', { ...BASE, IMPREZA_API_SECRET: undefined }, [], 'credential_source'],
    ['login subcommand', BASE, ['login', '--code', 'ABCD-EFGH'], 'subcommand'],
    ['setup subcommand', BASE, ['setup', '--tool', 'codex-cli'], 'subcommand'],
    ['version subcommand', BASE, ['--version'], 'subcommand'],
    // The target: origin, account and service from the operator's environment only, exact formats.
    ['origin missing', { ...BASE, IMPREZA_DEV_ORIGIN: undefined }, [], 'origin'],
    ['origin production', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://api.imprezahost.com', IMPREZA_BASE_URL: 'https://api.imprezahost.com' }, [], 'origin'],
    ['origin http', { ...BASE, IMPREZA_DEV_ORIGIN: 'http://dev.example.test', IMPREZA_BASE_URL: 'http://dev.example.test' }, [], 'origin'],
    ['origin with path', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://dev.example.test/v1' }, [], 'origin'],
    ['origin trailing slash', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://dev.example.test/' }, [], 'origin'],
    ['origin uppercase', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://DEV.example.test' }, [], 'origin'],
    ['origin with port', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://dev.example.test:8443' }, [], 'origin'],
    ['origin with userinfo', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://u@dev.example.test' }, [], 'origin'],
    ['origin with query', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://dev.example.test?x=1' }, [], 'origin'],
    ['client missing', { ...BASE, IMPREZA_DEV_CLIENT_ID: undefined }, [], 'client_id'],
    ['client zero', { ...BASE, IMPREZA_DEV_CLIENT_ID: '0' }, [], 'client_id'],
    ['client leading zero', { ...BASE, IMPREZA_DEV_CLIENT_ID: '07' }, [], 'client_id'],
    ['client negative', { ...BASE, IMPREZA_DEV_CLIENT_ID: '-7' }, [], 'client_id'],
    ['client space', { ...BASE, IMPREZA_DEV_CLIENT_ID: '7 ' }, [], 'client_id'],
    ['client too large', { ...BASE, IMPREZA_DEV_CLIENT_ID: '2147483648' }, [], 'client_id'],
    ['service missing', { ...BASE, IMPREZA_DEV_SERVICE_ID: undefined }, [], 'service_id'],
    ['service leading zero', { ...BASE, IMPREZA_DEV_SERVICE_ID: '04242' }, [], 'service_id'],
    ['service newline', { ...BASE, IMPREZA_DEV_SERVICE_ID: '4242\n' }, [], 'service_id'],
    ['service decimal', { ...BASE, IMPREZA_DEV_SERVICE_ID: '4242.0' }, [], 'service_id'],
    ['service too large', { ...BASE, IMPREZA_DEV_SERVICE_ID: '99999999999' }, [], 'service_id'],
    ['base url other than the origin', { ...BASE, IMPREZA_DEV_ORIGIN: 'https://dev2.example.test' }, [], 'base_url'],
    // The operator-bound agent, exact format, from the environment only.
    ['agent missing', { ...BASE, IMPREZA_DEV_AGENT_ID: undefined }, [], 'agent_id'],
    ['agent too short', { ...BASE, IMPREZA_DEV_AGENT_ID: 'agt_' + 'a'.repeat(15) }, [], 'agent_id'],
    ['agent too long', { ...BASE, IMPREZA_DEV_AGENT_ID: 'agt_' + 'a'.repeat(25) }, [], 'agent_id'],
    ['agent uppercase', { ...BASE, IMPREZA_DEV_AGENT_ID: 'agt_' + 'A'.repeat(16) }, [], 'agent_id'],
    ['agent newline', { ...BASE, IMPREZA_DEV_AGENT_ID: AGENT + '\n' }, [], 'agent_id'],
    ['agent other prefix', { ...BASE, IMPREZA_DEV_AGENT_ID: 'dpl_' + 'a'.repeat(16) }, [], 'agent_id'],
  ];
  for (const [label, extra, argv, code] of cases) startupRefused(label, extra, argv, code);

  // ── 2. the running profile: lists, resources, prompts ─────────────────────────────────────────────────
  let client = await connect();
  try {
    const tools = (await client.listTools()).tools;
    assert.deepEqual(tools.map((t) => t.name).sort(),
      ['impreza_api_call', 'impreza_list_deployments', 'impreza_list_servers', 'impreza_vps_status']);
    assert.equal(tools.find((t) => t.name === 'impreza_vps_status')._meta.ui.resourceUri, 'ui://impreza/server-card');
    assert.deepEqual((await client.listResources()).resources.map((r) => r.uri), ['ui://impreza/server-card']);
    const card = await client.readResource({ uri: 'ui://impreza/server-card' });
    assert.equal(card.contents[0].mimeType, 'text/html;profile=mcp-app');
    await assert.rejects(client.readResource({ uri: 'ui://impreza/topup-card' }));
    await assert.rejects(client.readResource({ uri: 'ui://impreza/deploy-wizard' }));
    assert.deepEqual((await client.listPrompts()).prompts, []);
    await assert.rejects(client.getPrompt({ name: 'deploy-app', arguments: {} }));

    // ── 3. refusals before HTTP: tools, writes, other targets, argument variants ────────────────────────
    const refusals = [
      ['impreza_vps_power', { service_id: 4242, action: 'reboot' }, 'tool'],
      ['impreza_account_info', {}, 'tool'],
      ['impreza_api_search', { query: 'vps' }, 'tool'],
      ['impreza_list_services', {}, 'tool'],
      ['impreza_vps_status', { service_id: 732 }, 'arguments'],
      ['impreza_vps_status', { service_id: '4242 ' }, 'arguments'],
      ['impreza_vps_status', { service_id: '04242' }, 'arguments'],
      ['impreza_vps_status', { service_id: 4242, client_id: 2 }, 'arguments'],
      ['impreza_vps_status', { service_id: 4242, url: 'https://evil.example' }, 'arguments'],
      ['impreza_vps_status', {}, 'arguments'],
      ['impreza_api_call', { path: '/vps/proxmox/732' }, 'arguments'],
      ['impreza_api_call', { path: '/vps/proxmox/4242?redirect=https://evil.example' }, 'arguments'],
      ['impreza_api_call', { path: '/vps/proxmox/4242/' }, 'arguments'],
      ['impreza_api_call', { path: '/vps/proxmox/4242/status' }, 'arguments'],
      ['impreza_api_call', { path: '/vps/proxmox/4243/events' }, 'arguments'],
      ['impreza_api_call', { path: '/%76ps/proxmox/4242' }, 'arguments'],
      ['impreza_api_call', { path: '/vps/proxmox/4242', query: { cursor: 'next' } }, 'arguments'],
      ['impreza_api_call', { path: '/account/services' }, 'arguments'],
      ['impreza_list_servers', { cursor: 'next' }, 'arguments'],
      ['impreza_list_servers', { proxy: 'socks5://127.0.0.1:9050' }, 'arguments'],
      ['impreza_list_deployments', { agent_id: OTHER }, 'agent'],
      ['impreza_list_deployments', { agent_id: AGENT.toUpperCase() }, 'agent'],
      ['impreza_list_deployments', { agent_id: AGENT, status: 'running' }, 'arguments'],
      ['impreza_list_deployments', { agent_id: AGENT, cursor: 'next' }, 'arguments'],
      ['impreza_list_deployments', {}, 'arguments'],
    ];
    for (const [name, args, code] of refusals) denied(await client.callTool({ name, arguments: args }), code);
    refusalsCount = refusals.length;

    // ── 4. the admitted card path: status, identity, apps, refresh ─────────────────────────────────────
    const status = await client.callTool({ name: 'impreza_vps_status', arguments: { service_id: 4242 } });
    assert.ok(!status.isError, JSON.stringify(status));
    assert.deepEqual(JSON.parse(text(status)).requests, ['GET /v1/vps/proxmox/4242/status'],
      'tools/list, resources, prompts and every refusal above made no request');
    const identity = await client.callTool({ name: 'impreza_api_call', arguments: { path: '/vps/proxmox/4242' } });
    assert.ok(!identity.isError, JSON.stringify(identity));
    assert.equal(JSON.parse(text(identity)).service_id, 4242);
    const events = await client.callTool({ name: 'impreza_api_call', arguments: { path: '/vps/proxmox/4242/events' } });
    assert.ok(!events.isError, JSON.stringify(events));
    assert.deepEqual(JSON.parse(text(events)).events, [{ kind: 'power.reboot', accepted_at: '2026-10-29T01:20:00Z' }],
      'the activity ledger reaches the card as data, fixed kinds only');
    // The server list is the operator binding, with NO request; never an observed inventory.
    const servers = await client.callTool({ name: 'impreza_list_servers', arguments: {} });
    assert.ok(!servers.isError, JSON.stringify(servers));
    const shown = JSON.parse(text(servers));
    assert.deepEqual([shown.source, shown.observed, shown.total], ['operator_binding', false, 1]);
    assert.deepEqual(shown.servers, [{ agent_id: AGENT, service_id: 4242, hostname: null, origin: 'operator_binding',
      status: 'operator_binding', version: null, update_policy: {}, agent_update: {}, last_seen_at: null, registered_at: null,
      tor: null, capacity: null }]);
    assert.deepEqual(servers.structuredContent.servers.map((x) => [x.agent_id, x.service_id]), [[AGENT, 4242]]);
    assert.ok(!JSON.stringify(servers).includes('OTHER_TARGET') && !JSON.stringify(servers).includes(OTHER), 'another service leaked');
    const apps = await client.callTool({ name: 'impreza_list_deployments', arguments: { agent_id: AGENT } });
    assert.ok(!apps.isError, JSON.stringify(apps));
    const listed = JSON.parse(text(apps));
    assert.deepEqual([listed.deployments.map((d) => d.agent_id), listed.total, listed.catalog_count, listed.custom_count, listed.custom_requested],
      [[AGENT], 1, 1, 0, false]);
    assert.deepEqual(apps.structuredContent.deployments.map((d) => d.agent_id), [AGENT]);
    const refresh = await client.callTool({ name: 'impreza_vps_status', arguments: { service_id: '4242' } });
    assert.deepEqual(JSON.parse(text(refresh)).requests, [
      'GET /v1/vps/proxmox/4242/status', 'GET /v1/vps/proxmox/4242', 'GET /v1/vps/proxmox/4242/events', 'GET /v1/platform/deployments',
      'GET /v1/vps/proxmox/4242/status',
    ], 'exactly the strict card reads: no catalogue, no servers, no custom, no query, nothing else');
  } finally { await client.close(); }

  // ── 5. answers naming another service or another agent are refused, never filtered into a PASS ──────
  client = await connect('foreign');
  try {
    denied(await client.callTool({ name: 'impreza_vps_status', arguments: { service_id: 4242 } }), 'foreign_service');
    const leaked = await client.callTool({ name: 'impreza_list_deployments', arguments: { agent_id: AGENT } });
    denied(leaked, 'foreign_agent');
    assert.ok(!JSON.stringify(leaked).includes('OTHER_TARGET'));
  } finally { await client.close(); }

  // ── 6. profile unset: existing clients unchanged (full catalogue, no DEV refusal) ─────────────────────
  const plain = await (async () => {
    const transport = new StdioClientTransport({ command: process.execPath, args: ['--import', FIXTURE, SERVER],
      env: environment({ IMPREZA_BASE_URL: 'https://dev.example.test', IMPREZA_API_KEY: BASE.IMPREZA_API_KEY, IMPREZA_API_SECRET: BASE.IMPREZA_API_SECRET }) });
    const c = new Client({ name: 'dev-profile-default-test', version: '1.0.0' });
    await c.connect(transport);
    try {
      const names = (await c.listTools()).tools.map((t) => t.name);
      const resources = (await c.listResources()).resources.map((r) => r.uri);
      return { names, resources };
    } finally { await c.close(); }
  })();
  assert.ok(plain.names.length > 4 && plain.names.includes('impreza_vps_power'), 'default catalogue changed');
  assert.deepEqual(plain.resources.sort(), ['ui://impreza/deploy-wizard', 'ui://impreza/server-card', 'ui://impreza/topup-card']);
  const version = spawnSync(process.execPath, [SERVER, '--version'], { env: environment({}), encoding: 'utf8', timeout: 30000 });
  assert.equal(version.status, 0);
  assert.match(version.stdout, /^impreza-mcp /);
  assert.ok(readFileSync(SERVER, 'utf8').length > 0);

  // ── 7. the transport allowlist itself (second line behind the dispatcher; not reachable from tools/call) ──
  const unit = await import(new URL('./dev-profile.js', 'file://' + SERVER).href);
  const profile = unit.devProfileFromEnv({ ...BASE }, ['node', 'server.js']);
  const ok = (method, url) => unit.devProfileRequest(profile, method, new URL(url));
  for (const path of ['/v1/vps/proxmox/4242/status', '/v1/vps/proxmox/4242', '/v1/platform/deployments']) {
    assert.ok(ok('GET', 'https://dev.example.test' + path), path);
  }
  for (const [method, url] of [['POST', 'https://dev.example.test/v1/vps/proxmox/4242/reboot'],
    ['GET', 'https://api.imprezahost.com/v1/vps/proxmox/4242/status'], ['GET', 'https://dev.example.test/v1/entitlements'],
    ['GET', 'https://dev.example.test/v1/vps/proxmox/732/status'], ['GET', 'https://dev.example.test/v1/api-catalog'],
    ['GET', 'https://dev.example.test/v1/platform/servers'], ['GET', 'https://dev.example.test/v1/platform/deployments/custom'],
    ['GET', 'https://dev.example.test/v1/platform/deployments?agent_id=' + AGENT], ['GET', 'https://dev.example.test/v1/platform/deployments?'],
    ['POST', 'https://dev.example.test/v1/platform/secret-entry-policy'], ['GET', 'https://dev.example.test:8443/v1/vps/proxmox/4242']])
    assert.ok(!ok(method, url), method + ' ' + url);
  assert.equal(profile.boundAgent, AGENT);
  assert.ok(Object.isFrozen(profile), 'the binding cannot be rebound at runtime');
  assert.equal(unit.devProfileFromEnv({}, ['node', 'server.js']), null, 'unset profile: no change');
  assert.deepEqual([profile.origin, profile.clientId, profile.serviceId], ['https://dev.example.test', 7, 4242]);
  // The binding follows the operator's environment: another service is admitted only under its own profile.
  const other = unit.devProfileFromEnv({ ...BASE, IMPREZA_DEV_SERVICE_ID: '4343' }, ['node', 'server.js']);
  assert.ok(unit.devProfileRequest(other, 'GET', new URL('https://dev.example.test/v1/vps/proxmox/4343/status')));
  assert.ok(!unit.devProfileRequest(other, 'GET', new URL('https://dev.example.test/v1/vps/proxmox/4242/status')));
  assert.equal(unit.devProfileGate(other, 'impreza_vps_status', { service_id: 4242 }), 'arguments');
  assert.equal(unit.devProfileGate(other, 'impreza_vps_status', { service_id: 4343 }), null);

  console.log(`PASS: DEV profile — ${cases.length} startup refusals with zero requests; ` +
    `${refusalsCount} dispatcher refusals with zero requests; strict card path status/identity/binding/apps/refresh ` +
    '(4 GETs — now including the events ledger, no catalogue/servers/custom/query); foreign service and agent refused; default clients unchanged.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
