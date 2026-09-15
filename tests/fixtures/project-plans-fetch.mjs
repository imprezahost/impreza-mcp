let count = 0;
globalThis.fetch = async (url, options) => {
 const parsed = new URL(url);
 if (parsed.hostname !== 'rollback.invalid') throw new Error('Unexpected network destination');
 if (options.method === 'GET' && parsed.pathname === '/v1/entitlements') return new Response(JSON.stringify({success: true, data: {known: true, hidden: []}}), {status: 200});
 count++;
 return new Response(JSON.stringify({success: true, data: {request_count: count, path: parsed.pathname, method: options.method, body: options.body === undefined ? undefined : JSON.parse(options.body)}}), {status: 200, headers: {'content-type': 'application/json'}});
};
