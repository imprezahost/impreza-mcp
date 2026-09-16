import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/preparation-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'compose-source-test',version:'1.0.0'});
try {
 await client.connect(transport);
 const tools=(await client.listTools()).tools;
 assert.equal(tools.find(t=>t.name==='impreza_prepare_compose').inputSchema.properties.context_id.pattern,'^ctx_[a-f0-9]{1,36}$');
 const source={compose_yaml:'services: {web: {build: .}}',web_service:'web',target_port:80,context_id:'ctx_abc123'};
 const prepared=await client.callTool({name:'impreza_prepare_compose',arguments:source});
 assert(!prepared.isError,JSON.stringify(prepared));assert.deepEqual(JSON.parse(prepared.content[0].text).body,source);
 const body={...source,name:'compose-fixture',agent_id:'agt_fixture',mode:'compose',compose_review_id:'a'.repeat(64)};
 const deployed=await client.callTool({name:'impreza_deploy_custom',arguments:body});
 assert(!deployed.isError,JSON.stringify(deployed));
 const sent=JSON.parse(deployed.content[0].text).body;
 assert.equal(sent.context_id,source.context_id);assert.equal(sent.compose_yaml,source.compose_yaml);
 for(const context_id of ['../source','ctx_other',123]) {
  const result=await client.callTool({name:'impreza_deploy_custom',arguments:{...body,context_id}});
  assert.equal(result.isError,true,'invalid source context accepted');
 }
 console.log('PASS: Compose source schema and exact forwarding through MCP stdio; malformed context rejected.');
} finally {await client.close();}
