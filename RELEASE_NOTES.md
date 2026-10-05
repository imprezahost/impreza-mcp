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
