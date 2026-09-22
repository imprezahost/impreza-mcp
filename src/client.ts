// Tiny Impreza Host REST client. Hand-written to match the public
// OpenAPI surface in impreza-platform/specs/openapi-platform.yaml.
//
// Auth: standard X-API-Key + X-API-Secret headers, sourced from env.
// Network: native fetch (Node ≥ 20 has it), or a hand-rolled no-auth SOCKS5
// transport over node:net/node:http when `proxy` is configured (Tor usage —
// see socks5.ts). No retry / circuit-breaker in v1 — the AI client retries
// the tool call if it cares.

import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWriteStream } from 'node:fs';
import tls from 'node:tls';
import { unlink } from 'node:fs/promises';
import * as tar from 'tar';

import { parseSocksProxy, socks5Connect, type SocksProxy } from './socks5.js';
import { isOnionHost } from './env.js';

export interface ImprezaConfig {
  baseURL: string;
  apiKey: string;
  apiSecret: string;
  /** Wall-clock budget per HTTP call. Default 60s. */
  timeoutMs?: number;
  /**
   * Optional `socks5://host:port` proxy (typically a local Tor daemon) that
   * EVERY API call is routed through. Fail-closed: when set and the proxy is
   * unreachable, requests fail — there is no silent fallback to clearnet.
   */
  proxy?: string;
}

export class ImprezaClient {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly timeoutMs: number;
  private readonly proxy: SocksProxy | undefined;

  constructor(cfg: ImprezaConfig) {
    this.baseURL = cfg.baseURL.replace(/\/+$/, '');
    this.apiKey = cfg.apiKey;
    this.apiSecret = cfg.apiSecret;
    this.timeoutMs = cfg.timeoutMs ?? 60_000;
    this.proxy = cfg.proxy ? parseSocksProxy(cfg.proxy) : undefined;
    const host = new URL(this.baseURL).hostname;
    if (host.endsWith('.onion') && (!isOnionHost(host) || !this.proxy)) {
      throw new Error('An onion API requires a valid v3 hostname and an explicit SOCKS5 proxy; no direct connection is allowed.');
    }
  }

