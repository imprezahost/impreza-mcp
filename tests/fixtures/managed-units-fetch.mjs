// Synthetic transport only. Refuse every unexpected origin/path/body; no network.
let count=0;
globalThis.fetch=async(input,options={})=>{
 const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(u.origin!=='https://host-fixture.invalid'||!u.pathname.startsWith('/v1/host/'))throw Error('unexpected destination');
 const body=options.body?JSON.parse(options.body):null;
 const op=body?.operation??'unit.redis.restart';
 if(!/^unit\.redis\.(status|start|stop|restart|reload)$/.test(op))throw Error('unexpected operation');
 if(body && Object.keys(body).some(k=>!['service_id','operation','ttl_seconds'].includes(k)))throw Error('unexpected body');
 count++;
 if(process.env.UNITS_GATE==='off')return new Response(JSON.stringify({success:false,error:{code:'HOST_CAPABILITY_UNAVAILABLE',message:'Gate off'}}),{status:503,headers:{'Content-Type':'application/json'}});
 const note=JSON.stringify({count,path:u.pathname,method:options.method||'GET',body});
 const data={plan_id:'hpl_'+'a'.repeat(32),operation:op,service_id:799,plan_digest:'a'.repeat(64),approval_id:'apr_'+'a'.repeat(32),status:'prepared',created_at:'2026-10-22T00:00:00Z',expires_at:'2026-10-22T00:05:00Z',preview:{operation:op,unit:'redis-server.service',profile:'cache-redis-ubuntu2404-v1',prior_state:'active',compensation:'new_independently_approved_plan_after_reconciliation',possible_connection_loss:true,restart_fallback:false,packages:[],reboot:false,health_scope:'unit_state_and_local_coverage_not_client_reachability'},affected_count:0,affected_refs:[],agent_ref:'b'.repeat(64),note};
 return new Response(JSON.stringify({success:true,data}),{status:200,headers:{'Content-Type':'application/json'}});
};
