import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('additional-recipes-test');const client=mcp.client;
try{
 await mcp.connect();const tools=(await client.listTools()).tools;let count=0;
 const common={name:'recipe',agent_id:'agt_fixture',mode:'dockerfile',target_port:8080};
 for(const build_strategy of ['static_files','go_build']){
  assert(tools.find(t=>t.name==='impreza_deploy_custom').inputSchema.properties.build_strategy.enum.includes(build_strategy));
  for(const source of [{git_url:'https://github.com/example/app.git'},{context_id:'ctx_'+'a'.repeat(24)}]){
   const input={...common,...source,build_strategy,project_dir:'site',require_healthy_start:true,...(build_strategy==='go_build'?{go_package:'cmd/server'}:{static_spa:true})};
   const result=await client.callTool({name:'impreza_deploy_custom',arguments:input});assert(!result.isError,JSON.stringify(result));const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom');assert.deepEqual(data.body,input);count=mcp.count();
  }
 }
 for(const extra of [{build_strategy:'static_files',healthcheck_path:'/x'},{build_strategy:'static_files',static_output_dir:'dist'},{build_strategy:'go_build',go_package:'../secret'},{build_strategy:'go_build',go_package:'cmd/server\n'},{build_strategy:'go_build',static_spa:true},{build_strategy:'go_build',start_command:'sh'},{build_strategy:'static_files',build_secrets:{TOKEN:'x'}}])assert((await client.callTool({name:'impreza_deploy_custom',arguments:{...common,git_url:'https://github.com/example/app.git',...extra}})).isError);
 const input={go_mod:'module example.com/app\n\ngo 1.25\n',go_sum:'',index_html:'<!doctype html><title>Example</title>'};
 const result=await client.callTool({name:'impreza_prepare_project',arguments:input});assert(!result.isError,JSON.stringify(result));assert.deepEqual(result.structuredContent,sample('impreza_prepare_project:node_and_dockerfile'));const data=mcp.last();assert.equal(data.path,'/v1/platform/deployments/custom/prepare');assert.deepEqual(data.body,input);assert.equal(mcp.count(),count+1);
 console.log('PASS: static_files and go_build schema, Git/context forwarding, built-in health and invalid combinations.');
}finally{await mcp.close();}
