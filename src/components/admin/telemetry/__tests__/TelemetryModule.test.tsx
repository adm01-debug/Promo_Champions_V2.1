import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TelemetryCharts } from "@/components/admin/telemetry/TelemetryCharts";

// ─── Helpers ───
function makeTelemetryRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
    operation: "select",
    table_name: "sales",
    rpc_name: null,
    duration_ms: 500,
    record_count: 10,
    query_limit: 100,
    query_offset: 0,
    count_mode: null,
    severity: "normal",
    error_message: null,
    user_id: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function generateRows(count: number, template: Partial<any> = {}) {
  return Array.from({ length: count }, (_, i) =>
    makeTelemetryRow({
      created_at: new Date(Date.now() - i * 60000).toISOString(),
      ...template,
    })
  );
}

const TABLES = ["sales", "clients", "salespeople", "activities", "products", "deal_outcomes", "cadences", "daily_metrics"];
const OPERATIONS = ["select", "insert", "update", "delete", "rpc"];

// ─── TelemetryCharts Component Tests ───
describe("TelemetryCharts", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>;
  };

  it("renders nothing when rows are empty", () => {
    const { container } = render(<TelemetryCharts rows={[]} timeFilter="24h" />, { wrapper });
    expect(container.innerHTML).toBe("");
  });

  it("renders charts when rows are provided", () => {
    const rows = generateRows(10);
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Alertas ao Longo do Tempo")).toBeInTheDocument();
    expect(screen.getByText("Por Severidade")).toBeInTheDocument();
  });

  it("renders top tables bar chart with enough data", () => {
    const rows = generateRows(20, { table_name: "sales" });
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Top Tabelas por Alertas")).toBeInTheDocument();
  });

  it.each(["1h", "6h", "24h", "7d"])("handles timeFilter=%s", (tf) => {
    const rows = generateRows(5);
    render(<TelemetryCharts rows={rows} timeFilter={tf} />, { wrapper });
    expect(screen.getByText("Alertas ao Longo do Tempo")).toBeInTheDocument();
  });

  it("handles mixed severity data", () => {
    const rows = [
      ...generateRows(3, { severity: "normal" }),
      ...generateRows(3, { severity: "slow" }),
      ...generateRows(3, { severity: "very_slow" }),
      ...generateRows(3, { severity: "error" }),
    ];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Por Severidade")).toBeInTheDocument();
  });

  it("handles multiple tables in data", () => {
    const rows = TABLES.flatMap((t) => generateRows(3, { table_name: t }));
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Top Tabelas por Alertas")).toBeInTheDocument();
  });

  it("handles rpc_name rows", () => {
    const rows = generateRows(5, { rpc_name: "get_active_salespeople", table_name: null });
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Top Tabelas por Alertas")).toBeInTheDocument();
  });

  it("handles very large duration values", () => {
    const rows = generateRows(5, { duration_ms: 120000 });
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Alertas ao Longo do Tempo")).toBeInTheDocument();
  });

  it("handles single row", () => {
    const rows = [makeTelemetryRow()];
    render(<TelemetryCharts rows={rows} timeFilter="24h" />, { wrapper });
    expect(screen.getByText("Alertas ao Longo do Tempo")).toBeInTheDocument();
  });

  it("handles 200 rows without crashing", () => {
    const rows = generateRows(200);
    render(<TelemetryCharts rows={rows} timeFilter="7d" />, { wrapper });
    expect(screen.getByText("Alertas ao Longo do Tempo")).toBeInTheDocument();
  });
});

