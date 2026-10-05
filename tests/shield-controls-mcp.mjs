import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/shield-v2-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://shield-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-a-real-credential'}});
const client=new Client({name:'shield-controls-proof',version:'1.0.0'});let count=0,cases=0;
const dep='dpl_'+'a'.repeat(16),base={deployment_id:dep,shield_profile:'hardened',shield_mode:'audit',base_revision:0};
try {
 await client.connect(transport);const tools=(await client.listTools()).tools,set=tools.find(t=>t.name==='impreza_set_shield');
 assert.equal(set.inputSchema.properties.controls.additionalProperties,false);assert.equal(set.inputSchema.properties.controls.properties.pow_paths.maxItems,10);
 async function call(controls){return client.callTool({name:set.name,arguments:{...base,controls}});}
 const valid=[{},...['/','/api','/'+ 'a'.repeat(255)].map(v=>({pow_paths:[v]})),{pow_paths:Array.from({length:10},(_,i)=>'/p'+i)},...[30,31,5999,6000,null].map(v=>({rate_limit_rpm:v})),...[2,3,4,null].map(v=>({pow_difficulty:v})),{trusted_sources:['198.18.0.0/16','192.0.2.1/32','2001:db8::/48','2001:db8::1/128']},{trusted_sources:Array.from({length:10},(_,i)=>'192.0.2.'+i+'/32')},...[1,2,23,24].map(v=>({under_attack:{enabled:true,duration_hours:v}})),{under_attack:{enabled:false}}];
 for(const controls of valid){const r=await call(controls);assert(!r.isError,JSON.stringify(r));const data=JSON.parse(r.content[0].text);assert.deepEqual(data.body,{shield_profile:'hardened',shield_mode:'audit',base_revision:0,controls});assert.equal(data.request_count,++count);cases++;}
 const invalid=[...['','bad','/x\ny','/x"','/x}','/x#','/x y','/xＡ','/x\\y','/x`y','/'+ 'a'.repeat(256)].map(v=>({pow_paths:[v]})),{pow_paths:Array.from({length:11},(_,i)=>'/p'+i)},{pow_paths:['/dup','/dup']},...[29,6001,0,30.5,'30',false].map(v=>({rate_limit_rpm:v})),...[1,5,0,2.5,'2',false].map(v=>({pow_difficulty:v})),...['0.0.0.0/0','::/0','198.18.0.0/15','2001:db8::/47','192.0.2.1/24','2001:db8::1/48','::ffff:192.0.2.1/128','::ffff:c000:201/128','192.0.2.1/33','2001:db8::/129','invalid'].map(v=>({trusted_sources:[v]})),{trusted_sources:Array.from({length:11},(_,i)=>'192.0.2.'+i+'/32')},{trusted_sources:['2001:db8::/48','2001:0db8:0::/48']},...[0,25,1.5,'1',null].map(v=>({under_attack:{enabled:true,duration_hours:v}})),{under_attack:{enabled:false,duration_hours:1}},{under_attack:{enabled:'true',duration_hours:1}},{attack_expires_at:1},{raw_directive:'deny'}];
 for(const controls of invalid){const r=await call(controls);assert.equal(r.isError,true,'invalid controls accepted: '+JSON.stringify(controls));cases++;}
 const missing=await client.callTool({name:set.name,arguments:{deployment_id:dep,shield_profile:'hardened',controls:{}}});assert.equal(missing.isError,true);cases++;
 const r=await call({});assert(!r.isError);assert.equal(JSON.parse(r.content[0].text).request_count,++count);cases++;
 console.log(JSON.stringify({status:'passed',cases,forwarded:count,invalid_never_reached_HTTP:true}));
}finally{await client.close();}
