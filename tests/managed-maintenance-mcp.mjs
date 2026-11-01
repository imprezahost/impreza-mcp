import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/managed-maintenance-fetch.mjs',import.meta.url).href,process.env.MAINTENANCE_SERVER||fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://host-fixture.invalid',IMPREZA_ORIGIN_AUTHORIZED:'https://host-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-real'}});
const c=new Client({name:'maintenance-test',version:'1'});const plan='hpl_'+'a'.repeat(32),digest='a'.repeat(64),approval='apr_'+'a'.repeat(32);let checks=0;
try{await c.connect(t);const tool=(await c.listTools()).tools.find(t=>t.name==='impreza_prepare_host_plan');assert.ok(tool.inputSchema.properties.operation.enum.includes('managed_service.reload'));checks++;
 const call=(name,args)=>c.callTool({name:'impreza_'+name,arguments:args});
 let n=0;for(const [name,args]of [['prepare_host_plan',{service_id:799,operation:'managed_service.reload',ttl_seconds:300}],['apply_host_plan',{plan_id:plan,plan_digest:digest,approval_id:approval}],['get_host_plan',{plan_id:plan}]]){const r=await call(name,args);assert.ok(!r.isError,JSON.stringify(r));assert.equal(r.structuredContent.operation,'managed_service.reload');assert.equal(r.structuredContent.preview.restart_fallback,false);const trace=JSON.parse(r.structuredContent.note);assert.equal(trace.count,++n);if(name==='prepare_host_plan')assert.deepEqual(trace.body,args);checks++;}
 for(const bad of [{template_id:3},{ttl_minutes:15},{ttl_seconds:301},{ttl_seconds:true},{unit:'ssh.service'},{command:'SECRET'}]){try{const r=await call('prepare_host_plan',{service_id:799,operation:'managed_service.reload',...bad});assert.equal(r.isError,true);}catch(e){assert.match(String(e),/Invalid|schema|parameter/i)}checks++;}
 const r=await call('get_host_plan',{plan_id:plan});assert.equal(JSON.parse(r.structuredContent.note).count,4);checks++;console.log(`PASS local MCP real stdio -> dispatch -> controlled fetch + output schema: ${checks} checks`);
}finally{await c.close()}
