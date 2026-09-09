// GENERATED — do not edit.
//
// Source of truth: whmcs/modules/addons/imprezaapi/lib/ui/*.html in the
// imprezaAPI repo. Regenerate with:
//
//   php whmcs/modules/addons/imprezaapi/tools/gen_ui_assets.php --local-mcp=<path>
//
// The panel is embedded rather than shipped as a file because the npm package
// publishes only dist/ and tsc does not copy assets. verify_surface.php checks
// this copy against the canonical HTML byte for byte, so editing it here would
// fail the drift gate rather than quietly diverge — and this page shows
// payment addresses, which is not a page to keep two versions of.

export const TOPUP_CARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">

<title>Top-up payment</title>
<!--
  Impreza Host — MCP Apps view for impreza_topup_payment.

  Why this exists: a crypto address is the one value in this product that plain
  chat text handles badly. Text gets re-wrapped, truncated, summarised, and — in
  the prompt-injection case — rewritten by a model that read a hostile page. Here
  the address arrives in \`structuredContent\`, which never passes through the
  model's output, and is rendered through \`textContent\`, never \`innerHTML\`.

  The shared rules (no network, no innerHTML, never inject the host's font CSS)
  live in _bridge.js and are enforced by tools/verify_mcp_apps.php.
-->
<style>
/* Impreza Host — shared tokens and primitives for every MCP Apps panel.
 *
 * Substituted into each panel's TOKENS marker by McpUi::read() and by
 * tools/gen_ui_assets.php, for the same reason as _bridge.js: a panel may fetch
 * nothing from the network, so the choice was one substitution or three copies.
 * Keeping it in one file is also what makes our panels read as one family
 * rather than three pages that happen to ship together.
 *
 * Host-provided variables win. These fallbacks are what a panel looks like when
 * a host sends none — which the spec warns is common, along with partial sets.
 * Neutrals carry a warm bias on purpose: a pure mid-grey reads as unconsidered.
 */

:root {
  color-scheme: light dark;

  --color-background-primary:   light-dark(#fcfcfb, #1b1b1a);
  --color-background-secondary: light-dark(#f4f3ef, #232320);
  --color-background-tertiary:  light-dark(#eceae4, #2b2a26);
  --color-text-primary:         light-dark(#1a1a17, #f2f1ed);
  --color-text-secondary:       light-dark(#6e6d66, #a5a49c);
  --color-text-tertiary:        light-dark(#8d8c84, #7e7d76);
  --color-text-warning:         light-dark(#8a5a00, #e0a83a);
  --color-text-success:         light-dark(#1f6b3a, #5fbf83);
  --color-text-danger:          light-dark(#9a2b21, #f08a7e);
  --color-border-primary:       light-dark(#e5e4de, #33302b);
  --color-border-secondary:     light-dark(#efeee9, #2a2825);

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-full: 999px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  max-width: 560px;
}

/* ── header ───────────────────────────────────────────────────────────── */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.title {
  font-family: var(--font-mono);
  font-size: 18px;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}
.total {
  font-family: var(--font-mono);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.sub {
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

/* State, and state only — the one place colour is allowed to catch the eye. */
.chip {
  flex: none;
  padding: 3px 10px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-full);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.chip[data-state="pending"] { color: var(--color-text-warning); }
.chip[data-state="paid"],
.chip[data-state="ok"]      { color: var(--color-text-success); }
.chip[data-state="error"],
.chip[data-state="off"]     { color: var(--color-text-danger); }
.chip[data-state="idle"]    { color: var(--color-text-secondary); }

/* ── labelled value blocks ────────────────────────────────────────────── */
.field {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-secondary);
  padding: 10px 12px;
}
.field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.label {
  color: var(--color-text-tertiary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.value {
  font-family: var(--font-mono);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  user-select: all;
}

/* ── controls ─────────────────────────────────────────────────────────── */
.actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn {
  padding: 6px 13px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: default; }
.btn:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }
/* Armed: one more click fires it. Used where a mis-click costs an afternoon. */
.btn[data-armed="1"] {
  color: var(--color-text-danger);
  border-color: var(--color-text-danger);
}
.btn.quiet {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn.quiet:hover { color: var(--color-text-primary); }
.copy {
  flex: none;
  padding: 3px 9px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.copy:hover { color: var(--color-text-primary); }
.copy:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }

input[type="text"], select {
  width: 100%;
  padding: 6px 9px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
}
input[type="text"] { font-family: var(--font-mono); }
input:focus-visible, select:focus-visible {
  outline: 2px solid var(--color-text-secondary);
  outline-offset: 1px;
}
.check { display: flex; align-items: center; gap: 7px; font-size: 13px; cursor: pointer; }
.check input { margin: 0; }

/* ── notes ────────────────────────────────────────────────────────────── */
.note { color: var(--color-text-secondary); font-size: 11.5px; }
.note strong { color: var(--color-text-primary); font-weight: 600; }
.warn { color: var(--color-text-danger); }
.rest { color: var(--color-text-secondary); font-size: 13px; }

[hidden] { display: none !important; }

@media (prefers-reduced-motion: no-preference) {
  .copy, .btn { transition: color 90ms ease, background 90ms ease, border-color 90ms ease; }
}


  /* An address is checked at its ENDS. Grouping it and dimming the middle is
     what makes "did I paste the right one?" answerable at a glance. */
  .addr { display: flex; flex-wrap: wrap; gap: 0 7px; line-height: 1.6; }
  .g { color: var(--color-text-secondary); }
  .g.edge { color: var(--color-text-primary); font-weight: 600; }

  /* Only rendered when there is a real choice of rail. */
  .rails { display: flex; flex-wrap: wrap; gap: 6px; }
  .rail {
    padding: 5px 11px;
    border: 1px solid var(--color-border-primary);
    border-radius: var(--border-radius-sm);
    background: transparent;
    color: var(--color-text-secondary);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .rail[aria-selected="true"] {
    background: var(--color-background-tertiary);
    color: var(--color-text-primary);
  }
  .rail:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }
</style>
</head>
<body>
<div class="card">
  <div class="head">
    <div>
      <div class="total" id="total">—</div>
      <div class="sub" id="sub">Waiting for payment details…</div>
    </div>
    <div class="chip" id="chip" data-state="pending">Pending</div>
  </div>

  <div class="rails" id="rails" hidden role="tablist" aria-label="Payment currency"></div>

  <div id="pay" hidden>
    <div class="field" style="margin-bottom:10px">
      <div class="field-head">
        <span class="label">Send exactly</span>
        <button class="copy" id="copyAmount" type="button">Copy</button>
      </div>
      <div class="value" id="amount"></div>
      <div class="sub" id="rate" hidden></div>
    </div>

    <!-- Address last, closest to the action: a wrong amount can be topped up,
         a wrong address cannot be recovered. -->
    <div class="field">
      <div class="field-head">
        <span class="label" id="addrLabel">To this address</span>
        <button class="copy" id="copyAddr" type="button">Copy</button>
      </div>
      <div class="value addr" id="addr"></div>
    </div>
  </div>

  <div class="rest" id="rest" hidden></div>

  <div class="actions">
    <button class="btn" id="check" type="button" hidden>Check payment</button>
    <button class="btn" id="wallet" type="button" hidden>Open in wallet</button>
    <span class="note" id="status"></span>
  </div>

  <div class="note" id="verify" hidden>
    Check the <strong>highlighted first and last groups</strong> of the address against
    your wallet before sending. Send the exact amount — a short payment credits short.
  </div>
</div>

<script>
// Impreza Host — the MCP Apps host bridge, shared by every panel.
//
// Substituted into each panel's BRIDGE marker by McpUi::read() and by
// tools/gen_ui_assets.php. A panel is a standalone HTML document that may fetch
// nothing from the network, so the only alternatives to substitution were three
// copies of this file or a build step. One mechanism, one place the verifier has
// to lint, and the panels stay readable.
//
// Rules that hold for every panel and are enforced by tools/verify_mcp_apps.php:
//   · No network. Every value arrives over this bridge.
//   · Never innerHTML. Tool values reach the DOM through textContent only.
//   · Never inject hostContext.styles.css.fonts — the spec lets a host hand us
//     an @import from a font service and its own applyHostFonts() injects it
//     verbatim, which on our panels is a third-party request identifying the
//     viewer. Colour and radius VARIABLES yes; the host's font CSS never.

'use strict';

var Bridge = (function () {
  var nextId = 1;
  var pending = Object.create(null);
  var handlers = Object.create(null);
  var hostCaps = {};

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || msg.jsonrpc !== '2.0') { return; }
    if (msg.id !== undefined && msg.id !== null && pending[msg.id]) {
      var p = pending[msg.id];
      delete pending[msg.id];
      if (msg.error) { p.reject(new Error(msg.error.message || 'request failed')); }
      else { p.resolve(msg.result); }
      return;
    }
    if (msg.method && handlers[msg.method]) {
      // A malformed notification must not take the panel down with it.
      try { handlers[msg.method](msg.params || {}); } catch (e) { /* ignored */ }
    }
  });

  function request(method, params) {
    var id = nextId++;
    return new Promise(function (resolve, reject) {
      pending[id] = { resolve: resolve, reject: reject };
      window.parent.postMessage({ jsonrpc: '2.0', id: id, method: method, params: params || {} }, '*');
    });
  }

  function notify(method, params) {
    window.parent.postMessage({ jsonrpc: '2.0', method: method, params: params || {} }, '*');
  }

  function on(method, fn) { handlers[method] = fn; }

  /**
   * Call one of OUR tools through the host. The host decides whether to
   * forward it and may ask the viewer first — a panel never assumes consent.
   * Resolves with the tool's structuredContent when it has one, falling back to
   * parsing the text block for a host that only forwards \`content\`.
   */
  function callTool(name, args) {
    return request('tools/call', { name: name, arguments: args || {} }).then(function (res) {
      res = res || {};
      if (res.isError) {
        var text = (res.content && res.content[0] && res.content[0].text) || 'The tool call failed.';
        throw new Error(text);
      }
      return unwrap(res);
    });
  }

  /** structuredContent if present, else the text block parsed as JSON. */
  function unwrap(payload) {
    if (!payload) { return null; }
    if (payload.structuredContent) { return payload.structuredContent; }
    var t = payload.content && payload.content[0] && payload.content[0].text;
    if (typeof t === 'string') {
      try { return JSON.parse(t); } catch (e) { return null; }
    }
    return null;
  }

  function applyStyles(styles) {
    if (!styles || !styles.variables) { return; }
    Object.keys(styles.variables).forEach(function (k) {
      var v = styles.variables[k];
      // Only custom properties, and only plain values: a variable is otherwise
      // a place a host could smuggle CSS into our document.
      if (k.indexOf('--') === 0 && typeof v === 'string' && v.indexOf('}') === -1 && v.indexOf('@') === -1) {
        document.documentElement.style.setProperty(k, v);
      }
    });
    // styles.css.fonts is DELIBERATELY ignored. See the note at the top.
  }

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.style.colorScheme = theme;
    }
  }

  var lastH = 0;
  function reportSize() {
    var h = Math.ceil(document.documentElement.scrollHeight);
    var w = Math.ceil(document.documentElement.scrollWidth);
    if (h === lastH) { return; }
    lastH = h;
    notify('ui/notifications/size-changed', { width: w, height: h });
  }

  /**
   * Handshake, then hand the panel its data.
   *
   * onResult receives the tool result (unwrapped), onInput the tool arguments,
   * onFail a message when there is no bridge or the call was cancelled.
   */
  function start(opts) {
    opts = opts || {};
    var onResult = opts.onResult || function () {};
    var onInput = opts.onInput || function () {};
    var onFail = opts.onFail || function () {};

    on('ui/notifications/tool-input', function (params) { onInput(params || {}); reportSize(); });
    on('ui/notifications/tool-result', function (params) {
      if (params && params.isError) {
        var text = (params.content && params.content[0] && params.content[0].text) || '';
        onFail(text || 'The tool call failed.');
        return;
      }
      var data = unwrap(params);
      if (data) { onResult(data); } else { onFail('The tool returned nothing this panel can render.'); }
      reportSize();
    });
    on('ui/notifications/tool-cancelled', function () { onFail('The request was cancelled.'); });
    on('ui/notifications/host-context-changed', function (params) {
      if (!params) { return; }
      if (params.theme) { applyTheme(params.theme); }
      if (params.styles) { applyStyles(params.styles); }
    });

    if (window.ResizeObserver) {
      new ResizeObserver(reportSize).observe(document.body);
    }

    return request('ui/initialize', {
      protocolVersion: '2026-01-26',
      clientInfo: { name: opts.name || 'impreza-panel', version: '1.0.0' },
      appCapabilities: {}
    }).then(function (result) {
      result = result || {};
      hostCaps = result.capabilities || {};
      var ctx = result.hostContext || {};
      applyTheme(ctx.theme);
      applyStyles(ctx.styles);
      notify('ui/notifications/initialized', {});
      reportSize();
      return { capabilities: hostCaps, hostContext: ctx };
    }, function () {
      // Standalone, with no host on the other end. Saying so beats a spinner
      // that never resolves.
      onFail('This panel needs an MCP host to load its data.');
      throw new Error('no host bridge');
    });
  }

  /** Ask the host to open a URL. Only offered when it says it can. */
  function openLink(url) {
    return request('ui/open-link', { url: String(url) });
  }

  function canOpenLinks() { return !!hostCaps.openLinks; }

  /** Copy text, with a fallback because permissions are never guaranteed. */
  function copy(text, button, okLabel, failLabel) {
    var done = function (ok) {
      var original = button.dataset.label || button.textContent;
      button.dataset.label = original;
      button.textContent = ok ? (okLabel || 'Copied') : (failLabel || 'Select it');
      setTimeout(function () { button.textContent = button.dataset.label; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    done(false);
  }

  return {
    request: request,
    notify: notify,
    on: on,
    callTool: callTool,
    unwrap: unwrap,
    start: start,
    reportSize: reportSize,
    openLink: openLink,
    canOpenLinks: canOpenLinks,
    copy: copy
  };
})();

/** Shorthand every panel uses. */
function el(id) { return document.getElementById(id); }


(function () {
  'use strict';

  var options = [];
  var picked = 0;
  var invoiceId = null;
  var busy = false;

  function setChip(state, text) {
    var chip = el('chip');
    chip.dataset.state = state;
    chip.textContent = text;
  }

  function money(amount, currency) {
    var n = Number(amount);
    var shown = isFinite(n) ? n.toFixed(2) : String(amount == null ? '' : amount);
    return shown + ' ' + String(currency || '');
  }

  // Groups of four. The FIRST four and the LAST four characters are the anchors
  // a person actually checks against their wallet, so they are taken as the
  // edges before the middle is chunked — grouping left-to-right and marking the
  // final group would leave a two-character anchor on many addresses, which is
  // a weaker thing to ask someone to verify.
  function renderAddress(address) {
    var box = el('addr');
    box.textContent = '';
    var s = String(address || '');
    if (s === '') { return; }

    var parts;
    if (s.length <= 12) {
      parts = [{ t: s, edge: true }];
    } else {
      parts = [{ t: s.slice(0, 4), edge: true }];
      (s.slice(4, -4).match(/.{1,4}/g) || []).forEach(function (g) {
        parts.push({ t: g, edge: false });
      });
      parts.push({ t: s.slice(-4), edge: true });
    }

    parts.forEach(function (p) {
      var span = document.createElement('span');
      span.className = 'g' + (p.edge ? ' edge' : '');
      span.textContent = p.t;
      box.appendChild(span);
    });
  }

  function renderRails() {
    var box = el('rails');
    box.textContent = '';
    if (options.length < 2) { box.hidden = true; return; }
    box.hidden = false;
    options.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rail';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === picked ? 'true' : 'false');
      b.textContent = String(o.crypto || o.rail || '?');
      b.addEventListener('click', function () { picked = i; renderOption(); renderRails(); });
      box.appendChild(b);
    });
  }

  function renderOption() {
    var o = options[picked];
    if (!o) { el('pay').hidden = true; return; }
    el('pay').hidden = false;
    el('verify').hidden = false;

    el('amount').textContent = String(o.crypto_amount || '') + ' ' + String(o.crypto || '');
    el('addrLabel').textContent = o.network
      ? 'To this address · ' + String(o.network)
      : 'To this address';
    renderAddress(o.address);

    var rate = el('rate');
    var bits = [];
    if (o.rate) { bits.push('Rate ' + String(o.rate)); }
    if (o.expires_at) { bits.push('Expires ' + String(o.expires_at)); }
    if (o.note) { bits.push(String(o.note)); }
    rate.textContent = bits.join(' · ');
    rate.hidden = bits.length === 0;

    // A wallet hand-off is only offered when the host says it can open links.
    el('wallet').hidden = !(Bridge.canOpenLinks() && o.payment_uri);
    Bridge.reportSize();
  }

  function renderRest(available) {
    var box = el('rest');
    if (!available) { box.hidden = true; return; }
    // Whatever is already a tab is not "also payable in" — repeating it reads
    // as a second, worse route to the same thing.
    var shown = {};
    options.forEach(function (o) { shown[String(o.crypto || '').toUpperCase()] = true; });
    var more = [];
    var add = function (c) {
      var k = String(c).toUpperCase();
      if (!shown[k]) { shown[k] = true; more.push(k); }
    };
    (available.tronpay || []).forEach(add);
    (available.altcoins_via_fixedfloat || []).forEach(add);
    if (more.length === 0) { box.hidden = true; return; }
    box.hidden = false;
    box.textContent = 'Also payable in ' + more.slice(0, 12).join(', ')
      + (more.length > 12 ? ' and more' : '')
      + ' — ask for that coin to get its own address.';
  }

  function render(data) {
    if (!data || typeof data !== 'object') { return; }
    invoiceId = data.invoice_id != null ? data.invoice_id : invoiceId;

    el('total').textContent = money(data.fiat_amount, data.currency);
    el('sub').textContent = invoiceId != null ? ('Top-up invoice #' + String(invoiceId)) : '';

    var paid = String(data.status || '').toLowerCase() === 'paid';
    setChip(paid ? 'paid' : 'pending', paid ? 'Paid' : 'Awaiting payment');

    options = Array.isArray(data.payment_options) ? data.payment_options : [];
    if (picked >= options.length) { picked = 0; }

    if (paid) {
      el('pay').hidden = true;
      el('rails').hidden = true;
      el('verify').hidden = true;
      el('rest').hidden = true;
      el('wallet').hidden = true;
      el('status').textContent = data.balance != null
        ? ('Credited. Account balance is now ' + money(data.balance, data.currency) + '.')
        : 'Credited to the account balance.';
    } else {
      renderRails();
      renderOption();
      renderRest(data.available);
    }

    el('check').hidden = paid || invoiceId == null;
    Bridge.reportSize();
  }

  function fail(text) {
    setChip('error', 'Unavailable');
    el('sub').textContent = '';
    var s = el('status');
    s.className = 'note warn';
    s.textContent = String(text || 'Could not load the payment details.');
    Bridge.reportSize();
  }

  el('copyAmount').addEventListener('click', function () {
    var o = options[picked];
    if (o) { Bridge.copy(String(o.crypto_amount || ''), this); }
  });
  el('copyAddr').addEventListener('click', function () {
    var o = options[picked];
    if (o) { Bridge.copy(String(o.address || ''), this); }
  });

  el('wallet').addEventListener('click', function () {
    var o = options[picked];
    if (!o || !o.payment_uri) { return; }
    Bridge.openLink(o.payment_uri).catch(function () {
      el('status').textContent = 'The host declined to open the wallet link — copy the address instead.';
    });
  });

  // The one server call this panel makes, and the mildest one available: a
  // read-scope status poll on the caller's own invoice.
  el('check').addEventListener('click', function () {
    if (busy || invoiceId == null) { return; }
    busy = true;
    var btn = this;
    btn.disabled = true;
    el('status').className = 'note';
    el('status').textContent = 'Checking…';
    Bridge.callTool('impreza_topup_status', { invoice_id: invoiceId })
      .then(function (data) {
        if (data && String(data.status || '').toLowerCase() === 'paid') {
          render({
            invoice_id: invoiceId,
            fiat_amount: data.amount != null ? data.amount : data.fiat_amount,
            currency: data.currency,
            status: 'paid',
            balance: data.balance
          });
        } else {
          el('status').textContent = 'Not confirmed yet. On-chain confirmation usually takes a few minutes.';
        }
      })
      .catch(function (e) {
        el('status').className = 'note warn';
        el('status').textContent = e.message || 'The check failed. Try again in a moment.';
      })
      .then(function () {
        busy = false;
        btn.disabled = false;
        Bridge.reportSize();
      });
  });

  Bridge.start({ name: 'impreza-topup-card', onResult: render, onFail: fail });
})();
</script>
</body>
</html>
`;

