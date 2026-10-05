import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('rollback-test');const client=mcp.client;
try {
 await mcp.connect();
 const tools = await client.listTools();
 const tool = tools.tools.find(t => t.name === 'impreza_rollback_deployment');
 assert(tool); assert.equal(tool.annotations.destructiveHint, true);
 assert(tool.inputSchema.required.includes('confirm'));
 for (const confirm of [undefined, false, 'true']) {
  const result = await client.callTool({name: tool.name, arguments: {deployment_id: 'dpl_test', target_version: 'rel_test', ...(confirm === undefined ? {} : {confirm})}});
  assert.equal(result.isError, true);
 }
 const invalid = await client.callTool({name: tool.name, arguments: {deployment_id: 'dpl_test', target_version: '../escape', confirm: true}});
 assert.equal(invalid.isError, true);
 const result = await client.callTool({name: tool.name, arguments: {deployment_id: 'dpl_test', target_version: 'rel_test', confirm: true}});
 assert(!result.isError);
 assert.deepEqual(result.structuredContent, sample('impreza_rollback_deployment:queued_after_confirmation'));
 const data = mcp.last();
 assert.equal(mcp.count(), 1); assert.equal(data.path, '/v1/platform/deployments/dpl_test/rollback');
 assert.equal(data.method, 'POST'); assert.deepEqual(data.body, {target_version: 'rel_test', confirm: true});
 console.log('PASS: real MCP stdio schema, destructive hint, confirmation gates and exact POST dispatch.');
} finally { await mcp.close(); }
