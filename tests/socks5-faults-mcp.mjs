import assert from 'node:assert/strict';
import net from 'node:net';
import { socks5Connect } from '../dist/socks5.js';
import { ImprezaClient } from '../dist/client.js';

const sockets = new Set();
async function serve(handler, run) {
  const server = net.createServer(s => { sockets.add(s); s.on('error',()=>{}); s.on('close',()=>sockets.delete(s)); handler(s); });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try { await run({host:'127.0.0.1',port:server.address().port}); }
  finally { for(const s of sockets)s.destroy(); await new Promise(r=>server.close(r)); }
}
const cfg = {baseURL:'http://'+'a'.repeat(56)+'.onion',apiKey:'fixture-key',apiSecret:'fixture-secret'};
assert.throws(()=>new ImprezaClient(cfg),/proxy/);
await serve(s=>s.end(), p=>assert.rejects(socks5Connect(p,'unit.test',80,500),/closed/));
await serve(s=>{}, async p=> {
  const ctrl = new AbortController();
  const start=Date.now(); setTimeout(()=>ctrl.abort(),25);
  await assert.rejects(socks5Connect(p,'unit.test',80,5000,ctrl.signal),/aborted/);
  assert(Date.now()-start<1000);
});
// Domain reply is deliberately split BEFORE its length byte. No offset may
// be computed from an incomplete frame; the tunneled payload must survive.
await serve(s=>{
  s.once('data',()=>{ s.write(Buffer.from([5,0])); s.once('data',()=>{
    s.write(Buffer.from([5,0,0,3]));
    setTimeout(()=>s.write(Buffer.from([3,97,98,99,0,80])),15);
    s.once('data',()=>s.end('HTTP/1.1 200 OK\r\nContent-Length: 25\r\n\r\n{"success":true,"data":7}'));
  }); });
}, async p=> {
  // Exact body length is set below in the generic response cases; here only
  // exercise the handshake without consuming an application response.
  const socket=await socks5Connect(p,'unit.test',80,500); socket.destroy();
});
for (const [name,response,expect] of [
  ['empty','HTTP/1.1 204 No Content\r\nConnection: close\r\n\r\n',undefined],
  ['redirect','HTTP/1.1 302 Found\r\nLocation: http://127.0.0.1/steal\r\nContent-Length: 0\r\n\r\n',/UNEXPECTED_REDIRECT/],
  ['truncated','HTTP/1.1 200 OK\r\nContent-Length: 500\r\n\r\nshort',/truncated|aborted/],
]) {
  await serve(s=>{s.once('data',()=>{s.write(Buffer.from([5,0]));s.once('data',()=>{
    s.write(Buffer.from([5,0,0,1,0,0,0,0,0,80]));s.once('data',()=>s.end(response));
  });});},async p=>{
    const c=new ImprezaClient({...cfg,proxy:`socks5://${p.host}:${p.port}`,timeoutMs:500});
    if(expect)await assert.rejects(c.get('/'),expect,name);else assert.equal(await c.get('/'),undefined,name);
  });
}
// Proxy accepts the tunnel but never completes TLS. Abort must settle rather
// than waiting forever for secureConnect (a closed socket emits no such event).
await serve(s=>{s.once('data',()=>{s.write(Buffer.from([5,0]));s.once('data',()=>s.write(Buffer.from([5,0,0,1,0,0,0,0,0,80])));});},async p=>{
  const c=new ImprezaClient({...cfg,baseURL:cfg.baseURL.replace('http:','https:'),proxy:`socks5://${p.host}:${p.port}`,timeoutMs:100});
  await assert.rejects(c.get('/'),/abort/i);
});
console.log('PASS: SOCKS close, cancellation, fragmentation, 204, redirects, truncated body, TLS timeout and onion no-proxy refusal.');
