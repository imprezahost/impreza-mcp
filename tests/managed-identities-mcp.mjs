// Real stdio/listTools/callTool -> controlled fetch.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const raw=Buffer.concat([Buffer.from([0,0,0,11]),Buffer.from('ssh-ed25519'),Buffer.from([0,0,0,32]),Buffer.alloc(32,7)]);
const key='ssh-ed25519 '+raw.toString('base64'),fp=createHash('sha256').update(raw).digest('hex');let schema;
for(const gate of ['on','off']){
 const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/managed-identities-fetch.mjs',import.meta.url).href,process.env.IDENTITIES_SERVER||fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IDENTITIES_GATE:gate,IMPREZA_BASE_URL:'https://host-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-real'}});
 const c=new Client({name:'identity-fixture',version:'1'});
 try{await c.connect(t);const tool=(await c.listTools()).tools.find(t=>t.name==='impreza_prepare_host_plan');assert.ok(tool);const current=JSON.stringify({input:tool.inputSchema,output:tool.outputSchema});if(schema)assert.equal(current,schema);schema=current;
  const call=args=>c.callTool({name:'impreza_prepare_host_plan',arguments:args});let n=0;
  for(const action of ['create','remove','add-key','revoke-key','sudo-read','sudo-none']){
   const args={service_id:799,operation:'identity.ops.'+action,ttl_seconds:300,...(action==='add-key'?{public_key:key,fingerprint:fp}:action==='revoke-key'?{fingerprint:fp}:{})};
   assert.ok(tool.inputSchema.properties.operation.enum.includes(args.operation));const r=await call(args);if(gate==='off'){assert.equal(r.isError,true);continue}
   assert.ok(!r.isError,JSON.stringify(r));assert.equal(r.structuredContent.operation,args.operation);assert.equal(r.structuredContent.preview.unit,'impreza-ops');assert.equal(r.structuredContent.preview.uid,65001);assert.ok(r.structuredContent.preview.before&&r.structuredContent.preview.after,'projection must retain identity before/after');assert.equal(JSON.parse(r.structuredContent.note).count,++n);
  }
  if(gate==='on'){
   for(const bad of [{public_key:'-----BEGIN OPENSSH PRIVATE KEY-----'},{public_key:'password=SECRET'},{public_key:'command=sh '+key},{public_key:'ssh-ed25519-cert-v01@openssh.com '+raw.toString('base64')},{user:'root'},{uid:0},{group:'sudo'},{sudo:'ALL=(ALL) ALL'},{path:'/var/lib/teleport'},{password:'SECRET'},{public_key:key,fingerprint:'f'.repeat(64)}]){
    try{const r=await call({service_id:799,operation:'identity.ops.add-key',public_key:key,...bad});assert.equal(r.isError,true);}catch(e){assert.match(String(e),/Invalid|schema|parameter/i)}
   }
   const r=await call({service_id:799,operation:'identity.ops.sudo-none'});assert.equal(JSON.parse(r.structuredContent.note).count,7,'invalid input reached API');
  }
 }finally{await c.close()}
}
console.log('PASS typed identity input + schema/projection ON/OFF');
