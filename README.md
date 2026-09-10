# impreza-mcp

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

**Full surface live.** All 116 tools shipped — app deployment plus account +
crypto balance, catalog + ordering, domains/DNS + registration, invoices, VPS
lifecycle with snapshots and backups, dedicated / bare-metal servers, plan
upgrades, and Titan / Google Workspace mailboxes — with a setup wizard that
generates ready-to-paste config snippets for 5 AI tools.

On top of that, everything an app needs after it is running: backup and
restore into the customer's **own** S3 bucket, a timer on an app with its
output kept, outbound webhooks so you stop polling, and reading the app's own
files to find out why it behaves as if it were not configured.

On top of that, everything an app needs after it is running: backup and
restore into the customer's **own** S3 bucket, a timer on an app with its
output kept, outbound webhooks so you stop polling, reading the app's own
files, and running the app's own command line.

The local (`npx`) server and the hosted OAuth connector expose the **same 116
tools**, so nothing is lost by picking either path.

### New in 0.11.0

**Run the app's own command line.** WP-CLI for WordPress, `occ` for
Nextcloud, `gitea admin` for Gitea, and the database client for a dump —
`impreza_app_cli` to run, `impreza_get_cli_run` to collect the output. Call
`impreza_get_cli_run` with no `run_id` first: it names the command lines the
app has, says what each is for, and gives one example that works.

- **No docker socket, and that is measured rather than claimed.** The command
  runs in a separate container built from the app's own image, joined to the
  app's own network, with its data mounted — the shape the official CLI
  images are designed for. `cap_drop: ALL`, and no new privilege on the
  machine.
- **Arguments are a list, never a string.** Each element becomes one `argv`
  entry through `execve`, so nothing is split, globbed or substituted:
  quoting is not your problem, and a `$` or a `;` inside a value is just
  that. Verified against a live site — `option update blogname
  'dollars $HOME and a ; semicolon'` reads back exactly as sent.
- **Destructive, and treated as such.** A command line can do anything the
  app itself can, so it needs the `manage` scope and is confirmation-gated.
  Arguments are free rather than allowlisted: that is the same ceiling
  `uninstall` with `purge_data` already sits at, and a list of `wp`
  subcommands would age badly while protecting nothing the confirmation gate
  does not.
- **The CLI version follows the app.** Where the command line is the app's
  own image it is taken from that deployment, so a catalog bump carries it —
  running `occ` from an older Nextcloud against a newer database is how a
  maintenance command corrupts an install.

Custom deployments have no command line here: it is your own image and the
platform cannot know what it ships. Use a scheduled task of kind `command`
for those.

### New in 0.10.0

**Look inside the app's own files.** `impreza_get_logs` reads stdout, which
cannot answer the question a deploy that came up wrong actually raises: did
that variable reach the config file? Two tools now do —
`impreza_inspect_app` to ask and `impreza_get_app_read` to collect the answer.

- **Four actions, and no fifth:** `list` a directory, `read` a file (capped at
  256 KB), `tail` its last lines, `grep` under a path with an extended regular
  expression. There is no command string in the interface, and therefore no
  shell.
- **Read-only by construction.** A one-shot container mounts the app's storage
  read-only — the same mechanism the backup already uses — with no docker
  socket and no write capability. So it also works on an app that is `failed`
  and will not start, which is when it is wanted most.
- **Only the app's own storage:** `data`, or one of the named volumes the app's
  manifest declares (a WordPress exposes `data` and `wp_db`, so its database
  files are readable too). Call `impreza_get_app_read` with no `read_id` to
  see the list for a given app.
- **What comes back is untrusted and often secret** — an app's config file is
  where its database password lives. It reaches you and nothing else: the
  field is on our request log's deny list, and the record is deleted within a
  day.

### Since 0.6.1

Three releases the npm page never described, each one a whole capability:

- **0.7.0 — backup and restore** of a deployment's data into the account's own
  Impreza S3 bucket, with a per-chunk SHA-256 manifest that sits beside the
  data so the copy stays verifiable with the customer's own credentials and no
  call to us. Plus a schedule (daily by default, keeping 3), and a restore
  that can land in a *different* app, which is how an app moves between
  servers.
- **0.8.0 — scheduled tasks:** a timer on an app with the output kept, for the
  apps that need one to behave correctly (Nextcloud's cron, WordPress's
  `wp-cron` on a site with no visitors).
- **0.9.0 — outbound webhooks:** subscribe to deploy, backup and VPS events
  and stop polling, with HMAC-signed delivery and a delivery log.

### New in 0.6.1

**`tools/list` now reflects what your account actually owns.** About a third of
the tools only make sense if you have the machine behind them — VPS power
controls with no VPS can only ever answer "not found" — so those are left out
of the listing until you own one. Typical accounts see around 70 tools instead
of 97, which is roughly six thousand fewer tokens of context spent before you
ask anything.

Three things worth knowing about how it behaves:

- **The purchase path is never filtered.** An account that owns nothing is the
  one that needs to buy something, so ordering, top-up, invoices and the
  catalogue are always listed.
- **Buying something grows the list mid-session.** The server sends
  `notifications/tools/list_changed` on the same response as the order, so a
  client that honours it picks up the new tools without reconnecting.
- **It fails open.** If this server cannot reach the API to ask, it lists
  everything rather than guess.

Hiding a tool is not an authorization boundary — the API still refuses anything
your account does not own. This only stops the listing from carrying tools that
could never work for you.

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
