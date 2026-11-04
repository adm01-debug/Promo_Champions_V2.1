#!/usr/bin/env node
/**
 * Inventario do banco oficial -> inventario/estado/banco.json (fonte de consulta dos agentes).
 *
 * Tudo sai de comando: o SQL de leitura `scripts/inventario/banco.sql`, a lista de edge
 * functions publicadas e o uso de cada tabela no codigo (`.from('tabela')` em src/ e
 * supabase/functions/). Nada escrito a mao. Mesmo padrao do Zapp_Web_V2 e do Promo_Gifts_V4.
 *
 * Dois jeitos de rodar:
 *   1) Com token (CI semanal / maquina com acesso):
 *        SUPABASE_ACCESS_TOKEN=... node scripts/inventario/gerar-banco.mjs
 *      Le pela Management API: POST /database/query/read-only (transacao so leitura) e
 *      GET /functions. Projeto fixo: usyxfpqlsspldubptrdl (SUPABASE_PROJECT_REF so troca
 *      para teste; qualquer outro valor exige INVENTARIO_PERMITIR_OUTRO_PROJETO=1).
 *   2) Sessao de agente sem token: rodar banco.sql no MCP oficial (gateway
 *      supabase-promo-champions-v2-mcp, rotulo "...LOVABLE CLOUD - PROMO CHAMPIONS V2", db_query),
 *      salvar a resposta num arquivo e
 *        node scripts/inventario/gerar-banco.mjs --entrada /caminho/resposta.json
 *      Aceita a resposta crua do MCP ({"rows":[{"inventario":{...}}]}) ou o objeto direto.
 *      Sem token, as edges publicadas ficam ausentes (a API nao expoe lista sem token).
 */
import fs from "fs";
import path from "path";
import { fetchWithRetry } from "./utils/fetch-retry.mjs";

const PROJECT_REF = "usyxfpqlsspldubptrdl";
const API_BASE = `https://api.supabase.io/v1/projects/${PROJECT_REF}`;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const OUTPUT = path.resolve("inventario/estado/banco.json");

// Protege contra ropar outro projeto por engano
if (
  PROJECT_REF !== "usyxfpqlsspldubptrdl" &&
  !process.env.INVENTARIO_PERMITIR_OUTRO_PROJETO
) {
  console.error(
    `[gerar-banco] PROJETO INESPERADO: ${PROJECT_REF}. ` +
      `Defina INVENTARIO_PERMITIR_OUTRO_PROJETO=1 se intencional.`
  );
  process.exit(1);
}

// --- Utilitarios de leitura ---

export async function fetchBancoData() {
  if (!TOKEN) throw new Error("SUPABASE_ACCESS_TOKEN nao definido");
  const [queryRes, edgeRes] = await Promise.all([
    fetchQuery(),
    fetchEdgeFunctions(),
  ]);
  return mergeEdges(queryRes, edgeRes);
}

async function fetchQuery() {
  const sqlFile = path.resolve("scripts/inventario/banco.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");
  const res = await fetchWithRetry(
    `${API_BASE}/database/query/read-only`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fetchQuery ${res.status}: ${err}`);
  }
  return res.json();
}

async function fetchEdgeFunctions() {
  if (!TOKEN) return [];
  const res = await fetchWithRetry(`${API_BASE}/functions`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.warn(`[gerar-banco] edges: ${res.status} - sem lista`);
    return [];
  }
  return res.json();
}

// --- Montagem do relatorio ---

export function mergeEdges(queryRes, edges) {
  const raw =
    Array.isArray(queryRes)
      ? queryRes
      : Array.isArray(queryRes?.rows)
        ? queryRes.rows
        : [];
  const row = raw[0] ?? {};
  const inv = row.inventario ?? row;

  const publicadas = (Array.isArray(edges) ? edges : []).map((e) =>
    typeof e === "string" ? e : (e.name ?? e.slug ?? String(e))
  );
  if (publicadas.length) {
    inv.edge_functions = { ...(inv.edge_functions ?? {}), publicadas };
  }
  return inv;
}

export function contarUsoNoCodigo(raiz, nomes) {
  const uso = Object.fromEntries(nomes.map((n) => [n, { src: 0, edges: 0 }]));
  const reFrom = /(\bstorage\s*)?\.from\(\s*['"`]([A-Za-z0-9_]+)['"`]/g;
  const reRest = /\/rest\/v1\/([A-Za-z0-9_]+)/g;
  for (const pasta of PASTAS_CODIGO) {
    if (!fs.existsSync(path.resolve(raiz, pasta))) continue;
    for (const arquivo of recursiveFiles(path.resolve(raiz, pasta))) {
      if (!/\.(ts|tsx|js|jsx)$/.test(arquivo)) continue;
      const text = fs.readFileSync(arquivo, "utf8");
      let m;
      while ((m = reFrom.exec(text)) !== null) {
        const tab = m[2];
        if (!uso[tab]) continue;
        if (arquivo.includes("supabase/functions")) uso[tab].edges++;
        else uso[tab].src++;
      }
      while ((m = reRest.exec(text)) !== null) {
        const tab = m[1];
        if (!uso[tab]) continue;
        if (arquivo.includes("supabase/functions")) uso[tab].edges++;
        else uso[tab].src++;
      }
    }
  }
  return uso;
}

const PASTAS_CODIGO = ["src", "supabase/functions"];

function recursiveFiles(dir) {
  let result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) result = result.concat(recursiveFiles(p));
    else result.push(p);
  }
  return result;
}

// --- Entrada manual (modo sem token) ---

export function lerEntradaManual(filePath) {
  const conteudo = fs.readFileSync(filePath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(conteudo);
  } catch {
    throw new Error(`[gerar-banco] Entrada nao e JSON valido: ${filePath}`);
  }
  // Aceita resposta crua do MCP ou o objeto direto
  if (Array.isArray(parsed?.rows)) {
    return mergeEdges(parsed, []);
  }
  return mergeEdges(parsed, []);
}

// --- Entrypoint ---

if (process.argv[1] && process.argv[1].endsWith("gerar-banco.mjs")) {
  main();
}

async function main() {
  const idxEntrada = process.argv.indexOf("--entrada");
  let inv;
  if (idxEntrada >= 0) {
    const filePath = process.argv[idxEntrada + 1];
    if (!filePath) {
      console.error("[gerar-banco] --entrada exige um caminho de arquivo");
      process.exit(1);
    }
    inv = lerEntradaManual(filePath);
  } else {
    if (!TOKEN) {
      console.error(
        "[gerar-banco] SUPABASE_ACCESS_TOKEN nao definido. " +
          "Use --entrada <arquivo> para modo sem token."
      );
      process.exit(1);
    }
    inv = await fetchBancoData();
  }

  // Enriquece com uso no codigo
  const tabelas = Object.keys(inv.tabelas ?? {});
  if (tabelas.length > 0) {
    const raiz = process.cwd();
    const uso = contarUsoNoCodigo(raiz, tabelas);
    for (const [nome, contagem] of Object.entries(uso)) {
      if (inv.tabelas[nome]) {
        inv.tabelas[nome].uso_codigo = contagem;
      }
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(inv, null, 2) + "\n");
  console.log(`[gerar-banco] salvo: ${OUTPUT}`);
  
  if (inv.alertas?.length) {
    console.warn(
      `[gerar-banco] ${inv.alertas.length} alerta(s):\n${inv.alertas.map((a) => `  ${a}`).join("\n")}`
    );
    process.exit(2);
  }
}
