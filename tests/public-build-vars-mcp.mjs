import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
const transport = new StdioClientTransport({command: process.execPath, args: ['--import', new URL('./fixtures/preparation-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../dist/server.js', import.meta.url))], env: { ...process.env, IMPREZA_BASE_URL: 'https://rollback.invalid', IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential' }});
const client = new Client({name: 'rollback-test', version: '1.0.0'});
try {
 await client.connect(transport);
 const tools = await client.listTools();
 const tool=tools.tools.find(t=>t.name==='impreza_deploy_custom');
 assert(tool);assert.equal(tool.annotations.readOnlyHint,false);
 assert(tool.inputSchema.properties.build_strategy.enum.includes('node_npm_static'));
 const input={name:'node-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'node_npm_static',target_port:8080,public_build_vars:{VITE_URL:'https://api.example.invalid?a=$b',PUBLIC_TEXT:'quotes " and \n newline',PUBLIC_EMPTY:''},project_dir:'apps/site',static_output_dir:'public/site',static_spa:false};
 const result=await client.callTool({name:tool.name,arguments:input});assert(!result.isError);
 const data=JSON.parse(result.content[0].text);assert.equal(data.method,'POST');assert.equal(data.path,'/v1/platform/deployments/custom');assert.deepEqual(data.body,input);assert.equal(data.request_count,1);
 const invalid=await client.callTool({name:tool.name,arguments:{...input,mode:'image',image:'busybox:1.37'}});assert.equal(invalid.isError,true);
 const incompatible=await client.callTool({name:tool.name,arguments:{...input,build_strategy:'node_npm'}});assert.equal(incompatible.isError,true);
 const wrongMode=await client.callTool({name:tool.name,arguments:{name:'node-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',project_dir:'apps/site'}});assert.equal(wrongMode.isError,true);
 for(const vars of [null,[],{TOKEN:'x'},{NODE_OPTIONS:'x'},{VITE_X:42},{VITE_X:'bad\0value'},{VITE_X:'x'.repeat(4097)},{['PUBLIC_X\n']:'x'},Object.fromEntries(Array.from({length:21},(_,i)=>['PUBLIC_'+i,''])),Object.fromEntries(['PUBLIC_A','PUBLIC_B','PUBLIC_C','PUBLIC_D'].map(k=>[k,'x'.repeat(4096)]))]) {
   const bad=await client.callTool({name:tool.name,arguments:{...input,public_build_vars:vars}});assert.equal(bad.isError,true);
 }
 const nodeInput={name:'node-fixture',agent_id:'agt_fixture',mode:'dockerfile',git_url:'https://github.com/example/app.git',build_strategy:'node_npm',public_build_vars:{NEXT_PUBLIC_API_URL:'https://node.example.invalid',PUBLIC_EMPTY:''},project_dir:'services/api'};
 const nodeResult=await client.callTool({name:tool.name,arguments:nodeInput});assert(!nodeResult.isError);const nodeData=JSON.parse(nodeResult.content[0].text);assert.deepEqual(nodeData.body,nodeInput);assert.equal(nodeData.request_count,2);
 const badType=await client.callTool({name:tool.name,arguments:{...nodeInput,project_dir:42}});assert.equal(badType.isError,true);
 const rootInput={...nodeInput,project_dir:'.'};const rootResult=await client.callTool({name:tool.name,arguments:rootInput});assert(!rootResult.isError);const rootData=JSON.parse(rootResult.content[0].text);assert.deepEqual(rootData.body,rootInput);assert.equal(rootData.request_count,3);
 console.log('PASS: Public build values preserve exact API inputs for Node/static; invalid modes, prefixes, types and sizes make no deploy requests.');
} finally { await client.close(); }
