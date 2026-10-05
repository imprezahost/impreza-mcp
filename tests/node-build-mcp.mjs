import assert from 'node:assert/strict';
import {loggedClient,gitDeployAnswer} from './fixtures/request-log.mjs';
const mcp=loggedClient('rollback-test');const client=mcp.client;
try {
 await mcp.connect();
 const tools = await client.listTools();
 const tool=tools.tools.find(t=>t.name==='impreza_deploy_custom');
 assert(tool);assert.equal(tool.annotations.readOnlyHint,false);
 assert(tool.inputSchema.properties.build_strategy.enum.includes('node_npm'));
 const input={name:'node-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'node_npm',target_port:3000};
 const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError);
 assert.deepEqual(result.structuredContent,gitDeployAnswer(input.git_url));
 const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom');assert.deepEqual(data.body,input);assert.equal(mcp.count(),1);
 const invalid=await client.callTool({name:tool.name,arguments:{...input,mode:'image',image:'busybox:1.37'}});assert.equal(invalid.isError,true);
 assert(tool.inputSchema.properties.node_package_manager);
 for(const pin of ['pnpm@10.26.1','pnpm@11.0.0','pnpm@12.4.2','yarn@4.9.2']) {
  const pinned=await client.callTool({name:tool.name,arguments:{...input,node_package_manager:pin}});
  assert(!pinned.isError);assert.equal(mcp.last().body.node_package_manager,pin);
 }
 for(const fields of [{node_package_manager:'pnpm@latest'},{node_package_manager:'yarn@1.22.22'},{node_package_manager:'yarn@4.9.2',npm_workspace:'app'},{node_package_manager:'pnpm@10.26.1',build_strategy:'dockerfile'}]) {
  assert.equal((await client.callTool({name:tool.name,arguments:{...input,...fields}})).isError,true);
 }
 console.log('PASS: actual custom-deploy stdio tool accepts Node strategy and sends exact API body.');
} finally { await mcp.close(); }
