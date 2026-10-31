# Impreza Host — Claude plugin

Privacy-first offshore hosting you can run from a conversation. This plugin
connects Claude to the Impreza Host MCP server and adds skills that cover the
parts the tool list alone does not teach.

## What it contains

- **A connection to the hosted Impreza MCP server** at
  `https://mcp.imprezahost.com/mcp`, over OAuth 2.1. Nothing to copy, no API key
  to paste, and the scope you grant (read, deploy or manage) decides what is
  callable. Destructive scope is off by default.
- **Three skills.** `deploy-an-app` covers the catalog and custom-repository
  paths and the fact that every deploy is asynchronous. `diagnose-a-deployment`
  is the procedure for a failing app: logs, then its own files, then its own
  command line. `start-from-nothing` covers anonymous sign-up, funding in
  Bitcoin or Monero, and exactly where the line is between what a conversation
  can do and what the customer must do on the checkout page.

## What it does not do

It does not spend money. Ordering, upgrading, paying an invoice and registering
a domain all return a checkout link that the customer completes themselves.
That is deliberate, not a gap.

## What you need

An Impreza Host account. The agent can create one itself, without an e-mail
address and without KYC, and fund it in crypto — see the `start-from-nothing`
skill.

## Links

- Documentation: <https://docs.imprezahost.com/>
- MCP integration guide:
  <https://docs.imprezahost.com/tutorials/ai-mcp-integration.html>
- Privacy policy: <https://impreza.host/privacy/>
- Support: <https://portal.imprezahost.com/supporttickets>

## Data

The plugin sends nothing anywhere except the Impreza MCP server it declares
above, which is our own first-party API. Tool calls act only on the account you
authenticate with. `impreza_privacy_report` measures, rather than asserts, what
that account holds.

## License

MIT — see [LICENSE](LICENSE).
