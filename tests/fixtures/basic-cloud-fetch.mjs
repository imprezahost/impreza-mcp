let count=0;
globalThis.fetch=async(url,options)=>{
 const parsed=new URL(url);
 if(parsed.hostname!=='rollback.invalid')throw new Error('Unexpected destination');
 let data;
 if(options.method==='GET' && parsed.pathname==='/v1/entitlements')data={known:true,hidden:[]};
 else {
  count++;
  if(options.method==='GET' && parsed.pathname==='/v1/account/services/101')data={vps_backend:'cloud'};
  else data={request_count:count,path:parsed.pathname,method:options.method,body:JSON.parse(options.body)};
 }
 return new Response(JSON.stringify({success:true,data}),{status:200,headers:{'content-type':'application/json'}});
};
