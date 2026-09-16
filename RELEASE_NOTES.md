# MCP 0.34.0

- Review Git sources at an exact commit and retain the reviewed bytes for saved plans.
- Select npm workspaces, pinned pnpm/Yarn recipes and the pinned uv Python recipe.
- Pass retained source contexts when reviewing and deploying Compose applications.
- Supply named build credentials for supported source builds; update agents to 0.6.11+ before using build secrets or retained Compose runtime files.
- Refresh runtime dependencies with security fixes.

The corresponding control-plane capabilities must be deployed before using these inputs. Unsupported agents are refused before commands are dispatched. Existing servers update only when the customer requests it. This release does not add immediate build interruption, automatic retries or zero-downtime traffic switching.
