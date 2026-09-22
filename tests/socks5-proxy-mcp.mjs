// Proves the IMPREZA_PROXY transport end to end:
//   1. With proxy set, the client speaks RFC 1928 no-auth SOCKS5 and sends the
//      API hostname as ATYP=0x03 (domain) — i.e. the PROXY resolves the name,
//      the local resolver never sees it (the hostname used here, unit.test,
//      does not resolve at all, so any local lookup would fail the test).
//   2. A full authenticated API call succeeds through the relay.
//   3. Fail closed: a proxy that refuses the CONNECT, and a proxy that is not
//      listening at all, both make the call fail — with the base URL pointing
//      at a directly-reachable 127.0.0.1, so a silent clearnet fallback would
//      succeed and be caught.
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';
import { ImprezaClient } from '../dist/client.js';

const listen = (srv) => new Promise((resolve) => srv.listen(0, '127.0.0.1', () => resolve(srv.address().port)));

// ── Fake API ──────────────────────────────────────────────────────────
let apiHits = 0;
const api = http.createServer((req, res) => {
  apiHits++;
  if (req.headers['x-api-key'] !== 'imp_torkey' || req.headers['x-api-secret'] !== 'tor_secret_123456') {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: { code: 'AUTH', message: 'missing credentials' } }));
  }
  if (req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: { echoed: JSON.parse(Buffer.concat(chunks).toString('utf8')) } }));
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, data: { path: req.url } }));
});
const apiPort = await listen(api);

// ── Fake SOCKS5 proxy ─────────────────────────────────────────────────
// behavior 'relay'  — complete the handshake and pipe to the fake API
//                     ("resolving" whatever hostname it was handed).
// behavior 'refuse' — answer the CONNECT with general failure (0x01).
function fakeSocks(behavior, captures) {
  return net.createServer((conn) => {
    let buf = Buffer.alloc(0);
    let greeted = false;
    let established = false; // per-connection: stop parsing once relaying
    conn.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (!greeted) {
        if (buf.length < 3) return;
        captures.greeting = [...buf.subarray(0, 3)];
        buf = buf.subarray(3);
        greeted = true;
        conn.write(Buffer.from([0x05, 0x00])); // no-auth accepted
      }
      if (established) return; // after this point it's relayed traffic
      if (buf.length < 5) return;
      const [ver, cmd, atyp] = [buf[0], buf[1], buf[3]];
      let host, port, total;
      if (atyp === 0x03) {
        const len = buf[4];
        if (buf.length < 5 + len + 2) return;
        host = buf.subarray(5, 5 + len).toString('utf8');
        port = buf.readUInt16BE(5 + len);
        total = 5 + len + 2;
      } else if (atyp === 0x01) {
        if (buf.length < 10) return;
        host = [...buf.subarray(4, 8)].join('.');
        port = buf.readUInt16BE(8);
        total = 10;
      } else {
        conn.destroy();
        return;
      }
      captures.connect = captures.connect ?? { ver, cmd, atyp, host, port };
      established = true;
      const rest = buf.subarray(total);
      buf = Buffer.alloc(0);
      if (behavior === 'refuse') {
        conn.end(Buffer.from([0x05, 0x01, 0x00, 0x01, 0, 0, 0, 0, 0, 0])); // general failure
        return;
      }
      conn.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0])); // success
      const upstream = net.connect(apiPort, '127.0.0.1');
      upstream.on('connect', () => {
        if (rest.length) upstream.write(rest);
        conn.pipe(upstream).pipe(conn);
      });
      upstream.on('error', () => conn.destroy());
    });
    conn.on('error', () => {});
  });
}

try {
  // 1 + 2. Full call through the relay, with a hostname that cannot resolve locally.
  const captures = {};
  const socks = fakeSocks('relay', captures);
  const socksPort = await listen(socks);
  const client = new ImprezaClient({
    baseURL: `http://unit.test:${apiPort}/v1`,
    apiKey: 'imp_torkey',
    apiSecret: 'tor_secret_123456',
    proxy: `socks5://127.0.0.1:${socksPort}`,
    timeoutMs: 5000,
  });

  const data = await client.get('/servers', { q: 'one' });
  assert.equal(data.path, '/v1/servers?q=one');

  // Greeting: version 5, one method offered, no-auth (0x00).
  assert.deepEqual(captures.greeting, [0x05, 0x01, 0x00]);
  // CONNECT request: version 5, CONNECT, ATYP=0x03 domain — the proxy was
  // handed the HOSTNAME, proving remote DNS (a local lookup of unit.test
  // would have failed before any byte was sent).
  assert.equal(captures.connect.ver, 0x05);
  assert.equal(captures.connect.cmd, 0x01);
  assert.equal(captures.connect.atyp, 0x03, 'target was not sent in domain form — DNS would leak locally');
  assert.equal(captures.connect.host, 'unit.test');
  assert.equal(captures.connect.port, apiPort);

  // POST with a JSON body through the same path.
  const posted = await client.post('/deployments', { hello: 'tor' });
  assert.deepEqual(posted.echoed, { hello: 'tor' });
  socks.close();

  // 3a. Proxy refuses the CONNECT → the call fails, and with the API directly
  //     reachable at 127.0.0.1 any silent fallback would have succeeded.
  const refuseCaptures = {};
  const refusing = fakeSocks('refuse', refuseCaptures);
  const refusingPort = await listen(refusing);
  const beforeRefuse = apiHits;
  const refusedClient = new ImprezaClient({
    baseURL: `http://127.0.0.1:${apiPort}/v1`,
    apiKey: 'imp_torkey',
    apiSecret: 'tor_secret_123456',
    proxy: `socks5://127.0.0.1:${refusingPort}`,
    timeoutMs: 5000,
  });
  await assert.rejects(() => refusedClient.get('/servers'), /SOCKS5/, 'a refused CONNECT did not fail the call');
  assert.equal(apiHits, beforeRefuse, 'request fell back to a direct connection');
  refusing.close();

  // 3b. Proxy not listening at all → same fail-closed behavior.
  const dead = net.createServer();
  const deadPort = await listen(dead);
  dead.close();
  await new Promise((r) => dead.once('close', r));
  const beforeDead = apiHits;
  const deadClient = new ImprezaClient({
    baseURL: `http://127.0.0.1:${apiPort}/v1`,
    apiKey: 'imp_torkey',
    apiSecret: 'tor_secret_123456',
    proxy: `socks5://127.0.0.1:${deadPort}`,
    timeoutMs: 5000,
  });
  await assert.rejects(() => deadClient.get('/servers'), /SOCKS5/, 'an unreachable proxy did not fail the call');
  assert.equal(apiHits, beforeDead, 'request fell back to a direct connection');

  console.log('PASS: SOCKS5 transport uses remote DNS (ATYP=0x03), relays authenticated calls, and fails closed with no direct fallback.');
} finally {
  api.close();
}
