# impreza-mcp

[![smithery badge](https://smithery.ai/badge/imprezahost/impreza-mcp)](https://smithery.ai/servers/imprezahost/impreza-mcp)

[Model Context Protocol](https://modelcontextprotocol.io) server for
[Impreza Host](https://imprezahost.com). Lets AI coding tools (Claude
Code, Cursor, Codex CLI, Continue, Zed, ...) deploy customer-built
apps to managed Impreza VPSes without leaving the chat.

When you say "deploy this for me" to Claude with this MCP server
loaded, Claude calls `impreza_deploy_custom` directly — packages your
project, uploads it, builds + runs on your Impreza VPS, and reports
back the URL.

## Why this host and not a mainstream one

Any provider can run your app. This one is built so an **agent can obtain and
operate infrastructure that is not tied to your identity**, end to end, without
you opening a browser:

- **No KYC, and no email address, to open an account.** An account is a
  generated client ID plus a recovery token. No documents, no selfie, no phone
  number.
- **Funded in cryptocurrency.** `impreza_topup` accepts BTC, XMR, USDT and TRX,
  and `impreza_order_vps` buys the server from that balance. The agent can go
  from "I need a server" to a running deployment without a card.
- **Offshore and onshore jurisdictions side by side**, chosen per project
  rather than per account.
- **Tor is a deployment target, not an add-on.** `impreza_add_onion` gives a
  deployment a `.onion` address in one call, so an agent can publish a hidden
  service the same way it publishes a normal site.
- **No API key in your config.** The hosted connector authenticates over OAuth.

If none of that matters for your project, a mainstream provider is a perfectly
good choice and usually cheaper to start with. This exists for the projects
where it does matter: research and journalism under pressure, censorship
circumvention, security work, and anything that should not be one support
ticket away from being linked to a legal name.

## Status

**Full surface live.** All 97 tools shipped — app deployment plus account +
crypto balance, catalog + ordering, domains/DNS + registration, invoices, VPS
lifecycle with snapshots and backups, dedicated / bare-metal servers, plan
upgrades, and Titan / Google Workspace mailboxes — with a setup wizard that
generates ready-to-paste config snippets for 5 AI tools.

The local (`npx`) server and the hosted OAuth connector expose the **same 97
tools**, so nothing is lost by picking either path.

### New in 0.6.0

Four things that only make sense on a host built for anonymity:

- **Dark previews** — push a branch, get a preview on its own ephemeral Tor
  `.onion`. Every other platform's preview URL puts your branch name into
  public DNS and into a permanent Certificate Transparency log; branch names
  carry ticket ids, customer names and unshipped features. This one creates
  neither record, and destroys its keys when the branch is deleted or the TTL
  runs out. `impreza_configure_previews`, `impreza_list_previews`,
  `impreza_retire_preview`.
- **Agent sub-credentials** — mint a narrower credential from the one you hold
  and hand it to a subtask: one deployment, one hour, no spending. A child can
  never exceed its parent on any axis, and revoking a credential revokes
  everything it minted, however deep. `impreza_mint_subcredential`,
  `impreza_list_credentials`, `impreza_revoke_credential`,
  `impreza_agent_activity`.
- **A privacy report you can check** — `impreza_privacy_report` returns every
  field we store about your account, what it is for, how long it survives and
  who else sees it, and then measures our own retention against the oldest
  record that actually survived. Counts and date ranges, never contents.
- **Ask before you guess** — search our docs, validate a deployment manifest
  before deploying it (including a privacy lint for third-party CDNs, public
  DNS resolvers and leaked secrets), or run a diagnosis when something is
  wrong. `impreza_search_docs`, `impreza_validate_manifest`, `impreza_doctor`.

Plus the Tasks extension, so long operations report completion instead of
leaving you to poll, and three MCP Apps panels — a payment card, a server card
and a deploy wizard — that render inside clients which support them.

The table below is a **selection**, not the full list — it covers the tools
most people reach for first. Your client's own tool listing is authoritative,
and `impreza_api_search` finds anything not named here.

| Tool | Wraps |
|------|-------|
| **Apps & deployments** | |
| `impreza_list_servers` | `GET /v1/platform/servers` |
| `impreza_list_apps` | `GET /v1/platform/apps` |
| `impreza_list_deployments` | `GET /v1/platform/deployments` + `/custom` (merged) |
| `impreza_deploy_custom` | `POST /v1/platform/deployments/custom` (3 modes) |
| `impreza_deploy_catalog_app` | `POST /v1/platform/deployments` |
| `impreza_uninstall_deployment` | `POST .../uninstall` |
| `impreza_get_logs` | `POST .../logs` (sync tail, last N lines) |
| `impreza_restart_deployment` | `POST .../restart` |
| `impreza_redeploy_deployment` | `POST .../custom/{id}/redeploy` (in-place rebuild, same domain) |
| `impreza_add_onion` | `POST .../onion/add` |
| `impreza_change_domain` | `POST .../domain` |
| `impreza_git_webhook_status` | `GET .../custom/{id}/git-webhook` |
| `impreza_git_webhook_connect` | `POST .../custom/{id}/git-webhook/connect` |
| `impreza_git_webhook_disconnect` | `POST .../custom/{id}/git-webhook/disconnect` |
| **Account & balance** | |
| `impreza_account_info` | `GET /v1/account` |
| `impreza_list_services` | `GET /v1/account/services` |
| `impreza_topup` | `POST /v1/account/topup` — top up in BTC / XMR / USDT / TRX |
| `impreza_topup_status` | `GET /v1/account/topup/{invoice_id}` |
| `impreza_topup_payment` | `GET /v1/account/topup/{invoice_id}/payment` — crypto address + amount to pay |
| **Catalog & ordering** | |
| `impreza_list_products` | `GET /v1/products` — plans + pricing (filter `type=server` for VPS/dedicated) |
| `impreza_order_vps` | `POST /v1/orders` — buy from balance; born deployable (`@agent`); 202 + poll `impreza_list_servers` |
| **Domains & DNS** | |
| `impreza_domain_check` | `GET /v1/domains/check` |
| `impreza_domain_details` | `GET /v1/domains/{domain}` |
| `impreza_list_dns` | `GET /v1/domains/{domain}/dns` |
| `impreza_add_dns_record` | `POST /v1/domains/{domain}/dns` |
| `impreza_update_dns_record` | `PUT /v1/domains/{domain}/dns` |
| `impreza_delete_dns_record` | `DELETE /v1/domains/{domain}/dns` |
| `impreza_set_nameservers` | `PUT /v1/domains/{domain}/nameservers` |
| **VPS lifecycle** (Proxmox) | |
| `impreza_vps_status` | `GET /v1/vps/proxmox/{id}/status` |
| `impreza_vps_power` | `POST /v1/vps/proxmox/{id}/{start\|shutdown\|reboot\|stop}` |
| `impreza_vps_list_backups` | `GET /v1/vps/proxmox/{id}/backups` |
| `impreza_vps_create_backup` | `POST /v1/vps/proxmox/{id}/backups` |
| `impreza_vps_list_templates` | `GET /v1/vps/proxmox/{id}/templates` |
| `impreza_vps_reinstall` | `POST /v1/vps/proxmox/{id}/reinstall` — destructive (wipes) |

## Install + setup

### Prerequisites

  - Node ≥ 20
  - An Impreza Host account with an API key + secret
    (clientarea → API Keys; the IP of the machine running this MCP
    server must be whitelisted under the key)

### One-shot via `npx`

No global install needed — `npx impreza-mcp` works.

### Or install globally

```sh
npm install -g impreza-mcp
```

### Get a ready-to-paste config snippet

The fastest path: ask the binary itself.

```sh
npx impreza-mcp setup --tool claude-code
# also: cursor | continue | zed | codex-cli
```

The wizard prints the JSON block to drop into your AI tool's MCP
config + the exact file path + the post-config step (usually "fully
quit + re-open the AI tool"). It does NOT write to disk — paste it
yourself so you don't accidentally clobber an existing config with
other MCP servers.

### Or wire it in manually

**Claude Code** — add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%/Claude/claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "impreza": {
      "command": "npx",
      "args": ["-y", "impreza-mcp"],
      "env": {
        "IMPREZA_API_KEY": "imp_...",
        "IMPREZA_API_SECRET": "..."
      }
    }
  }
}
```

Restart Claude Code. The tools appear under the MCP icon.

**Cursor** — add to `~/.cursor/mcp.json` (same shape as above).

**Continue** — add to `~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "impreza-mcp"],
          "env": {
            "IMPREZA_API_KEY": "imp_...",
            "IMPREZA_API_SECRET": "..."
          }
        }
      }
    ]
  }
}
```

**Zed** — add to your settings:

```json
{
  "context_servers": {
    "impreza": {
      "command": {
        "path": "npx",
        "args": ["-y", "impreza-mcp"],
        "env": {
          "IMPREZA_API_KEY": "imp_...",
          "IMPREZA_API_SECRET": "..."
        }
      }
    }
  }
}
```

## Usage in chat

After setup, talk to your AI naturally:

> *"List my Impreza servers."* → calls `impreza_list_servers`
>
> *"Deploy this directory to my Impreza VPS, expose via .onion."* →
> packages the cwd as a Dockerfile-mode custom deploy, uploads, deploys
> with `onion=true`, reports the .onion address.
>
> *"What apps are running on my agent?"* → calls
> `impreza_list_deployments` filtered to the right server.

## Auth + security

`IMPREZA_API_KEY` + `IMPREZA_API_SECRET` live in the AI tool's MCP
config env — not in any file on disk owned by `impreza-mcp` itself.
The MCP server holds the secret only in memory and only attaches it
as HTTP request headers.

The IP of the machine running this MCP server (almost always your
laptop) must be on the API key's whitelist. Manage the whitelist in
your Impreza clientarea.

## Build

```sh
npm install
npm run build
# dist/server.js is the entry point
```

## License

MIT — see `LICENSE`.