  /**
   * Authenticated GET. Decodes the standard envelope ({success, data,
   * meta}) and returns the `data` payload typed as T. Throws on non-2xx
   * or success=false.
   */
  async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    const url = new URL(this.baseURL + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, v);
      }
    }
    const res = await this.fetch(url, { method: 'GET' });
    return this.parseEnvelope<T>(res);
  }

  /**
   * Authenticated JSON POST. body is JSON.stringified; response decoded
   * as envelope.
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetch(new URL(this.baseURL + path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    return this.parseEnvelope<T>(res);
  }

  /**
   * Authenticated JSON PUT. Mirrors post() — body JSON-stringified, response
   * decoded as the standard envelope. Used by the DNS-record / nameserver
   * update tools.
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetch(new URL(this.baseURL + path), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    return this.parseEnvelope<T>(res);
  }

  /**
   * Authenticated PATCH. Distinct from put() because the API means it: PATCH
   * merges the fields you send and leaves the rest alone, which is what a
   * partial profile update needs.
   */
  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetch(new URL(this.baseURL + path), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    return this.parseEnvelope<T>(res);
  }

  /**
   * Authenticated DELETE, optionally with a JSON body. Some endpoints (e.g.
   * DNS record removal) identify the target in the request body rather than
   * the path. Response decoded as the standard envelope.
   */
  async del<T>(path: string, body?: unknown): Promise<T> {
    const init: RequestInit = { method: 'DELETE' };
    if (body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' };
      init.body = JSON.stringify(body);
    }
    const res = await this.fetch(new URL(this.baseURL + path), init);
    return this.parseEnvelope<T>(res);
  }

  /**
   * Authenticated POST with raw binary body. Used for the Phase 12
   * context upload (`POST /v1/platform/deployments/custom/contexts`)
   * which accepts a gzip tarball as the raw body.
   */
  async postRaw<T>(path: string, contentType: string, bytes: Uint8Array): Promise<T> {
    const res = await this.fetch(new URL(this.baseURL + path), {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: bytes,
    });
    return this.parseEnvelope<T>(res);
  }

  private async fetch(url: URL, init: RequestInit): Promise<Response> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-API-Key': this.apiKey,
      'X-API-Secret': this.apiSecret,
      'User-Agent': `impreza-mcp/${VERSION}`,
      // All callers pass plain objects — cast keeps HeadersInit's array/Headers
      // variants from poisoning the merged shape.
      ...((init.headers as Record<string, string> | undefined) ?? {}),
    };
    try {
      // The credentials above are CUSTOM headers. Fetch strips Authorization,
      // Cookie and Proxy-Authorization when a redirect crosses to another
      // origin — it has no idea ours are credentials, so it would carry the
      // customer's key and secret to whatever host a 3xx names. The API
      // answers JSON on every endpoint and never redirects, so we take the
      // redirect ourselves and refuse it. (node:http never follows redirects
      // at all, so the proxied path is equally strict by construction.)
      const res = this.proxy
        ? await this.proxiedFetch(url, init, headers, ctrl.signal)
        : await fetch(url, { ...init, headers, redirect: 'manual', signal: ctrl.signal });
      if (res.status >= 300 && res.status < 400) {
        throw new Error(
          `UNEXPECTED_REDIRECT: the API answered HTTP ${res.status} for ${url.pathname}. ` +
            'Refusing to resend your API credentials to the redirect target. ' +
            'Check IMPREZA_BASE_URL, or whether something is intercepting the connection.',
        );
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * fetch() equivalent routed through the configured SOCKS5 proxy. The proxy
   * resolves the target hostname (remote DNS — no local lookup, no leak) and
   * TLS, when the URL is https, is layered on top of the proxied socket. Uses
   * node:http with a per-request `createConnection` (the one form Node honors
   * — an Agent-constructor option is silently ignored), so no dependency is
   * needed. Any proxy/handshake failure throws: fail closed, never direct.
   */
  private async proxiedFetch(
    url: URL,
    init: RequestInit,
    headers: Record<string, string>,
    signal: AbortSignal,
  ): Promise<Response> {
    if (!this.proxy) throw new Error('proxiedFetch without a configured proxy');
    const isTls = url.protocol === 'https:';
    const port = url.port ? Number(url.port) : isTls ? 443 : 80;
    let socket: net.Socket | tls.TLSSocket | undefined;
    const onAbort = () => socket?.destroy(new Error('Proxied request aborted'));
    signal.addEventListener('abort', onAbort);
    try {
      signal.throwIfAborted();
      socket = await socks5Connect(this.proxy, url.hostname, port, this.timeoutMs, signal);
      signal.throwIfAborted();
      if (isTls) {
        const tlsSocket = tls.connect({ socket, servername: url.hostname });
        // Abort removes once() listeners before destroy(error) emits. Keep a
        // sink for that late event; the awaited handshake/request still rejects.
        tlsSocket.on('error', () => {});
        socket = tlsSocket;
        await once(tlsSocket, 'secureConnect', { signal });
      }
      const established = socket;
      const body = init.body as string | Uint8Array | undefined;
      const reqHeaders = { ...headers };
      if (body !== undefined) {
        reqHeaders['Content-Length'] = String(typeof body === 'string' ? Buffer.byteLength(body) : body.byteLength);
      }
      return await new Promise<Response>((resolve, reject) => {
        const req = http.request(
          {
            method: init.method ?? 'GET',
            host: url.hostname,
            port,
            path: url.pathname + url.search,
            headers: reqHeaders,
            createConnection: () => established,
          },
          (res) => {
            const chunks: Buffer[] = [];
            let bytes = 0;
            res.on('data', (c: Buffer) => {
              bytes += c.length;
              if (bytes > 16 * 1024 * 1024) { req.destroy(new Error('Proxied response exceeds 16 MiB')); return; }
              chunks.push(c);
            });
            res.on('end', () => {
              try {
              const resHeaders = new Headers();
              for (let i = 0; i + 1 < res.rawHeaders.length; i += 2) {
                resHeaders.append(res.rawHeaders[i] as string, res.rawHeaders[i + 1] as string);
              }
              resolve(
                new Response([204, 205, 304].includes(res.statusCode ?? 0) ? null : Buffer.concat(chunks), {
                  status: res.statusCode ?? 502,
                  statusText: res.statusMessage ?? '',
                  headers: resHeaders,
                }),
              );
              } catch (err) { reject(err); }
            });
            res.on('error', reject);
            res.on('aborted', () => reject(new Error('Proxied response was truncated')));
          },
        );
        req.setTimeout(this.timeoutMs, () => req.destroy(new Error(`proxied request timed out after ${this.timeoutMs}ms`)));
        req.on('error', reject);
        if (body !== undefined) req.write(body);
        req.end();
        established.resume();
      });
    } finally {
      signal.removeEventListener('abort', onAbort);
      socket?.destroy();
    }
  }

  private async parseEnvelope<T>(res: Response): Promise<T> {
    const text = await res.text();
    let env: { success?: boolean; data?: T; error?: { code?: string; message?: string }; meta?: { request_id?: string } };
    try {
      env = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`HTTP ${res.status}: non-JSON response (${text.slice(0, 200)})`);
    }
    if (!res.ok || env.success === false || env.error) {
      const code = env.error?.code ?? `HTTP_${res.status}`;
      const msg = env.error?.message ?? `request failed (HTTP ${res.status})`;
      const reqId = env.meta?.request_id ? ` [req=${env.meta.request_id}]` : '';
      throw new Error(`${code}: ${msg}${reqId}`);
    }
    return (env.data as T) ?? (undefined as unknown as T);
  }
}

