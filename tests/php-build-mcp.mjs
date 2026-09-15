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
 assert(tool.inputSchema.properties.build_strategy.enum.includes('php_composer'));
 assert.equal(tool.inputSchema.properties.php_document_root.maxLength,120);
 const base={name:'php-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'php_composer'};
 let count=0;
 async function accepted(input){const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError,JSON.stringify(result));const data=JSON.parse(result.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);}
 await accepted(base);
 await accepted({...base,project_dir:'services/api',php_document_root:'web',healthcheck_path:'/api/ready',require_healthy_start:true,startup_timeout_seconds:60});
 const invalid=[{php_document_root:null},{php_document_root:[]},{php_document_root:'.'},{php_document_root:'../web'},{php_document_root:'web/vendor'},{php_document_root:'a'.repeat(121)},{target_port:80},{target_port:8080.5},{start_command:'php -S 0.0.0.0:8080'},{public_build_vars:{}},{static_spa:false},{mode:'image',image:'nginx:alpine'},{build_strategy:'node_npm',php_document_root:'web'},{require_healthy_start:true}];
 for(const options of invalid){const result=await client.callTool({name:tool.name,arguments:{...base,...options}});assert.equal(result.isError,true,JSON.stringify(options));}
 await accepted({...base,target_port:8080});
 const prep=tools.find(t=>t.name==='impreza_prepare_project');assert.equal(prep.inputSchema.properties.composer_json.maxLength,32768);
 const input={composer_json:'{"require":{"psr/log":"3.0.2"}}',php_document_root:'site/public'};
 const r=await client.callTool({name:prep.name,arguments:input});assert(!r.isError,JSON.stringify(r));const data=JSON.parse(r.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);
 console.log('PASS: PHP MCP schema, exact deploy/analysis requests and incompatible inputs rejected before HTTP.');
}finally{await client.close();}
