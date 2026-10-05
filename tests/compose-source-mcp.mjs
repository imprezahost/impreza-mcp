import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('compose-source-test');const client=mcp.client;
try {
 await mcp.connect();
 const tools=(await client.listTools()).tools;
 assert.equal(tools.find(t=>t.name==='impreza_prepare_compose').inputSchema.properties.context_id.pattern,'^ctx_[a-f0-9]{1,36}$');
 const source={compose_yaml:'services: {web: {build: .}}',web_service:'web',target_port:80,context_id:'ctx_abc123'};
 const prepared=await client.callTool({name:'impreza_prepare_compose',arguments:source});
 assert(!prepared.isError,JSON.stringify(prepared));assert.deepEqual(mcp.last().body,source);
 assert.deepEqual(prepared.structuredContent,sample('impreza_prepare_compose:ready'));
 const body={...source,name:'compose-fixture',agent_id:'agt_fixture',mode:'compose',compose_review_id:'a'.repeat(64)};
 const deployed=await client.callTool({name:'impreza_deploy_custom',arguments:body});
 assert(!deployed.isError,JSON.stringify(deployed));
 const sent=mcp.last().body;
 assert.equal(sent.context_id,source.context_id);assert.equal(sent.compose_yaml,source.compose_yaml);
 const before=mcp.count();
 for(const context_id of ['../source','ctx_other',123]) {
  const result=await client.callTool({name:'impreza_deploy_custom',arguments:{...body,context_id}});
  assert.equal(result.isError,true,'invalid source context accepted');
 }
 assert.equal(mcp.count(),before,'malformed context must make no HTTP request');
 console.log('PASS: Compose source schema and exact forwarding through MCP stdio; malformed context rejected.');
} finally {await mcp.close();}
