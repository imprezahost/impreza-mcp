// Generated from the hosted connector's output schemas. Do not edit by hand:
// the schemas must stay identical to the hosted ones, and the parity check compares them.
export const OUTPUT_SCHEMAS: Readonly<Record<string, Record<string, unknown>>> = {
  "impreza_account_info": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "id",
      "first_name",
      "last_name",
      "company",
      "email",
      "balance",
      "currency",
      "registered_at"
    ],
    "properties": {
      "id": {
        "type": "integer"
      },
      "first_name": {
        "type": [
          "string",
          "null"
        ]
      },
      "last_name": {
        "type": [
          "string",
          "null"
        ]
      },
      "company": {
        "type": [
          "string",
          "null"
        ]
      },
      "email": {
        "type": [
          "string",
          "null"
        ]
      },
      "balance": {
        "type": "number"
      },
      "currency": {
        "type": "string"
      },
      "registered_at": {
        "type": [
          "string",
          "null"
        ]
      }
    }
  },
  "impreza_add_onion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "note",
      "deployment"
    ],
    "properties": {
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "deployment": {
        "type": "object",
        "required": [
          "id",
          "agent_id",
          "status",
          "domain",
          "onion",
          "onion_profile"
        ],
        "properties": {
          "id": {
            "type": "string"
          },
          "agent_id": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "domain": {
            "type": [
              "string",
              "null"
            ]
          },
          "onion": {
            "type": [
              "string",
              "null"
            ]
          },
          "onion_profile": {
            "type": "string",
            "enum": [
              "standard",
              "hardened",
              "max"
            ]
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_api_search": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "query",
      "results",
      "note"
    ],
    "properties": {
      "query": {
        "type": "string"
      },
      "results": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "path",
            "summary",
            "group",
            "placeholders"
          ],
          "properties": {
            "path": {
              "type": "string"
            },
            "summary": {
              "type": "string"
            },
            "group": {
              "type": "string"
            },
            "placeholders": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        }
      },
      "how_to_call": {
        "type": "string"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_app_metrics": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "state",
      "last_point_at",
      "points",
      "resolution",
      "retention_hours",
      "retention_days_hourly"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "state": {
        "type": "string"
      },
      "last_point_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "points": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "minute",
            "resolution",
            "state",
            "restart_count",
            "cpu_pct",
            "memory_bytes",
            "memory_limit_bytes",
            "volume_bytes"
          ],
          "properties": {
            "minute": {
              "type": "string"
            },
            "resolution": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "restart_count": {
              "type": "integer"
            },
            "cpu_pct": {
              "type": "number"
            },
            "memory_bytes": {
              "type": "integer"
            },
            "memory_limit_bytes": {
              "type": "integer"
            },
            "volume_bytes": {
              "type": "integer"
            }
          }
        }
      },
      "resolution": {
        "type": "string"
      },
      "retention_hours": {
        "type": "integer"
      },
      "retention_days_hourly": {
        "type": "integer"
      }
    }
  },
  "impreza_apply_config_promotion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_apply_database_restore": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object",
        "required": [
          "plan_id",
          "command_id",
          "job_deployment_id",
          "transport_id",
          "backup_id",
          "restore_database",
          "status",
          "accepted_at",
          "restore"
        ],
        "properties": {
          "plan_id": {
            "type": "string"
          },
          "command_id": {
            "type": "string"
          },
          "job_deployment_id": {
            "type": "string"
          },
          "transport_id": {
            "type": "string"
          },
          "backup_id": {
            "type": "string"
          },
          "restore_database": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "const": "accepted"
          },
          "accepted_at": {
            "type": "string"
          },
          "restore": {
            "type": "string"
          }
        }
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_apply_host_plan": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "plan_id": {
        "type": "string",
        "pattern": "^hpl_[a-f0-9]{32}$"
      },
      "operation": {
        "type": "string",
        "const": "vps.reinstall"
      },
      "service_id": {
        "type": "integer"
      },
      "template_id": {
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
          "refused"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "provider_ref": {
        "type": [
          "string",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    },
    "required": [
      "plan_id",
      "operation",
      "service_id",
      "template_id",
      "plan_digest",
      "approval_id",
      "status",
      "created_at",
      "expires_at",
      "provider_ref",
      "note"
    ]
  },
  "impreza_apply_image_promotion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_apply_pitr_restore": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object",
        "required": [
          "plan_id",
          "command_id",
          "target_time",
          "restore_database",
          "status",
          "accepted_at",
          "phase",
          "recovery",
          "binding_id",
          "binding_revision",
          "consumer_deployment_id",
          "provider_deployment_id",
          "provider_version",
          "agent_id",
          "config_id",
          "storage_service_id",
          "storage_bucket",
          "storage_prefix"
        ],
        "properties": {
          "plan_id": {
            "type": "string"
          },
          "command_id": {
            "type": "string"
          },
          "target_time": {
            "type": "string"
          },
          "restore_database": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "const": "accepted"
          },
          "accepted_at": {
            "type": "string"
          },
          "phase": {
            "type": "string"
          },
          "recovery": {
            "type": "string"
          },
          "binding_id": {
            "type": "string"
          },
          "binding_revision": {
            "type": "string"
          },
          "consumer_deployment_id": {
            "type": "string"
          },
          "provider_deployment_id": {
            "type": "string"
          },
          "provider_version": {
            "type": "string"
          },
          "agent_id": {
            "type": "string"
          },
          "config_id": {
            "type": "string"
          },
          "storage_service_id": {
            "type": "integer"
          },
          "storage_bucket": {
            "type": "string"
          },
          "storage_prefix": {
            "type": "string"
          }
        }
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_apply_project_deployment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_apply_service_binding_plan": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_apply_traffic_switch": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "receipt",
      "replayed"
    ],
    "properties": {
      "receipt": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "switch_id",
          "command_id",
          "source_deployment_id",
          "target_deployment_id",
          "hostname",
          "status",
          "accepted_at",
          "switch"
        ],
        "properties": {
          "switch_id": {
            "type": "string"
          },
          "command_id": {
            "type": "string"
          },
          "source_deployment_id": {
            "type": "string"
          },
          "target_deployment_id": {
            "type": "string"
          },
          "hostname": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "accepted_at": {
            "type": "string"
          },
          "switch": {
            "type": "string"
          }
        }
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_attach_environment_service": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "environment_id",
      "component",
      "role",
      "deployment_id",
      "replayed"
    ],
    "properties": {
      "project_id": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "component": {
        "type": "string"
      },
      "role": {
        "type": "string",
        "enum": [
          "web",
          "worker",
          "database",
          "cache"
        ]
      },
      "deployment_id": {
        "type": "string"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_backup_schedule": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schedule"
    ],
    "properties": {
      "schedule": {
        "type": "object",
        "required": [
          "deployment_id",
          "enabled",
          "frequency",
          "keep",
          "last_run_at",
          "is_default"
        ],
        "properties": {
          "deployment_id": {
            "type": "string"
          },
          "enabled": {
            "type": "boolean"
          },
          "frequency": {
            "type": "string",
            "enum": [
              "daily",
              "weekly"
            ]
          },
          "keep": {
            "type": "integer"
          },
          "last_run_at": {
            "type": [
              "string",
              "null"
            ]
          },
          "last_error": {
            "type": [
              "string",
              "null"
            ]
          },
          "last_error_at": {
            "type": [
              "string",
              "null"
            ]
          },
          "consecutive_failures": {
            "type": "integer"
          },
          "is_default": {
            "type": "boolean"
          }
        }
      }
    }
  },
  "impreza_cancel_deployment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "status",
      "cancellation"
    ],
    "properties": {
      "command_id": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "cancelled",
          "in_progress"
        ]
      },
      "cancellation": {
        "type": "object"
      }
    }
  },
  "impreza_compare_environments": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "pairing",
      "environment_a",
      "environment_b",
      "paired",
      "only_in_a",
      "only_in_b"
    ],
    "properties": {
      "project_id": {
        "type": "string"
      },
      "pairing": {
        "type": "string"
      },
      "environment_a": {
        "type": "object"
      },
      "environment_b": {
        "type": "object"
      },
      "paired": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "a",
            "b",
            "variables",
            "source",
            "binding"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "a": {
              "type": "object"
            },
            "b": {
              "type": "object"
            },
            "variables": {
              "type": "object"
            },
            "source": {
              "type": "object"
            },
            "binding": {
              "type": "object"
            }
          }
        }
      },
      "only_in_a": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "role",
            "deployment_id",
            "kind",
            "status"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "kind": {
              "type": "string"
            },
            "status": {
              "type": "string"
            }
          }
        }
      },
      "only_in_b": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "role",
            "deployment_id",
            "kind",
            "status"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "kind": {
              "type": "string"
            },
            "status": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "impreza_configure_pitr": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "provider_deployment_id",
      "state",
      "updated"
    ],
    "properties": {
      "provider_deployment_id": {
        "type": "string"
      },
      "state": {
        "type": "string",
        "enum": [
          "enabling",
          "active",
          "degraded",
          "disabling",
          "disabled"
        ]
      },
      "updated": {
        "type": "boolean"
      }
    }
  },
  "impreza_configure_previews": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "settings",
      "note"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "settings": {
        "type": "object"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_create_environment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "environment_id",
      "name",
      "replayed"
    ],
    "properties": {
      "environment_id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_create_preview": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "ok",
      "note",
      "preview"
    ],
    "properties": {
      "ok": {
        "type": "boolean",
        "const": true
      },
      "note": {
        "type": "string"
      },
      "preview": {
        "type": "object"
      },
      "reviewer_note": {
        "type": "string"
      },
      "password_note": {
        "type": "string"
      }
    }
  },
  "impreza_create_project": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "name",
      "replayed"
    ],
    "properties": {
      "project_id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_delete_environment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "environment_id",
      "deleted"
    ],
    "properties": {
      "environment_id": {
        "type": "string"
      },
      "deleted": {
        "type": "boolean",
        "const": true
      }
    }
  },
  "impreza_delete_project": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "deleted"
    ],
    "properties": {
      "project_id": {
        "type": "string"
      },
      "deleted": {
        "type": "boolean",
        "const": true
      }
    }
  },
  "impreza_deploy_catalog_app": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "id",
      "runtime",
      "last_operation",
      "app_name",
      "app_version",
      "agent_id",
      "status",
      "domain",
      "onion",
      "onion_profile",
      "onion_exported_at",
      "network_mode",
      "connection_info",
      "vars",
      "signup_window",
      "created_at",
      "last_health_at",
      "last_error"
    ],
    "properties": {
      "id": {
        "type": "string"
      },
      "runtime": {
        "type": "object"
      },
      "last_operation": {
        "type": [
          "object",
          "null"
        ]
      },
      "app_name": {
        "type": "string"
      },
      "app_version": {
        "type": "string"
      },
      "agent_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "domain": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion_profile": {
        "type": "string"
      },
      "onion_exported_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "network_mode": {
        "type": "string"
      },
      "connection_info": {
        "type": [
          "object",
          "null"
        ]
      },
      "vars": {
        "type": [
          "object",
          "array"
        ]
      },
      "signup_window": {
        "type": [
          "object",
          "null"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "last_health_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "last_error": {
        "type": [
          "string",
          "null"
        ]
      },
      "credentials_note": {
        "type": "string"
      }
    }
  },
  "impreza_deploy_custom": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "id",
      "runtime",
      "last_operation",
      "name",
      "mode",
      "service_binding",
      "agent_id",
      "status",
      "domain",
      "onion",
      "onion_profile",
      "onion_exported_at",
      "shield",
      "proxy_metrics",
      "image",
      "context_id",
      "tor_egress",
      "source_artifact",
      "project_plan",
      "git_url",
      "git_ref",
      "build_strategy",
      "static_options",
      "project_dir",
      "build_secret_names",
      "npm_workspace",
      "python_package_manager",
      "node_package_manager",
      "public_build_vars",
      "startup_health",
      "php_document_root",
      "start_command",
      "healthcheck_path",
      "go_package",
      "static_spa",
      "git_auth",
      "cpus",
      "memory_mb",
      "vars",
      "created_at",
      "last_health_at",
      "last_error",
      "zero_downtime"
    ],
    "properties": {
      "id": {
        "type": "string"
      },
      "runtime": {
        "type": "object"
      },
      "last_operation": {
        "type": [
          "object",
          "null"
        ]
      },
      "name": {
        "type": "string"
      },
      "mode": {
        "type": "string"
      },
      "service_binding": {
        "type": [
          "object",
          "null"
        ]
      },
      "agent_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "domain": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion_profile": {
        "type": "string"
      },
      "onion_exported_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "shield": {
        "type": "object"
      },
      "proxy_metrics": {
        "type": [
          "object",
          "null"
        ]
      },
      "image": {
        "type": "string"
      },
      "context_id": {
        "type": "string"
      },
      "tor_egress": {
        "type": "boolean"
      },
      "source_artifact": {
        "type": [
          "object",
          "null"
        ]
      },
      "project_plan": {
        "type": [
          "object",
          "null"
        ]
      },
      "git_url": {
        "type": "string"
      },
      "git_ref": {
        "type": "string"
      },
      "build_strategy": {
        "type": [
          "string",
          "null"
        ]
      },
      "static_options": {
        "type": [
          "object",
          "null"
        ]
      },
      "project_dir": {
        "type": [
          "string",
          "null"
        ]
      },
      "build_secret_names": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "npm_workspace": {
        "type": [
          "string",
          "null"
        ]
      },
      "python_package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "node_package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "public_build_vars": {
        "type": [
          "object",
          "null"
        ]
      },
      "startup_health": {
        "type": "object"
      },
      "php_document_root": {
        "type": [
          "string",
          "null"
        ]
      },
      "start_command": {
        "type": [
          "string",
          "null"
        ]
      },
      "healthcheck_path": {
        "type": [
          "string",
          "null"
        ]
      },
      "go_package": {
        "type": [
          "string",
          "null"
        ]
      },
      "static_spa": {
        "type": [
          "boolean",
          "null"
        ]
      },
      "git_auth": {
        "type": "object"
      },
      "cpus": {
        "type": "number"
      },
      "memory_mb": {
        "type": "integer"
      },
      "vars": {
        "type": [
          "object",
          "array"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "last_health_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "last_error": {
        "type": [
          "string",
          "null"
        ]
      },
      "_trace": {
        "type": "string"
      },
      "zero_downtime": {
        "type": [
          "object",
          "null"
        ]
      }
    }
  },
  "impreza_deploy_environment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "batch_id",
      "environment_id",
      "project_id",
      "status",
      "require_healthy",
      "cursor",
      "stages",
      "error",
      "created_at",
      "finished_at",
      "note",
      "replayed"
    ],
    "properties": {
      "batch_id": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "project_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "require_healthy": {
        "type": "boolean"
      },
      "cursor": {
        "type": "integer"
      },
      "stages": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "role",
            "deployment_id",
            "status",
            "command_id",
            "startup_gate"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "command_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "startup_gate": {
              "type": "string"
            }
          }
        }
      },
      "error": {
        "type": [
          "string",
          "null"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "finished_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "note": {
        "type": "string"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_deploy_project_plan": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "id",
      "runtime",
      "last_operation",
      "name",
      "mode",
      "service_binding",
      "agent_id",
      "status",
      "domain",
      "onion",
      "onion_profile",
      "onion_exported_at",
      "shield",
      "proxy_metrics",
      "image",
      "context_id",
      "tor_egress",
      "source_artifact",
      "project_plan",
      "git_url",
      "git_ref",
      "build_strategy",
      "static_options",
      "project_dir",
      "build_secret_names",
      "npm_workspace",
      "python_package_manager",
      "node_package_manager",
      "public_build_vars",
      "startup_health",
      "php_document_root",
      "start_command",
      "healthcheck_path",
      "go_package",
      "static_spa",
      "git_auth",
      "cpus",
      "memory_mb",
      "vars",
      "created_at",
      "last_health_at",
      "last_error",
      "zero_downtime"
    ],
    "properties": {
      "id": {
        "type": "string"
      },
      "runtime": {
        "type": "object"
      },
      "last_operation": {
        "type": [
          "object",
          "null"
        ]
      },
      "name": {
        "type": "string"
      },
      "mode": {
        "type": "string"
      },
      "service_binding": {
        "type": [
          "object",
          "null"
        ]
      },
      "agent_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "domain": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion_profile": {
        "type": "string"
      },
      "onion_exported_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "shield": {
        "type": "object"
      },
      "proxy_metrics": {
        "type": [
          "object",
          "null"
        ]
      },
      "image": {
        "type": "string"
      },
      "context_id": {
        "type": "string"
      },
      "tor_egress": {
        "type": "boolean"
      },
      "source_artifact": {
        "type": [
          "object",
          "null"
        ]
      },
      "project_plan": {
        "type": [
          "object",
          "null"
        ]
      },
      "git_url": {
        "type": "string"
      },
      "git_ref": {
        "type": "string"
      },
      "build_strategy": {
        "type": [
          "string",
          "null"
        ]
      },
      "static_options": {
        "type": [
          "object",
          "null"
        ]
      },
      "project_dir": {
        "type": [
          "string",
          "null"
        ]
      },
      "build_secret_names": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "npm_workspace": {
        "type": [
          "string",
          "null"
        ]
      },
      "python_package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "node_package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "public_build_vars": {
        "type": [
          "object",
          "null"
        ]
      },
      "startup_health": {
        "type": "object"
      },
      "php_document_root": {
        "type": [
          "string",
          "null"
        ]
      },
      "start_command": {
        "type": [
          "string",
          "null"
        ]
      },
      "healthcheck_path": {
        "type": [
          "string",
          "null"
        ]
      },
      "go_package": {
        "type": [
          "string",
          "null"
        ]
      },
      "static_spa": {
        "type": [
          "boolean",
          "null"
        ]
      },
      "git_auth": {
        "type": "object"
      },
      "cpus": {
        "type": "number"
      },
      "memory_mb": {
        "type": "integer"
      },
      "vars": {
        "type": [
          "object",
          "array"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "last_health_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "last_error": {
        "type": [
          "string",
          "null"
        ]
      },
      "_trace": {
        "type": "string"
      },
      "zero_downtime": {
        "type": [
          "object",
          "null"
        ]
      }
    }
  },
  "impreza_detach_environment_service": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "detached",
      "replayed"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "detached": {
        "type": "boolean",
        "const": true
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_doctor": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "healthy",
      "checked",
      "findings",
      "server_time"
    ],
    "properties": {
      "healthy": {
        "type": "boolean"
      },
      "checked": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "findings": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "severity",
            "code",
            "message",
            "fix"
          ],
          "properties": {
            "severity": {
              "type": "string",
              "enum": [
                "error",
                "warn",
                "info"
              ]
            },
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "fix": {
              "type": "string"
            }
          }
        }
      },
      "server_time": {
        "type": "string"
      }
    }
  },
  "impreza_export_app_config": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "schema",
      "deployment_id",
      "name",
      "exported_at",
      "document",
      "document_text",
      "secrets"
    ],
    "properties": {
      "schema": {
        "type": "string"
      },
      "deployment_id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "exported_at": {
        "type": "string"
      },
      "document": {
        "type": "object"
      },
      "document_text": {
        "type": "string"
      },
      "secrets": {
        "type": "string",
        "enum": [
          "references_only"
        ]
      }
    }
  },
  "impreza_export_onion_key": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "note"
    ],
    "properties": {
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_fetch_onion_key_export": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "onion",
      "note"
    ],
    "properties": {
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "onion": {
        "type": "string",
        "pattern": "^[a-z2-7]{56}.onion$"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_get_account_overview": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "servers",
      "apps",
      "environments",
      "domains",
      "open_alerts",
      "recent_failures",
      "next_steps",
      "filtered",
      "generated_at"
    ],
    "properties": {
      "servers": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "agent_id",
            "version",
            "state",
            "origin",
            "last_seen_at"
          ],
          "properties": {
            "agent_id": {
              "type": "string"
            },
            "version": {
              "type": "string"
            },
            "state": {
              "type": "string"
            },
            "origin": {
              "type": "string"
            },
            "last_seen_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "apps": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "deployment_id",
            "kind",
            "name",
            "state",
            "has_onion",
            "created_at"
          ],
          "properties": {
            "deployment_id": {
              "type": "string"
            },
            "kind": {
              "type": "string"
            },
            "name": {
              "type": [
                "string",
                "null"
              ]
            },
            "state": {
              "type": "string"
            },
            "has_onion": {
              "type": "boolean"
            },
            "created_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "environments": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "name"
          ],
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            }
          }
        }
      },
      "domains": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "domain",
            "status"
          ],
          "properties": {
            "domain": {
              "type": "string"
            },
            "status": {
              "type": "string"
            }
          }
        }
      },
      "open_alerts": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "alert_id",
            "deployment_id",
            "metric",
            "opened_at"
          ],
          "properties": {
            "alert_id": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "metric": {
              "type": "string"
            },
            "opened_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "recent_failures": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "deployment_id",
            "error_class",
            "signature",
            "created_at"
          ],
          "properties": {
            "deployment_id": {
              "type": "string"
            },
            "error_class": {
              "type": "string"
            },
            "signature": {
              "type": "string"
            },
            "created_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "next_steps": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "action",
            "tool",
            "args"
          ],
          "properties": {
            "action": {
              "type": "string"
            },
            "tool": {
              "type": "string"
            },
            "args": {
              "type": "object"
            }
          }
        }
      },
      "filtered": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "section",
            "showing",
            "of",
            "by"
          ],
          "properties": {
            "section": {
              "type": "string"
            },
            "showing": {
              "type": "integer"
            },
            "of": {
              "type": "integer"
            },
            "by": {
              "type": "string"
            }
          }
        }
      },
      "generated_at": {
        "type": "string"
      }
    }
  },
  "impreza_get_app_read": {
    "type": "object",
    "additionalProperties": false,
    "required": [],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "actions": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "roots": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "max_kb": {
        "type": "integer"
      },
      "reads": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "read_id",
            "deployment_id",
            "action",
            "root",
            "path",
            "status",
            "exit_code",
            "error",
            "created_at",
            "finished_at"
          ],
          "properties": {
            "read_id": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "action": {
              "type": "string"
            },
            "root": {
              "type": "string"
            },
            "path": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "exit_code": {
              "type": [
                "integer",
                "null"
              ]
            },
            "error": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "finished_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "pattern": {
              "type": "string"
            }
          }
        }
      },
      "read": {
        "type": "object"
      }
    }
  },
  "impreza_get_approval": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "id",
      "approval_id",
      "client_id",
      "token_id",
      "operation",
      "params_digest",
      "summary",
      "quote_cents",
      "surface",
      "status",
      "created_at",
      "expires_at",
      "decided_at",
      "decided_by_label",
      "consumed_at",
      "note"
    ],
    "properties": {
      "id": {
        "type": "integer"
      },
      "approval_id": {
        "type": "string",
        "pattern": "^apr_[a-f0-9]{32}$"
      },
      "client_id": {
        "type": "integer"
      },
      "token_id": {
        "type": "integer"
      },
      "operation": {
        "type": "string"
      },
      "params_digest": {
        "type": "string",
        "pattern": "^[a-f0-9]{64}$"
      },
      "summary": {
        "type": [
          "object",
          "array"
        ],
        "$comment": "The stored non-secret summary (always an object with operation when written by createRequest); [] when the stored JSON is missing or unreadable."
      },
      "quote_cents": {
        "type": "integer"
      },
      "surface": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "approved",
          "denied",
          "consumed",
          "expired"
        ]
      },
      "created_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "expires_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "decided_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "decided_by_label": {
        "type": [
          "string",
          "null"
        ]
      },
      "consumed_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_get_cli_run": {
    "type": "object",
    "additionalProperties": false,
    "required": [],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "app": {
        "type": "string"
      },
      "clis": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "cli",
            "label",
            "about",
            "runs",
            "example"
          ],
          "properties": {
            "cli": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "about": {
              "type": "string"
            },
            "runs": {
              "type": "string"
            },
            "example": {
              "type": "string"
            }
          }
        }
      },
      "max_kb": {
        "type": "integer"
      },
      "runs": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "run_id",
            "deployment_id",
            "cli",
            "args",
            "status",
            "exit_code",
            "error",
            "created_at",
            "finished_at"
          ],
          "properties": {
            "run_id": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "cli": {
              "type": "string"
            },
            "args": {
              "type": "array"
            },
            "status": {
              "type": "string"
            },
            "exit_code": {
              "type": [
                "integer",
                "null"
              ]
            },
            "error": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "finished_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "run": {
        "type": "object"
      }
    }
  },
  "impreza_get_config_plan": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "deployment_id",
      "name",
      "changes",
      "diff_text",
      "no_changes",
      "secrets",
      "may_interrupt_traffic",
      "preserves_data"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "deployment_id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "changes": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "diff_text": {
        "type": "string"
      },
      "no_changes": {
        "type": "boolean"
      },
      "secrets": {
        "type": "string"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "preserves_data": {
        "type": "boolean"
      }
    }
  },
  "impreza_get_config_promotion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "promotion_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "source_environment_id",
      "source_environment_name",
      "target_environment_id",
      "target_environment_name",
      "group_variables",
      "components",
      "unpaired_components",
      "replaces_target_user_variables",
      "copies_secret_values",
      "takes_effect"
    ],
    "properties": {
      "promotion_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "source_environment_id": {
        "type": "string"
      },
      "source_environment_name": {
        "type": "string"
      },
      "target_environment_id": {
        "type": "string"
      },
      "target_environment_name": {
        "type": "string"
      },
      "group_variables": {
        "type": "object"
      },
      "components": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "role",
            "deployment_id",
            "variables",
            "kept_on_target"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "variables": {
              "type": "object"
            },
            "kept_on_target": {
              "type": "array"
            }
          }
        }
      },
      "unpaired_components": {
        "type": "object"
      },
      "replaces_target_user_variables": {
        "type": "boolean"
      },
      "copies_secret_values": {
        "type": "string"
      },
      "takes_effect": {
        "type": "string"
      }
    }
  },
  "impreza_get_credential_policy": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "credential_id",
      "stored_policy",
      "effective_policy",
      "note"
    ],
    "properties": {
      "credential_id": {
        "type": "integer"
      },
      "stored_policy": {
        "type": [
          "object",
          "null"
        ],
        "required": [
          "classes",
          "operations",
          "ttl_minutes"
        ],
        "properties": {
          "classes": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "destructive",
                "spend",
                "security"
              ]
            }
          },
          "operations": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ttl_minutes": {
            "type": "integer"
          }
        }
      },
      "effective_policy": {
        "type": [
          "object",
          "null"
        ],
        "required": [
          "classes",
          "operations",
          "ttl_minutes"
        ],
        "properties": {
          "classes": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "destructive",
                "spend",
                "security"
              ]
            }
          },
          "operations": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ttl_minutes": {
            "type": "integer"
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_get_database_restore": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "source_backup",
      "source_deployment_id",
      "target",
      "cutover"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "source_backup": {
        "type": "object"
      },
      "source_deployment_id": {
        "type": "string"
      },
      "target": {
        "type": "object"
      },
      "cutover": {
        "type": "string"
      }
    }
  },
  "impreza_get_environment_deploy": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "batch_id",
      "environment_id",
      "project_id",
      "status",
      "require_healthy",
      "cursor",
      "stages",
      "error",
      "created_at",
      "finished_at",
      "note"
    ],
    "properties": {
      "batch_id": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "project_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "require_healthy": {
        "type": "boolean"
      },
      "cursor": {
        "type": "integer"
      },
      "stages": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "role",
            "deployment_id",
            "status",
            "command_id",
            "startup_gate"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "command_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "startup_gate": {
              "type": "string"
            }
          }
        }
      },
      "error": {
        "type": [
          "string",
          "null"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "finished_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_get_host_inventory": {
    "type": "object",
    "properties": {
      "agent_id": {
        "type": "string",
        "maxLength": 128,
        "pattern": "^agt_[a-f0-9]{16,24}$"
      },
      "protocol": {
        "type": "string",
        "maxLength": 128,
        "enum": [
          "host-inventory-v1"
        ]
      },
      "minimum_agent_version": {
        "type": "string",
        "maxLength": 128,
        "enum": [
          "0.6.28 (not yet released)"
        ]
      },
      "supported": {
        "type": "boolean"
      },
      "status": {
        "type": "string",
        "maxLength": 128,
        "enum": [
          "complete",
          "partial",
          "unavailable",
          "offline",
          "stale",
          "awaiting"
        ]
      },
      "observed_at": {
        "type": [
          "string",
          "null"
        ],
        "format": "date-time",
        "maxLength": 40
      },
      "request_pending": {
        "type": "boolean"
      },
      "facts": {
        "type": "object",
        "properties": {
          "os": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "id": {
                    "type": "string",
                    "maxLength": 128,
                    "enum": [
                      "ubuntu",
                      "debian",
                      "almalinux",
                      "rocky",
                      "centos",
                      "fedora",
                      "rhel",
                      "alpine",
                      "unknown"
                    ]
                  },
                  "version": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[0-9]+(?:\\.[0-9]+)*$"
                  },
                  "architecture": {
                    "type": "string",
                    "maxLength": 128,
                    "enum": [
                      "amd64",
                      "arm64",
                      "386",
                      "arm",
                      "riscv64",
                      "s390x",
                      "ppc64le"
                    ]
                  }
                },
                "required": [
                  "id",
                  "version",
                  "architecture"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "kernel_loaded": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "version": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[A-Za-z0-9][A-Za-z0-9_.+:~/-]{0,127}$"
                  }
                },
                "required": [
                  "version"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "kernel_installed": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "versions": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "maxLength": 128,
                      "pattern": "^[A-Za-z0-9][A-Za-z0-9_.+:~/-]{0,127}$"
                    },
                    "maxItems": 128
                  }
                },
                "required": [
                  "versions"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "boot": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "id": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"
                  }
                },
                "required": [
                  "id"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "packages_installed": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "manager": {
                    "type": "string",
                    "maxLength": 128,
                    "enum": [
                      "apt"
                    ]
                  },
                  "count": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  }
                },
                "required": [
                  "manager",
                  "count"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "packages_candidates": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "manager": {
                    "type": "string",
                    "maxLength": 128,
                    "enum": [
                      "apt"
                    ]
                  },
                  "candidates": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "type": "string",
                          "maxLength": 128,
                          "pattern": "^[A-Za-z0-9][A-Za-z0-9_.+:~/-]{0,127}$"
                        },
                        "installed": {
                          "type": "string",
                          "maxLength": 128,
                          "pattern": "^[A-Za-z0-9][A-Za-z0-9_.+:~/-]{0,127}$"
                        },
                        "candidate": {
                          "type": "string",
                          "maxLength": 128,
                          "pattern": "^[A-Za-z0-9][A-Za-z0-9_.+:~/-]{0,127}$"
                        }
                      },
                      "required": [
                        "name",
                        "installed",
                        "candidate"
                      ],
                      "additionalProperties": false
                    },
                    "maxItems": 512
                  },
                  "repository_contacted": {
                    "type": "boolean",
                    "const": false
                  }
                },
                "required": [
                  "manager",
                  "candidates",
                  "repository_contacted"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "services": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "units": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "name": {
                          "type": "string",
                          "maxLength": 128,
                          "enum": [
                            "impreza-agent.service",
                            "docker.service",
                            "tor.service",
                            "impreza-agent-ingress.service"
                          ]
                        },
                        "load": {
                          "type": "string",
                          "maxLength": 128,
                          "enum": [
                            "loaded",
                            "not-found",
                            "masked",
                            "error",
                            "bad-setting",
                            "unknown"
                          ]
                        },
                        "active": {
                          "type": "string",
                          "maxLength": 128,
                          "enum": [
                            "active",
                            "inactive",
                            "failed",
                            "activating",
                            "deactivating",
                            "reloading",
                            "maintenance",
                            "refreshing",
                            "unknown"
                          ]
                        },
                        "sub": {
                          "type": "string",
                          "maxLength": 128,
                          "pattern": "^[a-z-]{1,32}$"
                        }
                      },
                      "required": [
                        "name",
                        "load",
                        "active",
                        "sub"
                      ],
                      "additionalProperties": false
                    },
                    "maxItems": 4
                  }
                },
                "required": [
                  "units"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "ssh": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "ports": {
                    "type": "array",
                    "items": {
                      "type": "integer",
                      "minimum": 1,
                      "maximum": 65535
                    },
                    "maxItems": 16
                  },
                  "password_authentication": {
                    "type": "string",
                    "maxLength": 128,
                    "enum": [
                      "yes",
                      "no",
                      "unknown"
                    ]
                  },
                  "permit_root_login": {
                    "type": "string",
                    "maxLength": 128,
                    "enum": [
                      "yes",
                      "no",
                      "prohibit-password",
                      "without-password",
                      "forced-commands-only",
                      "unknown"
                    ]
                  },
                  "fingerprints": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "maxLength": 128,
                      "pattern": "^SHA256:[A-Za-z0-9+/]{43}$"
                    },
                    "maxItems": 3
                  }
                },
                "required": [
                  "ports",
                  "password_authentication",
                  "permit_root_login",
                  "fingerprints"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "filesystems": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "mounts": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "device": {
                          "type": "string",
                          "maxLength": 128,
                          "pattern": "^/dev/[A-Za-z0-9_./-]+$"
                        },
                        "mount": {
                          "type": "string",
                          "maxLength": 256,
                          "pattern": "^/[A-Za-z0-9_./-]*$"
                        },
                        "type": {
                          "type": "string",
                          "maxLength": 128,
                          "enum": [
                            "ext2",
                            "ext3",
                            "ext4",
                            "xfs",
                            "btrfs",
                            "vfat",
                            "f2fs",
                            "zfs"
                          ]
                        },
                        "bytes_total": {
                          "type": "integer",
                          "minimum": 0,
                          "maximum": 9007199254740991
                        },
                        "bytes_available": {
                          "type": "integer",
                          "minimum": 0,
                          "maximum": 9007199254740991
                        },
                        "inodes_total": {
                          "type": "integer",
                          "minimum": 0,
                          "maximum": 9007199254740991
                        },
                        "inodes_available": {
                          "type": "integer",
                          "minimum": 0,
                          "maximum": 9007199254740991
                        }
                      },
                      "required": [
                        "device",
                        "mount",
                        "type",
                        "bytes_total",
                        "bytes_available",
                        "inodes_total",
                        "inodes_available"
                      ],
                      "additionalProperties": false
                    },
                    "maxItems": 64
                  }
                },
                "required": [
                  "mounts"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "docker": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "version": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+(?:[.-][A-Za-z0-9]+)*$"
                  }
                },
                "required": [
                  "version"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "tor": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "version": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+(?:[.-][A-Za-z0-9]+)*$"
                  }
                },
                "required": [
                  "version"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "proxy": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "version": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+(?:[.-][A-Za-z0-9]+)*$"
                  }
                },
                "required": [
                  "version"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          },
          "shield": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "os-release",
                  "proc-kernel",
                  "proc-boot",
                  "dpkg-query",
                  "apt-cache",
                  "systemd",
                  "sshd-public-keys",
                  "mountinfo-statfs",
                  "docker-version",
                  "tor-version",
                  "caddy-version",
                  "caddy-modules",
                  "control-plane"
                ]
              },
              "observed_at": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "valid_until": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "date-time",
                "maxLength": 40
              },
              "state": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "complete",
                  "partial",
                  "unavailable"
                ]
              },
              "reason": {
                "type": "string",
                "maxLength": 128,
                "enum": [
                  "observed",
                  "collection_failed",
                  "cached_only",
                  "unsupported_os",
                  "invalid_output",
                  "truncated",
                  "ssh_global_policy",
                  "not_collected",
                  "provider_unknown"
                ]
              },
              "value": {
                "type": [
                  "object",
                  "null"
                ],
                "properties": {
                  "version": {
                    "type": "string",
                    "maxLength": 128,
                    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+(?:[.-][A-Za-z0-9]+)*$"
                  }
                },
                "required": [
                  "version"
                ],
                "additionalProperties": false
              },
              "stale": {
                "type": "boolean"
              }
            },
            "required": [
              "source",
              "observed_at",
              "valid_until",
              "state",
              "reason",
              "value",
              "stale"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "os",
          "kernel_loaded",
          "kernel_installed",
          "boot",
          "packages_installed",
          "packages_candidates",
          "services",
          "ssh",
          "filesystems",
          "docker",
          "tor",
          "proxy",
          "shield"
        ],
        "additionalProperties": false
      },
      "provider": {
        "type": "object",
        "properties": {
          "source": {
            "type": "string",
            "maxLength": 128,
            "enum": [
              "control-plane"
            ]
          },
          "observed_at": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time",
            "maxLength": 40
          },
          "valid_until": {
            "type": [
              "string",
              "null"
            ],
            "format": "date-time",
            "maxLength": 40
          },
          "state": {
            "type": "string",
            "maxLength": 128,
            "enum": [
              "complete",
              "partial",
              "unavailable"
            ]
          },
          "reason": {
            "type": "string",
            "maxLength": 128,
            "enum": [
              "observed",
              "provider_unknown"
            ]
          },
          "value": {
            "type": [
              "object",
              "null"
            ],
            "properties": {
              "service_id": {
                "type": "integer",
                "minimum": 1
              },
              "node": {
                "type": "string",
                "maxLength": 128,
                "pattern": "^[A-Za-z0-9_-]{1,64}$"
              }
            },
            "required": [
              "service_id"
            ],
            "additionalProperties": false
          },
          "stale": {
            "type": "boolean"
          }
        },
        "required": [
          "source",
          "observed_at",
          "valid_until",
          "state",
          "reason",
          "value",
          "stale"
        ],
        "additionalProperties": false
      }
    },
    "required": [
      "agent_id",
      "protocol",
      "minimum_agent_version",
      "supported",
      "status",
      "observed_at",
      "request_pending",
      "facts",
      "provider"
    ],
    "additionalProperties": false
  },
  "impreza_get_host_plan": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "plan_id": {
        "type": "string",
        "pattern": "^hpl_[a-f0-9]{32}$"
      },
      "operation": {
        "type": "string",
        "const": "vps.reinstall"
      },
      "service_id": {
        "type": "integer"
      },
      "template_id": {
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
          "refused"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "provider_ref": {
        "type": [
          "string",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    },
    "required": [
      "plan_id",
      "operation",
      "service_id",
      "template_id",
      "plan_digest",
      "approval_id",
      "status",
      "created_at",
      "expires_at",
      "provider_ref",
      "note"
    ]
  },
  "impreza_get_image_promotion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "promotion_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "source_deployment_id",
      "target_deployment_id",
      "source_command_id",
      "previous_image",
      "image",
      "target_domain",
      "target_agent_id",
      "target_cpus",
      "target_memory_mb",
      "target_variable_names",
      "copies_source_variables",
      "may_interrupt_traffic",
      "evidence"
    ],
    "properties": {
      "promotion_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "source_deployment_id": {
        "type": "string"
      },
      "target_deployment_id": {
        "type": "string"
      },
      "source_command_id": {
        "type": "string"
      },
      "previous_image": {
        "type": [
          "string",
          "null"
        ]
      },
      "image": {
        "type": "string"
      },
      "target_domain": {
        "type": [
          "string",
          "null"
        ]
      },
      "target_agent_id": {
        "type": "string"
      },
      "target_cpus": {
        "type": "number"
      },
      "target_memory_mb": {
        "type": "integer"
      },
      "target_variable_names": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "copies_source_variables": {
        "type": "boolean"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "evidence": {
        "type": "string"
      }
    }
  },
  "impreza_get_log_request": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "request_id",
      "deployment_id",
      "status",
      "final",
      "chunks",
      "next_offset",
      "note"
    ],
    "properties": {
      "request_id": {
        "type": "string"
      },
      "deployment_id": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "streaming",
          "complete",
          "failed",
          "expired"
        ]
      },
      "final": {
        "type": "boolean"
      },
      "chunks": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "chunk",
            "final"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "chunk": {
              "type": "string"
            },
            "final": {
              "type": "boolean"
            }
          }
        }
      },
      "next_offset": {
        "type": "integer"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_get_logs": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "stream_id",
      "command_id",
      "chunks",
      "final",
      "logs"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "stream_id": {
        "type": "string"
      },
      "command_id": {
        "type": "string"
      },
      "chunks": {
        "type": "integer"
      },
      "final": {
        "type": "boolean"
      },
      "logs": {
        "type": "string"
      }
    }
  },
  "impreza_get_pitr_restore": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "target_time",
      "database_provider",
      "base",
      "wal_segments_available",
      "last_drain_at",
      "target",
      "phases",
      "cutover"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "target_time": {
        "type": "string"
      },
      "database_provider": {
        "type": "object"
      },
      "base": {
        "type": "object"
      },
      "wal_segments_available": {
        "type": "integer"
      },
      "last_drain_at": {
        "type": "string"
      },
      "target": {
        "type": "object"
      },
      "phases": {
        "type": "string"
      },
      "cutover": {
        "type": "string"
      }
    }
  },
  "impreza_get_service_binding_plan": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "binding_id",
      "consumer_deployment_id",
      "consumer_name",
      "provider_deployment_id",
      "provider_engine",
      "environment_id",
      "variable",
      "may_interrupt_traffic"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "binding_id": {
        "type": "string"
      },
      "consumer_deployment_id": {
        "type": "string"
      },
      "consumer_name": {
        "type": "string"
      },
      "provider_deployment_id": {
        "type": "string"
      },
      "provider_engine": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "variable": {
        "type": "string"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "database": {
        "type": "string"
      },
      "copies_provider_password": {
        "type": "boolean"
      },
      "opens_host_port": {
        "type": "boolean"
      },
      "credential_delivery": {
        "type": "string"
      },
      "wire": {
        "type": "boolean"
      },
      "wire_components": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "wire_note": {
        "type": "string"
      },
      "database_data_retained": {
        "type": "boolean"
      },
      "login_disabled_after_replacement": {
        "type": "boolean"
      },
      "cleanup_retry": {
        "type": "boolean"
      },
      "rotation_id": {
        "type": "string"
      },
      "require_healthy_start": {
        "type": "boolean"
      },
      "startup_timeout_seconds": {
        "type": "integer"
      },
      "retry": {
        "type": "boolean"
      },
      "cleanup_only": {
        "type": "boolean"
      }
    }
  },
  "impreza_get_shield": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "shield"
    ],
    "properties": {
      "shield": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "deployment_id",
          "profile",
          "mode",
          "revision",
          "exclusions",
          "v2_supported",
          "controls",
          "controls_supported",
          "controls_required_capability",
          "under_attack",
          "required_capability",
          "minimum_agent_version",
          "audit_review",
          "policy_updated_at"
        ],
        "properties": {
          "deployment_id": {
            "type": "string"
          },
          "profile": {
            "type": "string",
            "enum": [
              "off",
              "standard",
              "hardened",
              "max"
            ]
          },
          "mode": {
            "type": "string",
            "enum": [
              "audit",
              "enforce"
            ]
          },
          "revision": {
            "type": "integer",
            "minimum": 0
          },
          "exclusions": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "rule_id"
              ],
              "properties": {
                "rule_id": {
                  "type": "integer"
                },
                "path_prefix": {
                  "type": "string"
                }
              }
            }
          },
          "v2_supported": {
            "type": "boolean"
          },
          "controls": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "pow_paths",
              "rate_limit_rpm",
              "pow_difficulty",
              "trusted_sources",
              "attack_expires_at"
            ],
            "properties": {
              "pow_paths": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "rate_limit_rpm": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "pow_difficulty": {
                "type": [
                  "integer",
                  "null"
                ]
              },
              "trusted_sources": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "attack_expires_at": {
                "type": "integer",
                "minimum": 0
              }
            }
          },
          "controls_supported": {
            "type": "boolean"
          },
          "controls_required_capability": {
            "type": "string"
          },
          "under_attack": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "active",
              "expires_at",
              "remaining_seconds",
              "difficulty"
            ],
            "properties": {
              "active": {
                "type": "boolean"
              },
              "expires_at": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "remaining_seconds": {
                "type": "integer",
                "minimum": 0
              },
              "difficulty": {
                "type": "integer"
              }
            }
          },
          "required_capability": {
            "type": "string"
          },
          "minimum_agent_version": {
            "type": "string"
          },
          "audit_review": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "window_hours",
              "would_block_requests",
              "blocked_requests",
              "top_rules",
              "note"
            ],
            "properties": {
              "window_hours": {
                "type": "integer"
              },
              "would_block_requests": {
                "type": "integer",
                "minimum": 0
              },
              "blocked_requests": {
                "type": "integer",
                "minimum": 0
              },
              "top_rules": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "rule_id",
                    "category",
                    "description",
                    "matches"
                  ],
                  "properties": {
                    "rule_id": {
                      "type": "integer"
                    },
                    "category": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "matches": {
                      "type": "integer"
                    }
                  }
                }
              },
              "note": {
                "type": "string"
              }
            }
          },
          "policy_updated_at": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      }
    }
  },
  "impreza_get_traffic_switch": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "switch_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "source_deployment_id",
      "source_name",
      "source_hostname",
      "target_deployment_id",
      "target_name",
      "target_state",
      "target_upstream",
      "may_interrupt_traffic",
      "health_requirement",
      "rollback",
      "source_hostname_removed"
    ],
    "properties": {
      "switch_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "source_deployment_id": {
        "type": "string"
      },
      "source_name": {
        "type": "string"
      },
      "source_hostname": {
        "type": "string"
      },
      "target_deployment_id": {
        "type": "string"
      },
      "target_name": {
        "type": "string"
      },
      "target_state": {
        "type": "string"
      },
      "target_upstream": {
        "type": "string"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "health_requirement": {
        "type": "string"
      },
      "rollback": {
        "type": "string"
      },
      "source_hostname_removed": {
        "type": "boolean"
      }
    }
  },
  "impreza_get_update_policy": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "agent_id",
      "update_channel",
      "pinned_version",
      "maintenance_window_utc",
      "update",
      "end_of_life",
      "supported_command",
      "offer",
      "last_job"
    ],
    "properties": {
      "agent_id": {
        "type": "string"
      },
      "update_channel": {
        "type": "string"
      },
      "pinned_version": {
        "type": [
          "string",
          "null"
        ]
      },
      "maintenance_window_utc": {
        "type": [
          "object",
          "null"
        ]
      },
      "update": {
        "type": "object"
      },
      "end_of_life": {
        "type": [
          "object",
          "null"
        ]
      },
      "supported_command": {
        "type": "boolean"
      },
      "offer": {
        "type": "object"
      },
      "last_job": {
        "type": [
          "object",
          "null"
        ]
      }
    }
  },
  "impreza_get_variable_group": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "group_id",
      "project_id",
      "environment_id",
      "revision",
      "variables",
      "note"
    ],
    "properties": {
      "group_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "project_id": {
        "type": "string"
      },
      "environment_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "revision": {
        "type": "integer"
      },
      "variables": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name",
            "secret",
            "value"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "secret": {
              "type": "boolean"
            },
            "value": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_get_zero_downtime": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "app_kind",
      "zero_downtime"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "app_kind": {
        "type": "string",
        "enum": [
          "custom",
          "catalog"
        ]
      },
      "zero_downtime": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "enabled",
          "policy",
          "eligible",
          "can_opt_in",
          "reasons",
          "ineligible_reason",
          "agent_supported",
          "minimum_agent_version",
          "minimum_agent_released",
          "last"
        ],
        "properties": {
          "enabled": {
            "type": "boolean"
          },
          "policy": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "type": "object",
                "required": [
                  "path",
                  "status_min",
                  "status_max",
                  "timeout_seconds",
                  "drain_seconds"
                ],
                "properties": {
                  "path": {
                    "type": "string"
                  },
                  "status_min": {
                    "type": "integer"
                  },
                  "status_max": {
                    "type": "integer"
                  },
                  "timeout_seconds": {
                    "type": "integer"
                  },
                  "drain_seconds": {
                    "type": "integer"
                  }
                }
              }
            ]
          },
          "eligible": {
            "type": "boolean",
            "description": "True only when nothing at all prevents a zero-downtime redeploy."
          },
          "can_opt_in": {
            "type": "boolean",
            "description": "False when an app reason refuses the opt-in; agent reasons do not."
          },
          "reasons": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "code",
                "scope",
                "message",
                "remedy"
              ],
              "properties": {
                "code": {
                  "type": "string",
                  "enum": [
                    "catalog_app",
                    "preview",
                    "tor_egress",
                    "sandbox",
                    "no_proxy_route",
                    "compose_unreadable",
                    "multiple_services",
                    "container_name",
                    "network_mode",
                    "not_on_proxy_network",
                    "fixed_host_port",
                    "writable_volume",
                    "agent_unknown",
                    "agent_unsupported"
                  ]
                },
                "scope": {
                  "type": "string",
                  "enum": [
                    "app",
                    "agent"
                  ]
                },
                "message": {
                  "type": "string"
                },
                "remedy": {
                  "type": "string"
                }
              }
            }
          },
          "ineligible_reason": {
            "type": [
              "string",
              "null"
            ]
          },
          "agent_supported": {
            "type": "boolean"
          },
          "minimum_agent_version": {
            "type": "string"
          },
          "minimum_agent_released": {
            "type": "boolean"
          },
          "last": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "type": "object",
                "required": [
                  "outcome",
                  "phase",
                  "reason"
                ],
                "properties": {
                  "outcome": {
                    "type": "string"
                  },
                  "phase": {
                    "type": "string"
                  },
                  "reason": {
                    "type": "string"
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  "impreza_git_webhook_status": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "git_url",
      "branch",
      "mode",
      "webhook_id",
      "enabled",
      "payload_url"
    ],
    "properties": {
      "git_url": {
        "type": "string"
      },
      "branch": {
        "type": "string"
      },
      "mode": {
        "type": "string",
        "enum": [
          "github",
          "manual",
          "none"
        ]
      },
      "webhook_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "enabled": {
        "type": "boolean"
      },
      "payload_url": {
        "type": "string"
      }
    }
  },
  "impreza_host_permissions": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "permissions",
      "state",
      "note"
    ],
    "properties": {
      "permissions": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "operation": {
              "type": "string",
              "const": "vps.reinstall"
            },
            "service_id": {
              "type": "integer"
            },
            "allowed": {
              "type": "boolean"
            },
            "daily_requests": {
              "type": "integer"
            },
            "max_pending": {
              "type": "integer"
            },
            "expires_at": {
              "type": [
                "string",
                "null"
              ]
            }
          },
          "required": [
            "operation",
            "service_id",
            "allowed",
            "daily_requests",
            "max_pending",
            "expires_at"
          ]
        }
      },
      "state": {
        "type": "string",
        "enum": [
          "available",
          "unavailable"
        ]
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_inspect_app": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "read",
      "note"
    ],
    "properties": {
      "read": {
        "type": "object"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_list_alerts": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "rules",
      "alerts"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "rules": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "rule_id",
            "deployment_id",
            "metric",
            "threshold",
            "duration_minutes",
            "enabled",
            "created_at"
          ],
          "properties": {
            "rule_id": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "metric": {
              "type": "string"
            },
            "threshold": {
              "type": "integer"
            },
            "duration_minutes": {
              "type": "integer"
            },
            "enabled": {
              "type": "integer"
            },
            "created_at": {
              "type": "string"
            }
          }
        }
      },
      "alerts": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "alert_id",
            "metric",
            "status",
            "threshold",
            "duration_minutes",
            "opened_at",
            "resolved_at",
            "evidence"
          ],
          "properties": {
            "alert_id": {
              "type": "string"
            },
            "metric": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "threshold": {
              "type": [
                "integer",
                "null"
              ]
            },
            "duration_minutes": {
              "type": [
                "integer",
                "null"
              ]
            },
            "opened_at": {
              "type": "string"
            },
            "resolved_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "evidence": {
              "type": [
                "object",
                "array"
              ]
            }
          }
        }
      }
    }
  },
  "impreza_list_approvals": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "approvals",
      "note"
    ],
    "properties": {
      "approvals": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "approval_id",
            "client_id",
            "token_id",
            "operation",
            "params_digest",
            "summary",
            "quote_cents",
            "surface",
            "status",
            "created_at",
            "expires_at",
            "decided_at",
            "decided_by_label",
            "consumed_at"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "approval_id": {
              "type": "string",
              "pattern": "^apr_[a-f0-9]{32}$"
            },
            "client_id": {
              "type": "integer"
            },
            "token_id": {
              "type": "integer"
            },
            "operation": {
              "type": "string"
            },
            "params_digest": {
              "type": "string",
              "pattern": "^[a-f0-9]{64}$"
            },
            "summary": {
              "type": [
                "object",
                "array"
              ],
              "$comment": "The stored non-secret summary (always an object with operation when written by createRequest); [] when the stored JSON is missing or unreadable."
            },
            "quote_cents": {
              "type": "integer"
            },
            "surface": {
              "type": "string"
            },
            "status": {
              "type": "string",
              "enum": [
                "pending",
                "approved",
                "denied",
                "consumed",
                "expired"
              ]
            },
            "created_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "expires_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "decided_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "decided_by_label": {
              "type": [
                "string",
                "null"
              ]
            },
            "consumed_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_list_apps": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "apps",
      "total"
    ],
    "properties": {
      "apps": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name",
            "display_name",
            "version",
            "category",
            "tags",
            "description",
            "icon_url",
            "readme_url",
            "requirements",
            "supports",
            "vars"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "display_name": {
              "type": "string"
            },
            "version": {
              "type": "string"
            },
            "category": {
              "type": "string"
            },
            "tags": {
              "type": "array"
            },
            "description": {
              "type": "string"
            },
            "icon_url": {
              "type": "string"
            },
            "readme_url": {
              "type": "string"
            },
            "requirements": {
              "type": "object"
            },
            "supports": {
              "type": "object"
            },
            "vars": {
              "type": "array"
            }
          }
        }
      },
      "total": {
        "type": "integer"
      }
    }
  },
  "impreza_list_backups": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "backups"
    ],
    "properties": {
      "backups": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "backup_id",
            "kind",
            "deployment_id",
            "status",
            "bucket",
            "prefix",
            "chunks",
            "total_bytes",
            "source_backup_id",
            "replaced_path",
            "error",
            "created_at",
            "completed_at"
          ],
          "properties": {
            "backup_id": {
              "type": "string"
            },
            "kind": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "bucket": {
              "type": "string"
            },
            "prefix": {
              "type": "string"
            },
            "chunks": {
              "type": "integer"
            },
            "total_bytes": {
              "type": "integer"
            },
            "source_backup_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "replaced_path": {
              "type": [
                "string",
                "null"
              ]
            },
            "error": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "completed_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "schedule": {
        "type": "object"
      },
      "storage": {
        "type": "object"
      }
    }
  },
  "impreza_list_contexts": {
    "type": "object",
    "additionalProperties": false,
    "required": [],
    "properties": {
      "contexts": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "context_id",
            "label",
            "sha256",
            "size_bytes",
            "retained",
            "in_use",
            "available",
            "state",
            "created_at",
            "expires_at",
            "unused_expires_at"
          ],
          "properties": {
            "context_id": {
              "type": "string"
            },
            "label": {
              "type": "string"
            },
            "sha256": {
              "type": "string"
            },
            "size_bytes": {
              "type": "integer"
            },
            "retained": {
              "type": "boolean"
            },
            "in_use": {
              "type": "boolean"
            },
            "available": {
              "type": "boolean"
            },
            "state": {
              "type": "string",
              "enum": [
                "expired",
                "consumed",
                "missing",
                "in_use",
                "available"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "expires_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "unused_expires_at": {
              "type": "string"
            }
          }
        }
      },
      "limit": {
        "type": "integer"
      },
      "retention_days": {
        "type": "integer"
      },
      "context_id": {
        "type": "string"
      },
      "label": {
        "type": "string"
      },
      "sha256": {
        "type": "string"
      },
      "size_bytes": {
        "type": "integer"
      },
      "retained": {
        "type": "boolean"
      },
      "in_use": {
        "type": "boolean"
      },
      "available": {
        "type": "boolean"
      },
      "state": {
        "type": "string",
        "enum": [
          "expired",
          "consumed",
          "missing",
          "in_use",
          "available"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "expires_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "unused_expires_at": {
        "type": "string"
      }
    }
  },
  "impreza_list_credentials": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "credentials",
      "note"
    ],
    "properties": {
      "credentials": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "label",
            "owner",
            "scopes",
            "resources",
            "state",
            "expires_at",
            "last_used_at",
            "created_at",
            "minted_by",
            "origin"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "label": {
              "type": "string"
            },
            "owner": {
              "type": [
                "object",
                "null"
              ]
            },
            "scopes": {
              "type": "array"
            },
            "resources": {
              "type": [
                "object",
                "null"
              ]
            },
            "state": {
              "type": "string",
              "enum": [
                "active",
                "expired",
                "revoked"
              ]
            },
            "expires_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "last_used_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "minted_by": {
              "type": [
                "integer",
                "null"
              ]
            },
            "origin": {
              "type": "string",
              "enum": [
                "oauth",
                "sub-credential",
                "direct"
              ]
            },
            "spend_cap_cents": {
              "type": "integer"
            },
            "spend_remaining_cents": {
              "type": "integer"
            },
            "spend_monthly_cap_cents": {
              "type": "integer"
            },
            "spend_monthly_remaining_cents": {
              "type": "integer"
            },
            "quotas": {
              "type": "object"
            },
            "hitl_policy": {
              "type": "object"
            }
          }
        }
      },
      "you_are": {
        "type": [
          "integer",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_list_deployments": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployments",
      "total",
      "catalog_count",
      "custom_count"
    ],
    "properties": {
      "deployments": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "runtime",
            "last_operation",
            "agent_id",
            "status",
            "domain",
            "onion",
            "onion_profile",
            "onion_exported_at",
            "vars",
            "created_at",
            "last_health_at",
            "last_error"
          ],
          "properties": {
            "id": {
              "type": "string"
            },
            "runtime": {
              "type": "object"
            },
            "last_operation": {
              "type": [
                "object",
                "null"
              ]
            },
            "agent_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "domain": {
              "type": [
                "string",
                "null"
              ]
            },
            "onion": {
              "type": [
                "string",
                "null"
              ]
            },
            "onion_profile": {
              "type": "string"
            },
            "onion_exported_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "vars": {
              "type": [
                "object",
                "array"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "last_health_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "last_error": {
              "type": [
                "string",
                "null"
              ]
            },
            "app_name": {
              "type": "string"
            },
            "app_version": {
              "type": "string"
            },
            "network_mode": {
              "type": "string"
            },
            "connection_info": {
              "type": [
                "object",
                "null"
              ]
            },
            "signup_window": {
              "type": [
                "object",
                "null"
              ]
            },
            "name": {
              "type": "string"
            },
            "mode": {
              "type": "string"
            },
            "service_binding": {
              "type": [
                "object",
                "null"
              ]
            },
            "shield": {
              "type": "object"
            },
            "proxy_metrics": {
              "type": [
                "object",
                "null"
              ]
            },
            "image": {
              "type": "string"
            },
            "context_id": {
              "type": "string"
            },
            "tor_egress": {
              "type": "boolean"
            },
            "source_artifact": {
              "type": [
                "object",
                "null"
              ]
            },
            "project_plan": {
              "type": [
                "object",
                "null"
              ]
            },
            "git_url": {
              "type": "string"
            },
            "git_ref": {
              "type": "string"
            },
            "build_strategy": {
              "type": [
                "string",
                "null"
              ]
            },
            "static_options": {
              "type": [
                "object",
                "null"
              ]
            },
            "project_dir": {
              "type": [
                "string",
                "null"
              ]
            },
            "build_secret_names": {
              "type": "array"
            },
            "npm_workspace": {
              "type": [
                "string",
                "null"
              ]
            },
            "python_package_manager": {
              "type": [
                "string",
                "null"
              ]
            },
            "node_package_manager": {
              "type": [
                "string",
                "null"
              ]
            },
            "public_build_vars": {
              "type": [
                "object",
                "null"
              ]
            },
            "startup_health": {
              "type": "object"
            },
            "php_document_root": {
              "type": [
                "string",
                "null"
              ]
            },
            "start_command": {
              "type": [
                "string",
                "null"
              ]
            },
            "healthcheck_path": {
              "type": [
                "string",
                "null"
              ]
            },
            "go_package": {
              "type": [
                "string",
                "null"
              ]
            },
            "static_spa": {
              "type": [
                "boolean",
                "null"
              ]
            },
            "git_auth": {
              "type": "object"
            },
            "cpus": {
              "type": "number"
            },
            "memory_mb": {
              "type": "integer"
            },
            "zero_downtime": {
              "type": [
                "object",
                "null"
              ]
            }
          }
        }
      },
      "total": {
        "type": "integer"
      },
      "catalog_count": {
        "type": "integer"
      },
      "custom_count": {
        "type": "integer"
      }
    }
  },
  "impreza_list_environment_deploys": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "environment_id",
      "project_id",
      "batches",
      "note"
    ],
    "properties": {
      "environment_id": {
        "type": "string"
      },
      "project_id": {
        "type": "string"
      },
      "batches": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "batch_id",
            "status",
            "require_healthy",
            "cursor",
            "stage_count",
            "error",
            "created_at",
            "finished_at"
          ],
          "properties": {
            "batch_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "require_healthy": {
              "type": "boolean"
            },
            "cursor": {
              "type": "integer"
            },
            "stage_count": {
              "type": "integer"
            },
            "error": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            },
            "finished_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_list_invoices": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "invoices",
      "total"
    ],
    "properties": {
      "invoices": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "invoice_num",
            "date",
            "due_date",
            "date_paid",
            "subtotal",
            "credit",
            "tax",
            "total",
            "status",
            "payment_method"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "invoice_num": {
              "type": "string"
            },
            "date": {
              "type": [
                "string",
                "null"
              ]
            },
            "due_date": {
              "type": [
                "string",
                "null"
              ]
            },
            "date_paid": {
              "type": [
                "string",
                "null"
              ]
            },
            "subtotal": {
              "type": "number"
            },
            "credit": {
              "type": "number"
            },
            "tax": {
              "type": "number"
            },
            "total": {
              "type": "number"
            },
            "status": {
              "type": [
                "string",
                "null"
              ]
            },
            "payment_method": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "total": {
        "type": "integer"
      }
    }
  },
  "impreza_list_prepared_deployments": {
    "type": "object",
    "additionalProperties": false,
    "required": [],
    "properties": {
      "prepared_deployments": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "execution_id",
            "status",
            "configuration_digest",
            "created_at",
            "expires_at",
            "receipt",
            "plan_id",
            "option_index",
            "source",
            "configuration",
            "agent_public_ip",
            "reserves_capacity"
          ],
          "properties": {
            "execution_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "configuration_digest": {
              "type": "string"
            },
            "created_at": {
              "type": "string"
            },
            "expires_at": {
              "type": "string"
            },
            "receipt": {
              "type": [
                "object",
                "null"
              ]
            },
            "plan_id": {
              "type": "string"
            },
            "option_index": {
              "type": "integer"
            },
            "source": {
              "type": "object"
            },
            "configuration": {
              "type": "object"
            },
            "agent_public_ip": {
              "type": "string"
            },
            "reserves_capacity": {
              "type": "boolean"
            }
          }
        }
      },
      "limit": {
        "type": "integer"
      },
      "execution_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "configuration_digest": {
        "type": "string"
      },
      "created_at": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "plan_id": {
        "type": "string"
      },
      "option_index": {
        "type": "integer"
      },
      "source": {
        "type": "object"
      },
      "configuration": {
        "type": "object"
      },
      "agent_public_ip": {
        "type": "string"
      },
      "reserves_capacity": {
        "type": "boolean"
      }
    }
  },
  "impreza_list_previews": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deployment_id",
      "settings",
      "previews",
      "note"
    ],
    "properties": {
      "deployment_id": {
        "type": "string"
      },
      "settings": {
        "type": "object"
      },
      "previews": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "branch",
            "name",
            "status",
            "url",
            "onion",
            "protected",
            "expires_at",
            "created_at",
            "preview_of",
            "teardown",
            "git_credential_source",
            "warning"
          ],
          "properties": {
            "id": {
              "type": "string"
            },
            "branch": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "url": {
              "type": [
                "string",
                "null"
              ]
            },
            "onion": {
              "type": [
                "string",
                "null"
              ]
            },
            "protected": {
              "type": "boolean"
            },
            "expires_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "preview_of": {
              "type": "string"
            },
            "git_credential_source": {
              "type": [
                "string",
                "null"
              ]
            },
            "warning": {
              "type": [
                "string",
                "null"
              ]
            },
            "teardown": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "volumes",
                "onion_keys",
                "backups",
                "billing"
              ],
              "properties": {
                "volumes": {
                  "type": "string"
                },
                "onion_keys": {
                  "type": "string"
                },
                "backups": {
                  "type": "string"
                },
                "billing": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "note": {
        "type": [
          "string",
          "null"
        ]
      }
    }
  },
  "impreza_list_project_plans": {
    "type": "object",
    "additionalProperties": false,
    "required": [],
    "properties": {
      "plans": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "plan_id",
            "status",
            "expires_at",
            "created_at",
            "reusable",
            "reserves_capacity",
            "project_dir",
            "npm_workspace",
            "analysis",
            "inventory",
            "executes_code",
            "source",
            "inspection_revision"
          ],
          "properties": {
            "plan_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "expires_at": {
              "type": "string"
            },
            "created_at": {
              "type": "string"
            },
            "reusable": {
              "type": "boolean"
            },
            "reserves_capacity": {
              "type": "boolean"
            },
            "project_dir": {
              "type": "string"
            },
            "npm_workspace": {
              "type": [
                "string",
                "null"
              ]
            },
            "analysis": {
              "type": "object"
            },
            "inventory": {
              "type": "object"
            },
            "executes_code": {
              "type": "boolean"
            },
            "source": {
              "type": "object"
            },
            "inspection_revision": {
              "type": "string"
            }
          }
        }
      },
      "limit": {
        "type": "integer"
      },
      "plan_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "created_at": {
        "type": "string"
      },
      "reusable": {
        "type": "boolean"
      },
      "reserves_capacity": {
        "type": "boolean"
      },
      "project_dir": {
        "type": "string"
      },
      "npm_workspace": {
        "type": [
          "string",
          "null"
        ]
      },
      "analysis": {
        "type": "object"
      },
      "inventory": {
        "type": "object"
      },
      "executes_code": {
        "type": "boolean"
      },
      "source": {
        "type": "object"
      },
      "inspection_revision": {
        "type": "string"
      }
    }
  },
  "impreza_list_projects": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "projects",
      "services_loaded"
    ],
    "properties": {
      "projects": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "project_id",
            "name"
          ],
          "properties": {
            "project_id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "environments": {
              "type": "array"
            }
          }
        }
      },
      "services_loaded": {
        "type": "boolean"
      }
    }
  },
  "impreza_list_servers": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "servers",
      "total"
    ],
    "properties": {
      "servers": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "agent_id",
            "hostname",
            "origin",
            "service_id",
            "status",
            "version",
            "update_policy",
            "agent_update",
            "last_seen_at",
            "registered_at",
            "tor",
            "capacity"
          ],
          "properties": {
            "agent_id": {
              "type": "string"
            },
            "hostname": {
              "type": [
                "string",
                "null"
              ]
            },
            "origin": {
              "type": "string"
            },
            "service_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "status": {
              "type": "string"
            },
            "version": {
              "type": [
                "string",
                "null"
              ]
            },
            "update_policy": {
              "type": "object"
            },
            "agent_update": {
              "type": "object"
            },
            "last_seen_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "registered_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "tor": {
              "type": [
                "object",
                "null"
              ]
            },
            "capacity": {
              "type": [
                "object",
                "null"
              ]
            }
          }
        }
      },
      "total": {
        "type": "integer"
      }
    }
  },
  "impreza_list_services": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "services",
      "total"
    ],
    "properties": {
      "services": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "domain",
            "status",
            "product",
            "product_group",
            "billing_cycle",
            "amount",
            "dedicated_ip",
            "registered_at",
            "next_due",
            "vps_backend",
            "is_dedicated",
            "platform"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "domain": {
              "type": [
                "string",
                "null"
              ]
            },
            "status": {
              "type": "string"
            },
            "product": {
              "type": [
                "string",
                "null"
              ]
            },
            "product_group": {
              "type": [
                "string",
                "null"
              ]
            },
            "billing_cycle": {
              "type": [
                "string",
                "null"
              ]
            },
            "amount": {
              "type": "number"
            },
            "dedicated_ip": {
              "type": [
                "string",
                "null"
              ]
            },
            "registered_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "next_due": {
              "type": [
                "string",
                "null"
              ]
            },
            "vps_backend": {
              "type": [
                "string",
                "null"
              ]
            },
            "is_dedicated": {
              "type": "boolean"
            },
            "platform": {
              "type": [
                "object",
                "null"
              ]
            }
          }
        }
      },
      "total": {
        "type": "integer"
      }
    }
  },
  "impreza_list_tasks": {
    "type": "object",
    "additionalProperties": false,
    "required": [],
    "properties": {
      "tasks": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "task_id",
            "deployment_id",
            "name",
            "kind",
            "http_method",
            "http_path",
            "image",
            "command",
            "schedule",
            "at_hour",
            "at_weekday",
            "enabled",
            "keep_runs",
            "last_run_at",
            "created_at"
          ],
          "properties": {
            "task_id": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "kind": {
              "type": "string"
            },
            "http_method": {
              "type": "string"
            },
            "http_path": {
              "type": "string"
            },
            "image": {
              "type": [
                "string",
                "null"
              ]
            },
            "command": {
              "type": [
                "string",
                "null"
              ]
            },
            "schedule": {
              "type": "string"
            },
            "at_hour": {
              "type": [
                "integer",
                "null"
              ]
            },
            "at_weekday": {
              "type": [
                "integer",
                "null"
              ]
            },
            "enabled": {
              "type": "boolean"
            },
            "keep_runs": {
              "type": "integer"
            },
            "last_run_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            }
          }
        }
      },
      "task": {
        "type": "object"
      },
      "runs": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "run_id",
            "task_id",
            "status",
            "exit_code",
            "output",
            "error",
            "started_at",
            "finished_at"
          ],
          "properties": {
            "run_id": {
              "type": "string"
            },
            "task_id": {
              "type": "string"
            },
            "status": {
              "type": "string"
            },
            "exit_code": {
              "type": [
                "integer",
                "null"
              ]
            },
            "output": {
              "type": [
                "string",
                "null"
              ]
            },
            "error": {
              "type": [
                "string",
                "null"
              ]
            },
            "started_at": {
              "type": "string"
            },
            "finished_at": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      }
    }
  },
  "impreza_list_webhooks": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "webhooks",
      "total"
    ],
    "properties": {
      "webhooks": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "url",
            "events",
            "description",
            "is_active",
            "last_delivery_at",
            "last_delivery_status",
            "created_at"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "url": {
              "type": "string"
            },
            "events": {
              "type": "array"
            },
            "description": {
              "type": "string"
            },
            "is_active": {
              "type": "boolean"
            },
            "last_delivery_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "last_delivery_status": {
              "type": [
                "integer",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            }
          }
        }
      },
      "total": {
        "type": "integer"
      }
    }
  },
  "impreza_mint_subcredential": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "credential_id",
      "scopes",
      "expires_at",
      "ttl_seconds",
      "spend_cap_cents",
      "spend_monthly_cap_cents",
      "quotas",
      "hitl_policy",
      "resources",
      "label",
      "note"
    ],
    "properties": {
      "credential_id": {
        "type": "integer"
      },
      "scopes": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "expires_at": {
        "type": "string"
      },
      "ttl_seconds": {
        "type": "integer"
      },
      "spend_cap_cents": {
        "type": "integer"
      },
      "spend_monthly_cap_cents": {
        "type": "integer"
      },
      "quotas": {
        "type": [
          "object",
          "null"
        ]
      },
      "hitl_policy": {
        "type": [
          "object",
          "null"
        ]
      },
      "resources": {
        "type": [
          "object",
          "null"
        ]
      },
      "label": {
        "type": "string"
      },
      "minted_by": {
        "type": [
          "integer",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_onion_auth_add": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "pubkey",
      "command_id"
    ],
    "properties": {
      "name": {
        "type": "string",
        "pattern": "^[a-z0-9][a-z0-9_-]{0,31}$"
      },
      "pubkey": {
        "type": "string",
        "pattern": "^[A-Z2-7]{52}$"
      },
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "private_note": {
        "type": "string"
      }
    }
  },
  "impreza_onion_auth_list": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "restricted",
      "clients"
    ],
    "properties": {
      "restricted": {
        "type": "boolean"
      },
      "clients": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name",
            "created_at"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "created_at": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "impreza_onion_auth_revoke": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "revoked",
      "command_id"
    ],
    "properties": {
      "name": {
        "type": "string"
      },
      "revoked": {
        "type": "boolean",
        "const": true
      },
      "command_id": {
        "type": "string"
      }
    }
  },
  "impreza_pause_agent": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "agent_id",
      "status",
      "paused"
    ],
    "properties": {
      "agent_id": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "online",
          "offline",
          "draining"
        ]
      },
      "paused": {
        "type": "boolean"
      }
    }
  },
  "impreza_plan_project": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "status",
      "expires_at",
      "created_at",
      "reusable",
      "reserves_capacity",
      "project_dir",
      "npm_workspace",
      "analysis",
      "inventory",
      "executes_code",
      "source",
      "inspection_revision"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "created_at": {
        "type": "string"
      },
      "reusable": {
        "type": "boolean"
      },
      "reserves_capacity": {
        "type": "boolean"
      },
      "project_dir": {
        "type": "string"
      },
      "npm_workspace": {
        "type": [
          "string",
          "null"
        ]
      },
      "analysis": {
        "type": "object"
      },
      "inventory": {
        "type": "object"
      },
      "executes_code": {
        "type": "boolean"
      },
      "source": {
        "type": "object"
      },
      "inspection_revision": {
        "type": "string"
      }
    }
  },
  "impreza_prepare_compose": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "analysis_id",
      "status",
      "services",
      "volumes",
      "variables",
      "web_service",
      "target_port",
      "source_context_id",
      "source_files",
      "auxiliary_files",
      "environment_files",
      "changes",
      "warnings",
      "errors",
      "unverified",
      "parameters"
    ],
    "properties": {
      "analysis_id": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "blocked",
          "needs_input",
          "ready_for_review"
        ]
      },
      "services": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name",
            "image",
            "tcp_ports",
            "environment_names",
            "depends_on",
            "volumes",
            "has_healthcheck"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "image": {
              "type": [
                "string",
                "null"
              ]
            },
            "tcp_ports": {
              "type": "array"
            },
            "environment_names": {
              "type": "array"
            },
            "depends_on": {
              "type": "array"
            },
            "volumes": {
              "type": "array"
            },
            "has_healthcheck": {
              "type": "boolean"
            }
          }
        }
      },
      "volumes": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "variables": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name",
            "required",
            "nonempty",
            "services"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "required": {
              "type": "boolean"
            },
            "nonempty": {
              "type": "boolean"
            },
            "services": {
              "type": "array"
            }
          }
        }
      },
      "web_service": {
        "type": [
          "string",
          "null"
        ]
      },
      "target_port": {
        "type": [
          "integer",
          "null"
        ]
      },
      "source_context_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "source_files": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "auxiliary_files": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "environment_files": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "changes": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "warnings": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "code",
            "path",
            "message"
          ],
          "properties": {
            "code": {
              "type": "string"
            },
            "path": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "errors": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "code",
            "path",
            "message"
          ],
          "properties": {
            "code": {
              "type": "string"
            },
            "path": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "unverified": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "parameters": {
        "type": [
          "object",
          "null"
        ]
      }
    }
  },
  "impreza_prepare_config_promotion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "promotion_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "source_environment_id",
      "source_environment_name",
      "target_environment_id",
      "target_environment_name",
      "group_variables",
      "components",
      "unpaired_components",
      "replaces_target_user_variables",
      "copies_secret_values",
      "takes_effect"
    ],
    "properties": {
      "promotion_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "source_environment_id": {
        "type": "string"
      },
      "source_environment_name": {
        "type": "string"
      },
      "target_environment_id": {
        "type": "string"
      },
      "target_environment_name": {
        "type": "string"
      },
      "group_variables": {
        "type": "object"
      },
      "components": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "component",
            "role",
            "deployment_id",
            "variables",
            "kept_on_target"
          ],
          "properties": {
            "component": {
              "type": "string"
            },
            "role": {
              "type": "string"
            },
            "deployment_id": {
              "type": "string"
            },
            "variables": {
              "type": "object"
            },
            "kept_on_target": {
              "type": "array"
            }
          }
        }
      },
      "unpaired_components": {
        "type": "object"
      },
      "replaces_target_user_variables": {
        "type": "boolean"
      },
      "copies_secret_values": {
        "type": "string"
      },
      "takes_effect": {
        "type": "string"
      }
    }
  },
  "impreza_prepare_database_restore": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "source_backup",
      "source_deployment_id",
      "target",
      "cutover"
    ],
    "properties": {
      "plan_id": {
        "type": "string",
        "pattern": "^rspl_[a-f0-9]{24}$"
      },
      "review_digest": {
        "type": "string",
        "pattern": "^[a-f0-9]{64}$"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "const": "ready_for_review"
      },
      "receipt": {
        "type": "null"
      },
      "operation": {
        "type": "string",
        "const": "database_restore"
      },
      "source_backup": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "backup_id",
          "created_at",
          "total_bytes",
          "tables"
        ],
        "properties": {
          "backup_id": {
            "type": "string"
          },
          "created_at": {
            "type": [
              "string",
              "null"
            ]
          },
          "total_bytes": {
            "type": "integer"
          },
          "tables": {
            "type": "integer"
          }
        }
      },
      "source_deployment_id": {
        "type": "string"
      },
      "target": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "provider_deployment_id",
          "database",
          "owner",
          "binding_id"
        ],
        "properties": {
          "provider_deployment_id": {
            "type": "string"
          },
          "database": {
            "type": "string"
          },
          "owner": {
            "type": "string"
          },
          "binding_id": {
            "type": "string"
          }
        }
      },
      "cutover": {
        "type": "string"
      }
    }
  },
  "impreza_prepare_host_plan": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "plan_id": {
        "type": "string",
        "pattern": "^hpl_[a-f0-9]{32}$"
      },
      "operation": {
        "type": "string",
        "const": "vps.reinstall"
      },
      "service_id": {
        "type": "integer"
      },
      "template_id": {
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
          "refused"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "provider_ref": {
        "type": [
          "string",
          "null"
        ]
      },
      "note": {
        "type": "string"
      }
    },
    "required": [
      "plan_id",
      "operation",
      "service_id",
      "template_id",
      "plan_digest",
      "approval_id",
      "status",
      "created_at",
      "expires_at",
      "provider_ref",
      "note"
    ]
  },
  "impreza_prepare_image_promotion": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "promotion_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "source_deployment_id",
      "target_deployment_id",
      "source_command_id",
      "previous_image",
      "image",
      "target_domain",
      "target_agent_id",
      "target_cpus",
      "target_memory_mb",
      "target_variable_names",
      "copies_source_variables",
      "may_interrupt_traffic",
      "evidence"
    ],
    "properties": {
      "promotion_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "source_deployment_id": {
        "type": "string"
      },
      "target_deployment_id": {
        "type": "string"
      },
      "source_command_id": {
        "type": "string"
      },
      "previous_image": {
        "type": [
          "string",
          "null"
        ]
      },
      "image": {
        "type": "string"
      },
      "target_domain": {
        "type": [
          "string",
          "null"
        ]
      },
      "target_agent_id": {
        "type": "string"
      },
      "target_cpus": {
        "type": "number"
      },
      "target_memory_mb": {
        "type": "integer"
      },
      "target_variable_names": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "copies_source_variables": {
        "type": "boolean"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "evidence": {
        "type": "string"
      }
    }
  },
  "impreza_prepare_pitr_restore": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "target_time",
      "database_provider",
      "base",
      "wal_segments_available",
      "last_drain_at",
      "target",
      "phases",
      "cutover"
    ],
    "properties": {
      "plan_id": {
        "type": "string",
        "pattern": "^ppl_[a-f0-9]{24}$"
      },
      "review_digest": {
        "type": "string",
        "pattern": "^[a-f0-9]{64}$"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "const": "ready_for_review"
      },
      "receipt": {
        "type": "null"
      },
      "operation": {
        "type": "string",
        "const": "pitr_restore"
      },
      "target_time": {
        "type": "string"
      },
      "database_provider": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "deployment_id",
          "database"
        ],
        "properties": {
          "deployment_id": {
            "type": "string"
          },
          "database": {
            "type": "string"
          }
        }
      },
      "base": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "start_segment",
          "created_at"
        ],
        "properties": {
          "id": {
            "type": "string"
          },
          "start_segment": {
            "type": "string"
          },
          "created_at": {
            "type": "string"
          }
        }
      },
      "wal_segments_available": {
        "type": "integer",
        "minimum": 1
      },
      "last_drain_at": {
        "type": "string"
      },
      "target": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "consumer_deployment_id",
          "binding_id",
          "restore_database"
        ],
        "properties": {
          "consumer_deployment_id": {
            "type": "string"
          },
          "binding_id": {
            "type": "string"
          },
          "restore_database": {
            "type": "string"
          }
        }
      },
      "phases": {
        "type": "string"
      },
      "cutover": {
        "type": "string"
      }
    }
  },
  "impreza_prepare_project": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "analysis_id",
      "status",
      "framework",
      "package_manager",
      "commands",
      "node_npm_recipe",
      "static_npm_recipe",
      "python_pip_recipe",
      "php_composer_recipe",
      "go_build_recipe",
      "static_files_recipe",
      "deployment_options",
      "dockerfile_path",
      "explicit_tcp_ports",
      "suggested_target_port",
      "findings",
      "source_verified",
      "creates_resources"
    ],
    "properties": {
      "analysis_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "framework": {
        "type": "string"
      },
      "package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "commands": {
        "type": [
          "object",
          "array"
        ]
      },
      "node_npm_recipe": {
        "type": "object"
      },
      "static_npm_recipe": {
        "type": "object"
      },
      "python_pip_recipe": {
        "type": "object"
      },
      "php_composer_recipe": {
        "type": "object"
      },
      "go_build_recipe": {
        "type": "object"
      },
      "static_files_recipe": {
        "type": "object"
      },
      "deployment_options": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "parameters",
            "port_basis",
            "requires_review"
          ],
          "properties": {
            "parameters": {
              "type": "object"
            },
            "port_basis": {
              "type": "string"
            },
            "requires_review": {
              "type": "boolean"
            }
          }
        }
      },
      "dockerfile_path": {
        "type": [
          "string",
          "null"
        ]
      },
      "explicit_tcp_ports": {
        "type": "array",
        "items": {
          "type": "integer"
        }
      },
      "suggested_target_port": {
        "type": [
          "integer",
          "null"
        ]
      },
      "findings": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "code",
            "message"
          ],
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            }
          }
        }
      },
      "source_verified": {
        "type": "boolean"
      },
      "creates_resources": {
        "type": "boolean"
      }
    }
  },
  "impreza_prepare_project_deployment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "execution_id",
      "status",
      "configuration_digest",
      "created_at",
      "expires_at",
      "receipt",
      "plan_id",
      "option_index",
      "source",
      "configuration",
      "agent_public_ip",
      "reserves_capacity"
    ],
    "properties": {
      "execution_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "configuration_digest": {
        "type": "string"
      },
      "created_at": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "plan_id": {
        "type": "string"
      },
      "option_index": {
        "type": "integer"
      },
      "source": {
        "type": "object"
      },
      "configuration": {
        "type": "object"
      },
      "agent_public_ip": {
        "type": "string"
      },
      "reserves_capacity": {
        "type": "boolean"
      }
    }
  },
  "impreza_prepare_service_binding": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "status",
      "expires_at",
      "receipt",
      "operation",
      "binding_id",
      "consumer_deployment_id",
      "consumer_name",
      "provider_deployment_id",
      "provider_engine",
      "environment_id",
      "variable",
      "may_interrupt_traffic",
      "database",
      "copies_provider_password",
      "opens_host_port",
      "credential_delivery"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string",
        "const": "create"
      },
      "binding_id": {
        "type": "string"
      },
      "consumer_deployment_id": {
        "type": "string"
      },
      "consumer_name": {
        "type": "string"
      },
      "provider_deployment_id": {
        "type": "string"
      },
      "provider_engine": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "variable": {
        "type": "string",
        "const": "DATABASE_URL"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "database": {
        "type": "string"
      },
      "copies_provider_password": {
        "type": "boolean"
      },
      "opens_host_port": {
        "type": "boolean"
      },
      "credential_delivery": {
        "type": "string"
      },
      "wire": {
        "type": "boolean"
      },
      "wire_components": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "wire_note": {
        "type": "string"
      }
    }
  },
  "impreza_prepare_service_binding_removal": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "status",
      "expires_at",
      "receipt",
      "operation",
      "binding_id",
      "consumer_deployment_id",
      "consumer_name",
      "provider_deployment_id",
      "provider_engine",
      "environment_id",
      "variable",
      "may_interrupt_traffic",
      "database",
      "database_data_retained",
      "login_disabled_after_replacement",
      "cleanup_retry",
      "copies_provider_password",
      "opens_host_port"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string",
        "const": "remove"
      },
      "binding_id": {
        "type": "string"
      },
      "consumer_deployment_id": {
        "type": "string"
      },
      "consumer_name": {
        "type": "string"
      },
      "provider_deployment_id": {
        "type": "string"
      },
      "provider_engine": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "variable": {
        "type": "string",
        "const": "DATABASE_URL"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "database": {
        "type": "string"
      },
      "database_data_retained": {
        "type": "boolean"
      },
      "login_disabled_after_replacement": {
        "type": "boolean"
      },
      "cleanup_retry": {
        "type": "boolean"
      },
      "copies_provider_password": {
        "type": "boolean"
      },
      "opens_host_port": {
        "type": "boolean"
      }
    }
  },
  "impreza_prepare_service_binding_rotation": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "plan_id",
      "review_digest",
      "status",
      "expires_at",
      "receipt",
      "operation",
      "binding_id",
      "consumer_deployment_id",
      "consumer_name",
      "provider_deployment_id",
      "provider_engine",
      "environment_id",
      "variable",
      "may_interrupt_traffic",
      "rotation_id",
      "database_data_retained",
      "credential_delivery",
      "require_healthy_start",
      "startup_timeout_seconds",
      "retry",
      "cleanup_only"
    ],
    "properties": {
      "plan_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string",
        "enum": [
          "rotate",
          "abandon_rotation"
        ]
      },
      "binding_id": {
        "type": "string"
      },
      "consumer_deployment_id": {
        "type": "string"
      },
      "consumer_name": {
        "type": "string"
      },
      "provider_deployment_id": {
        "type": "string"
      },
      "provider_engine": {
        "type": "string"
      },
      "environment_id": {
        "type": "string"
      },
      "variable": {
        "type": "string",
        "const": "DATABASE_URL"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "rotation_id": {
        "type": "string"
      },
      "database_data_retained": {
        "type": "boolean"
      },
      "credential_delivery": {
        "type": "string"
      },
      "require_healthy_start": {
        "type": "boolean"
      },
      "startup_timeout_seconds": {
        "type": "integer"
      },
      "retry": {
        "type": "boolean"
      },
      "cleanup_only": {
        "type": "boolean"
      }
    }
  },
  "impreza_prepare_traffic_switch": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "switch_id",
      "review_digest",
      "expires_at",
      "status",
      "receipt",
      "operation",
      "source_deployment_id",
      "source_name",
      "source_hostname",
      "target_deployment_id",
      "target_name",
      "target_state",
      "target_upstream",
      "may_interrupt_traffic",
      "health_requirement",
      "rollback",
      "source_hostname_removed"
    ],
    "properties": {
      "switch_id": {
        "type": "string"
      },
      "review_digest": {
        "type": "string"
      },
      "expires_at": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "receipt": {
        "type": [
          "object",
          "null"
        ]
      },
      "operation": {
        "type": "string"
      },
      "source_deployment_id": {
        "type": "string"
      },
      "source_name": {
        "type": "string"
      },
      "source_hostname": {
        "type": "string"
      },
      "target_deployment_id": {
        "type": "string"
      },
      "target_name": {
        "type": "string"
      },
      "target_state": {
        "type": "string"
      },
      "target_upstream": {
        "type": "string"
      },
      "may_interrupt_traffic": {
        "type": "boolean"
      },
      "health_requirement": {
        "type": "string"
      },
      "rollback": {
        "type": "string"
      },
      "source_hostname_removed": {
        "type": "boolean"
      }
    }
  },
  "impreza_privacy_report": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "account",
      "identity",
      "ip_addresses",
      "records",
      "secrets_we_hold",
      "retention_not_honoured",
      "third_parties",
      "you_can",
      "scope",
      "generated_at"
    ],
    "properties": {
      "account": {
        "type": "object"
      },
      "identity": {
        "type": "object"
      },
      "ip_addresses": {
        "type": "object"
      },
      "records": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "table",
            "holds",
            "scope",
            "rows",
            "oldest",
            "newest",
            "holds_identifying",
            "holds_content",
            "about_you",
            "retention",
            "sensitive"
          ],
          "properties": {
            "table": {
              "type": "string"
            },
            "holds": {
              "type": "string"
            },
            "scope": {
              "type": "string"
            },
            "rows": {
              "type": [
                "integer",
                "null"
              ]
            },
            "oldest": {
              "type": [
                "string",
                "null"
              ]
            },
            "newest": {
              "type": [
                "string",
                "null"
              ]
            },
            "holds_identifying": {
              "type": "boolean"
            },
            "holds_content": {
              "type": "boolean"
            },
            "about_you": {
              "type": "boolean"
            },
            "retention": {
              "type": "object"
            },
            "sensitive": {
              "type": "array"
            },
            "note": {
              "type": "string",
              "description": "Why a table is listed without counts: operator audit is our staff's data, never measured against your account."
            }
          }
        }
      },
      "secrets_we_hold": {
        "type": "object"
      },
      "retention_not_honoured": {
        "type": [
          "object",
          "null"
        ]
      },
      "third_parties": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "who",
            "sees",
            "why",
            "avoid"
          ],
          "properties": {
            "who": {
              "type": "string"
            },
            "sees": {
              "type": "string"
            },
            "why": {
              "type": "string"
            },
            "avoid": {
              "type": "string"
            }
          }
        }
      },
      "you_can": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "scope": {
        "type": "object"
      },
      "generated_at": {
        "type": "string"
      }
    }
  },
  "impreza_privileged_audit": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "events",
      "state",
      "next_cursor",
      "retention_days",
      "note"
    ],
    "properties": {
      "events": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "event_id",
            "actor_type",
            "surface",
            "verb",
            "created_at",
            "result",
            "retention_class",
            "client_id",
            "actor_id",
            "target_kind",
            "target_id",
            "plan_id",
            "plan_digest",
            "approval_id",
            "started_at",
            "finished_at",
            "provider_ref"
          ],
          "properties": {
            "event_id": {
              "type": "string"
            },
            "actor_type": {
              "type": "string"
            },
            "surface": {
              "type": "string"
            },
            "verb": {
              "type": "string"
            },
            "created_at": {
              "type": "string"
            },
            "result": {
              "type": "string"
            },
            "retention_class": {
              "type": "string"
            },
            "client_id": {
              "type": "integer"
            },
            "actor_id": {
              "type": [
                "integer",
                "null"
              ]
            },
            "target_kind": {
              "type": [
                "string",
                "null"
              ]
            },
            "target_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "plan_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "plan_digest": {
              "type": [
                "string",
                "null"
              ]
            },
            "approval_id": {
              "type": [
                "string",
                "null"
              ]
            },
            "started_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "finished_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "provider_ref": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "state": {
        "type": "string",
        "enum": [
          "available",
          "migration_required"
        ]
      },
      "next_cursor": {
        "type": [
          "string",
          "null"
        ]
      },
      "retention_days": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "operational",
          "security",
          "destructive",
          "refusal"
        ],
        "properties": {
          "operational": {
            "type": "integer",
            "const": 7
          },
          "security": {
            "type": "integer",
            "const": 30
          },
          "destructive": {
            "type": "integer",
            "const": 90
          },
          "refusal": {
            "type": "integer",
            "const": 7
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_purge_onion_key": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "mode",
      "note"
    ],
    "properties": {
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "mode": {
        "type": "string",
        "enum": [
          "agent",
          "released"
        ]
      },
      "key_material_deleted": {
        "type": "boolean",
        "const": false
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_redeploy_deployment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "id",
      "runtime",
      "last_operation",
      "name",
      "mode",
      "service_binding",
      "agent_id",
      "status",
      "domain",
      "onion",
      "onion_profile",
      "onion_exported_at",
      "shield",
      "proxy_metrics",
      "image",
      "context_id",
      "tor_egress",
      "source_artifact",
      "project_plan",
      "git_url",
      "git_ref",
      "build_strategy",
      "static_options",
      "project_dir",
      "build_secret_names",
      "npm_workspace",
      "python_package_manager",
      "node_package_manager",
      "public_build_vars",
      "startup_health",
      "php_document_root",
      "start_command",
      "healthcheck_path",
      "go_package",
      "static_spa",
      "git_auth",
      "cpus",
      "memory_mb",
      "vars",
      "created_at",
      "last_health_at",
      "last_error",
      "command_id",
      "note",
      "zero_downtime"
    ],
    "properties": {
      "id": {
        "type": "string"
      },
      "runtime": {
        "type": "object"
      },
      "last_operation": {
        "type": [
          "object",
          "null"
        ]
      },
      "name": {
        "type": "string"
      },
      "mode": {
        "type": "string"
      },
      "service_binding": {
        "type": [
          "object",
          "null"
        ]
      },
      "agent_id": {
        "type": "string"
      },
      "status": {
        "type": "string"
      },
      "domain": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion": {
        "type": [
          "string",
          "null"
        ]
      },
      "onion_profile": {
        "type": "string"
      },
      "onion_exported_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "shield": {
        "type": "object"
      },
      "proxy_metrics": {
        "type": [
          "object",
          "null"
        ]
      },
      "image": {
        "type": "string"
      },
      "context_id": {
        "type": "string"
      },
      "tor_egress": {
        "type": "boolean"
      },
      "source_artifact": {
        "type": [
          "object",
          "null"
        ]
      },
      "project_plan": {
        "type": [
          "object",
          "null"
        ]
      },
      "git_url": {
        "type": "string"
      },
      "git_ref": {
        "type": "string"
      },
      "build_strategy": {
        "type": [
          "string",
          "null"
        ]
      },
      "static_options": {
        "type": [
          "object",
          "null"
        ]
      },
      "project_dir": {
        "type": [
          "string",
          "null"
        ]
      },
      "build_secret_names": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "npm_workspace": {
        "type": [
          "string",
          "null"
        ]
      },
      "python_package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "node_package_manager": {
        "type": [
          "string",
          "null"
        ]
      },
      "public_build_vars": {
        "type": [
          "object",
          "null"
        ]
      },
      "startup_health": {
        "type": "object"
      },
      "php_document_root": {
        "type": [
          "string",
          "null"
        ]
      },
      "start_command": {
        "type": [
          "string",
          "null"
        ]
      },
      "healthcheck_path": {
        "type": [
          "string",
          "null"
        ]
      },
      "go_package": {
        "type": [
          "string",
          "null"
        ]
      },
      "static_spa": {
        "type": [
          "boolean",
          "null"
        ]
      },
      "git_auth": {
        "type": "object"
      },
      "cpus": {
        "type": "number"
      },
      "memory_mb": {
        "type": "integer"
      },
      "vars": {
        "type": [
          "object",
          "array"
        ]
      },
      "created_at": {
        "type": "string"
      },
      "last_health_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "last_error": {
        "type": [
          "string",
          "null"
        ]
      },
      "command_id": {
        "type": "string"
      },
      "note": {
        "type": "string"
      },
      "zero_downtime": {
        "type": [
          "object",
          "null"
        ]
      },
      "zero_downtime_redeploy": {
        "type": "object"
      }
    }
  },
  "impreza_rename_environment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "environment_id",
      "name",
      "replayed"
    ],
    "properties": {
      "environment_id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_rename_project": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "project_id",
      "name",
      "replayed"
    ],
    "properties": {
      "project_id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "replayed": {
        "type": "boolean"
      }
    }
  },
  "impreza_restart_deployment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "deployment"
    ],
    "properties": {
      "command_id": {
        "type": "string"
      },
      "deployment": {
        "type": "object"
      }
    }
  },
  "impreza_resume_agent": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "agent_id",
      "status",
      "paused"
    ],
    "properties": {
      "agent_id": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "online",
          "offline",
          "draining"
        ]
      },
      "paused": {
        "type": "boolean"
      }
    }
  },
  "impreza_retire_preview": {
    "type": "object",
    "anyOf": [
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "command_id",
          "deployment"
        ],
        "properties": {
          "command_id": {
            "type": "string"
          },
          "deployment": {
            "type": "object"
          }
        }
      },
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "deployment_id",
          "status",
          "note"
        ],
        "properties": {
          "deployment_id": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "note": {
            "type": "string"
          }
        }
      }
    ]
  },
  "impreza_rollback_deployment": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "deployment_id",
      "target_version",
      "status",
      "saved_configuration"
    ],
    "properties": {
      "command_id": {
        "type": "string"
      },
      "deployment_id": {
        "type": "string"
      },
      "target_version": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "const": "updating"
      },
      "saved_configuration": {
        "type": "object"
      }
    }
  },
  "impreza_rotate_onion_key": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "note"
    ],
    "properties": {
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_search_docs": {
    "type": "object",
    "anyOf": [
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "query",
          "total",
          "results",
          "source",
          "note"
        ],
        "properties": {
          "query": {
            "type": "string"
          },
          "total": {
            "type": "integer"
          },
          "source": {
            "type": "string"
          },
          "note": {
            "type": "string"
          },
          "results": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "title",
                "trail",
                "score",
                "matched",
                "excerpt"
              ],
              "properties": {
                "title": {
                  "type": "string"
                },
                "trail": {
                  "type": "string"
                },
                "score": {
                  "type": "integer"
                },
                "matched": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "excerpt": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "title",
          "trail",
          "body",
          "source"
        ],
        "properties": {
          "title": {
            "type": "string"
          },
          "trail": {
            "type": "string"
          },
          "body": {
            "type": "string"
          },
          "source": {
            "type": "string"
          }
        }
      }
    ]
  },
  "impreza_set_deployment_vars": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "vars",
      "managed",
      "managed_keys",
      "note"
    ],
    "properties": {
      "vars": {
        "type": [
          "object",
          "array"
        ]
      },
      "managed": {
        "type": [
          "object",
          "array"
        ]
      },
      "managed_keys": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "note": {
        "type": "string"
      },
      "ignored_keys": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "ignored_note": {
        "type": "string"
      }
    }
  },
  "impreza_set_onion_profile": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "command_id",
      "note",
      "profile"
    ],
    "properties": {
      "command_id": {
        "type": "string",
        "pattern": "^cmd_[A-Za-z0-9_-]{1,28}$"
      },
      "profile": {
        "type": "string",
        "enum": [
          "standard",
          "hardened",
          "max"
        ]
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_set_variable_group": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "group_id",
      "project_id",
      "environment_id",
      "revision",
      "variables",
      "note"
    ],
    "properties": {
      "group_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "project_id": {
        "type": "string"
      },
      "environment_id": {
        "type": [
          "string",
          "null"
        ]
      },
      "revision": {
        "type": "integer"
      },
      "variables": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "name",
            "secret",
            "value"
          ],
          "properties": {
            "name": {
              "type": "string"
            },
            "secret": {
              "type": "boolean"
            },
            "value": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        }
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_tail_logs": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "request_id",
      "reused",
      "status",
      "final",
      "chunks_read",
      "next_offset",
      "logs",
      "note"
    ],
    "properties": {
      "request_id": {
        "type": "string"
      },
      "reused": {
        "type": "boolean"
      },
      "status": {
        "type": "string"
      },
      "final": {
        "type": "boolean"
      },
      "chunks_read": {
        "type": "integer"
      },
      "next_offset": {
        "type": "integer"
      },
      "logs": {
        "type": "string"
      },
      "note": {
        "type": "string"
      }
    }
  },
  "impreza_topup_status": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "invoice_id",
      "amount",
      "currency",
      "method",
      "status",
      "paid_at"
    ],
    "properties": {
      "invoice_id": {
        "type": "integer"
      },
      "amount": {
        "type": "number"
      },
      "currency": {
        "type": "string"
      },
      "method": {
        "type": [
          "string",
          "null"
        ]
      },
      "status": {
        "type": "string"
      },
      "paid_at": {
        "type": [
          "string",
          "null"
        ]
      },
      "balance_after": {
        "type": "number"
      }
    }
  },
  "impreza_uninstall_deployment": {
    "type": "object",
    "anyOf": [
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "command_id",
          "deployment"
        ],
        "properties": {
          "command_id": {
            "type": "string"
          },
          "deployment": {
            "type": "object"
          }
        }
      },
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "deployment_id",
          "status",
          "note"
        ],
        "properties": {
          "deployment_id": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "note": {
            "type": "string"
          }
        }
      }
    ]
  },
  "impreza_validate_manifest": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "valid",
      "errors",
      "warnings",
      "checked"
    ],
    "properties": {
      "valid": {
        "type": "boolean"
      },
      "errors": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "code",
            "message",
            "fix"
          ],
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "fix": {
              "type": "string"
            }
          }
        }
      },
      "warnings": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "code",
            "message",
            "fix"
          ],
          "properties": {
            "code": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "fix": {
              "type": "string"
            }
          }
        }
      },
      "checked": {
        "type": "object"
      }
    }
  },
  "impreza_vps_offer": {
    "type": "object",
    "$comment": "Two answers: the offer (no or partial arguments) and the exact quote of one whole configuration.",
    "anyOf": [
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "product_id",
          "name",
          "description",
          "currency",
          "billing_cycles",
          "locations",
          "operating_systems",
          "resources",
          "limits",
          "apps",
          "starting_at",
          "pricing",
          "order",
          "balance"
        ],
        "properties": {
          "product_id": {
            "type": "integer"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "currency": {
            "type": "string"
          },
          "billing_cycles": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "cycle",
                "months"
              ],
              "properties": {
                "cycle": {
                  "type": "string",
                  "enum": [
                    "monthly",
                    "quarterly",
                    "semiannually",
                    "annually",
                    "biennially",
                    "triennially"
                  ]
                },
                "months": {
                  "type": "integer"
                }
              }
            }
          },
          "locations": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "id",
                "slug",
                "name"
              ],
              "properties": {
                "id": {
                  "type": "integer"
                },
                "slug": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "country": {
                  "type": "string"
                },
                "badge": {
                  "type": "string"
                },
                "best_for": {
                  "type": "string"
                },
                "surcharge": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "string",
                    "pattern": "^-?[0-9]+.[0-9]{2}$"
                  }
                }
              }
            }
          },
          "operating_systems": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "id",
                "slug",
                "name",
                "family"
              ],
              "properties": {
                "id": {
                  "type": "integer"
                },
                "slug": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "family": {
                  "type": "string"
                },
                "surcharge": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "string",
                    "pattern": "^-?[0-9]+.[0-9]{2}$"
                  }
                }
              }
            }
          },
          "resources": {
            "type": "object"
          },
          "limits": {
            "type": "object",
            "properties": {
              "memory_gb_per_core": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "disk_gb_per_core": {
                "type": [
                  "string",
                  "null"
                ]
              }
            }
          },
          "apps": {
            "type": "object",
            "properties": {
              "default": {
                "type": "string"
              },
              "options": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "note": {
                "type": "string"
              }
            }
          },
          "starting_at": {
            "type": "object",
            "additionalProperties": {
              "type": "string",
              "pattern": "^-?[0-9]+.[0-9]{2}$"
            }
          },
          "pricing": {
            "type": "string"
          },
          "order": {
            "type": "string"
          },
          "balance": {
            "type": "string",
            "pattern": "^-?[0-9]+.[0-9]{2}$"
          },
          "_note": {
            "type": "string",
            "$comment": "Hosted only: added when some but not all of the quote arguments were passed."
          }
        }
      },
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "product_id",
          "product",
          "currency",
          "billing_cycle",
          "months",
          "lines",
          "recurring",
          "setup_fee",
          "due_today",
          "due_today_cents",
          "renews",
          "balance",
          "balance_covers",
          "top_up_needed",
          "exact",
          "location_available",
          "order"
        ],
        "properties": {
          "product_id": {
            "type": "integer"
          },
          "product": {
            "type": "string"
          },
          "currency": {
            "type": "string"
          },
          "billing_cycle": {
            "type": "string"
          },
          "months": {
            "type": "integer"
          },
          "configuration": {
            "type": "object"
          },
          "lines": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "item",
                "quantity",
                "unit_price",
                "amount"
              ],
              "properties": {
                "item": {
                  "type": "string"
                },
                "quantity": {
                  "type": "integer"
                },
                "unit_price": {
                  "type": "string",
                  "pattern": "^-?[0-9]+.[0-9]{2}$"
                },
                "amount": {
                  "type": "string",
                  "pattern": "^-?[0-9]+.[0-9]{2}$"
                },
                "setup_fee": {
                  "type": "string",
                  "pattern": "^-?[0-9]+.[0-9]{2}$"
                }
              }
            }
          },
          "recurring": {
            "type": "string",
            "pattern": "^-?[0-9]+.[0-9]{2}$"
          },
          "setup_fee": {
            "type": "string",
            "pattern": "^-?[0-9]+.[0-9]{2}$"
          },
          "due_today": {
            "type": "string",
            "pattern": "^-?[0-9]+.[0-9]{2}$"
          },
          "due_today_cents": {
            "type": "integer"
          },
          "renews": {
            "type": "string"
          },
          "balance": {
            "type": "string",
            "pattern": "^-?[0-9]+.[0-9]{2}$"
          },
          "balance_covers": {
            "type": "boolean"
          },
          "top_up_needed": {
            "anyOf": [
              {
                "type": "string",
                "pattern": "^-?[0-9]+.[0-9]{2}$"
              },
              {
                "type": "null"
              }
            ]
          },
          "exact": {
            "type": "boolean"
          },
          "note": {
            "type": "string"
          },
          "location_available": {
            "type": [
              "boolean",
              "null"
            ],
            "$comment": "null when the provisioning module cannot tell (not installed, or it failed to answer)."
          },
          "order": {
            "type": "object",
            "properties": {
              "method": {
                "type": "string"
              },
              "path": {
                "type": "string"
              },
              "body": {
                "type": "object"
              }
            }
          }
        }
      }
    ]
  },
  "impreza_webhook_deliveries": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "deliveries",
      "total"
    ],
    "properties": {
      "deliveries": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "event_type",
            "event_id",
            "attempts",
            "next_attempt_at",
            "last_attempted_at",
            "last_response_code",
            "last_error",
            "delivered",
            "delivered_at",
            "created_at"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "event_type": {
              "type": "string"
            },
            "event_id": {
              "type": "string"
            },
            "attempts": {
              "type": "integer"
            },
            "next_attempt_at": {
              "type": "string"
            },
            "last_attempted_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "last_response_code": {
              "type": [
                "integer",
                "null"
              ]
            },
            "last_error": {
              "type": [
                "string",
                "null"
              ]
            },
            "delivered": {
              "type": "boolean"
            },
            "delivered_at": {
              "type": [
                "string",
                "null"
              ]
            },
            "created_at": {
              "type": "string"
            }
          }
        }
      },
      "total": {
        "type": "integer"
      }
    }
  }
};

// One-time secrets: the text block keeps them, structuredContent never carries them.
export const STRUCTURED_OMIT: Readonly<Record<string, readonly string[]>> = {
  "impreza_create_preview": [
    "password",
    "reviewer_private_key"
  ],
  "impreza_deploy_catalog_app": [
    "credentials"
  ],
  "impreza_fetch_onion_key_export": [
    "sealed"
  ],
  "impreza_mint_subcredential": [
    "token"
  ],
  "impreza_onion_auth_add": [
    "private_key"
  ]
};
