import https from 'node:https';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {cases} from './fixtures/url-id-cases.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),key=randomBytes(24).toString('hex'),secret=randomBytes(32).toString('hex'),requests=[],checks=[];
const srv=https.createServer({key:readFileSync(process.env.URL_IDS_TLS_KEY),cert:readFileSync(process.env.URL_IDS_TLS_CERT)},(req,res)=>{
 requests.push({method:req.method,path:req.url,authenticated:req.headers['x-api-key']===key&&req.headers['x-api-secret']===secret});
 if(req.url==='/v1/entitlements'){res.end(JSON.stringify({success:true,data:{known:true,hidden:[]}}));return;}
 const error=req.url.includes('missing_fixture');res.writeHead(error?404:200,{'Content-Type':'application/json'});
 res.end(JSON.stringify(error?{success:false,error:{code:'NOT_FOUND',message:'Fixture resource unavailable'}}:{success:true,data:req.url.startsWith('/v1/account/topup/')?{invoice_id:1,amount:1,currency:'USD',method:null,status:'Unpaid',paid_at:null}:{}}));
});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const transport=new StdioClientTransport({command:process.execPath,args:[root+'/dist/server.js'],env:{...process.env,NODE_EXTRA_CA_CERTS:process.env.URL_IDS_TLS_CERT,IMPREZA_BASE_URL:'https://127.0.0.1:'+srv.address().port,IMPREZA_API_KEY:key,IMPREZA_API_SECRET:secret}});
const client=new Client({name:'url-ids-native-https',version:'1'});
try{
 await client.connect(transport);await client.listTools();
 for(const [name,field,method,path,extra] of cases){
  for(const id of ['..','.','a/b','a\\b','%2e%2e','a%2fb',' x','x\n','fixture_id','opaque?#:@é','missing_fixture']){
   const before=requests.length;let result;try{result=await client.callTool({name,arguments:{...extra,[field]:id}});}catch{}
   const observed=requests.slice(before),operations=observed.filter(q=>q.path!=='/v1/entitlements'),valid=['fixture_id','opaque?#:@é','missing_fixture'].includes(id);
   const pass=valid?operations.length===1&&observed.every(q=>q.authenticated)&&operations[0].method===method&&operations[0].path===path.replace('{id}',encodeURIComponent(id))&&(id==='missing_fixture'?result?.isError===true&&result.content.some(c=>c.text?.includes('NOT_FOUND')):result!==undefined&&!result.isError):result?.isError===true&&observed.length===0;
   checks.push({name,field,id,pass,requests:observed,is_error:result?.isError===true});
  }
 }
 const report={entry:'real compiled MCP stdio -> unmodified native fetch -> local HTTPS with ephemeral trusted certificate; all requests recorded including availability',total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks};
 if(process.env.URL_IDS_REPORT)writeFileSync(process.env.URL_IDS_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed}));process.exitCode=report.failed?1:0;
}finally{await client.close();await new Promise(r=>srv.close(r));}
