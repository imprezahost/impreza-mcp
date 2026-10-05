import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('shield-v2-proof',{host:'shield-fixture.invalid',env:{IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-a-real-credential'}});const client=mcp.client;
let count=0;
try {
 await mcp.connect();
 const tools=(await client.listTools()).tools;
 const get=tools.find(t=>t.name==='impreza_get_shield'),set=tools.find(t=>t.name==='impreza_set_shield');
 assert.equal(get.annotations.readOnlyHint,true);assert.equal(set.inputSchema.properties.exclusions.maxItems,20);
 const dep='dpl_'+'a'.repeat(16);
 const policy=sample('impreza_get_shield:policy');
 const r=await client.callTool({name:get.name,arguments:{deployment_id:dep}});assert(!r.isError,JSON.stringify(r));const data=mcp.last();
 assert.equal(data.method,'GET');assert.equal(data.path,'/v1/platform/deployments/'+dep+'/shield');assert.equal(mcp.count(),++count);
 // The audit review reaches the caller unchanged, both as text and as validated structured content.
 assert.deepEqual(r.structuredContent,policy);assert.deepEqual(JSON.parse(r.content[0].text),policy);
 assert.equal(r.structuredContent.shield.audit_review.would_block_requests,policy.shield.audit_review.would_block_requests);
 async function accepted(body){const result=await client.callTool({name:set.name,arguments:{deployment_id:dep,...body}});assert(!result.isError,JSON.stringify(result));const data=mcp.last();assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/'+dep+'/shield');assert.deepEqual(data.body,body);assert.equal(mcp.count(),++count);}
 const base={shield_profile:'standard',shield_mode:'audit',base_revision:7};
 await accepted({...base,exclusions:[{rule_id:942100,path_prefix:'/api/form-v1.0'}]});
 await accepted({...base,exclusions:[]});
 const invalid=[...["/x\ny",'/x"','/x}','/x#','/x y','/xＡ','bad','/x\\y','/x`y'].map(path_prefix=>({exclusions:[{rule_id:942100,path_prefix}]})),{exclusions:Array(21).fill({rule_id:942100})},{exclusions:[{rule_id:'942100'}]},{exclusions:[{rule_id:942100,raw_directive:'deny'}]},...[false,1,'true'].map(confirm_enforce=>({shield_profile:'hardened',shield_mode:'enforce',confirm_enforce}))];
 for(const bad of invalid){const r=await client.callTool({name:set.name,arguments:{deployment_id:dep,...base,...bad}});assert.equal(r.isError,true,JSON.stringify(bad));}
 const missing=await client.callTool({name:set.name,arguments:{deployment_id:dep,shield_profile:'standard',exclusions:[]}});assert.equal(missing.isError,true);
 await accepted({...base,shield_profile:'hardened',shield_mode:'enforce',confirm_enforce:true,exclusions:[]});
 // Final count proves every refused input stopped before the HTTP adapter.
 await accepted({...base,exclusions:[{rule_id:941100}]});
 console.log('PASS: actual MCP stdio read/write forwards the audit schema and revision, strict confirmation and valid exclusions; hostile inputs never reach HTTP.');
}finally{await mcp.close();}
