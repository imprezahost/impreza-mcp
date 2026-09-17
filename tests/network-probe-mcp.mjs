import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport=new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/preparation-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://rollback.invalid',IMPREZA_API_KEY:'test-key',IMPREZA_API_SECRET:'test-secret-not-a-real-credential'}});
const client=new Client({name:'network-probe-test',version:'1.0.0'});
try {
 await client.connect(transport);
 const tool=(await client.listTools()).tools.find(t=>t.name==='impreza_probe_deployment');assert(tool);assert.equal(tool.annotations.readOnlyHint,true);
 const result=await client.callTool({name:tool.name,arguments:{deployment_id:'dpl_fixture'}});assert(!result.isError,JSON.stringify(result));
 const data=JSON.parse(result.content[0].text);assert.equal(data.path,'/v1/platform/deployments/dpl_fixture/probe');assert.equal(data.method,'POST');assert.deepEqual(data.body,{});
 const denied=await client.callTool({name:tool.name,arguments:{deployment_id:''}});assert(denied.isError);
 console.log('PASS: named MCP probe dispatches exact POST with no arbitrary URL or credentials; missing ID refused.');
} finally {await client.close();}
