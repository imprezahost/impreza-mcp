import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=process.env.F41_CANDIDATE_ROOT,php=process.env.IMPREZA_TEST_PHP;
assert.ok(root&&php,'candidate API and PHP must be supplied');
const listener=net.createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const fixture=path.join(root,'engineering/fixtures/privileged-audit/boundary-http.php');
const server=spawn(php,['-n','-d','extension_dir='+path.join(path.dirname(php),'ext'),'-d','extension=pdo_sqlite','-d','extension=openssl','-S','127.0.0.1:'+port,fixture],{env:{...process.env,F41_NATIVE:'0'},windowsHide:true,stdio:['ignore','pipe','pipe']});
let stderr='';server.stderr.on('data',d=>stderr+=d);server.stdout.on('data',()=>{});
const url='http://127.0.0.1:'+port;
const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./privileged-audit-boundary-fetch.mjs',import.meta.url).href,process.env.F41_BASE_SERVER||fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://audit-boundary.invalid',F41_BOUNDARY_HTTP_URL:url,IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-real',IMPREZA_SOCKS_PROXY:''}});
const c=new Client({name:'audit-resource-boundary',version:'1.0.0'});
try{
let ready=false;for(let i=0;i<50;i++){try{ready=(await fetch(url+'/__health')).ok;if(ready)break;}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'isolated API fixture must start');
await c.connect(t);const r=await c.callTool({name:'impreza_privileged_audit',arguments:{}});
assert.ok(!r.isError,JSON.stringify(r));
const rows=r.structuredContent.events;assert.ok(rows.length>=4);
assert.ok(rows.every(e=>e.target_kind==='service'&&e.target_id==='799'));
assert.ok(rows.every(e=>e.plan_id!=='cplan_cccccccccccccccccccccccc'&&e.plan_digest!=='c'.repeat(64)&&e.approval_id!=='apr_'+'c'.repeat(32)));
const legacy=rows.filter(e=>e.plan_id===null&&e.plan_digest===null&&e.approval_id===null);assert.ok(legacy.length>=3);
const own=rows.find(e=>e.plan_id==='tsw_aaaaaaaaaaaaaaaaaaaaaaaa');assert.ok(own);assert.equal(own.plan_digest,'d'.repeat(64));assert.equal(own.approval_id,'apr_'+'a'.repeat(32));
console.log('PASS local stdio audit boundary: real candidate PHP HTTP/Router; historical foreign references hidden, own references retained');
}finally{await c.close();server.kill();await new Promise(r=>server.once('exit',r));}
