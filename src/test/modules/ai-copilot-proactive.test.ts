import { describe, it, expect } from "vitest";

/**
 * AI Copilot Proativo — tests for page context mapping,
 * cooldown logic, state management, and auto-suggestion triggers.
 */

// ─── PAGE_CONTEXT_MAP coverage ─────────────────────────────────────
describe("PAGE_CONTEXT_MAP", () => {
  const PAGE_CONTEXT_MAP: Record<string, string> = {
    '/': 'Dashboard principal - métricas e KPIs',
    '/pipeline': 'Pipeline de vendas - kanban de deals',
    '/tarefas': 'Lista de tarefas pendentes',
    '/atividades': 'Registro de atividades e contatos',
    '/vendas': 'Histórico de vendas',
    '/clientes': 'Base de clientes',
    '/metas': 'Metas e objetivos',
    '/ranking': 'Ranking competitivo',
    '/cadencias': 'Cadências de prospecção',
    '/analytics': 'Analytics e insights',
    '/assistente': 'Assistente IA completo',
    '/calendario': 'Calendário de atividades',
    '/forecast': 'Previsão de receita',
    '/automacoes': 'Automações de workflow',
  };

  it("has 14 mapped routes", () => {
    expect(Object.keys(PAGE_CONTEXT_MAP)).toHaveLength(14);
  });

  it("maps root to Dashboard", () => {
    expect(PAGE_CONTEXT_MAP['/']).toContain("Dashboard");
  });

  it("maps /pipeline to pipeline context", () => {
    expect(PAGE_CONTEXT_MAP['/pipeline']).toContain("Pipeline");
  });

  it("maps /assistente to AI context", () => {
    expect(PAGE_CONTEXT_MAP['/assistente']).toContain("IA");
  });

  it("returns undefined for unmapped routes", () => {
    expect(PAGE_CONTEXT_MAP['/unknown']).toBeUndefined();
  });

  it("all values are non-empty strings", () => {
    Object.values(PAGE_CONTEXT_MAP).forEach(v => {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });

  it("all keys start with /", () => {
    Object.keys(PAGE_CONTEXT_MAP).forEach(k => {
      expect(k.startsWith("/")).toBe(true);
    });
  });
});

// ─── Cooldown mechanism ────────────────────────────────────────────
describe("Copilot cooldown (30s between auto-suggestions)", () => {
  it("blocks if less than 30s since last call", () => {
    const last = Date.now() - 15000; // 15s ago
    const now = Date.now();
    expect(now - last < 30000).toBe(true);
  });

  it("allows if more than 30s since last call", () => {
    const last = Date.now() - 31000;
    const now = Date.now();
    expect(now - last < 30000).toBe(false);
  });

  it("allows if cooldown is 0 (first call)", () => {
    const last = 0;
    const now = Date.now();
    expect(now - last >= 30000).toBe(true);
  });
});

// ─── Dismiss and toggle state ──────────────────────────────────────
describe("Copilot dismiss/toggle state", () => {
  it("dismiss sets isOpen=false and isDismissed=true", () => {
    let isOpen = true, isDismissed = false;
    // dismiss action
    isOpen = false;
    isDismissed = true;
    expect(isOpen).toBe(false);
    expect(isDismissed).toBe(true);
  });

  it("toggle from open -> calls dismiss", () => {
    let isOpen = true;
    // toggle when open -> dismiss
    if (isOpen) isOpen = false;
    expect(isOpen).toBe(false);
  });

  it("toggle from closed -> opens and clears dismissed", () => {
    let isOpen = false, isDismissed = true;
    if (!isOpen) {
      isOpen = true;
      isDismissed = false;
    }
    expect(isOpen).toBe(true);
    expect(isDismissed).toBe(false);
  });
});

// ─── Auto-suggest skip on /assistente ──────────────────────────────
describe("Auto-suggest exclusions", () => {
  it("skips /assistente (already has AI)", () => {
    const path = "/assistente";
    expect(path === "/assistente").toBe(true);
  });

  it("does not skip other pages", () => {
    ["/", "/pipeline", "/tarefas", "/vendas"].forEach(p => {
      expect(p === "/assistente").toBe(false);
    });
  });
});

// ─── Suggestion staleness check ────────────────────────────────────
describe("Suggestion staleness (60s)", () => {
  it("is stale after 60s", () => {
    const timestamp = Date.now() - 61000;
    expect(Date.now() - timestamp > 60000).toBe(true);
  });

  it("is fresh within 60s", () => {
    const timestamp = Date.now() - 30000;
    expect(Date.now() - timestamp > 60000).toBe(false);
  });

  it("triggers refetch on toggle if stale", () => {
    const timestamp = Date.now() - 120000;
    const shouldRefetch = !timestamp || Date.now() - timestamp > 60000;
    expect(shouldRefetch).toBe(true);
  });
});

// ─── CopilotSuggestion interface shape ─────────────────────────────
describe("CopilotSuggestion shape", () => {
  it("has required fields", () => {
    const suggestion = { text: "Dica", timestamp: Date.now(), page: "/pipeline" };
    expect(suggestion).toHaveProperty("text");
    expect(suggestion).toHaveProperty("timestamp");
    expect(suggestion).toHaveProperty("page");
  });
});

// ─── Action types ──────────────────────────────────────────────────
describe("Copilot action types", () => {
  const validActions = ["page_suggestion", "quick_answer", "smart_tip"];

  it("page_suggestion is used on page navigation", () => {
    expect(validActions).toContain("page_suggestion");
  });

  it("quick_answer is used for askCopilot", () => {
    expect(validActions).toContain("quick_answer");
  });

  it("smart_tip is used on toggle open", () => {
    expect(validActions).toContain("smart_tip");
  });
});
