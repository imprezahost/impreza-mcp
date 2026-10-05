import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('tor-egress-test');const client=mcp.client;
try {
 await mcp.connect();
 const tool=(await client.listTools()).tools.find(t=>t.name==='impreza_deploy_custom');
 assert.equal(tool.inputSchema.properties.tor_egress.type,'boolean');
 const base={name:'tor-fixture',agent_id:'agt_fixture',mode:'image',image:'nginx:stable'};let count=0;
 async function accepted(input){const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError,JSON.stringify(result));assert.deepEqual(result.structuredContent,sample('impreza_deploy_custom:image_onion_only'));const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom');assert.deepEqual(data.body,input);assert.equal(mcp.count(),++count);}
 await accepted(base);await accepted({...base,tor_egress:true});await accepted({...base,tor_egress:false});
 for(const value of ['true',1,null,{},[]]){const result=await client.callTool({name:tool.name,arguments:{...base,tor_egress:value}});assert.equal(result.isError,true);}
 for(const mode of ['manifest','compose']){const result=await client.callTool({name:tool.name,arguments:{...base,mode,tor_egress:true}});assert.equal(result.isError,true);}
 for(const value of [true,'true',1,null]){const result=await client.callTool({name:'impreza_deploy_catalog_app',arguments:{app_name:'nginx',agent_id:base.agent_id,tor_egress:value}});assert.equal(result.isError,true);}
 await accepted({...base,tor_egress:true});
 const prepared={plan_id:'plan_'+'a'.repeat(24),name:'tor-fixture',agent_id:'agt_fixture',tor_egress:true};
 const result=await client.callTool({name:'impreza_prepare_project_deployment',arguments:prepared});assert(!result.isError,JSON.stringify(result));
 assert.deepEqual(result.structuredContent,sample('impreza_prepare_project_deployment:prepare_static'));
 const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom/plans/'+prepared.plan_id+'/prepare-deployment');assert.equal(data.body.tor_egress,true);assert.equal(mcp.count(),++count);
 console.log('PASS: Tor runtime opt-in survives stdio/custom/prepared transport; invalid types/modes make no deploy request.');
}finally{await mcp.close();}
