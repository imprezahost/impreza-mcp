import assert from 'node:assert/strict';
import {Client}from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport}from '@modelcontextprotocol/sdk/client/stdio.js';
import{fileURLToPath}from'node:url';
const deployment_id='dpl_'+'a'.repeat(16),challenge_id='fdc_'+'b'.repeat(24),base='/v1/platform/deployments/'+deployment_id+'/failover-domain';
const cases=[['impreza_challenge_failover_domain',{deployment_id},'POST',base+'/challenge',{},false],['impreza_verify_failover_domain',{deployment_id,challenge_id},'POST',base+'/verify',{challenge_id},false],['impreza_get_failover_domain',{deployment_id},'GET',base,null,true]];
let checks=0;
for(const gate of ['0','1']){
 const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/cycle-workflows-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_API_KEY:'fixture-key',IMPREZA_API_SECRET:'fixture-secret-for-customer-domain',IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_CUSTOMER_DOMAIN_FAILOVER:gate}});
 const c=new Client({name:'customer-domain-fixture',version:'1'});
 try{await c.connect(t);const tools=(await c.listTools()).tools;
 for(const[name,args,method,path,body,readOnly]of cases){
 const tool=tools.find(x=>x.name===name);
 if(gate==='0'){assert(!tool);assert((await c.callTool({name,arguments:args})).isError);checks+=2;continue;}
 assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);assert.equal(tool.annotations.readOnlyHint,readOnly);assert.equal(tool.annotations.destructiveHint,false);assert.equal(tool.annotations.idempotentHint,readOnly?undefined:false);assert(tool.title.length<=40);checks+=6;
 const r=await c.callTool({name,arguments:args});assert(!r.isError);const d=JSON.parse(r.content[0].text);assert.equal(d.method,method);assert.equal(d.path,path);assert.deepEqual(d.body,body);assert.deepEqual(d.query,{});checks+=5;
 for(const bad of [{...args,extra:'untrusted'}, {...args,deployment_id:'../foreign'}, {...args,deployment_id:deployment_id+'\n'}, {...args,deployment_id:null}]){assert((await c.callTool({name,arguments:bad})).isError);checks++;}
 if(args.challenge_id)for(const challenge_id of ['fdc_bad',args.challenge_id+'\n',null]){assert((await c.callTool({name,arguments:{...args,challenge_id}})).isError);checks++;}
 const probe=await c.callTool({name,arguments:args});assert.equal(JSON.parse(probe.content[0].text).request_count,d.request_count+1);checks++;
 }
 }finally{await c.close();}
}
console.log(JSON.stringify({status:'passed',checks,scope:'real compiled MCP stdio; transport echo fixture, no ownership or public DNS claim'}));
