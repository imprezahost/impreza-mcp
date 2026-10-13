import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {loggedClient} from './fixtures/url-id-request-log.mjs';
import {cases} from './fixtures/url-id-cases.mjs';
const checks=[],mcp=loggedClient('url-ids',{env:{IMPREZA_API_KEY:randomBytes(24).toString('hex'),IMPREZA_API_SECRET:randomBytes(32).toString('hex')}});
try {
 await mcp.connect();const tools=(await mcp.client.listTools()).tools;
 for(const [name,field,method,path,extra] of cases){
  checks.push({name:name+' listed',pass:tools.some(t=>t.name===name)});
  for(const id of ['..','.','a/b','a\\b','%2e%2e','a%2fb',' x','x\n','fixture_id','opaque?#:@é']){
   const before=mcp.count();let result;try{result=await mcp.client.callTool({name,arguments:{...extra,[field]:id}});}catch{}
   const requests=mcp.requests().slice(before),valid=['fixture_id','opaque?#:@é'].includes(id);
   const pass=valid?result!==undefined&&requests.length===1&&requests[0].method===method&&requests[0].path===path.replace('{id}',encodeURIComponent(id))&&!result?.isError:result?.isError===true&&requests.length===0;
   checks.push({name,field,id,pass,is_error:result?.isError===true,requests});
  }
 }
 for(const [name,field,extra,path] of [['impreza_get_app_read','read_id',{deployment_id:'dpl_test'},'/v1/platform/deployments/dpl_test/reads'],['impreza_get_cli_run','run_id',{deployment_id:'dpl_test'},'/v1/platform/deployments/dpl_test/cli'],['impreza_list_tasks','task_id',{},'/v1/tasks']]){
  for(const value of [undefined,'']){const before=mcp.count();let result;try{result=await mcp.client.callTool({name,arguments:{...extra,...(value===undefined?{}:{[field]:value})}});}catch{}const req=mcp.requests().slice(before);checks.push({name:name+' optional '+String(value),pass:!result?.isError&&result!==undefined&&req.length===1&&req[0].path===path,result,requests:req});}
 }

 for(const [name,field,id,path] of [
  ['impreza_restore_app','backup_id',1,'/v1/backups/1/restore'],
  ['impreza_discard_replaced','backup_id',1,'/v1/backups/1/discard-previous'],
  ['impreza_topup_status','invoice_id',1,'/v1/account/topup/1'],
  ['impreza_domain_details','domain','fixture.invalid','/v1/domains/fixture.invalid'],
  ['impreza_dedicated_set_rdns','ip','::1','/v1/dedicated/1/ips/%3A%3A1/rdns']]) {
  const before=mcp.count();let result;try{result=await mcp.client.callTool({name,arguments:{[field]:id,...(field==='ip'?{service_id:1,hostname:'fixture.invalid'}:{})}});}catch{}
  const requests=mcp.requests().slice(before);checks.push({name:name+' compatibility',pass:result!==undefined&&!result.isError&&requests.length===1&&requests[0].path===path,requests});
 }
 for(const [name,args,path,key] of [
  ['impreza_domain_check',{domain:'..'},'/v1/domains/check','query'],
  ['impreza_domain_transfer',{domain:'..',epp_code:'fixture-only'},'/v1/domains/transfer','body']]){
  const before=mcp.count();let result;try{result=await mcp.client.callTool({name,arguments:args});}catch{}
  const requests=mcp.requests().slice(before);checks.push({name:name+' non-path compatibility',pass:result!==undefined&&!result.isError&&requests.length===1&&requests[0].path===path&&requests[0][key]?.[key==='query'?'domains':'domain']==='..',requests});
 }
 const report={entry:'actual compiled MCP stdio -> ImprezaClient -> normalized URL -> logged fetch',total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks};
 if(process.env.URL_IDS_REPORT)writeFileSync(process.env.URL_IDS_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({total:report.total,passed:report.passed,failed:report.failed,failures:checks.filter(c=>!c.pass).map(c=>c.name+' '+(c.id??''))}));process.exitCode=report.failed?1:0;
}finally{await mcp.close();}
