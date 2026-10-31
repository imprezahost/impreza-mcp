let count=0;
globalThis.fetch=async(input,options={})=>{
 const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(u.origin!=='https://host-fixture.invalid'||u.pathname!=='/v1/host/plans')throw Error('closed fixture destination');
 const body=JSON.parse(options.body||'{}');count++;
 if(process.env.IDENTITIES_GATE==='off')return new Response(JSON.stringify({success:false,error:{code:'HOST_CAPABILITY_UNAVAILABLE',message:'off'}}),{status:503,headers:{'Content-Type':'application/json'}});
 const before={present:true,home:true,group:true,keys:[],sudo:'none'};
 const data={plan_id:'hpl_'+'a'.repeat(32),operation:body.operation,service_id:799,plan_digest:'a'.repeat(64),approval_id:'apr_'+'a'.repeat(32),status:'prepared',created_at:'2026-10-22T00:00:00Z',expires_at:'2026-10-22T00:05:00Z',preview:{operation:body.operation,unit:'impreza-ops',profile:'ops-ubuntu2404-v1',uid:65001,gid:65001,possible_connection_loss:true,restart_fallback:false,packages:[],reboot:false,health_scope:'account_files_not_live_login',compensation:'reconcile_then_new_independent_plan_no_data_deletion',before,after:{...before,sudo:body.operation==='identity.ops.sudo-read'?'redis-status':'none'},fingerprint:body.fingerprint??null},affected_count:0,affected_refs:[],agent_ref:'b'.repeat(64),note:JSON.stringify({count})};
 return new Response(JSON.stringify({success:true,data}),{status:200,headers:{'Content-Type':'application/json'}});
};
