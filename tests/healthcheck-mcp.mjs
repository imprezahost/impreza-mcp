import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/preparation-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'healthcheck-test',version:'1.0.0'});
try{
 await client.connect(transport);
 const tool=(await client.listTools()).tools.find(t=>t.name==='impreza_deploy_custom');
 assert.equal(tool.inputSchema.properties.healthcheck_path.maxLength,200);
 const base={name:'api-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/api.git',build_strategy:'node_npm'};
 let count=0;
 async function accepted(input){const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError,JSON.stringify(result));const data=JSON.parse(result.content[0].text);assert.deepEqual(data.body,input);assert.equal(data.request_count,++count);}
 await accepted(base);
 for(const path of ['/','/api/ready','/_health','/api/ready/','/v1.2/health~live','/'+'a'.repeat(199)])await accepted({...base,healthcheck_path:path});
 for(const path of [null,[],false,42,'','health','//example.com','/../ready','/api/../ready','/./ready','/api//ready','/health?key=x','/health#x','/%2e%2e/','https://example.com/','/health\\ready','/health;id','/health\'','/health"','/health$(id)','/health\n','/café','/'+'a'.repeat(200)]){
  const result=await client.callTool({name:tool.name,arguments:{...base,healthcheck_path:path}});assert.equal(result.isError,true,'Invalid path '+JSON.stringify(path));
 }
 for(const strategy of ['dockerfile','node_npm_static']){const result=await client.callTool({name:tool.name,arguments:{...base,build_strategy:strategy,healthcheck_path:'/ready'}});assert.equal(result.isError,true);}
 await accepted({...base,healthcheck_path:'/ready',public_build_vars:{PUBLIC_X:'literal'},project_dir:'services/api'});
 console.log('PASS: MCP sends exact explicit and omitted health paths; invalid types, paths and strategies make no deploy requests.');
}finally{await client.close();}
