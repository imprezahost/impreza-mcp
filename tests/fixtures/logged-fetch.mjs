// Fetch stub for the MCP stdio suites whose tools declare an outputSchema.
// Every request the server makes is appended as one JSON line
// {method, path, body, query} to IMPREZA_TEST_REQUEST_LOG, so the tests assert
// the request (and count requests) from the log instead of from an echo.
// A route whose tool has an outputSchema answers with a real controller
// answer from output-samples.json; the SDK client validates it.
import { appendFileSync, readFileSync } from 'node:fs';

const LOG = process.env.IMPREZA_TEST_REQUEST_LOG;
if (!LOG) throw new Error('IMPREZA_TEST_REQUEST_LOG is required by the logged fetch fixture');
const HOST = new URL(process.env.IMPREZA_BASE_URL || 'https://unset.invalid').hostname;
if (!HOST.endsWith('.invalid')) throw new Error('The logged fetch fixture only answers a .invalid host');
const SAMPLES = JSON.parse(readFileSync(new URL('./output-samples.json', import.meta.url), 'utf8'));

// One-time secrets (STRUCTURED_OMIT) are absent from the versioned samples.
// The routes that really return one add a SYNTHETIC value here, numbered per
// server process ('synthetic-secret-1', '-2', ...), so a suite can prove it
// stays in the text and out of structuredContent and of the request log.
let secrets = 0;
const synthetic = () => 'synthetic-secret-' + (++secrets);
const mintsReviewerKey = (r) => r.body?.private === true && !r.body?.onion_clients;

