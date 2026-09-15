import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/preparation-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'startup-health-test',version:'1.0.0'});
try{
 await client.connect(transport);
 const tools=(await client.listTools()).tools;
 const tool=tools.find(t=>t.name==='impreza_deploy_custom');
 assert(tool.inputSchema.properties.build_strategy.enum.includes('python_pip'));
 assert.equal(tool.inputSchema.properties.start_command.maxLength,1000);
 const base={name:'python-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'python_pip',start_command:'exec gunicorn --bind 0.0.0.0:$PORT app:app'};
 let count=0;
 async function accepted(input){const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError,JSON.stringify(result));const data=JSON.parse(result.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);}
 await accepted(base);
 await accepted({...base,project_dir:'services/api',healthcheck_path:'/ready',require_healthy_start:true,startup_timeout_seconds:60});
 const invalid=[{start_command:undefined},{start_command:''},{start_command:[]},{start_command:'python app.py\nRUN id'},{start_command:'a'.repeat(1001)},{public_build_vars:{}},{static_spa:false},{mode:'image',image:'nginx:alpine'},{build_strategy:'node_npm'},{require_healthy_start:true}];
 for(const options of invalid){const result=await client.callTool({name:tool.name,arguments:{...base,...options}});assert.equal(result.isError,true,JSON.stringify(options));}
 await accepted({...base,target_port:8000});
 const prep=tools.find(t=>t.name==='impreza_prepare_project');assert.equal(prep.inputSchema.properties.requirements_txt.maxLength,32768);
 const input={requirements_txt:'Flask==3.1.2',start_command:base.start_command};
 const r=await client.callTool({name:prep.name,arguments:input});assert(!r.isError,JSON.stringify(r));const data=JSON.parse(r.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);
 console.log('PASS: Python MCP schema, exact deploy/analysis requests and incompatible inputs rejected before HTTP.');
}finally{await client.close();}
