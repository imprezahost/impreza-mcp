# Container image for the Impreza MCP server (stdio transport).
#
# Canonical ways to load this server inside an AI tool remain the npm
# path (`npx -y impreza-mcp`, spawned by Claude / Cursor / Continue /
# Zed / Codex) and the remote OAuth endpoint (https://mcp.imprezahost.com/mcp).
# This image is for hosted one-click deploys (e.g. a Glama release, which
# runs security checks before publishing) and doubles as the Impreza
# "deploy from a git URL" smoke target — both now get a container that
# actually runs the server instead of a sanity stub.
#
# Multi-stage: compile TypeScript with the full toolchain, ship only prod
# deps. `--ignore-scripts` sidesteps the `prepare: npm run build` lifecycle
# trap (build is invoked explicitly, after src is copied in).

# --- build stage: src -> dist/ -----------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci --ignore-scripts && npm run build

# --- runtime stage: prod deps + compiled server ------------------------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
# MCP stdio server: reads JSON-RPC on stdin, writes responses on stdout.
ENTRYPOINT ["node", "dist/server.js"]
