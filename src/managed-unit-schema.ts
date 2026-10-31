// Handwritten unit-operation schema; independent of release gates. Keep the
// literal equal to the hosted connector's unit plan schema.
export const unitOperations = ['unit.redis.status','unit.redis.start','unit.redis.stop','unit.redis.restart','unit.redis.reload'] as const;
const planSchema: Record<string, unknown> = {
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
        "unit.redis.status",
        "unit.redis.start",
        "unit.redis.stop",
        "unit.redis.restart",
        "unit.redis.reload"
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
        "prior_state",
        "compensation"
      ],
      "properties": {
        "operation": {
          "type": "string",
          "enum": [
            "unit.redis.status",
            "unit.redis.start",
            "unit.redis.stop",
            "unit.redis.restart",
            "unit.redis.reload"
          ]
        },
        "unit": {
          "const": "redis-server.service"
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
          "const": "unit_state_and_local_coverage_not_client_reachability"
        },
        "profile": {
          "const": "cache-redis-ubuntu2404-v1"
        },
        "prior_state": {
          "enum": [
            "active",
            "inactive"
          ]
        },
        "compensation": {
          "const": "new_independently_approved_plan_after_reconciliation"
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
export function withUnitSchemas(base: Readonly<Record<string, Record<string, unknown>>>): Readonly<Record<string, Record<string, unknown>>> {
 const out = {...base};
 for (const name of ['impreza_prepare_host_plan','impreza_get_host_plan','impreza_apply_host_plan']) {
  if (base[name]) out[name] = {type:'object', anyOf:[base[name],planSchema]};
 }
 if(base.impreza_host_permissions) {
  const extend=(node: unknown): unknown => {
   if(Array.isArray(node)) return node.map(extend);
   if(node && typeof node==='object') {
    const v=node as Record<string,unknown>;const mapped=Object.fromEntries(Object.entries(v).map(([k,value])=>[k,extend(value)]));
    if(Array.isArray(v.enum)&&v.enum.includes('managed_service.reload')) mapped.enum=[...v.enum,...unitOperations];return mapped;
   }return node;
  };
  out.impreza_host_permissions=extend(base.impreza_host_permissions) as Record<string,unknown>;
 }
 return out;
}
