// Env validation for the MCP server, extracted from server.ts so the rules
// can be unit-tested without booting the server itself.

import { z } from 'zod';

import { parseSocksProxy } from './socks5.js';

// IMPREZA_BASE_URL must be https:// — the API key + secret travel in request
// headers on every call, so an http:// (or otherwise downgraded) base URL
// would expose them in cleartext. Refusing non-https here prevents an
// attacker who can influence the environment from pointing the client at a
// malicious or plaintext endpoint to harvest credentials.
//
// The single exception is a .onion host: onion circuits are end-to-end
// encrypted by Tor itself, so http:// to a .onion never crosses the network
// in cleartext. A proxy is mandatory for either scheme on an onion host.
export const isOnionHost = (host: string): boolean => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z2-7]{56}\.onion$/i.test(host);
export const IMPREZA_BASE_URL_SCHEMA = z
  .string()
  .url()
  .refine((u) => {
    let url: URL;
    try {
      url = new URL(u);
    } catch {
      return false;
    }
    if (url.username || url.password || url.search || url.hash) return false;
    if (url.hostname.endsWith('.onion') && !isOnionHost(url.hostname)) return false;
    if (url.protocol === 'https:') return true;
    return url.protocol === 'http:' && isOnionHost(url.hostname);
  }, 'IMPREZA_BASE_URL must be an https:// URL — http:// is accepted only for .onion hosts')
  .default('https://api.imprezahost.com');

// IMPREZA_PROXY routes every API call through a local SOCKS5 proxy (typically
// the Tor daemon). Format checked with the same parser the client uses, so a
// value that validates here cannot fail at request time.
export const IMPREZA_PROXY_SCHEMA = z
  .string()
  .refine((v) => {
    try {
      parseSocksProxy(v);
      return true;
    } catch {
      return false;
    }
  }, 'IMPREZA_PROXY must be a socks5://host:port URL (e.g. socks5://127.0.0.1:9050)')
  .optional();

export const OFFICIAL_ORIGIN = 'https://api.imprezahost.com';

// The DEV origin is the operator's IMPREZA_DEV_ORIGIN (0.56.0), never a host in the package, and only with the profile on.
export function credentialOriginAllowed(baseURL: string, authorized?: string, devProfile?: string, devOrigin?: string): boolean {
  let url: URL;
  try { url = new URL(baseURL); } catch { return false; }
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  if (url.origin === OFFICIAL_ORIGIN) return true;
  if (devProfile === 'f58-10-dev' && devOrigin && devOrigin !== OFFICIAL_ORIGIN && url.origin === devOrigin) return true;
  return authorized === url.origin;
}

export const envSchema = z.object({
  IMPREZA_API_KEY: z.string().min(8, 'IMPREZA_API_KEY must be set (starts with imp_)'),
  IMPREZA_API_SECRET: z.string().min(16, 'IMPREZA_API_SECRET must be set'),
  IMPREZA_BASE_URL: IMPREZA_BASE_URL_SCHEMA,
  IMPREZA_PROXY: IMPREZA_PROXY_SCHEMA,
  IMPREZA_ORIGIN_AUTHORIZED: z.string().optional(),
  IMPREZA_DEV_PROFILE: z.string().optional(),
  IMPREZA_DEV_ORIGIN: z.string().optional(),
}).superRefine((cfg, ctx) => {
  let host: string;
  try { host = new URL(cfg.IMPREZA_BASE_URL).hostname; } catch { return; }
  if (host.endsWith('.onion') && !cfg.IMPREZA_PROXY) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['IMPREZA_PROXY'], message: 'An onion API requires IMPREZA_PROXY; direct DNS and connections are refused.' });
  }
  if (!credentialOriginAllowed(cfg.IMPREZA_BASE_URL, cfg.IMPREZA_ORIGIN_AUTHORIZED, cfg.IMPREZA_DEV_PROFILE, cfg.IMPREZA_DEV_ORIGIN)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['IMPREZA_BASE_URL'], message: 'IMPREZA_BASE_URL is not an authorized origin for this credential. Set IMPREZA_ORIGIN_AUTHORIZED to that exact origin.' });
  }
});
