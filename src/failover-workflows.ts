import {z} from 'zod';
import type {ImprezaClient} from './client.js';

const deployment=z.string().regex(/^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\s\S])/);
const cutover=z.string().regex(/^fov_[a-f0-9]{24}$(?![\s\S])/);
const failback=z.string().regex(/^fbk_[a-f0-9]{24}$(?![\s\S])/);
const drill=z.string().regex(/^fdr_[a-f0-9]{24}$(?![\s\S])/);
const backup=z.string().regex(/^bkp_[a-f0-9]{16}$(?![\s\S])/);
const command=z.string().regex(/^cmd_[a-f0-9]{16,32}$(?![\s\S])/);
const digest=z.string().regex(/^[a-f0-9]{64}$(?![\s\S])/);
const confirmation={cutover_id:cutover,review_digest:digest,confirm:z.literal(true)};
const agent=z.string().regex(/^agt_[a-f0-9]{16,32}$(?![\s\S])/);
const countries=new Set('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' '));
const schemas:Record<string,z.ZodTypeAny>={
 impreza_challenge_failover_domain:z.object({deployment_id:deployment}).strict(),
 impreza_verify_failover_domain:z.object({deployment_id:deployment,challenge_id:z.string().regex(/^fdc_[a-f0-9]{24}$/)}).strict(),
 impreza_get_failover_domain:z.object({deployment_id:deployment}).strict(),
 impreza_declare_external_failover_country:z.object({agent_id:agent,country_code:z.string().refine(v=>countries.has(v),'Use a valid ISO country code')}).strict(),
 impreza_pair_failover_standby:z.object({deployment_id:deployment,target_deployment_id:deployment,mode:z.literal('cold')}).strict().refine(v=>v.deployment_id!==v.target_deployment_id,'Choose a different standby deployment'),
 impreza_get_failover_standby:z.object({deployment_id:deployment}).strict(),
 impreza_confirm_failover_sync:z.object({deployment_id:deployment,backup_id:backup,restore_id:backup,deploy_command_id:command}).strict(),
 impreza_prepare_failover:z.object({deployment_id:deployment}).strict(),
 impreza_get_failover:z.object({cutover_id:cutover}).strict(),
 impreza_apply_failover:z.object(confirmation).strict(),
 impreza_retry_failover_activation:z.object(confirmation).strict(),
 impreza_prepare_failback:z.object({cutover_id:cutover}).strict(),
 impreza_get_failback:z.object({failback_id:failback}).strict(),
 impreza_apply_failback:z.object({failback_id:failback,review_digest:digest,confirm:z.literal(true)}).strict(),
 impreza_set_failover_drill_policy:z.object({deployment_id:deployment,interval_minutes:z.union([z.number().int().min(60).max(10080),z.null()])}).strict(),
 impreza_run_failover_drill:z.object({deployment_id:deployment}).strict(),
 impreza_get_failover_drill:z.object({drill_id:drill}).strict(),
};
const dep={type:'string',pattern:'^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$'};
const fov={type:'string',pattern:'^fov_[a-f0-9]{24}$'};
const bkp={type:'string',pattern:'^bkp_[a-f0-9]{16}$'};
const fbk={type:'string',pattern:'^fbk_[a-f0-9]{24}$'};
const fdr={type:'string',pattern:'^fdr_[a-f0-9]{24}$'};
const apply={cutover_id:fov,review_digest:{type:'string',pattern:'^[a-f0-9]{64}$'},confirm:{type:'boolean',const:true}};
const specs=[
 ['impreza_declare_external_failover_country','Declare an external server country','Record your declared country for an online external agent before pairing. Country declared by you, not verified by Impreza. A changed agent IP requires a new declaration. Deploy scope.',{agent_id:{type:'string',pattern:'^agt_[a-f0-9]{16,32}$'},country_code:{type:'string',pattern:'^[A-Z]{2}$'}},['agent_id','country_code'],false,false,true],
 ['impreza_pair_failover_standby','Pair a cold standby','Pair two existing compatible apps on this account in different reported countries. Managed countries come from internal inventory; an external country is declared by the customer and is not verified by Impreza. Deploy scope. Does not provision servers, copy data or switch traffic. First create the reviewed catalog standby with impreza_deploy_catalog_app and standby:true, without domain or onion. The standby must have no public route or onion. Failover moves only a hostname in the managed zone or a public .onion: custom domains, private onion services, database bindings and dedicated servers are not supported.',{deployment_id:dep,target_deployment_id:dep,mode:{type:'string',enum:['cold']}},['deployment_id','target_deployment_id','mode'],false,false,false],
 ['impreza_get_failover_standby','Read a standby pair','Read the standby and its saved sync receipt. Read scope. A ready label is revalidated before cutover.',{deployment_id:dep},['deployment_id'],true,false,true],
 ['impreza_confirm_failover_sync','Verify a cold standby copy','Verify the exact completed source backup, target restore and healthy redeploy caused by that restore. Manage scope. Does not copy data or activate traffic. Unrelated, stale or cross-account receipts are refused.',{deployment_id:dep,backup_id:bkp,restore_id:bkp,deploy_command_id:{type:'string',pattern:'^cmd_[a-f0-9]{16,32}$'}},['deployment_id','backup_id','restore_id','deploy_command_id'],false,false,true],
 ['impreza_prepare_failover','Review a cold failover','Create a 15-minute review for a planned failover. Deploy scope. Does not stop apps or switch traffic. Inspect source, target, hostname, countries, backup age and interruption risk before asking the user to confirm. Backup age is not a promise of zero loss.',{deployment_id:dep},['deployment_id'],false,false,false],
 ['impreza_get_failover','Read a failover receipt','Read a reviewed failover and its saved progress receipt. Read scope. Accepted or activating is not verified completion; retain the cutover_id and read until verified or actionable failure.',{cutover_id:fov},['cutover_id'],true,false,true],
 ['impreza_apply_failover','Apply a reviewed failover','After explicit user confirmation, submit confirm=true and the exact review_digest. Manage scope. Stops and fences the source writer, transfers the managed hostname and activates the restored standby; a public onion is sealed to the standby, published there and its old copy purged. Interrupts traffic and may lose changes since the copied backup. Acceptance only queues work; read the receipt to verify. Repeating the same accepted review returns its receipt.',apply,['cutover_id','review_digest','confirm'],false,true,true],
 ['impreza_retry_failover_activation','Retry reviewed target activation','Retry a failed target activation only after reviewing the existing failover receipt and obtaining explicit user confirmation. Manage scope. Requires the original digest and confirm=true; retries are bounded and revalidate ownership, route and DNS. Does not undo the source fence or create a new failover.',apply,['cutover_id','review_digest','confirm'],false,true,false],
 ['impreza_prepare_failback','Review a failback','Create a 15-minute review to fail back a verified cutover. Deploy scope. Does not start apps, copy data or switch traffic. The review lifts only the old primary fence and then makes the old primary the cold standby of the current one; the way back is an ordinary backup, restore, sync confirmation and reviewed cutover.',{cutover_id:fov},['cutover_id'],false,false,false],
 ['impreza_get_failback','Read a failback receipt','Read a failback review and its receipt. Read scope. Releasing is not completion; retain the failback_id and read until inverted or an actionable failure.',{failback_id:fbk},['failback_id'],true,false,true],
 ['impreza_apply_failback','Apply a reviewed failback','After explicit user confirmation, submit confirm=true and the exact review_digest. Manage scope. The old host releases exactly the fence of the verified cutover; its app stays stopped and unrouted, and the pair is inverted so the old primary becomes an unprovisioned standby. Moves no traffic. Next, back up the current primary, restore that backup into the old one, confirm the sync and review the return cutover. Repeating the same accepted review returns its receipt.',{failback_id:fbk,review_digest:{type:'string',pattern:'^[a-f0-9]{64}$'},confirm:{type:'boolean',const:true}},['failback_id','review_digest','confirm'],false,true,true],
 ['impreza_set_failover_drill_policy','Schedule standby drills','Set how often the cold standby is re-copied and verified, from 60 to 10080 minutes, or null to stop. Manage scope. Each drill backs up the primary, restores that copy over the standby in its country, waits for a healthy redeploy and records the verified copy; it never switches traffic. The first drill is one interval away.',{deployment_id:dep,interval_minutes:{type:['integer','null'],minimum:60,maximum:10080}},['deployment_id','interval_minutes'],false,true,true],
 ['impreza_run_failover_drill','Run a standby drill now','Start a drill of the cold standby now. Manage scope. It backs up the primary, restores that copy over the standby, waits for the healthy redeploy the restore causes and records the verified copy with measured durations. The standby data is replaced; the primary is only read and no traffic moves. Read the drill until verified or failed.',{deployment_id:dep},['deployment_id'],false,true,false],
 ['impreza_get_failover_drill','Read a standby drill','Read a standby drill, its current step and, when verified, the exact receipts and measured durations. Read scope. Durations describe that drill, not a recovery promise.',{drill_id:fdr},['drill_id'],true,false,true],
] as const;
const V1_FAILOVER_TOOLS=specs.map(([name,title,description,properties,required,readOnlyHint,destructiveHint,idempotentHint])=>({
 name,title,description:description+' Hosted MCP requires an account credential without resource confinement.',
 inputSchema:{type:'object' as const,properties,required:[...required],additionalProperties:false},
 annotations:{readOnlyHint,destructiveHint,openWorldHint:true,...(readOnlyHint?{}:{idempotentHint})},
}));
const customerDomainEnabled=process.env.IMPREZA_CUSTOMER_DOMAIN_FAILOVER==='1';
const customerDomainSpecs=[
 ['impreza_challenge_failover_domain','Request a hostname TXT challenge','Create a 15-minute account-bound, one-use TXT challenge for the customer hostname on this running app. Publish the returned TXT yourself. Impreza only queries DNS. Manage scope; account credential without confinement.',{deployment_id:dep},['deployment_id'],false],
 ['impreza_verify_failover_domain','Verify customer hostname ownership','Query the exact ownership TXT through Impreza local uncached Unbound. A successful challenge is consumed once; verification lasts 24 hours and TXT is checked again before pairing, review and cutover. Manage scope; account credential without confinement.',{deployment_id:dep,challenge_id:{type:'string',pattern:'^fdc_[a-f0-9]{24}$'}},['deployment_id','challenge_id'],false],
 ['impreza_get_failover_domain','Read customer hostname verification','Read the pending TXT challenge or saved ownership verification for this account app. This read does not prove current DNS freshness. Read scope; account credential without confinement.',{deployment_id:dep},['deployment_id'],true],
] as const;
export const CUSTOMER_DOMAIN_FAILOVER_TOOLS=customerDomainSpecs.map(([name,title,description,properties,required,readOnlyHint])=>({
 name,title,description,inputSchema:{type:'object' as const,properties,required:[...required],additionalProperties:false},
 annotations:{readOnlyHint,destructiveHint:false,...(!readOnlyHint?{idempotentHint:false}:{}),openWorldHint:true},
}));
export const FAILOVER_TOOLS=[...V1_FAILOVER_TOOLS,...(customerDomainEnabled?CUSTOMER_DOMAIN_FAILOVER_TOOLS:[])];
const customerDomainNames=new Set(CUSTOMER_DOMAIN_FAILOVER_TOOLS.map(t=>t.name));
const routes:Record<string,[string,string]>={
 impreza_challenge_failover_domain:['POST','/v1/platform/deployments/{deployment_id}/failover-domain/challenge'],
 impreza_verify_failover_domain:['POST','/v1/platform/deployments/{deployment_id}/failover-domain/verify'],
 impreza_get_failover_domain:['GET','/v1/platform/deployments/{deployment_id}/failover-domain'],
 impreza_declare_external_failover_country:['POST','/v1/platform/agents/{agent_id}/failover-jurisdiction'],
 impreza_pair_failover_standby:['POST','/v1/platform/deployments/custom/{deployment_id}/failover-standby'],
 impreza_get_failover_standby:['GET','/v1/platform/deployments/custom/{deployment_id}/failover-standby'],
 impreza_confirm_failover_sync:['POST','/v1/platform/deployments/custom/{deployment_id}/failover-standby/confirm-sync'],
 impreza_prepare_failover:['POST','/v1/platform/deployments/custom/{deployment_id}/prepare-failover'],
 impreza_get_failover:['GET','/v1/platform/failover-cutovers/{cutover_id}'],
 impreza_apply_failover:['POST','/v1/platform/failover-cutovers/{cutover_id}/apply'],
 impreza_retry_failover_activation:['POST','/v1/platform/failover-cutovers/{cutover_id}/retry-activation'],
 impreza_prepare_failback:['POST','/v1/platform/failover-cutovers/{cutover_id}/prepare-failback'],
 impreza_get_failback:['GET','/v1/platform/failover-failbacks/{failback_id}'],
 impreza_apply_failback:['POST','/v1/platform/failover-failbacks/{failback_id}/apply'],
 impreza_set_failover_drill_policy:['POST','/v1/platform/deployments/custom/{deployment_id}/failover-standby/drill-policy'],
 impreza_run_failover_drill:['POST','/v1/platform/deployments/custom/{deployment_id}/failover-standby/drills'],
 impreza_get_failover_drill:['GET','/v1/platform/failover-drills/{drill_id}'],
};
export function isFailoverTool(name:string):boolean{return Object.hasOwn(routes,name)&&(!customerDomainNames.has(name as never)||customerDomainEnabled);}
export async function callFailoverTool(client:ImprezaClient,name:string,args:Record<string,unknown>):Promise<unknown>{
 if(!isFailoverTool(name))throw new Error('Unknown failover workflow');
 const route=routes[name],schema=schemas[name];
 if(!route || !schema)throw new Error('Unknown failover workflow');
 const body=schema.parse(args) as Record<string,unknown>;
 const path=route[1].replace(/\{([a-z_]+)\}/g,(_:string,key:string)=>{const value=body[key];delete body[key];return encodeURIComponent(String(value));});
 return route[0]==='GET'?client.get(path):client.post(path,body);
}
