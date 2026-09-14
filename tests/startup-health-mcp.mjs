import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/preparation-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'startup-health-test',version:'1.0.0'});
try{
 await client.connect(transport);
 const tool=(await client.listTools()).tools.find(t=>t.name==='impreza_deploy_custom');
 assert.equal(tool.inputSchema.properties.require_healthy_start.type,'boolean');
 assert.equal(tool.inputSchema.properties.startup_timeout_seconds.minimum,30);assert.equal(tool.inputSchema.properties.startup_timeout_seconds.maximum,600);
 const base={name:'api-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/api.git',build_strategy:'node_npm',healthcheck_path:'/ready'};
 let count=0;
 async function accepted(input){const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError,JSON.stringify(result));const data=JSON.parse(result.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);}
 await accepted(base);await accepted({...base,require_healthy_start:false});await accepted({...base,require_healthy_start:true});
 for(const seconds of [30,60,120,600])await accepted({...base,require_healthy_start:true,startup_timeout_seconds:seconds});
 const invalid=[...[null,'true',1,[]].map(v=>({require_healthy_start:v})),...[null,'120',29,601,60.5,[]].map(v=>({require_healthy_start:true,startup_timeout_seconds:v})),{startup_timeout_seconds:120},{require_healthy_start:false,startup_timeout_seconds:120},{require_healthy_start:true,healthcheck_path:undefined},{require_healthy_start:true,build_strategy:'node_npm_static'},{require_healthy_start:false,build_strategy:'dockerfile'}];
 for(const options of invalid){const result=await client.callTool({name:tool.name,arguments:{...base,...options}});assert.equal(result.isError,true,JSON.stringify(options));}
 await accepted({...base,require_healthy_start:true,startup_timeout_seconds:90,public_build_vars:{PUBLIC_X:'literal'},project_dir:'services/api'});
 console.log('PASS: startup policy schema, exact forwarding and invalid inputs rejected without HTTP requests.');
}finally{await client.close();}
