import { getQueryMetrics } from "@/hooks/useQueryPerformance";
import { getAllCircuitStates } from "@/hooks/useCircuitBreaker";

interface ExportData {
  exportedAt: string;
  queryMetrics: ReturnType<typeof getQueryMetrics>;
  circuitBreakers: ReturnType<typeof getAllCircuitStates>;
}

// Generate comprehensive performance report
export function getPerformanceReport(): ExportData {
  return {
    exportedAt: new Date().toISOString(),
    queryMetrics: getQueryMetrics(),
    circuitBreakers: getAllCircuitStates(),
  };
}

// Export as JSON
export function exportPerformanceJSON(): void {
  const data = getPerformanceReport();
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `performance-metrics-${formatDate()}.json`, "application/json");
}

// Export as CSV
export function exportPerformanceCSV(): void {
  const data = getPerformanceReport();
  
  // Query metrics CSV
  const queryRows: string[] = [];
  queryRows.push("Query Key,Call Count,Avg Duration (ms),Errors");
  
  Object.entries(data.queryMetrics.byQueryKey).forEach(([key, stats]) => {
    queryRows.push(`"${key}",${stats.count},${stats.avgDuration},${stats.errors}`);
  });
  
  // Circuit breaker CSV
  const circuitRows: string[] = [];
  circuitRows.push("\nCircuit Breaker,State,Failures,Last Failure,Half Open Attempts");
  
  Object.entries(data.circuitBreakers).forEach(([name, state]) => {
    const lastFailure = state.lastFailure ? new Date(state.lastFailure).toISOString() : "N/A";
    circuitRows.push(`"${name}",${state.state},${state.failures},"${lastFailure}",${state.halfOpenAttempts}`);
  });
  
  // Summary
  const summary = [
    "\nSummary",
    `Exported At,${data.exportedAt}`,
    `Total Queries,${data.queryMetrics.totalQueries}`,
    `Avg Duration,${data.queryMetrics.avgDuration}ms`,
    `Slow Queries,${data.queryMetrics.slowQueries}`,
    `Error Rate,${data.queryMetrics.errorRate}%`,
  ];
  
  const csv = [...summary, "", ...queryRows, ...circuitRows].join("\n");
  downloadFile(csv, `performance-metrics-${formatDate()}.csv`, "text/csv");
}

// Recent queries detailed export
export function exportRecentQueriesCSV(): void {
  const data = getPerformanceReport();
  const recentMetrics = data.queryMetrics.recentMetrics || [];
  
  const rows: string[] = [];
  rows.push("Timestamp,Query Key,Duration (ms),Status,Data Size");
  
  recentMetrics.forEach((m) => {
    const timestamp = new Date(m.timestamp).toISOString();
    rows.push(`"${timestamp}","${m.queryKey}",${m.duration},${m.status},${m.dataSize || "N/A"}`);
  });
  
  const csv = rows.join("\n");
  downloadFile(csv, `recent-queries-${formatDate()}.csv`, "text/csv");
}

// Helper functions
function formatDate(): string {
  return new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as { __performanceExport: unknown }).__performanceExport = {
    exportJSON: exportPerformanceJSON,
    exportCSV: exportPerformanceCSV,
    exportRecentCSV: exportRecentQueriesCSV,
    getReport: getPerformanceReport,
  };
}
