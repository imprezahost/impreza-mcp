let count = 0;
globalThis.fetch = async (url, options = {}) => {
  const u = new URL(String(url));
  if (u.origin !== 'https://autostart-fixture.invalid') throw new Error('unexpected destination');
  if (u.pathname === '/v1/vps/proxmox/553/status' && (!options.method || options.method === 'GET')) {
    return new Response(JSON.stringify({success: true, data: {power_state: 'stopped', auto_start: false}}), {status: 200});
  }
  if (u.pathname !== '/v1/vps/proxmox/553/auto-start' || options.method !== 'PUT') throw new Error('unexpected mutation');
  const body = JSON.parse(options.body);
  if (typeof body.auto_start !== 'boolean' || body.confirm !== true || Object.keys(body).length !== 2) throw new Error('invalid body reached HTTP');
  return new Response(JSON.stringify({success: true, data: {auto_start: body.auto_start, request_count: ++count}}), {status: 200});
};
