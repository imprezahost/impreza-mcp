import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/image-promotions-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'project-environments-test',version:'1.0.0'});
try {
 await client.connect(transport);const tools=(await client.listTools()).tools;
 const project_id='prj_'+'a'.repeat(24),environment_id='env_'+'b'.repeat(24);
 for(const [name,args,method,path,body] of [
  ['impreza_list_projects',{},'GET','/v1/platform/projects',null],
  ['impreza_list_projects',{project_id},'GET','/v1/platform/projects/'+project_id,null],
  ['impreza_create_project',{name:'store'},'POST','/v1/platform/projects',{name:'store'}],
  ['impreza_create_environment',{project_id,name:'staging'},'POST','/v1/platform/projects/'+project_id+'/environments',{name:'staging'}],
  ['impreza_attach_environment_service',{environment_id,deployment_id:'dpl_app',component:'web',role:'web'},'POST','/v1/platform/environments/'+environment_id+'/services',{deployment_id:'dpl_app',component:'web',role:'web'}],
  ['impreza_detach_environment_service',{environment_id,deployment_id:'dpl_app',confirm:true},'POST','/v1/platform/environments/'+environment_id+'/services/detach',{deployment_id:'dpl_app',confirm:true}],
 ]) {
  assert(tools.find(t=>t.name===name));const r=await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r));const d=JSON.parse(r.content[0].text);assert.equal(d.path,path);assert.equal(d.method,method);assert.deepEqual(d.body,body);
 }
 for(const args of [{environment_id,deployment_id:'dpl_app',confirm:false},{environment_id:'../other',deployment_id:'dpl_app',confirm:true}])assert((await client.callTool({name:'impreza_detach_environment_service',arguments:args})).isError);
 console.log('PASS: project/environment MCP transport and explicit detach confirmation.');
} finally {await client.close();}
