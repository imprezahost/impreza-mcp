import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('project-environments-test');const client=mcp.client;
try {
 await mcp.connect();const tools=(await client.listTools()).tools;
 const project_id='prj_'+'a'.repeat(24),environment_id='env_'+'b'.repeat(24);
 for(const [name,args,method,path,body] of [
  ['impreza_list_projects',{},'GET','/v1/platform/projects',null],
  ['impreza_list_projects',{project_id},'GET','/v1/platform/projects/'+project_id,null],
  ['impreza_create_project',{name:'store'},'POST','/v1/platform/projects',{name:'store'}],
  ['impreza_create_environment',{project_id,name:'staging'},'POST','/v1/platform/projects/'+project_id+'/environments',{name:'staging'}],
  ['impreza_attach_environment_service',{environment_id,deployment_id:'dpl_app',component:'web',role:'web'},'POST','/v1/platform/environments/'+environment_id+'/services',{deployment_id:'dpl_app',component:'web',role:'web'}],
  ['impreza_detach_environment_service',{environment_id,deployment_id:'dpl_app',confirm:true},'POST','/v1/platform/environments/'+environment_id+'/services/detach',{deployment_id:'dpl_app',confirm:true}],
  ['impreza_list_environment_deploys',{environment_id},'GET','/v1/platform/environments/'+environment_id+'/deploys',null],
 ]) {
  assert(tools.find(t=>t.name===name));const r=await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r));const d=mcp.last();assert.equal(d.path,path);assert.equal(d.method,method);assert.deepEqual(d.body,body);
  const key=name==='impreza_list_projects'?(args.project_id?'impreza_list_projects:one_project_with_environments':'impreza_list_projects:list'):name==='impreza_list_environment_deploys'?'impreza_list_environment_deploys:staging_batches':null;
  if(key)assert.deepEqual(r.structuredContent,sample(key));
 }
 const before=mcp.count();
 for(const args of [{environment_id,deployment_id:'dpl_app',confirm:false},{environment_id:'../other',deployment_id:'dpl_app',confirm:true}])assert((await client.callTool({name:'impreza_detach_environment_service',arguments:args})).isError);
 assert((await client.callTool({name:'impreza_list_environment_deploys',arguments:{environment_id:'../other'}})).isError);
 assert((await client.callTool({name:'impreza_list_environment_deploys',arguments:{environment_id,extra:true}})).isError);
 assert.equal(mcp.count(),before,'refused calls must make no HTTP request');
 console.log('PASS: project/environment MCP transport and explicit detach confirmation.');
} finally {await mcp.close();}
