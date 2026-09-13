import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/preparation-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://rollback.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'rollback-test', version: '1.0.0'});
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const tool=tools.tools.find(t=>t.name==='impreza_prepare_project');
 assert(tool);assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.annotations.destructiveHint,false);
 assert.equal(tool.inputSchema.properties.package_json.maxLength,32768);
 const input={package_json:'{"scripts":{"start":"node server.js"}}',dockerfile:'FROM node\nEXPOSE 3000',dockerfile_path:'docker/Dockerfile'};
 const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError);
 const data=JSON.parse(result.content[0].text);assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom/prepare');assert.deepEqual(data.body,input);assert.equal(data.request_count,1);
 console.log('PASS: actual preparation stdio tool, read-only annotations, schema bounds and exact API body.');
} finally { await client.close(); }
