let count = 0;
globalThis.fetch = async (url, options) => {
 const parsed = new URL(url);
 if (parsed.hostname !== 'onion-auth.invalid') throw new Error('Unexpected network destination');
 if (options.method === 'GET' && parsed.pathname === '/v1/entitlements') return new Response(JSON.stringify({success: true, data: {known: true, hidden: []}}), {status: 200});
 count++;
 const body = options.body ? JSON.parse(options.body) : undefined;
 const data = {request_count: count, path: parsed.pathname, method: options.method, body};
 // Mirror the frozen contract: POST .../onion/clients answers {name, pubkey}
 // and adds private_key ONLY when generate:true.
 if (options.method === 'POST' && parsed.pathname.endsWith('/onion/clients')) {
  data.name = body.name;
  data.pubkey = body.generate === true ? 'generated-x25519-pub' : body.pubkey;
  if (body.generate === true) data.private_key = 'generated-x25519-private-key';
 }
 if (options.method === 'GET' && parsed.pathname.endsWith('/onion/clients')) {
  data.restricted = true;
  data.clients = [{name: 'alice', created_at: '2026-09-21T00:00:00Z'}];
 }
 return new Response(JSON.stringify({success: true, data}), {status: 200, headers: {'content-type': 'application/json'}});
};
