// DEV profile — the operator's explicit opt-in, OFF by default.
//
// Nothing here runs unless the operator sets IMPREZA_DEV_PROFILE=f58-10-dev. With it unset the server behaves
// exactly as before for every existing client. With it set, THIS client is confined to one DEV target, the
// finite read path the server card already uses (status / identity / apps / refresh), and every other tool,
// argument, request, subcommand, proxy or credential source is refused BEFORE any HTTP request leaves the
// process. The binding comes from this profile and the operator's environment, never from the caller, the model,
// the panel or an API answer.
//
// The target is the operator's, never the package's: the DEV origin, account and service come from
// IMPREZA_DEV_ORIGIN, IMPREZA_DEV_CLIENT_ID and IMPREZA_DEV_SERVICE_ID, and the bound agent from
// IMPREZA_DEV_AGENT_ID. Without all four the profile refuses at startup. Identity is one direct GET (no catalogue),
// the server list is that binding (no request), and deployments are one GET without a query (the API confines it
// to the agent).
//
// This is a CLIENT guard. It is not the API's enforcement: the DEV credential and the server keep their own
// checks, and this profile grants nothing on its own.

export const DEV_PROFILE_ENV = 'IMPREZA_DEV_PROFILE';
export const DEV_PROFILE_ID = 'f58-10-dev';
export const DEV_AGENT_ENV = 'IMPREZA_DEV_AGENT_ID';
export const DEV_ORIGIN_ENV = 'IMPREZA_DEV_ORIGIN';
export const DEV_CLIENT_ENV = 'IMPREZA_DEV_CLIENT_ID';
export const DEV_SERVICE_ENV = 'IMPREZA_DEV_SERVICE_ID';
// The package's own production default: a DEV binding never points at it.
const PRODUCTION_ORIGIN = 'https://api.imprezahost.com';
export const DEV_TOOLS = ['impreza_vps_status', 'impreza_api_call', 'impreza_list_servers', 'impreza_list_deployments'] as const;
export const DEV_RESOURCE = 'ui://impreza/server-card';
export const OPERATOR_BINDING = 'operator_binding';
const AGENT = /^agt_[a-f0-9]{16,24}$(?![\s\S])/;
// A positive decimal id that fits the API's 32-bit columns: no sign, no leading zero, no whitespace.
const ID = /^[1-9][0-9]{0,9}$(?![\s\S])/;
const ID_MAX = 2147483647;
const identityPath = (p: DevProfile) => `/vps/proxmox/${p.serviceId}`;
const eventsPath = (p: DevProfile) => `/vps/proxmox/${p.serviceId}/events`;
// The only requests the profile can make: four GETs, none with a query.
// The events path is the operations ledger the server card's Activity
// section reads — same service, same read-only surface as the status call.
const requests = (p: DevProfile) => [`/v1${identityPath(p)}/status`, `/v1${identityPath(p)}`, `/v1${eventsPath(p)}`, '/v1/platform/deployments'];
// Environment proxies that Node's fetch can honour (NODE_USE_ENV_PROXY) or that a wrapper could pick up.
const PROXY_ENV = ['IMPREZA_PROXY', 'NODE_USE_ENV_PROXY', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy'];

export interface DevProfile {
  readonly id: typeof DEV_PROFILE_ID;
  /** The operator's IMPREZA_DEV_ORIGIN: an exact https origin, never the production default. */
  readonly origin: string;
  readonly clientId: number;
  readonly serviceId: number;
  /** The agent of that service: the operator's IMPREZA_DEV_AGENT_ID, fixed for the whole process. */
  readonly boundAgent: string;
}

/** An exact https origin (lowercase host, default port, no path, query, fragment or userinfo), else null. */
function exactOrigin(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 253) return null;
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) return null;
  return url.origin === value ? value : null;
}

function exactId(value: unknown): number | null {
  if (typeof value !== 'string' || !ID.test(value)) return null;
  const n = Number(value);
  return n <= ID_MAX ? n : null;
}

/** A fixed code, never an environment value, argument or response text. */
export class DevProfileRefusal extends Error {
  constructor(readonly code: string) {
    super(`DEV_PROFILE_DENIED: ${code}`);
  }
}

/**
 * The startup gate. null = profile not requested (existing behaviour). Otherwise every condition holds or the
 * process refuses before reading saved credentials, running a subcommand or constructing the HTTP client.
 */
export function devProfileFromEnv(env: NodeJS.ProcessEnv, argv: readonly string[]): DevProfile | null {
  const requested = env[DEV_PROFILE_ENV];
  if (requested === undefined) return null;
  if (requested !== DEV_PROFILE_ID) throw new DevProfileRefusal('unknown_profile');
  // No login/setup/help/version or any other subcommand: only the stdio server itself.
  if (argv.length !== 2) throw new DevProfileRefusal('subcommand');
  if (PROXY_ENV.some((name) => env[name] !== undefined)) throw new DevProfileRefusal('proxy');
  // Both values from the operator's environment: never the saved/paired credential, never a mix of sources.
  if (!env.IMPREZA_API_KEY || !env.IMPREZA_API_SECRET) throw new DevProfileRefusal('credential_source');
  // The target, from the operator's environment only. Exact formats; the production default is never a DEV origin.
  const origin = exactOrigin(env[DEV_ORIGIN_ENV]);
  if (origin === null || origin === PRODUCTION_ORIGIN) throw new DevProfileRefusal('origin');
  const clientId = exactId(env[DEV_CLIENT_ENV]);
  if (clientId === null) throw new DevProfileRefusal('client_id');
  const serviceId = exactId(env[DEV_SERVICE_ENV]);
  if (serviceId === null) throw new DevProfileRefusal('service_id');
  // Explicit and exact: the base URL is that origin; any other host, port, path, query or userinfo is refused.
  if (env.IMPREZA_BASE_URL !== origin && env.IMPREZA_BASE_URL !== origin + '/') throw new DevProfileRefusal('base_url');
  // The binding's public agent id (not a secret), exact format.
  const agent = env[DEV_AGENT_ENV];
  if (typeof agent !== 'string' || !AGENT.test(agent)) throw new DevProfileRefusal('agent_id');
  return Object.freeze({ id: DEV_PROFILE_ID, origin, clientId, serviceId, boundAgent: agent });
}

