#!/usr/bin/env node
// Heavy smoke: drive the MCP server to deploy a real Dockerfile-mode
// custom app against the live control plane. Validates the TS
// tar+upload path + the agent-side build flow end-to-end.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = process.argv[2] || join(__dirname, 'fixtures', 'hello-go');
const agentId = process.argv[3] || 'agt_4bcbffef132a2089';
const serverEntry = join(__dirname, '..', 'dist', 'server.js');

const env = {
  ...process.env,
  IMPREZA_API_KEY: process.env.IMPREZA_API_KEY ?? '',
  IMPREZA_API_SECRET: process.env.IMPREZA_API_SECRET ?? '',
};
if (!env.IMPREZA_API_KEY || !env.IMPREZA_API_SECRET) {
  console.error('FAIL: API key/secret env not set');
  process.exit(2);
}

const child = spawn('node', [serverEntry], { env, stdio: ['pipe', 'pipe', 'inherit'] });

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
        pending.get(msg.id).resolve(msg);
        pending.delete(msg.id);
      }
    } catch (err) {
      console.error('bad line:', line);
    }
  }
});

function rpc(method, params) {
  const id = nextId++;
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve });
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout ${method}`)); }
    }, 120_000);
  });
}

(async () => {
  const init = await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'smoke-deploy', version: '0' } });
  if (init.error) { console.error('init failed', init.error); process.exit(1); }
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  console.log(`  ✓ initialize`);

  const name = `mcp-smoke-${Math.random().toString(36).slice(2, 8)}`;
  console.log(`  → deploying name=${name} dir=${projectDir} agent=${agentId}`);
  const call = await rpc('tools/call', {
    name: 'impreza_deploy_custom',
    arguments: {
      name,
      agent_id: agentId,
      mode: 'dockerfile',
      dir: projectDir,
      onion: true,
      cpus: 0.5,
      memory_mb: 128,
    },
  });
  if (call.result?.isError) { console.error('TOOL ERR:', call.result.content); process.exit(1); }
  if (call.error) { console.error('RPC ERR:', call.error); process.exit(1); }
  const dep = JSON.parse(call.result.content[0].text);
  console.log(`  ✓ deploy created → ${dep.id} status=${dep.status}`);
  const deployId = dep.id;

  // Poll uninstall — confirm the lifecycle endpoint works too via MCP.
  // Wait a few seconds for the agent to pull/up before tearing down.
  await new Promise((r) => setTimeout(r, 35_000));
  const un = await rpc('tools/call', {
    name: 'impreza_uninstall_deployment',
    arguments: { deployment_id: deployId, purge_data: true },
  });
  if (un.result?.isError) { console.error('uninstall failed', un.result.content); process.exit(1); }
  if (un.error) { console.error('uninstall rpc err', un.error); process.exit(1); }
  console.log(`  ✓ uninstall enqueued for ${deployId}`);

  console.log('\nDEPLOY SMOKE PASS');
  child.kill();
  process.exit(0);
})().catch((err) => { console.error('FAIL', err); child.kill(); process.exit(1); });
