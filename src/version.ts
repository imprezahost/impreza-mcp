//
// Single source of truth for the package version.
//
// Reads the version straight from package.json at runtime so the three
// version stamps (the MCP server handshake, the `--version` CLI output,
// and the outbound `User-Agent` header) can never drift from the
// published npm version again. Previously these were three separate
// hard-coded constants that fell out of sync with package.json on every
// release bump.
//
// Why runtime fs instead of `import pkg from '../package.json'`: importing
// JSON from outside the `src/` rootDir makes tsc widen the inferred
// rootDir, which reshapes the build output to `dist/src/*.js` +
// `dist/package.json` and breaks the `bin` path. Reading the file relative
// to the compiled module's own URL sidesteps that entirely and works the
// same whether we run from source, from `dist/`, or from an npm install
// (`node_modules/impreza-mcp/dist/version.js` → `../package.json`).
//
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

function readVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')) as {
      version?: string;
    };
    return pkg.version ?? '0.0.0';
  } catch {
    // The manifest should always be alongside the package; fall back to a
    // sentinel rather than crashing the server on a version stamp.
    return '0.0.0';
  }
}

/** The package version, read once from package.json. */
export const VERSION = readVersion();
