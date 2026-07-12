/**
 * Product Analytics — lightweight client-side tracker.
 *
 * Estratégia otimizada: mantém a sessão de página em memória e grava UMA
 * única linha no flush (saída/troca de rota). Isso substitui o antigo par
 * INSERT (na entrada) + UPDATE (no flush) por 1 INSERT final, cortando ~50%
 * das chamadas ao Postgres e eliminando por completo o UPDATE por id, que
 * também economiza WAL e pressão de autovacuum.
 *
 * Falhas são engolidas — analytics jamais deve quebrar o app.
 */
import { supabase } from "@/integrations/supabase/client";

// Session id estável por aba do navegador
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface PageSession {
  route: string;
  pageTitle: string;
  enteredAt: number;
  interactions: number;
  referrerRoute: string | null;
  flushed: boolean;
}

let currentPage: PageSession | null = null;
let salespersonId: string | null = null;

export function setAnalyticsSalesperson(id: string | null) {
  salespersonId = id;
}

function getDeviceType(): string {
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

/**
 * Chamado na troca de rota — faz flush da página anterior e inicia a nova.
 * NÃO grava mais no DB na entrada; apenas registra estado em memória.
 */
export async function trackPageEnter(
  route: string,
  pageTitle: string,
  referrer: string | null,
) {
  await flushCurrentPage();

  currentPage = {
    route,
    pageTitle,
    enteredAt: Date.now(),
    interactions: 0,
    referrerRoute: referrer,
    flushed: false,
  };
}

/**
 * Registra uma interação (clique, submit, etc.) na página corrente.
 */
export function trackInteraction() {
  if (currentPage) {
    currentPage.interactions += 1;
  }
}

/**
 * Grava a página corrente com duração + interações em UMA linha só.
 * Idempotente: chamadas repetidas não duplicam.
 */
export async function flushCurrentPage() {
  const page = currentPage;
  if (!page || page.flushed || !salespersonId) {
    currentPage = null;
    return;
  }

  page.flushed = true;
  const enteredAtIso = new Date(page.enteredAt).toISOString();
  const exitedAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.round((exitedAt.getTime() - page.enteredAt) / 1000),
  );

  // Descartar pings triviais (<1s sem interação) — reduz ruído e writes.
  const trivial = durationSeconds < 1 && page.interactions === 0;
  currentPage = null;
  if (trivial) return;

  try {
    await supabase.from("page_analytics").insert({
      salesperson_id: salespersonId,
      route: page.route,
      page_title: page.pageTitle,
      session_id: SESSION_ID,
      device_type: getDeviceType(),
      referrer_route: page.referrerRoute,
      entered_at: enteredAtIso,
      exited_at: exitedAt.toISOString(),
      duration_seconds: durationSeconds,
      interactions: page.interactions,
    });
  } catch {
    // Silent fail
  }
}

// Flush ao fechar a aba / sair para outra origem
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushCurrentPage();
    }
  });

  window.addEventListener("beforeunload", () => {
    flushCurrentPage();
  });
}