const ID = '[^/]+';
const PLATFORM = '/v1/platform', DEPLOY = PLATFORM + '/deployments', CUSTOM = DEPLOY + '/custom';
// [method, path, sample key | (request) => key, HTTP status, (request, data) => data plus its one-time secret]
const ROUTES = [
  // Reads.
  ['POST', CUSTOM + '/compose/prepare', 'impreza_prepare_compose:ready'],
  ['POST', CUSTOM + '/prepare', 'impreza_prepare_project:node_and_dockerfile'],
  ['GET', `${PLATFORM}/environments/${ID}/compare`, 'impreza_compare_environments:staging_vs_production'],
  ['GET', `${PLATFORM}/traffic-switches/${ID}`, 'impreza_get_traffic_switch:pending'],
  ['GET', `${CUSTOM}/promotions/${ID}`, 'impreza_get_image_promotion:pending_with_domain'],
  ['GET', `${PLATFORM}/projects/${ID}/vars`, 'impreza_get_variable_group:project_group'],
  ['GET', `${PLATFORM}/environments/${ID}/vars`, 'impreza_get_variable_group:environment_group'],
  ['GET', `${PLATFORM}/environment-deploys/${ID}`, 'impreza_get_environment_deploy:running'],
  ['GET', `${PLATFORM}/config-promotions/${ID}`, 'impreza_get_config_promotion:pending'],
  ['GET', `${PLATFORM}/servers/${ID}/update-policy`, 'impreza_get_update_policy:stable_never_reported'],
  ['GET', `/v1/pitr-restores/${ID}`, 'impreza_get_pitr_restore:pending'],
  ['GET', CUSTOM + '/prepared', 'impreza_list_prepared_deployments:list'],
  ['GET', `${CUSTOM}/prepared/${ID}`, 'impreza_list_prepared_deployments:one_pending'],
  ['GET', PLATFORM + '/projects', 'impreza_list_projects:list'],
  ['GET', `${PLATFORM}/projects/${ID}`, 'impreza_list_projects:one_project_with_environments'],
  ['GET', `${PLATFORM}/environments/${ID}/deploys`, 'impreza_list_environment_deploys:staging_batches'],
  ['GET', CUSTOM + '/plans', 'impreza_list_project_plans:list'],
  ['GET', `${CUSTOM}/plans/${ID}`, 'impreza_list_project_plans:one_plan_expired'],
  ['GET', `${PLATFORM}/binding-plans/${ID}`, 'impreza_get_service_binding_plan:rotate'],
  ['GET', `${DEPLOY}/${ID}/shield`, 'impreza_get_shield:policy'],
  ['GET', `${DEPLOY}/${ID}/zero-downtime`, (r) => 'impreza_get_zero_downtime:' + ({ dpl_15e0000000000001: 'eligible', dpl_15e0000000000002: 'old_agent_opted_in', dpl_1a00000000000001: 'catalog' }[r.path.split('/')[4]] ?? 'several_reasons')],
  ['GET', `${CUSTOM}/${ID}/config`, 'impreza_export_app_config:git_app'],
  ['GET', `${PLATFORM}/config-plans/${ID}`, 'impreza_get_config_plan:pending'],
  ['GET', `${CUSTOM}/${ID}/metrics`, 'impreza_app_metrics:default_window'],
  ['GET', `${CUSTOM}/${ID}/alerts`, 'impreza_list_alerts:with_alerts'],
  ['GET', `/v1/database-restores/${ID}`, 'impreza_get_database_restore:pending'],
  ['GET', `${DEPLOY}/${ID}/onion/clients`, 'impreza_onion_auth_list:restricted'],
  ['GET', '/v1/account', 'impreza_account_info:account'],
  ['GET', '/v1/platform/servers', 'impreza_list_servers:list_servers'],
  ['GET', '/v1/docs/search', 'impreza_search_docs:search'],
  ['GET', '/v1/products/vps', 'impreza_vps_offer:offer'],
  ['GET', '/v1/products/vps/quote', 'impreza_vps_offer:quote'],
  // Writes: deployments.
  ['POST', CUSTOM, (r) => r.body?.mode === 'image' ? 'impreza_deploy_custom:image_onion_only' : 'impreza_deploy_custom:git_dockerfile', 201],
  ['POST', DEPLOY, 'impreza_deploy_catalog_app:generated_credentials', 201, (r, data) => ({ ...data, credentials: { ADMIN_PASSWORD: synthetic() } })],
  ['POST', `${CUSTOM}/${ID}/redeploy`, 'impreza_redeploy_deployment:image_with_vars', 202],
  ['POST', `${DEPLOY}/${ID}/rollback`, 'impreza_rollback_deployment:queued_after_confirmation', 202],
  ['POST', `${CUSTOM}/${ID}/previews`, (r) => mintsReviewerKey(r) ? 'impreza_create_preview:private_minted_key' : 'impreza_create_preview:private_given_keys', 201,
    (r, data) => r.body?.protect === true ? { ...data, password: synthetic() } : mintsReviewerKey(r) ? { ...data, reviewer_private_key: synthetic() } : data],
  // Writes: onion custody.
  ['POST', `${DEPLOY}/${ID}/onion/add`, 'impreza_add_onion:queue_onion_mirror', 202],
  ['POST', `${DEPLOY}/${ID}/onion/profile`, 'impreza_set_onion_profile:queue_profile', 202],
  ['POST', `${DEPLOY}/${ID}/onion/export`, 'impreza_export_onion_key:queue_export_after_confirmation', 202],
  ['GET', `${DEPLOY}/${ID}/onion/export/${ID}`, 'impreza_fetch_onion_key_export:read_sealed_once', 200, (r, data) => ({ ...data, sealed: synthetic() })],
  ['POST', `${DEPLOY}/${ID}/onion/rotate`, 'impreza_rotate_onion_key:queue_rotation_after_confirmation', 202],
  ['POST', `${DEPLOY}/${ID}/onion/purge`, 'impreza_purge_onion_key:agent_mode_retained_identity', 202],
  ['DELETE', `${DEPLOY}/${ID}/onion/clients/${ID}`, 'impreza_onion_auth_revoke:revoke_after_confirmation'],
  // Writes: project plans and prepared deployments.
  ['POST', CUSTOM + '/plans', 'impreza_plan_project:inspect_upload', 201],
  ['POST', `${CUSTOM}/plans/${ID}/deploy`, 'impreza_deploy_project_plan:deploy_static', 201],
  ['POST', `${CUSTOM}/plans/${ID}/prepare-deployment`, 'impreza_prepare_project_deployment:prepare_static', 201],
  ['POST', `${CUSTOM}/prepared/${ID}/apply`, 'impreza_apply_project_deployment:accepted_replay'],
  // Writes: projects and environments.
  ['POST', PLATFORM + '/projects', 'impreza_create_project:created', 201],
  ['POST', `${PLATFORM}/projects/${ID}/environments`, 'impreza_create_environment:created', 201],
  ['POST', `${PLATFORM}/environments/${ID}/services`, 'impreza_attach_environment_service:attached'],
  ['POST', `${PLATFORM}/environments/${ID}/services/detach`, 'impreza_detach_environment_service:detached'],
  ['PUT', `${PLATFORM}/projects/${ID}/vars`, 'impreza_set_variable_group:project_group_replaced'],
  ['PUT', `${PLATFORM}/environments/${ID}/vars`, 'impreza_set_variable_group:environment_group_with_secret'],
  ['POST', `${PLATFORM}/projects/${ID}/rename`, 'impreza_rename_project:renamed'],
  ['POST', `${PLATFORM}/environments/${ID}/rename`, 'impreza_rename_environment:renamed'],
  ['POST', `${PLATFORM}/projects/${ID}/delete`, 'impreza_delete_project:deleted'],
  ['POST', `${PLATFORM}/environments/${ID}/delete`, 'impreza_delete_environment:deleted'],
  ['POST', `${PLATFORM}/environments/${ID}/deploy`, 'impreza_deploy_environment:started', 202],
  ['POST', `${PLATFORM}/environments/${ID}/config-promotions`, 'impreza_prepare_config_promotion:staging_to_production', 201],
  ['POST', `${PLATFORM}/config-promotions/${ID}/apply`, 'impreza_apply_config_promotion:accepted_replay'],
  // Writes: reviewed plans (prepare, then apply; the apply samples are replays).
  ['POST', `${CUSTOM}/${ID}/prepare-traffic-switch`, 'impreza_prepare_traffic_switch:move_hostname', 201],
  ['POST', `${CUSTOM}/${ID}/prepare-binding`, 'impreza_prepare_service_binding:create_with_wire', 201],
  ['POST', `${CUSTOM}/${ID}/prepare-binding-removal`, 'impreza_prepare_service_binding_removal:remove_active', 201],
  ['POST', `${CUSTOM}/${ID}/prepare-binding-rotation`, 'impreza_prepare_service_binding_rotation:rotate_current', 201],
  ['POST', `${PLATFORM}/traffic-switches/${ID}/apply`, 'impreza_apply_traffic_switch:first_apply'],
  ['POST', `${PLATFORM}/binding-plans/${ID}/apply`, 'impreza_apply_service_binding_plan:accepted_replay'],
  ['POST', `${CUSTOM}/${ID}/prepare-promotion`, 'impreza_prepare_image_promotion:promote_digest', 201],
  ['POST', `${CUSTOM}/promotions/${ID}/apply`, 'impreza_apply_image_promotion:accepted_replay'],
  ['POST', `${DEPLOY}/${ID}/pitr`, 'impreza_configure_pitr:disable_active', 202],
  ['POST', `${DEPLOY}/${ID}/prepare-pitr-restore`, 'impreza_prepare_pitr_restore:fresh_review', 201],
  ['POST', `/v1/backups/${ID}/prepare-database-restore`, 'impreza_prepare_database_restore:fresh_review', 201],
  ['POST', `/v1/pitr-restores/${ID}/apply`, 'impreza_apply_pitr_restore:replay_accepted_review'],
  ['POST', `/v1/database-restores/${ID}/apply`, 'impreza_apply_database_restore:replay_accepted_review'],
].map(([method, path, key, status = 200, secret]) => {
  if (typeof key === 'string' && !(key in SAMPLES)) throw new Error('Missing output sample ' + key);
  return { method, re: new RegExp('^' + path + '$'), key, status, secret };
});

