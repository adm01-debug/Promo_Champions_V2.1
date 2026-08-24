import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type DashboardRole = "sdr" | "closer" | "gestao" | "hybrid";

interface DashboardPriorities {
  role: DashboardRole;
  showGamificationOpen: boolean;
  showAnalyticsOpen: boolean;
  showPerformanceOpen: boolean;
  showEngagementOpen: boolean;
  /** Greeting suffix based on role */
  roleHint: string;
}

/**
 * Returns dashboard section priorities based on current user role.
 * SDR → Activities/Prospecting first, Closer → Pipeline/Deals, Gestão → KPIs/Analytics
 */
export function useDashboardPriorities(): DashboardPriorities {
  const { salesperson } = useAuth();

  return useMemo(() => {
    const role = (salesperson?.role as DashboardRole) || "hybrid";

    switch (role) {
      case "sdr":
        return {
          role,
          showGamificationOpen: true,
          showAnalyticsOpen: false,
          showPerformanceOpen: false,
          showEngagementOpen: false,
          roleHint: "PROSPECTION MODE: SDR FOCUS ACTIVATED 🎯",
        };
      case "closer":
        return {
          role,
          showGamificationOpen: true,
          showAnalyticsOpen: true,
          showPerformanceOpen: false,
          showEngagementOpen: false,
          roleHint: "CLOSER MODE: REVENUE STRIKE ACTIVATED 💰",
        };
      case "gestao":
        return {
          role,
          showGamificationOpen: false,
          showAnalyticsOpen: true,
          showPerformanceOpen: true,
          showEngagementOpen: false,
          roleHint: "COMMAND MODE: STRATEGIC OVERVIEW 🛡️",
        };
      default:
        return {
          role: "hybrid",
          showGamificationOpen: true,
          showAnalyticsOpen: true,
          showPerformanceOpen: false,
          showEngagementOpen: false,
          roleHint: "HYBRID MODE: ADAPTIVE PROTOCOL ACTIVE ⚡",
        };
    }
  }, [salesperson?.role]);
}
