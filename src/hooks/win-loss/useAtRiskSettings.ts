import { useCallback, useEffect, useState } from "react";
import { RISK_REASON_CODES, isRiskReasonCode, type RiskReasonCode } from "@/lib/winloss/riskReasons";
import type { RiskSeverity } from "@/lib/winloss/severityFromScore";

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

export function sanitize(input: Partial<AtRiskSettings>): AtRiskSettings {
  return {
    threshold: clamp(Number(input.threshold ?? AT_RISK_DEFAULTS.threshold), 0, 100),
    limit: clamp(Number(input.limit ?? AT_RISK_DEFAULTS.limit), 5, 50),
    maxVisible: clamp(Number(input.maxVisible ?? AT_RISK_DEFAULTS.maxVisible), 3, 20),
    debug: Boolean(input.debug ?? AT_RISK_DEFAULTS.debug),
    stageFilter: sanitizeStages(input.stageFilter),
    keywordFilter: sanitizeKeyword(input.keywordFilter),
    reasonCodes: sanitizeReasonCodes(input.reasonCodes),
    severityFilter: sanitizeSeverities(input.severityFilter),
  };
}

function read(): AtRiskSettings {
  if (typeof window === "undefined") return AT_RISK_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return AT_RISK_DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return AT_RISK_DEFAULTS;
    // Migrate v1/v2/v3 → v4: keep known fields, fill defaults (incl. severityFilter:[]).
    if ([1, 2, 3, SCHEMA_VERSION].includes(parsed.version)) {
      return sanitize(parsed.settings ?? {});
    }
    return AT_RISK_DEFAULTS;
  } catch {
    return AT_RISK_DEFAULTS;
  }
}

function write(settings: AtRiskSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, settings }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function useAtRiskSettings() {
  const [settings, setSettings] = useState<AtRiskSettings>(() => read());

  useEffect(() => {
    write(settings);
  }, [settings]);

  const update = useCallback((partial: Partial<AtRiskSettings>) => {
    setSettings((prev) => sanitize({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setSettings(AT_RISK_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSettings((prev) =>
      sanitize({
        ...prev,
        stageFilter: [],
        keywordFilter: "",
        reasonCodes: [],
        severityFilter: [],
      }),
    );
  }, []);

  return { settings, update, reset, clearFilters };
}
