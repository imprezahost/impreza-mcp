# impreza-mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for
[Impreza Host](https://imprezahost.com). Lets AI coding tools (Claude
Code, Cursor, Codex CLI, Continue, Zed, ...) deploy customer-built
apps to managed Impreza VPSes without leaving the chat.

When you say "deploy this for me" to Claude with this MCP server
loaded, Claude calls `impreza_deploy_custom` directly — packages your
project, uploads it, builds + runs on your Impreza VPS, and reports
back the URL.

## Status

**Full surface live.** All 14 tools shipped + a setup wizard
that generates ready-to-paste config snippets for 5 AI tools.
Roadmap context lives in
[`docs/PLAN_AI_INTEGRATION_ROADMAP.md`](https://git.imprezahost.com/impreza/impreza-platform/-/blob/main/docs/PLAN_AI_INTEGRATION_ROADMAP.md)
of the impreza-platform repo.

| Tool | Wraps |
|------|-------|
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
