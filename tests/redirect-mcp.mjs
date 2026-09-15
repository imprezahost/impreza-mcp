// The API key and secret travel as CUSTOM headers, which fetch does NOT strip on
// a cross-origin redirect the way it strips Authorization. A followed 3xx would
// therefore hand a customer's credentials to whatever host the redirect names.
// The API never redirects, so the client refuses one — this pins that, and proves
// the redirect target is never contacted at all.
import assert from 'node:assert/strict';
import http from 'node:http';
import { ImprezaClient } from '../dist/client.js';

const listen = (handler) => new Promise((resolve) => {
  const srv = http.createServer(handler);
  srv.listen(0, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }));
});
const json = (res, body) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };

const seen = [];
const attacker = await listen((req, res) => {
  seen.push({ key: req.headers['x-api-key'] ?? null, secret: req.headers['x-api-secret'] ?? null });
  json(res, { success: true, data: { stolen: true } });
});

let apiHits = 0;
const api = await listen((req, res) => {
  apiHits++;
  if (req.url.startsWith('/v1/ok')) return json(res, { success: true, data: { fine: true } });
  if (req.url.startsWith('/v1/same-host')) { res.writeHead(301, { Location: '/v1/ok' }); return res.end(); }
  res.writeHead(302, { Location: attacker.url + '/v1/account' });
  res.end();
});

const client = new ImprezaClient({ baseURL: api.url + '/v1', apiKey: 'imp_realkey', apiSecret: 'real_secret', timeoutMs: 5000 });

try {
  // 1. Cross-origin redirect: refused, and the target never hears from us.
  await assert.rejects(() => client.get('/account'), /UNEXPECTED_REDIRECT/, 'cross-origin redirect was not refused');
  assert.equal(seen.length, 0, 'redirect target was contacted: ' + JSON.stringify(seen));

  // 2. Same-host redirect is refused too — the API does not redirect at all, so
  //    following one means trusting a hop that was never part of the contract.
  await assert.rejects(() => client.post('/same-host', {}), /UNEXPECTED_REDIRECT/, 'same-host redirect was not refused');

  // 3. Every verb goes through the same guard.
  for (const call of [() => client.put('/x', {}), () => client.patch('/x', {}), () => client.del('/x'),
                      () => client.postRaw('/x', 'application/gzip', new Uint8Array([1, 2, 3]))]) {
    await assert.rejects(call, /UNEXPECTED_REDIRECT/, 'a verb still follows redirects');
  }
  assert.equal(seen.length, 0, 'credentials leaked on one of the verbs: ' + JSON.stringify(seen));

  // 4. The happy path is untouched.
  assert.deepEqual(await client.get('/ok'), { fine: true });
  assert(apiHits >= 7, 'expected every call to reach the API itself');

  console.log('PASS: every verb refuses a redirect and the redirect target never receives the credentials.');
} finally {
  attacker.srv.close();
  api.srv.close();
}
