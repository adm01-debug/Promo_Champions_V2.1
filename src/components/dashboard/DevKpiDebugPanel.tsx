/**
 * Dev-only debug panel for the dashboard.
 *
 * Renders ONLY in `import.meta.env.DEV`. Shows:
 *  - Auth status (signed_in / signed_out)
 *  - Current user id + role (raw `user_roles` row, with salespeople fallback)
 *  - Last RPC response payload for `get_dashboard_kpis` (current month)
 *  - "Preview role" switcher (URL `?previewRole=salesperson|manager|admin`)
 *
 * Intentionally lightweight: no design tokens, no shadcn imports. The
 * component is tree-shaken in production builds because every consumer
 * guards the render with `import.meta.env.DEV`.
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";

type RpcState =
  | { status: "idle" | "loading" }
  | { status: "ok"; data: unknown; took: number }
  | { status: "error"; error: { code?: string; message: string } };

const PREVIEW_ROLES = ["salesperson", "manager", "admin"] as const;
type PreviewRole = (typeof PREVIEW_ROLES)[number];

function getPreviewRole(): PreviewRole | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("previewRole");
  return (PREVIEW_ROLES as readonly string[]).includes(v ?? "")
    ? (v as PreviewRole)
    : null;
}

function setPreviewRole(role: PreviewRole | null) {
  const url = new URL(window.location.href);
  if (role) url.searchParams.set("previewRole", role);
  else url.searchParams.delete("previewRole");
  window.location.replace(url.toString());
}

export function DevKpiDebugPanel() {
  const isDev = import.meta.env.DEV;

  const { user, session, salesperson } = useAuth();
  const { currentUserRole } = useUserRoles();
  const [open, setOpen] = useState(true);
  const [rpc, setRpc] = useState<RpcState>({ status: "idle" });
  const previewRole = getPreviewRole();

  const range = useMemo(() => {
    const now = new Date();
    return {
      start: format(startOfMonth(now), "yyyy-MM-dd"),
      end: format(endOfMonth(now), "yyyy-MM-dd"),
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      setRpc({ status: "loading" });
      const t0 = performance.now();
      const { data, error } = await supabase.rpc("get_dashboard_kpis", {
        start_date: range.start,
        end_date: range.end,
      });
      if (cancelled) return;
      if (error) {
        setRpc({
          status: "error",
          error: { code: error.code, message: error.message },
        });
      } else {
        setRpc({ status: "ok", data, took: Math.round(performance.now() - t0) });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, range.start, range.end]);

  const authStatus = session ? "signed_in" : "signed_out";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={panelButtonStyle}
        aria-label="Abrir painel de debug de KPIs"
      >
        🐞 KPI Debug
      </button>
    );
  }

  if (!isDev) return null;

  return (
    <aside
      role="region"
      aria-label="Painel de debug de KPIs (dev only)"
      style={panelStyle}
    >
      <header style={headerStyle}>
        <strong style={{ fontSize: 12 }}>🐞 KPI Debug · DEV</strong>
        <button type="button" onClick={() => setOpen(false)} style={closeBtnStyle}>
          ×
        </button>
      </header>

      <dl style={dlStyle}>
        <dt>auth</dt>
        <dd>
          <code>{authStatus}</code>
        </dd>

        <dt>user.id</dt>
        <dd>
          <code>{user?.id ?? "—"}</code>
        </dd>

        <dt>role (user_roles)</dt>
        <dd>
          <code>{String(currentUserRole ?? "—")}</code>
        </dd>

        <dt>salespeople.role</dt>
        <dd>
          <code>{salesperson?.role ?? "—"}</code>
        </dd>

        <dt>previewRole</dt>
        <dd>
          <code>{previewRole ?? "(none)"}</code>
        </dd>

        <dt>period</dt>
        <dd>
          <code>
            {range.start} → {range.end}
          </code>
        </dd>
      </dl>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>
          Preview role (re-render simulado):
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {PREVIEW_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setPreviewRole(r)}
              style={{
                ...chipStyle,
                background: previewRole === r ? "#7c3aed" : "transparent",
                color: previewRole === r ? "#fff" : "#ddd",
              }}
            >
              {r}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreviewRole(null)}
            style={{ ...chipStyle, opacity: 0.6 }}
          >
            reset
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>
          get_dashboard_kpis →{" "}
          {rpc.status === "ok"
            ? `${rpc.took}ms`
            : rpc.status === "error"
              ? "error"
              : rpc.status}
        </div>
        <pre style={preStyle}>
          {rpc.status === "ok"
            ? JSON.stringify(rpc.data, null, 2)
            : rpc.status === "error"
              ? JSON.stringify(rpc.error, null, 2)
              : "…"}
        </pre>
        {rpc.status === "ok" && (
          <button
            type="button"
            style={chipStyle}
            onClick={() =>
              navigator.clipboard?.writeText(JSON.stringify(rpc.data, null, 2))
            }
          >
            copy JSON
          </button>
        )}
      </div>
    </aside>
  );
}

const panelStyle: React.CSSProperties = {
  position: "fixed",
  right: 12,
  bottom: 12,
  zIndex: 9999,
  width: 340,
  maxHeight: "70vh",
  overflow: "auto",
  padding: 12,
  borderRadius: 10,
  background: "rgba(15, 15, 20, 0.92)",
  color: "#e5e7eb",
  border: "1px solid rgba(124, 58, 237, 0.4)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  font: "11px ui-monospace, SFMono-Regular, Menlo, monospace",
  backdropFilter: "blur(8px)",
};

const panelButtonStyle: React.CSSProperties = {
  ...panelStyle,
  width: "auto",
  maxHeight: "auto",
  padding: "6px 10px",
  cursor: "pointer",
  background: "rgba(124, 58, 237, 0.85)",
  color: "#fff",
  border: "none",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 18,
  lineHeight: 1,
  cursor: "pointer",
};

const dlStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "110px 1fr",
  gap: "2px 8px",
  margin: 0,
};

const chipStyle: React.CSSProperties = {
  fontSize: 10,
  padding: "3px 6px",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 6,
  background: "transparent",
  color: "#ddd",
  cursor: "pointer",
  fontFamily: "inherit",
};

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: 8,
  background: "rgba(0,0,0,0.5)",
  borderRadius: 6,
  maxHeight: 200,
  overflow: "auto",
  fontSize: 10,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
