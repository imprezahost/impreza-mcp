// `npx impreza-mcp setup --tool <name>` wizard.
//
// Generates the ready-to-paste MCP config snippet for whatever AI tool
// the customer is configuring, plus the file path they should drop it
// into and the post-config step (almost always "restart the AI tool").
//
// No filesystem mutations. The wizard prints to stdout; the customer
// pastes manually. This avoids the bad failure mode where we silently
// corrupt an existing config that already has other MCP servers.
//
// Supported tools (`--tool` values):
//
//   claude-code   — Anthropic Claude Desktop / Claude Code
//   cursor        — Cursor
//   continue      — Continue (VS Code / JetBrains)
//   zed           — Zed editor
//   codex-cli     — OpenAI Codex CLI

import { homedir, platform } from 'node:os';
import { join } from 'node:path';

type ToolName = 'claude-code' | 'cursor' | 'continue' | 'zed' | 'codex-cli';

const SUPPORTED: readonly ToolName[] = ['claude-code', 'cursor', 'continue', 'zed', 'codex-cli'];

const SERVER_NAME = 'impreza';
const NPX_COMMAND = 'npx';
const NPX_ARGS = ['-y', 'impreza-mcp'];

/**
 * Run the wizard. Argv passed in is everything AFTER the `setup`
 * subcommand (so `--tool claude-code ...`). Exits the process on
 * completion (zero for success, non-zero on bad input).
 */
export function runSetup(argv: readonly string[]): never {
  const opts = parseFlags(argv);
  if (opts.help) {
    printHelp();
    process.exit(0);
  }
  const tool = opts.tool;
  if (!tool) {
    console.error('error: --tool is required');
    console.error('');
    printHelp();
    process.exit(2);
  }
  if (!SUPPORTED.includes(tool as ToolName)) {
    console.error(`error: unknown tool "${tool}"`);
    console.error(`supported: ${SUPPORTED.join(', ')}`);
    process.exit(2);
  }

  const snippet = renderSnippet(tool as ToolName);
  const path = configPath(tool as ToolName);
  const restartHint = restartInstruction(tool as ToolName);

  console.log(`# impreza-mcp setup — ${tool}\n`);
  console.log(`Add the following block to ${path === null ? 'your AI tool\'s MCP config file' : path}:\n`);
  console.log(snippet);
  console.log('');
  console.log('Then:');
  let step = 1;
  if (path === null) {
    console.log(`  ${step++}. consult the tool's docs for the exact config file path`);
  }
  console.log(`  ${step++}. replace \`imp_...\` / the secret with your real Impreza API key + secret`);
  console.log("     (clientarea → API Keys; whitelist this machine's IP)");
  console.log(`  ${step++}. ${restartHint}`);
  console.log('');
  console.log('Verify: ask your AI to run `impreza_list_servers`. It should list your VPSes.');
  process.exit(0);
}

interface ParsedFlags {
  tool?: string | undefined;
  help: boolean;
}

function parseFlags(argv: readonly string[]): ParsedFlags {
  const out: ParsedFlags = { help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--tool') {
      const next = argv[i + 1];
      if (!next) {
        console.error('error: --tool requires a value');
        process.exit(2);
      }
      out.tool = next;
      i++;
    } else if (a?.startsWith('--tool=')) {
      out.tool = a.slice('--tool='.length);
    } else {
      console.error(`error: unknown flag "${a}"`);
      process.exit(2);
    }
  }
  return out;
}

function printHelp(): void {
  console.log('Usage: npx impreza-mcp setup --tool <name>');
  console.log('');
  console.log('Supported tools:');
  console.log('  claude-code   Anthropic Claude Desktop / Claude Code');
  console.log('  cursor        Cursor');
  console.log('  continue      Continue (VS Code / JetBrains)');
  console.log('  zed           Zed editor');
  console.log('  codex-cli     OpenAI Codex CLI');
  console.log('');
  console.log('Example:');
  console.log('  npx impreza-mcp setup --tool claude-code');
}

// ─────────────────────────────────────────────────────────────────────
// Per-tool config snippet generators
// ─────────────────────────────────────────────────────────────────────

function renderSnippet(tool: ToolName): string {
  switch (tool) {
    case 'claude-code':
    case 'cursor':
      // Both speak the standard `mcpServers` shape.
      return jsonBlock({
        mcpServers: {
          [SERVER_NAME]: stdioCommand(),
        },
      });
    case 'continue':
      return jsonBlock({
        experimental: {
          modelContextProtocolServers: [
            {
              transport: {
                type: 'stdio',
                command: NPX_COMMAND,
                args: NPX_ARGS,
                env: envBlock(),
              },
            },
          ],
        },
      });
    case 'zed':
      return jsonBlock({
        context_servers: {
          [SERVER_NAME]: {
            command: {
              path: NPX_COMMAND,
              args: NPX_ARGS,
              env: envBlock(),
            },
          },
        },
      });
    case 'codex-cli':
      // Codex CLI's MCP config uses the same `mcpServers` shape as
      // Claude / Cursor, with a slightly different file path. Same
      // JSON snippet — only the destination differs.
      return jsonBlock({
        mcpServers: {
          [SERVER_NAME]: stdioCommand(),
        },
      });
  }
}

function stdioCommand(): Record<string, unknown> {
  return {
    command: NPX_COMMAND,
    args: NPX_ARGS,
    env: envBlock(),
  };
}

function envBlock(): Record<string, string> {
  return {
    IMPREZA_API_KEY: 'imp_REPLACE_ME',
    IMPREZA_API_SECRET: 'REPLACE_ME',
  };
}

function jsonBlock(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

// ─────────────────────────────────────────────────────────────────────
// Per-tool config-file paths (informational, never written)
// ─────────────────────────────────────────────────────────────────────

function configPath(tool: ToolName): string | null {
  const home = homedir();
  const plat = platform();
  switch (tool) {
    case 'claude-code':
      if (plat === 'darwin') return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
      if (plat === 'win32') return join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
      return join(home, '.config', 'Claude', 'claude_desktop_config.json');
    case 'cursor':
      return join(home, '.cursor', 'mcp.json');
    case 'continue':
      return join(home, '.continue', 'config.json');
    case 'zed':
      if (plat === 'darwin') return join(home, '.config', 'zed', 'settings.json');
      if (plat === 'win32') return join(process.env.APPDATA ?? join(home, 'AppData', 'Roaming'), 'Zed', 'settings.json');
      return join(home, '.config', 'zed', 'settings.json');
    case 'codex-cli':
      // Codex CLI's MCP config lives in `~/.codex/config.toml` OR
      // a parallel JSON file depending on version. The customer
      // knows which they have; don't guess.
      return null;
  }
}

function restartInstruction(tool: ToolName): string {
  switch (tool) {
    case 'claude-code':
      return 'fully quit + re-open Claude (Cmd/Ctrl+Q, then launch again — reload-on-MCP-config-change isn\'t supported)';
    case 'cursor':
      return 'quit + re-open Cursor (the MCP servers re-launch on startup)';
    case 'continue':
      return 'reload your editor window (VS Code: Cmd/Ctrl+Shift+P → "Developer: Reload Window"; JetBrains: restart)';
    case 'zed':
      return 'quit + re-open Zed';
    case 'codex-cli':
      return 'restart any running codex session (the MCP server attaches per-session)';
  }
}
