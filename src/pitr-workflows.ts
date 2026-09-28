import {z} from 'zod';
import type {ImprezaClient} from './client.js';

const deployment = z.string().regex(/^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\s\S])/);
const plan = z.string().regex(/^ppl_[a-f0-9]{24}$(?![\s\S])/);
const utc = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$(?![\s\S])/)
  .refine(v => { const n = Date.parse(v); return Number.isFinite(n) && new Date(n).toISOString() === v.replace('Z', '.000Z'); }, 'Use a valid UTC instant');
const schemas: Record<string,z.ZodTypeAny> = {
  impreza_get_pitr: z.object({deployment_id:deployment}).strict(),
  impreza_configure_pitr: z.object({deployment_id:deployment,enabled:z.boolean(),drain_minutes:z.number().int().min(5).max(60).optional(),keep_bases:z.number().int().min(1).max(7).optional()}).strict(),
  impreza_drill_pitr: z.object({deployment_id:deployment}).strict(),
  impreza_prepare_pitr_restore: z.object({deployment_id:deployment,target_time:utc,target_binding_id:z.string().regex(/^bnd_[a-f0-9]{24}$(?![\s\S])/).optional()}).strict(),
  impreza_get_pitr_restore: z.object({pitr_plan_id:plan}).strict(),
  impreza_apply_pitr_restore: z.object({pitr_plan_id:plan,review_digest:z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/),confirm:z.literal(true)}).strict(),
};
const depProperty = {type:'string',pattern:'^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$',description:'The managed PostgreSQL provider deployment, not the consuming app.'};
const planProperty = {type:'string',pattern:'^ppl_[a-f0-9]{24}$'};
const specs = [
  ['impreza_get_pitr','Read point-in-time recovery','Read PostgreSQL PITR status, stored bases, recoverable boundary and latest drill. Read scope. No changes. A configured interval is not a guarantee of zero data loss.',{deployment_id:depProperty},['deployment_id'],true,false],
  ['impreza_configure_pitr','Configure point-in-time recovery','Enable or disable PostgreSQL PITR on a managed provider. Deploy scope. Enabling creates a replication slot and stores base backups/WAL in the account bucket; storage usage increases. Disabling stops protection and drops the slot but retains stored objects. A stopped shipper can retain WAL on the server. No restore or traffic cutover.',{deployment_id:depProperty,enabled:{type:'boolean'},drain_minutes:{type:'integer',minimum:5,maximum:60},keep_bases:{type:'integer',minimum:1,maximum:7}},['deployment_id','enabled'],false,true],
  ['impreza_drill_pitr','Test point-in-time recovery','Queue a PostgreSQL physical recovery drill using the latest shipped WAL. Deploy scope. Creates temporary recovery resources; does not replace the live database or switch traffic. Read status until the drill is verified. A cluster drill is not validation of every application record.',{deployment_id:depProperty},['deployment_id'],false,false],
  ['impreza_prepare_pitr_restore','Review point-in-time restore','Prepare a 15-minute review for a UTC point-in-time restore into a NEW database, using the current storage generation. Deploy scope. Does not queue recovery or switch traffic. Review the source, target, available WAL range and digest before applying. Optional target_binding_id selects an eligible binding.',{deployment_id:depProperty,target_time:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'},target_binding_id:{type:'string',pattern:'^bnd_[a-f0-9]{24}$'}},['deployment_id','target_time'],false,false],
  ['impreza_get_pitr_restore','Read point-in-time restore review','Read a PITR restore review and its saved receipt. Read scope. Accepted means queued, not recovered or verified. Follow receipt.phase to verified or failed before using the new database.',{pitr_plan_id:planProperty},['pitr_plan_id'],true,false],
  ['impreza_apply_pitr_restore','Apply point-in-time restore','Apply the exact reviewed PITR restore with user confirmation, confirm=true and the review_digest. Deploy scope. Queues recovery into a NEW database, preserving the serving database and traffic. Repeating the accepted plan returns its receipt; acceptance is not verified completion.',{pitr_plan_id:planProperty,review_digest:{type:'string',pattern:'^[a-f0-9]{64}$'},confirm:{type:'boolean',const:true}},['pitr_plan_id','review_digest','confirm'],false,false],
] as const;
export const PITR_TOOLS = specs.map(([name,title,description,properties,required,readOnlyHint,destructiveHint]) => ({
  name,title,description:description+' Hosted MCP requires an account credential without resource confinement.',inputSchema:{type:'object' as const,properties,required:[...required],additionalProperties:false},
  annotations:{readOnlyHint,destructiveHint,openWorldHint:true,...(readOnlyHint?{}:{idempotentHint:name==='impreza_apply_pitr_restore'})},
}));
const routes: Record<string,[string,string]> = {
  impreza_get_pitr:['GET','/v1/platform/deployments/{deployment_id}/pitr'],
  impreza_configure_pitr:['POST','/v1/platform/deployments/{deployment_id}/pitr'],
  impreza_drill_pitr:['POST','/v1/platform/deployments/{deployment_id}/pitr/drill'],
  impreza_prepare_pitr_restore:['POST','/v1/platform/deployments/{deployment_id}/prepare-pitr-restore'],
  impreza_get_pitr_restore:['GET','/v1/pitr-restores/{pitr_plan_id}'],
  impreza_apply_pitr_restore:['POST','/v1/pitr-restores/{pitr_plan_id}/apply'],
};
export function isPitrTool(name:string): boolean {return Object.hasOwn(routes,name);}
export async function callPitrTool(client:ImprezaClient,name:string,args:Record<string,unknown>):Promise<unknown> {
  const route=routes[name],schema=schemas[name];
  if(!route || !schema) throw new Error('Unknown recovery workflow');
  const body=schema.parse(args) as Record<string,unknown>;
  const path=route[1].replace(/\{([a-z_]+)\}/g,(_:string,key:string)=>{const value=body[key];delete body[key];return encodeURIComponent(String(value));});
  return route[0]==='GET'?client.get(path):client.post(path,body);
}