/** md5 of the canonical lib/ui/topup-card.html, LF-normalised. */
export const TOPUP_CARD_HTML_MD5 = 'f846b1452b3d8d41166ef89351c0da2b';

export const SERVER_CARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">

<title>Server</title>
<!--
  Impreza Host — MCP Apps view for impreza_vps_status.

  The control panel that needs no clientarea login: what the machine is, how
  hard it is working, and the power controls, in the chat where the customer
  already is.

  Two decisions worth knowing:

  · The card is seeded from \`structuredContent\` (the live numbers, immediately)
    plus \`ui/notifications/tool-input\` (which carries the service_id the tool
    was called with — the status result itself does not contain it). It then
    makes ONE enrichment call for the hardware identity, which never changes.
    Deployments load only when asked: most people opening a server card want to
    know whether it is up, not to enumerate apps.

  · Reboot and shutdown ARM on the first click and fire on the second. The host
    adds its own consent gate for a tool call from a view, but a mis-click that
    reboots a production VM costs someone an afternoon, and the panel is the
    right place to make intent explicit. Start fires directly: it can only help.

  This panel deliberately calls no confirmation-gated tool. Those exist because
  intent must be proven across two SEPARATE calls, and a view that did both
  halves on one click would defeat the gate rather than satisfy it.
-->
<style>
/* Impreza Host — shared tokens and primitives for every MCP Apps panel.
 *
 * Substituted into each panel's TOKENS marker by McpUi::read() and by
 * tools/gen_ui_assets.php, for the same reason as _bridge.js: a panel may fetch
 * nothing from the network, so the choice was one substitution or three copies.
 * Keeping it in one file is also what makes our panels read as one family
 * rather than three pages that happen to ship together.
 *
 * Host-provided variables win. These fallbacks are what a panel looks like when
 * a host sends none — which the spec warns is common, along with partial sets.
 * Neutrals carry a warm bias on purpose: a pure mid-grey reads as unconsidered.
 */

:root {
  color-scheme: light dark;

  --color-background-primary:   light-dark(#fcfcfb, #1b1b1a);
  --color-background-secondary: light-dark(#f4f3ef, #232320);
  --color-background-tertiary:  light-dark(#eceae4, #2b2a26);
  --color-text-primary:         light-dark(#1a1a17, #f2f1ed);
  --color-text-secondary:       light-dark(#6e6d66, #a5a49c);
  --color-text-tertiary:        light-dark(#8d8c84, #7e7d76);
  --color-text-warning:         light-dark(#8a5a00, #e0a83a);
  --color-text-success:         light-dark(#1f6b3a, #5fbf83);
  --color-text-danger:          light-dark(#9a2b21, #f08a7e);
  --color-border-primary:       light-dark(#e5e4de, #33302b);
  --color-border-secondary:     light-dark(#efeee9, #2a2825);

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-full: 999px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  max-width: 560px;
}

/* ── header ───────────────────────────────────────────────────────────── */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.title {
  font-family: var(--font-mono);
  font-size: 18px;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}
.total {
  font-family: var(--font-mono);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.sub {
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

/* State, and state only — the one place colour is allowed to catch the eye. */
.chip {
  flex: none;
  padding: 3px 10px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-full);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.chip[data-state="pending"] { color: var(--color-text-warning); }
.chip[data-state="paid"],
.chip[data-state="ok"]      { color: var(--color-text-success); }
.chip[data-state="error"],
.chip[data-state="off"]     { color: var(--color-text-danger); }
.chip[data-state="idle"]    { color: var(--color-text-secondary); }

/* ── labelled value blocks ────────────────────────────────────────────── */
.field {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-secondary);
  padding: 10px 12px;
}
.field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.label {
  color: var(--color-text-tertiary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.value {
  font-family: var(--font-mono);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  user-select: all;
}

/* ── controls ─────────────────────────────────────────────────────────── */
.actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn {
  padding: 6px 13px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: default; }
.btn:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }
/* Armed: one more click fires it. Used where a mis-click costs an afternoon. */
.btn[data-armed="1"] {
  color: var(--color-text-danger);
  border-color: var(--color-text-danger);
}
.btn.quiet {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn.quiet:hover { color: var(--color-text-primary); }
.copy {
  flex: none;
  padding: 3px 9px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.copy:hover { color: var(--color-text-primary); }
.copy:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }

input[type="text"], select {
  width: 100%;
  padding: 6px 9px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
}
input[type="text"] { font-family: var(--font-mono); }
input:focus-visible, select:focus-visible {
  outline: 2px solid var(--color-text-secondary);
  outline-offset: 1px;
}
.check { display: flex; align-items: center; gap: 7px; font-size: 13px; cursor: pointer; }
.check input { margin: 0; }

/* ── notes ────────────────────────────────────────────────────────────── */
.note { color: var(--color-text-secondary); font-size: 11.5px; }
.note strong { color: var(--color-text-primary); font-weight: 600; }
.warn { color: var(--color-text-danger); }
.rest { color: var(--color-text-secondary); font-size: 13px; }

[hidden] { display: none !important; }

@media (prefers-reduced-motion: no-preference) {
  .copy, .btn { transition: color 90ms ease, background 90ms ease, border-color 90ms ease; }
}


  /* ── identity strip ───────────────────────────────────────────────────── */
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    color: var(--color-text-secondary);
    font-size: 12px;
  }
  .facts b {
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-weight: 600;
  }

  /* ── meters: real scales, and every label names a value they reach ────── */
  .meters { display: flex; flex-direction: column; gap: 10px; }
  .meter-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }
  .meter-val {
    font-family: var(--font-mono);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary);
  }
  .track {
    height: 6px;
    border-radius: var(--border-radius-full);
    background: var(--color-background-tertiary);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    width: 0;
    border-radius: var(--border-radius-full);
    background: var(--color-text-secondary);
  }
  /* Pressure, not decoration: the bar changes colour only where it matters. */
  .fill[data-load="high"] { background: var(--color-text-warning); }
  .fill[data-load="full"] { background: var(--color-text-danger); }

  /* ── deployments ──────────────────────────────────────────────────────── */
  .apps { display: flex; flex-direction: column; gap: 6px; }
  .app {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 10px;
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-sm);
    font-size: 12.5px;
  }
  .app-name { font-family: var(--font-mono); font-weight: 600; }
  .app-host { color: var(--color-text-secondary); overflow-wrap: anywhere; }
  .app-state { flex: none; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .app-state[data-state="ok"]   { color: var(--color-text-success); }
  .app-state[data-state="work"] { color: var(--color-text-warning); }
  .app-state[data-state="bad"]  { color: var(--color-text-danger); }
  .app-state[data-state="gone"] { color: var(--color-text-tertiary); }
</style>
</head>
<body>
<div class="card">
  <div class="head">
    <div>
      <div class="title" id="host">—</div>
      <div class="sub" id="sub">Loading server details…</div>
    </div>
    <div class="chip" id="chip" data-state="idle">Unknown</div>
  </div>

  <div class="facts" id="facts" hidden></div>

  <div class="meters" id="meters" hidden>
    <div>
      <div class="meter-head">
        <span class="label">CPU</span>
        <span class="meter-val" id="cpuVal"></span>
      </div>
      <div class="track"><div class="fill" id="cpuFill"></div></div>
    </div>
    <div>
      <div class="meter-head">
        <span class="label">Memory</span>
        <span class="meter-val" id="memVal"></span>
      </div>
      <div class="track"><div class="fill" id="memFill"></div></div>
    </div>
  </div>

  <div class="actions">
    <button class="btn" id="refresh" type="button">Refresh</button>
    <button class="btn" id="start" type="button" hidden>Start</button>
    <button class="btn" id="reboot" type="button" hidden>Reboot</button>
    <button class="btn" id="shutdown" type="button" hidden>Shut down</button>
    <span class="note" id="status"></span>
  </div>

  <div>
    <button class="btn quiet" id="appsToggle" type="button">Show deployed apps</button>
    <div class="apps" id="apps" hidden style="margin-top:10px"></div>
  </div>
</div>

<script>
// Impreza Host — the MCP Apps host bridge, shared by every panel.
//
// Substituted into each panel's BRIDGE marker by McpUi::read() and by
// tools/gen_ui_assets.php. A panel is a standalone HTML document that may fetch
// nothing from the network, so the only alternatives to substitution were three
// copies of this file or a build step. One mechanism, one place the verifier has
// to lint, and the panels stay readable.
//
// Rules that hold for every panel and are enforced by tools/verify_mcp_apps.php:
//   · No network. Every value arrives over this bridge.
//   · Never innerHTML. Tool values reach the DOM through textContent only.
//   · Never inject hostContext.styles.css.fonts — the spec lets a host hand us
//     an @import from a font service and its own applyHostFonts() injects it
//     verbatim, which on our panels is a third-party request identifying the
//     viewer. Colour and radius VARIABLES yes; the host's font CSS never.

'use strict';

var Bridge = (function () {
  var nextId = 1;
  var pending = Object.create(null);
  var handlers = Object.create(null);
  var hostCaps = {};

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || msg.jsonrpc !== '2.0') { return; }
    if (msg.id !== undefined && msg.id !== null && pending[msg.id]) {
      var p = pending[msg.id];
      delete pending[msg.id];
      if (msg.error) { p.reject(new Error(msg.error.message || 'request failed')); }
      else { p.resolve(msg.result); }
      return;
    }
    if (msg.method && handlers[msg.method]) {
      // A malformed notification must not take the panel down with it.
      try { handlers[msg.method](msg.params || {}); } catch (e) { /* ignored */ }
    }
  });

  function request(method, params) {
    var id = nextId++;
    return new Promise(function (resolve, reject) {
      pending[id] = { resolve: resolve, reject: reject };
      window.parent.postMessage({ jsonrpc: '2.0', id: id, method: method, params: params || {} }, '*');
    });
  }

  function notify(method, params) {
    window.parent.postMessage({ jsonrpc: '2.0', method: method, params: params || {} }, '*');
  }

  function on(method, fn) { handlers[method] = fn; }

  /**
   * Call one of OUR tools through the host. The host decides whether to
   * forward it and may ask the viewer first — a panel never assumes consent.
   * Resolves with the tool's structuredContent when it has one, falling back to
   * parsing the text block for a host that only forwards \`content\`.
   */
  function callTool(name, args) {
    return request('tools/call', { name: name, arguments: args || {} }).then(function (res) {
      res = res || {};
      if (res.isError) {
        var text = (res.content && res.content[0] && res.content[0].text) || 'The tool call failed.';
        throw new Error(text);
      }
      return unwrap(res);
    });
  }

  /** structuredContent if present, else the text block parsed as JSON. */
  function unwrap(payload) {
    if (!payload) { return null; }
    if (payload.structuredContent) { return payload.structuredContent; }
    var t = payload.content && payload.content[0] && payload.content[0].text;
    if (typeof t === 'string') {
      try { return JSON.parse(t); } catch (e) { return null; }
    }
    return null;
  }

  function applyStyles(styles) {
    if (!styles || !styles.variables) { return; }
    Object.keys(styles.variables).forEach(function (k) {
      var v = styles.variables[k];
      // Only custom properties, and only plain values: a variable is otherwise
      // a place a host could smuggle CSS into our document.
      if (k.indexOf('--') === 0 && typeof v === 'string' && v.indexOf('}') === -1 && v.indexOf('@') === -1) {
        document.documentElement.style.setProperty(k, v);
      }
    });
    // styles.css.fonts is DELIBERATELY ignored. See the note at the top.
  }

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.style.colorScheme = theme;
    }
  }

  var lastH = 0;
  function reportSize() {
    var h = Math.ceil(document.documentElement.scrollHeight);
    var w = Math.ceil(document.documentElement.scrollWidth);
    if (h === lastH) { return; }
    lastH = h;
    notify('ui/notifications/size-changed', { width: w, height: h });
  }

  /**
   * Handshake, then hand the panel its data.
   *
   * onResult receives the tool result (unwrapped), onInput the tool arguments,
   * onFail a message when there is no bridge or the call was cancelled.
   */
  function start(opts) {
    opts = opts || {};
    var onResult = opts.onResult || function () {};
    var onInput = opts.onInput || function () {};
    var onFail = opts.onFail || function () {};

    on('ui/notifications/tool-input', function (params) { onInput(params || {}); reportSize(); });
    on('ui/notifications/tool-result', function (params) {
      if (params && params.isError) {
        var text = (params.content && params.content[0] && params.content[0].text) || '';
        onFail(text || 'The tool call failed.');
        return;
      }
      var data = unwrap(params);
      if (data) { onResult(data); } else { onFail('The tool returned nothing this panel can render.'); }
      reportSize();
    });
    on('ui/notifications/tool-cancelled', function () { onFail('The request was cancelled.'); });
    on('ui/notifications/host-context-changed', function (params) {
      if (!params) { return; }
      if (params.theme) { applyTheme(params.theme); }
      if (params.styles) { applyStyles(params.styles); }
    });

    if (window.ResizeObserver) {
      new ResizeObserver(reportSize).observe(document.body);
    }

    return request('ui/initialize', {
      protocolVersion: '2026-01-26',
      clientInfo: { name: opts.name || 'impreza-panel', version: '1.0.0' },
      appCapabilities: {}
    }).then(function (result) {
      result = result || {};
      hostCaps = result.capabilities || {};
      var ctx = result.hostContext || {};
      applyTheme(ctx.theme);
      applyStyles(ctx.styles);
      notify('ui/notifications/initialized', {});
      reportSize();
      return { capabilities: hostCaps, hostContext: ctx };
    }, function () {
      // Standalone, with no host on the other end. Saying so beats a spinner
      // that never resolves.
      onFail('This panel needs an MCP host to load its data.');
      throw new Error('no host bridge');
    });
  }

  /** Ask the host to open a URL. Only offered when it says it can. */
  function openLink(url) {
    return request('ui/open-link', { url: String(url) });
  }

  function canOpenLinks() { return !!hostCaps.openLinks; }

  /** Copy text, with a fallback because permissions are never guaranteed. */
  function copy(text, button, okLabel, failLabel) {
    var done = function (ok) {
      var original = button.dataset.label || button.textContent;
      button.dataset.label = original;
      button.textContent = ok ? (okLabel || 'Copied') : (failLabel || 'Select it');
      setTimeout(function () { button.textContent = button.dataset.label; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    done(false);
  }

  return {
    request: request,
    notify: notify,
    on: on,
    callTool: callTool,
    unwrap: unwrap,
    start: start,
    reportSize: reportSize,
    openLink: openLink,
    canOpenLinks: canOpenLinks,
    copy: copy
  };
})();

/** Shorthand every panel uses. */
function el(id) { return document.getElementById(id); }


(function () {
  'use strict';

  var serviceId = null;
  var powerState = '';
  var busy = false;
  var appsLoaded = false;

  // ── formatting ──────────────────────────────────────────────────────────
  function gib(bytes) {
    var n = Number(bytes);
    if (!isFinite(n) || n <= 0) { return null; }
    return n / 1073741824;
  }

  function uptime(seconds) {
    var s = Number(seconds);
    if (!isFinite(s) || s <= 0) { return null; }
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    if (d > 0) { return d + 'd ' + h + 'h'; }
    if (h > 0) { return h + 'h ' + m + 'm'; }
    return m + 'm';
  }

  function load(pct) {
    if (pct >= 90) { return 'full'; }
    if (pct >= 70) { return 'high'; }
    return 'normal';
  }

  function setMeter(fillEl, valEl, pct, text) {
    var p = Math.max(0, Math.min(100, Number(pct) || 0));
    fillEl.style.width = p.toFixed(1) + '%';
    fillEl.dataset.load = load(p);
    valEl.textContent = text;
  }

  // ── rendering ───────────────────────────────────────────────────────────
  function setPower(state) {
    powerState = String(state || '').toLowerCase();
    var chip = el('chip');
    if (powerState === 'running') {
      chip.dataset.state = 'ok';
      chip.textContent = 'Running';
    } else if (powerState === 'stopped') {
      chip.dataset.state = 'off';
      chip.textContent = 'Stopped';
    } else if (powerState === '') {
      chip.dataset.state = 'idle';
      chip.textContent = 'Unknown';
    } else {
      chip.dataset.state = 'pending';
      chip.textContent = powerState;
    }

    // Offer only what the current state makes sense for.
    var running = powerState === 'running';
    el('start').hidden = running || powerState === '';
    el('reboot').hidden = !running;
    el('shutdown').hidden = !running;
    disarmAll();
  }

  function renderStatus(d) {
    if (!d || typeof d !== 'object') { return; }
    setPower(d.power_state);

    var usedGiB = gib(d.memory_used);
    var totalGiB = gib(d.memory_total);
    var memPct = (usedGiB !== null && totalGiB) ? (usedGiB / totalGiB) * 100 : 0;
    var cpuPct = Number(d.cpu_usage);
    if (!isFinite(cpuPct)) { cpuPct = 0; }
    // The upstream reports CPU as a percentage already; a 0–1 fraction would be
    // a different contract, and mis-reading it would draw a flat bar forever.
    if (cpuPct > 0 && cpuPct <= 1 && d.cpu_usage !== 1) { cpuPct = cpuPct * 100; }

    el('meters').hidden = false;
    setMeter(el('cpuFill'), el('cpuVal'), cpuPct, cpuPct.toFixed(1) + '% of 100%');
    setMeter(
      el('memFill'), el('memVal'), memPct,
      (usedGiB !== null && totalGiB)
        ? usedGiB.toFixed(2) + ' of ' + totalGiB.toFixed(2) + ' GiB · ' + memPct.toFixed(0) + '%'
        : 'not reported'
    );

    var up = uptime(d.uptime);
    el('sub').textContent = up ? ('Up ' + up) : '';
    Bridge.reportSize();
  }

  function renderIdentity(info) {
    if (!info || typeof info !== 'object') { return; }
    if (info.hostname) { el('host').textContent = String(info.hostname); }

    var res = info.resources || {};
    var bits = [];
    var push = function (label, value) {
      if (value === null || value === undefined || value === '') { return; }
      bits.push([label, String(value)]);
    };
    push('Node', info.node);
    push('vCPU', res.cores);
    push('RAM', res.memory_mb ? (Math.round(res.memory_mb / 1024 * 10) / 10) + ' GiB' : null);
    push('Disk', res.disk_gb ? res.disk_gb + ' GB' : null);
    var ips = Array.isArray(info.ips) ? info.ips.map(function (i) { return String(i.ip || ''); }).filter(Boolean) : [];
    push('IP', ips.join(', '));
    if (info.os) { push('OS', info.os); }

    var box = el('facts');
    box.textContent = '';
    bits.forEach(function (pair) {
      var span = document.createElement('span');
      span.appendChild(document.createTextNode(pair[0] + ' '));
      var b = document.createElement('b');
      b.textContent = pair[1];
      span.appendChild(b);
      box.appendChild(span);
    });
    box.hidden = bits.length === 0;
    Bridge.reportSize();
  }

  function appState(status) {
    var s = String(status || '').toLowerCase();
    if (s === 'running') { return ['ok', s]; }
    if (s === 'failed') { return ['bad', s]; }
    if (s === 'uninstalled') { return ['gone', s]; }
    return ['work', s || 'unknown'];
  }

  function renderApps(list) {
    var box = el('apps');
    box.textContent = '';
    var rows = Array.isArray(list) ? list : [];
    if (rows.length === 0) {
      var none = document.createElement('div');
      none.className = 'note';
      none.textContent = 'No apps deployed on this server yet.';
      box.appendChild(none);
      Bridge.reportSize();
      return;
    }
    rows.forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'app';

      var left = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'app-name';
      name.textContent = String(d.app_name || d.name || d.id || '?');
      left.appendChild(name);
      if (d.domain) {
        var host = document.createElement('div');
        host.className = 'app-host';
        host.textContent = String(d.domain).replace(/^https?:\\/\\//, '');
        left.appendChild(host);
      }
      row.appendChild(left);

      var pair = appState(d.status);
      var st = document.createElement('div');
      st.className = 'app-state';
      st.dataset.state = pair[0];
      st.textContent = pair[1];
      row.appendChild(st);

      box.appendChild(row);
    });
    Bridge.reportSize();
  }

  function fail(text) {
    var chip = el('chip');
    chip.dataset.state = 'error';
    chip.textContent = 'Unavailable';
    el('sub').textContent = '';
    var s = el('status');
    s.className = 'note warn';
    s.textContent = String(text || 'Could not load this server.');
    Bridge.reportSize();
  }

  function say(text, bad) {
    var s = el('status');
    s.className = bad ? 'note warn' : 'note';
    s.textContent = text || '';
    Bridge.reportSize();
  }

  // ── the arm-then-fire pattern for the disruptive actions ────────────────
  function disarmAll() {
    ['reboot', 'shutdown'].forEach(function (id) {
      var b = el(id);
      b.dataset.armed = '0';
      b.textContent = b.dataset.base || b.textContent;
    });
  }

  function wirePower(id, action, disruptive) {
    var btn = el(id);
    btn.dataset.base = btn.textContent;
    btn.addEventListener('click', function () {
      if (busy || serviceId === null) { return; }
      if (disruptive && btn.dataset.armed !== '1') {
        disarmAll();
        btn.dataset.armed = '1';
        btn.textContent = 'Confirm ' + btn.dataset.base.toLowerCase();
        say('This interrupts everything running on the server. Click again to go ahead.');
        return;
      }
      disarmAll();
      busy = true;
      btn.disabled = true;
      say(btn.dataset.base + ' requested…');
      Bridge.callTool('impreza_vps_power', { service_id: serviceId, action: action })
        .then(function () {
          say('Accepted. The state below refreshes as the server catches up.');
          setTimeout(refreshStatus, 4000);
        })
        .catch(function (e) { say(e.message || 'The host declined that action.', true); })
        .then(function () { busy = false; btn.disabled = false; Bridge.reportSize(); });
    });
  }

  // ── server calls ────────────────────────────────────────────────────────
  function refreshStatus() {
    if (serviceId === null) { return Promise.resolve(); }
    return Bridge.callTool('impreza_vps_status', { service_id: serviceId })
      .then(renderStatus)
      .catch(function (e) { say(e.message || 'Could not refresh.', true); });
  }

  function loadIdentity() {
    if (serviceId === null) { return; }
    // One enrichment call, for the facts that do not change.
    Bridge.callTool('impreza_api_call', { path: '/vps/proxmox/' + serviceId })
      .then(renderIdentity)
      .catch(function () { /* the card is still useful without the hardware strip */ });
  }

  function loadApps() {
    // Two calls, and only on demand: list_servers maps this service to its
    // agent, and only then can deployments be filtered to THIS machine.
    // Showing another server's apps would be worse than showing none.
    return Bridge.callTool('impreza_list_servers', {})
      .then(function (d) {
        var servers = (d && d.servers) || [];
        var mine = servers.filter(function (s) { return String(s.service_id) === String(serviceId); })[0];
        if (!mine || !mine.agent_id) {
          renderApps([]);
          return;
        }
        return Bridge.callTool('impreza_list_deployments', { agent_id: mine.agent_id })
          .then(function (r) { renderApps((r && r.deployments) || []); });
      })
      .catch(function (e) { say(e.message || 'Could not list apps.', true); });
  }

  // ── wiring ──────────────────────────────────────────────────────────────
  el('refresh').addEventListener('click', function () {
    if (busy) { return; }
    say('Refreshing…');
    refreshStatus().then(function () { say(''); });
  });

  wirePower('start', 'start', false);
  wirePower('reboot', 'reboot', true);
  wirePower('shutdown', 'shutdown', true);

  el('appsToggle').addEventListener('click', function () {
    var box = el('apps');
    if (box.hidden) {
      box.hidden = false;
      this.textContent = 'Hide deployed apps';
      if (!appsLoaded) { appsLoaded = true; loadApps(); }
    } else {
      box.hidden = true;
      this.textContent = 'Show deployed apps';
    }
    Bridge.reportSize();
  });

  Bridge.start({
    name: 'impreza-server-card',
    onInput: function (args) {
      // The status result carries no service_id; the tool ARGUMENTS do, and
      // every later call this panel makes needs it.
      var raw = args && args.service_id;
      if (raw !== undefined && raw !== null && String(raw) !== '') {
        serviceId = Number(raw);
        el('sub').textContent = 'Service #' + serviceId;
        loadIdentity();
      }
    },
    onResult: renderStatus,
    onFail: fail
  });
})();
</script>
</body>
</html>
`;