// IMPREZA_TEST_FUTURE_FIELD=1: the API has gained a field the installed
// package does not know, in three places a schema closes: the root object
// (account), the items of a list in the root (servers) and the items of a list
// inside an anyOf branch (docs search results).
const FUTURE = process.env.IMPREZA_TEST_FUTURE_FIELD === '1';
const future = (key, data) => {
  if (!FUTURE) return data;
  const d = structuredClone(data);
  if (key === 'impreza_account_info:account') d.f18_future_field = 'from-a-newer-api';
  if (key === 'impreza_list_servers:list_servers') d.servers = d.servers.map((x) => ({ ...x, f18_future_field: 'from-a-newer-api' }));
  if (key === 'impreza_search_docs:search') d.results = d.results.map((x) => ({ ...x, f18_future_field: 'from-a-newer-api' }));
  return d;
};
const json = (data, status = 200) => new Response(JSON.stringify({ success: true, data }), { status, headers: { 'content-type': 'application/json' } });
// GET .../onion/export/{commandId} is read-once: the first read returns the
// sealed blob and burns it, a second read of the same path is a 404.
const burned = new Set();

globalThis.fetch = async (url, options = {}) => {
  const parsed = new URL(url);
  if (parsed.hostname !== HOST) throw new Error('Unexpected network destination');
  const method = options.method || 'GET', path = parsed.pathname;
  if (method === 'GET' && path === '/v1/entitlements') return json({ known: true, hidden: [] });
  const request = { method, path, body: options.body ? JSON.parse(options.body) : null, query: Object.fromEntries(parsed.searchParams) };
  appendFileSync(LOG, JSON.stringify(request) + '\n');
  if (method === 'GET' && /\/onion\/export\/[^/]+$/.test(path)) {
    if (burned.has(path)) return new Response(JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: 'The sealed blob was already retrieved (read-once).' } }), { status: 404, headers: { 'content-type': 'application/json' } });
    burned.add(path);
  }
  const route = ROUTES.find(r => r.method === method && r.re.test(path));
  if (route) {
    const key = typeof route.key === 'function' ? route.key(request) : route.key;
    if (!(key in SAMPLES)) throw new Error('Missing output sample ' + key);
    const data = future(key, structuredClone(SAMPLES[key]));
    return json(route.secret ? route.secret(request, data) : data, route.status);
  }
  // The log-tail flow (impreza_tail_logs builds its own result from these pages).
  if (method === 'POST' && path.endsWith('/logs/requests')) return json({ request_id: 'log_aaaa00000000000000000001', reused: false });
  if (method === 'GET' && path.includes('/logs/requests/')) return json({ status: 'complete', final: true, next_offset: 2, chunks: [{ id: 1, chunk: 'hello ', final: false }, { id: 2, chunk: 'world', final: true }] });
  // The onion-client contract as the API answers: {name, pubkey, command_id}; with generate:true also the
  // private_key, shown ONCE (a synthetic value here) and its private_note.
  if (method === 'POST' && /^\/v1\/platform\/deployments\/[^/]+\/onion\/clients$/.test(path)) {
    const { name, pubkey, generate } = request.body || {};
    return json(generate === true
      ? { name, pubkey: 'C'.repeat(51) + 'A', command_id: 'cmd_onionauthfixture01', private_key: synthetic(), private_note: 'The private key is shown once; save it now.' }
      : { name, pubkey, command_id: 'cmd_onionauthfixture02' }, 201);
  }
  // Tools without an outputSchema: a neutral acknowledgement; the request is asserted from the log.
  return json({ accepted: true });
};
