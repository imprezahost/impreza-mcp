let count = 0;
let blobBurned = false;
globalThis.fetch = async (url, options) => {
 const parsed = new URL(url);
 if (parsed.hostname !== 'onion-custody.invalid') throw new Error('Unexpected network destination');
 if (options.method === 'GET' && parsed.pathname === '/v1/entitlements') return new Response(JSON.stringify({success: true, data: {known: true, hidden: []}}), {status: 200});
 count++;
 const body = options.body ? JSON.parse(options.body) : undefined;
 // Read-once semantics of GET .../onion/export/{commandId}: first read
 // returns the sealed blob and burns it, the second is a 404.
 if (options.method === 'GET' && /\/onion\/export\/cmd_/.test(parsed.pathname)) {
  if (parsed.pathname !== '/v1/platform/deployments/dpl_test/onion/export/cmd_export1') throw new Error('Unexpected export fetch route: ' + parsed.pathname);
  if (blobBurned) {
   return new Response(JSON.stringify({success: false, error: {code: 'NOT_FOUND', message: 'The sealed blob was already retrieved (read-once).'}}), {status: 404, headers: {'content-type': 'application/json'}});
  }
  blobBurned = true;
  return new Response(JSON.stringify({success: true, data: {command_id: 'cmd_export1', onion: 'a'.repeat(56) + '.onion', sealed: 'SEALED-BLOB-B64', note: 'Shown once — this read removed the blob from the platform.'}}), {status: 200, headers: {'content-type': 'application/json'}});
 }
 return new Response(JSON.stringify({success: true, data: {request_count: count, path: parsed.pathname, method: options.method, body}}), {status: 200, headers: {'content-type': 'application/json'}});
};
