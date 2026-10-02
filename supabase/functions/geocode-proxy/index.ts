// geocode-proxy — geocodificação autenticada com cache em Postgres.
//
// Substitui o acesso direto do frontend ao Nominatim público, que:
//  • expunha dados de clientes (nome da empresa/endereço) a terceiros a
//    partir do navegador de cada usuário;
//  • não tinha rate limit nem cache;
//  • exigia nominatim.openstreetmap.org no connect-src da CSP.
//
// Entrada (JSON POST):
//   { "cep": "01310100" }                    — CEP brasileiro (8 dígitos)
//   { "city": "São Paulo", "uf": "SP" }      — cidade + UF
//   { "query": "termo livre" }               — consulta grossa; rejeita
//                                              CNPJ/CPF/logradouro+número
//
// Não aceita endereço completo (rua+número) nem identificadores como
// CNPJ/CPF — retorna 400 `address_too_granular` nesses casos.

import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { getUserClient, UnauthorizedError } from "../_shared/auth-client.ts";
import { getServiceClient } from "../_shared/auth-client.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { validateString, collectErrors } from "../_shared/validation.ts";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
// TTLs: acertos valem 90 dias; misses 14 (evita martelar provider em
// consultas irrecuperáveis como nomes de empresa).
const HIT_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 14 * 24 * 60 * 60 * 1000;

// Padrões que indicam dado granular/identificável — nunca vai ao provider.
const CNPJ_RE = /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/;
const CPF_RE = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/;
const STREET_RE =
  /\b(rua|r\.|av\.?|avenida|alameda|al\.?|travessa|rodovia|estrada|praça|largo)\b.{0,60}\b(n[º°o.]?\s*\d+|\d{1,5}\s*[-,])/i;
const HOUSE_NUMBER_RE = /,\s*\d{1,5}\b/;

interface GeocodeResult {
  lat: number;
  lng: number;
}

function normalizeKey(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 200);
}

function buildQuery(body: Record<string, unknown>): { query?: string; error?: string } {
  // Forma/limite dos campos via validador compartilhado; as regras de
  // negócio abaixo (granularidade, dígitos do CEP, city+uf em par) ficam.
  const shapeErrors = collectErrors([
    validateString(body.cep, "cep", { maxLength: 20 }),
    validateString(body.city, "city", { maxLength: 120 }),
    validateString(body.uf, "uf", { maxLength: 2 }),
    validateString(body.query, "query", { maxLength: 160 }),
  ]);
  if (shapeErrors.length > 0) return { error: "invalid_input" };

  const cep = typeof body.cep === "string" ? body.cep.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const uf = typeof body.uf === "string" ? body.uf.trim() : "";
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (cep) {
    const digits = cep.replace(/\D/g, "");
    if (!/^\d{8}$/.test(digits)) return { error: "cep_invalid" };
    return { query: `${digits.slice(0, 5)}-${digits.slice(5)}, Brasil` };
  }
  if (city || uf) {
    if (!city || !uf) return { error: "city_and_uf_required" };
    if (city.length > 120 || uf.length > 2) return { error: "invalid_city_or_uf" };
    return { query: `${city}, ${uf.toUpperCase()}, Brasil` };
  }
  if (query) {
    if (query.length > 160) return { error: "query_too_long" };
    if (CNPJ_RE.test(query) || CPF_RE.test(query) || STREET_RE.test(query) ||
      HOUSE_NUMBER_RE.test(query)) {
      return { error: "address_too_granular" };
    }
    return { query };
  }
  return { error: "missing_query" };
}

Deno.serve(withRequestId("geocode-proxy", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, corsHeaders);
  }

  try {
    let userId: string;
    try {
      const ctx = await getUserClient(req);
      userId = ctx.userId;
    } catch (authErr) {
      const isUnauth = authErr instanceof UnauthorizedError;
      return json(
        { error: isUnauth ? authErr.message : "unauthorized" },
        401,
        corsHeaders,
      );
    }

    const limited = enforceRateLimit(req, {
      name: "geocode-proxy",
      limit: 30,
      windowSeconds: 60,
      key: `user:${userId}`,
    });
    if (limited) return limited;

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { query, error } = buildQuery(body);
    if (!query) return json({ error: error ?? "missing_query" }, 400, corsHeaders);

    const key = normalizeKey(query);
    const admin = getServiceClient(
      "geocode_cache requer escrita/leitura sem RLS do usuário final",
    );

    const { data: cached } = await admin
      .from("geocode_cache")
      .select("lat, lng, found, created_at")
      .eq("query_key", key)
      .maybeSingle();

    if (cached) {
      const age = Date.now() - new Date(cached.created_at as string).getTime();
      const ttl = cached.found ? HIT_TTL_MS : MISS_TTL_MS;
      if (age < ttl) {
        return json(
          cached.found ? { lat: cached.lat, lng: cached.lng, cached: true } : { found: false, cached: true },
          200,
          corsHeaders,
        );
      }
    }

    const upstream = await fetchWithTimeout(
      `${NOMINATIM_URL}?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "PromoChampions-geocode-proxy/1.0" } },
    );
    if (!upstream.ok) {
      console.error("[geocode-proxy] upstream error", upstream.status);
      return json({ error: "geocoder_unavailable" }, 502, corsHeaders);
    }

    const arr = (await upstream.json()) as Array<{ lat: string; lon: string }>;
    const hit = Array.isArray(arr) && arr.length > 0;
    const result: GeocodeResult | null = hit
      ? { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) }
      : null;

    await admin.from("geocode_cache").upsert({
      query_key: key,
      lat: result?.lat ?? null,
      lng: result?.lng ?? null,
      found: hit,
      provider: "nominatim",
      created_at: new Date().toISOString(),
    });

    return json(result ? { ...result, cached: false } : { found: false, cached: false }, 200, corsHeaders);
  } catch (e) {
    console.error("[geocode-proxy] fatal:", e);
    return json({ error: e instanceof Error ? e.message : "internal_error" }, 500, corsHeaders);
  }
}));

function json(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
