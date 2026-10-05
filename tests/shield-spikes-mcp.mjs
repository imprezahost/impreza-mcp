import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/shield-v2-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://shield-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-a-real-credential'}});
const client=new Client({name:'shield-spikes-proof',version:'1.0.0'});let forwarded=0,cases=0;
const dep='dpl_'+'a'.repeat(16);
try {
 await client.connect(transport);const tool=(await client.listTools()).tools.find(t=>t.name==='impreza_set_alert_rule');
 assert(tool);for(const metric of ['shield_blocked','shield_rate_limited'])assert(tool.inputSchema.properties.metric.enum.includes(metric));
 for(const metric of ['shield_blocked','shield_rate_limited']) {
  for(const threshold of [1,2,999999,1000000])for(const duration_minutes of [undefined,5]) {
   const args={deployment_id:dep,metric,threshold,...(duration_minutes===undefined?{}:{duration_minutes})};
   const result=await client.callTool({name:tool.name,arguments:args});assert(!result.isError,JSON.stringify(result));
   const data=JSON.parse(result.content[0].text);assert.equal(data.request_count,++forwarded);assert.equal(data.method,'POST');
   assert.equal(data.path,'/v1/platform/deployments/custom/'+dep+'/alert-rules');const {deployment_id,...body}=args;assert.deepEqual(data.body,body);cases++;
  }
  for(const threshold of [0,1000001,1.5,'1',null,false]) {
   const result=await client.callTool({name:tool.name,arguments:{deployment_id:dep,metric,threshold,duration_minutes:5}});assert.equal(result.isError,true);cases++;
  }
  for(const duration_minutes of [0,4,6,61,5.5,'5',null,false]) {
   const result=await client.callTool({name:tool.name,arguments:{deployment_id:dep,metric,threshold:1,duration_minutes}});assert.equal(result.isError,true);cases++;
  }
 }
 const last=await client.callTool({name:tool.name,arguments:{deployment_id:dep,metric:'shield_blocked',threshold:1,duration_minutes:5}});assert(!last.isError);assert.equal(JSON.parse(last.content[0].text).request_count,++forwarded);cases++;
 console.log(JSON.stringify({status:'passed',cases,forwarded,invalid_never_reached_HTTP:true}));
}finally{await client.close();}
