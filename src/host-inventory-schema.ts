// Closed host facts schema shared with the hosted API; no arbitrary output.
export const hostInventoryOutputSchema = {
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
        "0.6.28"
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
} as const;
