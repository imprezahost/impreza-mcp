import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/preparation-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://rollback.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'rollback-test', version: '1.0.0'});
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const tool=tools.tools.find(t=>t.name==='impreza_deploy_custom');
 assert(tool);assert.equal(tool.annotations.readOnlyHint,false);
 assert(tool.inputSchema.properties.build_strategy.enum.includes('node_npm'));
 const input={name:'node-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'node_npm',target_port:3000};
 const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError);
 const data=JSON.parse(result.content[0].text);assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom');assert.deepEqual(data.body,input);assert.equal(data.request_count,1);
 const invalid=await client.callTool({name:tool.name,arguments:{...input,mode:'image',image:'busybox:1.37'}});assert.equal(invalid.isError,true);
 assert(tool.inputSchema.properties.node_package_manager);
 for(const pin of ['pnpm@10.26.1','pnpm@11.0.0','pnpm@12.4.2','yarn@4.9.2']) {
  const pinned=await client.callTool({name:tool.name,arguments:{...input,node_package_manager:pin}});
  assert(!pinned.isError);assert.equal(JSON.parse(pinned.content[0].text).body.node_package_manager,pin);
 }
 for(const fields of [{node_package_manager:'pnpm@latest'},{node_package_manager:'yarn@1.22.22'},{node_package_manager:'yarn@4.9.2',npm_workspace:'app'},{node_package_manager:'pnpm@10.26.1',build_strategy:'dockerfile'}]) {
  assert.equal((await client.callTool({name:tool.name,arguments:{...input,...fields}})).isError,true);
 }
 console.log('PASS: actual custom-deploy stdio tool accepts Node strategy and sends exact API body.');
} finally { await client.close(); }
