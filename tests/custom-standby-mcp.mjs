import assert from 'node:assert/strict';
import {loggedClient} from './fixtures/request-log.mjs';
const m=loggedClient('f43-custom-standby');
try {
 await m.connect();
 const tool=(await m.client.listTools()).tools.find(t=>t.name==='impreza_deploy_custom');
 assert.equal(tool.inputSchema.properties.standby.type,'boolean');
 const image='nginx@sha256:'+'a'.repeat(64);
 const args={name:'custom-standby',agent_id:'agt_fixture',mode:'image',image,standby:true};
 const modes=[args,{...args,mode:'dockerfile',git_url:'https://gitlab.com/fixture/project.git',git_ref:'a'.repeat(40)},{...args,mode:'manifest',manifest:{runtime:{compose_yaml:'services:\n  web:\n    image: '+image+'\n'}}},{...args,mode:'compose',compose_yaml:'services:\n  web:\n    image: '+image+'\n',web_service:'web',target_port:80,compose_review_id:'compose_'+'a'.repeat(64)}];
 for(const input of modes){
  await m.client.callTool({name:tool.name,arguments:input});
  assert.equal(m.last().path,'/v1/platform/deployments/custom');
  assert.equal(m.last().body.standby,true,'standby forwarded for '+input.mode);
  assert(!m.last().body.domain&&!m.last().body.onion);
 }
 assert.equal(m.requests()[0].body.image,image);
 const count=m.count();
 for(const input of modes) for(const standby of ['true',1,null,[],{}]){
  const r=await m.client.callTool({name:tool.name,arguments:{...input,standby}});
  assert(r.isError,'invalid standby rejected: '+JSON.stringify(standby));assert.equal(m.count(),count,'invalid standby causes no API request');
 }
 console.log('PASS: custom standby through local MCP stdio, pinned image/boolean forwarding and invalid inputs make no request.');
} finally {await m.close();}
