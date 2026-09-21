import {z} from 'zod';
import type {ImprezaClient} from './client.js';

export const CUSTOMER_TOOLS = [
  {
    "name": "impreza_export_app_config",
    "description": "Export one custom application as a versioned impreza.app.v1 config document: name, source (image, git or inline Dockerfile), environment variables with secrets as named references (never values), resource limits, domain and binding references. Read-only; changes nothing. Requires unrestricted account credentials and read scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "deployment_id": {
          "type": "string",
          "pattern": "^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$"
        }
      },
      "required": [
        "deployment_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": false
    },
    "title": "Export app config"
  },
  {
    "name": "impreza_prepare_config_apply",
    "description": "Prepare a 15-minute review applying a versioned impreza.app.v1 config document to a custom application. Returns a human-readable change list and a digest, never secret values: referenced secrets resolve server-side against the app's stored values and a reference to a missing name fails closed. Applying queues one in-place redeploy that preserves data. Requires unrestricted account credentials and deploy scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "deployment_id": {
          "type": "string",
          "pattern": "^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$"
        },
        "document": {
          "type": "string",
          "description": "The impreza.app.v1 document as a JSON string, e.g. from impreza_export_app_config."
        }
      },
      "required": [
        "deployment_id",
        "document"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    },
    "title": "Review config apply"
  },
  {
    "name": "impreza_get_config_plan",
    "description": "Read a saved config review and its accepted receipt without returning secret values. Accepted means queued, not applied or healthy. Requires unrestricted account credentials and read scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "config_plan_id": {
          "type": "string",
          "pattern": "^cplan_[a-f0-9]{24}$"
        }
      },
      "required": [
        "config_plan_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": false
    },
    "title": "Read config review"
  },
  {
    "name": "impreza_apply_config_plan",
    "description": "Apply the exact reviewed config change after user confirmation with confirm=true and review_digest. Updates variables, resource limits, image or git ref and queues at most one in-place redeploy that preserves volumes and data; a document that changes nothing queues nothing. Acceptance is not verified completion. Repeating the same plan returns its receipt without a second job. Requires unrestricted account credentials and deploy scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "config_plan_id": {
          "type": "string",
          "pattern": "^cplan_[a-f0-9]{24}$"
        },
        "review_digest": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "confirm": {
          "type": "boolean",
          "const": true
        }
      },
      "required": [
        "config_plan_id",
        "review_digest",
        "confirm"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    },
    "title": "Apply config review"
  },
  {
    "name": "impreza_app_metrics",
    "description": "Recent per-app metrics from its server: container state (running/restarting/exited), restart count, CPU percent, memory bytes against its limit, and volume bytes \u2014 minute-bucketed over the last 24 hours. The state \"unknown\" means the agent has not reported recently; unknown is never \"healthy\". Numbers only \u2014 the report the agent sends cannot carry configuration or secrets. Use it to see whether an app is actually alive and what it costs.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "deployment_id": {
          "type": "string",
          "description": "The application (dpl_...)."
        },
        "minutes": {
          "type": "number",
          "description": "How far back the series goes (5-1440, default 120)."
        }
      },
      "required": [
        "deployment_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": false
    },
    "title": "Read app metrics"
  },
  {
    "name": "impreza_list_alerts",
    "description": "Alert rules and fired alerts for an application: each rule's metric (down, restart_loop, memory_pct), threshold and window, and each alert with its status (open/resolved), when it fired and recovered, and the numeric evidence that crossed the threshold. Alerts deliver to the account's webhook as deployment.alert with bounded retry.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "deployment_id": {
          "type": "string",
          "description": "The application (dpl_...)."
        }
      },
      "required": [
        "deployment_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": false
    },
    "title": "List app alerts"
  },
  {
    "name": "impreza_set_alert_rule",
    "description": "Create or update an alert rule on an application. metric \"down\" fires when the app is not running (threshold is 1); \"restart_loop\" fires when restarts grow past threshold within the window; \"memory_pct\" fires when memory stays above threshold percent of its cgroup limit for the window. duration_minutes (1-60) is the consecutive-minutes window. An open rule fires once and closes with a note when the condition clears. Pass rule_id to update an existing rule. Requires deploy scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "deployment_id": {
          "type": "string",
          "description": "The application (dpl_...)."
        },
        "rule_id": {
          "type": "string",
          "description": "Existing rule to update (arl_...). Omit to create."
        },
        "metric": {
          "type": "string",
          "enum": [
            "down",
            "restart_loop",
            "memory_pct"
          ]
        },
        "threshold": {
          "type": "number",
          "description": "1 for down; restart count for restart_loop; percent 1-100 for memory_pct."
        },
        "duration_minutes": {
          "type": "number",
          "description": "Consecutive minutes the condition must hold (1-60, default 3)."
        },
        "enabled": {
          "type": "boolean",
          "description": "Default true."
        }
      },
      "required": [
        "deployment_id",
        "metric",
        "threshold"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "title": "Set alert rule"
  },
  {
    "name": "impreza_prepare_database_restore",
    "description": "Prepare a 15-minute reviewed restore of a completed backup's managed PostgreSQL or MariaDB dump into a NEW database on the original or an eligible target binding's provider of the same engine \u2014 the current database is never overwritten and nothing is cut over. Returns the review with source, target database and digest; preparing queues nothing. The binding must be healthy: a pending credential rotation or cleanup refuses the review. Requires deploy scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "backup_id": {
          "type": "string",
          "pattern": "^bkp_[a-f0-9]{16}$",
          "description": "The completed backup to restore, from impreza_list_backups."
        },
        "target_binding_id": {
          "type": "string",
          "pattern": "^bnd_[a-f0-9]{24}$",
          "description": "Optional. Restore through a different managed connection of the account (its provider, its owner) \u2014 the migration shape. Omit to use the connection the backup came from."
        }
      },
      "required": [
        "backup_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    },
    "title": "Review database restore"
  },
  {
    "name": "impreza_get_database_restore",
    "description": "Read a saved database restore review and its accepted receipt. Accepted means queued, not restored or verified. Requires read scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "restore_plan_id": {
          "type": "string",
          "pattern": "^rspl_[a-f0-9]{24}$"
        }
      },
      "required": [
        "restore_plan_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": false
    },
    "title": "Read restore review"
  },
  {
    "name": "impreza_apply_database_restore",
    "description": "Apply the exact reviewed database restore after user confirmation with confirm=true and review_digest. Queues one restore into the reviewed NEW database; the current one keeps serving and is never overwritten. Acceptance is not verified completion. Repeating the same plan returns its receipt without a second job. Requires deploy scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "restore_plan_id": {
          "type": "string",
          "pattern": "^rspl_[a-f0-9]{24}$"
        },
        "review_digest": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "confirm": {
          "type": "boolean",
          "const": true
        }
      },
      "required": [
        "restore_plan_id",
        "review_digest",
        "confirm"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    },
    "title": "Apply database restore"
  },
  {
    "name": "impreza_download_backup",
    "description": "Mint short-lived (5 minute) presigned download URLs for one completed backup \u2014 the manifest and each chunk \u2014 straight from the customer's own bucket. The URLs are a bearer capability over the app's full data until they expire; share them carefully. Nothing is proxied through the portal and no bucket credential is exposed. Requires read scope.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "backup_id": {
          "type": "string",
          "pattern": "^bkp_[a-f0-9]{16}$",
          "description": "The completed backup, from impreza_list_backups."
        }
      },
      "required": [
        "backup_id"
      ],
      "additionalProperties": false
    },
    "annotations": {
      "readOnlyHint": true,
      "destructiveHint": false,
      "openWorldHint": false
    },
    "title": "Download app backup"
  }
];
const validators: Record<string,z.ZodTypeAny> = {"impreza_export_app_config":z.object({"deployment_id":z.string().regex(new RegExp("^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\\s\\S])"))}).strict(),
"impreza_prepare_config_apply":z.object({"deployment_id":z.string().regex(new RegExp("^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\\s\\S])")),"document":z.string().min(1).max(262144)}).strict(),
"impreza_get_config_plan":z.object({"config_plan_id":z.string().regex(new RegExp("^cplan_[a-f0-9]{24}$(?![\\s\\S])"))}).strict(),
"impreza_apply_config_plan":z.object({"config_plan_id":z.string().regex(new RegExp("^cplan_[a-f0-9]{24}$(?![\\s\\S])")),"review_digest":z.string().regex(new RegExp("^[a-f0-9]{64}$(?![\\s\\S])")),"confirm":z.literal(true)}).strict(),
"impreza_app_metrics":z.object({"deployment_id":z.string().regex(new RegExp("^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\\s\\S])")),"minutes":z.number().finite().int().min(5).max(1440).optional()}).strict(),
"impreza_list_alerts":z.object({"deployment_id":z.string().regex(new RegExp("^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\\s\\S])"))}).strict(),
"impreza_set_alert_rule":z.object({"deployment_id":z.string().regex(new RegExp("^dpl_(?:[a-f0-9]{16}|[a-f0-9]{24})$(?![\\s\\S])")),"rule_id":z.string().regex(new RegExp("^arl_[a-f0-9]{24}$(?![\\s\\S])")).optional(),"metric":z.enum(["down", "restart_loop", "memory_pct"]),"threshold":z.number().finite().int().min(1).max(1000000),"duration_minutes":z.number().finite().int().min(1).max(60).optional(),"enabled":z.boolean().optional()}).strict(),
"impreza_prepare_database_restore":z.object({"backup_id":z.string().regex(new RegExp("^bkp_[a-f0-9]{16}$(?![\\s\\S])")),"target_binding_id":z.string().regex(new RegExp("^bnd_[a-f0-9]{24}$(?![\\s\\S])")).optional()}).strict(),
"impreza_get_database_restore":z.object({"restore_plan_id":z.string().regex(new RegExp("^rspl_[a-f0-9]{24}$(?![\\s\\S])"))}).strict(),
"impreza_apply_database_restore":z.object({"restore_plan_id":z.string().regex(new RegExp("^rspl_[a-f0-9]{24}$(?![\\s\\S])")),"review_digest":z.string().regex(new RegExp("^[a-f0-9]{64}$(?![\\s\\S])")),"confirm":z.literal(true)}).strict(),
"impreza_download_backup":z.object({"backup_id":z.string().regex(new RegExp("^bkp_[a-f0-9]{16}$(?![\\s\\S])"))}).strict()};
const routes: Record<string,[string,string]> = {"impreza_export_app_config": ["GET", "/v1/platform/deployments/custom/{deployment_id}/config"], "impreza_prepare_config_apply": ["POST", "/v1/platform/deployments/custom/{deployment_id}/prepare-config-apply"], "impreza_get_config_plan": ["GET", "/v1/platform/config-plans/{config_plan_id}"], "impreza_apply_config_plan": ["POST", "/v1/platform/config-plans/{config_plan_id}/apply"], "impreza_app_metrics": ["GET", "/v1/platform/deployments/custom/{deployment_id}/metrics"], "impreza_list_alerts": ["GET", "/v1/platform/deployments/custom/{deployment_id}/alerts"], "impreza_set_alert_rule": ["POST", "/v1/platform/deployments/custom/{deployment_id}/alert-rules"], "impreza_prepare_database_restore": ["POST", "/v1/backups/{backup_id}/prepare-database-restore"], "impreza_get_database_restore": ["GET", "/v1/database-restores/{restore_plan_id}"], "impreza_apply_database_restore": ["POST", "/v1/database-restores/{restore_plan_id}/apply"], "impreza_download_backup": ["POST", "/v1/backups/{backup_id}/download-link"]};
export function isCustomerTool(name:string):boolean { return Object.hasOwn(routes,name); }
export async function callCustomerTool(client:ImprezaClient,name:string,args:Record<string,unknown>):Promise<unknown> {
 const validator=validators[name], route=routes[name];
 if(!validator || !route) throw new Error('Unknown customer workflow');
 const p=validator.parse(args) as Record<string,unknown>;
 if(name==='impreza_set_alert_rule' && ((p.metric==='down' && p.threshold!==1) || (p.metric==='memory_pct' && Number(p.threshold)>100))) throw new Error('Invalid threshold for metric');
 const [method,template]=route;
 const path=template.replace(/\{([a-z_]+)\}/g,(_:string,key:string)=>{const value=p[key];delete p[key];return encodeURIComponent(String(value));});
 return method==='GET' ? client.get(path,Object.fromEntries(Object.entries(p).map(([k,v])=>[k,String(v)]))) : client.post(path,p);
}
