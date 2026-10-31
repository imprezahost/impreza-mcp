let count=0;
globalThis.fetch=async(input,options={})=>{
 const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(u.origin!=='https://host-fixture.invalid'||!u.pathname.startsWith('/v1/host/'))throw Error('unexpected fixture destination');
 const body=options.body?JSON.parse(options.body):null;
 if(body?.operation && body.operation!=='managed_service.reload')throw Error('wrong operation');
 const note=JSON.stringify({count:++count,path:u.pathname,method:options.method||'GET',body});
 const data={plan_id:'hpl_'+'a'.repeat(32),operation:'managed_service.reload',service_id:799,plan_digest:'a'.repeat(64),approval_id:'apr_'+'a'.repeat(32),status:u.pathname.endsWith('/apply')?'submitted':'prepared',created_at:'2026-10-18T00:00:00Z',expires_at:'2026-10-18T00:05:00Z',preview:{operation:'managed_service.reload',unit:'impreza-agent-ingress.service',possible_connection_loss:true,restart_fallback:false,packages:[],reboot:false,health_scope:'complete_adapter_verification_required'},affected_count:0,affected_refs:[],agent_ref:'b'.repeat(64),note};
 return new Response(JSON.stringify({success:true,data}),{status:200,headers:{'Content-Type':'application/json'}});
};
