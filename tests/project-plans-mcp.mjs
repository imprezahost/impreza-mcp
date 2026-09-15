import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/project-plans-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'project-plan-test',version:'1.0.0'});
try {
 await client.connect(transport);const {tools}=await client.listTools();
 const plan='plan_'+'a'.repeat(24);
 for(const [name,body,method,path,expected] of [
 ['impreza_plan_project',{context_id:'ctx_aa',project_dir:'apps/api',start_command:'python app.py'},'POST','/v1/platform/deployments/custom/plans',{context_id:'ctx_aa',project_dir:'apps/api',start_command:'python app.py'}],
 ['impreza_list_project_plans',{},'GET','/v1/platform/deployments/custom/plans',undefined],
 ['impreza_list_project_plans',{plan_id:plan},'GET','/v1/platform/deployments/custom/plans/'+plan,undefined],
 ['impreza_deploy_project_plan',{plan_id:plan,option_index:0,name:'my-app',agent_id:'agt_example',vars:{SETTING:'value'},target_port:8000},'POST','/v1/platform/deployments/custom/plans/'+plan+'/deploy',{option_index:0,name:'my-app',agent_id:'agt_example',vars:{SETTING:'value'},target_port:8000}]
 ]) {
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.annotations.readOnlyHint,method==='GET');
  if(method==='POST')assert.equal(tool.annotations.idempotentHint,false);
  const result=await client.callTool({name,arguments:body});assert(!result.isError,JSON.stringify(result));const out=JSON.parse(result.content[0].text);assert.equal(out.path,path);assert.equal(out.method,method);if(expected)assert.deepEqual(out.body,expected);
 }
 for(const name of ['impreza_list_project_plans','impreza_deploy_project_plan'])assert((await client.callTool({name,arguments:{plan_id:'../invalid',option_index:0,name:'app',agent_id:'agt_example'}})).isError);
 const schema=tools.find(t=>t.name==='impreza_deploy_project_plan').inputSchema;assert.equal(schema.additionalProperties,false);assert(!schema.properties.context_id&&!schema.properties.start_command);assert.deepEqual(schema.required,['plan_id','option_index','name','agent_id']);
 console.log('PASS: project plan stdio schemas, annotations, exact paths/bodies and invalid plan IDs.');
} finally {await client.close();}
