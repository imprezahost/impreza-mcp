import assert from 'node:assert/strict';
const upstream=globalThis.fetch;
const mapped=process.env.F41_BOUNDARY_HTTP_URL;
assert.match(mapped,/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/);
globalThis.fetch=async(input,init)=>{
 const original=new URL(typeof input==='string'||input instanceof URL?input:input.url);
 assert.equal(original.origin,'https://audit-boundary.invalid');
 assert.equal(original.pathname,'/v1/audit/privileged');
 const target=new URL(original.pathname+original.search,mapped);
 return upstream(target,init);
};