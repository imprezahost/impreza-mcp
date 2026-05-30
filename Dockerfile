# Sanity Dockerfile — primarily so `git_url`-mode Phase 15 deploys
# pointing at this repo build something that runs. The real `npx`
# install path stays the canonical way to load the MCP server inside
# an AI tool (npm registry → spawned by Claude / Cursor / Continue /
# Zed / Codex). This Dockerfile is for the Impreza "deploy from git"
# smoke target, not the MCP-server-in-an-AI-tool path.
#
# Intentionally minimal so the build is fast + has no surface area
# for npm lifecycle-script surprises (first Phase 15 smoke caught a
# self-inflicted `npm install --omit=dev` + `prepare: npm run build`
# trap that's not worth the complexity for a sanity image).

FROM alpine:3.21
RUN echo 'impreza-mcp container built from a Phase 15 git_url deploy ✓' > /msg
EXPOSE 80
CMD ["sh", "-c", "cat /msg && tail -f /dev/null"]
