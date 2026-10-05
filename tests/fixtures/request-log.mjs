// Test-side helper for the logged fetch fixture: starts the real server over
// MCP stdio with the fixture preloaded and a fresh request log, and reads the
// log back. close() shuts the client and deletes the temporary folder.
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SAMPLES = JSON.parse(readFileSync(new URL('./output-samples.json', import.meta.url), 'utf8'));

export function sample(key) {
  if (!(key in SAMPLES)) throw new Error('Missing output sample ' + key);
  return structuredClone(SAMPLES[key]);
}

// impreza_deploy_custom answers the created deployment; a Git source adds the
// package's own `_trace` line (deployment id + the Git URL it sent).
export function gitDeployAnswer(gitUrl) {
  const created = sample('impreza_deploy_custom:git_dockerfile');
  return { ...created, _trace: created.id + ' (git: ' + gitUrl + ')' };
}

export function loggedClient(name, { host = 'rollback.invalid', env = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'impreza-mcp-requests-'));
  const log = join(dir, 'requests.jsonl');
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', new URL('./logged-fetch.mjs', import.meta.url).href, fileURLToPath(new URL('../../dist/server.js', import.meta.url))],
    env: { ...process.env, IMPREZA_BASE_URL: 'https://' + host, IMPREZA_API_KEY: 'test-key', IMPREZA_API_SECRET: 'test-secret-not-a-real-credential', ...env, IMPREZA_TEST_REQUEST_LOG: log },
  });
  const client = new Client({ name, version: '1.0.0' });
  const requests = () => existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line)) : [];
  return {
    client,
    connect: () => client.connect(transport),
    requests,
    raw: () => existsSync(log) ? readFileSync(log, 'utf8') : '',
    count: () => requests().length,
    // A one-time secret (STRUCTURED_OMIT) reaches the caller in the text only:
    // never in structuredContent and never in the request log.
    secretKept(result, field, value) {
      const text = result.content[0].text;
      assert.deepEqual(JSON.parse(text)[field], value, field + ' is missing from the text');
      assert(!(field in result.structuredContent), field + ' leaked into structuredContent');
      const leaves = typeof value === 'string' ? [value] : Object.values(value);
      assert(leaves.length > 0 && leaves.every(v => typeof v === 'string' && v.startsWith('synthetic-secret-')), 'only synthetic secrets are used');
      for (const leaf of leaves) {
        assert(text.includes(leaf), field + ' value is missing from the text');
        assert(!JSON.stringify(result.structuredContent).includes(leaf), field + ' value leaked into structuredContent');
        assert(!this.raw().includes(leaf), field + ' value leaked into the request log');
      }
    },
    last: () => requests().at(-1),
    async close() {
      try { await client.close(); } finally { rmSync(dir, { recursive: true, force: true }); }
    },
  };
}
