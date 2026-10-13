import {appendFileSync} from 'node:fs';
const log=process.env.IMPREZA_TEST_REQUEST_LOG,host=new URL(process.env.IMPREZA_BASE_URL).hostname;
if(!host.endsWith('.invalid')||!log)throw new Error('Isolated fixture configuration required');
globalThis.fetch=async(url,options={})=>{
 const parsed=new URL(url);if(parsed.hostname!==host)throw new Error('Unexpected destination');
 const method=options.method||'GET',path=parsed.pathname;
 if(path==='/v1/entitlements')return Response.json({success:true,data:{known:true,hidden:[]}});
 appendFileSync(log,JSON.stringify({method,path,query:Object.fromEntries(parsed.searchParams),body:options.body?JSON.parse(options.body):null})+'\n');
 return Response.json({success:true,data:path.startsWith('/v1/account/topup/')?{invoice_id:1,amount:1,currency:'USD',method:null,status:'Unpaid',paid_at:null}:{}});
};
