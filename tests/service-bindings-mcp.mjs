import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/image-promotions-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'binding-review-test',version:'1.0.0'});
try {
 await client.connect(transport);const tools=(await client.listTools()).tools;
 const deployment_id='dpl_'+'a'.repeat(16),provider_deployment_id='dpl_'+'b'.repeat(16),binding_plan_id='bplan_'+'c'.repeat(24),review_digest='d'.repeat(64),binding_id='bnd_'+'e'.repeat(24);
 for(const [name,args,method,path,body] of [
  ['impreza_prepare_service_binding',{deployment_id,provider_deployment_id},'POST','/v1/platform/deployments/custom/'+deployment_id+'/prepare-binding',{provider_deployment_id}],
  ['impreza_prepare_service_binding_removal',{deployment_id,binding_id},'POST','/v1/platform/deployments/custom/'+deployment_id+'/prepare-binding-removal',{binding_id}],
  ['impreza_get_service_binding_plan',{binding_plan_id},'GET','/v1/platform/binding-plans/'+binding_plan_id,null],
  ['impreza_apply_service_binding_plan',{binding_plan_id,review_digest,confirm:true},'POST','/v1/platform/binding-plans/'+binding_plan_id+'/apply',{review_digest,confirm:true}],
 ]) {
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);
  const r=await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r));const data=JSON.parse(r.content[0].text);assert.equal(data.method,method);assert.equal(data.path,path);assert.deepEqual(data.body,body);
 }
 for(const args of [{binding_plan_id,review_digest,confirm:false},{binding_plan_id,review_digest:'bad',confirm:true},{binding_plan_id:'../other',review_digest,confirm:true}]) {
  assert((await client.callTool({name:'impreza_apply_service_binding_plan',arguments:args})).isError);
 }
 for(const args of [{deployment_id,binding_id:'../other'},{deployment_id:'../other',binding_id},{deployment_id,binding_id,password:'must-not-be-forwarded'}]) assert((await client.callTool({name:'impreza_prepare_service_binding_removal',arguments:args})).isError);
 const final=await client.callTool({name:'impreza_get_service_binding_plan',arguments:{binding_plan_id}});assert.equal(JSON.parse(final.content[0].text).request_count,5,'invalid confirmation/identity must not call upstream');
 console.log('PASS: binding review tools preserve exact routes/digests and refuse invalid confirmation without upstream calls.');
} finally {await client.close();}