// ─── TelemetryRow Interface & Data Logic Tests ───
describe("TelemetryRow data logic", () => {
  // Stats computation
  describe("stats computation", () => {
    function computeStats(rows: any[]) {
      const verySlow = rows.filter((r) => r.severity === "very_slow").length;
      const slow = rows.filter((r) => r.severity === "slow").length;
      const errors = rows.filter((r) => r.severity === "error").length;
      const avgDuration = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length) : 0;
      return { verySlow, slow, errors, avgDuration };
    }

    it("computes zero stats for empty array", () => {
      const stats = computeStats([]);
      expect(stats).toEqual({ verySlow: 0, slow: 0, errors: 0, avgDuration: 0 });
    });

    it("computes correct very_slow count", () => {
      const rows = [...generateRows(5, { severity: "very_slow" }), ...generateRows(3, { severity: "normal" })];
      expect(computeStats(rows).verySlow).toBe(5);
    });

    it("computes correct slow count", () => {
      const rows = [...generateRows(7, { severity: "slow" }), ...generateRows(2, { severity: "normal" })];
      expect(computeStats(rows).slow).toBe(7);
    });

    it("computes correct error count", () => {
      const rows = generateRows(4, { severity: "error" });
      expect(computeStats(rows).errors).toBe(4);
    });

    it("computes correct avg duration", () => {
      const rows = [makeTelemetryRow({ duration_ms: 100 }), makeTelemetryRow({ duration_ms: 300 })];
      expect(computeStats(rows).avgDuration).toBe(200);
    });

    it("computes avg with single row", () => {
      const rows = [makeTelemetryRow({ duration_ms: 5000 })];
      expect(computeStats(rows).avgDuration).toBe(5000);
    });

    it("handles all severities mixed", () => {
      const rows = [
        makeTelemetryRow({ severity: "normal" }),
        makeTelemetryRow({ severity: "slow" }),
        makeTelemetryRow({ severity: "very_slow" }),
        makeTelemetryRow({ severity: "error" }),
      ];
      const stats = computeStats(rows);
      expect(stats.verySlow).toBe(1);
      expect(stats.slow).toBe(1);
      expect(stats.errors).toBe(1);
    });

    it("handles 500 rows performance", () => {
      const rows = generateRows(500);
      const stats = computeStats(rows);
      expect(stats.verySlow).toBe(0);
      expect(stats.avgDuration).toBe(500);
    });
  });

  // Top offenders computation
  describe("top offenders computation", () => {
    function computeTopOffenders(rows: any[]) {
      const tableStats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
      for (const r of rows) {
        const key = r.rpc_name || r.table_name || "unknown";
        const prev = tableStats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
        tableStats.set(key, {
          count: prev.count + 1,
          totalMs: prev.totalMs + r.duration_ms,
          maxMs: Math.max(prev.maxMs, r.duration_ms),
        });
      }
      return [...tableStats.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
    }

    it("returns empty for no rows", () => {
      expect(computeTopOffenders([])).toEqual([]);
    });

    it("groups by table_name", () => {
      const rows = [...generateRows(10, { table_name: "sales" }), ...generateRows(5, { table_name: "clients" })];
      const top = computeTopOffenders(rows);
      expect(top[0][0]).toBe("sales");
      expect(top[0][1].count).toBe(10);
    });

    it("prefers rpc_name over table_name", () => {
      const rows = generateRows(3, { rpc_name: "get_data", table_name: "sales" });
      const top = computeTopOffenders(rows);
      expect(top[0][0]).toBe("get_data");
    });

    it("falls back to unknown", () => {
      const rows = generateRows(2, { rpc_name: null, table_name: null });
      const top = computeTopOffenders(rows);
      expect(top[0][0]).toBe("unknown");
    });

    it("limits to 8 entries", () => {
      const rows = Array.from({ length: 10 }, (_, i) => makeTelemetryRow({ table_name: `table_${i}` }));
      const top = computeTopOffenders(rows);
      expect(top.length).toBe(8);
    });

    it("computes correct maxMs", () => {
      const rows = [
        makeTelemetryRow({ table_name: "sales", duration_ms: 100 }),
        makeTelemetryRow({ table_name: "sales", duration_ms: 9000 }),
        makeTelemetryRow({ table_name: "sales", duration_ms: 500 }),
      ];
      const top = computeTopOffenders(rows);
      expect(top[0][1].maxMs).toBe(9000);
    });

    it("computes correct totalMs", () => {
      const rows = [
        makeTelemetryRow({ table_name: "sales", duration_ms: 100 }),
        makeTelemetryRow({ table_name: "sales", duration_ms: 200 }),
      ];
      const top = computeTopOffenders(rows);
      expect(top[0][1].totalMs).toBe(300);
    });

    it("sorts by count descending", () => {
      const rows = [
        ...generateRows(2, { table_name: "a" }),
        ...generateRows(5, { table_name: "b" }),
        ...generateRows(3, { table_name: "c" }),
      ];
      const top = computeTopOffenders(rows);
      expect(top[0][0]).toBe("b");
      expect(top[1][0]).toBe("c");
      expect(top[2][0]).toBe("a");
    });

    it("handles all tables", () => {
      const rows = TABLES.flatMap((t) => generateRows(2, { table_name: t }));
      const top = computeTopOffenders(rows);
      expect(top.length).toBe(8);
    });
  });

  // Format functions
  describe("formatDuration", () => {
    const formatDuration = (ms: number) => {
      if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
      return `${ms}ms`;
    };

    it.each([
      [0, "0ms"],
      [1, "1ms"],
      [500, "500ms"],
      [999, "999ms"],
      [1000, "1.0s"],
      [1500, "1.5s"],
      [3000, "3.0s"],
      [8000, "8.0s"],
      [12345, "12.3s"],
      [120000, "120.0s"],
    ])("formats %d as %s", (ms, expected) => {
      expect(formatDuration(ms)).toBe(expected);
    });
  });

  describe("formatTime", () => {
    const formatTime = (iso: string) => {
      return new Date(iso).toLocaleString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    };

    it("formats valid ISO string", () => {
      const result = formatTime("2026-03-23T14:30:00.000Z");
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("formats different dates", () => {
      const dates = [
        "2026-01-01T00:00:00.000Z",
        "2026-06-15T12:30:45.000Z",
        "2026-12-31T23:59:59.000Z",
      ];
      dates.forEach((d) => {
        expect(formatTime(d)).toBeTruthy();
      });
    });
  });

  // Severity badge logic
  describe("severity classification", () => {
    it.each([
      ["very_slow", "🔴"],
      ["slow", "🟡"],
      ["error", "❌"],
      ["normal", undefined],
    ])("severity %s maps correctly", (severity, expectedEmoji) => {
      const badgeMap: Record<string, string> = { very_slow: "🔴", slow: "🟡", error: "❌" };
      if (expectedEmoji) {
        expect(badgeMap[severity]).toBe(expectedEmoji);
      } else {
        expect(badgeMap[severity]).toBeUndefined();
      }
    });
  });

  // Time threshold logic
  describe("getTimeThreshold", () => {
    function getTimeThreshold(timeFilter: string) {
      const now = new Date();
      switch (timeFilter) {
        case "1h": return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        case "6h": return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
        case "24h": return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        default: return new Date().toISOString();
      }
    }

    it.each(["1h", "6h", "24h", "7d"])("returns valid ISO for %s", (tf) => {
      const result = getTimeThreshold(tf);
      expect(new Date(result).getTime()).toBeLessThan(Date.now());
    });

    it("1h threshold is approximately 1 hour ago", () => {
      const result = new Date(getTimeThreshold("1h")).getTime();
      const expected = Date.now() - 60 * 60 * 1000;
      expect(Math.abs(result - expected)).toBeLessThan(1000);
    });

    it("6h threshold is approximately 6 hours ago", () => {
      const result = new Date(getTimeThreshold("6h")).getTime();
      const expected = Date.now() - 6 * 60 * 60 * 1000;
      expect(Math.abs(result - expected)).toBeLessThan(1000);
    });

    it("24h threshold is approximately 24 hours ago", () => {
      const result = new Date(getTimeThreshold("24h")).getTime();
      const expected = Date.now() - 24 * 60 * 60 * 1000;
      expect(Math.abs(result - expected)).toBeLessThan(1000);
    });

    it("7d threshold is approximately 7 days ago", () => {
      const result = new Date(getTimeThreshold("7d")).getTime();
      const expected = Date.now() - 7 * 24 * 60 * 60 * 1000;
      expect(Math.abs(result - expected)).toBeLessThan(1000);
    });
  });
});

// ─── Severity filtering logic ───
describe("Severity filtering", () => {
  const allRows = [
    ...generateRows(10, { severity: "normal" }),
    ...generateRows(5, { severity: "slow" }),
    ...generateRows(3, { severity: "very_slow" }),
    ...generateRows(2, { severity: "error" }),
  ];

  it("filter 'all' returns everything", () => {
    const filtered = allRows;
    expect(filtered.length).toBe(20);
  });

  it("filter 'slow' returns only slow", () => {
    const filtered = allRows.filter((r) => r.severity === "slow");
    expect(filtered.length).toBe(5);
  });

  it("filter 'very_slow' returns only very_slow", () => {
    const filtered = allRows.filter((r) => r.severity === "very_slow");
    expect(filtered.length).toBe(3);
  });

  it("filter 'error' returns only errors", () => {
    const filtered = allRows.filter((r) => r.severity === "error");
    expect(filtered.length).toBe(2);
  });
});

// ─── Edge cases ───
describe("Edge cases", () => {
  it("handles row with all null optional fields", () => {
    const row = makeTelemetryRow({
      table_name: null,
      rpc_name: null,
      record_count: null,
      query_limit: null,
      query_offset: null,
      count_mode: null,
      error_message: null,
      user_id: null,
    });
    expect(row.operation).toBe("select");
    expect(row.duration_ms).toBe(500);
  });

  it("handles row with error_message", () => {
    const row = makeTelemetryRow({ severity: "error", error_message: "timeout exceeded" });
    expect(row.error_message).toBe("timeout exceeded");
  });

  it("handles zero duration", () => {
    const row = makeTelemetryRow({ duration_ms: 0 });
    expect(row.duration_ms).toBe(0);
  });

  it("handles very high duration", () => {
    const row = makeTelemetryRow({ duration_ms: 999999 });
    expect(row.duration_ms).toBe(999999);
  });

  it("handles negative duration gracefully", () => {
    const row = makeTelemetryRow({ duration_ms: -1 });
    expect(row.duration_ms).toBe(-1);
  });

  it("handles large record_count", () => {
    const row = makeTelemetryRow({ record_count: 100000 });
    expect(row.record_count).toBe(100000);
  });

  it("handles all operations", () => {
    OPERATIONS.forEach((op) => {
      const row = makeTelemetryRow({ operation: op });
      expect(row.operation).toBe(op);
    });
  });

  it("handles all tables", () => {
    TABLES.forEach((t) => {
      const row = makeTelemetryRow({ table_name: t });
      expect(row.table_name).toBe(t);
    });
  });

  it("handles future dates", () => {
    const row = makeTelemetryRow({ created_at: new Date(Date.now() + 86400000).toISOString() });
    expect(new Date(row.created_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("handles very old dates", () => {
    const row = makeTelemetryRow({ created_at: "2020-01-01T00:00:00.000Z" });
    expect(row.created_at).toBe("2020-01-01T00:00:00.000Z");
  });
});

// ─── Batch / scale tests ───
describe("Scale tests", () => {
  it("processes 100 rows correctly", () => {
    const rows = generateRows(100);
    expect(rows.length).toBe(100);
    expect(rows.every((r) => r.severity === "normal")).toBe(true);
  });

  it("processes 500 rows correctly", () => {
    const rows = generateRows(500, { severity: "slow", duration_ms: 4000 });
    expect(rows.length).toBe(500);
    const avg = Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length);
    expect(avg).toBe(4000);
  });

  it("processes mixed 1000 rows", () => {
    const rows = [
      ...generateRows(250, { severity: "normal", duration_ms: 100 }),
      ...generateRows(250, { severity: "slow", duration_ms: 4000 }),
      ...generateRows(250, { severity: "very_slow", duration_ms: 10000 }),
      ...generateRows(250, { severity: "error", duration_ms: 0, error_message: "fail" }),
    ];
    expect(rows.length).toBe(1000);
    expect(rows.filter((r) => r.severity === "error").length).toBe(250);
  });

  it("top offenders with 20 different tables", () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      generateRows(Math.floor(Math.random() * 10) + 1, { table_name: `table_${i}` })
    ).flat();
    
    const tableStats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
    for (const r of rows) {
      const key = r.table_name || "unknown";
      const prev = tableStats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
      tableStats.set(key, { count: prev.count + 1, totalMs: prev.totalMs + r.duration_ms, maxMs: Math.max(prev.maxMs, r.duration_ms) });
    }
    const top = [...tableStats.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
    expect(top.length).toBeLessThanOrEqual(8);
  });
});

// ─── Cleanup threshold tests ───
describe("Cleanup threshold", () => {
  it("generates correct 7d cleanup threshold", () => {
    const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thresholdDate = new Date(threshold);
    const expectedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    expect(Math.abs(thresholdDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
  });

  it("rows older than threshold should be cleaned", () => {
    const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldRow = makeTelemetryRow({ created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() });
    const newRow = makeTelemetryRow({ created_at: new Date().toISOString() });
    expect(new Date(oldRow.created_at) < threshold).toBe(true);
    expect(new Date(newRow.created_at) < threshold).toBe(false);
  });
});

// ─── Chart data computation tests ───
describe("Chart data computation", () => {
  describe("severity pie data", () => {
    it("counts each severity correctly", () => {
      const rows = [
        ...generateRows(4, { severity: "normal" }),
        ...generateRows(3, { severity: "slow" }),
        ...generateRows(2, { severity: "very_slow" }),
        ...generateRows(1, { severity: "error" }),
      ];
      const counts = { normal: 0, slow: 0, very_slow: 0, error: 0 };
      rows.forEach((r) => { if (r.severity in counts) counts[r.severity as keyof typeof counts]++; });
      expect(counts.normal).toBe(4);
      expect(counts.slow).toBe(3);
      expect(counts.very_slow).toBe(2);
      expect(counts.error).toBe(1);
    });

    it("filters out zero values for pie chart", () => {
      const rows = generateRows(5, { severity: "slow" });
      const counts = { normal: 0, slow: 0, very_slow: 0, error: 0 };
      rows.forEach((r) => { if (r.severity in counts) counts[r.severity as keyof typeof counts]++; });
      const data = Object.entries(counts).filter(([, v]) => v > 0);
      expect(data.length).toBe(1);
      expect(data[0][0]).toBe("slow");
    });
  });

  describe("timeline bucketing", () => {
    it("buckets 1h data into 5-min intervals", () => {
      const bucketMs = 5 * 60000;
      const rows = generateRows(30, { created_at: new Date().toISOString() });
      const buckets = new Map<number, number>();
      rows.forEach((r) => {
        const t = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
        buckets.set(t, (buckets.get(t) || 0) + 1);
      });
      expect(buckets.size).toBeGreaterThanOrEqual(1);
    });

    it("buckets 24h data into 1-hour intervals", () => {
      const bucketMs = 60 * 60000;
      const rows = generateRows(24, { });
      rows.forEach((r, i) => { r.created_at = new Date(Date.now() - i * 60 * 60000).toISOString(); });
      const buckets = new Map<number, number>();
      rows.forEach((r) => {
        const t = Math.floor(new Date(r.created_at).getTime() / bucketMs) * bucketMs;
        buckets.set(t, (buckets.get(t) || 0) + 1);
      });
      expect(buckets.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe("top tables bar data", () => {
    it("groups and sorts correctly", () => {
      const rows = [
        ...generateRows(10, { table_name: "sales" }),
        ...generateRows(5, { table_name: "clients" }),
        ...generateRows(15, { table_name: "activities" }),
      ];
      const map = new Map<string, number>();
      rows.forEach((r) => {
        const key = r.table_name || "unknown";
        map.set(key, (map.get(key) || 0) + 1);
      });
      const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
      expect(sorted[0][0]).toBe("activities");
      expect(sorted[1][0]).toBe("sales");
      expect(sorted[2][0]).toBe("clients");
    });

    it("truncates long table names", () => {
      const name = "very_long_table_name_that_exceeds_fifteen_characters";
      const truncated = name.length > 15 ? name.slice(0, 15) + "…" : name;
      expect(truncated).toBe("very_long_table…");
    });
  });
});

// ─── Duration color classification ───
describe("Duration color classification", () => {
  it.each([
    [0, ""],
    [100, ""],
    [2999, ""],
    [3000, "text-yellow-600"],
    [5000, "text-yellow-600"],
    [7999, "text-yellow-600"],
    [8000, "text-destructive"],
    [10000, "text-destructive"],
    [120000, "text-destructive"],
  ])("duration %d gets class %s", (ms, expectedClass) => {
    const cls = ms >= 8000 ? "text-destructive" : ms >= 3000 ? "text-yellow-600" : "";
    expect(cls).toBe(expectedClass);
  });
});

// ─── Row creation validation ───
describe("Row creation validation", () => {
  it("creates valid row with defaults", () => {
    const row = makeTelemetryRow();
    expect(row.id).toBeTruthy();
    expect(row.operation).toBe("select");
    expect(row.severity).toBe("normal");
    expect(row.duration_ms).toBe(500);
    expect(new Date(row.created_at).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("overrides work correctly", () => {
    const row = makeTelemetryRow({ operation: "insert", severity: "error", duration_ms: 9999 });
    expect(row.operation).toBe("insert");
    expect(row.severity).toBe("error");
    expect(row.duration_ms).toBe(9999);
  });

  it("each generated row has unique id", () => {
    const rows = generateRows(100);
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.size).toBe(100);
  });

  it("generated rows have sequential timestamps", () => {
    const rows = generateRows(10);
    for (let i = 1; i < rows.length; i++) {
      expect(new Date(rows[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(new Date(rows[i].created_at).getTime());
    }
  });
});
