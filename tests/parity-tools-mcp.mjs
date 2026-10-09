// The tools that brought the local package to parity with the hosted MCP:
// transport contract per tool, the request-free refusals, and the log-tail flow.
import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('parity-tools-test');const client=mcp.client;
const prj='prj_'+'a'.repeat(24),env='env_'+'b'.repeat(24),edb='edb_'+'c'.repeat(24),cpro='cpro_'+'d'.repeat(24),agt='agt_'+'e'.repeat(16),digest='a'.repeat(64);
const BROUGHT=[
 ['impreza_get_variable_group',{project_id:prj},'GET','/v1/platform/projects/'+prj+'/vars',null],
 ['impreza_get_variable_group',{project_id:prj,environment_id:env},'GET','/v1/platform/environments/'+env+'/vars',null],
 ['impreza_set_variable_group',{project_id:prj,vars:{MODE:'safe'},secrets:{API_TOKEN:'__IMPREZA_KEEP__'},base_revision:3},'PUT','/v1/platform/projects/'+prj+'/vars',{vars:{MODE:'safe'},secrets:{API_TOKEN:'__IMPREZA_KEEP__'},base_revision:3}],
 ['impreza_set_variable_group',{project_id:prj,environment_id:env,vars:{MODE:'safe'}},'PUT','/v1/platform/environments/'+env+'/vars',{vars:{MODE:'safe'}}],
 ['impreza_rename_project',{project_id:prj,name:'shop'},'POST','/v1/platform/projects/'+prj+'/rename',{name:'shop'}],
 ['impreza_delete_project',{project_id:prj,confirm:'shop'},'POST','/v1/platform/projects/'+prj+'/delete',{confirm:'shop'}],
 ['impreza_rename_environment',{environment_id:env,name:'staging'},'POST','/v1/platform/environments/'+env+'/rename',{name:'staging'}],
 ['impreza_delete_environment',{environment_id:env,confirm:'staging'},'POST','/v1/platform/environments/'+env+'/delete',{confirm:'staging'}],
 ['impreza_deploy_environment',{environment_id:env},'POST','/v1/platform/environments/'+env+'/deploy',{}],
 ['impreza_deploy_environment',{environment_id:env,require_healthy_start:false},'POST','/v1/platform/environments/'+env+'/deploy',{require_healthy_start:false}],
 ['impreza_get_environment_deploy',{batch_id:edb},'GET','/v1/platform/environment-deploys/'+edb,null],
 ['impreza_prepare_config_promotion',{target_environment_id:env,source_environment_id:'env_'+'f'.repeat(24)},'POST','/v1/platform/environments/'+env+'/config-promotions',{source_environment_id:'env_'+'f'.repeat(24)}],
 ['impreza_get_config_promotion',{promotion_id:cpro},'GET','/v1/platform/config-promotions/'+cpro,null],
 ['impreza_apply_config_promotion',{promotion_id:cpro,review_digest:digest,confirm:true},'POST','/v1/platform/config-promotions/'+cpro+'/apply',{review_digest:digest,confirm:true}],
 ['impreza_get_update_policy',{agent_id:agt},'GET','/v1/platform/servers/'+agt+'/update-policy',null],
 ['impreza_set_update_policy',{agent_id:agt,update_channel:'stable'},'PUT','/v1/platform/servers/'+agt+'/update-policy',{update_channel:'stable'}],
 ['impreza_set_update_policy',{agent_id:agt,update_channel:'pinned',pinned_version:'0.6.24',maintenance_window_utc:{start:'02:00',end:'04:00'}},'PUT','/v1/platform/servers/'+agt+'/update-policy',{update_channel:'pinned',pinned_version:'0.6.24',maintenance_window_utc:{start:'02:00',end:'04:00'}}],
 ['impreza_request_agent_update',{agent_id:agt,confirm:true},'POST','/v1/platform/servers/'+agt+'/agent-update',{confirm:true}],
 ['impreza_set_shield',{deployment_id:'dpl_app',shield_profile:'standard'},'POST','/v1/platform/deployments/dpl_app/shield',{shield_profile:'standard'}],
 ['impreza_set_shield',{deployment_id:'dpl_app',shield_profile:'max',shield_mode:'enforce',confirm_enforce:true},'POST','/v1/platform/deployments/dpl_app/shield',{shield_profile:'max',shield_mode:'enforce',confirm_enforce:true}],
];
// the read tools with an outputSchema answer the real controller shape (validated by the SDK client)
const SAMPLE={
 ['/v1/platform/projects/'+prj+'/vars']:'impreza_get_variable_group:project_group',
 ['/v1/platform/environments/'+env+'/vars']:'impreza_get_variable_group:environment_group',
 ['/v1/platform/environment-deploys/'+edb]:'impreza_get_environment_deploy:running',
 ['/v1/platform/config-promotions/'+cpro]:'impreza_get_config_promotion:pending',
 ['/v1/platform/servers/'+agt+'/update-policy']:'impreza_get_update_policy:stable_never_reported',
};
try {
 await mcp.connect();const tools=(await client.listTools()).tools;
 for(const [name,args,method,path,body] of BROUGHT) {
  assert(tools.find(t=>t.name===name),'missing tool '+name);
  const r=await client.callTool({name,arguments:args});assert(!r.isError,name+': '+JSON.stringify(r));
  const d=mcp.last();assert.equal(d.path,path,name+' path');assert.equal(d.method,method,name+' method');assert.deepEqual(d.body,body,name+' body');
  if(method==='GET'&&SAMPLE[path])assert.deepEqual(r.structuredContent,sample(SAMPLE[path]),name+' structured answer');
 }
 // the local-only upload stays (set parity with the hosted connector is the private checker's)
 assert(tools.find(t=>t.name==='impreza_upload_context'),'local-only upload tool missing');
 // the log tail: wait=0 returns right after creating; a wait polls and aggregates
 let r=await client.callTool({name:'impreza_tail_logs',arguments:{deployment_id:'dpl_app',lines:50,wait_seconds:0}});assert(!r.isError);
 let d=JSON.parse(r.content[0].text);assert.equal(d.request_id,'log_aaaa00000000000000000001');assert.equal(d.chunks_read,0);assert.equal(d.final,false);
 r=await client.callTool({name:'impreza_tail_logs',arguments:{deployment_id:'dpl_app',wait_seconds:5}});assert(!r.isError);
 d=JSON.parse(r.content[0].text);assert.equal(d.logs,'hello world');assert.equal(d.final,true);assert.equal(d.chunks_read,2);assert.equal(d.next_offset,2);
 // negative validations
 for(const [name,args] of [
  ['impreza_set_variable_group',{project_id:'../other'}],
  ['impreza_set_variable_group',{project_id:prj,extra:1}],
  ['impreza_delete_project',{project_id:prj,confirm:''}],
  ['impreza_apply_config_promotion',{promotion_id:cpro,review_digest:digest,confirm:false}],
  ['impreza_set_shield',{deployment_id:'dpl_app',shield_profile:'max',shield_mode:'enforce'}],
  ['impreza_set_update_policy',{agent_id:agt,update_channel:'pinned'}],
  ['impreza_get_environment_deploy',{batch_id:'not-a-batch'}],
  ['impreza_prepare_config_promotion',{target_environment_id:env,source_environment_id:env}],
  ['impreza_request_agent_update',{agent_id:agt,confirm:false}],
  ['impreza_request_agent_update',{agent_id:agt}],
  ['impreza_get_variable_group',{project_id:prj,vars:{MODE:'x'}}],
  ['impreza_delete_environment',{environment_id:'env_bad',confirm:'staging'}],
  ['impreza_set_shield',{deployment_id:'dpl_app',shield_profile:'standard',surprise:1}],
 ]) assert((await client.callTool({name,arguments:args})).isError,name+' accepted '+JSON.stringify(args));
 // The patterns themselves, each refused before any request.
 const before=mcp.count();
 for(const [name,args] of [
  ['impreza_rename_project',{project_id:prj,name:'Shop'}],
  ['impreza_rename_project',{project_id:prj,name:'shop/../x'}],
  ['impreza_rename_project',{project_id:prj,name:'-shop'}],
  ['impreza_rename_project',{project_id:prj,name:'s'+'x'.repeat(48)}],
  ['impreza_rename_project',{project_id:prj,name:'shop\n'}],
  ['impreza_request_agent_update',{agent_id:'e'.repeat(16),confirm:true}],
  ['impreza_request_agent_update',{agent_id:'agt_'+'E'.repeat(16),confirm:true}],
  ['impreza_request_agent_update',{agent_id:'agt_'+'e'.repeat(15),confirm:true}],
  ['impreza_request_agent_update',{agent_id:'agt_'+'e'.repeat(16)+'/x',confirm:true}],
  ['impreza_apply_config_promotion',{promotion_id:cpro,review_digest:'A'.repeat(64),confirm:true}],
  ['impreza_apply_config_promotion',{promotion_id:cpro,review_digest:'a'.repeat(63),confirm:true}],
  ['impreza_apply_config_promotion',{promotion_id:cpro,review_digest:'a'.repeat(64)+'\n',confirm:true}],
  ['impreza_apply_config_promotion',{promotion_id:cpro,review_digest:'g'.repeat(64),confirm:true}],
 ]) assert((await client.callTool({name,arguments:args})).isError,'pattern: '+name+' accepted '+JSON.stringify(args));
 assert.equal(mcp.count(),before,'a refused pattern made a request');
 // a refused confirm never leaves the process
 let g=await client.callTool({name:'impreza_get_update_policy',arguments:{agent_id:agt}});assert(!g.isError,JSON.stringify(g));const c0=mcp.count();
 await client.callTool({name:'impreza_request_agent_update',arguments:{agent_id:agt,confirm:false}});
 await client.callTool({name:'impreza_apply_config_promotion',arguments:{promotion_id:cpro,review_digest:digest,confirm:false}});
 g=await client.callTool({name:'impreza_get_update_policy',arguments:{agent_id:agt}});assert(!g.isError,JSON.stringify(g));const c1=mcp.count();
 assert.equal(c1,c0+1,'a refused confirm still made a request');
 console.log('PASS: parity tools transport, log-tail flow, and negative validations.');
} finally {await mcp.close();}
