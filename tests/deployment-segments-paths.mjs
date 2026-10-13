import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {randomBytes} from 'node:crypto';
const root=process.env.SEGMENTS_MCP_ROOT || fileURLToPath(new URL('../',import.meta.url));
const {loggedClient}=await import(pathToFileURL(root+'/tests/fixtures/request-log.mjs'));
const {deploymentSegmentCases:cases}=await import(pathToFileURL(root+'/tests/fixtures/deployment-segment-cases.mjs'));
const mcp=loggedClient('segments-exact-route-negative',{env:{IMPREZA_API_KEY:randomBytes(24).toString('hex'),IMPREZA_API_SECRET:randomBytes(32).toString('hex')}});
const checks=[];
try{
 await mcp.connect();
 for(const [name,method,path,extra] of cases){
  for(const id of ['.','..','a/b','a\\b','%2e','%2e%2e','a%2fb']){
   const before=mcp.count();let r;try{r=await mcp.client.callTool({name,arguments:{...extra,deployment_id:id}});}catch{}
   const requests=mcp.requests().slice(before).map(q=>({method:q.method,path:q.path,query:q.query}));
   checks.push({tool:name,input:id,expected:'error with no HTTP request',is_error:r?.isError===true,requests,pass:r?.isError===true && requests.length===0});
  }
 }
 const report={entry:'MCP stdio with otherwise valid arguments, actual normalized URL dispatch',total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks};
 if(process.env.SEGMENTS_REPORT)writeFileSync(process.env.SEGMENTS_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
}finally{await mcp.close();}
