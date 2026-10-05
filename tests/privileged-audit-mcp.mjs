import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const t=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/privileged-audit-fetch.mjs',import.meta.url).href,process.env.F41_BASE_SERVER || fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://audit-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-a-real-credential'}});
const c=new Client({name:'privileged-audit-test',version:'1.0.0'});let checks=0;
try {
 await c.connect(t);const tool=(await c.listTools()).tools.find(t=>t.name==='impreza_privileged_audit');assert.ok(tool,'privileged audit tool must be exposed by the real local MCP server');assert.ok(tool.outputSchema);assert.equal(tool.annotations.readOnlyHint,true);checks++;
 const call=arguments_=>c.callTool({name:tool.name,arguments:arguments_});
 const good=await call({limit:2,before:'aud_'+'a'.repeat(32)});assert.ok(!good.isError,JSON.stringify(good));const text=JSON.parse(good.content[0].text);assert.equal(text.request_count,1);assert.deepEqual(text.query,{limit:'2',before:'aud_'+'a'.repeat(32)});assert.equal(good.structuredContent.events[0].result,'refused');checks++;
 for(const args of [{limit:0},{limit:201},{limit:1.5},{limit:'1'},{before:'bad'},{before:2}]){try {const r=await call(args);assert.equal(r.isError,true);}catch(e){assert.match(String(e),/Invalid|schema|parameter/i);}checks++;}
 const again=await call({});assert.equal(JSON.parse(again.content[0].text).request_count,2);checks++;
 console.log('PASS privileged audit local stdio: '+checks+' checks; invalid input never reaches HTTP');
}finally{await c.close();}