import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const transport = new StdioClientTransport({command:process.execPath,args:['--import',new URL('./fixtures/auto-start-fetch.mjs',import.meta.url).href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://autostart-fixture.invalid',IMPREZA_API_KEY:'fixture-only',IMPREZA_API_SECRET:'fixture-only-not-a-real-credential'}});
const client = new Client({name:'auto-start-proof',version:'1.0.0'});
try {
  await client.connect(transport);
  const tools = (await client.listTools()).tools;
  const tool = tools.find(t => t.name === 'impreza_vps_set_auto_start');
  const legacy = tools.find(t => t.name === 'impreza_vps_power');
  assert(!legacy.inputSchema.properties.action.enum.includes('set_auto_start'));
  assert.equal(legacy.inputSchema.properties.auto_start, undefined);
  assert.equal(tool.annotations.idempotentHint, true);
  assert.equal(tool.annotations.destructiveHint, false);
  const denied = await client.callTool({name:legacy.name,arguments:{service_id:'553',action:'set_auto_start',auto_start:false,confirm:true}});
  assert.equal(denied.isError, true);
  assert.equal(tool.inputSchema.properties.auto_start.type, 'boolean');
  assert.equal(tool.annotations.readOnlyHint, false);
  let count = 0;
  for (const auto_start of [false, true]) {
    const r = await client.callTool({name:tool.name,arguments:{service_id:'553',auto_start,confirm:true}});
    assert(!r.isError, JSON.stringify(r));
    const d = JSON.parse(r.content[0].text);
    assert.equal(d.auto_start, auto_start); assert.equal(d.request_count, ++count);
  }
  for (const body of [{auto_start:false}, {auto_start:'false',confirm:true}, {auto_start:0,confirm:true}, {auto_start:true,confirm:1}, {auto_start:true,confirm:false}]) {
    const r = await client.callTool({name:tool.name,arguments:{service_id:'553',...body}});
    assert.equal(r.isError, true, JSON.stringify(body));
  }
  const read = await client.callTool({name:'impreza_vps_status',arguments:{service_id:'553'}});
  assert(!read.isError); assert.equal(read.structuredContent.auto_start, false); assert.equal(read.structuredContent.power_state, 'stopped');
  console.log('PASS MCP stdio: schema, two exact writes, five invalid calls, status read; no network');
} finally { await client.close(); }
