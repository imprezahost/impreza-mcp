// Failover REST answers for tests/failover-gate-mcp.mjs, by mode:
//   FIXTURE_FAILOVER=off      every route answers the router's 404 for an
//                             unregistered endpoint (the failover_enabled gate
//                             off: the routes do not exist);
//   FIXTURE_FAILOVER=on       a deployment of another account answers the
//                             controller's 404; an apply answers 202 the first
//                             time and the same receipt marked replayed after.
// Every request is counted and kept, so the test asserts what was sent.
const requests = [];
globalThis.__failoverRequests = requests;
const accepted = new Map();
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}});
globalThis.fetch = async (url, options) => {
  const parsed = new URL(url);
  if (parsed.hostname !== 'rollback.invalid') throw new Error('Unexpected network destination');
  if (options.method === 'GET' && parsed.pathname === '/v1/entitlements') return json(200, {success: true, data: {known: true, hidden: []}});
  const body = options.body ? JSON.parse(options.body) : null;
  requests.push({method: options.method, path: parsed.pathname, body});
  process.stderr.write('FIXTURE_REQUEST ' + JSON.stringify({method: options.method, path: parsed.pathname, body}) + '\n');
  if (process.env.FIXTURE_FAILOVER !== 'on') {
    return json(404, {success: false, error: {code: 'NOT_FOUND', message: `Endpoint not found: ${options.method} ${parsed.pathname.replace(/^\/v1/, '')}`}});
  }
  if (parsed.pathname.includes('dpl_' + 'f'.repeat(16))) {
    return json(404, {success: false, error: {code: 'NOT_FOUND', message: 'Deployment not found.'}});
  }
  const apply = parsed.pathname.match(/^\/v1\/platform\/failover-cutovers\/(fov_[a-f0-9]+)\/apply$/);
  if (apply && options.method === 'POST') {
    const key = apply[1] + '|' + body.review_digest;
    const replay = accepted.has(key);
    accepted.set(key, true);
    return json(replay ? 200 : 202, {success: true, data: {cutover_id: apply[1], state: 'accepted', replay}});
  }
  return json(200, {success: true, data: {ok: true}});
};
