let count=0;
const plan={plan_id:'hpl_'+'a'.repeat(32),operation:'vps.reinstall',service_id:799,template_id:3,plan_digest:'a'.repeat(64),approval_id:'apr_'+'a'.repeat(32),status:'prepared',created_at:'2026-10-03T00:00:00Z',expires_at:'2026-10-03T00:30:00Z',provider_ref:null,note:''};
globalThis.fetch=async(input,options={})=>{
 const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(u.origin!=='https://host-fixture.invalid'||!u.pathname.startsWith('/v1/host/'))throw Error('unexpected fixture destination');
 const method=options.method||'GET';const body=options.body?JSON.parse(options.body):null;
 const note=JSON.stringify({count:++count,path:u.pathname,method,body});
 const data=u.pathname.endsWith('/permissions')?{permissions:[],state:'available',note}:{...plan,status:u.pathname.endsWith('/apply')?'submitted':'prepared',note};
 return new Response(JSON.stringify({success:true,data}),{status:200,headers:{'Content-Type':'application/json'}});
};
