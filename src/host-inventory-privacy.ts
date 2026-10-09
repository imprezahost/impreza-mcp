// Project only MCP output; preserve the REST object and its strict output schema.
export function hostInventoryForMcp(payload: unknown, includeSshFingerprints = false): unknown {
  if (includeSshFingerprints || !payload || typeof payload !== 'object') return payload;
  const view = payload as Record<string, unknown>;
  if (!view.facts || typeof view.facts !== 'object') return payload;
  const facts = view.facts as Record<string, unknown>;
  if (!facts.ssh || typeof facts.ssh !== 'object') return payload;
  const ssh = facts.ssh as Record<string, unknown>;
  if (!ssh.value || typeof ssh.value !== 'object' || Array.isArray(ssh.value)) return payload;
  return { ...view, facts: { ...facts, ssh: { ...ssh, value: { ...ssh.value, fingerprints: [] } } } };
}
