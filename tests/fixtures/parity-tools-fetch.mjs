// Fetch stub for the parity suite: path/method/body echo plus the two
// shapes the log-tail flow needs (a created request and a final read page).
let count = 0;
globalThis.fetch = async (url, options) => {
  const parsed = new URL(url);
  if (parsed.hostname !== 'rollback.invalid') throw new Error('Unexpected network destination');
  if (options.method === 'GET' && parsed.pathname === '/v1/entitlements') return new Response(JSON.stringify({ success: true, data: { known: true, hidden: [] } }), { status: 200 });
  count++;
  const path = parsed.pathname, method = options.method;
  let data = { request_count: count, path, method, body: options.body ? JSON.parse(options.body) : null };
  if (method === 'POST' && path.endsWith('/logs/requests')) data = { request_id: 'log_aaaa00000000000000000001', reused: false, ...data };
  if (method === 'GET' && path.includes('/logs/requests/')) data = { status: 'complete', final: true, next_offset: 2, chunks: [{ id: 1, chunk: 'hello ', final: false }, { id: 2, chunk: 'world', final: true }], ...data };
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'content-type': 'application/json' } });
};
