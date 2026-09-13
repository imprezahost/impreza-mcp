import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/rollback-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://rollback.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'rollback-test', version: '1.0.0'});
try {
 await client.connect(transport);
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
 const data = JSON.parse(result.content[0].text);
 assert.equal(data.request_count, 1); assert.equal(data.path, '/v1/platform/deployments/dpl_test/rollback');
 assert.equal(data.method, 'POST'); assert.deepEqual(data.body, {target_version: 'rel_test', confirm: true});
 console.log('PASS: real MCP stdio schema, destructive hint, confirmation gates and exact POST dispatch.');
} finally { await client.close(); }
