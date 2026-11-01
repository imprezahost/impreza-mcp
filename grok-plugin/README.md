# Impreza Host — Grok Build plugin

A read-only plugin for Grok Build. It connects to the hosted Impreza MCP server, `https://mcp.imprezahost.com/mcp`,
over HTTP.

- **Tools:** `allowed_tools` lists only read tools. It is never left empty: in Grok an empty list allows every tool,
  including the ones that spend balance.
- **Sign-in:** the server's OAuth 2.1 (authorization code with PKCE S256, public client). Grant only the `read` scope.
- **Approvals:** Grok has no `require_approval` setting, so the containment is this list and the `read` scope.

This folder is not part of the npm package.
