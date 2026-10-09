import { constants, openSync, fstatSync, writeFileSync, fsyncSync, closeSync, lstatSync, unlinkSync } from 'node:fs';
import { ImprezaClient } from './client.js';
import { envSchema } from './env.js';
import { credentialSchema, credentialPath, prepareCredentialDirectory, protectNewCredential } from './credentials.js';

export class LoginError extends Error {}

export async function runLogin(argv: readonly string[]): Promise<void> {
  if (argv.length === 1 && (argv[0] === '--help' || argv[0] === '-h')) {
    console.log('Usage: impreza-mcp login --code <one-time-code>');
    console.log('Generate a pairing code in clientarea. Credentials are saved privately and never printed.');
    return;
  }
  if (argv.length !== 2 || argv[0] !== '--code' || !/^pair_[a-f0-9]{32}$(?![\s\S])/.test(argv[1] || '')) {
    throw new LoginError('Usage: impreza-mcp login --code <one-time-code>. Generate a new code in clientarea.');
  }
  const cfg = envSchema.safeParse({ IMPREZA_API_KEY: 'pairing-anonymous', IMPREZA_API_SECRET: 'pairing-anonymous-no-secret',
    ...(process.env.IMPREZA_BASE_URL ? { IMPREZA_BASE_URL: process.env.IMPREZA_BASE_URL } : {}),
    ...(process.env.IMPREZA_PROXY ? { IMPREZA_PROXY: process.env.IMPREZA_PROXY } : {}) });
  if (!cfg.success) throw new LoginError('Invalid API URL or proxy configuration. HTTPS is required; onion APIs require an explicit SOCKS5 proxy.');
  const endpoint = new URL(cfg.data.IMPREZA_BASE_URL);
  if (!['/', '/v1', '/v1/'].includes(endpoint.pathname)) throw new LoginError('Pairing requires an API origin or its /v1 URL.');
  const baseURL = endpoint.origin;
  try { prepareCredentialDirectory(); }
  catch { throw new LoginError('The credential directory is unavailable or not private. No code was exchanged.'); }
  const file = credentialPath();
  let fd: number;
  try { fd = openSync(file, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL, 0o600); }
  catch { throw new LoginError('Credential storage is unavailable or already exists. Existing credentials were not changed; revoke the old key before removing its file.'); }
  const owned = fstatSync(fd);
  let completed = false;
  try {
    protectNewCredential(file);
    const client = new ImprezaClient({ baseURL, apiKey: '', apiSecret: '', timeoutMs: 15000,
      ...(cfg.data.IMPREZA_PROXY ? { proxy: cfg.data.IMPREZA_PROXY } : {}) });
    const data = await client.pairCode(argv[1]!);
    const credential = credentialSchema.parse({
      api_key: data.api_key, api_secret: data.api_secret, scopes: data.scopes,
      ip_mode: data.ip_mode, expires_at: data.expires_at, base_url: baseURL,
      ...(cfg.data.IMPREZA_PROXY ? { proxy: cfg.data.IMPREZA_PROXY } : {}) });
    if (credential.expires_at && Date.parse(credential.expires_at) <= Date.now()) throw new Error();
    writeFileSync(fd, JSON.stringify(credential) + '\n', 'utf8');
    fsyncSync(fd);
    const persisted = lstatSync(file);
    if (persisted.ino !== owned.ino || persisted.dev !== owned.dev || !persisted.isFile()) throw new Error();
    if (process.platform !== 'win32') {
      const directoryFd = openSync(file.substring(0, file.lastIndexOf('/')), constants.O_RDONLY | (constants.O_DIRECTORY || 0));
      try { fsyncSync(directoryFd); } finally { closeSync(directoryFd); }
    }
    completed = true;
  } catch {
    throw new LoginError('Pairing failed or credentials could not be saved. The code may have been consumed; check and revoke the new key in clientarea before trying again.');
  } finally {
    closeSync(fd);
    if (!completed) {
      try {
        const current = lstatSync(file);
        if (current.ino === owned.ino && current.dev === owned.dev && current.isFile()) unlinkSync(file);
      } catch {
        // Preserve the original failure and revocation guidance if cleanup is unavailable.
      }
    }
  }
  console.log('Paired successfully. Credentials saved privately; restart your AI client.');
}