function plain(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function onlyKeys(args: Record<string, unknown>, keys: string[]): boolean {
  const own = Object.keys(args).sort();
  const want = [...keys].sort();
  return own.length === want.length && own.every((key, i) => key === want[i]);
}

/**
 * The dispatcher gate, BEFORE any other handling of the call: an exact tool, exact keys, exact values bound to
 * the operator's service and agent. No other service, client or agent, no write tool, no query/cursor/URL/
 * redirect field, no path variant. Returns null when admitted, else the refusal code.
 */
export function devProfileGate(profile: DevProfile, name: string, args: unknown): string | null {
  if (!(DEV_TOOLS as readonly string[]).includes(name)) return 'tool';
  if (!plain(args)) return 'arguments';
  switch (name) {
    case 'impreza_vps_status':
      return onlyKeys(args, ['service_id']) && sameService(profile, args.service_id) ? null : 'arguments';
    case 'impreza_api_call':
      return onlyKeys(args, ['path']) && (args.path === identityPath(profile) || args.path === eventsPath(profile)) ? null : 'arguments';
    case 'impreza_list_servers':
      return onlyKeys(args, []) ? null : 'arguments';
    case 'impreza_list_deployments':
      if (!onlyKeys(args, ['agent_id'])) return 'arguments';
      return args.agent_id === profile.boundAgent ? null : 'agent';
  }
  return 'tool';
}

/**
 * The transport gate: the three GETs of the admitted methods, on the DEV origin only, without a query. A second
 * line behind the dispatcher gate, so a code path that would issue any other request (catalogue, servers, custom
 * deployments, entitlements, policy lookups, writes) fails closed before fetch.
 */
export function devProfileRequest(profile: DevProfile, method: string, url: URL): boolean {
  if (method !== 'GET' || url.origin !== profile.origin || url.username || url.password || url.hash) return false;
  // url.search is '' for a bare trailing '?', which would still go on the wire: refuse any '?' at all.
  return url.search === '' && !url.href.includes('?') && requests(profile).includes(url.pathname);
}

type TextResult = { content?: unknown; isError?: unknown; structuredContent?: unknown };
type Text = { content: Array<{ type: 'text'; text: string }> };

function payloadOf(result: TextResult): unknown {
  const first = Array.isArray(result.content) ? (result.content[0] as { type?: unknown; text?: unknown } | undefined) : undefined;
  if (!first || first.type !== 'text' || typeof first.text !== 'string') throw new DevProfileRefusal('result_shape');
  try { return JSON.parse(first.text); } catch { throw new DevProfileRefusal('result_shape'); }
}

function sameService(profile: DevProfile, value: unknown): boolean {
  return value === profile.serviceId || value === String(profile.serviceId);
}

/** The output gate of the two service reads (status/refresh, identity): an answer naming another service is refused. */
export function devProfileResult<R extends TextResult>(profile: DevProfile, name: string, result: R): R {
  if (result.isError) return result;
  if (name !== 'impreza_vps_status' && name !== 'impreza_api_call') throw new DevProfileRefusal('tool');
  const payload = payloadOf(result);
  if (!plain(payload)) throw new DevProfileRefusal('result_shape');
  for (const key of ['service_id', 'serviceid']) {
    if (key in payload && !sameService(profile, payload[key])) throw new DevProfileRefusal('foreign_service');
  }
  return result;
}

/**
 * `impreza_list_servers` under the profile makes NO request: it returns the operator binding, the one reference the
 * server card needs to pick its agent (service_id + agent_id). It is not an observed inventory: every other field
 * is null/empty or the explicit `operator_binding` marker, never an invented name, address, state or provider.
 */
export function devProfileServers(profile: DevProfile): Text {
  const server = { agent_id: profile.boundAgent, service_id: profile.serviceId, hostname: null, origin: OPERATOR_BINDING,
    status: OPERATOR_BINDING, version: null, update_policy: {}, agent_update: {}, last_seen_at: null, registered_at: null,
    tor: null, capacity: null };
  return { content: [{ type: 'text', text: JSON.stringify({ source: OPERATOR_BINDING, observed: false, servers: [server], total: 1 }, null, 2) }] };
}

/**
 * `impreza_list_deployments` under the profile: the one admitted GET (no query, no custom listing). The API confines the
 * answer to the bound agent; an entry of any other agent means that confinement failed, so the whole answer is
 * refused rather than filtered. Custom deployments are not requested: custom_count is 0 by construction and the
 * text says so (custom_requested: false).
 */
export function devProfileDeploymentsResult(profile: DevProfile, payload: unknown): Text {
  const list = plain(payload) && Array.isArray(payload.deployments) ? payload.deployments : null;
  if (!list || !list.every((d) => plain(d) && d.agent_id === profile.boundAgent)) throw new DevProfileRefusal('foreign_agent');
  return { content: [{ type: 'text', text: JSON.stringify({ deployments: list, total: list.length, catalog_count: list.length,
    custom_count: 0, custom_requested: false }, null, 2) }] };
}
