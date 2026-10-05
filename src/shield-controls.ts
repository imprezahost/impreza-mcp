import {isIP} from 'node:net';
import {z} from 'zod';

function cidrKey(raw:string):string|null {
 const match=/^([^/]+)\/([1-9][0-9]{0,2})$/.exec(raw);if(!match)return null;
 const address=match[1]!;const family=isIP(address),bits=Number(match[2]);if(!family)return null;
 if(bits<(family===4?16:48)||bits>(family===4?32:128))return null;
 let value:bigint;
 if(family===4){value=address.split('.').reduce((n,v)=>(n<<8n)|BigInt(v),0n);}
 else{
  if(address.includes('.')||address.includes('%'))return null;
  const halves=address.toLowerCase().split('::'),left=halves[0]?halves[0].split(':'):[],right=halves[1]?halves[1].split(':'):[];
  const groups=halves.length===2?[...left,...Array(8-left.length-right.length).fill('0'),...right]:left;
  value=groups.reduce((n,v)=>(n<<16n)|BigInt('0x'+v),0n);
  if((value>>32n)===0xffffn)return null; // IPv4-mapped IPv6 must use an IPv4 CIDR.
 }
 const host=BigInt((family===4?32:128)-bits);if((value>>host)<<host!==value)return null;
 return family+':'+value.toString(16)+'/'+bits;
}

export const shieldControlsInput=z.object({
 pow_paths:z.array(z.string().max(256).regex(/^\/[A-Za-z0-9/_.-]*$/)).max(10).refine(v=>new Set(v).size===v.length,'Duplicate PoW prefix').optional(),
 rate_limit_rpm:z.number().int().min(30).max(6000).nullable().optional(),
 pow_difficulty:z.number().int().min(2).max(4).nullable().optional(),
 trusted_sources:z.array(z.string().max(64)).max(10).refine(v=>v.every(s=>cidrKey(s)!==null)&&new Set(v.map(cidrKey)).size===v.length,'Invalid or duplicate trusted CIDR').optional(),
 under_attack:z.union([
  z.object({enabled:z.literal(true),duration_hours:z.number().int().min(1).max(24)}).strict(),
  z.object({enabled:z.literal(false)}).strict(),
 ]).optional(),
}).strict();
