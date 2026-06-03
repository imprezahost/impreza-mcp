// Tiny Impreza Host REST client. Hand-written to match the public
// OpenAPI surface in impreza-platform/specs/openapi-platform.yaml.
//
// Auth: standard X-API-Key + X-API-Secret headers, sourced from env.
// Network: native fetch (Node ≥ 20 has it). No retry / circuit-breaker
// in v1 — the AI client retries the tool call if it cares.

import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import * as tar from 'tar';

export interface ImprezaConfig {
  baseURL: string;
  apiKey: string;
  apiSecret: string;
  /** Wall-clock budget per HTTP call. Default 60s. */
  timeoutMs?: number;
}

export class ImprezaClient {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly timeoutMs: number;

  constructor(cfg: ImprezaConfig) {
    this.baseURL = cfg.baseURL.replace(/\/+$/, '');
    this.apiKey = cfg.apiKey;
    this.apiSecret = cfg.apiSecret;
    this.timeoutMs = cfg.timeoutMs ?? 60_000;
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
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          'X-API-Key': this.apiKey,
          'X-API-Secret': this.apiSecret,
          'User-Agent': `impreza-mcp/${VERSION}`,
          ...(init.headers ?? {}),
        },
        signal: ctrl.signal,
      });
      return res;
    } finally {
      clearTimeout(timer);
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
  last_health_at?: string | null;
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
const EXCLUDED_FILES = new Set(['.DS_Store', 'Thumbs.db']);

function isExcluded(relPath: string): boolean {
  const normalized = relPath.replace(/^\.[\\/]+/, '').replace(/\\/g, '/');
  const parts = normalized.split('/').filter((p) => p && p !== '.');
  for (const p of parts) {
    if (EXCLUDED_DIRS.has(p)) return true;
  }
  const base = parts[parts.length - 1] ?? '';
  if (EXCLUDED_FILES.has(base)) return true;
  if (base.endsWith('.pyc')) return true;
  return false;
}

/** Lowercase hex sha256 of the given bytes. */
export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}
