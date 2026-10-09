import assert from 'node:assert/strict';
import { loggedClient, sample } from './fixtures/request-log.mjs';

// impreza_vps_resize_recommendation through the local server. It is a
// read: one GET of the recommendation, answered with the real controller
// sample (the tool declares an outputSchema, which the SDK client validates),
// never a resize or an order. A malformed service_id is refused before any
// request.
const mcp = loggedClient('vps-resize-recommendation-test', { host: 'vps-recommendation.invalid' });
const client = mcp.client;
const call = async (name, args) => {
  const out = await client.callTool({ name, arguments: args });
  return { error: !!out.isError, text: out.content[0].text, structured: out.structuredContent };
};
try {
  await mcp.connect();
  const tools = Object.fromEntries((await client.listTools()).tools.map((t) => [t.name, t]));
  const tool = tools.impreza_vps_resize_recommendation;
  assert(tool, 'impreza_vps_resize_recommendation is listed');
  assert.equal(tool.annotations?.readOnlyHint, true, 'the recommendation is a read');
  assert.notEqual(tool.annotations?.destructiveHint, true, 'it is not destructive');
  assert.deepEqual(tool.inputSchema.required, ['service_id']);
  assert.deepEqual(Object.keys(tool.inputSchema.properties), ['service_id'], 'it takes nothing but the service');
  assert(tool.outputSchema, 'it declares an outputSchema');

  const r = await call('impreza_vps_resize_recommendation', { service_id: '9611' });
  assert(!r.error, r.text);
  assert.deepEqual(r.structured, sample('impreza_vps_resize_recommendation:recommended'));
  assert.equal(r.structured.status, 'recommended');
  assert.equal(mcp.count(), 1, 'one request');
  assert.equal(mcp.last().method, 'GET');
  assert.equal(mcp.last().path, '/v1/services/9611/resize/recommendation');
  assert.deepEqual(mcp.last().query, {});

  const before = mcp.count();
  for (const bad of [{}, { service_id: '' }, { service_id: '96/../11' }, { service_id: 'abc' }]) {
    const refused = await call('impreza_vps_resize_recommendation', bad);
    assert(refused.error && /service_id is required/.test(refused.text), JSON.stringify(bad));
  }
  assert.equal(mcp.count(), before, 'refused calls made no request');

  console.log('PASS: resize recommendation is a single read of the owner-checked endpoint, schema-validated, malformed ids refused before any request.');
} finally {
  await mcp.close();
}
