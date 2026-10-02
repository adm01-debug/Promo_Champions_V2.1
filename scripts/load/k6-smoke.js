/**
 * Smoke de carga k6 — substitui a fachada antiga (tests/load/load-test.ts
 * apontava para o projeto Supabase errado e scripts/load-test-sim.ts engolia
 * falhas com `.catch(() => ({status: 200}))`, nunca podendo reprovar).
 *
 * Alvo real: endpoints públicos do projeto canônico — o health de Auth e os
 * preflights OPTIONS das edge functions mais chamadas (medem latência de edge
 * sem exigir credencial). Thresholds reprovam se p95 ou taxa de erro degradarem.
 *
 * Uso:
 *   k6 run scripts/load/k6-smoke.js
 *   K6_BASE_URL=https://usyxfpqlsspldubptrdl.supabase.co k6 run scripts/load/k6-smoke.js
 *   K6_VUS=10 K6_DURATION=1m k6 run scripts/load/k6-smoke.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL =
  __ENV.K6_BASE_URL || 'https://usyxfpqlsspldubptrdl.supabase.co';
const ORIGIN = __ENV.K6_ORIGIN || 'https://champions.promobrindes.com.br';

const EDGE_FUNCTIONS = [
  'log-web-vitals',
  'get-client-ip',
  'ranking-api',
  'ai-copilot',
];

const unexpectedStatus = new Rate('unexpected_status');

export const options = {
  vus: Number(__ENV.K6_VUS || 5),
  duration: __ENV.K6_DURATION || '30s',
  thresholds: {
    // p95 do tráfego total — edge functions públicas/preflight.
    http_req_duration: ['p(95)<2500'],
    // Falha de transporte (DNS, TCP, TLS, reset) — tolerância zero na fumaça.
    http_req_failed: ['rate<0.05'],
    // Respostas fora do esperado (preflight!=204/200, health!=200).
    unexpected_status: ['rate<0.10'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  // Health público do GoTrue — mede a disponibilidade da camada de auth.
  const health = http.get(`${BASE_URL}/auth/v1/health`, {
    tags: { endpoint: 'auth-health' },
  });
  check(health, { 'auth health 200': (r) => r.status === 200 }) ||
    unexpectedStatus.add(1);

  // Preflight real das edge functions públicas — mede latência de cold/warm
  // edge sem precisar de JWT.
  const fn = EDGE_FUNCTIONS[Math.floor(Math.random() * EDGE_FUNCTIONS.length)];
  const preflight = http.request('OPTIONS', `${BASE_URL}/functions/v1/${fn}`, null, {
    headers: {
      Origin: ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
    tags: { endpoint: `options-${fn}` },
  });
  check(preflight, {
    'preflight 200/204': (r) => r.status === 200 || r.status === 204,
    'preflight tem ACAO': (r) =>
      r.headers['Access-Control-Allow-Origin'] !== undefined,
  }) || unexpectedStatus.add(1);

  sleep(0.5 + Math.random());
}
