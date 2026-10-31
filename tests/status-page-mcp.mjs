import assert from 'node:assert/strict';
import {loggedClient} from './fixtures/request-log.mjs';
const mcp=loggedClient('status-page'), client=mcp.client;
const deployment_id='dpl_'+'a'.repeat(16), path='/v1/platform/deployments/custom/'+deployment_id+'/status-page';
let checks=0;
const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
try {
 await mcp.connect();
 const tools=(await client.listTools()).tools;
 for(const name of ['impreza_get_status_page','impreza_set_status_page']) {
  const tool=tools.find(t=>t.name===name);assert(tool,name);checks++;
  check(tool.inputSchema.additionalProperties,false);
  check(tool.annotations.readOnlyHint,name==='impreza_get_status_page');
 }
 for(const [name,args,method,body] of [
  ['impreza_get_status_page',{deployment_id},'GET',null],
  ['impreza_set_status_page',{deployment_id,public_name:'Public board'},'PUT',{public_name:'Public board'}],
  ['impreza_set_status_page',{deployment_id,enabled:false},'PUT',{enabled:false}],
  ['impreza_set_status_page',{deployment_id,rotate_token:true},'PUT',{rotate_token:true}],
 ]) {
  const result=await client.callTool({name,arguments:args});assert(!result.isError,JSON.stringify(result));checks++;
  const sent=mcp.last();check(sent.method,method);check(sent.path,path);check(sent.body,body);check(sent.query,{});
 }
 const before=mcp.count();
 for(const [name,args] of [
  ['impreza_get_status_page',{deployment_id:'../foreign'}],
  ['impreza_get_status_page',{deployment_id:deployment_id+'\n'}],
  ['impreza_get_status_page',{deployment_id,unexpected:true}],
  ['impreza_set_status_page',{deployment_id,enabled:'false'}],
  ['impreza_set_status_page',{deployment_id,rotate_token:'true'}],
  ['impreza_set_status_page',{deployment_id,public_name:''}],
  ['impreza_set_status_page',{deployment_id,public_name:'x'.repeat(81)}],
  ['impreza_set_status_page',{deployment_id,unexpected:'never-send'}],
 ]) {assert((await client.callTool({name,arguments:args})).isError,name);checks++;}
 check(mcp.count(),before);
 console.log(JSON.stringify({item:'status-page',checks,passed:checks,real_stdio:true,invalid_inputs_never_sent_http:true}));
} finally {await mcp.close();}

