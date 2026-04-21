import { useCallback } from "react";
import { RISK_REASON_CODES, isRiskReasonCode, type RiskReasonCode } from "@/lib/winloss/riskReasons";
import type { RiskSeverity } from "@/lib/winloss/severityFromScore";
import { useSyncedSetting, type SyncStatus } from "@/hooks/useSyncedSetting";

const VALID_SEVERITIES: readonly RiskSeverity[] = ["low", "medium", "high", "critical"] as const;

function isRiskSeverity(v: unknown): v is RiskSeverity {
  return typeof v === "string" && (VALID_SEVERITIES as readonly string[]).includes(v);
}

export interface AtRiskSettings {
  threshold: number;
  limit: number;
  maxVisible: number;
  debug: boolean;
  stageFilter: string[];
  keywordFilter: string;
  reasonCodes: RiskReasonCode[];
  severityFilter: RiskSeverity[];
}

export const AT_RISK_DEFAULTS: AtRiskSettings = {
  threshold: 40,
  limit: 20,
  maxVisible: 8,
  debug: false,
  stageFilter: [],
  keywordFilter: "",
  reasonCodes: [],
  severityFilter: [],
};

const STORAGE_KEY = "winloss-at-risk-settings";
const SERVER_KEY = "winloss-at-risk";
const SCHEMA_VERSION = 4;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(n)));

function sanitizeStages(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 60);
  return Array.from(new Set(cleaned)).slice(0, 20);
}

function sanitizeKeyword(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, 100);
}

function sanitizeReasonCodes(input: unknown): RiskReasonCode[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input.filter(isRiskReasonCode);
  return Array.from(new Set(cleaned)).slice(0, RISK_REASON_CODES.length);
}

export function sanitizeSeverities(input: unknown): RiskSeverity[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input.filter(isRiskSeverity);
  return Array.from(new Set(cleaned)).slice(0, VALID_SEVERITIES.length);
}

export function sanitize(input: unknown): AtRiskSettings {
  const obj = (input && typeof input === "object" ? input : {}) as Partial<AtRiskSettings>;
  return {
    threshold: clamp(Number(obj.threshold ?? AT_RISK_DEFAULTS.threshold), 0, 100),
    limit: clamp(Number(obj.limit ?? AT_RISK_DEFAULTS.limit), 5, 50),
    maxVisible: clamp(Number(obj.maxVisible ?? AT_RISK_DEFAULTS.maxVisible), 3, 20),
    debug: Boolean(obj.debug ?? AT_RISK_DEFAULTS.debug),
    stageFilter: sanitizeStages(obj.stageFilter),
    keywordFilter: sanitizeKeyword(obj.keywordFilter),
    reasonCodes: sanitizeReasonCodes(obj.reasonCodes),
    severityFilter: sanitizeSeverities(obj.severityFilter),
  };
}

export type { SyncStatus };

export function useAtRiskSettings() {
  const { value: settings, update, reset, syncStatus } = useSyncedSetting<AtRiskSettings>({
    key: SERVER_KEY,
    storageKey: STORAGE_KEY,
    schemaVersion: SCHEMA_VERSION,
    defaults: AT_RISK_DEFAULTS,
    sanitize,
  });

  const clearFilters = useCallback(() => {
    update({
      stageFilter: [],
      keywordFilter: "",
      reasonCodes: [],
      severityFilter: [],
    });
  }, [update]);

  return { settings, update, reset, clearFilters, syncStatus };
}
