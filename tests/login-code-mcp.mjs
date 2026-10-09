import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,statSync,symlinkSync,linkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=mkdtempSync(path.join(tmpdir(),'impreza-login-'));
const started=Date.now();
const server=process.env.IMPREZA_LOGIN_SERVER || fileURLToPath(new URL('../dist/server.js',import.meta.url));
const preload=new URL('./fixtures/pairing-fetch.mjs',import.meta.url).href;
const fixture={code:'pair_'+randomBytes(16).toString('hex'),api_key:'imp_'+randomBytes(20).toString('hex'),api_secret:randomBytes(32).toString('hex'),expires_at:new Date(Date.now()+86400000).toISOString()};
let checks=0;
function testHome(name,mode='ok') {
 const home=path.join(root,name);mkdirSync(home);
 const config=path.join(home,'fixture.json'),requests=path.join(home,'requests.jsonl');
 writeFileSync(config,JSON.stringify({...fixture,mode}));
 const env={...process.env,HOME:home,USERPROFILE:home,PAIRING_FIXTURE:config,PAIRING_REQUESTS:requests,IMPREZA_BASE_URL:'https://pairing-fixture.invalid'};
 for(const key of ['IMPREZA_API_KEY','IMPREZA_API_SECRET','IMPREZA_PROXY']) delete env[key];
 return {home,env,file:path.join(home,'.impreza','credentials.json'),requests};
}
function run(h,args=['login','--code',fixture.code]) {
 const result=spawnSync(process.execPath,['--import',preload,server,...args],{env:h.env,encoding:'utf8',timeout:25000,windowsHide:true});
 const output=(result.stdout||'')+(result.stderr||'');
 for(const value of [fixture.code,fixture.api_key,fixture.api_secret]) assert(!output.includes(value),'CLI exposed a fixture credential or code');
 assert(!result.error,'CLI did not finish');checks++;return result;
}
const requests=h=>existsSync(h.requests)?readFileSync(h.requests,'utf8').trim().split('\n').filter(Boolean).map(x=>JSON.parse(x)):[];
try {
 const h=testHome('positive');assert.equal(run(h).status,0,'real CLI must implement login --code');
 const saved=JSON.parse(readFileSync(h.file,'utf8'));
 assert.equal(saved.api_key,fixture.api_key);assert.equal(saved.api_secret,fixture.api_secret);
 assert.deepEqual(saved.scopes,['read']);assert.equal(saved.base_url,'https://pairing-fixture.invalid');
 assert.equal(saved.proxy,undefined,'remote response must not select a local proxy');checks++;
 assert(!JSON.stringify(saved).includes(fixture.code),'one-time code was persisted');
 if(process.platform!=='win32'){assert.equal(statSync(h.file).mode&0o777,0o600);assert.equal(statSync(path.dirname(h.file)).mode&0o777,0o700);}
 else {
  const script="$s=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value; foreach($p in @($env:PAIRING_PRIVATE_FILE,[IO.Path]::GetDirectoryName($env:PAIRING_PRIVATE_FILE))){if([IO.File]::Exists($p)){$a=[IO.File]::GetAccessControl($p)}else{$a=[IO.Directory]::GetAccessControl($p)};if(-not $a.AreAccessRulesProtected){exit 1};foreach($r in $a.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])){if($r.IdentityReference.Value -ne $s -or $r.IsInherited){exit 1}}}";
  const acl=spawnSync(path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-Command',script],{env:{...process.env,PAIRING_PRIVATE_FILE:h.file},stdio:'ignore',timeout:15000});
  assert.equal(acl.status,0,'saved file and directory must have owner-only protected ACLs');checks++;
 }
 assert.deepEqual(requests(h),[{path:'/v1/mcp/pair',method:'POST',redirect:'manual',anonymous:true,expectedCredential:false,expectedCode:true}]);
 const old=readFileSync(h.file);assert.notEqual(run(h).status,0);assert.deepEqual(readFileSync(h.file),old);assert.equal(requests(h).length,1,'existing file must block redemption');
 const client=new Client({name:'login-contract',version:'1'});
 const transport=new StdioClientTransport({command:process.execPath,args:['--import',preload,server],env:h.env,stderr:'pipe'});
 let stderr='';transport.stderr?.on('data',chunk=>{stderr+=String(chunk);});
 try{await client.connect(transport);assert((await client.listTools()).tools.length>0);await client.callTool({name:'impreza_list_servers',arguments:{}});}
 finally{await client.close();}
 for(const secret of [fixture.api_key,fixture.api_secret,fixture.code])assert(!stderr.includes(secret));
 const authenticated=requests(h).filter(x=>x.path!=='/v1/mcp/pair');assert(authenticated.length>0);assert(authenticated.every(x=>x.expectedCredential));checks++;
 for(const suffix of ['/v1','/v1/']) {
  const normalized={...h,env:{...h.env,IMPREZA_BASE_URL:'https://pairing-fixture.invalid'+suffix}};
  assert.equal(run(normalized,[]).status,0,'paired API /v1 alias must boot the real server');
 }
 const changedPath={...h,env:{...h.env,IMPREZA_BASE_URL:'https://pairing-fixture.invalid/unexpected'}};
 assert.notEqual(run(changedPath,[]).status,0,'unrecognized API path must not reuse a saved credential');
 const help=run(h,['--help']);assert.equal(help.status,0);assert(help.stdout.includes('Uses paired credentials or'));
 for(const args of [[],['--code'],['--code',fixture.code,'--unknown'],['--code',fixture.code+'\n'],['--unknown',fixture.code]]){
  const bad=testHome('args-'+checks);assert.notEqual(run(bad,['login',...args]).status,0);assert.equal(requests(bad).length,0);assert(!existsSync(bad.file));
 }
 for(const mode of ['refused','redirect','network','invalid','oversized','expired','write-failure','sync-failure']){
  const bad=testHome(mode,mode);assert.notEqual(run(bad).status,0);assert(!existsSync(bad.file));assert.equal(requests(bad).length,1);
 }
 const plaintext=testHome('plaintext');plaintext.env.IMPREZA_BASE_URL='http://pairing-fixture.invalid';assert.notEqual(run(plaintext).status,0);assert.equal(requests(plaintext).length,0);
 const onion=testHome('onion');onion.env.IMPREZA_BASE_URL='http://'+'a'.repeat(56)+'.onion';assert.notEqual(run(onion).status,0);assert.equal(requests(onion).length,0);
 const symlink=testHome('symlink');const target=path.join(root,'target');mkdirSync(target);symlinkSync(target,path.join(symlink.home,'.impreza'),process.platform==='win32'?'junction':'dir');assert.notEqual(run(symlink).status,0);assert.equal(requests(symlink).length,0);assert(!existsSync(path.join(target,'credentials.json')));
 const partial=testHome('partial');partial.env.IMPREZA_API_KEY=fixture.api_key;assert.notEqual(run(partial,[]).status,0);assert.equal(requests(partial).length,0);
 const savedPartial={...h,env:{...h.env,IMPREZA_API_KEY:fixture.api_key}};const previous=requests(h).length;assert.notEqual(run(savedPartial,[]).status,0);assert.equal(requests(h).length,previous,'partial env must not use saved secret');
 const changed={...h,env:{...h.env,IMPREZA_BASE_URL:'https://other.invalid'}};assert.notEqual(run(changed,[]).status,0);assert.equal(requests(h).filter(x=>x.path==='/v1/mcp/pair').length,1);
 const corrupt=testHome('corrupt');assert.equal(run(corrupt).status,0);writeFileSync(corrupt.file,'{"api_secret":"'+fixture.api_secret+'"}');assert.notEqual(run(corrupt,[]).status,0);
 const overridden={...corrupt,env:{...corrupt.env,IMPREZA_API_KEY:fixture.api_key,IMPREZA_API_SECRET:fixture.api_secret}};assert.equal(run(overridden,[]).status,0,'complete env credentials take precedence over corrupt saved storage');
 const hardlink=testHome('hardlink');assert.equal(run(hardlink).status,0);linkSync(hardlink.file,path.join(hardlink.home,'another-file'));assert.notEqual(run(hardlink,[]).status,0);
 const race=testHome('race');
 const concurrently=()=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['--import',preload,server,'login','--code',fixture.code],{env:race.env,windowsHide:true,timeout:25000});
  let output='';child.stdout.on('data',x=>output+=String(x));child.stderr.on('data',x=>output+=String(x));
  child.on('error',reject);child.on('exit',status=>{for(const secret of [fixture.code,fixture.api_key,fixture.api_secret])assert(!output.includes(secret));resolve(status);});
 });
 const statuses=await Promise.all([concurrently(),concurrently()]);assert.deepEqual(statuses.sort(),[0,2]);assert.equal(requests(race).length,1,'concurrent login must redeem only once');assert.equal(JSON.parse(readFileSync(race.file,'utf8')).api_key,fixture.api_key);checks++;
 console.log('PASS: '+checks+' real CLI/stdio login checks in '+((Date.now()-started)/1000).toFixed(1)+'s; private saved credentials, anonymous single exchange, no secret output, isolated negative destinations and storage.');
} finally {
 // Unlink the test junction before removing the disposable home (never traverse its target).
 const junction=path.join(root,'symlink','.impreza');
 if(existsSync(junction)) rmSync(junction,{recursive:false,force:true});
 rmSync(root,{recursive:true,force:true});
}
