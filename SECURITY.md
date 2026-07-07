# Security Policy

`impreza-mcp` is the Model Context Protocol server for **Impreza Host**
(privacy-first, no-KYC, offshore-friendly hosting — [imprezahost.com](https://imprezahost.com)).
It lets AI tools deploy apps and manage servers, domains/DNS, VPS lifecycle and
account balance on a customer's own Impreza account.

## Reporting a vulnerability

Please report security issues privately — do **not** open a public issue.

- Email **security@imprezahost.com** (PGP available on request), or
- use the private disclosure form at https://impreza.host/support.

We aim to acknowledge within 72 hours and to ship a fix or mitigation as fast
as the severity warrants. Please give us a reasonable window to remediate
before any public disclosure; we're happy to credit reporters.

## Supported versions

Only the latest published version on npm (`impreza-mcp`) is supported. Please
upgrade before reporting (`npx -y impreza-mcp@latest`).

## Security design

**Two authentication paths, both least-privilege:**

- **Remote connector (recommended) — OAuth 2.1.** `https://mcp.imprezahost.com/mcp`.
  Standard OAuth 2.1 with PKCE (RFC 8414 discovery, RFC 7591 dynamic client
  registration, RFC 9728 protected-resource metadata, RFC 7009 revocation).
  Tokens are **opaque and DB-backed** (revoked instantly from the clientarea),
  **scoped** (`read` < `deploy` < `manage`, destructive/financial actions are
  opt-in on the consent screen), and short-lived with rotating refresh tokens
  (reuse detection revokes the whole family). No API secret ever leaves
  Impreza. There is **no upstream key/secret and no token passthrough** — the
  bearer's own `client_id` is the identity passed to each in-process handler,
  so there is no confused-deputy credential to leak. Every request is
  re-validated against per-customer resource ownership.

- **Local server — API key + secret.** The key/secret are read from the AI
  tool's MCP config env (`IMPREZA_API_KEY` / `IMPREZA_API_SECRET`) and held
  **only in memory**; the server never writes them to disk and attaches them
  only as request headers over HTTPS (an `http://` base URL is refused). The
  API key has an elective per-key IP second factor (whitelist / trust-on-
  first-use / key-only) and can be scoped and given an expiry.

**Other measures:**

- Any server-side URL fetch (client-metadata discovery) is SSRF-hardened:
  HTTPS-only, resolves and pins to a public IP (anti-rebind), no redirects,
  timeouts, and a response-size cap.
- Secrets (API secret, OAuth tokens, git PATs) are never logged.
- Container/log output surfaced by tools is treated strictly as untrusted data,
  never as instructions.

## Scope

This policy covers the `impreza-mcp` package. Vulnerabilities in the Impreza
platform/API itself are equally welcome at the same contact.
