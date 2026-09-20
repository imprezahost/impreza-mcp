import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/cycle-workflows-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'cycle-workflows-test',version:'1.0.0'});
try {
 await client.connect(transport);const tools=(await client.listTools()).tools;
 const deployment_id='dpl_'+'a'.repeat(16),target_deployment_id='dpl_'+'b'.repeat(16),switch_id='tsw_'+'c'.repeat(24),review_digest='d'.repeat(64),environment_id='env_'+'a'.repeat(24),other_environment_id='env_'+'b'.repeat(24);
 let last=0;
 for(const [name,args,method,path,body,query] of [
  ['impreza_compare_environments',{environment_id,other_environment_id},'GET','/v1/platform/environments/'+environment_id+'/compare',null,{other:other_environment_id}],
  ['impreza_prepare_traffic_switch',{deployment_id,target_deployment_id},'POST','/v1/platform/deployments/custom/'+deployment_id+'/prepare-traffic-switch',{target_deployment_id},{}],
  ['impreza_get_traffic_switch',{switch_id},'GET','/v1/platform/traffic-switches/'+switch_id,null,{}],
  ['impreza_apply_traffic_switch',{switch_id,review_digest,confirm:true},'POST','/v1/platform/traffic-switches/'+switch_id+'/apply',{review_digest,confirm:true},{}],
  ['impreza_create_preview',{deployment_id,branch:'feature/example',protect:true},'POST','/v1/platform/deployments/custom/'+deployment_id+'/previews',{branch:'feature/example',protect:true},{}],
  ['impreza_create_preview',{deployment_id,branch:'feature/example'},'POST','/v1/platform/deployments/custom/'+deployment_id+'/previews',{branch:'feature/example'},{}],
 ]) {
  const tool=tools.find(t=>t.name===name);assert(tool);assert.equal(tool.inputSchema.additionalProperties,false);
  const r=await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r));const data=JSON.parse(r.content[0].text);assert.equal(data.method,method);assert.equal(data.path,path);assert.deepEqual(data.body,body);assert.deepEqual(data.query,query);last=data.request_count;
 }
 const bad=[
  ['impreza_compare_environments',{environment_id:'../other',other_environment_id}],
  ['impreza_compare_environments',{environment_id,other_environment_id,password:'never-send'}],
  ['impreza_prepare_traffic_switch',{deployment_id,target_deployment_id:deployment_id}],
  ['impreza_prepare_traffic_switch',{deployment_id,target_deployment_id,extra:true}],
  ['impreza_get_traffic_switch',{switch_id:'../other'}],
  ['impreza_get_traffic_switch',{switch_id,extra:true}],
  ['impreza_apply_traffic_switch',{switch_id,review_digest,confirm:false}],
  ['impreza_apply_traffic_switch',{switch_id,review_digest,confirm:'true'}],
  ['impreza_apply_traffic_switch',{switch_id,review_digest:'bad',confirm:true}],
  ['impreza_apply_traffic_switch',{switch_id,review_digest,confirm:true,password:'never-send'}],
  ['impreza_create_preview',{deployment_id,branch:[],protect:true}],
  ['impreza_create_preview',{deployment_id,branch:'x',protect:'false'}],
  ['impreza_create_preview',{deployment_id:'../other',branch:'x'}],
  ['impreza_create_preview',{deployment_id,branch:'x',password:'never-send'}],
 ];
 for(const [name,args] of bad) assert((await client.callTool({name,arguments:args})).isError,name);
 const probe=await client.callTool({name:'impreza_get_traffic_switch',arguments:{switch_id}});
 assert.equal(JSON.parse(probe.content[0].text).request_count,last+1,'invalid arguments must cause zero HTTP requests');
 assert.equal(tools.find(t=>t.name==='impreza_create_preview').annotations.openWorldHint,true);
 assert.equal(tools.find(t=>t.name==='impreza_create_preview').annotations.idempotentHint,true);
 assert.equal(tools.find(t=>t.name==='impreza_compare_environments').annotations.readOnlyHint,true);
 assert.equal(tools.find(t=>t.name==='impreza_apply_traffic_switch').annotations.readOnlyHint,false);
 console.log('PASS: 5 candidate MCP tools, exact requests, query forwarding, confirmation and 14 refusals without network effects.');
} finally {await client.close();}
