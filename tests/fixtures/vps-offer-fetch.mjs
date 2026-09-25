// Records every API request the server makes and echoes it back, so the
// contract can assert which endpoint each tool call reached and with what.
let count = 0;
globalThis.fetch = async (url, options = {}) => {
  const parsed = new URL(url);
  if (parsed.hostname !== 'vps-offer.invalid') throw new Error('Unexpected destination');
  let data;
  if ((options.method || 'GET') === 'GET' && parsed.pathname === '/v1/entitlements') {
    data = { known: true, hidden: [] };
  } else {
    count++;
    data = {
      request_count: count,
      method: options.method || 'GET',
      path: parsed.pathname,
      query: Object.fromEntries(parsed.searchParams),
      body: options.body ? JSON.parse(options.body) : null,
    };
  }
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'content-type': 'application/json' } });
};
