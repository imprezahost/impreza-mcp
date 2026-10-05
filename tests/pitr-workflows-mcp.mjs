import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('pitr-surface-fixture',{env:{IMPREZA_API_KEY:'fixture-key',IMPREZA_API_SECRET:'fixture-secret-for-pitr'}});const client=mcp.client;
const deployment_id='dpl_'+'a'.repeat(16),pitr_plan_id='ppl_'+'b'.repeat(24),review_digest='c'.repeat(64);
const cases=[
 ['impreza_get_pitr',{deployment_id},'GET',`/v1/platform/deployments/${deployment_id}/pitr`,null,true],
 ['impreza_configure_pitr',{deployment_id,enabled:true,drain_minutes:15,keep_bases:3},'POST',`/v1/platform/deployments/${deployment_id}/pitr`,{enabled:true,drain_minutes:15,keep_bases:3},false],
 ['impreza_drill_pitr',{deployment_id},'POST',`/v1/platform/deployments/${deployment_id}/pitr/drill`,{},false],
 ['impreza_prepare_pitr_restore',{deployment_id,target_time:'2026-09-24T12:00:00Z'},'POST',`/v1/platform/deployments/${deployment_id}/prepare-pitr-restore`,{target_time:'2026-09-24T12:00:00Z'},false],
 ['impreza_get_pitr_restore',{pitr_plan_id},'GET',`/v1/pitr-restores/${pitr_plan_id}`,null,true],
 ['impreza_apply_pitr_restore',{pitr_plan_id,review_digest,confirm:true},'POST',`/v1/pitr-restores/${pitr_plan_id}/apply`,{review_digest,confirm:true},false],
];
let requests=0;
try {
 await mcp.connect();const tools=(await client.listTools()).tools;
 for(const [name,args,method,path,body,readOnly] of cases){
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);assert.equal(tool.annotations.readOnlyHint,readOnly);
  const out=await client.callTool({name,arguments:args});assert(!out.isError,JSON.stringify(out));const data=mcp.last();
  if(name==='impreza_get_pitr_restore')assert.deepEqual(out.structuredContent,sample('impreza_get_pitr_restore:pending'));
  if(name==='impreza_prepare_pitr_restore')assert.deepEqual(out.structuredContent,sample('impreza_prepare_pitr_restore:fresh_review'));
  if(name==='impreza_apply_pitr_restore')assert.deepEqual(out.structuredContent,sample('impreza_apply_pitr_restore:replay_accepted_review'));
  assert.equal(data.method,method);assert.equal(data.path,path);assert.deepEqual(data.body,body);assert.deepEqual(data.query,{});requests=mcp.count();
  const key=Object.keys(args)[0];
  for(const bad of [{...args,extra:'never-send'},{...args,[key]:'../foreign'},{...args,[key]:args[key]+'\n'}]) assert((await client.callTool({name,arguments:bad})).isError,name);
 }
 for(const extra of [{confirm:false},{confirm:'true'},{confirm:null},{review_digest:'x'.repeat(64)},{review_digest:review_digest+'\n'}])
  assert((await client.callTool({name:'impreza_apply_pitr_restore',arguments:{pitr_plan_id,review_digest,confirm:true,...extra}})).isError);
 for(const extra of [{enabled:'true'},{drain_minutes:4},{drain_minutes:61},{drain_minutes:5.5},{keep_bases:0},{keep_bases:8}])
  assert((await client.callTool({name:'impreza_configure_pitr',arguments:{deployment_id,enabled:true,...extra}})).isError);
 for(const target_time of ['2026-02-30T12:00:00Z','2026-09-24 12:00:00','2026-09-24T12:00:00+00:00','2026-09-24T12:00:00Z\n'])
  assert((await client.callTool({name:'impreza_prepare_pitr_restore',arguments:{deployment_id,target_time}})).isError);
 const probe=await client.callTool({name:'impreza_get_pitr',arguments:{deployment_id}});assert(!probe.isError,JSON.stringify(probe));
 assert.equal(mcp.count(),requests+1,'rejected arguments must make no HTTP request');
 console.log('PASS: six PITR tools through stdio; strict schemas, annotations, routes, UTC validation and confirmation; invalid calls send no HTTP');
}finally{await mcp.close();}

