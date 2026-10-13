import {pathToFileURL,fileURLToPath} from 'node:url';
import {writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const root=process.env.SEGMENTS_MCP_ROOT||fileURLToPath(new URL('../',import.meta.url)), deps=process.env.SEGMENTS_DEP_ROOT||root;
const {Client}=await import(pathToFileURL(deps+'/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js'));
const {StdioClientTransport}=await import(pathToFileURL(deps+'/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js'));
const transport=new StdioClientTransport({command:process.execPath,args:['--import',pathToFileURL(root+'/tests/fixtures/vps-offer-fetch.mjs').href,root+'/dist/server.js'],env:{...process.env,IMPREZA_BASE_URL:'https://vps-offer.invalid',IMPREZA_API_KEY:randomBytes(24).toString('hex'),IMPREZA_API_SECRET:randomBytes(32).toString('hex')}});
const c=new Client({name:'segments-legacy-compatibility',version:'1'}),rows=[];
try{await c.connect(transport);
for(const [name,args,path] of [['impreza_list_tasks',{deployment_id:''},'/v1/tasks'],['impreza_list_backups',{deployment_id:''},'/v1/backups']]){
 const r=await c.callTool({name,arguments:args});const data=r.isError?null:JSON.parse(r.content[0].text);
 rows.push({tool:name,case:'empty optional filter',pass:!r.isError&&data.path===path&&Object.keys(data.query).length===0});
}
const r=await c.callTool({name:'impreza_create_task',arguments:{deployment_id:'  ',name:'blank app'}});
rows.push({tool:'impreza_create_task',case:'legacy required-ID error text',pass:r.isError===true&&/deployment_id is required/.test(r.content[0].text)});
const report={total:rows.length,passed:rows.filter(x=>x.pass).length,results:rows};if(process.env.SEGMENTS_REPORT)writeFileSync(process.env.SEGMENTS_REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));process.exitCode=report.passed===report.total?0:1;
}finally{await c.close();}
