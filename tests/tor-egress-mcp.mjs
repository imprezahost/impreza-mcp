import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/preparation-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'tor-egress-test',version:'1.0.0'});
try {
 await client.connect(transport);
 const tool=(await client.listTools()).tools.find(t=>t.name==='impreza_deploy_custom');
 assert.equal(tool.inputSchema.properties.tor_egress.type,'boolean');
 const base={name:'tor-fixture',agent_id:'agt_fixture',mode:'image',image:'nginx:stable'};let count=0;
 async function accepted(input){const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError,JSON.stringify(result));const data=JSON.parse(result.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);}
 await accepted(base);await accepted({...base,tor_egress:true});await accepted({...base,tor_egress:false});
 for(const value of ['true',1,null,{},[]]){const result=await client.callTool({name:tool.name,arguments:{...base,tor_egress:value}});assert.equal(result.isError,true);}
 for(const mode of ['manifest','compose']){const result=await client.callTool({name:tool.name,arguments:{...base,mode,tor_egress:true}});assert.equal(result.isError,true);}
 for(const value of [true,'true',1,null]){const result=await client.callTool({name:'impreza_deploy_catalog_app',arguments:{app_name:'nginx',agent_id:base.agent_id,tor_egress:value}});assert.equal(result.isError,true);}
 await accepted({...base,tor_egress:true});
 const prepared={plan_id:'plan_'+'a'.repeat(24),name:'tor-fixture',agent_id:'agt_fixture',tor_egress:true};
 const result=await client.callTool({name:'impreza_prepare_project_deployment',arguments:prepared});assert(!result.isError,JSON.stringify(result)); const data=JSON.parse(result.content[0].text);assert.equal(data.body.tor_egress,true);assert.equal(data.request_count,++count);
 console.log('PASS: Tor runtime opt-in survives stdio/custom/prepared transport; invalid types/modes make no deploy request.');
}finally{await client.close();}
