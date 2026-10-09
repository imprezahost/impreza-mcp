import { constants, lstatSync, mkdirSync, openSync, closeSync, fstatSync, readFileSync, chmodSync, type Stats } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { z } from 'zod';
import { IMPREZA_BASE_URL_SCHEMA, IMPREZA_PROXY_SCHEMA } from './env.js';

export const credentialSchema = z.object({
  api_key: z.string().regex(/^imp_[a-f0-9]+$(?![\s\S])/).min(8).max(256),
  api_secret: z.string().min(16).max(512).regex(/^[A-Za-z0-9_-]+$(?![\s\S])/),
  base_url: IMPREZA_BASE_URL_SCHEMA.removeDefault(),
  proxy: IMPREZA_PROXY_SCHEMA,
  scopes: z.array(z.enum(['read', 'deploy', 'manage'])).max(3),
  ip_mode: z.enum(['whitelist', 'tofu', 'keyonly']),
  expires_at: z.string().datetime().nullable(),
});
export type SavedCredential = z.infer<typeof credentialSchema>;
export const credentialDirectory = (): string => join(homedir(), '.impreza');
export const credentialPath = (): string => join(credentialDirectory(), 'credentials.json');

// POSIX mode bits do not restrict access on Windows: use a protected owner-only DACL.
function windowsPrivacy(file: string, directory: boolean, set: boolean): void {
  const script = `
$ErrorActionPreference='Stop'
$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User
$p=$env:IMPREZA_PRIVATE_PATH
if ($env:IMPREZA_SET_PRIVATE -eq '1') {
 if ($env:IMPREZA_PRIVATE_DIR -eq '1') {
  $acl=New-Object Security.AccessControl.DirectorySecurity
  $rule=New-Object Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow')
 } else {
  $acl=New-Object Security.AccessControl.FileSecurity
  $rule=New-Object Security.AccessControl.FileSystemAccessRule($sid,'FullControl','Allow')
 }
 $acl.SetOwner($sid); $acl.SetAccessRuleProtection($true,$false); $acl.AddAccessRule($rule)
 if ($env:IMPREZA_PRIVATE_DIR -eq '1') { [IO.Directory]::SetAccessControl($p,$acl) } else { [IO.File]::SetAccessControl($p,$acl) }
}
if ($env:IMPREZA_PRIVATE_DIR -eq '1') { $acl=[IO.Directory]::GetAccessControl($p) } else { $acl=[IO.File]::GetAccessControl($p) }
if (-not $acl.AreAccessRulesProtected -or $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $sid.Value) { exit 1 }
$rules=$acl.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])
if ($rules.Count -eq 0) { exit 1 }
foreach ($r in $rules) { if ($r.IsInherited -or $r.IdentityReference.Value -ne $sid.Value -or $r.AccessControlType -ne 'Allow') { exit 1 } }
`;
  const executable = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const result = spawnSync(executable, ['-NoProfile', '-NonInteractive', '-Command', script], {
    env: { ...process.env, IMPREZA_PRIVATE_PATH: file, IMPREZA_PRIVATE_DIR: directory ? '1' : '0', IMPREZA_SET_PRIVATE: set ? '1' : '0' },
    stdio: 'ignore', timeout: 15000, windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error('Credential permissions could not be verified.');
}

export function assertPrivate(file: string, info: Stats, directory: boolean): void {
  if (info.isSymbolicLink() || (directory ? !info.isDirectory() : (!info.isFile() || info.nlink !== 1))) {
    throw new Error('Credential storage must be a private regular file and directory.');
  }
  if (process.platform === 'win32') windowsPrivacy(file, directory, false);
  else if (info.uid !== process.getuid?.() || (info.mode & 0o777) !== (directory ? 0o700 : 0o600)) {
    throw new Error('Credential storage must be owned by you with directory mode 0700 and file mode 0600.');
  }
}

export function prepareCredentialDirectory(): void {
  const directory = credentialDirectory();
  let created = false;
  try { mkdirSync(directory, { mode: 0o700 }); created = true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  if (created && process.platform === 'win32') windowsPrivacy(directory, true, true);
  assertPrivate(directory, lstatSync(directory), true);
}

export function protectNewCredential(file: string): void {
  if (process.platform === 'win32') windowsPrivacy(file, false, true);
  else chmodSync(file, 0o600);
  assertPrivate(file, lstatSync(file), false);
}

export function loadCredential(): SavedCredential | undefined {
  const file = credentialPath();
  try { lstatSync(file); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw new Error('Saved credentials could not be read.');
  }
  let fd: number | undefined;
  try {
    assertPrivate(credentialDirectory(), lstatSync(credentialDirectory()), true);
    const before = lstatSync(file);
    assertPrivate(file, before, false);
    fd = openSync(file, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
    const actual = fstatSync(fd);
    if (!actual.isFile() || actual.nlink !== 1 || actual.ino !== before.ino || actual.dev !== before.dev || actual.size > 16384) throw new Error();
    const credential = credentialSchema.parse(JSON.parse(readFileSync(fd, 'utf8')));
    if (credential.expires_at && Date.parse(credential.expires_at) <= Date.now()) throw new Error();
    return credential;
  } catch { throw new Error('Saved credentials are invalid, expired or not private. Pair again or provide both credential environment variables.'); }
  finally { if (fd !== undefined) closeSync(fd); }
}

export function credentialEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  // Never combine a key from one source with a secret from another.
  if (env.IMPREZA_API_KEY !== undefined || env.IMPREZA_API_SECRET !== undefined) return env;
  const saved = loadCredential();
  if (!saved) return env;
  if (env.IMPREZA_BASE_URL) {
    const endpoint = new URL(IMPREZA_BASE_URL_SCHEMA.parse(env.IMPREZA_BASE_URL));
    if (!['/', '/v1', '/v1/'].includes(endpoint.pathname) || endpoint.origin !== saved.base_url) {
      throw new Error('Saved credentials belong to a different API URL. Pair that endpoint or supply both credential environment variables.');
    }
  }
  return { ...env, IMPREZA_API_KEY: saved.api_key, IMPREZA_API_SECRET: saved.api_secret, IMPREZA_BASE_URL: saved.base_url,
    ...(env.IMPREZA_PROXY || saved.proxy ? { IMPREZA_PROXY: env.IMPREZA_PROXY || saved.proxy } : {}) };
}
