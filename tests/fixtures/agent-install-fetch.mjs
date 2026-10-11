// No network: the two agent-install routes of the REST API, simulated with the
// same rules as the server (a consent token per read, bound to the service,
// spent once). Every request is appended to AGENT_INSTALL_LOG so the test can
// prove that a refused call never reached HTTP.
import { appendFileSync } from 'node:fs';

const LOG = process.env.AGENT_INSTALL_LOG;
if (!LOG) throw new Error('AGENT_INSTALL_LOG is required by the agent-install fixture');
const ABOUT = 'The Impreza agent is a small service that runs as root on the server. With it, Impreza can deploy and update apps, take app backups, read app logs and show metrics. It reports a heartbeat and the server load (CPU, memory, disk), never the content of the apps. It can be paused or removed later from My Apps.';
const SHA = 'a'.repeat(64);
const VPS = {
  501: { hostname: 'ready.fixture.invalid', installable: true, reason: null, detail: 'The agent can be installed on this server with one click, after the customer agrees.' },
  502: { hostname: 'stopped.fixture.invalid', installable: false, reason: 'server_stopped', detail: 'The server is stopped. Start it, then ask again.' },
};
const minted = new Map(); // token -> service
const spent = new Set();
let n = 0;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

globalThis.fetch = async (url, options = {}) => {
  const u = new URL(String(url));
  const m = u.pathname.match(/^\/v1\/platform\/services\/([1-9][0-9]*)\/agent-install$/);
  if (u.origin !== 'https://agent-install-fixture.invalid' || !m) throw new Error('unexpected fixture destination ' + u.pathname);
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  appendFileSync(LOG, JSON.stringify({ method, path: u.pathname, body }) + '\n');
  const sid = Number(m[1]);
  const vps = VPS[sid];
  if (!vps) return json(404, { success: false, error: { code: 'NOT_FOUND', message: 'Service not found.' } });
  const job = vps.queued ? { status: 'pending', attempts: 0, created_at: '2026-10-10 14:00:00', last_error: '' } : null;
  if (method === 'GET') {
    let token = null;
    if (vps.installable && !vps.queued) { token = (Math.floor(Date.now() / 1000) + 300) + '.' + 'f'.repeat(30) + String(++n).padStart(10, '0'); minted.set(token, sid); }
    return json(200, { success: true, data: {
      service_id: sid, hostname: vps.hostname, product: 'VPS Server',
      agent_installable: vps.installable && !vps.queued, reason: vps.queued ? 'install_in_progress' : vps.reason,
      detail: vps.queued ? 'An install or setup is already in progress for this server.' : vps.detail,
      about: ABOUT, script_sha256: SHA, state: vps.queued ? 'installing' : 'not_started', job, agent: null, confirm_token: token,
    } });
  }
  if (method !== 'POST') throw new Error('unexpected method');
  if (!body || Object.keys(body).join() !== 'confirm_token') return json(400, { success: false, error: { code: 'INVALID_REQUEST', message: 'Only confirm_token is accepted.' } });
  if (spent.has(body.confirm_token)) return json(409, { success: false, error: { code: 'CONFIRM_TOKEN_USED', message: 'That confirmation was already used.' } });
  if (minted.get(body.confirm_token) !== sid) return json(400, { success: false, error: { code: 'CONFIRMATION_INVALID', message: 'That confirmation is expired or belongs to another service or key.' } });
  spent.add(body.confirm_token);
  vps.queued = true;
  return json(202, { success: true, data: { service_id: sid, status: 'queued', job_id: 900 + sid, message: 'The install is queued.', next: 'Poll GET /v1/platform/services/' + sid + '/agent-install until state is "online".' } });
};
