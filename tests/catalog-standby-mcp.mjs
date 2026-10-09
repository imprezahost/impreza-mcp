import assert from 'node:assert/strict';
import {loggedClient} from './fixtures/request-log.mjs';
const m=loggedClient('catalog-standby');
try {
 await m.connect();
 const tool=(await m.client.listTools()).tools.find(t=>t.name==='impreza_deploy_catalog_app');
 assert.equal(tool.inputSchema.properties.standby.type,'boolean');
 assert.match(tool.inputSchema.properties.standby.description,/Memos 0\.31\.0/);
 assert.doesNotMatch(tool.inputSchema.properties.standby.description,/Kuma/);
 const args={app_name:'memos',agent_id:'agt_fixture',app_version:'0.31.0',standby:true};
 await m.client.callTool({name:tool.name,arguments:args});
 assert.equal(m.last().path,'/v1/platform/deployments');assert.deepEqual(m.last().body,args);
 const count=m.count();
 for(const standby of ['true',1,null,[],{}]){const r=await m.client.callTool({name:tool.name,arguments:{...args,standby}});assert(r.isError);assert.equal(m.count(),count);}
 console.log('PASS: local stdio schema, exact standby forwarding and strict boolean without unwanted requests.');
} finally {await m.close();}
