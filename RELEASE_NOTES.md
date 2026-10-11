# MCP 0.49.0

- New `impreza_install_agent` and `impreza_get_agent_install`: offer and follow the
  one-click agent install on a managed VPS, with a two-call confirmation.
- New `impreza_prepare_secret_entry` and `impreza_get_secret_entry`: secret values are
  typed by the account owner on a single-use portal page, never in the chat; tools refuse
  secret values in their arguments and point to that page.
- `impreza_deploy_custom` accepts `standby: true` for jurisdiction failover of custom
  projects (same pinned source, declared data, cutover only after a verified drill).
- 216 tools in the local package.

# MCP 0.48.1

- The cold standby for jurisdiction failover also covers **Uptime Kuma 2.5.5**, next to
  Memos 0.31.0 (`impreza_deploy_catalog_app` with `standby: true`).

# MCP 0.48.0

- Jurisdiction failover: fourteen tools to pair a cold standby in another
  country, confirm the copied backup, review and apply a failover, fail back,
  and run standby drills. The reviewed app in this release is Memos 0.31.0.
- `impreza_deploy_catalog_app` accepts `standby: true` to create that standby
  without a public route (only where failover is enabled on the API).
- New `impreza_vps_resize_recommendation`.
- `impreza_get_host_inventory` returns SSH fingerprints only with
  `include_ssh_fingerprints: true`.
- API errors carry `code` and `next_steps` in `structuredContent`.
- `impreza-mcp login --code` pairs the local server with a one-time code.
- 212 tools in the local package.

# MCP 0.47.0

- New `impreza_get_account_overview`: the account at a glance in one read-only
  call, filtered to the resources a confined credential may see.
- Five guided playbooks as MCP prompts (`prompts/list`): publish from Git,
  change a domain, diagnose a deployment, restore a backup and update an agent.
- New `impreza_pause_agent` and `impreza_resume_agent`, with `confirm: true`.
- Host plans with dashboard human approval for a VPS reinstall:
  `impreza_host_permissions`, `impreza_prepare_host_plan`,
  `impreza_get_host_plan` and `impreza_apply_host_plan`.
- Zero-downtime redeploys: `impreza_get_zero_downtime` and
  `impreza_set_zero_downtime` (agent 0.6.27 or later).
- New reads: `impreza_get_shield`, `impreza_privileged_audit` and
  `impreza_get_host_inventory` (needs agent 0.6.28, not yet released).
- Read tools declare an `outputSchema` and return `structuredContent`.
- 196 tools on both the local package and the hosted connector.
