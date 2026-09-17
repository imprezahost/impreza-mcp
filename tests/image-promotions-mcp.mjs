import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/image-promotions-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'network-probe-test',version:'1.0.0'});
try {
 await client.connect(transport);
 const tools=(await client.listTools()).tools;
 const promotion_id='prom_'+'a'.repeat(24),review_digest='b'.repeat(64);
 for(const [name,args,method,path,body] of [
  ['impreza_prepare_image_promotion',{deployment_id:'dpl_target',source_deployment_id:'dpl_source'},'POST','/v1/platform/deployments/custom/dpl_target/prepare-promotion',{source_deployment_id:'dpl_source'}],
  ['impreza_get_image_promotion',{promotion_id},'GET','/v1/platform/deployments/custom/promotions/'+promotion_id,undefined],
  ['impreza_apply_image_promotion',{promotion_id,review_digest,confirm:true},'POST','/v1/platform/deployments/custom/promotions/'+promotion_id+'/apply',{review_digest,confirm:true}],
 ]) {
  assert(tools.find(t=>t.name===name));const r=await client.callTool({name,arguments:args});assert(!r.isError,JSON.stringify(r));const d=JSON.parse(r.content[0].text);assert.equal(d.path,path);assert.equal(d.method,method);if(body)assert.deepEqual(d.body,body);
 }
 const denied=await client.callTool({name:'impreza_apply_image_promotion',arguments:{promotion_id,review_digest,confirm:false}});assert(denied.isError);
 console.log('PASS: promotion tools preserve reviewed IDs/digests and explicit confirmation; exact transport routes verified.');
} finally {await client.close();}
