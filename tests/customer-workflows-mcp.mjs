import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/cycle-workflows-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'customer-workflows-test',version:'1.0.0'});
const deployment_id='dpl_'+'a'.repeat(16), backup_id='bkp_'+'b'.repeat(16),config_plan_id='cplan_'+'c'.repeat(24),restore_plan_id='rspl_'+'d'.repeat(24),review_digest='e'.repeat(64);
const cases=[
 ['impreza_export_app_config',{deployment_id},'GET',`/v1/platform/deployments/custom/${deployment_id}/config`,null,{}],
 ['impreza_prepare_config_apply',{deployment_id,document:'{"schema":"impreza.app.v1"}'},'POST',`/v1/platform/deployments/custom/${deployment_id}/prepare-config-apply`,{document:'{"schema":"impreza.app.v1"}'},{}],
 ['impreza_get_config_plan',{config_plan_id},'GET',`/v1/platform/config-plans/${config_plan_id}`,null,{}],
 ['impreza_apply_config_plan',{config_plan_id,review_digest,confirm:true},'POST',`/v1/platform/config-plans/${config_plan_id}/apply`,{review_digest,confirm:true},{}],
 ['impreza_app_metrics',{deployment_id,minutes:60},'GET',`/v1/platform/deployments/custom/${deployment_id}/metrics`,null,{minutes:'60'}],
 ['impreza_list_alerts',{deployment_id},'GET',`/v1/platform/deployments/custom/${deployment_id}/alerts`,null,{}],
 ['impreza_set_alert_rule',{deployment_id,metric:'down',threshold:1,duration_minutes:3,enabled:true},'POST',`/v1/platform/deployments/custom/${deployment_id}/alert-rules`,{metric:'down',threshold:1,duration_minutes:3,enabled:true},{}],
 ['impreza_prepare_database_restore',{backup_id},'POST',`/v1/backups/${backup_id}/prepare-database-restore`,{},{}],
 ['impreza_get_database_restore',{restore_plan_id},'GET',`/v1/database-restores/${restore_plan_id}`,null,{}],
 ['impreza_apply_database_restore',{restore_plan_id,review_digest,confirm:true},'POST',`/v1/database-restores/${restore_plan_id}/apply`,{review_digest,confirm:true},{}],
 ['impreza_download_backup',{backup_id},'POST',`/v1/backups/${backup_id}/download-link`,{},{}]
];
try {
 await client.connect(transport);const tools=(await client.listTools()).tools;let count=0;
 for(const [name,args,method,path,body,query] of cases){
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);
  const result=await client.callTool({name,arguments:args});assert(!result.isError,JSON.stringify(result));
  const data=JSON.parse(result.content[0].text);assert.equal(data.method,method);assert.equal(data.path,path);assert.deepEqual(data.body,body);assert.deepEqual(data.query,query);count=data.request_count;
  for(const bad of [{...args,unexpected:'never-send'},{...args,[Object.keys(args)[0]]:'../foreign'},{...args,[Object.keys(args)[0]]:args[Object.keys(args)[0]]+'\n'}]) assert((await client.callTool({name,arguments:bad})).isError,name);
 }
 for(const name of ['impreza_apply_config_plan','impreza_apply_database_restore']) {
  const good=cases.find(c=>c[0]===name)[1];
  for(const bad of [{...good,confirm:false},{...good,confirm:'true'},{...good,review_digest:'invalid'}]) assert((await client.callTool({name,arguments:bad})).isError);
 }
 for(const args of [{deployment_id,minutes:0},{deployment_id,minutes:1441},{deployment_id,minutes:2.5}]) assert((await client.callTool({name:'impreza_app_metrics',arguments:args})).isError);
 for(const args of [{deployment_id,metric:'down',threshold:2},{deployment_id,metric:'memory_pct',threshold:101},{deployment_id,metric:'unknown',threshold:1},{deployment_id,metric:'down',threshold:1,rule_id:'../x'}]) assert((await client.callTool({name:'impreza_set_alert_rule',arguments:args})).isError);
 const probe=await client.callTool({name:'impreza_export_app_config',arguments:{deployment_id}});assert.equal(JSON.parse(probe.content[0].text).request_count,count+1,'invalid inputs must not send HTTP');
 console.log('PASS: 11 workflows with exact request paths, bodies, query, strict inputs and explicit confirmation.');
}finally{await client.close();}
