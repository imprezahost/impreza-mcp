// Host-plan composition for the identity operations. No generated
// schema file or product version is overwritten; gate-independent finite surface.
import {createHash} from 'node:crypto';
export const identityOperations=['identity.ops.create','identity.ops.remove','identity.ops.add-key','identity.ops.revoke-key','identity.ops.sudo-read','identity.ops.sudo-none'] as const;
// The reload and unit plan schemas are the canonical ones (output schemas and
// managed-unit-schema.ts); this module only adds the identity plan to the anyOf they produce.
const identitySchema:Record<string,unknown>={
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "plan_id": {
      "type": "string",
      "pattern": "^hpl_[a-f0-9]{32}$"
    },
    "operation": {
      "type": "string",
      "enum": [
        "identity.ops.create",
        "identity.ops.remove",
        "identity.ops.add-key",
        "identity.ops.revoke-key",
        "identity.ops.sudo-read",
        "identity.ops.sudo-none"
      ]
    },
    "service_id": {
      "type": "integer"
    },
    "plan_digest": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "approval_id": {
      "type": "string",
      "pattern": "^apr_[a-f0-9]{32}$"
    },
    "status": {
      "type": "string",
      "enum": [
        "prepared",
        "dispatching",
        "submitted",
        "partial",
        "completed",
        "failed",
        "expired",
        "refused",
        "uncertain",
        "released"
      ]
    },
    "created_at": {
      "type": "string"
    },
    "expires_at": {
      "type": "string"
    },
    "note": {
      "type": "string"
    },
    "preview": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "operation",
        "unit",
        "possible_connection_loss",
        "restart_fallback",
        "packages",
        "reboot",
        "health_scope",
        "profile",
        "compensation",
        "before",
        "after",
        "uid",
        "gid",
        "fingerprint"
      ],
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "identity.ops.create",
            "identity.ops.remove",
            "identity.ops.add-key",
            "identity.ops.revoke-key",
            "identity.ops.sudo-read",
            "identity.ops.sudo-none"
          ]
        },
        "unit": {
          "const": "impreza-ops"
        },
        "possible_connection_loss": {
          "const": true
        },
        "restart_fallback": {
          "const": false
        },
        "packages": {
          "type": "array",
          "maxItems": 0
        },
        "reboot": {
          "const": false
        },
        "health_scope": {
          "const": "account_files_not_live_login"
        },
        "profile": {
          "const": "ops-ubuntu2404-v1"
        },
        "compensation": {
          "const": "reconcile_then_new_independent_plan_no_data_deletion"
        },
        "before": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "present",
            "home",
            "group",
            "keys",
            "sudo"
          ],
          "properties": {
            "present": {
              "type": "boolean"
            },
            "home": {
              "type": "boolean"
            },
            "group": {
              "type": "boolean"
            },
            "keys": {
              "type": "array",
              "maxItems": 32,
              "items": {
                "type": "string",
                "pattern": "^[a-f0-9]{64}$"
              }
            },
            "sudo": {
              "type": "string",
              "enum": [
                "none",
                "redis-status"
              ]
            }
          }
        },
        "after": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "present",
            "home",
            "group",
            "keys",
            "sudo"
          ],
          "properties": {
            "present": {
              "type": "boolean"
            },
            "home": {
              "type": "boolean"
            },
            "group": {
              "type": "boolean"
            },
            "keys": {
              "type": "array",
              "maxItems": 32,
              "items": {
                "type": "string",
                "pattern": "^[a-f0-9]{64}$"
              }
            },
            "sudo": {
              "type": "string",
              "enum": [
                "none",
                "redis-status"
              ]
            }
          }
        },
        "uid": {
          "const": 65001
        },
        "gid": {
          "const": 65001
        },
        "fingerprint": {
          "type": [
            "string",
            "null"
          ],
          "pattern": "^[a-f0-9]{64}$"
        }
      }
    },
    "affected_count": {
      "type": "integer",
      "minimum": 0,
      "maximum": 32
    },
    "affected_refs": {
      "type": "array",
      "maxItems": 32,
      "items": {
        "type": "string",
        "pattern": "^[a-f0-9]{64}$"
      }
    },
    "agent_ref": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    }
  },
  "required": [
    "plan_id",
    "operation",
    "service_id",
    "plan_digest",
    "approval_id",
    "status",
    "created_at",
    "expires_at",
    "note",
    "preview",
    "affected_count",
    "affected_refs",
    "agent_ref"
  ]
};
export function withIdentitySchemas(base:Readonly<Record<string,Record<string,unknown>>>):Readonly<Record<string,Record<string,unknown>>>{
 const out={...base};
 for(const name of ['impreza_prepare_host_plan','impreza_get_host_plan','impreza_apply_host_plan']){
  const current=base[name];if(!current)continue;
  const anyOf=Array.isArray(current.anyOf)?current.anyOf:[current];
  out[name]={type:'object',anyOf:[...anyOf,identitySchema]};
 }
 if(base.impreza_host_permissions){const extend=(n:unknown):unknown=>{if(Array.isArray(n))return n.map(extend);if(n&&typeof n==='object'){const v=n as Record<string,unknown>;const o=Object.fromEntries(Object.entries(v).map(([k,value])=>[k,extend(value)]));if(Array.isArray(v.enum)&&v.enum.includes('managed_service.reload')&&!v.enum.includes(identityOperations[0]))o.enum=[...v.enum,...identityOperations];return o;}return n;};out.impreza_host_permissions=extend(base.impreza_host_permissions) as Record<string,unknown>;}
 return out;
}
export function identityInputAllowed(args:Record<string,unknown>):boolean{
 if(!identityOperations.includes(args.operation as typeof identityOperations[number]))return false;
 const op=args.operation;
 if(op==='identity.ops.add-key'){
  if(typeof args.public_key!=='string'||args.public_key.length>128)return false;
  const m=/^ssh-ed25519 ([A-Za-z0-9+/]+={0,2})$/.exec(args.public_key);if(!m?.[1])return false;
  const raw=Buffer.from(m[1],'base64');if(raw.length!==51||raw.toString('base64')!==m[1]||raw.readUInt32BE(0)!==11||raw.subarray(4,15).toString()!=='ssh-ed25519'||raw.readUInt32BE(15)!==32)return false;
  const fp=createHash('sha256').update(raw).digest('hex');if(args.fingerprint!==undefined&&args.fingerprint!==fp)return false;
 }else if(args.public_key!==undefined)return false;
 if(op==='identity.ops.revoke-key')return typeof args.fingerprint==='string'&&/^[a-f0-9]{64}$/.test(args.fingerprint);
 if(op!=='identity.ops.add-key'&&args.fingerprint!==undefined)return false;
 return true;
}
