import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/project-plans-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'prepared-deployment-test',version:'1.0.0'});
try {
 await client.connect(transport);const {tools}=await client.listTools();
 const plan='plan_'+'a'.repeat(24),execution='pdep_'+'b'.repeat(24),digest='c'.repeat(64);
 const runtime={option_index:0,name:'reviewed-app',agent_id:'agt_example',vars:{TOKEN:'fixture-value'},cpus:1,memory_mb:512,target_port:8000,onion:false};
 for(const [name,args,method,path,body] of [
 ['impreza_prepare_project_deployment',{plan_id:plan,...runtime},'POST','/v1/platform/deployments/custom/plans/'+plan+'/prepare-deployment',runtime],
 ['impreza_list_prepared_deployments',{},'GET','/v1/platform/deployments/custom/prepared',undefined],
 ['impreza_list_prepared_deployments',{execution_id:execution},'GET','/v1/platform/deployments/custom/prepared/'+execution,undefined],
 ['impreza_apply_project_deployment',{execution_id:execution,configuration_digest:digest},'POST','/v1/platform/deployments/custom/prepared/'+execution+'/apply',{configuration_digest:digest}]
 ]) {
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.annotations.readOnlyHint,method==='GET');if(method==='POST')assert.equal(tool.annotations.idempotentHint,name==='impreza_apply_project_deployment');
  const result=await client.callTool({name,arguments:args});assert(!result.isError,JSON.stringify(result));const out=JSON.parse(result.content[0].text);assert.equal(out.path,path);assert.equal(out.method,method);if(body)assert.deepEqual(out.body,body);
 }
 for(const name of ['impreza_list_prepared_deployments','impreza_apply_project_deployment'])assert((await client.callTool({name,arguments:{execution_id:'../bad',configuration_digest:digest}})).isError);
 const schema=tools.find(t=>t.name==='impreza_apply_project_deployment').inputSchema;assert.equal(schema.additionalProperties,false);assert.deepEqual(Object.keys(schema.properties),['execution_id','configuration_digest']);
 console.log('PASS: preparation/list/apply stdio contracts, exact frozen confirmation body, scopes annotations and malformed IDs.');
} finally {await client.close();}
