// I2P local tools. The hosted catalog does not list these names while the
// service's I2P gate is off, and the local/hosted parity check rejects any other
// local-only tool. They are listed only when GET
// /v1/entitlements returns data.i2p === true. Anything else, including a
// missing field or a failed read, keeps them out of tools/list and a direct
// call answers "indisponível" before a deployment request.

export const I2P_UNAVAILABLE = 'indisponível';

export const I2P_TOOL_NAMES = [
  'impreza_i2p_destination',
  'impreza_i2p_export',
  'impreza_i2p_remove',
] as const;

export type I2pToolName = (typeof I2P_TOOL_NAMES)[number];

const DESTINATION =
  'Read the `.b32.i2p` destination the agent reported for an application you own.';
const EXPORT =
  'Queue the sealed export to your X25519 public key. The result is the anonymous box, not the seed.';
const REMOVE =
  'Delete the stored destination and ask the agent to delete the local files.';

const deploymentId = {
  type: 'string',
  description: 'The dpl_… deployment id (from impreza_list_deployments).',
};

export const I2P_TOOLS = [
  {
    name: 'impreza_i2p_destination',
    description: DESTINATION,
    title: 'Read I2P destination',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: deploymentId,
        request: {
          type: 'boolean',
          description:
            'When true, ask the agent to report the destination. The portal does not derive the address.',
        },
        confirm: { type: 'boolean', const: true },
      },
      required: ['deployment_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'impreza_i2p_export',
    description: EXPORT,
    title: 'Export sealed I2P key',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: deploymentId,
        recipient_pubkey: {
          type: 'string',
          description: 'Base64-encoded 32-byte X25519 public key. The private key stays local.',
        },
        confirm: { type: 'boolean', const: true },
      },
      required: ['deployment_id', 'recipient_pubkey', 'confirm'],
      additionalProperties: false,
    },
  },
  {
    name: 'impreza_i2p_remove',
    description: REMOVE,
    title: 'Remove I2P destination',
    inputSchema: {
      type: 'object',
      properties: {
        deployment_id: deploymentId,
        confirm: { type: 'boolean', const: true },
      },
      required: ['deployment_id', 'confirm'],
      additionalProperties: false,
    },
  },
] as const;

export const I2P_ANNOTATIONS: Record<I2pToolName, {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}> = {
  impreza_i2p_destination: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  impreza_i2p_export: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  impreza_i2p_remove: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
};

const B32 = /^[a-z2-7]{52}\.b32\.i2p$/;
// The service mints the command id as cmd_ plus bin2hex(random_bytes(16)): 32 lowercase hex digits.
// A shorter pattern accepts the fixture and refuses the identifier the API actually returns.
const COMMAND = /^cmd_[a-f0-9]{32}$/;
const SECRET_KEYS = new Set([
  'secret',
  'seed',
  'private_key',
  'privkey',
  'dest.secret',
  'destination_secret',
  'dest_secret',
  'raw_key',
  'key',
]);

export function isI2pTool(name: string): name is I2pToolName {
  return (I2P_TOOL_NAMES as readonly string[]).includes(name);
}

/** The production gate is this boolean and nothing else. */
export function i2pGateOpen(entitlements: unknown): boolean {
  if (!entitlements || typeof entitlements !== 'object' || Array.isArray(entitlements)) return false;
  return (entitlements as { i2p?: unknown }).i2p === true;
}

export function filterI2pTools<T extends { name: string }>(tools: readonly T[], entitlements: unknown): T[] {
  const allowed = new Set<string>(i2pGateOpen(entitlements) ? I2P_TOOL_NAMES : []);
  return tools.filter((tool) => !isI2pTool(tool.name) || allowed.has(tool.name));
}

export interface I2pApi {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  del<T>(path: string): Promise<T>;
}

export type I2pOutcome =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; error: string };

