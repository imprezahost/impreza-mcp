import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';
const mcp=loggedClient('network-probe-test');const client=mcp.client;
try {
 await mcp.connect();
 const tools=(await client.listTools()).tools;
 const promotion_id='prom_'+'a'.repeat(24),review_digest='b'.repeat(64);
 for(const [name,args,method,path,body] of [
  ['impreza_prepare_image_promotion',{deployment_id:'dpl_target',source_deployment_id:'dpl_source'},'POST','/v1/platform/deployments/custom/dpl_target/prepare-promotion',{source_deployment_id:'dpl_source'}],
  ['impreza_get_image_promotion',{promotion_id},'GET','/v1/platform/deployments/custom/promotions/'+promotion_id,undefined],
  ['impreza_apply_image_promotion',{promotion_id,review_digest,confirm:true},'POST','/v1/platform/deployments/custom/promotions/'+promotion_id+'/apply',{review_digest,confirm:true}],
 ]) {
  assert(tools.find(t=>t.name===name));const r=await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r));const d=mcp.last();assert.equal(d.path,path);assert.equal(d.method,method);if(body)assert.deepEqual(d.body,body);
  if(name==='impreza_get_image_promotion')assert.deepEqual(r.structuredContent,sample('impreza_get_image_promotion:pending_with_domain'));
 }
 const before=mcp.count();
 const denied=await client.callTool({name:'impreza_apply_image_promotion',arguments:{promotion_id,review_digest,confirm:false}});assert(denied.isError);
 assert.equal(mcp.count(),before,'a refused confirm must make no HTTP request');
 console.log('PASS: promotion tools preserve reviewed IDs/digests and explicit confirmation; exact transport routes verified.');
} finally {await mcp.close();}
