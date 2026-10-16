// No network: the BYO bootstrap route of the REST API, simulated with the
// server's rules (label: plain text up to 120 characters; Starter quota of one
// slot, held by an unused token). Every request is appended to ADD_SERVER_LOG
// so the test can prove that a refused argument never reached HTTP.
import { appendFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const LOG = process.env.ADD_SERVER_LOG;
if (!LOG) throw new Error('ADD_SERVER_LOG is required by the add-server fixture');
const PLAN = 'used counts registered external servers plus install tokens not yet used. Starter (no Impreza service): 1 external server, free. Bundled (any active Impreza VPS): 5. Unlimited plan: no limit.';
const INSTALL = 'https://add-server-fixture.invalid/install.sh';
let used = 0;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

globalThis.fetch = async (url, options = {}) => {
  const u = new URL(String(url));
  if (u.origin !== 'https://add-server-fixture.invalid' || u.pathname !== '/v1/platform/servers/external/bootstrap') throw new Error('unexpected fixture destination ' + u.pathname);
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;
  appendFileSync(LOG, JSON.stringify({ method, path: u.pathname, body }) + '\n');
  if (method !== 'POST') throw new Error('unexpected method');
  const label = body?.label;
  if (label !== undefined && (typeof label !== 'string' || [...label].length > 120 || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(label) || label.trim() === '')) {
    return json(400, { success: false, error: { code: 'INVALID_REQUEST', message: 'label must be up to 120 characters of plain text.' } });
  }
  if (used >= 1) {
    return json(409, { success: false, error: { code: 'QUOTA_EXCEEDED', message: "You've reached your external server quota (1 of 1). Remove a server you no longer use before adding another.",
      next_steps: [{ action: 'Any active Impreza VPS moves the account to the Bundled tier (5 external servers).', tool: 'impreza_vps_offer', doc: 'https://docs.imprezahost.com/tutorials/agent-apps-panels.html' }] } });
  }
  used++;
  const token = 'bts_' + randomBytes(16).toString('hex');
  return json(201, { success: true, data: {
    bootstrap_token: token, install_url: INSTALL, one_liner: 'curl -fsSL ' + INSTALL + ' | IMPREZA_BOOTSTRAP=' + token + ' sh',
    expires_at: new Date(Date.now() + 600000).toISOString().replace(/\.\d+Z$/, 'Z'), tier: 'starter', quota: 1, used, plan: PLAN,
  } });
};
