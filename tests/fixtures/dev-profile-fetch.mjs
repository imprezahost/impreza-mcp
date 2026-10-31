// Fake transport for the DEV profile (no network). Every request is logged BEFORE any check, so a refusal
// that still reached fetch would show up; only the DEV origin is answered. DEV_FIXTURE_LOG (test-only) receives one
// line per request so a process that exits early can be proven to have sent nothing.
import { appendFileSync } from 'node:fs';

const seen = [];
const AGENT = 'agt_' + 'a'.repeat(16);
const OTHER = 'agt_' + 'b'.repeat(16);
const mode = process.env.DEV_FIXTURE_MODE || 'normal';
// Shapes complete enough for the declared output schemas (the client validates structuredContent).
const server = (agent, service, hostname) => ({ agent_id: agent, hostname, origin: 'dev', service_id: service, status: 'online',
  version: '0.6.33', update_policy: {}, agent_update: {}, last_seen_at: null, registered_at: null, tor: null, capacity: null });
const deployment = (id, agent, name) => ({ id, runtime: {}, last_operation: null, agent_id: agent, status: 'running', domain: null,
  onion: null, onion_profile: 'none', onion_exported_at: null, vars: {}, created_at: '2026-10-18T00:00:00Z', last_health_at: null,
  last_error: null, ...(name ? { name } : {}) });

globalThis.fetch = async (url, options = {}) => {
  const u = new URL(url);
  seen.push((options.method || 'GET') + ' ' + u.pathname + u.search);
  if (process.env.DEV_FIXTURE_LOG) appendFileSync(process.env.DEV_FIXTURE_LOG, seen[seen.length - 1] + '\n');
  if (u.origin !== 'https://dev.example.test') throw new Error('Unexpected destination');
  let data;
  switch (u.pathname) {
    case '/v1/vps/proxmox/4242/status':
      data = { service_id: mode === 'foreign' ? 732 : 4242, status: 'running', requests: [...seen] };
      break;
    case '/v1/api-catalog':
      data = { operations: [{ method: 'GET', path: '/vps/proxmox/{id}', summary: 'VPS details' }] };
      break;
    case '/v1/vps/proxmox/4242':
      data = { service_id: 4242, hostname: 'dev-4242' };
      break;
    case '/v1/vps/proxmox/4242/events':
      // Activity: the operations ledger — fixed kinds + UTC instants,
      // no service_id field (ownership is in the path the gate checked).
      data = { events: [{ kind: 'power.reboot', accepted_at: '2026-10-29T01:20:00Z' }], note: 'accepted requests' };
      break;
    case '/v1/platform/servers':
      // Round 2: the profile must never ask for this (served only so a regression would be visible, not fatal).
      data = { servers: [server(AGENT, 4242, 'dev'), server(OTHER, 732, 'OTHER_TARGET')], total: 2 };
      break;
    case '/v1/platform/deployments':
      // The API confines this to the bound agent server-side; 'foreign' models that confinement failing.
      data = { deployments: [deployment('dpl_' + '1'.repeat(16), AGENT)].concat(mode === 'foreign'
        ? [deployment('dpl_' + '2'.repeat(16), OTHER, 'OTHER_TARGET')] : []), total: mode === 'foreign' ? 2 : 1 };
      break;
    case '/v1/platform/deployments/custom':
      data = { deployments: [deployment('dpl_' + '3'.repeat(16), OTHER, 'OTHER_TARGET')], total: 1 };
      break;
    default:
      data = { unexpected: true };
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'content-type': 'application/json' } });
};
