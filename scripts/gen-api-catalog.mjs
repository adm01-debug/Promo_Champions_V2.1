#!/usr/bin/env node
/**
 * Gera docs/API.md — catálogo real das edge functions, rotas do frontend e
 * RPCs, extraído estaticamente do código.
 *
 * Uso: node scripts/gen-api-catalog.mjs
 *
 * Heurísticas (classificação de auth por presença de helpers/padrões no
 * código): um "não detectado" significa "nenhum padrão conhecido encontrado
 * no source", não prova de ausência de auth. Verifique a function antes de
 * confiar.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const FN_DIR = join(ROOT, 'supabase', 'functions');
const MIG_DIR = join(ROOT, 'supabase', 'migrations');
const ROUTES_FILE = join(ROOT, 'src', 'routes', 'AppRoutes.tsx');
const CONFIG = join(ROOT, 'supabase', 'config.toml');
const OUT = join(ROOT, 'docs', 'API.md');

const FIELD_BLOCKLIST = new Set([
  'const', 'let', 'var', 'return', 'await', 'new', 'throw', 'if', 'else',
  'import', 'export', 'function', 'supabase', 'supabaseUrl', 'supabaseKey',
  'serviceRoleKey', 'serviceKey', 'url', 'key', 'token', 'anon', 'env',
  'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
]);

const DOMAIN_RULES = [
  ['CRM / Pipeline', /deal|pipeline|winloss|win-loss|stage|stuck|quote|committee/],
  ['Leads / Roteamento', /lead|enrich|dialer|territory|behavioral|assign|onboarding/],
  ['Cadências / Workflows', /cadence|sequence|workflow|scheduled-sends|optimal-send|send-time/],
  ['Email', /email|unsubscribe|transactional/],
  ['Voz / Dialer', /call|voice|elevenlabs|twilio|transcribe|diariz|conversation/],
  ['IA / Forecast', /forecast|predict|revenue|demand|pricing|copilot|assistant|nlq|semantic|ai-|intelligence|next-best|automation-suggestions|visual-search/],
  ['Coaching', /coach/],
  ['Gamificação', /race|challenge|powerup|ranking|broadcast|engagement-score|account-engagement/],
  ['Alertas / Monitoramento', /alert|monitor|health|cron|wal|log-web-vitals|get-client-ip|device/],
  ['Customer Success', /customer-success|csat|qbr|renewal|expansion|churn/],
  ['Multichannel / Push', /multichannel|push/],
  ['Integrações', /bitrix|helpdesk|webhook|sync|bridge|dispatch|v4|test-integration/],
  ['Reports / Export', /report|export|briefing|revops|pipeline-pulse/],
  ['Auth / Segurança', /webauthn|password|access-denied/],
];

function domainOf(name) {
  for (const [label, re] of DOMAIN_RULES) if (re.test(name)) return label;
  return 'Ops / Outros';
}

// ---------- verify_jwt no config.toml ----------
const configTxt = readFileSync(CONFIG, 'utf-8');
const jwtOff = new Set();
for (const m of configTxt.matchAll(/\[functions\.([^\]]+)\]\s*\nverify_jwt\s*=\s*false/g)) {
  jwtOff.add(m[1]);
}

// ---------- coleta por function ----------
const SIG_RE = /verifyTwilioSignature|verifyResendSvixSignature|verifySendGridSignature|verifyMetaSignature|verifyMetaWebhookHandshake|authenticateInboundEmailWebhook|authenticateMultichannelStatusWebhook|hmacSha256Hex|hmacSha256Base64|hmacSha1Base64|timingSafeEqual|verifyHmacSha256Signature|headers\.get\(['"`][^'"`]*signature/i;
const rows = [];

const fns = readdirSync(FN_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== '_shared')
  .map(d => d.name)
  .sort();

for (const name of fns) {
  const dir = join(FN_DIR, name);
  const files = readdirSync(dir).filter(f => f.endsWith('.ts') && !f.includes('_test') && !f.endsWith('.test.ts'));
  let src = '';
  for (const f of files) src += readFileSync(join(dir, f), 'utf-8') + '\n';

  // --- auth ---
  const auth = [];
  if (SIG_RE.test(src)) auth.push('assinatura do provedor');
  if (/isAuthorizedCronRequest|isInternalServiceRequest|X-Cron-Secret|x-cron-secret/.test(src)) auth.push('segredo interno (cron/service_role)');
  if (/getUserClient\(/.test(src)) auth.push('JWT do usuário (RLS)');
  if (/requireAdmin\(/.test(src)) auth.push('papel admin');
  if (/is_admin_or_manager|rpc\(['"]has_role/.test(src)) auth.push('papel admin/gestor');
  if (/auth\.getUser\(|auth\.getClaims\(/.test(src) && !auth.includes('JWT do usuário (RLS)')) auth.push('JWT do usuário');
  if (/headers\.get\(['"](x-api-key|api-?key|x-functions-key)['"]\)/i.test(src)) auth.push('API key');
  if (/X-Embed-Token|embed_token|embedToken/.test(src)) auth.push('token de embed');
  if (/headers\.get\(['"]authorization/i.test(src) && auth.length === 0) auth.push('Bearer manual');
  let authLabel = auth.length ? [...new Set(auth)].join(' + ') : 'nenhuma detectada no handler';
  if (!jwtOff.has(name)) authLabel += ' · verify_jwt';
  else authLabel += ' · verify_jwt off';

  // --- métodos ---
  const methods = new Set();
  for (const m of src.matchAll(/req\.method\s*={2,3}\s*['"]([A-Z]+)['"]/g)) methods.add(m[1]);
  for (const m of src.matchAll(/\[['"A-Z,\s]+\]\.includes\(req\.method\)/g)) {
    for (const mm of m[0].matchAll(/'([A-Z]+)'/g)) methods.add(mm[1]);
  }
  // `req.method !== 'X'` seguido de return = gate que só aceita X
  const gates = new Set();
  for (const m of src.matchAll(/req\.method\s*!={1,2}\s*['"]([A-Z]+)['"]/g)) {
    const tail = src.slice(m.index, m.index + 300);
    if (/405|method_not_allowed|Method Not Allowed/.test(tail)) gates.add(m[1]);
  }
  methods.delete('OPTIONS'); // preflight CORS universal
  let methodLabel;
  if (gates.size > 1) methodLabel = [...gates].join(' ou ');
  else if (gates.size === 1) methodLabel = `só ${[...gates][0]}`;
  else methodLabel = methods.size ? [...methods].join(', ') : 'qualquer';

  // --- payload ---
  const payload = new Set();
  for (const m of src.matchAll(/\{([^}]{1,300})\}\s*=\s*(?:validation\.data|await\s+req\.json\(\)|\bbody\b|\bpayload\b|\brawBody\b)/g)) {
    for (const f of m[1].split(',')) {
      const id = f.trim().match(/^([a-zA-Z_$][\w$]*)/);
      if (id && !FIELD_BLOCKLIST.has(id[1])) payload.add(id[1]);
    }
  }
  for (const m of src.matchAll(/\b(?:body|rawBody|payload|params|input)\.([a-zA-Z_]\w*)/g)) {
    if (payload.size < 12) payload.add(m[1]);
  }
  for (const m of src.matchAll(/WebhookContracts\.(\w+)/g)) payload.add(`contrato:${m[1]}`);
  const qp = new Set();
  for (const m of src.matchAll(/searchParams\.get\(['"]([\w-]+)['"]\)/g)) qp.add(m[1]);
  if (/form-urlencoded|FormData|readUtf8BodyWithinLimit/.test(src) && !/req\.json/.test(src)) payload.add('form-urlencoded/texto');
  let payloadLabel = [...payload].slice(0, 10).join(', ') || (qp.size ? '' : '—');
  if (qp.size) payloadLabel += `${payloadLabel ? ' · ' : ''}query: ${[...qp].slice(0, 6).join(', ')}`;
  if (payloadLabel.length > 110) payloadLabel = payloadLabel.slice(0, 107) + '…';

  // --- resposta ---
  let response = 'JSON';
  if (/text\/html/.test(src)) response = 'HTML';
  else if (/text\/xml|application\/xml|TwiML/.test(src)) response = 'TwiML/XML';
  else if (/text\/event-stream/.test(src)) response = 'SSE/stream';
  const rkeys = new Set();
  for (const m of src.matchAll(/return\s+new\s+Response\(\s*JSON\.stringify\(\s*\{([^}]{1,200})/g)) {
    for (const k of m[1].matchAll(/^\s*([a-zA-Z_]\w*)\s*:/gm)) {
      if (!['headers', 'status'].includes(k[1])) rkeys.add(k[1]);
      if (rkeys.size >= 6) break;
    }
  }
  if (rkeys.size) response += ` {${[...rkeys].slice(0, 6).join(', ')}}`;
  if (response.length > 60) response = response.slice(0, 57) + '…';

  rows.push({ name, domain: domainOf(name), auth: authLabel, method: methodLabel, payload: payloadLabel, response });
}

// ---------- rotas do frontend ----------
const routesSrc = readFileSync(ROUTES_FILE, 'utf-8');
const routes = [];
let insideProtected = false;
const routeLines = routesSrc.split('\n');
for (let i = 0; i < routeLines.length; i++) {
  if (!/<Route(?=[\s>]|$)/.test(routeLines[i]) || /<\/?Routes|<\/Route/.test(routeLines[i])) continue;
  // path e element podem estar em linhas seguintes (Route multilinha)
  const window = routeLines.slice(i, i + 4).join('\n');
  const pm = window.match(/path="([^"]+)"/);
  if (!pm) continue;
  const path = pm[1];
  const elIdx = window.indexOf('element=');
  let el = elIdx >= 0 ? window.slice(elIdx, elIdx + 220) : '';
  // fecha o element no primeiro `/>` para não vazar guarda da rota seguinte
  const close = el.indexOf('/>');
  if (close >= 0) el = el.slice(0, close + 2);
  let access;
  if (/<Admin[ >]/.test(el)) access = 'admin';
  else if (/<Manager[ >]/.test(el)) access = 'admin ou gestor';
  else if (/ProtectedRoute/.test(el)) access = 'autenticado';
  else access = insideProtected ? 'autenticado' : 'pública';
  const comp = (el.match(/<([A-Z]\w*)/g) || []).map(s => s.slice(1))
    .find(c => !['ProtectedRoute', 'Admin', 'Manager', 'Navigate', 'Routes', 'Route', 'Suspense', 'MainLayout', 'ErrorBoundary', 'PageTransition', 'SmartSkeleton'].includes(c)) || '—';
  routes.push({ path, comp, access });
  if (path === '/*' && /ProtectedRoute/.test(el)) insideProtected = true;
}

// ---------- RPCs ----------
const rpcDefs = new Map(); // name -> {file, grants:Set}
const migFiles = readdirSync(MIG_DIR).filter(f => f.endsWith('.sql')).sort();
for (const f of migFiles) {
  const sql = readFileSync(join(MIG_DIR, f), 'utf-8');
  for (const m of sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_]\w*)/gi)) {
    if (!rpcDefs.has(m[1].toLowerCase())) rpcDefs.set(m[1].toLowerCase(), { file: f, grants: new Set() });
    rpcDefs.get(m[1].toLowerCase()).file = f; // última definição vale
  }
  for (const m of sql.matchAll(/grant\s+execute(?:\s+on\s+function)?\s+(?:on\s+function\s+)?(?:public\.)?([a-zA-Z_]\w*)[^;]*?\bto\s+([a-zA-Z_,\s]+);/gi)) {
    const fn = rpcDefs.get(m[1].toLowerCase());
    if (fn) for (const r of m[2].split(',')) fn.grants.add(r.trim().toLowerCase());
  }
}
// chamadas .rpc('x') no frontend
const rpcCalls = new Map(); // name -> Set<arquivo>
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) {
      const s = readFileSync(p, 'utf-8');
      for (const m of s.matchAll(/\.rpc\(\s*['"]([a-zA-Z_]\w*)['"]/g)) {
        if (!rpcCalls.has(m[1])) rpcCalls.set(m[1], new Set());
        rpcCalls.get(m[1]).add(p.replace(ROOT + '/', ''));
      }
    }
  }
}
walk(join(ROOT, 'src'));

// ---------- emissão ----------
const esc = s => s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
const lines = [];
lines.push('# API — Promo Champions V2.1', '');
lines.push('> Catálogo gerado automaticamente por `scripts/gen-api-catalog.mjs` a');
lines.push('> partir do código-fonte. Para atualizar: `node scripts/gen-api-catalog.mjs`.', '');
lines.push('## Visão geral', '');
lines.push('- **Edge Functions** (Deno): `https://usyxfpqlsspldubptrdl.supabase.co/functions/v1/<nome>`');
lines.push('- **PostgREST** (CRUD das tabelas com RLS): `https://usyxfpqlsspldubptrdl.supabase.co/rest/v1/` — a especificação OpenAPI é gerada pelo próprio Supabase.');
lines.push('- **Auth**: `Authorization: Bearer <JWT do usuário>` (Supabase Auth).');
lines.push('');
lines.push('### Modelo de autenticação das functions', '');
lines.push('- `verify_jwt` (padrão do gateway): exige JWT válido antes do handler. As', '  exceptions estão em `supabase/config.toml` (`verify_jwt = false`) — webhooks', '  de provedores e jobs internos.');
lines.push('- `JWT do usuário (RLS)` — `getUserClient(req)` valida o token e opera sob RLS.');
lines.push('- `segredo interno` — `isAuthorizedCronRequest`/`isInternalServiceRequest`:', '  Authorization service_role ou header `X-Cron-Secret` (jobs pg_cron).');
lines.push('- `assinatura do provedor` — verificação criptográfica no handler (Twilio,', '  Meta/Evolution, Resend/Svix, SendGrid).');
lines.push('- `nenhuma detectada no handler` — nenhum padrão conhecido encontrado;', '  confira a function antes de expor/chamar.');
lines.push('');
lines.push('## Edge functions', '');
lines.push(`Total: ${rows.length} functions.`, '');

const byDomain = new Map();
for (const r of rows) {
  if (!byDomain.has(r.domain)) byDomain.set(r.domain, []);
  byDomain.get(r.domain).push(r);
}
for (const [dom, list] of [...byDomain.entries()].sort()) {
  lines.push(`### ${dom} (${list.length})`, '');
  lines.push('| Function | Auth exigida | Método | Payload (campos principais) | Resposta |');
  lines.push('|----------|--------------|--------|------------------------------|----------|');
  for (const r of list) {
    lines.push(`| \`${r.name}\` | ${esc(r.auth)} | ${esc(r.method)} | ${esc(r.payload)} | ${esc(r.response)} |`);
  }
  lines.push('');
}

lines.push('## Rotas do frontend', '');
lines.push('Rotas declaradas em `src/routes/AppRoutes.tsx`. `autenticado` = dentro de', '`<ProtectedRoute>`; `admin`/`admin ou gestor` = guarda de papel adicional.', '');
lines.push('| Rota | Componente | Acesso |');
lines.push('|------|-----------|--------|');
for (const r of routes) lines.push(`| \`${r.path}\` | ${r.comp} | ${r.access} |`);
lines.push('');

lines.push('## RPCs (Postgres functions)', '');
lines.push('Functions SQL criadas nas migrations. "Uso no front" = chamada `.rpc()`', 'encontrada em `src/`; EXECUTE grants conforme `GRANT EXECUTE` nas migrations.', '');
lines.push('| RPC | Última definição | Grants | Uso no front |');
lines.push('|-----|------------------|--------|--------------|');
for (const [name, def] of [...rpcDefs.entries()].sort()) {
  const callers = rpcCalls.get(name);
  const uso = callers ? `${callers.size} arquivo(s)` : '—';
  const grants = def.grants.size ? [...def.grants].sort().join(', ') : '—';
  lines.push(`| \`${name}\` | ${def.file} | ${esc(grants)} | ${uso} |`);
}
lines.push('');
lines.push('### RPCs chamadas no front sem definição encontrada nas migrations', '');
const missing = [...rpcCalls.keys()].filter(n => !rpcDefs.has(n)).sort();
if (missing.length === 0) lines.push('Nenhuma.');
else for (const n of missing) lines.push(`- \`${n}\` — chamada em ${[...rpcCalls.get(n)].slice(0, 3).join(', ')}`);
lines.push('');

await import('node:fs').then(fs => fs.writeFileSync(OUT, lines.join('\n')));
console.log(`docs/API.md gerado: ${rows.length} functions, ${routes.length} rotas, ${rpcDefs.size} RPCs (${missing.length} chamadas sem definição).`);
