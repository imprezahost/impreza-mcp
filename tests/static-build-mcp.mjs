import assert from 'node:assert/strict';
import {loggedClient,gitDeployAnswer} from './fixtures/request-log.mjs';
const mcp=loggedClient('rollback-test');const client=mcp.client;
try {
 await mcp.connect();
 const tools = await client.listTools();
 const tool=tools.tools.find(t=>t.name==='impreza_deploy_custom');
 assert(tool);assert.equal(tool.annotations.readOnlyHint,false);
 assert(tool.inputSchema.properties.build_strategy.enum.includes('node_npm_static'));
 const input={name:'node-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'node_npm_static',target_port:3000};
 const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError);
 assert.deepEqual(result.structuredContent,gitDeployAnswer(input.git_url));
 const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom');assert.deepEqual(data.body,input);assert.equal(mcp.count(),1);
 const invalid=await client.callTool({name:tool.name,arguments:{...input,mode:'image',image:'busybox:1.37'}});assert.equal(invalid.isError,true);
 console.log('PASS: actual custom-deploy stdio tool accepts Node strategy and sends exact API body.');
} finally { await mcp.close(); }
