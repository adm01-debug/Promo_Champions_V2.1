/**
 * Centralized Error Tracking Service
 * Captures, categorizes, and persists errors for monitoring.
 */
import { supabase } from "@/integrations/supabase/client";

type ErrorSeverity = "low" | "medium" | "high" | "critical";
type ErrorCategory = "runtime" | "network" | "auth" | "database" | "ui" | "unknown";

interface TrackedError {
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  component?: string;
  metadata?: Record<string, unknown>;
  url?: string;
  userAgent?: string;
}

const ERROR_BUFFER: TrackedError[] = [];
const FLUSH_INTERVAL = 30_000; // 30s
const MAX_BUFFER = 50;
let flushTimer: ReturnType<typeof setInterval> | null = null;

function classifyError(error: Error | string): { severity: ErrorSeverity; category: ErrorCategory } {
  const msg = typeof error === "string" ? error : error.message;
  const lower = msg.toLowerCase();

  if (lower.includes("chunk") || lower.includes("dynamic import")) {
    return { severity: "medium", category: "network" };
  }
  if (lower.includes("401") || lower.includes("unauthorized") || lower.includes("jwt")) {
    return { severity: "high", category: "auth" };
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("cors")) {
    return { severity: "medium", category: "network" };
  }
  if (lower.includes("supabase") || lower.includes("postgres") || lower.includes("rls")) {
    return { severity: "high", category: "database" };
  }
  if (lower.includes("render") || lower.includes("hydrat") || lower.includes("component")) {
    return { severity: "medium", category: "ui" };
  }
  return { severity: "medium", category: "runtime" };
}

async function flushErrors(): Promise<void> {
  if (ERROR_BUFFER.length === 0) return;

  const batch = ERROR_BUFFER.splice(0, MAX_BUFFER);

  try {
    const { error } = await supabase.from("error_logs").insert(
      batch.map((e) => ({
        message: e.message.slice(0, 1000),
        stack_trace: e.stack?.slice(0, 5000) ?? null,
        severity: e.severity,
        category: e.category,
        component: e.component ?? null,
        metadata: (e.metadata ?? {}) as Record<string, unknown>,
        url: e.url ?? window.location.href,
        user_agent: e.userAgent ?? navigator.userAgent,
      }))
    );

    if (error && import.meta.env.DEV) {
      console.warn("[ErrorTracking] Failed to flush:", error.message);
    }
  } catch {
    // Silently fail - don't create error loops
  }
}

export function captureError(
  error: Error | string,
  options?: {
    component?: string;
    metadata?: Record<string, unknown>;
    severity?: ErrorSeverity;
    category?: ErrorCategory;
  }
): void {
  const msg = typeof error === "string" ? error : error.message;
  const stack = typeof error === "string" ? undefined : error.stack;
  const { severity, category } = classifyError(error);

  const tracked: TrackedError = {
    message: msg,
    stack,
    severity: options?.severity ?? severity,
    category: options?.category ?? category,
    component: options?.component,
    metadata: options?.metadata,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  ERROR_BUFFER.push(tracked);

  if (ERROR_BUFFER.length >= MAX_BUFFER) {
    void flushErrors();
  }

  if (import.meta.env.DEV) {
    console.warn(`[ErrorTracking] ${tracked.severity}/${tracked.category}: ${msg}`);
  }
}

export function captureException(error: unknown, component?: string): void {
  if (error instanceof Error) {
    captureError(error, { component });
  } else {
    captureError(String(error), { component });
  }
}

export function initErrorTracking(): void {
  if (flushTimer) return;

  // Flush periodically
  flushTimer = setInterval(() => void flushErrors(), FLUSH_INTERVAL);

  // Flush on unload
  window.addEventListener("beforeunload", () => void flushErrors());

  // Capture unhandled errors
  window.addEventListener("error", (event) => {
    captureError(event.error instanceof Error ? event.error : event.message, {
      category: "runtime",
      metadata: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason, "unhandledrejection");
  });
}
