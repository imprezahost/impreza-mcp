import https from 'node:https';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=process.env.SEGMENTS_MCP_ROOT || fileURLToPath(new URL('../',import.meta.url));
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const key=randomBytes(24).toString('hex'),secret=randomBytes(32).toString('hex'),requests=[],checks=[];
const srv=https.createServer({key:readFileSync(process.env.SEGMENTS_TLS_KEY),cert:readFileSync(process.env.SEGMENTS_TLS_CERT)},(req,res)=>{
 requests.push({method:req.method,path:req.url,authenticated:req.headers['x-api-key']===key&&req.headers['x-api-secret']===secret});
 if(req.url==='/v1/entitlements'){res.end(JSON.stringify({success:true,data:{known:true,hidden:[]}}));return;}
 const error=req.url.includes('dpl_missing');res.writeHead(error?404:200,{'Content-Type':'application/json'});
 res.end(JSON.stringify(error?{success:false,error:{code:'NOT_FOUND',message:'Fixture resource unavailable'}}:{success:true,data:{accepted:true}}));
});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const transport=new StdioClientTransport({command:process.execPath,args:[root+'/dist/server.js'],env:{...process.env,NODE_EXTRA_CA_CERTS:process.env.SEGMENTS_TLS_CERT,IMPREZA_BASE_URL:'https://127.0.0.1:'+srv.address().port,IMPREZA_API_KEY:key,IMPREZA_API_SECRET:secret}});
const client=new Client({name:'segments-native-http',version:'1'});
try{
 await client.connect(transport);
 for(const [name,method,path] of [['impreza_probe_deployment','POST','/v1/platform/deployments/{id}/probe'],['impreza_get_app_read','GET','/v1/platform/deployments/{id}/reads'],['impreza_retire_preview','DELETE','/v1/platform/previews/{id}']]){
  for(const id of ['.','..','a/b','a\\b','%2e','%2e%2e','dpl_test','opaque?#:@é','dpl_missing']){
   const before=requests.length;const result=await client.callTool({name,arguments:{deployment_id:id}});
   const observed=requests.slice(before), operations=observed.filter(q=>q.path!=='/v1/entitlements');const good=['dpl_test','opaque?#:@é','dpl_missing'].includes(id);
   const pass=good? operations.length===1&&observed.every(q=>q.authenticated)&&operations[0].method===method&&operations[0].path===path.replace('{id}',encodeURIComponent(id))&&(id==='dpl_missing'?result.isError===true&&result.content.some(c=>c.text?.includes('NOT_FOUND')):!result.isError):result.isError===true&&observed.length===0;
   checks.push({tool:name,input:id,pass,requests:observed,is_error:result.isError===true});
  }
 }
 const report={entry:'real compiled MCP stdio -> unmodified native fetch -> isolated local HTTPS; every request recorded, invalid IDs before availability cache warmup',total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks};
 if(process.env.SEGMENTS_REPORT)writeFileSync(process.env.SEGMENTS_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
}finally{await client.close();await new Promise(r=>srv.close(r));}