/** md5 of the canonical lib/ui/server-card.html, LF-normalised. */
export const SERVER_CARD_HTML_MD5 = '86ae56f14b80cb4af14e7bc54bf6c92a';

export const DEPLOY_WIZARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">

<title>Deploy an app</title>
<!--
  Impreza Host — MCP Apps view for impreza_list_apps.

  Browsing a catalogue, filling three fields and watching a deploy is the
  clearest case in this product for a form over a conversation: the questions
  are fixed, the answers are short, and the progress is a state machine.

  Three decisions worth knowing:

  · The form offers ONLY what the selected app declares it supports. The
    catalogue carries \`supports.custom_domain\` and \`supports.onion\` per app, so
    a domain field on an app that cannot take one, or an onion toggle on an app
    with no hidden-service support, would be a promise the deploy then breaks.
    The requirements line is drawn from the app's own numbers for the same
    reason.

  · No app icons. The catalogue gives \`icon_url\`, and fetching it would be a
    network request from a panel whose declared CSP has none — so the tiles use
    a monogram from the app's own name. The constraint shaped the design rather
    than being worked around.

  · Progress is read from the deployment's own status column via
    impreza_list_deployments, not from a second progress model. That works
    whether or not the host speaks the Tasks extension: a host that does gets a
    task handle back from the deploy, one that does not gets the deployment
    JSON, and polling the list answers both.

  This panel deliberately calls no confirmation-gated tool. Those exist because
  intent must be proven across two SEPARATE calls, and a view doing both halves
  on one click would defeat the gate rather than satisfy it.
-->
<style>
/* Impreza Host — shared tokens and primitives for every MCP Apps panel.
 *
 * Substituted into each panel's TOKENS marker by McpUi::read() and by
 * tools/gen_ui_assets.php, for the same reason as _bridge.js: a panel may fetch
 * nothing from the network, so the choice was one substitution or three copies.
 * Keeping it in one file is also what makes our panels read as one family
 * rather than three pages that happen to ship together.
 *
 * Host-provided variables win. These fallbacks are what a panel looks like when
 * a host sends none — which the spec warns is common, along with partial sets.
 * Neutrals carry a warm bias on purpose: a pure mid-grey reads as unconsidered.
 */

:root {
  color-scheme: light dark;

  --color-background-primary:   light-dark(#fcfcfb, #1b1b1a);
  --color-background-secondary: light-dark(#f4f3ef, #232320);
  --color-background-tertiary:  light-dark(#eceae4, #2b2a26);
  --color-text-primary:         light-dark(#1a1a17, #f2f1ed);
  --color-text-secondary:       light-dark(#6e6d66, #a5a49c);
  --color-text-tertiary:        light-dark(#8d8c84, #7e7d76);
  --color-text-warning:         light-dark(#8a5a00, #e0a83a);
  --color-text-success:         light-dark(#1f6b3a, #5fbf83);
  --color-text-danger:          light-dark(#9a2b21, #f08a7e);
  --color-border-primary:       light-dark(#e5e4de, #33302b);
  --color-border-secondary:     light-dark(#efeee9, #2a2825);

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  --border-radius-sm: 6px;
  --border-radius-md: 10px;
  --border-radius-full: 999px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  max-width: 560px;
}

/* ── header ───────────────────────────────────────────────────────────── */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.title {
  font-family: var(--font-mono);
  font-size: 18px;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}
.total {
  font-family: var(--font-mono);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.sub {
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

/* State, and state only — the one place colour is allowed to catch the eye. */
.chip {
  flex: none;
  padding: 3px 10px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-full);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.chip[data-state="pending"] { color: var(--color-text-warning); }
.chip[data-state="paid"],
.chip[data-state="ok"]      { color: var(--color-text-success); }
.chip[data-state="error"],
.chip[data-state="off"]     { color: var(--color-text-danger); }
.chip[data-state="idle"]    { color: var(--color-text-secondary); }

/* ── labelled value blocks ────────────────────────────────────────────── */
.field {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-md);
  background: var(--color-background-secondary);
  padding: 10px 12px;
}
.field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.label {
  color: var(--color-text-tertiary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.value {
  font-family: var(--font-mono);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  user-select: all;
}

/* ── controls ─────────────────────────────────────────────────────────── */
.actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn {
  padding: 6px 13px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: default; }
.btn:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }
/* Armed: one more click fires it. Used where a mis-click costs an afternoon. */
.btn[data-armed="1"] {
  color: var(--color-text-danger);
  border-color: var(--color-text-danger);
}
.btn.quiet {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn.quiet:hover { color: var(--color-text-primary); }
.copy {
  flex: none;
  padding: 3px 9px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.copy:hover { color: var(--color-text-primary); }
.copy:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }

input[type="text"], select {
  width: 100%;
  padding: 6px 9px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
}
input[type="text"] { font-family: var(--font-mono); }
input:focus-visible, select:focus-visible {
  outline: 2px solid var(--color-text-secondary);
  outline-offset: 1px;
}
.check { display: flex; align-items: center; gap: 7px; font-size: 13px; cursor: pointer; }
.check input { margin: 0; }

/* ── notes ────────────────────────────────────────────────────────────── */
.note { color: var(--color-text-secondary); font-size: 11.5px; }
.note strong { color: var(--color-text-primary); font-weight: 600; }
.warn { color: var(--color-text-danger); }
.rest { color: var(--color-text-secondary); font-size: 13px; }

[hidden] { display: none !important; }

@media (prefers-reduced-motion: no-preference) {
  .copy, .btn { transition: color 90ms ease, background 90ms ease, border-color 90ms ease; }
}


  /* ── search + catalogue ───────────────────────────────────────────────── */
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 6px;
    max-height: 260px;
    overflow-y: auto;
  }
  .tile {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 9px;
    border: 1px solid var(--color-border-secondary);
    border-radius: var(--border-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .tile:hover { border-color: var(--color-border-primary); }
  .tile[aria-pressed="true"] {
    border-color: var(--color-text-secondary);
    background: var(--color-background-secondary);
  }
  .tile:focus-visible { outline: 2px solid var(--color-text-secondary); outline-offset: 1px; }
  /* No icon_url fetch — a monogram from the app's own name instead. */
  .mono {
    flex: none;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: var(--border-radius-sm);
    background: var(--color-background-tertiary);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
  }
  .tile-name { font-size: 12.5px; font-weight: 600; line-height: 1.25; }
  .tile-ver {
    color: var(--color-text-tertiary);
    font-family: var(--font-mono);
    font-size: 10.5px;
  }

  /* ── the form ─────────────────────────────────────────────────────────── */
  .form { display: flex; flex-direction: column; gap: 10px; }
  .row { display: flex; flex-direction: column; gap: 4px; }
  .needs {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 11.5px;
  }

  /* ── progress ─────────────────────────────────────────────────────────── */
  .steps { display: flex; flex-direction: column; gap: 5px; }
  .step {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 12.5px;
    color: var(--color-text-secondary);
  }
  .step b {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    min-width: 4.5em;
  }
  .step[data-kind="ok"]   b { color: var(--color-text-success); }
  .step[data-kind="work"] b { color: var(--color-text-warning); }
  .step[data-kind="bad"]  b { color: var(--color-text-danger); }
</style>
</head>
<body>
<div class="card">
  <div class="head">
    <div>
      <div class="title" id="title">Deploy an app</div>
      <div class="sub" id="sub">Loading the catalogue…</div>
    </div>
    <div class="chip" id="chip" data-state="idle" hidden>Idle</div>
  </div>

  <!-- ── pick ────────────────────────────────────────────────────────── -->
  <div id="pick" hidden>
    <div class="row" style="margin-bottom:8px">
      <label class="label" for="search">Search the catalogue</label>
      <input type="text" id="search" autocomplete="off" spellcheck="false" placeholder="name, category or tag">
    </div>
    <div class="tiles" id="tiles" role="listbox" aria-label="Catalogue apps"></div>
    <div class="note" id="none" hidden style="margin-top:8px">Nothing in the catalogue matches that.</div>
  </div>

  <!-- ── configure ───────────────────────────────────────────────────── -->
  <div class="form" id="form" hidden>
    <div class="needs" id="needs"></div>
    <div class="row">
      <label class="label" for="agent">Deploy to</label>
      <select id="agent"></select>
    </div>
    <div class="row" id="domainRow">
      <label class="label" for="domain">Domain <span style="text-transform:none;letter-spacing:0">— leave blank for a free *.imprezaapps.com hostname</span></label>
      <input type="text" id="domain" autocomplete="off" spellcheck="false" placeholder="app.example.com">
    </div>
    <label class="check" id="onionRow">
      <input type="checkbox" id="onion">
      <span>Also publish a Tor hidden service (.onion) mirror</span>
    </label>
    <div class="actions">
      <button class="btn" id="deploy" type="button">Deploy</button>
      <button class="btn quiet" id="back" type="button">Pick another app</button>
      <span class="note" id="status"></span>
    </div>
  </div>

  <!-- ── watch ───────────────────────────────────────────────────────── -->
  <div id="progress" hidden>
    <div class="steps" id="steps"></div>
    <div class="field" id="result" hidden style="margin-top:10px">
      <div class="field-head">
        <span class="label">Live at</span>
        <button class="copy" id="copyUrl" type="button">Copy</button>
      </div>
      <div class="value" id="url"></div>
    </div>
    <div class="actions" style="margin-top:10px">
      <button class="btn" id="open" type="button" hidden>Open</button>
      <button class="btn quiet" id="again" type="button" hidden>Deploy another</button>
    </div>
  </div>
</div>

<script>
// Impreza Host — the MCP Apps host bridge, shared by every panel.
//
// Substituted into each panel's BRIDGE marker by McpUi::read() and by
// tools/gen_ui_assets.php. A panel is a standalone HTML document that may fetch
// nothing from the network, so the only alternatives to substitution were three
// copies of this file or a build step. One mechanism, one place the verifier has
// to lint, and the panels stay readable.
//
// Rules that hold for every panel and are enforced by tools/verify_mcp_apps.php:
//   · No network. Every value arrives over this bridge.
//   · Never innerHTML. Tool values reach the DOM through textContent only.
//   · Never inject hostContext.styles.css.fonts — the spec lets a host hand us
//     an @import from a font service and its own applyHostFonts() injects it
//     verbatim, which on our panels is a third-party request identifying the
//     viewer. Colour and radius VARIABLES yes; the host's font CSS never.

'use strict';

var Bridge = (function () {
  var nextId = 1;
  var pending = Object.create(null);
  var handlers = Object.create(null);
  var hostCaps = {};

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (!msg || msg.jsonrpc !== '2.0') { return; }
    if (msg.id !== undefined && msg.id !== null && pending[msg.id]) {
      var p = pending[msg.id];
      delete pending[msg.id];
      if (msg.error) { p.reject(new Error(msg.error.message || 'request failed')); }
      else { p.resolve(msg.result); }
      return;
    }
    if (msg.method && handlers[msg.method]) {
      // A malformed notification must not take the panel down with it.
      try { handlers[msg.method](msg.params || {}); } catch (e) { /* ignored */ }
    }
  });

  function request(method, params) {
    var id = nextId++;
    return new Promise(function (resolve, reject) {
      pending[id] = { resolve: resolve, reject: reject };
      window.parent.postMessage({ jsonrpc: '2.0', id: id, method: method, params: params || {} }, '*');
    });
  }

  function notify(method, params) {
    window.parent.postMessage({ jsonrpc: '2.0', method: method, params: params || {} }, '*');
  }

  function on(method, fn) { handlers[method] = fn; }

  /**
   * Call one of OUR tools through the host. The host decides whether to
   * forward it and may ask the viewer first — a panel never assumes consent.
   * Resolves with the tool's structuredContent when it has one, falling back to
   * parsing the text block for a host that only forwards \`content\`.
   */
  function callTool(name, args) {
    return request('tools/call', { name: name, arguments: args || {} }).then(function (res) {
      res = res || {};
      if (res.isError) {
        var text = (res.content && res.content[0] && res.content[0].text) || 'The tool call failed.';
        throw new Error(text);
      }
      return unwrap(res);
    });
  }

  /** structuredContent if present, else the text block parsed as JSON. */
  function unwrap(payload) {
    if (!payload) { return null; }
    if (payload.structuredContent) { return payload.structuredContent; }
    var t = payload.content && payload.content[0] && payload.content[0].text;
    if (typeof t === 'string') {
      try { return JSON.parse(t); } catch (e) { return null; }
    }
    return null;
  }

  function applyStyles(styles) {
    if (!styles || !styles.variables) { return; }
    Object.keys(styles.variables).forEach(function (k) {
      var v = styles.variables[k];
      // Only custom properties, and only plain values: a variable is otherwise
      // a place a host could smuggle CSS into our document.
      if (k.indexOf('--') === 0 && typeof v === 'string' && v.indexOf('}') === -1 && v.indexOf('@') === -1) {
        document.documentElement.style.setProperty(k, v);
      }
    });
    // styles.css.fonts is DELIBERATELY ignored. See the note at the top.
  }

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.style.colorScheme = theme;
    }
  }

  var lastH = 0;
  function reportSize() {
    var h = Math.ceil(document.documentElement.scrollHeight);
    var w = Math.ceil(document.documentElement.scrollWidth);
    if (h === lastH) { return; }
    lastH = h;
    notify('ui/notifications/size-changed', { width: w, height: h });
  }

  /**
   * Handshake, then hand the panel its data.
   *
   * onResult receives the tool result (unwrapped), onInput the tool arguments,
   * onFail a message when there is no bridge or the call was cancelled.
   */
  function start(opts) {
    opts = opts || {};
    var onResult = opts.onResult || function () {};
    var onInput = opts.onInput || function () {};
    var onFail = opts.onFail || function () {};

    on('ui/notifications/tool-input', function (params) { onInput(params || {}); reportSize(); });
    on('ui/notifications/tool-result', function (params) {
      if (params && params.isError) {
        var text = (params.content && params.content[0] && params.content[0].text) || '';
        onFail(text || 'The tool call failed.');
        return;
      }
      var data = unwrap(params);
      if (data) { onResult(data); } else { onFail('The tool returned nothing this panel can render.'); }
      reportSize();
    });
    on('ui/notifications/tool-cancelled', function () { onFail('The request was cancelled.'); });
    on('ui/notifications/host-context-changed', function (params) {
      if (!params) { return; }
      if (params.theme) { applyTheme(params.theme); }
      if (params.styles) { applyStyles(params.styles); }
    });

    if (window.ResizeObserver) {
      new ResizeObserver(reportSize).observe(document.body);
    }

    return request('ui/initialize', {
      protocolVersion: '2026-01-26',
      clientInfo: { name: opts.name || 'impreza-panel', version: '1.0.0' },
      appCapabilities: {}
    }).then(function (result) {
      result = result || {};
      hostCaps = result.capabilities || {};
      var ctx = result.hostContext || {};
      applyTheme(ctx.theme);
      applyStyles(ctx.styles);
      notify('ui/notifications/initialized', {});
      reportSize();
      return { capabilities: hostCaps, hostContext: ctx };
    }, function () {
      // Standalone, with no host on the other end. Saying so beats a spinner
      // that never resolves.
      onFail('This panel needs an MCP host to load its data.');
      throw new Error('no host bridge');
    });
  }

  /** Ask the host to open a URL. Only offered when it says it can. */
  function openLink(url) {
    return request('ui/open-link', { url: String(url) });
  }

  function canOpenLinks() { return !!hostCaps.openLinks; }

  /** Copy text, with a fallback because permissions are never guaranteed. */
  function copy(text, button, okLabel, failLabel) {
    var done = function (ok) {
      var original = button.dataset.label || button.textContent;
      button.dataset.label = original;
      button.textContent = ok ? (okLabel || 'Copied') : (failLabel || 'Select it');
      setTimeout(function () { button.textContent = button.dataset.label; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    done(false);
  }

  return {
    request: request,
    notify: notify,
    on: on,
    callTool: callTool,
    unwrap: unwrap,
    start: start,
    reportSize: reportSize,
    openLink: openLink,
    canOpenLinks: canOpenLinks,
    copy: copy
  };
})();

/** Shorthand every panel uses. */
function el(id) { return document.getElementById(id); }


(function () {
  'use strict';

  var apps = [];
  var servers = [];
  var picked = null;
  var busy = false;
  var watchTimer = null;
  var watchTicks = 0;
  var deploymentId = null;

  // ── helpers ─────────────────────────────────────────────────────────────
  function monogram(name) {
    var s = String(name || '?').replace(/[^A-Za-z0-9]/g, '');
    return (s.slice(0, 2) || '?').toUpperCase();
  }

  function say(text, bad) {
    var s = el('status');
    s.className = bad ? 'note warn' : 'note';
    s.textContent = text || '';
    Bridge.reportSize();
  }

  function setChip(state, text) {
    var chip = el('chip');
    chip.hidden = false;
    chip.dataset.state = state;
    chip.textContent = text;
  }

  function step(kind, tag, text) {
    var row = document.createElement('div');
    row.className = 'step';
    row.dataset.kind = kind;
    var b = document.createElement('b');
    b.textContent = tag;
    row.appendChild(b);
    var span = document.createElement('span');
    span.textContent = text;
    row.appendChild(span);
    el('steps').appendChild(row);
    Bridge.reportSize();
  }

  // ── catalogue ───────────────────────────────────────────────────────────
  function matches(app, q) {
    if (!q) { return true; }
    var hay = [app.name, app.display_name, app.category]
      .concat(Array.isArray(app.tags) ? app.tags : [])
      .join(' ')
      .toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderTiles() {
    var q = el('search').value.trim().toLowerCase();
    var box = el('tiles');
    box.textContent = '';
    var shown = apps.filter(function (a) { return matches(a, q); });
    shown.forEach(function (app) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-pressed', picked && picked.name === app.name ? 'true' : 'false');

      var m = document.createElement('span');
      m.className = 'mono';
      m.textContent = monogram(app.name);
      b.appendChild(m);

      var wrap = document.createElement('span');
      var n = document.createElement('span');
      n.className = 'tile-name';
      n.textContent = String(app.display_name || app.name || '?');
      wrap.appendChild(n);
      var v = document.createElement('span');
      v.className = 'tile-ver';
      v.textContent = String(app.version || '');
      wrap.appendChild(document.createElement('br'));
      wrap.appendChild(v);
      b.appendChild(wrap);

      b.addEventListener('click', function () { select(app); });
      box.appendChild(b);
    });
    el('none').hidden = shown.length > 0;
    Bridge.reportSize();
  }

  // ── configure ───────────────────────────────────────────────────────────
  function select(app) {
    picked = app;
    el('pick').hidden = true;
    el('form').hidden = false;
    el('title').textContent = 'Deploy ' + String(app.display_name || app.name);
    el('sub').textContent = String(app.category || '') + (app.version ? (' · ' + app.version) : '');
    setChip('idle', 'Not started');

    var r = app.requirements || {};
    var bits = [];
    if (r.cpu_cores) { bits.push(r.cpu_cores + ' vCPU'); }
    if (r.ram_mb) { bits.push(r.ram_mb + ' MB RAM'); }
    if (r.disk_gb) { bits.push(r.disk_gb + ' GB disk'); }
    if (Array.isArray(r.ports) && r.ports.length) { bits.push('port ' + r.ports.join(', ')); }
    el('needs').textContent = bits.length ? ('Needs ' + bits.join(' · ')) : '';

    // Only what this app says it supports. Offering a field the deploy then
    // rejects is worse than not offering it.
    var sup = app.supports || {};
    el('domainRow').hidden = sup.custom_domain === false;
    el('onionRow').hidden = !sup.onion;
    if (!sup.onion) { el('onion').checked = false; }

    say('');
    Bridge.reportSize();
  }

  function renderServers() {
    var sel = el('agent');
    sel.textContent = '';
    var online = servers.filter(function (s) { return s.agent_id; });
    if (online.length === 0) {
      var opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No agent-enabled server on this account';
      sel.appendChild(opt);
      sel.disabled = true;
      el('deploy').disabled = true;
      return;
    }
    online.forEach(function (s) {
      var opt = document.createElement('option');
      opt.value = String(s.agent_id);
      var label = String(s.hostname || s.agent_id);
      if (s.status && String(s.status).toLowerCase() !== 'online') {
        label += ' (' + String(s.status) + ')';
      }
      opt.textContent = label;
      sel.appendChild(opt);
    });
    sel.disabled = false;
    el('deploy').disabled = false;
  }

  // ── deploy + watch ──────────────────────────────────────────────────────
  function startDeploy() {
    if (busy || !picked) { return; }
    var agentId = el('agent').value;
    if (!agentId) { say('Pick a server with the Impreza agent installed.', true); return; }

    var args = { app_name: picked.name, agent_id: agentId };
    var domain = el('domain').value.trim();
    if (domain) { args.domain = domain; }
    if (el('onion').checked) { args.onion = true; }

    busy = true;
    el('deploy').disabled = true;
    el('form').hidden = true;
    el('progress').hidden = false;
    el('steps').textContent = '';
    setChip('pending', 'Deploying');
    step('work', 'sent', 'Asked the server to deploy ' + String(picked.display_name || picked.name) + '.');

    Bridge.callTool('impreza_deploy_catalog_app', args)
      .then(function (d) {
        // A host that speaks the Tasks extension hands back a task handle
        // instead of the deployment; either way the deployment's own status is
        // what we watch, so both shapes lead to the same place.
        deploymentId = (d && (d.id || d.deployment_id)) || null;
        if (d && d.taskId && !deploymentId) {
          step('work', 'task', 'The host is tracking this as a task; watching the deployment directly.');
        }
        if (d && d.domain) {
          showUrl(d.domain);
        }
        step('work', 'queued', 'Accepted. Pulling images and starting the app — usually a few minutes.');
        watch();
      })
      .catch(function (e) {
        busy = false;
        setChip('error', 'Failed');
        step('bad', 'error', e.message || 'The deploy was refused.');
        el('again').hidden = false;
      });
  }

  function showUrl(domain) {
    var u = String(domain || '');
    if (!u) { return; }
    if (u.indexOf('http') !== 0) { u = 'https://' + u; }
    el('url').textContent = u;
    el('result').hidden = false;
    el('open').hidden = !Bridge.canOpenLinks();
    Bridge.reportSize();
  }

  var seenStatus = '';
  function watch() {
    clearTimeout(watchTimer);
    watchTicks++;
    // ~5 minutes at 6s. A deploy that has not settled by then has a real
    // problem, and saying so beats polling forever.
    if (watchTicks > 50) {
      setChip('pending', 'Still working');
      step('work', 'slow', 'Still not settled. Check impreza_list_deployments in a moment.');
      busy = false;
      el('again').hidden = false;
      return;
    }

    var agentId = el('agent').value;
    Bridge.callTool('impreza_list_deployments', agentId ? { agent_id: agentId } : {})
      .then(function (d) {
        var rows = (d && d.deployments) || [];
        var row = null;
        if (deploymentId) {
          row = rows.filter(function (r) { return r.id === deploymentId; })[0] || null;
        }
        if (!row) {
          // No id to match on: the newest row for this app is the one we just
          // asked for.
          row = rows
            .filter(function (r) { return r.app_name === picked.name; })
            .sort(function (a, b) { return String(b.created_at || '').localeCompare(String(a.created_at || '')); })[0] || null;
        }
        if (!row) {
          watchTimer = setTimeout(watch, 6000);
          return;
        }
        deploymentId = row.id || deploymentId;
        var st = String(row.status || '').toLowerCase();
        if (st && st !== seenStatus) {
          seenStatus = st;
          if (st !== 'running' && st !== 'failed') { step('work', st, 'Status is now ' + st + '.'); }
        }
        if (row.domain) { showUrl(row.domain); }

        if (st === 'running') {
          setChip('ok', 'Running');
          step('ok', 'done', 'Deployed and healthy.');
          busy = false;
          el('again').hidden = false;
          return;
        }
        if (st === 'failed') {
          setChip('error', 'Failed');
          step('bad', 'failed', String(row.last_error || 'The deploy failed.').slice(0, 240));
          busy = false;
          el('again').hidden = false;
          return;
        }
        watchTimer = setTimeout(watch, 6000);
      })
      .catch(function () { watchTimer = setTimeout(watch, 8000); });
  }

  function reset() {
    clearTimeout(watchTimer);
    watchTicks = 0;
    seenStatus = '';
    deploymentId = null;
    busy = false;
    picked = null;
    el('progress').hidden = true;
    el('result').hidden = true;
    el('open').hidden = true;
    el('again').hidden = true;
    el('form').hidden = true;
    el('pick').hidden = false;
    el('deploy').disabled = false;
    el('chip').hidden = true;
    el('title').textContent = 'Deploy an app';
    el('sub').textContent = apps.length + ' apps in the catalogue';
    renderTiles();
  }

  // ── wiring ──────────────────────────────────────────────────────────────
  el('search').addEventListener('input', renderTiles);
  el('deploy').addEventListener('click', startDeploy);
  el('back').addEventListener('click', reset);
  el('again').addEventListener('click', reset);
  el('copyUrl').addEventListener('click', function () { Bridge.copy(el('url').textContent, this); });
  el('open').addEventListener('click', function () {
    Bridge.openLink(el('url').textContent)
      .catch(function () { say('The host declined to open the link.', true); });
  });

  Bridge.start({
    name: 'impreza-deploy-wizard',
    onResult: function (d) {
      apps = (d && d.apps) || [];
      el('pick').hidden = false;
      el('sub').textContent = apps.length + ' apps in the catalogue';
      renderTiles();
      // One enrichment call: the deploy needs a target, and only the server
      // list maps this account's agents.
      Bridge.callTool('impreza_list_servers', {})
        .then(function (r) { servers = (r && r.servers) || []; renderServers(); })
        .catch(function () {
          servers = [];
          renderServers();
          say('Could not list your servers — reload the panel to try again.', true);
        });
    },
    onFail: function (text) {
      el('sub').textContent = '';
      setChip('error', 'Unavailable');
      say(String(text || 'Could not load the catalogue.'), true);
    }
  });
})();
</script>
</body>
</html>
`;

/** md5 of the canonical lib/ui/deploy-wizard.html, LF-normalised. */
export const DEPLOY_WIZARD_HTML_MD5 = '59ce1c546d8aa4b99aead60b0e5795b3';
