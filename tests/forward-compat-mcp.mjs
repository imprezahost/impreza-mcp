import assert from 'node:assert/strict';
import {loggedClient,sample} from './fixtures/request-log.mjs';

// The API gains fields on its own schedule; an installed package does not know
// them. With closed output schemas, a strict client (the MCP SDK validates)
// would refuse every answer that carries one. The package projects
// structuredContent onto its schema: the new field still reaches the model in
// the text, and never breaks validation. Three places a schema closes: the
// root object, the items of a list in the root, and the items of a list inside
// an anyOf branch.
const cases=[
 ['impreza_account_info',{},'impreza_account_info:account','/v1/account'],
 ['impreza_list_servers',{},'impreza_list_servers:list_servers','/v1/platform/servers'],
 ['impreza_search_docs',{query:'backup',limit:3},'impreza_search_docs:search','/v1/docs/search'],
];
for (const future of [false,true]) {
 const mcp=loggedClient('forward-compat-proof',{host:'forward-compat.invalid',env:{IMPREZA_TEST_FUTURE_FIELD:future?'1':'0'}});
 try {
  await mcp.connect();
  const tools=Object.fromEntries((await mcp.client.listTools()).tools.map(t=>[t.name,t]));
  let count=0;
  for (const [name,args,key,path] of cases) {
   assert(tools[name].outputSchema,name+' declares an output schema');
   // The SDK client validates structuredContent here: a refusal throws -32602.
   const r=await mcp.client.callTool({name,arguments:args});
   assert(!r.isError,JSON.stringify(r).slice(0,400));
   assert.equal(mcp.last().method,'GET');assert.equal(mcp.last().path,path);assert.equal(mcp.count(),++count);
   const text=r.content[0].text;
   assert.deepEqual(r.structuredContent,sample(key),name+': structuredContent is the answer, inside the contract');
   if (future) {
    assert(text.includes('f18_future_field'),name+': the new field reaches the model in the text');
    assert(!JSON.stringify(r.structuredContent).includes('f18_future_field'),name+': the new field stays out of structuredContent');
   } else {
    assert.deepEqual(JSON.parse(text),sample(key),name+': without a new field, text and structuredContent are the same answer');
   }
  }
 } finally {
  await mcp.close();
 }
}
console.log('PASS: a field the installed package does not know reaches the text and stays out of structuredContent (root object, list items, anyOf-branch list items); a strict client accepts every answer.');
