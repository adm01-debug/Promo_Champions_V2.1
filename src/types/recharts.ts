// Shared Recharts tooltip prop types to eliminate `any` usage across chart components

export interface RechartsTooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: Record<string, unknown>;
}

export interface RechartsTooltipProps {
  active?: boolean;
  payload?: RechartsTooltipPayloadEntry[];
  label?: string;
}

export interface RechartsFormatterProps {
  payload: Record<string, unknown>;
  name: string;
  value: number;
}
