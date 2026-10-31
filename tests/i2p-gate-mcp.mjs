// I2P local tools against a fake of the API. The gate is data.i2p === true on
// the entitlements payload the client already unwraps. Off: the three remote
// names stay out of the list and a call returns "indisponível" with no
// deployment request and no key material. On: request, read, sealed export
// and removal match the retained contract.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  I2P_TOOL_NAMES,
  I2P_TOOLS,
  I2P_UNAVAILABLE,
  filterI2pTools,
  handleI2p,
} from '../src/i2p-tools.ts';

const REMOTE = ['impreza_i2p_destination', 'impreza_i2p_export', 'impreza_i2p_remove'];
const PAGE = {
  impreza_i2p_destination: 'Read the `.b32.i2p` destination the agent reported for an application you own.',
  impreza_i2p_export: 'Queue the sealed export to your X25519 public key. The result is the anonymous box, not the seed.',
  impreza_i2p_remove: 'Delete the stored destination and ask the agent to delete the local files.',
};
const B32 = 'a'.repeat(52) + '.b32.i2p';
const REPORT = 'cmd_' + 'a1'.repeat(16);
const EXPORT = 'cmd_' + 'b2'.repeat(16);
const SHORT = 'cmd_i2preport00000000000001';
const PUB = Buffer.alloc(32, 7).toString('base64');
const SEED = 'raw-seed-fixture-value';
const BOX = 'sealed-box-fixture';
const CLEAR = 'https://clear.example/' + SEED;
const DEP = 'dpl_test';

assert.deepEqual([...I2P_TOOL_NAMES], REMOTE);
for (const tool of I2P_TOOLS) assert.equal(tool.description, PAGE[tool.name]);

const server = readFileSync(new URL('../src/server.ts', import.meta.url), 'utf8');
assert(server.includes('filterI2pTools('), 'tools/list must drop I2P unless the gate is open');
assert(server.includes('handleI2p('), 'a call must go through the gate before a deployment request');

function fake(gate, routes) {
  const calls = [];
  const api = {
    async get(path) {
      calls.push({ method: 'GET', path, body: null });
      if (path === '/v1/entitlements') return gate;
      return routes(calls.at(-1));
    },
    async post(path, body) {
      calls.push({ method: 'POST', path, body });
      return routes(calls.at(-1));
    },
    async del(path) {
      calls.push({ method: 'DELETE', path, body: null });
      return routes(calls.at(-1));
    },
  };
  return { api, calls };
}

function i2pCalls(calls) {
  return calls.filter((call) => call.path.includes('/i2p'));
}

const catalogue = [
  { name: 'impreza_list_servers' },
  ...I2P_TOOL_NAMES.map((name) => ({ name })),
];

for (const entitlements of [null, {}, { known: true, hidden: [] }, { i2p: false }, { i2p: 1 }, { i2p: 'true' }]) {
  const listed = filterI2pTools(catalogue, entitlements).map((tool) => tool.name);
  for (const name of REMOTE) assert(!listed.includes(name), JSON.stringify(entitlements) + ' listed ' + name);
}
assert.deepEqual(
  filterI2pTools(catalogue, { known: true, hidden: [], i2p: true }).map((tool) => tool.name),
  ['impreza_list_servers', ...REMOTE],
);

const off = fake({ known: true, hidden: [] }, () => { throw new Error('deployment route called while the gate is off'); });
for (const [name, args] of [
  ['impreza_i2p_destination', { deployment_id: DEP, request: true, confirm: true, private_key: SEED }],
  ['impreza_i2p_export', { deployment_id: DEP, recipient_pubkey: PUB, confirm: true, seed: SEED }],
  ['impreza_i2p_remove', { deployment_id: DEP, confirm: true, 'dest.secret': SEED }],
]) {
  const outcome = await handleI2p(name, args, off.api);
  assert.equal(outcome.ok, false);
  assert.equal(outcome.error, I2P_UNAVAILABLE);
  assert(!JSON.stringify(outcome).includes(SEED), name + ' echoed key material while unavailable');
}
assert.equal(i2pCalls(off.calls).length, 0, 'the closed gate made a deployment request');
assert(!JSON.stringify(off.calls).includes(SEED));
assert(!JSON.stringify(off.calls).includes(PUB), 'the public key must not be sent while the gate is off');

const on = fake({ i2p: true }, (call) => {
  if (call.method === 'POST' && call.path === `/v1/platform/deployments/${DEP}/i2p`) {
    return { command_id: REPORT, seed: SEED };
  }
  if (call.method === 'GET' && call.path === `/v1/platform/deployments/${DEP}/i2p`) {
    return { destination: B32 };
  }
  if (call.method === 'GET' && call.path === '/v1/platform/deployments/dpl_clear/i2p') {
    return { destination: CLEAR };
  }
  if (call.method === 'POST' && call.path === `/v1/platform/deployments/${DEP}/i2p/export`) {
    return { command_id: EXPORT, sealed: BOX, 'dest.secret': SEED };
  }
  if (call.method === 'DELETE' && call.path === `/v1/platform/deployments/${DEP}/i2p`) {
    return { removed: true, private_key: SEED };
  }
  throw new Error('unexpected ' + call.method + ' ' + call.path);
});

