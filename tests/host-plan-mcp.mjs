import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/host-plan-fetch.mjs',import.meta.url).href,process.env.F46_BASE_SERVER||fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://host-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-real'}});
const c=new Client({name:'host-plan-test',version:'1.0.0'});let checks=0;
const plan='hpl_'+'a'.repeat(32),digest='a'.repeat(64),approval='apr_'+'a'.repeat(32);
try{
 await c.connect(t);const tools=(await c.listTools()).tools;
 for(const name of ['host_permissions','get_host_plan','prepare_host_plan','apply_host_plan']){
  const tool=tools.find(t=>t.name==='impreza_'+name);assert.ok(tool,'real local MCP must expose '+name);assert.ok(tool.outputSchema);assert.equal(tool.inputSchema.additionalProperties,false);checks++;
 }
 assert.ok(!tools.some(t=>/approve_host_plan|grant_host_permission/.test(t.name)));checks++;
 assert.equal(tools.find(t=>t.name==='impreza_apply_host_plan').annotations.destructiveHint,true);checks++;
 const call=(name,args)=>c.callTool({name:'impreza_'+name,arguments:args});
 const cases=[['host_permissions',{},'/v1/host/permissions','GET'],['prepare_host_plan',{service_id:799,operation:'vps.reinstall',template_id:3,ttl_minutes:15},'/v1/host/plans','POST'],['get_host_plan',{plan_id:plan},'/v1/host/plans/'+plan,'GET'],['apply_host_plan',{plan_id:plan,plan_digest:digest,approval_id:approval},'/v1/host/plans/'+plan+'/apply','POST']];
 let n=0;for(const [name,args,path,method]of cases){const r=await call(name,args);assert.ok(!r.isError,JSON.stringify(r));const trace=JSON.parse(r.structuredContent.note);assert.equal(trace.count,++n);assert.equal(trace.path,path);assert.equal(trace.method,method);if(method==='POST')assert.deepEqual(trace.body,args);checks++;}
 const bad=[['host_permissions',{approved:true}],['prepare_host_plan',{service_id:true,operation:'vps.reinstall',template_id:3}],['prepare_host_plan',{service_id:799,operation:'vps.reinstall',template_id:3,password:'canary-secret'}],['prepare_host_plan',{service_id:799,operation:'vps.reinstall',template_id:3,ttl_minutes:61}],['get_host_plan',{plan_id:'../../secret'}],['apply_host_plan',{plan_id:plan,plan_digest:'bad',approval_id:approval}],['apply_host_plan',{plan_id:plan,plan_digest:digest,approval_id:approval,approved:true}]];
 for(const [name,args]of bad){try{assert.equal((await call(name,args)).isError,true);}catch(e){assert.match(String(e),/Invalid|schema|parameter/i);}checks++;}
 const r=await call('host_permissions',{});assert.equal(JSON.parse(r.structuredContent.note).count,5);checks++;
 console.log('PASS local host-plan stdio: '+checks+' checks; invalid inputs never reach HTTP');
}finally{await c.close();}
