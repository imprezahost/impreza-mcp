#!/usr/bin/env node
//
// Standalone smoke client for the MCP server. Spawns
// `node dist/server.js` as a child over stdio, walks through:
//
//   1. initialize handshake
//   2. tools/list
//   3. tools/call → impreza_list_servers (validates round-trip
//      against the live control plane)
//
// Bails non-zero on any failure. Stays AI-tool-agnostic so the same
// script catches MCP wire breakage even without Claude/Cursor.
//
// Env: IMPREZA_API_KEY + IMPREZA_API_SECRET must be set (propagated
// into the spawned MCP server). Optional IMPREZA_BASE_URL.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverEntry = join(__dirname, '..', 'dist', 'server.js');

const env = {
  ...process.env,
  IMPREZA_API_KEY: process.env.IMPREZA_API_KEY ?? '',
  IMPREZA_API_SECRET: process.env.IMPREZA_API_SECRET ?? '',
};
if (!env.IMPREZA_API_KEY || !env.IMPREZA_API_SECRET) {
  console.error('SMOKE FAIL: IMPREZA_API_KEY + IMPREZA_API_SECRET env must be set.');
  process.exit(2);
}

const child = spawn('node', [serverEntry], {
  env,
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buf = '';
const pending = new Map();
let nextId = 1;

child.stdout.on('data', (chunk) => {
  buf += chunk.toString('utf8');
  let idx;
  while ((idx = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id != null && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg);
      }
    } catch (err) {
      console.error('SMOKE FAIL: bad JSON from server:', line, err);
      process.exit(1);
    }
  }
});

function rpc(method, params) {
  const id = nextId++;
  const msg = { jsonrpc: '2.0', id, method, params };
  child.stdin.write(JSON.stringify(msg) + '\n');
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`timeout on ${method}`));
      }
    }, 30_000);
  });
}

function fail(msg, extra) {
  console.error(`SMOKE FAIL: ${msg}`);
  if (extra !== undefined) console.error(JSON.stringify(extra, null, 2));
  child.kill();
  process.exit(1);
}

async function main() {
  // 1. initialize
  const init = await rpc('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'impreza-mcp-smoke', version: '0.0.0' },
  });
  if (init.error) fail('initialize returned error', init.error);
  if (!init.result?.serverInfo?.name) fail('initialize missing serverInfo.name', init);
  console.log(`  ✓ initialize → ${init.result.serverInfo.name} ${init.result.serverInfo.version}`);

  // Per MCP spec, send `notifications/initialized` after init.
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  // 2. tools/list
  const list = await rpc('tools/list', {});
  if (list.error) fail('tools/list returned error', list.error);
  const tools = list.result?.tools ?? [];
  if (tools.length < 10) fail(`expected ≥10 tools (Iteration B), got ${tools.length}`, tools);
  const names = tools.map((t) => t.name).sort();
  console.log(`  ✓ tools/list → ${tools.length} tools`);
  for (const n of names) console.log(`     · ${n}`);

  // 3. tools/call → impreza_list_servers
  const call = await rpc('tools/call', {
    name: 'impreza_list_servers',
    arguments: {},
  });
  if (call.error) fail('tools/call returned protocol error', call.error);
  const content = call.result?.content ?? [];
  if (call.result?.isError) fail('tools/call returned tool error', content);
  if (content.length === 0) fail('tools/call returned empty content', call);
  let parsed;
  try {
    parsed = JSON.parse(content[0].text);
  } catch {
    fail('tool response was not JSON', content[0]);
  }
  if (!Array.isArray(parsed.servers)) fail('expected servers[] in response', parsed);
  console.log(`  ✓ tools/call impreza_list_servers → ${parsed.servers.length} server(s)`);
  if (parsed.servers[0]) {
    console.log(`    └─ ${parsed.servers[0].agent_id} (${parsed.servers[0].hostname}) status=${parsed.servers[0].status}`);
  }

  console.log('\nSMOKE PASS');
  child.kill();
  process.exit(0);
}

main().catch((err) => {
  fail(`unexpected error: ${err.message}`, err.stack);
});
