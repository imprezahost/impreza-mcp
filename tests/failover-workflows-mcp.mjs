import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/cycle-workflows-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_API_KEY:'fixture-key',IMPREZA_API_SECRET:'fixture-secret-for-failover',IMPREZA_BASE_URL:'https://rollback.invalid'}});
const client=new Client({name:'failover-surface-fixture',version:'1'});
const deployment_id='dpl_'+'a'.repeat(16),target_deployment_id='dpl_'+'b'.repeat(24),cutover_id='fov_'+'b'.repeat(24),review_digest='c'.repeat(64),backup_id='bkp_'+'d'.repeat(16),restore_id='bkp_'+'e'.repeat(16),deploy_command_id='cmd_'+'f'.repeat(16),failback_id='fbk_'+'a'.repeat(24),drill_id='fdr_'+'c'.repeat(24);
const base=`/v1/platform/deployments/custom/${deployment_id}`;
const cases=[
 ['impreza_declare_external_failover_country',{agent_id:'agt_'+'a'.repeat(16),country_code:'FR'},'POST','/v1/platform/agents/agt_'+'a'.repeat(16)+'/failover-jurisdiction',{country_code:'FR'},false,false,true],
 ['impreza_pair_failover_standby',{deployment_id,target_deployment_id,mode:'cold'},'POST',base+'/failover-standby',{target_deployment_id,mode:'cold'},false,false,false],
 ['impreza_get_failover_standby',{deployment_id},'GET',base+'/failover-standby',null,true,false,true],
 ['impreza_confirm_failover_sync',{deployment_id,backup_id,restore_id,deploy_command_id},'POST',base+'/failover-standby/confirm-sync',{backup_id,restore_id,deploy_command_id},false,false,true],
 ['impreza_prepare_failover',{deployment_id},'POST',base+'/prepare-failover',{},false,false,false],
 ['impreza_get_failover',{cutover_id},'GET',`/v1/platform/failover-cutovers/${cutover_id}`,null,true,false,true],
 ['impreza_apply_failover',{cutover_id,review_digest,confirm:true},'POST',`/v1/platform/failover-cutovers/${cutover_id}/apply`,{review_digest,confirm:true},false,true,true],
 ['impreza_retry_failover_activation',{cutover_id,review_digest,confirm:true},'POST',`/v1/platform/failover-cutovers/${cutover_id}/retry-activation`,{review_digest,confirm:true},false,true,false],
 ['impreza_prepare_failback',{cutover_id},'POST',`/v1/platform/failover-cutovers/${cutover_id}/prepare-failback`,{},false,false,false],
 ['impreza_get_failback',{failback_id},'GET',`/v1/platform/failover-failbacks/${failback_id}`,null,true,false,true],
 ['impreza_apply_failback',{failback_id,review_digest,confirm:true},'POST',`/v1/platform/failover-failbacks/${failback_id}/apply`,{review_digest,confirm:true},false,true,true],
 ['impreza_set_failover_drill_policy',{deployment_id,interval_minutes:60},'POST',base+'/failover-standby/drill-policy',{interval_minutes:60},false,true,true],
 ['impreza_run_failover_drill',{deployment_id},'POST',base+'/failover-standby/drills',{},false,true,false],
 ['impreza_get_failover_drill',{drill_id},'GET',`/v1/platform/failover-drills/${drill_id}`,null,true,false,true],
];
let requests=0;
try{
 await client.connect(transport);const tools=(await client.listTools()).tools;
 for(const [name,args,method,path,body,readOnly,destructive,idempotent] of cases){
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);
  assert.equal(tool.annotations.readOnlyHint,readOnly);assert.equal(tool.annotations.destructiveHint,destructive);assert.equal(tool.annotations.idempotentHint,readOnly?undefined:idempotent);
  const out=await client.callTool({name,arguments:args});assert(!out.isError,JSON.stringify(out));const data=JSON.parse(out.content[0].text);
  assert.equal(data.method,method);assert.equal(data.path,path);assert.deepEqual(data.body,body);assert.deepEqual(data.query,{});requests=data.request_count;
  assert((await client.callTool({name,arguments:{...args,extra:'never-send'}})).isError);
  for(const key of Object.keys(args).filter(k=>k.endsWith('_id'))){
   for(const bad of ['../foreign',args[key]+'\n','',null])assert((await client.callTool({name,arguments:{...args,[key]:bad}})).isError,name+' '+key);
  }
  if(args.country_code)for(const country_code of ['ZZ','fr','FRA','FR\n',null,[]])
   assert((await client.callTool({name,arguments:{...args,country_code}})).isError,'invalid ISO declaration');
 }
 for(const [name,id] of [['impreza_apply_failover',{cutover_id}],['impreza_retry_failover_activation',{cutover_id}],['impreza_apply_failback',{failback_id}]])
  for(const extra of [{confirm:false},{confirm:'true'},{confirm:null},{review_digest:'x'.repeat(64)},{review_digest:review_digest+'\n'}])
   assert((await client.callTool({name,arguments:{...id,review_digest,confirm:true,...extra}})).isError);
 // A cutover id never addresses a failback and a failback id never a cutover.
 for(const [name,args] of [['impreza_get_failback',{failback_id:cutover_id}],['impreza_apply_failback',{failback_id:cutover_id,review_digest,confirm:true}],['impreza_prepare_failback',{cutover_id:failback_id}]])
  assert((await client.callTool({name,arguments:args})).isError,name+' accepted the other identifier kind');
 for(const extra of [{mode:'warm'},{mode:'cold\n'},{target_deployment_id:deployment_id}])
  assert((await client.callTool({name:'impreza_pair_failover_standby',arguments:{deployment_id,target_deployment_id,mode:'cold',...extra}})).isError);
 for(const interval_minutes of [59,10081,'60',60.5,true,[]])
  assert((await client.callTool({name:'impreza_set_failover_drill_policy',arguments:{deployment_id,interval_minutes}})).isError,'drill interval '+JSON.stringify(interval_minutes));
 const off=await client.callTool({name:'impreza_set_failover_drill_policy',arguments:{deployment_id,interval_minutes:null}});
 assert(!off.isError);assert.deepEqual(JSON.parse(off.content[0].text).body,{interval_minutes:null});requests=JSON.parse(off.content[0].text).request_count;
 const probe=await client.callTool({name:'impreza_get_failover',arguments:{cutover_id}});
 assert.equal(JSON.parse(probe.content[0].text).request_count,requests+1,'invalid arguments must never send HTTP');
 console.log('PASS: '+cases.length+' failover tools through stdio; strict routes, identifiers, risk annotations and confirmation; rejected requests send no HTTP');
}finally{await client.close();}