// Imported for the User-Agent header below + re-exported so any existing
// consumer that pulled VERSION from this module keeps working unchanged.
import { VERSION } from './version.js';
export { VERSION };

// ─────────────────────────────────────────────────────────────────────
// Domain types (mirrors the public openapi-platform schemas)
// ─────────────────────────────────────────────────────────────────────

export interface Server_ {
  agent_id: string;
  hostname: string;
  origin: string;
  service_id?: number | null;
  status: string;
  version?: string;
  last_seen_at?: string;
}

export interface ServerList {
  servers: Server_[];
  total: number;
}

export interface App {
  name: string;
  display_name: string;
  version: string;
  category: string;
  tags?: string[];
  description?: string;
  icon_url?: string;
}

export interface AppList {
  apps: App[];
  total: number;
}

export interface Deployment {
  id: string;
  app_name?: string;
  app_version?: string;
  name?: string;
  mode?: string;
  agent_id: string;
  status: string;
  domain?: string | null;
  onion?: string | null;
  image?: string;
  cpus?: number;
  memory_mb?: number;
  vars?: Record<string, unknown>;
  created_at: string;
  /** Historical deployment receipt; use runtime for current container health. */
  last_health_at?: string | null;
  runtime?: {
    state: 'healthy' | 'running' | 'starting' | 'degraded' | 'stopped' | 'unknown';
    reason: string | null;
    observed_at: string | null;
    age_seconds: number | null;
    fresh_for_seconds: number;
    scope: 'containers';
    last_reported_state: string | null;
    counts: Record<string, number> | null;
  };
  last_operation?: { progress?: {supported: boolean; step: string; label: string; reported_at: string | null; age_seconds: number | null; recovery: "none" | "resending_result" | "reconciling" | "required"; reason: string | null}; command_id: string; kind: string; status: string; created_at: string; completed_at: string | null; cancellation?: {state: "none" | "requested" | "cancelled"; phase: string; can_cancel: boolean; requested_at: string | null; confirmed_at: string | null; reason: string | null} } | null;
  last_error?: string | null;
}

export interface DeploymentList {
  deployments: Deployment[];
  total: number;
}

export interface CustomDeployContextUpload {
  context_id: string;
  sha256: string;
  size_bytes: number;
  expires_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// Tarball helper — used by the Dockerfile-mode upload path
// ─────────────────────────────────────────────────────────────────────

/**
 * Tar + gzip the given project directory into a temp file, return
 * the bytes + the temp path (so the caller can delete it after
 * upload). Excludes the usual suspects (.git, node_modules,
 * __pycache__, etc.) baked into the same list the Go CLI uses.
 *
 * The tar is rooted at the project dir contents (entries are
 * `Dockerfile`, `main.go`, etc., not `proj/Dockerfile`), matching
 * what the agent's extractor expects.
 */
export async function tarProjectDir(projectDir: string): Promise<{ bytes: Uint8Array; sizeBytes: number; cleanup: () => Promise<void> }> {
  const info = await stat(projectDir);
  if (!info.isDirectory()) {
    throw new Error(`${projectDir} is not a directory`);
  }
  const tmpPath = join(tmpdir(), `impreza-mcp-ctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.tar.gz`);

  // Stream-tar into the temp file, then read back as bytes.
  await new Promise<void>((resolve, reject) => {
    const out = createWriteStream(tmpPath);
    out.on('error', reject);
    out.on('finish', resolve);
    tar
      .create(
        {
          gzip: true,
          cwd: projectDir,
          // Exclude common noise that bloats the upload or contains
          // host-specific paths. Match basenames against the bake-in set.
          filter: (path: string) => !isExcluded(path),
        },
        ['.'],
      )
      .pipe(out);
  });

  const bytes = await readFile(tmpPath);
  return {
    bytes,
    sizeBytes: bytes.byteLength,
    cleanup: async () => {
      try {
        await unlink(tmpPath);
      } catch {
        /* best effort */
      }
    },
  };
}

const EXCLUDED_DIRS = new Set(['.git', '.svn', '.hg', '.bzr', 'node_modules', '__pycache__', '.venv', 'venv', '.impreza']);
const EXCLUDED_FILES = new Set(['.DS_Store', 'Thumbs.db', '.npmrc', '.pypirc']);

function isExcluded(relPath: string): boolean {
  const normalized = relPath.replace(/^\.[\\/]+/, '').replace(/\\/g, '/');
  const parts = normalized.split('/').filter((p) => p && p !== '.');
  for (const p of parts) {
    if (EXCLUDED_DIRS.has(p)) return true;
  }
  const base = parts[parts.length - 1] ?? '';
  if (EXCLUDED_FILES.has(base)) return true;
  if (base === '.env' || (base.startsWith('.env.') && !['.env.example', '.env.sample', '.env.template'].includes(base))) return true;
  if (base.endsWith('.pyc')) return true;
  return false;
}

/** Lowercase hex sha256 of the given bytes. */
export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}
