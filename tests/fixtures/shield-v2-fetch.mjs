// Echo fetch for the Shield suites (impreza_set_shield, impreza_set_alert_rule):
// the tools they call declare no outputSchema, so each answer echoes the request
// {request_count, path, method, body} and the suites assert it. impreza_get_shield
// declares one, so GET .../shield answers a real controller answer from
// output-samples.json (the Shield v2 controls under attack); the SDK client validates it.
import {readFileSync} from 'node:fs';
const SAMPLES=JSON.parse(readFileSync(new URL('./output-samples.json',import.meta.url),'utf8'));
const SHIELD='impreza_get_shield:controls_under_attack';
if(!(SHIELD in SAMPLES))throw new Error('Missing output sample '+SHIELD);
let count=0;
globalThis.fetch=async(url,options)=>{
 const parsed=new URL(url);if(parsed.hostname!=='shield-fixture.invalid')throw new Error('Unexpected network destination');
 if(options.method==='GET'&&parsed.pathname==='/v1/entitlements')return new Response(JSON.stringify({success:true,data:{known:true,hidden:[]}}),{status:200});
 count++;
 const data=options.method==='GET'&&/^\/v1\/platform\/deployments\/[^/]+\/shield$/.test(parsed.pathname)
  ?structuredClone(SAMPLES[SHIELD])
  :{request_count:count,path:parsed.pathname,method:options.method,body:options.body?JSON.parse(options.body):null};
 return new Response(JSON.stringify({success:true,data}),{status:200,headers:{'content-type':'application/json'}});
};
