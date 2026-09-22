// Minimal no-auth SOCKS5 CONNECT client (RFC 1928) over node:net. Used when
// IMPREZA_PROXY is set — typically a local Tor daemon. The target hostname is
// always sent in the ATYP=0x03 domain form so the PROXY resolves it: the local
// resolver never sees the API hostname, which is exactly what prevents DNS
// leaks on the Tor path. Hand-rolled rather than pulled from a dependency —
// the whole handshake is three small buffers.

import net from 'node:net';

export interface SocksProxy {
  host: string;
  port: number;
}

/** Parse `socks5://host:port`. No auth, no path — this client speaks no-auth CONNECT only. */
export function parseSocksProxy(raw: string): SocksProxy {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`IMPREZA_PROXY is not a valid URL (want socks5://host:port, e.g. socks5://127.0.0.1:9050)`);
  }
  if (url.protocol !== 'socks5:') {
    throw new Error(`IMPREZA_PROXY must be a socks5:// URL, got ${url.protocol}// (e.g. socks5://127.0.0.1:9050)`);
  }
  if (url.username || url.password) {
    throw new Error('IMPREZA_PROXY: username/password auth is not supported — point it at a no-auth local SOCKS5 listener');
  }
  if ((url.pathname !== '' && url.pathname !== '/') || url.search || url.hash) {
    throw new Error('IMPREZA_PROXY must be just socks5://host:port, with no path or query');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const port = url.port ? Number(url.port) : NaN;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('IMPREZA_PROXY must include both host and port (e.g. socks5://127.0.0.1:9050)');
  }
  return { host, port };
}

/**
 * Open a TCP connection to `targetHost:targetPort` THROUGH the SOCKS5 proxy.
 * The returned socket is a plain connected stream; for https targets the
 * caller layers TLS on top of it. Fails closed — any proxy or handshake
 * error rejects; there is no direct-connection fallback anywhere.
 */
export function socks5Connect(proxy: SocksProxy, targetHost: string, targetPort: number, timeoutMs: number, signal?: AbortSignal): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const hostBytes = Buffer.from(targetHost, 'utf8');
    if (!hostBytes.length || hostBytes.length > 255 || !Number.isInteger(targetPort) || targetPort < 1 || targetPort > 65535) {
      reject(new Error(`SOCKS5: target hostname too long (${targetHost.length} chars)`));
      return;
    }

    const socket = net.connect(proxy.port, proxy.host);
    let settled = false;
    const onClose = () => fail(new Error('SOCKS5: proxy closed before handshake completed'));
    const onAbort = () => fail(new Error('SOCKS5: request aborted'));
    const timer = setTimeout(() => fail(new Error(`SOCKS5: proxy handshake timed out after ${timeoutMs}ms`)), timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      socket.removeListener('close', onClose);
      socket.removeListener('end', onClose);
    };
    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      socket.setTimeout(0);
      socket.destroy();
      reject(err);
    };
    const onError = (err: Error) =>
      fail(new Error(`SOCKS5: cannot reach proxy ${proxy.host}:${proxy.port} (${err.message})`));
    socket.once('error', onError);
    socket.once('close', onClose);
    socket.once('end', onClose);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) { onAbort(); return; }

    let buf = Buffer.alloc(0);
    let greetingDone = false;

    const onData = (chunk: Buffer) => {
      buf = Buffer.concat([buf, chunk]);
      try {
        if (!greetingDone) {
          if (buf.length < 2) return;
          if (buf[0] !== 0x05 || buf[1] !== 0x00) {
            fail(new Error(`SOCKS5: proxy refused no-auth (method 0x${(buf[1] ?? 0xff).toString(16).padStart(2, '0')})`));
            return;
          }
          buf = buf.subarray(2);
          greetingDone = true;
          // CONNECT, ATYP=0x03 domain: the PROXY resolves this name.
          const req = Buffer.alloc(4 + 1 + hostBytes.length + 2);
          req[0] = 0x05; // version
          req[1] = 0x01; // CONNECT
          req[2] = 0x00; // reserved
          req[3] = 0x03; // ATYP: domain name
          req[4] = hostBytes.length;
          hostBytes.copy(req, 5);
          req.writeUInt16BE(targetPort, 5 + hostBytes.length);
          socket.write(req);
        }
        // CONNECT reply: [ver, rep, rsv, atyp, bind-addr, bind-port].
        if (buf.length < 4) return;
        if (buf[0] !== 0x05 || buf[2] !== 0x00) {
          fail(new Error('SOCKS5: malformed reply version'));
          return;
        }
        if (buf[1] !== 0x00) {
          fail(new Error(`SOCKS5: CONNECT to ${targetHost}:${targetPort} refused by proxy (reply 0x${(buf[1] ?? 0).toString(16).padStart(2, '0')})`));
          return;
        }
        const atyp = buf[3];
        if (atyp === 0x03 && buf.length < 5) return;
        const addrLen = atyp === 0x01 ? 4 : atyp === 0x04 ? 16 : atyp === 0x03 ? 1 + (buf[4] ?? 0) : -1;
        if (addrLen < 0) {
          fail(new Error(`SOCKS5: unknown ATYP 0x${(atyp ?? 0).toString(16)} in reply`));
          return;
        }
        if (buf.length < 4 + addrLen + 2) return;

        // Handshake done. Anything after the reply is already relayed data —
        // push it back so the consumer (TLS or HTTP) does not lose it.
        const rest = buf.subarray(4 + addrLen + 2);
        settled = true;
        cleanup();
        socket.pause();
        socket.removeListener('data', onData);
        // Keep the error listener until the consumer installs its own, so a
        // reset between promise resolution and TLS setup cannot crash Node.
        socket.setTimeout(0);
        if (rest.length > 0) socket.unshift(rest);
        resolve(socket);
      } catch (err) {
        fail(err as Error);
      }
    };
    socket.on('data', onData);
    socket.on('connect', () => {
      socket.write(Buffer.from([0x05, 0x01, 0x00])); // ver 5, 1 method offered: no-auth
    });
  });
}
