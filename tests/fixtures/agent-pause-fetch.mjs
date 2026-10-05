// No network: only the exact two new REST routes are accepted.
let count=0;
globalThis.fetch=async(url,options={})=>{
 const u=new URL(String(url)),m=u.pathname.match(/^\/v1\/platform\/servers\/(agt_[a-f0-9]{16})\/(pause|resume)$/);
 if(u.origin!=='https://pause-fixture.invalid'||!m||options.method!=='POST')throw new Error('unexpected fixture destination');
 const body=JSON.parse(options.body);if(JSON.stringify(body)!==JSON.stringify({confirm:true}))throw new Error('invalid input reached HTTP');
 return new Response(JSON.stringify({success:true,data:{agent_id:m[1],status:m[2]==='pause'?'draining':'online',paused:m[2]==='pause',request_count:++count}}),{status:200,headers:{'Content-Type':'application/json'}});
};
