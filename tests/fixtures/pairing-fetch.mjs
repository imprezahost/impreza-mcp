// No external connections. Values are generated at runtime in the disposable test home.
import { readFileSync, appendFileSync } from 'node:fs';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
const fixture = JSON.parse(readFileSync(process.env.PAIRING_FIXTURE, 'utf8'));
if (fixture.mode === 'write-failure') {
  const original = fs.writeFileSync;
  fs.writeFileSync = (target, ...args) => { if (typeof target === 'number') throw new Error(fixture.api_secret + fixture.code); return original(target, ...args); };
  syncBuiltinESMExports();
}
if (fixture.mode === 'sync-failure') {
  fs.fsyncSync = () => { throw new Error(fixture.api_secret + fixture.code); };
  syncBuiltinESMExports();
}
globalThis.fetch = async (url, init) => {
  const parsed = new URL(url);
  if (parsed.hostname !== 'pairing-fixture.invalid') throw new Error('Unexpected fixture destination');
  const pair = parsed.pathname === '/v1/mcp/pair';
  appendFileSync(process.env.PAIRING_REQUESTS, JSON.stringify({
    path: parsed.pathname, method: init.method, redirect: init.redirect,
    anonymous: !init.headers['X-API-Key'] && !init.headers['X-API-Secret'],
    expectedCredential: init.headers['X-API-Key'] === fixture.api_key && init.headers['X-API-Secret'] === fixture.api_secret,
    expectedCode: pair && JSON.parse(init.body).code === fixture.code,
  }) + '\n');
  if (pair) {
    if (fixture.mode === 'network') throw new Error(fixture.api_secret + fixture.code);
    if (fixture.mode === 'redirect') return new Response(null, { status: 307, headers: { location: 'https://other.invalid' } });
    if (fixture.mode === 'refused') return new Response(JSON.stringify({ success: false, error: { message: fixture.api_secret + fixture.code } }), { status: 410 });
    if (fixture.mode === 'oversized') return new Response('x'.repeat(17000));
    if (fixture.mode === 'invalid') return new Response(JSON.stringify({ success: true, data: { api_secret: fixture.api_secret } }));
    return Response.json({ success: true, data: {
      api_key: fixture.api_key, api_secret: fixture.api_secret,
      scopes: ['read'], ip_mode: 'keyonly', expires_at: fixture.mode === 'expired' ? new Date(0).toISOString() : fixture.expires_at,
      base_url: 'https://other.invalid/v1',
      proxy: 'socks5://response-proxy.invalid:9050',
    } });
  }
  if (!init.headers['X-API-Key'] || !init.headers['X-API-Secret']) throw new Error('Missing fixture credential');
  if (parsed.pathname === '/v1/entitlements') return Response.json({success:true,data:{known:true,hidden:[]}});
  return Response.json({success:true,data:{servers:[],total:0}});
};
