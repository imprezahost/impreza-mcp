import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/basic-cloud-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'basic-cloud-test',version:'1.0.0'});
try {
 await client.connect(transport);
 const tools=(await client.listTools()).tools.filter(t=>t.name.startsWith('impreza_cloud_'));
 assert.deepEqual(tools.map(t=>t.name),['impreza_cloud_power']);
 assert.deepEqual(tools[0].inputSchema.properties.action.enum,['boot','shutdown','reboot']);
 for(const name of ['impreza_cloud_create_image','impreza_cloud_delete_image','impreza_cloud_restore_image','impreza_cloud_rescue','impreza_cloud_resize','impreza_cloud_rdns','impreza_cloud_set_rdns','impreza_cloud_delete_rdns','impreza_cloud_add_ssh_key']) {
  const denied=await client.callTool({name,arguments:{vm_id:'101',image_id:'foreign',enable:true}});
  assert(denied.isError, name); assert.match(denied.content[0].text,/FEATURE_NOT_AVAILABLE/);
 }
 const denied=await client.callTool({name:'impreza_cloud_power',arguments:{vm_id:'101',action:'poweroff'}});assert(denied.isError);
 let count=0;
 for(const action of ['boot','shutdown','reboot']) {
  const out=await client.callTool({name:'impreza_cloud_power',arguments:{vm_id:'101',action}});assert(!out.isError,JSON.stringify(out));
  const data=JSON.parse(out.content[0].text);assert.equal(data.request_count,++count,'denied calls made no HTTP request');assert.equal(data.path,`/v1/vps/cloud/101/${action}`);assert.equal(data.method,'POST');
 }
 for(const [name,field,value] of [['impreza_vps_set_hostname','hostname','app.example.com'],['impreza_vps_reset_password','password','fixture-password']]) {
  const out=await client.callTool({name,arguments:{service_id:101,[field]:value}});
  assert(out.isError);assert.match(out.content[0].text,/FEATURE_NOT_AVAILABLE/);
 }
 const last=await client.callTool({name:'impreza_cloud_power',arguments:{vm_id:'101',action:'boot'}});
 assert.equal(JSON.parse(last.content[0].text).request_count,6,'two service reads, no hostname/password PUT');
 console.log('PASS: basic Cloud catalog, retired calls, force-stop refusal, hostname/password refused before PUT, valid power dispatch.');
} finally {await client.close();}
