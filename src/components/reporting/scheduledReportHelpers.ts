export type ScheduleFrequency = "daily" | "weekly" | "monthly";
export type ScheduleFormat = "csv" | "json";

export interface ScheduledReport {
  id: string;
  created_by: string;
  report_id: string;
  name: string;
  frequency: ScheduleFrequency;
  hour_of_day: number;
  day_of_week: number | null;
  day_of_month: number | null;
  recipients: string[];
  format: ScheduleFormat;
  enabled: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

export interface ScheduledReportRun {
  id: string;
  schedule_id: string;
  started_at: string;
  finished_at: string | null;
  status: "running" | "success" | "failed";
  rows_count: number | null;
  file_path: string | null;
  error_message: string | null;
}

export const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
};

export const WEEKDAYS = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

export const isValidEmail = (e: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export const formatScheduleSummary = (s: Pick<ScheduledReport, "frequency" | "hour_of_day" | "day_of_week" | "day_of_month">): string => {
  const hh = String(s.hour_of_day).padStart(2, "0");
  if (s.frequency === "daily") return `Todo dia às ${hh}:00`;
  if (s.frequency === "weekly") return `Toda ${WEEKDAYS[s.day_of_week ?? 1]} às ${hh}:00`;
  return `Todo dia ${s.day_of_month ?? 1} às ${hh}:00`;
};

export const formatRunDuration = (run: ScheduledReportRun): string => {
  if (!run.finished_at) return "—";
  const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
};
