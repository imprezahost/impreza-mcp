import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {fileURLToPath} from 'node:url';
const preload = new URL('./fixtures/no-network.mjs', import.meta.url);
const transport=new StdioClientTransport({command:process.execPath,args:['--import',preload.href,fileURLToPath(new URL('../dist/server.js',import.meta.url))],env:{...process.env,IMPREZA_BASE_URL:'https://order-default.invalid',IMPREZA_API_KEY:randomBytes(24).toString('hex'),IMPREZA_API_SECRET:randomBytes(32).toString('hex')},stderr:'pipe'});
let childError='' ; transport.stderr?.on('data', c=>{childError+=c.toString()}); const client=new Client({name:'order-default-metadata',version:'1.0.0'});const checks=[];
function check(name,pass){checks.push({name,pass:!!pass});}
try{
 await client.connect(transport);const tools=(await client.listTools()).tools;
 for(const name of ['impreza_vps_offer','impreza_order_vps']){
  const t=tools.find(t=>t.name===name);check(name+' listed',!!t);
  const d=t?.inputSchema.properties?.app?.description??'';
  // 19/10: a VPS bought through the MCP defaults to the agent; 'none' stays the explicit bare OS.
  check(name+' agent default when omitted',/Omitted[^.]{0,20}: '@agent'/.test(d)&&!d.includes("'none' (default"));
  check(name+' bare OS stays explicit',d.includes("'none' for a bare OS"));
  check(name+' app remains optional',!t?.inputSchema.required?.includes('app'));
 }
 const d=tools.find(t=>t.name==='impreza_order_vps')?.description??'';
 check('order whole-tool description agent default',d.includes('defaults to app=@agent')&&d.includes('Pass app=none for a bare OS')&&!d.includes('auto-installed'));
 check('order whole-tool portal keeps bare default',d.includes('customer portal and cart keep a bare OS'));
 check('order whole-tool accepted is not ready',d.includes('not a ready agent')&&d.includes('impreza_list_servers'));
 check('order whole-tool install later',d.includes('impreza_install_agent')&&d.includes('confirmation'));
 check('bare service polling',d.includes('impreza_list_services'));
 const report={entry:'real SDK initialize -> stdio tools/list; network disabled',total:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,checks};
 if(process.env.ORDER_DEFAULT_REPORT)writeFileSync(process.env.ORDER_DEFAULT_REPORT,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));assert.equal(report.failed,0,'tool metadata differs from the order default');
}catch(e){ if(process.env.ORDER_DEFAULT_ERROR_LOG)writeFileSync(process.env.ORDER_DEFAULT_ERROR_LOG,childError); throw e; }finally{await client.close();}
