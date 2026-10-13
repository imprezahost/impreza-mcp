import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { loggedClient } from './fixtures/request-log.mjs';
const mcp = loggedClient('deployment-segments', {env:{IMPREZA_API_KEY:randomBytes(24).toString('hex'),IMPREZA_API_SECRET:randomBytes(32).toString('hex')}});
const checks=[];
function check(name,ok){checks.push({name,pass:!!ok});}
import {deploymentSegmentCases as cases} from './fixtures/deployment-segment-cases.mjs';
try {
 await mcp.connect(); const tools=(await mcp.client.listTools()).tools;
 for(const [name,method,path,extra] of cases){
  check(name+' listed',tools.some(t=>t.name===name));
  for(const id of ['dpl_test','opaque?#:@é']){
   const before=mcp.count();let result;try{result=await mcp.client.callTool({name,arguments:{...extra,deployment_id:id}});}catch{}
   const requests=mcp.requests().slice(before);
   check(name+' preserves segment '+(id==='dpl_test'?'normal':'reserved'), requests.length===1 && requests[0].method===method && requests[0].path===path.replace('{id}',encodeURIComponent(id)) && Object.keys(requests[0].query).length===0 && !result?.isError);
  }
 }
 // Every named deployment input, including strictly validated modern workflows,
 // must fail before policy lookups, REST dispatch, and credentials leave the process.
 for(const tool of tools.filter(t=>t.inputSchema.properties?.deployment_id)){
  for(const id of ['.','..','a/b','a\\b','%2e','%2e%2e','a%2fb','x\n',' x',42,{}]){
   const before=mcp.count();let result;try{result=await mcp.client.callTool({name:tool.name,arguments:{deployment_id:id,set:{PUBLIC_LABEL:'visible'}}});}catch{}
   check(tool.name+' invalid '+JSON.stringify(id), result?.isError===true && mcp.count()===before);
  }
 }
 // Read-once API refusal must still travel through the intended deployment route.
 const args={deployment_id:'dpl_test',command_id:'cmd_fixture'};
 const first=await mcp.client.callTool({name:'impreza_fetch_onion_key_export',arguments:args});
 const before=mcp.count();
 const second=await mcp.client.callTool({name:'impreza_fetch_onion_key_export',arguments:args});
 check('API error retained on valid route',!first.isError && second.isError===true && mcp.count()===before+1 && mcp.last().path==='/v1/platform/deployments/dpl_test/onion/export/cmd_fixture' && second.content.some(c=>c.text?.includes('NOT_FOUND')));
 const report={entry:'real MCP stdio tools/call -> ImprezaClient -> WHATWG URL -> logged fetch',checks,total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length};
 if(process.env.SEGMENTS_REPORT)writeFileSync(process.env.SEGMENTS_REPORT,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed,failures:checks.filter(c=>!c.pass).map(c=>c.name)}));
 assert.equal(report.failed,0,'deployment segment dispatch assertions failed');
} finally {await mcp.close();}