{
  const missing = await handleI2p('impreza_i2p_destination', { deployment_id: DEP, request: true }, on.api);
  assert.equal(missing.ok, false);
  assert.match(missing.error, /confirm/);
  const asked = await handleI2p('impreza_i2p_destination', { deployment_id: DEP, request: true, confirm: true }, on.api);
  assert.equal(asked.ok, true);
  assert.deepEqual(asked.body, { command_id: REPORT });
  assert(!JSON.stringify(asked).includes(SEED));
  const posted = on.calls.at(-1);
  assert.equal(posted.method, 'POST');
  assert.equal(posted.path, `/v1/platform/deployments/${DEP}/i2p`);
  assert.deepEqual(posted.body, {});
}

{
  const read = await handleI2p('impreza_i2p_destination', { deployment_id: DEP }, on.api);
  assert.equal(read.ok, true);
  assert.deepEqual(read.body, { destination: B32 });
  const clear = await handleI2p('impreza_i2p_destination', { deployment_id: 'dpl_clear' }, on.api);
  assert.equal(clear.ok, false);
  assert.equal(clear.error, 'I2P response refused.');
  assert(!JSON.stringify(clear).includes(SEED));
  assert(!JSON.stringify(clear).includes('clear.example'));
}

{
  const before = on.calls.length;
  const bad = await handleI2p('impreza_i2p_export', {
    deployment_id: DEP,
    recipient_pubkey: Buffer.alloc(16, 1).toString('base64'),
    confirm: true,
  }, on.api);
  assert.equal(bad.ok, false);
  assert.equal(on.calls.length, before + 1, 'a bad public key may read the gate and must not post');
  assert.equal(i2pCalls(on.calls).length, i2pCalls(on.calls.slice(0, before)).length);
  const extra = await handleI2p('impreza_i2p_export', {
    deployment_id: DEP,
    recipient_pubkey: PUB,
    confirm: true,
    private_key: SEED,
  }, on.api);
  assert.equal(extra.ok, false);
  assert.equal(extra.error, 'unsupported field');
  assert(!JSON.stringify(extra).includes(SEED));
  const exported = await handleI2p('impreza_i2p_export', {
    deployment_id: DEP,
    recipient_pubkey: PUB,
    confirm: true,
  }, on.api);
  assert.equal(exported.ok, true);
  assert.deepEqual(exported.body, { command_id: EXPORT, sealed: BOX });
  assert(!JSON.stringify(exported).includes(SEED), 'the destination seed leaked beside the sealed box');
  const sent = on.calls.at(-1);
  assert.equal(sent.method, 'POST');
  assert.equal(sent.path, `/v1/platform/deployments/${DEP}/i2p/export`);
  assert.deepEqual(sent.body, { recipient_pubkey: PUB });
}

{
  const removed = await handleI2p('impreza_i2p_remove', { deployment_id: DEP, confirm: true }, on.api);
  assert.deepEqual(removed.body, { removed: true });
  assert(!JSON.stringify(removed).includes(SEED), 'removal leaked a private key');
}

const clean = fake({ i2p: true }, (call) => {
  if (call.method === 'POST' && call.path.endsWith('/export')) {
    return { command_id: EXPORT, sealed: BOX };
  }
  if (call.method === 'DELETE') return { removed: true };
  if (call.method === 'GET' && call.path.endsWith('/i2p')) return { destination: null };
  throw new Error('unexpected clean ' + call.method + ' ' + call.path);
});
{
  const exported = await handleI2p('impreza_i2p_export', {
    deployment_id: DEP,
    recipient_pubkey: PUB,
    confirm: true,
  }, clean.api);
  assert.equal(exported.ok, true);
  assert.deepEqual(exported.body, { command_id: EXPORT, sealed: BOX });
  const removed = await handleI2p('impreza_i2p_remove', { deployment_id: DEP, confirm: true }, clean.api);
  assert.deepEqual(removed.body, { removed: true });
  const empty = await handleI2p('impreza_i2p_destination', { deployment_id: DEP }, clean.api);
  assert.deepEqual(empty.body, { destination: null });
  assert(!JSON.stringify(clean.calls).includes(SEED));
}

for (const command_id of [SHORT, 'cmd_' + 'AB'.repeat(16), 'cmd_' + 'cd'.repeat(32)]) {
  const shaped = fake({ i2p: true }, (call) => {
    if (call.method === 'POST' && call.path === `/v1/platform/deployments/${DEP}/i2p`) return { command_id };
    throw new Error('unexpected shape ' + call.method + ' ' + call.path);
  });
  const refused = await handleI2p('impreza_i2p_destination', { deployment_id: DEP, request: true, confirm: true }, shaped.api);
  assert.equal(refused.ok, false, command_id + ' was accepted');
  assert.equal(refused.error, 'I2P response refused.');
  assert(!JSON.stringify(refused).includes(command_id));
}

console.log('PASS: I2P tools stay hidden and unavailable while the gate is off; request, read, sealed export and removal match the retained contract.');