const ALLOWED: Record<I2pToolName, readonly string[]> = {
  impreza_i2p_destination: ['deployment_id', 'request', 'confirm'],
  impreza_i2p_export: ['deployment_id', 'recipient_pubkey', 'confirm'],
  impreza_i2p_remove: ['deployment_id', 'confirm'],
};

function refused(error: string): I2pOutcome {
  return { ok: false, error };
}

function deploymentPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value || value !== value.trim()) return null;
  if (value === '.' || value === '..' || /[\\/%\x00-\x20\x7f]/.test(value)) return null;
  return encodeURIComponent(value);
}

function pubkey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const recipient = value.trim();
  const decoded = Buffer.from(recipient, 'base64');
  if (decoded.length !== 32 || decoded.toString('base64') !== recipient) return null;
  return recipient;
}

function secretValues(value: unknown, depth = 0): string[] {
  if (depth > 4 || !value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((item) => secretValues(item, depth + 1));
  const found: string[] = [];
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEYS.has(key) && typeof item === 'string' && item !== '') found.push(item);
    else if (item && typeof item === 'object') found.push(...secretValues(item, depth + 1));
  }
  return found;
}

function leaks(body: Record<string, unknown>, secrets: readonly string[]): boolean {
  const text = JSON.stringify(body);
  return secrets.some((secret) => secret !== '' && text.includes(secret));
}

function commandId(value: unknown): string | null {
  return typeof value === 'string' && COMMAND.test(value) ? value : null;
}

function project(row: unknown, fields: (source: Record<string, unknown>) => Record<string, unknown> | null): I2pOutcome {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return refused('I2P response refused.');
  const source = row as Record<string, unknown>;
  const secrets = secretValues(source);
  const body = fields(source);
  if (!body || leaks(body, secrets)) return refused('I2P response refused.');
  return { ok: true, body };
}

export async function handleI2p(name: string, args: Record<string, unknown>, api: I2pApi): Promise<I2pOutcome> {
  if (!isI2pTool(name)) return refused('unknown tool');
  let entitlements: unknown = null;
  try {
    entitlements = await api.get<unknown>('/v1/entitlements');
  } catch {
    entitlements = null;
  }
  if (!i2pGateOpen(entitlements)) return refused(I2P_UNAVAILABLE);
  for (const key of Object.keys(args)) {
    if (!ALLOWED[name].includes(key)) return refused('unsupported field');
  }
  const dep = deploymentPath(args.deployment_id);
  if (!dep) return refused('deployment_id is required');
  const path = `/v1/platform/deployments/${dep}/i2p`;
  if (name === 'impreza_i2p_destination') {
    if (args.request === true) {
      if (args.confirm !== true) return refused('Explicit customer confirmation is required (confirm: true)');
      const row = await api.post<unknown>(path, {});
      return project(row, (source) => {
        const command_id = commandId(source.command_id);
        return command_id ? { command_id } : null;
      });
    }
    if (args.request !== undefined && args.request !== false) return refused('request must be true or false');
    const row = await api.get<unknown>(path);
    return project(row, (source) => {
      if (source.destination === null) return { destination: null };
      if (typeof source.destination === 'string' && B32.test(source.destination)) {
        return { destination: source.destination };
      }
      return null;
    });
  }
  if (args.confirm !== true) return refused('Explicit customer confirmation is required (confirm: true)');
  if (name === 'impreza_i2p_export') {
    const recipient = pubkey(args.recipient_pubkey);
    if (!recipient) return refused('recipient_pubkey must be the standard base64 of a 32-byte X25519 public key');
    const row = await api.post<unknown>(`${path}/export`, { recipient_pubkey: recipient });
    return project(row, (source) => {
      const command_id = commandId(source.command_id);
      if (!command_id) return null;
      if (!('sealed' in source)) return { command_id };
      if (typeof source.sealed !== 'string' || source.sealed === '' || source.sealed.length > 4096) return null;
      return { command_id, sealed: source.sealed };
    });
  }
  const row = await api.del<unknown>(path);
  return project(row, (source) => (source.removed === true ? { removed: true } : null));
}
