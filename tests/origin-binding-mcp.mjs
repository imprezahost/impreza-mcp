import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { envSchema, credentialOriginAllowed } from '../dist/env.js';

const base = { IMPREZA_API_KEY: 'imp_12345678', IMPREZA_API_SECRET: 's'.repeat(32) };
const unbound = envSchema.safeParse({ ...base, IMPREZA_BASE_URL: 'https://unbound-origin.invalid' });
assert.equal(unbound.success, false, 'env mode accepted an unbound host');
const bound = envSchema.safeParse({ ...base, IMPREZA_BASE_URL: 'https://unbound-origin.invalid', IMPREZA_ORIGIN_AUTHORIZED: 'https://unbound-origin.invalid' });
assert.equal(bound.success, true, 'explicit origin was refused');
const official = envSchema.safeParse({ ...base });
assert.equal(official.success, true);
assert.equal(credentialOriginAllowed('https://api.imprezahost.com'), true);
assert.equal(credentialOriginAllowed('https://unbound-origin.invalid'), false);
const home = mkdtempSync(path.join(tmpdir(), 'origin-binding-'));
const requests = path.join(home, 'requests.jsonl');
const fixture = path.join(home, 'fixture.json');
writeFileSync(fixture, JSON.stringify({ code: 'pair_' + randomBytes(16).toString('hex'), api_key: 'imp_' + randomBytes(20).toString('hex'), api_secret: randomBytes(32).toString('hex'), expires_at: new Date(Date.now() + 86400000).toISOString(), mode: 'ok' }));
const code = JSON.parse(readFileSync(fixture, 'utf8')).code;
// The pairing fixture records only requests to pairing-fixture.invalid and throws before recording any other
// host, so the unbound host here is the recorded one: a request to it would show.
const env = { ...process.env, HOME: home, USERPROFILE: home, PAIRING_FIXTURE: fixture, PAIRING_REQUESTS: requests, IMPREZA_BASE_URL: 'https://pairing-fixture.invalid' };
delete env.IMPREZA_API_KEY; delete env.IMPREZA_API_SECRET; delete env.IMPREZA_ORIGIN_AUTHORIZED;
const server = fileURLToPath(new URL('../dist/server.js', import.meta.url));
const preload = new URL('./fixtures/pairing-fetch.mjs', import.meta.url).href;
const login = spawnSync(process.execPath, ['--import', preload, server, 'login', '--code', code], { env, encoding: 'utf8', timeout: 25000, windowsHide: true });
assert.notEqual(login.status, 0, 'login accepted an unbound origin');
assert.match(login.stderr || '', /not authorized/, login.stderr || login.stdout || 'no output');
const sent = existsSync(requests) ? readFileSync(requests, 'utf8').trim() : '';
assert.equal(sent, '', 'pairing code left toward the unbound pairing-fixture.invalid');
mkdirSync(home, { recursive: true });
console.log('PASS origin binding: the environment refuses an unbound origin');
console.log('PASS origin binding: login sent 0 requests to an unbound origin');
