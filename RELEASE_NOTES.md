# MCP 0.56.0

New tools:

- `impreza_explain_incident`: groups an application's incident (crash loop, out of memory, full disk) from the
  platform's per-minute metrics and an optional log tail you supply, and returns the evidence and a remediation plan.
  It never runs the plan.
- `impreza_vps_events`: the last 20 operations your account requested on a VPS (power, reinstall, password, backups,
  snapshots), each with the time the provider accepted it. It does not claim an outcome.
- `impreza_vps_set_auto_start`: whether a VPS starts by itself when its host boots or on scheduled automation,
  separate from the power actions. `impreza_vps_status` now reports this `auto_start` policy (`null` when it is
  unknown).
- `impreza_set_domain_alias`: also answer on the www (or apex) name of a custom app with a 301 to its main domain.
  Available only when the server's agent supports it; otherwise the answer is that it is not available for this server
  yet, and nothing changes.
- `impreza_get_status_page` and `impreza_set_status_page`: a public status page for an application. They work where
  the service offers public status pages; elsewhere they answer "not found".
- `impreza_i2p_destination`, `impreza_i2p_export` and `impreza_i2p_remove`: I2P for an application. They are listed
  only when the service reports that I2P is available for your account.

Changed:

- `impreza_prepare_host_plan` accepts the managed ingress reload (`managed_service.reload`) and, where the service
  enables them, the fixed Redis/cache unit operations and the operational-profile operations. Each needs its own
  per-server permission and a person's approval in the portal; `vps.reinstall` still requires `template_id`.
- The server card shows the VPS's recent operations and reads CPU usage as the 0–100 percent the API reports.
- Snapshot and restore tools say that a server with a customer-encrypted root refuses snapshots, and that MCP cannot
  confirm destroying it.
- Standby pairing says that a hostname in the managed zone is required and that a primary with only an .onion address
  cannot be paired yet. Retrying a failed failover activation also covers a failed provider fence.
- Output schemas now match the hosted connector for `impreza_list_servers` (`os`), the deploy tools
  (`credentials_keys`; credentials stay in the text content only), host plans and permissions (the `released` status)
  and `impreza_privacy_report`.
- 225 tools (228 where I2P is available) and 6 prompts in the local package.

# MCP 0.55.1

- The MCP Apps panels use the stable MCP Apps handshake (`2026-01-26`): `ui/initialize` now sends `appInfo`, and the
  panel reads the host's `hostCapabilities` from the reply, or `capabilities` from a host that still sends that.
- The panels move their inline style attributes into their own stylesheet, matching the panels the hosted connector
  serves.
- 219 tools and 6 prompts in the local package (unchanged).

# MCP 0.55.0

- The MCP Apps panels shipped in the local package now match the ones the hosted connector serves.
- The server card shows what the agent currently reports, keeps runtime health apart from deployment operations and
  does not fill in missing values.
- The deploy wizard keeps current runtime health apart from deployment operations.
- Panels report their size to the host only after the host has initialized them, so they open at the right height.
- The top-up card is the one the hosted connector serves today: for on-chain Bitcoin and Monero it shows a QR code,
  a wallet link and a countdown to the payment's own expiry, but only when the payment details match exactly;
  otherwise it shows a warning and nothing to copy. The QR is drawn inside the card, with no third-party service.
- The output schemas of `impreza_deploy_catalog_app` and `impreza_deploy_custom` accept an optional `onion_note`:
  a new .onion address can take several minutes to answer over Tor after it appears.
- 219 tools and 6 prompts in the local package (unchanged).

# MCP 0.54.0

- A VPS bought with `impreza_order_vps` is now born with the Impreza agent by default (`app: "@agent"`), for the
  configurable VPS and fixed VPS plans alike, so it can receive deployments. Pass `app: "none"` for a bare OS. The
  REST API, the cart and the customer portal keep a bare OS as their default.
- The whole-configuration quote of `impreza_vps_offer` uses the same default app as the order, so the quote and the
  order match. The order result echoes the app it asked for as `app_requested`.
- A non-text `app` (number, boolean, object or array) is refused before any request.
- An accepted order is not a ready agent: poll `impreza_list_services`, and the agent appears in
  `impreza_list_servers` once it has installed and connected.
- 219 tools and 6 prompts in the local package (unchanged).

# MCP 0.53.0

- New `impreza_add_server`: connect a server the customer already has with a one-time install token (10 minutes)
  and a one-line command; the first external server is free on every account. `label` is limited to 120 Unicode
  code points, as the API counts them.
- The `start-from-nothing` skill offers the customer's own server first and describes the hosted lobby's public reads.
- Tool titles and descriptions aligned with the current API guidance.
- 219 tools and 6 prompts in the local package.

# MCP 0.52.0

- `impreza_get_ingress` and `impreza_set_ingress`: read and replace the inbound allowlist
  of an application's non-HTTP ports. Restricting needs `confirm=true`; a stale
  `base_revision` is refused. Enforcement needs agent 0.6.26 or later.
- 218 tools and 6 prompts in the local package.

# MCP 0.51.0

- `impreza_topup` accepts the amount as an exact decimal string and forwards it unchanged;
  JSON numbers remain accepted.
- Every identifier placed in an API URL path (task, backup, VPS, image, invoice, command,
  read and run IDs, agent IDs, onion client names, routed domains and the dedicated IP for
  reverse DNS) is refused before any request when it would add path segments, as
  `deployment_id` already was.
- 216 tools and 6 prompts in the local package.

# MCP 0.50.0

- New prompt `impreza_protect_app`: guides a cold standby of an app on a server in another
  country, its pairing and the first restore drill, each step with its own human
  confirmation; it never promotes the standby or switches traffic.
- `impreza_list_servers` returns each server's `failover_location` (country code, how the
  country was established, and a notice).
- A `deployment_id` that would add path segments to an API URL is refused before any request.
- `impreza_order_vps` and `impreza_vps_offer`: a VPS ordered through the API is bare by
  default (`app: "none"`); the agent is installed only on explicit request (`app: "@agent"`,
  or `impreza_install_agent` later with the customer's confirmation). Poll
  `impreza_list_services` after ordering.
- Direct runtime dependencies pinned to the exact tested versions.
- 216 tools and 6 prompts in the local package.

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
