// Pins the IMPREZA_BASE_URL rule: https everywhere, with http allowed ONLY
// for .onion hosts (onion circuits are end-to-end encrypted, so TLS is
// redundant there), plus the IMPREZA_PROXY socks5://host:port format.
// The schema lives in src/env.ts precisely so it can be exercised here
// without booting the MCP server.
import assert from 'node:assert/strict';
import { envSchema } from '../dist/env.js';

const base = { IMPREZA_API_KEY: 'imp_12345678', IMPREZA_API_SECRET: 's'.repeat(32) };
const parse = (env) => envSchema.safeParse({ ...base, ...env });

// 1. Defaults: no IMPREZA_BASE_URL at all → the https default.
{
  const r = parse({});
  assert.equal(r.success, true);
  assert.equal(r.data.IMPREZA_BASE_URL, 'https://api.imprezahost.com');
  assert.equal(r.data.IMPREZA_PROXY, undefined);
}

// 2. https clearnet is accepted.
assert.equal(parse({ IMPREZA_BASE_URL: 'https://api.imprezahost.com' }).success, true);
assert.equal(parse({ IMPREZA_BASE_URL: 'https://api.imprezahost.com/' }).success, true);

// 3. .onion accepts BOTH http and https (v3 address: 56 base32 chars).
const onion = 'http://' + 'a'.repeat(56) + '.onion';
const proxy = { IMPREZA_PROXY: 'socks5://127.0.0.1:9050' };
assert.equal(parse({ ...proxy, IMPREZA_BASE_URL: onion }).success, true, 'http .onion refused');
assert.equal(parse({ ...proxy, IMPREZA_BASE_URL: onion.replace('http://', 'https://') }).success, true, 'https .onion refused');
assert.equal(parse({ IMPREZA_BASE_URL: onion }).success, false, 'onion without proxy accepted');
assert.equal(parse({ ...proxy, IMPREZA_BASE_URL: 'http://example.onion' }).success, false);
assert.equal(parse({ IMPREZA_BASE_URL: 'not a URL' }).success, false);

// 4. http clearnet stays refused — the credential-leak guard is untouched.
{
  const r = parse({ IMPREZA_BASE_URL: 'http://api.imprezahost.com' });
  assert.equal(r.success, false, 'http clearnet was accepted');
  assert.match(r.error.issues[0].message, /https/);
}
// "onion" has to be a real TLD suffix, not a lookalike.
assert.equal(parse({ IMPREZA_BASE_URL: 'http://onion.evil.example.com' }).success, false);
assert.equal(parse({ IMPREZA_BASE_URL: 'http://evil-onion.com' }).success, false);
// Other schemes are refused even for .onion.
assert.equal(parse({ IMPREZA_BASE_URL: 'ftp://' + 'a'.repeat(56) + '.onion' }).success, false);

// 5. IMPREZA_PROXY format.
assert.equal(parse({ IMPREZA_PROXY: 'socks5://127.0.0.1:9050' }).success, true);
assert.equal(parse({ IMPREZA_PROXY: 'socks5://localhost:9150' }).success, true);
assert.equal(parse({ IMPREZA_PROXY: 'http://127.0.0.1:9050' }).success, false, 'http proxy scheme accepted');
assert.equal(parse({ IMPREZA_PROXY: 'socks5://127.0.0.1' }).success, false, 'missing port accepted');
assert.equal(parse({ IMPREZA_PROXY: 'socks5://user:pw@127.0.0.1:9050' }).success, false, 'auth proxy accepted');
assert.equal(parse({ IMPREZA_PROXY: 'not-a-url' }).success, false);

console.log('PASS: IMPREZA_BASE_URL keeps https-only for clearnet, allows http/https .onion, and IMPREZA_PROXY requires socks5://host:port.');
