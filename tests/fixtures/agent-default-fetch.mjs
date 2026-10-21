// Fake API for the agent-default contract: logs every request to AGENT_DEFAULT_LOG and answers like the order and
// quote endpoints do for the app field (an unknown app is refused with the API's own 400). No network.
import { appendFileSync, readFileSync } from 'node:fs';
// The real controller samples, so impreza_vps_offer's declared output schema is satisfied.
const SAMPLES = JSON.parse(readFileSync(new URL('./output-samples.json', import.meta.url), 'utf8'));
const LOG = process.env.AGENT_DEFAULT_LOG;
const KNOWN = new Set(['@agent', '@agent-mcp', 'none', 'wordpress']);
globalThis.fetch = async (url, options = {}) => {
  const u = new URL(url);
  if (u.origin !== 'https://agent-default.invalid') throw new Error('Unexpected destination');
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : undefined;
  const query = Object.fromEntries(u.searchParams);
  appendFileSync(LOG, JSON.stringify({ method, path: u.pathname, query, body }) + '\n');
  const reply = (status, payload) => new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
  const app = method === 'POST' ? body?.app : query.app;
  if ((u.pathname === '/v1/orders' || u.pathname === '/v1/products/vps/quote') && app !== undefined && !KNOWN.has(String(app))) {
    return reply(400, { success: false, error: { code: 'INVALID_REQUEST', message: `Unknown app '${app}'. Use '@agent' (agent only), '@agent-mcp', 'none' (bare VPS), or an app name from GET /platform/apps.` } });
  }
  if (u.pathname === '/v1/orders') return reply(202, { success: true, data: { order_id: 1, invoice_id: 2, status: 'Pending', app: body.app ?? null } });
  if (u.pathname === '/v1/products/vps/quote') return reply(200, { success: true, data: { ...SAMPLES['impreza_vps_offer:quote'], app: query.app ?? null } });
  if (u.pathname === '/v1/products/vps') return reply(200, { success: true, data: SAMPLES['impreza_vps_offer:offer'] });
  if (u.pathname === '/v1/entitlements') return reply(200, { success: true, data: { known: true, hidden: [] } });
  return reply(404, { success: false, error: { code: 'NOT_FOUND', message: 'fixture' } });
};
