import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp = loggedClient('rollback-test'); const client = mcp.client;
try {
 await mcp.connect();
 const tools = await client.listTools();
 const tool=tools.tools.find(t=>t.name==='impreza_prepare_project');
 assert(tool);assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.annotations.destructiveHint,false);
 assert.equal(tool.inputSchema.properties.package_json.maxLength,32768);
 const input={package_json:'{"scripts":{"start":"node server.js"}}',dockerfile:'FROM node\nEXPOSE 3000',dockerfile_path:'docker/Dockerfile'};
 const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError);
 assert.deepEqual(result.structuredContent,sample('impreza_prepare_project:node_and_dockerfile'));
 const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom/prepare');assert.deepEqual(data.body,input);assert.equal(mcp.count(),1);
 console.log('PASS: actual preparation stdio tool, read-only annotations, schema bounds and exact API body.');
} finally { await mcp.close(); }
