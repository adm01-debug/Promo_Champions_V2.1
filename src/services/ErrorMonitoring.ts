import { supabase } from "@/integrations/supabase/client";

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

interface ErrorLogParams {
  message: string;
  stack_trace?: string;
  severity?: ErrorSeverity;
  category?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export const logError = async ({
  message,
  stack_trace,
  severity = "medium",
  category = "frontend",
  component,
  metadata = {},
}: ErrorLogParams) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[ErrorMonitoring] ${severity.toUpperCase()}: ${message}`, {
        stack_trace,
        category,
        component,
        metadata,
      });
    }

    const { error } = await supabase.from("error_logs").insert({
      message,
      stack_trace,
      severity,
      category,
      component,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      url: window.location.href,
      user_agent: navigator.userAgent,
      user_id: userData.user?.id || null,
    });

    if (error) {
      console.warn("Failed to send error log to server:", error);
    }
  } catch (err) {
    // Fail silently to avoid infinite error loops
    console.error("Critical failure in ErrorMonitoring service:", err);
  }
};

/**
 * Hook-like function for easy usage in event handlers
 */
export const useErrorLogger = () => {
  return { logError };
};
