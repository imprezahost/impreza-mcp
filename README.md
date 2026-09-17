# impreza-mcp

[Model Context Protocol](https://modelcontextprotocol.io) server for
[Impreza Host](https://imprezahost.com). Lets AI coding tools (Claude
Code, Cursor, Codex CLI, Continue, Zed, ...) deploy customer-built
apps to managed Impreza VPSes without leaving the chat.

When you say "deploy this for me" to Claude with this MCP server
loaded, Claude calls `impreza_deploy_custom` directly — packages your
project, uploads it, builds + runs on your Impreza VPS, and reports
back the URL.

## Deployment progress and agent restarts

Compose review and deployment accept
`context_id` for one retained upload containing local build contexts and runtime
`env_file`, configs or secrets. The same context must be supplied at review and
deployment. Runtime files require agent 0.6.11+ with `compose-source-files-v1`.

Custom Node server/static deployments
accept `node_package_manager`, such as `pnpm@10.26.1` or `yarn@4.9.2`, matching the
project's exact `packageManager` and committed lockfile. Omit for npm. Supported
versions are standalone pnpm 10–12 and Yarn 4 projects, without combining
this field with `npm_workspace`. Inspection infers the pin and saved plans retain
it. See the deployment documentation for supported inputs and limits.

Read `last_operation.progress` from `impreza_list_deployments` for the last
reported step and timestamp. Agent 0.6.6+ saves final results before sending them;
after restart it resends the same receipt without repeating the deploy.
Agent 0.6.7+ can verify a completed preparation checkpoint and restore previous
configuration without replaying the deploy (`recovery=reconciling`). Wait for the
terminal failure or confirmed cancellation before retrying.
`recovery=required` means automatic reconciliation could not be verified; contact
support. Busy builds, missing checkpoints and replacement uncertainty stay blocked. A long-running build can
continue after the agent exits. Progress is not a live percentage or proof of
current runtime health. Existing agents update explicitly before the next deploy.
See [deployment progress](https://docs.imprezahost.com/deployment-progress.html).

## Cancel a deployment

Use `impreza_cancel_deployment` with the deployment ID and exact
`last_operation.command_id`. Requires manage permission. Queued cancellation
is immediate; running preparation needs agent 0.6.5+. Agent 0.6.12+ can interrupt an owned build after the server administrator
enables controlled builds on supported Ubuntu 24.04 amd64 hosts. Other preparation
waits for its current step. Confirmation still requires verified cleanup and restored
configuration. `requested` is not `cancelled`. Replacement/recovery cannot
be cancelled. Cancelling a tracking Task remains separate.
Read [the cancellation guide](https://docs.imprezahost.com/deployment-cancellation.html).

## Runtime health and deployment operations

`impreza_list_deployments` returns `runtime` and `last_operation` separately.
A failed build can leave the previous application healthy. Read runtime state,
observation time and reason; old or missing readings remain unknown.
Running without a confirmed healthcheck is not healthy. This requires agent
0.6.4+ for observations and does not verify external HTTP/DNS/TLS. Existing
servers update explicitly. See [runtime health](https://docs.imprezahost.com/runtime-health.html).

## Saved project plans and safe retries

`impreza_plan_project` also accepts
`git_url` and an exact 40-character `git_commit` instead of `context_id`.
Optional `git_username` and `git_token` are used only for the fetch. The server
captures an immutable retained archive, accounts for its upload quota, and
returns `source.origin` alongside the archive SHA256. Review those values before
preparing/applying the saved configuration. Only public-network HTTPS on port
443 is supported; redirects and submodules are refused. Project code is not
executed by inspection. These options require the corresponding control-plane
capabilities; update the local MCP package before using them.

Use `impreza_plan_project` with a retained `context_id` to inspect the archive
inventory and selected configuration files. Choose `project_dir`,
`dockerfile_path`, a Python `start_command` or `php_document_root` as needed.
Review the findings and `analysis.deployment_options`.

With MCP **0.32.0+**, call `impreza_prepare_project_deployment` with `plan_id`,
zero-based `option_index`, app name, server and runtime settings. It validates
and saves the effective configuration without creating an app, job or DNS
record. Review the returned configuration, then call
`impreza_apply_project_deployment` with only `execution_id` and
`configuration_digest`. Later form/request changes cannot override that record.

A repeat of the same saved deployment returns its original acceptance receipt,
including after expiry or app removal. The receipt, app and queue job commit
together. After an uncertain response, retry the same ID and digest instead of
preparing another deployment. Acceptance means queued; inspect app status,
logs and health. This does not restart a failed job or update an existing app.

`impreza_list_prepared_deployments` lists the latest 20 saved configurations or
retrieves one `execution_id`. Environment values are encrypted in the prepared
record, omitted from review responses and cleared from that record on acceptance;
the app then uses its normal environment storage. Reviews show variable names.
Use at most 100 string values, with no system/routing variable overrides.

At most 20 pending records per account, valid no longer than the source plan
and for at most 24 hours. Source, rules, target availability/IP and effective
settings are rechecked before first apply. There is no domain, port or capacity
reservation, dependency pinning or build guarantee. DNS is external to the app
transaction and can remain after an interrupted attempt. Expired pending records
are removed on the account's next preparation; accepted receipts are retained.

Source inspection remains available in MCP 0.31.0+. The older
`impreza_deploy_project_plan` creates directly from an option and is not
idempotent. Plan creation requires deploy scope; listing requires read scope;
preparation/apply require deploy scope. These account-wide tools require
credentials without resource restrictions. No agent update is needed solely for
this flow; recipe requirements still apply. See the
[project plan and review guide](https://docs.imprezahost.com/project-plans.html).

## Retained source uploads

Use `impreza_upload_context` with `dir` and an optional `label` to upload an immutable
source version without deploying. The response includes its `context_id`, SHA256,
size and expiry. List or inspect versions with `impreza_list_contexts`.

Create an app with `impreza_deploy_custom`, `mode: "dockerfile"` and `context_id`
(or deploy a local `dir` directly). Rebuild it with `impreza_redeploy_deployment`
and optionally another retained `context_id`. The app identity, domain, host port,
volumes and build recipe stay fixed. The selected source can differ from the
running release after failure or rollback; inspect deployment history.

Sources in use remain available. Unreferenced versions expire seven days after
upload or their last deployment request, not seven days after detachment. Default
quotas are 10 unexpired/referenced archives, 300 MiB per account and 100 MiB per
archive; referenced sources count. Delete an unused version with
`impreza_delete_context`, `context_id` and `confirm: true` after customer confirmation.
Metadata requires read scope, upload requires deploy, and deletion requires
manage. Resource-confined credentials cannot manage account uploads.

The packer excludes common dependency/VCS folders, .env and .env.* (except
example/sample/template files), .npmrc and .pypirc. It does not scan arbitrary
secrets or interpret .gitignore/.dockerignore; review what you upload. Portal
archives are sent unchanged. Legacy REST uploads remain temporary unless they
opt into `retain=true`. Older uploaded-source apps can migrate by selecting a
fresh retained context on redeploy. These MCP tools require 0.22.0+; no agent
update is needed solely for source retention. See the
[source upload guide](https://docs.imprezahost.com/source-uploads.html).

## Node.js npm builds

Deploy an independent npm HTTP application without a repository Dockerfile using
`impreza_deploy_custom` with `mode: "dockerfile"`, `build_strategy: "node_npm"`,
`git_url` (or local `dir`), and `target_port` (usually 3000).
The API generates a Node 24 recipe: npm ci, optional build script, production
pruning and npm start as a non-root user. The selected project folder must contain package.json, package-lock.json
and a production start script. Docker Compose 2.17+ and BuildKit
must be available on the server. Select npm workspaces explicitly with
`npm_workspace`. Use `build_secrets` for named credentials and the `npmrc` secret
for private npm installation; agent 0.6.11+ is required. The app must listen on 0.0.0.0 and the
configured port. Keep runtime PORT consistent with that port.

Git redeploys and previews reuse the recipe snapshot. Retained uploaded sources
support reuse and source-version selection; older temporary uploads remain single-use. The recipe excludes .git, node_modules, .env,
.env.* and .npmrc from the source copy; this does not scan arbitrary secrets.
Keep credentials out of source code. The HTTP startup probe accepts responses
below 500 at / and is not a functional application test.

## Public build variables

Required healthy start: opt in with require_healthy_start=true, an explicit healthcheck_path and build_strategy=node_npm. In the portal, enable Require a healthy start. Agent 0.6.3 or newer must be reported in Servers; update it explicitly and wait for the next heartbeat. startup_timeout_seconds accepts an integer from 30 to 600, default 60. The budget starts after containers are created and includes the stable health observation; Git fetch, dependency/image builds and recovery have separate time limits. Every running service must report Docker healthy and at least one serving container must exist. HTTP redirects, authentication errors and timeouts do not pass the configured 2xx probe. When the first install fails, its containers are removed and persistent volumes are preserved; the failure includes diagnostic logs. A failed replacement recovers a verified healthy previous release when available. Recovery and manual rollback use the saved release startup policy, so a slow healthy release retains its original deadline. Failure recovery does not undo database writes or mutable data. The control plane refuses incompatible agents at creation, never dispatches the policy without startup-health-v1 support in the current poll, and accepts success only with a matching health confirmation. Previews inherit the policy; redeploy keeps the snapshot. Deployment reads expose startup_health. Choose a new deployment to change the saved policy. Omission or false preserves legacy behavior; a startup timeout requires the option enabled. The public option is for generated Node builds. This does not provide zero-downtime switching or continuous automatic rollback after startup. Local MCP input support requires 0.20.0+. Existing agents update only when the customer runs the updater. See https://docs.imprezahost.com/tutorials/agent-apps-panels.html#required-startup

Node health checks: with build_strategy=node_npm, optionally set healthcheck_path (for example /health or /api/ready), or fill Health check path in the portal. The generated Docker health check sends HTTP GET to 127.0.0.1 on target_port inside the container and requires status 200-299; it does not follow redirects or send credentials. The route must work without login and should report the dependencies your app needs to serve requests. Use / or a path of at most 200 ASCII characters; segments start with a letter, digit, underscore or hyphen and may then include dots or tildes. A trailing slash is allowed. URLs, query strings, fragments, percent escapes, spaces, parent segments and repeated slashes are refused. Omit the field (leave it blank in the portal) to keep the legacy / probe accepting statuses below 500; explicitly setting / requires 2xx. Existing deployment snapshots remain unchanged. The saved healthcheck_path is returned by deployment reads, inherited by new previews and retained on redeploy; changing it requires a new deployment. Static sites keep their index.html probe; custom Dockerfiles define their own HEALTHCHECK. The probe runs every 5 seconds with a 2-second request timeout. With required startup disabled, agents 0.6.2 and later observe startup for up to 60 seconds: a failed replacement recovers a verified healthy previous release when one exists. Without that recovery target, a first install can still complete with a startup warning, so inspect health and logs before treating it as ready. This default policy does not provide continuous rollback, zero-downtime routing or external uptime checks. To enforce a startup deadline, enable required healthy startup with agent 0.6.3+. Local MCP inputs require 0.19.0+; healthcheck_path alone needs no agent update beyond 0.6.2.

Public build settings: generated node_npm and node_npm_static recipes accept public_build_vars, an object of string values available only to npm run build (including its prebuild/postbuild scripts). For example, {"VITE_API_URL":"https://api.example.com"} lets Vite compile a public API URL into the site. Names must start with VITE_, NEXT_PUBLIC_ or PUBLIC_, contain only uppercase letters, digits and underscores, and be at most 128 characters. Limits: 20 entries, 4096 UTF-8 bytes per value and 16384 bytes for names plus values. Empty strings are preserved; NUL is refused. Values are literal data, without shell or variable expansion. The portal exposes Public build variables as KEY=value lines; do not add surrounding quotes, which would become part of the value. These values are public and may appear in bundles, image metadata and logs: never send passwords, tokens or secrets. They are not supplied to npm ci or automatically added to runtime variables. Runtime vars still configure the running container and do not rewrite compiled browser files. Settings are saved at creation, exposed on deployment reads, inherited by new previews and reused on redeploy. Preview runtime inheritance/overrides do not change this build snapshot; create a separate deployment for different public build values. Existing snapshots default to no public build values. Use build_secrets for supported build credentials with agent 0.6.11+; unsupported build settings require a custom Dockerfile. Local MCP requires 0.18.0+; no agent update is required beyond the existing build executor.

See the [build configuration guide](https://docs.imprezahost.com/tutorials/agent-apps-panels.html#public-build-settings).

## Apps in project subfolders

Deploy an independent npm app from a subfolder: set project_dir (default .) with node_npm or node_npm_static, or choose Project folder in the portal. For example, apps/site must contain its own package.json and matching package-lock.json; static_output_dir is relative to that folder. Only the selected folder is copied into /app for npm installation and builds. The repository/upload remains the Docker build context, so its root .dockerignore still applies. Paths allow up to 120 characters and five non-hidden segments; parent, node_modules and symlink components are refused. Missing folders or failed builds retain the previous healthy runtime. The project_dir value is returned by deployment reads, saved at creation and inherited by new previews; redeploy reuses the saved recipe. Existing snapshots default to .; changing the folder requires a new deployment. This supports independent apps in one repository, not shared workspaces or dependencies outside the folder; use a custom Dockerfile for those. The analyzer does not discover subfolders: supply the selected app metadata and review Project folder yourself. Local MCP requires 0.17.0+; no agent upgrade is required beyond the existing build executor.

See the [project folder guide](https://docs.imprezahost.com/tutorials/agent-apps-panels.html#project-folder).

## Import a Compose stack

Use `impreza_prepare_compose` with `compose_yaml`, then explicitly select
`web_service` and the integer `target_port`. Review services, persistent
volumes, required variables, changes and blockers before deploying with
`impreza_deploy_custom`, `mode: "compose"`, the same YAML/service/port and
`compose_review_id` set to the returned `analysis_id`.

Supports self-contained public-image stacks with up to 12 services, private
bridge networks, local named volumes and service dependencies. Original host
port bindings are removed; only the selected HTTP service joins the proxy and
receives a managed loopback port. Container and volume names become specific
to the deployment. Declare CPU/memory limits per service in YAML.

The review does not fetch images, execute code or reserve resources. Local build
contexts and auxiliary files require the same retained context_id at review and
deploy. Runtime env_file accepts literal assignments only, without interpolation
or inherited bare keys. Aliases, profiles, host privileges and external resources
are outside this import subset. Reference uppercase variables instead of
embedding secrets. Runtime values must be single-line strings up to 4 KiB,
without surrounding whitespace, quotes, backslashes, dollar signs or space
followed by #. Variables supply explicit references, not every service's
environment. Required values are checked at creation, editing and redeploy.

The imported source is saved as a manifest. Redeploy reuses it and the named
data; changing the source/topology requires a new deployment. Failure recovery
uses the existing agent policy and does not undo database writes. Local MCP
support for public-image stacks requires 0.21.0+. Retained build/runtime sources
require MCP 0.34.0+ and agent 0.6.11+.
See the [Compose import guide](https://docs.imprezahost.com/compose-import.html).

## Prepare project configuration

Use `impreza_prepare_project` with `package_json`, `dockerfile`, and optional
`dockerfile_path` before deploying. It returns framework hints, available build
and start commands, explicit ports from the final Dockerfile stage, and findings
to review. Each file is limited to 32 KiB. Review files for credentials before
sending; never submit .env files or secrets.

This is advisory analysis of supplied text. It does not fetch a repository,
execute code, generate a Dockerfile or deploy resources. Git deploys use a Dockerfile by default; supported npm projects can opt into the Node recipe. The analysis ID identifies metadata, not an executable plan.
Requires an API exposing /v1/platform/deployments/custom/prepare.

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

## Retained-release rollback

The source tree adds `impreza_rollback_deployment`. Read a deployment's
`release_history` through `impreza_api_call` at
`/platform/deployments/{id}`, then choose a `rel_...` entry with
`rollback_supported: true`.

Explain the selected release and possible interruption to the customer before
calling the tool with `deployment_id`, `target_version` and `confirm: true`.
The hosted connector uses its two-call `confirm_token` flow instead.
The operation requires `manage` scope and a compatible API and agent.

A historical release may no longer be retained. The agent checks local images
and unchanged ports, storage and routing before replacing containers. It saves
the current healthy runtime and attempts recovery if the selected release fails
startup. Database contents and mutable data are not reverted. A queued response
does not confirm restoration; check deployment history for the result.

Available in impreza-mcp 0.12.0. Requires a compatible API and agent.

## Static npm sites

Static npm sites: choose build_strategy=node_npm_static with a Git/context source (mode=dockerfile), or Static site + npm in the portal. Requires an independent npm package in the selected project folder, matching package-lock.json and a build script producing index.html in the selected output folder. Node 24 installs dependencies and runs the build; unprivileged Nginx serves only the selected output folder with configurable SPA fallback. No start script is required. Default target_port is 8080. Compose 2.17+ and BuildKit required. No SSR or server functions. Explicit npm_workspace and build_secrets are supported with their documented source and agent requirements. Runtime variables (including VITE_* and PORT) do not rewrite static bundles or change the configured Nginx port. Use static_output_dir (default dist) to choose a relative output folder containing index.html, and static_spa (boolean, default true) to choose SPA fallback or 404 for unknown routes. The portal exposes both fields. Paths are limited to 120 characters and five segments, without hidden, parent or node_modules segments; symlinks in the output or its parent path are refused. These settings are chosen at creation, stored in the recipe snapshot, exposed as static_options and carried to new previews. Redeploy reuses the saved recipe; changing these settings on existing deployments requires creating a new deployment. Existing snapshots keep their original recipe. Local MCP option inputs require 0.16.0+. Use public_build_vars for supported public settings; other build-time configuration requires a custom Dockerfile. Source .env/.env.*/.npmrc/.git/node_modules are excluded; review all generated files because the output folder is public. Missing index.html and symlink output fail the build. Existing preview/redeploy snapshots preserve the strategy. Local MCP requires 0.15.0+; no agent upgrade is needed beyond the existing build executor. The analyzer returns static_npm_recipe and conditional deployment_options; metadata is not proof of a static, working build.

## Status

**Package version: 0.18.0.** The tool catalog covers app deployment plus account +
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
| `impreza_upload_context` | `POST /v1/platform/deployments/custom/contexts?retain=true` |
| `impreza_list_contexts` | `GET /v1/platform/deployments/custom/contexts[/{context_id}]` |
| `impreza_delete_context` | `DELETE /v1/platform/deployments/custom/contexts/{context_id}` |
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

## PHP deployments

Use `impreza_prepare_project` with `composer_json` and optionally `php_document_root` to review a PHP app. Deploy with `impreza_deploy_custom`, `mode: "dockerfile"` and `build_strategy: "php_composer"`, using Git, a local directory or a retained upload. The PHP 8.4/Apache recipe installs production dependencies from `composer.json` and a matching `composer.lock`, without Composer scripts or plugins, and checks actual platform requirements. Choose `project_dir` for the application and `php_document_root` for its public subfolder containing `index.php` (default `public`). Apache runs as a non-root user on `target_port` (default 8080, minimum 1024); it serves public files and sends missing paths to `index.php`.

Health checks require HTTP 2xx without redirects, at `/` or your `healthcheck_path`. Optional `require_healthy_start` needs an explicit path and agent 0.6.3+, with a 30–600 second startup budget. Previews and redeploys keep the saved recipe. Custom repositories, private dependency credentials, installation plugins, extra extensions, `.htaccess` rules, frontend builds and application setup/migrations require a custom Dockerfile. `start_command` and public build variables are not PHP options. Analysis is advisory and does not inspect the lockfile or repository. See the [PHP deployment guide](https://docs.imprezahost.com/tutorials/agent-apps-panels.html#php-build).

## Python deployments

Use `impreza_prepare_project` with `requirements_txt` and an explicit `start_command` to review a Python app. Deploy with `impreza_deploy_custom`, `mode: "dockerfile"` and `build_strategy: "python_pip"`, using Git, a local directory or an uploaded context. The Python 3.13 recipe installs a flat `requirements.txt` from PyPI and runs as a non-root user; choose `project_dir` for an independent application folder. Start a production server on `0.0.0.0` at `target_port` (default 8000), for example `exec gunicorn --bind 0.0.0.0:$PORT app:app`, with Flask and gunicorn declared in requirements. `PORT` and `HOST` are runtime variables. Keep credentials out of the saved command.

The default Python health probe requires HTTP 2xx on `/`; choose `healthcheck_path` for another route. Optional `require_healthy_start` needs an explicit path and agent 0.6.3+, with a 30–600 second startup budget. Previews and redeploys retain the saved recipe. Dependency options, includes, URLs, local projects, private build credentials, system packages and other package managers require a custom Dockerfile. Public build variables remain npm-only. Analysis is advisory; builds resolve actual dependencies on the server. See the [Python deployment guide](https://docs.imprezahost.com/tutorials/agent-apps-panels.html#python-build).

## Build

```sh
npm install
npm run build
# dist/server.js is the entry point
```

## Supervised preparation

These legacy worker rules remain in effect unless the administrator enables agent 0.6.12+ [controlled builds](https://docs.imprezahost.com/deployment-cancellation.html#controlled-builds), which add verified executor stop and recovery for new builds.

Agent 0.6.8+: supported Linux/systemd deploys run image pull and build in a separate supervised process. If the agent restarts, it waits for the exact worker receipt without repeating that work. Only a durable successful receipt allows the existing preparation reconciliation: revalidate operation/phase and unchanged containers, restore previous configuration, and close as failed or confirm a previously requested cancellation. recovery=reconciling can include waiting for the original worker. Missing/invalid receipts, worker failure or timeout, host reboot before a receipt, legacy unsupervised work, replacement uncertainty, data ownership and onion preparation still require review. A process or service disappearing is never proof of completion. The customer must wait for the final result before retrying; no automatic deploy retry, immediate build termination, data rollback or runtime-health guarantee is added.

## License

MIT — see `LICENSE`.


## Supervised replacement

Agent 0.6.9+: new supported Linux/systemd deploys keep the authorized container replacement, startup checks, lifecycle hooks, routes and normal startup recovery in one supervised worker. If the agent restarts, recovery=reconciling with step=reconciling_replacement waits for that original worker. Its verified durable final receipt is delivered without repeating containers or hooks, including a failed deployment whose previous release was restored. Missing or invalid receipts, worker loss or timeout, host reboot before completion, legacy unsupervised operations, data ownership changes and onion provisioning still require support; keep the private journal and do not retry to unblock the queue. This does not add automatic deployment retries, database rollback or zero-downtime traffic switching. Update the agent explicitly before the next deploy.

Python deployments may select python_package_manager=uv@0.12.15 with python_pip, pyproject.toml and uv.lock. Installation is locked, production-only and non-editable on Python 3.13; public PyPI sources only. Custom uv workspaces/indexes require a Dockerfile. Use MCP 0.34.0+ and a control plane supporting this recipe.


## PostgreSQL application connections

`impreza_prepare_service_binding` reviews a dedicated PostgreSQL connection for an image application in the same project environment and server. `impreza_prepare_service_binding_removal` reviews removal or a pending-cleanup retry with the exact `deployment_id` and `binding_id`. Read the saved plan with `impreza_get_service_binding_plan`; apply only after explicit confirmation using `impreza_apply_service_binding_plan`, the exact digest and `confirm: true`. Removal retains database data and disables the dedicated login only after a healthy replacement without the connection. Acceptance means queued, not verified completion. Requires agent 0.6.13+ and a compatible control plane.

`impreza_prepare_service_binding_rotation` reviews a credential rotation for an existing connection with `deployment_id`, `binding_id` and `mode` (`rotate` or `abandon`). Rotating replaces the dedicated login with a distinct new one and disables the previous login only after a healthy replacement with the rotated `DATABASE_URL`; the database and its data are always retained. A failed startup keeps the previous application serving with the current credential and requires a newly reviewed retry; if the previous login could not be confirmed disabled, the rotation stays pending cleanup and a new `rotate` review retries it. `abandon` discards the unused candidate credential and keeps the current one; it is refused once only cleanup remains. Apply the returned review with `impreza_apply_service_binding_plan` as above; preparation queues nothing and returns no credential. Rotation requires an agent announcing `postgres-service-binding-rotation-v1`: older agents refuse the dispatch and the failed job directs the customer to update the agent explicitly, preserving its identity, configuration and applications. Rotation requires a v2-protocol connection; legacy first-protocol connections are not adopted.

## Public HTTPS diagnostics

`impreza_probe_deployment` takes `deployment_id` and checks the saved public hostname through the control plane. It reports public DNS resolution, TLS verification and the HTTPS HEAD status, without following redirects or sending application credentials. It does not read response bodies or verify dependencies. One attempt per account every 30 seconds; no agent update is required.

## Image promotion and environments

`impreza_prepare_image_promotion`, `impreza_get_image_promotion` and `impreza_apply_image_promotion` review an exact registry digest for an existing destination configuration. Apply requires the returned review digest and explicit confirmation. Destination variables and data remain local to that application.

Project/environment tools organize existing applications with explicit component associations. They do not copy variables, create network connections or deploy workloads. See the [project environments guide](https://docs.imprezahost.com/project-environments.html).
