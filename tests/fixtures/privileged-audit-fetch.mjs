let count=0;
const event={event_id:'aud_'+'a'.repeat(32),client_id:1,actor_type:'api_key',actor_id:1,surface:'rest',verb:'proxmoxvps.reinstall',target_kind:'service',target_id:'799',plan_id:null,plan_digest:null,approval_id:null,created_at:'2026-10-03 00:00:00',started_at:null,finished_at:'2026-10-03 00:00:01',result:'refused',retention_class:'refusal',provider_ref:null};
globalThis.fetch=async (input,options={})=>{
 const u=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
 if(u.origin!=='https://audit-fixture.invalid'||u.pathname!=='/v1/audit/privileged'||(options.method||'GET')!=='GET')throw Error('unexpected fixture destination');
 const page={events:[event],state:'available',next_cursor:null,retention_days:{operational:7,security:30,destructive:90,refusal:7},note:'Admission does not certify host completion.',request_count:++count,query:Object.fromEntries(u.searchParams)};
 return new Response(JSON.stringify({success:true,data:page}),{status:200,headers:{'Content-Type':'application/json'}});
};