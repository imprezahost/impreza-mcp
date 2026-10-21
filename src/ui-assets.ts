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
  #paymentQR canvas { display:block; width:min(100%,256px); height:auto; background:#fff; }
  #paymentQR { margin:12px 0; max-width:256px; }
  .value { overflow-wrap:anywhere; }
  .actions { flex-wrap:wrap; }
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

  <div id="paymentQR" hidden role="img" aria-label="Payment QR code: verify the exact address and amount in your wallet"></div>
  <p class="note" id="paymentExpiry" role="status" aria-live="polite"></p>
  <p class="note" id="qrAvailability">QR is unavailable for these payment details. Copy the address and exact amount.</p>

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
  var ready = false;
  function reportSize() {
    // Nothing is said about size until the handshake is done. The observer can
    // fire before ui/initialize resolves; that early notification used to latch
    // lastH, so the reportSize() after initialized became a no-op and a host
    // that drops pre-handshake messages never heard a size at all. No argument
    // is read here: ResizeObserver passes its entries. An initial 0 stays
    // silent: announcing it would collapse a host that is waiting for content.
    if (!ready) { return; }
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
      ready = true;
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
  var generation = 0, current = null, timer = null, serverTime = null;
  var deadlines = new Map();
  // Build-time replacement only after a licensed, independently decoded encoder
  // is admitted. No global/provider-supplied function, SVG or remote QR service.
  var paymentEncoder = null;
  // F58.8: the card's own encoder (below) replaces only the null default; a
  // harness that injects a spy above keeps its spy.
  if (paymentEncoder === null) {
    paymentEncoder =
    // QR-ENCODER-BEGIN
    (function () {
      // QR Code Model 2 (ISO/IEC 18004), original self-contained implementation for this card:
      // 8-bit byte mode, error correction level M, versions 1-10, the eight data masks chosen by
      // the standard penalty rules. No dependency, network, DOM or global. Returns a boolean
      // matrix (true = dark) without the quiet zone (drawQr adds four modules). Anything outside
      // printable ASCII or above the version 10-M byte capacity (213) throws: the card then shows
      // no code at all, never a decorative or truncated one.
      // Per version: [EC codewords per block, blocks in group 1, data codewords each, group 2 blocks, data each].
      var BLOCKS = [null, [10,1,16,0,0], [16,1,28,0,0], [26,1,44,0,0], [18,2,32,0,0], [24,2,43,0,0],
        [16,4,27,0,0], [18,4,31,0,0], [22,2,38,2,39], [22,3,36,2,37], [26,4,43,1,44]];
      var ALIGN = [null, [], [6,18], [6,22], [6,26], [6,30], [6,34], [6,22,38], [6,24,42], [6,26,46], [6,28,50]];
      var EXP = [], LOG = [];
      for (var i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) { x ^= 0x11d; } }
      for (i = 255; i < 512; i++) { EXP[i] = EXP[i - 255]; }
      function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
      function rs(data, n) {
        var g = [1];
        for (var k = 0; k < n; k++) {
          var next = []; for (var j = 0; j <= g.length; j++) { next[j] = 0; }
          for (j = 0; j < g.length; j++) { next[j] ^= g[j]; next[j + 1] ^= mul(g[j], EXP[k]); }
          g = next;
        }
        var r = []; for (k = 0; k < n; k++) { r[k] = 0; }
        data.forEach(function (d) {
          var f = d ^ r.shift(); r.push(0);
          for (var j = 0; j < n; j++) { r[j] ^= mul(g[j + 1], f); }
        });
        return r;
      }
      function bch(value, bits, poly, polyBits) {
        var v = value << (polyBits - 1);
        for (var b = bits + polyBits - 2; b >= polyBits - 1; b--) { if ((v >>> b) & 1) { v ^= poly << (b - polyBits + 1); } }
        return (value << (polyBits - 1)) | v;
      }
      function formatBits(mask) { return bch(mask, 5, 0x537, 11) ^ 0x5412; }   // level M = 00
      function versionBits(version) { return bch(version, 6, 0x1f25, 13); }
      function codewords(bytes, version) {
        var spec = BLOCKS[version], total = spec[1] * spec[2] + spec[3] * spec[4];
        var bits = [], push = function (value, n) { for (var b = n - 1; b >= 0; b--) { bits.push((value >>> b) & 1); } };
        push(4, 4); push(bytes.length, version < 10 ? 8 : 16);
        bytes.forEach(function (b) { push(b, 8); });
        if (bits.length > total * 8) { throw new Error('capacity'); }
        push(0, Math.min(4, total * 8 - bits.length));
        while (bits.length % 8) { bits.push(0); }
        var data = [];
        for (var k = 0; k < bits.length; k += 8) { data.push(parseInt(bits.slice(k, k + 8).join(''), 2)); }
        for (var pad = 0xec; data.length < total; pad ^= 0xec ^ 0x11) { data.push(pad); }
        var blocks = [], at = 0;
        for (var group = 0; group < 2; group++) {
          for (var c = 0; c < spec[1 + group * 2]; c++) {
            var part = data.slice(at, at + spec[2 + group * 2]); at += part.length;
            blocks.push({ data: part, ec: rs(part, spec[0]) });
          }
        }
        var out = [], longest = Math.max(spec[2], spec[4]);
        for (k = 0; k < longest; k++) { blocks.forEach(function (bl) { if (k < bl.data.length) { out.push(bl.data[k]); } }); }
        for (k = 0; k < spec[0]; k++) { blocks.forEach(function (bl) { out.push(bl.ec[k]); }); }
        return out;
      }
      function encode(text) {
        if (typeof text !== 'string' || !/^[\\x21-\\x7e]{1,213}$/.test(text)) { throw new Error('input'); }
        var bytes = [];
        for (var k = 0; k < text.length; k++) { bytes.push(text.charCodeAt(k)); }
        var version = 1;
        while (version <= 10) {
          var spec = BLOCKS[version], cap = (spec[1] * spec[2] + spec[3] * spec[4]) * 8;
          if (4 + (version < 10 ? 8 : 16) + 8 * bytes.length <= cap) { break; }
          version++;
        }
        if (version > 10) { throw new Error('capacity'); }
        var size = 17 + 4 * version, m = [], fixed = [];
        for (var y = 0; y < size; y++) { m.push([]); fixed.push([]); for (var x0 = 0; x0 < size; x0++) { m[y].push(false); fixed[y].push(false); } }
        function set(r, c, dark) { m[r][c] = dark; fixed[r][c] = true; }
        [[0, 0], [0, size - 7], [size - 7, 0]].forEach(function (o) {
          for (var dy = -1; dy <= 7; dy++) {
            for (var dx = -1; dx <= 7; dx++) {
              var r = o[0] + dy, c = o[1] + dx;
              if (r < 0 || c < 0 || r >= size || c >= size) { continue; }
              var ring = dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6 && (dy === 0 || dy === 6 || dx === 0 || dx === 6);
              set(r, c, ring || (dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4));
            }
          }
        });
        for (var t = 8; t < size - 8; t++) { set(6, t, t % 2 === 0); set(t, 6, t % 2 === 0); }
        var centers = ALIGN[version], last = centers.length - 1;
        centers.forEach(function (r, a) {
          centers.forEach(function (c, b) {
            if ((a === 0 && b === 0) || (a === 0 && b === last) || (a === last && b === 0)) { return; }
            for (var dy = -2; dy <= 2; dy++) {
              for (var dx = -2; dx <= 2; dx++) { set(r + dy, c + dx, Math.max(Math.abs(dy), Math.abs(dx)) !== 1); }
            }
          });
        });
        for (t = 0; t < 9; t++) { if (!fixed[8][t]) { set(8, t, false); } if (!fixed[t][8]) { set(t, 8, false); } }
        for (t = 0; t < 8; t++) { set(8, size - 1 - t, false); set(size - 1 - t, 8, false); }
        set(size - 8, 8, true);
        if (version >= 7) {
          for (t = 0; t < 18; t++) { set(Math.floor(t / 3), size - 11 + t % 3, false); set(size - 11 + t % 3, Math.floor(t / 3), false); }
        }
        var stream = [];
        codewords(bytes, version).forEach(function (cw) { for (var b = 7; b >= 0; b--) { stream.push((cw >>> b) & 1); } });
        var index = 0;
        for (var right = size - 1; right >= 1; right -= 2) {
          if (right === 6) { right = 5; }
          for (var vert = 0; vert < size; vert++) {
            for (var j = 0; j < 2; j++) {
              var col = right - j, row = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
              if (!fixed[row][col]) { m[row][col] = index < stream.length ? stream[index] === 1 : false; index++; }
            }
          }
        }
        var MASKS = [
          function (r, c) { return (r + c) % 2 === 0; }, function (r) { return r % 2 === 0; },
          function (r, c) { return c % 3 === 0; }, function (r, c) { return (r + c) % 3 === 0; },
          function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
          function (r, c) { return (r * c) % 2 + (r * c) % 3 === 0; },
          function (r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; },
          function (r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }];
        function finish(mask) {
          var q = m.map(function (row, r) { return row.map(function (dark, c) { return fixed[r][c] ? dark : dark !== MASKS[mask](r, c); }); });
          var f = formatBits(mask);
          for (var k = 0; k < 15; k++) {
            var on = ((f >>> k) & 1) === 1;
            // First copy around the top-left finder (bits 0-7 down column 8, skipping the timing row; 8-14 along row 8).
            if (k < 6) { q[k][8] = on; } else if (k < 8) { q[k + 1][8] = on; } else if (k === 8) { q[8][7] = on; } else { q[8][14 - k] = on; }
            // Second copy: bits 0-7 along row 8 from the right edge, bits 8-14 up column 8 from the bottom.
            if (k < 8) { q[8][size - 1 - k] = on; } else { q[size - 15 + k][8] = on; }
          }
          q[size - 8][8] = true;
          if (version >= 7) {
            var v = versionBits(version);
            for (k = 0; k < 18; k++) {
              var bit = ((v >>> k) & 1) === 1;
              q[Math.floor(k / 3)][size - 11 + k % 3] = bit; q[size - 11 + k % 3][Math.floor(k / 3)] = bit;
            }
          }
          return q;
        }
        function penalty(q) {
          var score = 0, dark = 0, n = q.length;
          function line(get) {
            var s = 0;
            for (var a = 0; a < n; a++) {
              var run = 1, seq = [];
              for (var b = 0; b < n; b++) {
                seq.push(get(a, b) ? 1 : 0);
                if (b > 0) { if (get(a, b) === get(a, b - 1)) { run++; } else { if (run >= 5) { s += run - 2; } run = 1; } }
              }
              if (run >= 5) { s += run - 2; }
              var str = seq.join('');
              ['10111010000', '00001011101'].forEach(function (p) { for (var at = str.indexOf(p); at >= 0; at = str.indexOf(p, at + 1)) { s += 40; } });
            }
            return s;
          }
          score += line(function (a, b) { return q[a][b]; }) + line(function (a, b) { return q[b][a]; });
          for (var r = 0; r < n; r++) {
            for (var c = 0; c < n; c++) {
              if (q[r][c]) { dark++; }
              if (r < n - 1 && c < n - 1 && q[r][c] === q[r][c + 1] && q[r][c] === q[r + 1][c] && q[r][c] === q[r + 1][c + 1]) { score += 3; }
            }
          }
          return score + Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
        }
        var best = null, bestScore = Infinity;
        for (var mask = 0; mask < 8; mask++) {
          var candidate = finish(mask), s = penalty(candidate);
          if (s < bestScore) { best = candidate; bestScore = s; }
        }
        return best;
      }
      encode.parts = Object.freeze({ rs: rs, formatBits: formatBits, versionBits: versionBits, codewords: codewords });
      return Object.freeze(encode);
    })();
    // QR-ENCODER-END
  }
  function monotonic() { return typeof performance !== 'undefined' ? performance.now() : NaN; }
  function absolute(value) {
    if (typeof value !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$/.test(value)) { return NaN; }
    var ms = Date.parse(value);
    return isFinite(ms) && new Date(ms).toISOString().slice(0,19) === value.slice(0,19) ? ms : NaN;
  }
  function clearPayment() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    current = null;
    el('paymentQR').textContent = ''; el('paymentQR').hidden = true;
    el('paymentExpiry').textContent = '';
    el('wallet').hidden = true;
    el('copyAddr').disabled = true; el('copyAmount').disabled = true;
  }
  function paymentInfo(o) {
    if (!o || typeof o.crypto !== 'string' || !/^[A-Z0-9]{2,12}$/.test(o.crypto) ||
        typeof o.address !== 'string' || !/^[A-Za-z0-9]{6,128}$/.test(o.address) ||
        typeof o.crypto_amount !== 'string' || o.crypto_amount.length > 128) { return null; }
    var digits = o.crypto === 'BTC' ? 8 : o.crypto === 'XMR' ? 12 : 30;
    if (!new RegExp('^(0|[1-9][0-9]*)(\\\\.[0-9]{1,' + digits + '})?$').test(o.crypto_amount) || !/[1-9]/.test(o.crypto_amount)) { return null; }
    var uri = null;
    if (o.crypto === 'BTC' || o.crypto === 'XMR') {
      if (o.network != null && (typeof o.network !== 'string' || !(o.crypto === 'BTC' ? /^(Bitcoin|BTC|mainnet)$/i : /^(Monero|XMR|mainnet)$/i).test(o.network))) { return null; }
      var expected = (o.crypto === 'BTC' ? 'bitcoin:' : 'monero:') + o.address +
        (o.crypto === 'BTC' ? '?amount=' : '?tx_amount=') + o.crypto_amount;
      if (o.address.length < 14 || o.payment_uri !== expected) { return null; }
      uri = expected;
    }
    var expiry = absolute(o.expires_at), now = monotonic(), deadline = null;
    if (o.expiry_state === 'absolute' && isFinite(serverTime) && isFinite(expiry) && isFinite(now)) {
      deadline = now + expiry - serverTime;
      var key = JSON.stringify([invoiceId,o.crypto,o.network,o.address,o.crypto_amount,o.expires_at]);
      // Replayed identical proposals cannot restart their old payment window.
      if (deadlines.has(key)) { deadline = Math.min(deadline, deadlines.get(key)); }
      if (!deadlines.has(key) && deadlines.size >= 64) { deadline = null; }
      else { deadlines.set(key, deadline); }
    }
    return { option:o, uri:uri, deadline:deadline };
  }
  function activePayment() {
    if (current && current.deadline !== null && current.deadline <= monotonic()) { expirePayment(); }
    return current;
  }
  function expirePayment() {
    clearPayment(); el('pay').hidden = true; el('verify').hidden = true;
    el('paymentExpiry').textContent = 'Payment window expired. Check status or request fresh details before sending.';
    Bridge.reportSize();
  }
  function drawQr(info) {
    if (!paymentEncoder || !info.uri || info.deadline === null) { return; }
    try {
      var matrix = paymentEncoder(info.uri), n = matrix.length;
      if (!Array.isArray(matrix) || n < 21 || n > 177 || n % 4 !== 1 || !Array.from(matrix).every(function(row) {
        return Array.isArray(row) && row.length === n && Array.from(row).every(function(cell) { return typeof cell === 'boolean'; });
      })) { return; }
      var canvas = document.createElement('canvas'), scale = 4;
      canvas.width = (n+8)*scale; canvas.height = (n+8)*scale;
      canvas.setAttribute('aria-hidden','true');
      var pen = canvas.getContext('2d'); if (!pen) { return; }
      pen.fillStyle = '#fff'; pen.fillRect(0,0,canvas.width,canvas.height);
      pen.fillStyle = '#000';
      matrix.forEach(function(row,y){row.forEach(function(on,x){if(on){pen.fillRect((x+4)*scale,(y+4)*scale,scale,scale);}});});
      el('paymentQR').appendChild(canvas); el('paymentQR').hidden = false;
      el('qrAvailability').hidden = true;
    } catch (e) { /* A missing encoder never substitutes a pretend QR or upstream error. */ }
  }
  function bindPayment(o) {
    clearPayment(); el('qrAvailability').hidden = false;
    current = paymentInfo(o);
    if (!current) {
      el('pay').hidden = true; el('verify').hidden = true;
      el('paymentExpiry').textContent = 'Payment details cannot be verified. Request fresh details before sending.';
      return;
    }
    el('copyAddr').disabled = false; el('copyAmount').disabled = false;
    if (current.deadline === null) {
      el('paymentExpiry').textContent = 'Payment expiry is unknown. No countdown is available; request fresh details before sending.';
      return;
    }
    function tick() {
      var info = activePayment(); if (!info) { return; }
      var seconds = Math.ceil((info.deadline-monotonic())/1000);
      el('paymentExpiry').textContent = 'Payment window: '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' remaining.';
    }
    tick(); if (!current) { return; }
    drawQr(current); timer = setInterval(tick,1000);
    el('wallet').hidden = !(current.uri && Bridge.canOpenLinks());
  }

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
      b.addEventListener('click', function () { generation++; busy = false; el('check').disabled = false; picked = i; renderOption(); renderRails(); });
      box.appendChild(b);
    });
  }

  function renderOption() {
    clearPayment();
    var o = options[picked];
    if (!o) { el('pay').hidden = true; el('verify').hidden = true; return; }
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

    if (o.note) { bits.push(String(o.note)); }
    rate.textContent = bits.join(' · ');
    rate.hidden = bits.length === 0;

    // A wallet hand-off is only offered when the host says it can open links.
    bindPayment(o);
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
    generation++; busy = false; el('check').disabled = false; clearPayment();
    if (!data || typeof data !== 'object' || !Number.isSafeInteger(data.invoice_id) || data.invoice_id <= 0) { fail(); return; }
    // Only an explicit pending proposal may offer payment actions. Cancelled,
    // refunded, absent and unknown states never inherit an old payable card.
    if (data.status !== 'pending' && data.status !== 'paid') { fail(); return; }
    invoiceId = data.invoice_id; serverTime = absolute(data.server_time);
    el('status').textContent = ''; el('status').className = 'note'; el('qrAvailability').hidden = false;

    el('total').textContent = money(data.fiat_amount, data.currency);
    el('sub').textContent = invoiceId != null ? ('Top-up invoice #' + String(invoiceId)) : '';

    var paid = String(data.status || '').toLowerCase() === 'paid';
    setChip(paid ? 'paid' : 'pending', paid ? 'Paid' : 'Awaiting payment');

    options = Array.isArray(data.payment_options) ? data.payment_options : [];
    if (picked >= options.length) { picked = 0; }

    if (paid) {
      el('qrAvailability').hidden = true;
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
    generation++; busy = false; invoiceId = null; options = []; clearPayment();
    el('pay').hidden = true; el('rails').hidden = true; el('check').hidden = true; el('verify').hidden = true; el('rest').hidden = true;
    el('addr').textContent = ''; el('amount').textContent = '';
    setChip('error', 'Unavailable');
    el('sub').textContent = '';
    var s = el('status');
    s.className = 'note warn';
    s.textContent = 'Payment details unavailable. Request fresh details.';
    Bridge.reportSize();
  }

  el('copyAmount').addEventListener('click', function () {
    var o = options[picked];
    if (o && activePayment()) { Bridge.copy(o.crypto_amount, this); }
  });
  el('copyAddr').addEventListener('click', function () {
    var o = options[picked];
    if (o && activePayment()) { Bridge.copy(o.address, this); }
  });

  el('wallet').addEventListener('click', function () {
    var o = options[picked];
    var info = activePayment();
    if (!o || !info || !info.uri || info.deadline === null) { return; }
    var expected = generation;
    Bridge.openLink(info.uri).catch(function () {
      if (expected !== generation) { return; }
      el('status').textContent = 'The host declined to open the wallet link — copy the address instead.';
    });
  });

  // The one server call this panel makes, and the mildest one available: a
  // read-scope status poll on the caller's own invoice.
  el('check').addEventListener('click', function () {
    if (busy || invoiceId == null) { return; }
    busy = true;
    var expected = generation, checkedInvoice = invoiceId;
    var btn = this;
    btn.disabled = true;
    el('status').className = 'note';
    el('status').textContent = 'Checking…';
    Bridge.callTool('impreza_topup_status', { invoice_id: invoiceId })
      .then(function (data) {
        if (expected !== generation || checkedInvoice !== invoiceId) { return; }
        if (data && String(data.status || '').toLowerCase() === 'paid') {
          render({
            invoice_id: invoiceId,
            fiat_amount: data.amount != null ? data.amount : data.fiat_amount,
            currency: data.currency,
            status: 'paid',
            balance: data.balance
          });
        } else if (data && data.status === 'pending') {
          el('status').textContent = 'Not confirmed yet. On-chain confirmation usually takes a few minutes.';
        } else {
          // A cancelled/refunded/unknown result cannot leave payment actions
          // from the previous pending snapshot available.
          fail();
        }
      })
      .catch(function (e) {
        if (expected !== generation) { return; }
        el('status').className = 'note warn';
        el('status').textContent = 'The check failed. Try again in a moment.';
      })
      .then(function () {
        if (expected !== generation) { return; }
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
export const TOPUP_CARD_HTML_MD5 = '04d7a6ddd8d034feec752d5782ae539d';

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

  Decisions worth knowing:

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

  F58.10 — observation, not new control:

  · A number the server did not send is shown as "not reported", never as 0.
    \`cpu_usage\` is the hypervisor's 0–1 fraction of all vCPUs
    (ProxmoxVPSController::status); anything outside 0–1 is shown as reported
    with "unit unclear", without a bar, rather than guessed into a percentage.
    Disk and network are cumulative counters since the VM started, labelled as
    such: the status call carries no disk usage, only the size from identity.

  · The status payload has no timestamp, so freshness is the time THIS view
    received it. Past two minutes the readings are marked out of date; a failed
    refresh keeps the last reading, marked as such, instead of clearing it.

  · A different service_id resets everything: no reading, identity or app list
    of the previous server survives the switch, and an answer still in flight
    for it is dropped when it lands.

  · Logs and progress have no read contract at the VPS level (the log tools are
    per deployment, and impreza_vps_power returns no operation to follow), so
    the card says so instead of showing anything that looks like them.

  · Receiving a payload never calls a tool that changes anything: only the
    identity read on a new service_id, and the app list when asked.
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
    overflow-wrap: anywhere;
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
    text-align: right;
    overflow-wrap: anywhere;
  }
  .meter-val[data-quality="bad"] { color: var(--color-text-warning); }
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

  /* ── counters since boot ──────────────────────────────────────────────── */
  .counters {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 2px 12px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
  .counters dt { color: var(--color-text-tertiary); }
  .counters dd {
    margin: 0;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  /* An old reading stays readable, but no longer looks live. */
  .card[data-stale="1"] .meters,
  .card[data-stale="1"] .counters { opacity: 0.55; }
  .fresh[data-stale="1"] { color: var(--color-text-warning); }

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
  .app-name { font-family: var(--font-mono); font-weight: 600; overflow-wrap: anywhere; }
  .app-host { color: var(--color-text-secondary); overflow-wrap: anywhere; }
  .app-state { flex: none; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .app-state[data-state="ok"]   { color: var(--color-text-success); }
  .app-state[data-state="work"] { color: var(--color-text-warning); }
  .app-state[data-state="bad"]  { color: var(--color-text-danger); }
  .app-state[data-state="gone"] { color: var(--color-text-tertiary); }

  .section-head { margin-bottom: 4px; }

  /* Narrow chat columns and phones: one column, buttons share the row. */
  @media (max-width: 420px) {
    .facts { flex-direction: column; }
    .actions .btn { flex: 1 1 auto; }
    .app { flex-direction: column; align-items: flex-start; }
  }
</style>
</head>
<body>
<div class="card" id="card" data-stale="0">
  <div class="head">
    <div>
      <div class="title" id="host">—</div>
      <div class="sub" id="sub">Loading server details…</div>
    </div>
    <div class="chip" id="chip" data-state="idle">Loading</div>
  </div>

  <div class="facts" id="facts" hidden></div>

  <div class="meters" id="meters" hidden>
    <div>
      <div class="meter-head">
        <span class="label" id="cpuLabel">CPU</span>
        <span class="meter-val" id="cpuVal"></span>
      </div>
      <div class="track" id="cpuTrack" role="meter" aria-labelledby="cpuLabel" aria-valuemin="0" aria-valuemax="100"><div class="fill" id="cpuFill"></div></div>
    </div>
    <div>
      <div class="meter-head">
        <span class="label" id="memLabel">Memory</span>
        <span class="meter-val" id="memVal"></span>
      </div>
      <div class="track" id="memTrack" role="meter" aria-labelledby="memLabel" aria-valuemin="0" aria-valuemax="100"><div class="fill" id="memFill"></div></div>
    </div>
  </div>

  <dl class="counters" id="counters" hidden>
    <dt>Uptime</dt><dd id="upVal"></dd>
    <dt>Disk I/O since start</dt><dd id="diskVal"></dd>
    <dt>Network since start</dt><dd id="netVal"></dd>
  </dl>

  <div class="note fresh" id="fresh" data-stale="0"></div>

  <div class="actions">
    <button class="btn" id="refresh" type="button">Refresh</button>
    <button class="btn" id="start" type="button" hidden>Start</button>
    <button class="btn" id="reboot" type="button" hidden>Reboot</button>
    <button class="btn" id="shutdown" type="button" hidden>Shut down</button>
    <span class="note" id="status" role="status" aria-live="polite"></span>
  </div>

  <div>
    <div class="label section-head">Activity</div>
    <div class="note" id="activity">Logs and progress for this server are not available in this card yet. Power actions report only that they were accepted; refresh to see the new state.</div>
  </div>

  <div>
    <button class="btn quiet" id="appsToggle" type="button" aria-expanded="false" aria-controls="apps">Show deployed apps</button>
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
  var ready = false;
  function reportSize() {
    // Nothing is said about size until the handshake is done. The observer can
    // fire before ui/initialize resolves; that early notification used to latch
    // lastH, so the reportSize() after initialized became a no-op and a host
    // that drops pre-handshake messages never heard a size at all. No argument
    // is read here: ResizeObserver passes its entries. An initial 0 stays
    // silent: announcing it would collapse a host that is waiting for content.
    if (!ready) { return; }
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
      ready = true;
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

  // Past this, the reading is labelled out of date. Measured from when this
  // view received it: the payload carries no time of its own.
  var STALE_MS = 120000;
  var MAX_IPS = 8;
  var MAX_APPS = 50;

  var serviceId = null;
  var generation = 0;      // bumped on every service switch; late answers for an older one are dropped
  var powerState = '';
  var busy = false;
  var appsLoaded = false;
  var receivedAt = 0;      // ms; 0 = no reading for this service yet
  var refreshFailed = false; // the last refresh failed: the reading shown is the old one
  var appTimers = [];

  // ── input hygiene ───────────────────────────────────────────────────────
  // Everything below comes from a tool result: treat it as hostile text.
  function clip(value, max) {
    var s = String(value);
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  // A finite number, or null. null/''/booleans/objects are "not reported", never 0.
  function num(value) {
    if (typeof value === 'number') { return isFinite(value) ? value : null; }
    if (typeof value === 'string' && /^\\s*-?\\d+(\\.\\d+)?\\s*$/.test(value)) { return Number(value); }
    return null;
  }

  function serviceIdOf(args) {
    if (!args || typeof args !== 'object') { return null; }
    // MCP Apps sends the tool arguments under \`arguments\`; the Impreza Panel
    // shell hands them over directly. Accept both, nothing else.
    var src = (args.arguments && typeof args.arguments === 'object') ? args.arguments : args;
    var raw = src.service_id;
    if (typeof raw === 'number' && raw > 0 && raw % 1 === 0 && raw <= 4294967295) { return raw; }
    if (typeof raw === 'string' && /^[1-9]\\d{0,9}$/.test(raw) && Number(raw) <= 4294967295) { return Number(raw); }
    return null;
  }

  // ── formatting ──────────────────────────────────────────────────────────
  function gib(bytes) {
    var n = num(bytes);
    if (n === null || n <= 0) { return null; }
    return n / 1073741824;
  }

  function size(bytes) {
    var n = num(bytes);
    if (n === null || n < 0) { return null; }
    var units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    var i = 0;
    while (n >= 1024 && i < units.length - 1) { n = n / 1024; i++; }
    return (i === 0 ? String(Math.round(n)) : n.toFixed(n >= 100 ? 0 : 1)) + ' ' + units[i];
  }

  function uptime(seconds) {
    var s = num(seconds);
    if (s === null || s <= 0) { return null; }
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    if (d > 0) { return d + 'd ' + h + 'h'; }
    if (h > 0) { return h + 'h ' + m + 'm'; }
    return m + 'm';
  }

  function clock(ms) {
    return new Date(ms).toISOString().slice(11, 16) + ' UTC';
  }

  function load(pct) {
    if (pct >= 90) { return 'full'; }
    if (pct >= 70) { return 'high'; }
    return 'normal';
  }

  // \`pct\` null draws no bar at all: an empty track would read as 0%.
  // \`neutral\` keeps the bar in the default colour whatever the number says.
  // Used for the memory reading, which comes from the hypervisor and counts
  // page cache as used: 80% is what a healthy machine looks like there, so the
  // 70%/90% thresholds do not describe anything real and an amber bar would be
  // an alarm with nothing behind it.
  function setMeter(prefix, pct, text, neutral, bad) {
    var fill = el(prefix + 'Fill');
    var track = el(prefix + 'Track');
    var val = el(prefix + 'Val');
    val.textContent = text;
    val.dataset.quality = bad ? 'bad' : 'ok';
    track.setAttribute('aria-valuetext', text);
    if (pct === null) {
      fill.style.width = '0%';
      fill.dataset.load = 'none';
      track.removeAttribute('aria-valuenow');
      return;
    }
    var p = Math.max(0, Math.min(100, pct));
    fill.style.width = p.toFixed(1) + '%';
    fill.dataset.load = neutral ? 'normal' : load(p);
    track.setAttribute('aria-valuenow', p.toFixed(1));
  }

  function cpuReading(raw) {
    var n = num(raw);
    if (n === null) { return { pct: null, text: 'not reported' }; }
    if (n < 0 || n > 1) {
      return { pct: null, text: clip(n, 24) + ' as reported (unit unclear, expected 0–1)', bad: true };
    }
    var pct = n * 100;
    return { pct: pct, text: pct.toFixed(1) + '% of all vCPUs' };
  }

  function memReading(d) {
    var used = gib(d.memory_used);
    var total = gib(d.memory_total);
    // The hosted server sends a \`memory\` block that says what its own number
    // means. Prefer it; fall back to dividing the raw bytes for a payload that
    // predates it (the local npm server, an older API).
    var info = (d.memory && typeof d.memory === 'object') ? d.memory : null;
    var cached = !!(info && info.includes_cache_and_buffers === true);
    var pct = info ? num(info.percent) : null;
    if (pct !== null && (pct < 0 || pct > 100)) { pct = null; }
    if (pct === null && used !== null && total !== null) { pct = (used / total) * 100; }
    if (used === null || total === null) {
      return pct === null ? { pct: null, text: 'not reported' }
        : { pct: pct, text: pct.toFixed(0) + '%' + (cached ? ' incl. cache' : ''), cached: cached };
    }
    if (used > total * 1.001) {
      return { pct: null, text: used.toFixed(2) + ' GiB used of ' + total.toFixed(2) + ' GiB (inconsistent)', bad: true };
    }
    // "incl. cache" is four words that stop the reader concluding the machine
    // is about to run out. Without it this card showed 80% on a box the
    // in-guest agent reports at 20%, and a model reading the same number told
    // a customer to go check swap.
    return {
      pct: pct,
      text: used.toFixed(2) + ' of ' + total.toFixed(2) + ' GiB · ' + pct.toFixed(0) + '%' + (cached ? ' incl. cache' : ''),
      cached: cached
    };
  }

  function pairOf(block, a, b, aLabel, bLabel) {
    if (!block || typeof block !== 'object') { return 'not reported'; }
    var x = size(block[a]);
    var y = size(block[b]);
    if (x === null && y === null) { return 'not reported'; }
    return (x === null ? 'not reported' : x) + ' ' + aLabel + ' · ' + (y === null ? 'not reported' : y) + ' ' + bLabel;
  }

  // ── freshness ───────────────────────────────────────────────────────────
  function updateFreshness() {
    var f = el('fresh');
    if (!receivedAt) {
      f.textContent = '';
      f.dataset.stale = '0';
      el('card').dataset.stale = '0';
      return;
    }
    var age = Math.max(0, Date.now() - receivedAt);
    var stale = age > STALE_MS || refreshFailed;
    var mins = Math.floor(age / 60000);
    var ago = mins < 1 ? 'just now' : (mins === 1 ? '1 min ago' : mins + ' min ago');
    f.textContent = stale
      ? 'Last reading ' + ago + ' (' + clock(receivedAt) + ') — may be out of date. Refresh to check.'
      : 'Updated ' + ago + ' (' + clock(receivedAt) + ').';
    f.dataset.stale = stale ? '1' : '0';
    el('card').dataset.stale = stale ? '1' : '0';
  }

  // ── rendering ───────────────────────────────────────────────────────────
  function setPower(state) {
    var s = (typeof state === 'string') ? clip(state.toLowerCase(), 32) : '';
    powerState = s === 'unknown' ? '' : s;
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
    if (!d || typeof d !== 'object' || Array.isArray(d)) {
      fail('The server returned nothing this card can show.');
      return;
    }
    setPower(d.power_state);

    var cpu = cpuReading(d.cpu_usage);
    var mem = memReading(d);
    el('meters').hidden = false;
    setMeter('cpu', cpu.pct, cpu.text, false, cpu.bad);
    setMeter('mem', mem.pct, mem.text, mem.cached, mem.bad);

    var up = uptime(d.uptime);
    el('upVal').textContent = up || 'not reported';
    el('diskVal').textContent = pairOf(d.disk_io, 'read_bytes', 'write_bytes', 'read', 'written');
    el('netVal').textContent = pairOf(d.network, 'in_bytes', 'out_bytes', 'in', 'out');
    el('counters').hidden = false;

    el('sub').textContent = serviceId !== null ? ('Service #' + serviceId) : '';
    receivedAt = Date.now();
    refreshFailed = false;
    updateFreshness();
    Bridge.reportSize();
  }

  function renderIdentity(info) {
    if (!info || typeof info !== 'object' || Array.isArray(info)) { return; }
    if (typeof info.hostname === 'string' && info.hostname !== '') { el('host').textContent = clip(info.hostname, 253); }

    var res = (info.resources && typeof info.resources === 'object') ? info.resources : {};
    var bits = [];
    var push = function (label, value) {
      if (value === null || value === undefined || value === '') { return; }
      bits.push([label, String(value)]);
    };
    push('Node', typeof info.node === 'string' ? clip(info.node, 64) : null);
    var cores = num(res.cores);
    push('vCPU', cores !== null && cores > 0 ? cores : null);
    var memMb = num(res.memory_mb);
    push('RAM', memMb !== null && memMb > 0 ? (Math.round(memMb / 1024 * 10) / 10) + ' GiB' : null);
    var diskGb = num(res.disk_gb);
    push('Disk', diskGb !== null && diskGb > 0 ? diskGb + ' GB (size)' : null);
    var ips = Array.isArray(info.ips)
      ? info.ips.map(function (i) { return (i && typeof i.ip === 'string') ? clip(i.ip, 45) : ''; }).filter(Boolean)
      : [];
    if (ips.length > MAX_IPS) { ips = ips.slice(0, MAX_IPS).concat(['+' + (ips.length - MAX_IPS) + ' more']); }
    push('IP', ips.join(', '));
    if (typeof info.os === 'string') { push('OS', clip(info.os, 120)); }

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
    if (s === 'running' || s === 'healthy') { return ['ok', s]; }
    if (s === 'failed' || s === 'degraded') { return ['bad', s]; }
    if (s === 'uninstalled') { return ['gone', s]; }
    return ['work', clip(s || 'unknown', 32)];
  }

  function clearAppTimers() {
    appTimers.forEach(function (t) { clearTimeout(t); });
    appTimers = [];
  }

  function renderApps(list) {
    var box = el('apps');
    box.textContent = '';
    clearAppTimers();
    var rows = Array.isArray(list) ? list.filter(function (d) { return d && typeof d === 'object'; }) : [];
    if (rows.length === 0) {
      var none = document.createElement('div');
      none.className = 'note';
      none.textContent = 'No apps deployed on this server yet.';
      box.appendChild(none);
      Bridge.reportSize();
      return;
    }
    rows.slice(0, MAX_APPS).forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'app';

      var left = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'app-name';
      name.textContent = clip(d.app_name || d.name || d.id || '?', 120);
      left.appendChild(name);
      if (typeof d.domain === 'string' && d.domain !== '') {
        var host = document.createElement('div');
        host.className = 'app-host';
        host.textContent = clip(d.domain.replace(/^https?:\\/\\//, ''), 253);
        left.appendChild(host);
      }
      row.appendChild(left);

      var runtime = (d.runtime && typeof d.runtime === 'object') ? d.runtime : {};
      var pair = appState(runtime.state || 'unknown');
      var st = document.createElement('div');
      st.className = 'app-state';
      st.dataset.state = pair[0];
      st.textContent = 'Runtime: ' + pair[1];
      st.title = 'Observed: ' + clip(runtime.observed_at || 'not reported', 40) + '. Last operation: '
        + clip(((d.last_operation || {}).status || d.status || 'unknown'), 32) + '. Containers only.';
      if (runtime.state && runtime.state !== 'unknown') {
        var age = num(runtime.age_seconds);
        appTimers.push(setTimeout(function () { st.textContent = 'Runtime: unknown'; st.dataset.state = 'work'; },
          Math.max(0, 120 - (age === null ? 0 : age)) * 1000));
      }
      row.appendChild(st);

      box.appendChild(row);
    });
    if (rows.length > MAX_APPS) {
      var more = document.createElement('div');
      more.className = 'note';
      more.textContent = (rows.length - MAX_APPS) + ' more not shown.';
      box.appendChild(more);
    }
    Bridge.reportSize();
  }

  function clearReadings() {
    el('meters').hidden = true;
    el('counters').hidden = true;
    ['cpu', 'mem'].forEach(function (p) { setMeter(p, null, '', false, false); });
    ['upVal', 'diskVal', 'netVal'].forEach(function (id) { el(id).textContent = ''; });
    receivedAt = 0;
    refreshFailed = false;
    updateFreshness();
  }

  // A new service: nothing of the previous one may stay on screen.
  function resetView() {
    generation++;
    clearAppTimers();
    clearReadings();
    el('host').textContent = '—';
    var facts = el('facts');
    facts.textContent = '';
    facts.hidden = true;
    var apps = el('apps');
    apps.textContent = '';
    apps.hidden = true;
    appsLoaded = false;
    var toggle = el('appsToggle');
    toggle.textContent = 'Show deployed apps';
    toggle.setAttribute('aria-expanded', 'false');
    setPower('');
    el('chip').textContent = 'Loading';
    say('');
  }

  function fail(text) {
    clearReadings();
    var chip = el('chip');
    chip.dataset.state = 'error';
    chip.textContent = 'Unavailable';
    el('sub').textContent = '';
    el('start').hidden = true;
    el('reboot').hidden = true;
    el('shutdown').hidden = true;
    say(clip(text || 'Could not load this server.', 300), true);
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
      var g = generation;
      say(btn.dataset.base + ' requested…');
      Bridge.callTool('impreza_vps_power', { service_id: serviceId, action: action })
        .then(function () {
          if (g !== generation) { return; }
          say('Accepted. The state below refreshes as the server catches up.');
          setTimeout(function () { if (g === generation) { refreshStatus(); } }, 4000);
        })
        .catch(function (e) { if (g === generation) { say(clip(e.message || 'The host declined that action.', 300), true); } })
        .then(function () { busy = false; btn.disabled = false; Bridge.reportSize(); });
    });
  }

  // ── server calls (reads only) ───────────────────────────────────────────
  function refreshStatus() {
    if (serviceId === null) { return Promise.resolve(); }
    var g = generation;
    return Bridge.callTool('impreza_vps_status', { service_id: serviceId })
      .then(function (d) { if (g === generation) { renderStatus(d); } })
      .catch(function (e) {
        if (g !== generation) { return; }
        // Keep the last reading: marked old, it is still the best we know.
        var msg = clip(e.message || 'Could not refresh.', 200);
        say(receivedAt ? msg + ' Showing the reading from ' + clock(receivedAt) + '.' : msg, true);
        if (receivedAt) { refreshFailed = true; updateFreshness(); }
      });
  }

  function loadIdentity() {
    if (serviceId === null) { return; }
    var g = generation;
    // One enrichment call, for the facts that do not change.
    Bridge.callTool('impreza_api_call', { path: '/vps/proxmox/' + serviceId })
      .then(function (info) { if (g === generation) { renderIdentity(info); } })
      .catch(function () { /* the card is still useful without the hardware strip */ });
  }

  function loadApps() {
    // Two calls, and only on demand: list_servers maps this service to its
    // agent, and only then can deployments be filtered to THIS machine.
    // Showing another server's apps would be worse than showing none.
    var g = generation;
    var sid = serviceId;
    return Bridge.callTool('impreza_list_servers', {})
      .then(function (d) {
        if (g !== generation) { return; }
        var servers = (d && Array.isArray(d.servers)) ? d.servers : [];
        var mine = servers.filter(function (s) { return s && String(s.service_id) === String(sid); })[0];
        if (!mine || !mine.agent_id) {
          renderApps([]);
          return;
        }
        return Bridge.callTool('impreza_list_deployments', { agent_id: mine.agent_id })
          .then(function (r) { if (g === generation) { renderApps((r && r.deployments) || []); } });
      })
      .catch(function (e) { if (g === generation) { say(clip(e.message || 'Could not list apps.', 300), true); } });
  }

  // ── wiring ──────────────────────────────────────────────────────────────
  el('refresh').addEventListener('click', function () {
    if (busy) { return; }
    say('Refreshing…');
    var g = generation;
    refreshStatus().then(function () {
      if (g === generation && el('status').textContent === 'Refreshing…') { say(''); }
    });
  });

  wirePower('start', 'start', false);
  wirePower('reboot', 'reboot', true);
  wirePower('shutdown', 'shutdown', true);

  el('appsToggle').addEventListener('click', function () {
    var box = el('apps');
    if (box.hidden) {
      box.hidden = false;
      this.textContent = 'Hide deployed apps';
      this.setAttribute('aria-expanded', 'true');
      if (!appsLoaded && serviceId !== null) { appsLoaded = true; loadApps(); }
    } else {
      box.hidden = true;
      this.textContent = 'Show deployed apps';
      this.setAttribute('aria-expanded', 'false');
    }
    Bridge.reportSize();
  });

  setInterval(updateFreshness, 15000);

  Bridge.start({
    name: 'impreza-server-card',
    onInput: function (args) {
      // The status result carries no service_id; the tool ARGUMENTS do, and
      // every later call this panel makes needs it.
      var sid = serviceIdOf(args);
      if (sid === null || sid === serviceId) { return; }
      if (serviceId !== null) { resetView(); }
      serviceId = sid;
      el('sub').textContent = 'Service #' + serviceId;
      loadIdentity();
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
export const SERVER_CARD_HTML_MD5 = '8e785d52e00c6248327a3562e8b79c12';

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
  var ready = false;
  function reportSize() {
    // Nothing is said about size until the handshake is done. The observer can
    // fire before ui/initialize resolves; that early notification used to latch
    // lastH, so the reportSize() after initialized became a no-op and a host
    // that drops pre-handshake messages never heard a size at all. No argument
    // is read here: ResizeObserver passes its entries. An initial 0 stays
    // silent: announcing it would collapse a host that is waiting for content.
    if (!ready) { return; }
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
      ready = true;
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
          step('ok', 'done', 'Deployment completed. Observed runtime: ' + String((row.runtime || {}).state || 'unknown') + '.');
          busy = false;
          el('again').hidden = false;
          return;
        }
        if (st === 'failed') {
          setChip('error', 'Failed');
          step('bad', 'failed', String(row.last_error || 'The deploy failed.').slice(0, 240) + ' Observed runtime: ' + String((row.runtime || {}).state || 'unknown') + '.');
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
export const DEPLOY_WIZARD_HTML_MD5 = '5d92d074da67ef7e5b8896d1bd779ef0';
