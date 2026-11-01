// Real local MCP entry against a controlled fetch. UNITS_SERVER overrides the built server.
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
let schema;
for(const gate of ['on','off']){
 const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/managed-units-fetch.mjs',import.meta.url).href,process.env.UNITS_SERVER||fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,UNITS_GATE:gate,IMPREZA_BASE_URL:'https://host-fixture.invalid',IMPREZA_ORIGIN_AUTHORIZED:'https://host-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-real'}});
 const c=new Client({name:'unit-test',version:'1'});
 try{
  await c.connect(t);const tool=(await c.listTools()).tools.find(t=>t.name==='impreza_prepare_host_plan');assert.ok(tool);
  const current=JSON.stringify({input:tool.inputSchema,output:tool.outputSchema});
  if(schema)assert.equal(current,schema,'gate must not change schema');schema=current;
  const call=args=>c.callTool({name:'impreza_prepare_host_plan',arguments:args});
  let n=0;
  for(const action of ['status','start','stop','restart','reload']){
   const args={service_id:799,operation:'unit.redis.'+action,ttl_seconds:300};
   assert.ok(tool.inputSchema.properties.operation.enum.includes(args.operation));
   const r=await call(args);
   if(gate==='off'){assert.equal(r.isError,true);continue}
   assert.ok(!r.isError,JSON.stringify(r));assert.equal(r.structuredContent.operation,args.operation);
   assert.equal(r.structuredContent.preview.unit,'redis-server.service');
   assert.equal(r.structuredContent.preview.compensation,'new_independently_approved_plan_after_reconciliation');
   const trace=JSON.parse(r.structuredContent.note);assert.equal(trace.count,++n);assert.deepEqual(trace.body,args);
  }
  if(gate==='on'){
   for(const bad of [{unit:'sshd.service'},{command:'SECRET'},{args:['--all']},{template_id:3},{ttl_minutes:15},{ttl_seconds:301},{operation:'unit.redis.restart --all'},{operation:'unit.ssh.restart'}]){
    try{const r=await call({service_id:799,operation:'unit.redis.restart',...bad});assert.equal(r.isError,true);}catch(e){assert.match(String(e),/Invalid|schema|parameter/i)}
   }
   const r=await call({service_id:799,operation:'unit.redis.status'});assert.equal(JSON.parse(r.structuredContent.note).count,6,'invalid input never reached transport');
  }
 }finally{await c.close()}
}
console.log('PASS real local MCP entry, fixed fetch, gate/schema and negative input');
