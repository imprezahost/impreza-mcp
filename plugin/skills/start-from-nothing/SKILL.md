---
name: start-from-nothing
description: Go from no Impreza account at all to a running app — anonymous sign-up with no e-mail, funding in Bitcoin or Monero, then a server. Use when someone has no account, no server, or asks what buying hosting here involves.
---

# From nothing to a running app

Most hosting integrations assume an account and an API key already exist. This
one does not have to. The whole arc can start from zero.

## The account

An Impreza account can be created **without an e-mail address and without KYC**.
When you reach the server with no credentials at all, it offers exactly one
tool, `impreza_bootstrap_account`, and nothing else — that is the lobby, and it
is the only thing an anonymous caller can do.

Two consequences worth stating plainly:

- Once you are authenticated, that tool is **not in your list any more**. If
  you are looking for it on a connected account, it is gone by design, not
  missing.
- The account comes back with a **recovery code**, and there is no e-mail to
  fall back on. If the customer loses it, we cannot restore the account for
  them — that is what "no e-mail" actually costs. Say this at the moment the
  code appears, not later.

## The money, and what you can and cannot do with it

**You cannot spend the customer's money from this conversation.** Tools that
would buy something — ordering a VPS, upgrading or resizing one, paying an
invoice, registering or transferring a domain, buying WHOIS privacy — hand back
a **checkout link** instead of charging. The customer completes the purchase on
our page.

This is deliberate, and it is not a limitation to apologise for or try to route
around. Do not look for another tool that "really" buys. There isn't one, and
the connector attests to Anthropic that it does not execute financial
transactions on a user's behalf.

What still works in chat is **funding**, because it moves no money by itself:

- `impreza_topup` raises a funding invoice for an amount.
- `impreza_topup_payment` shows the crypto address the customer sends from, by
  hand, out of their own wallet.
- `impreza_topup_status` says whether it arrived.

Bitcoin and Monero. Nothing is debited from anyone by a tool call; the customer
pushes the payment themselves.

## Then the server

`impreza_list_products` is the catalogue. It is large, so narrow it: pass
`group` for a product group or `type` for a kind, rather than reading all of it
back to the customer.

`impreza_order_vps` produces the checkout link. After the customer pays, the
VPS provisions on its own — `impreza_list_servers` will show it. Provisioning
takes minutes, not seconds; do not report a server that is not there yet.

## Then the app

The `deploy-an-app` skill takes it from there.

## Being honest about the trade

People choose this host for privacy, and the honest version of that includes
the parts that are not flattering. If a customer is deciding, these are true and
they should hear them:

- The API and MCP hosts sit behind Cloudflare, which terminates TLS. There is
  **no .onion mirror for the API or MCP** — only for the client area.
- The caller's IP is recorded on every API call.
- Deployment environment variables are stored in the clear.
- `impreza_privacy_report` is not marketing: it **measures** what the account
  actually holds, table by table, and reports whether our own retention windows
  are being honoured. If someone asks what is kept about them, call it rather
  than summarising from memory.
