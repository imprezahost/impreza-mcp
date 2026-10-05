import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/agent-pause-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://pause-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-a-real-credential'}});
const c=new Client({name:'agent-pause-proof',version:'1.0.0'});let cases=0,count=0;
const agent='agt_'+'a'.repeat(16);
try {
 await c.connect(t);const tools=(await c.listTools()).tools;
 for(const action of ['pause','resume']){
  const name='impreza_'+action+'_agent',tool=tools.find(x=>x.name===name);assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);assert.deepEqual(tool.inputSchema.required,['agent_id','confirm']);assert.equal(tool.annotations.readOnlyHint,false);
  const invalid=[{agent_id:agent},... [false,'true',1,null].map(confirm=>({agent_id:agent,confirm})),{agent_id:agent,confirm:true,unknown:'hostile'},... ['',agent+'\n','agt_'+'a'.repeat(15),'../'+agent,'agt_'+'A'.repeat(16),agent+' '].map(agent_id=>({agent_id,confirm:true}))];
  for(const args of invalid){const answer=await c.callTool({name,arguments:args});assert.equal(answer.isError,true);cases++;}
  const answer=await c.callTool({name,arguments:{agent_id:agent,confirm:true}});assert(!answer.isError,JSON.stringify(answer));const result=JSON.parse(answer.content[0].text);assert.equal(result.agent_id,agent);assert.equal(result.paused,action==='pause');assert.equal(result.request_count,++count);cases++;
 }
 console.log(JSON.stringify({status:'passed',cases,forwarded:count,invalid_never_reached_HTTP:true}));
}finally{await c.close();}
