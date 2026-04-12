import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SDRDetails {
  meetings: number;
  leads: number;
  rate: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  teamAverage: number;
  teamMeetings: number;
  teamLeads: number;
  details: Record<string, SDRDetails>;
  [key: string]: number | string | Record<string, SDRDetails>;
}

interface SDRConversionTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string; stroke?: string }>;
  label?: string;
  chartData: ChartDataPoint[];
  sdrs: Array<{ id: string; name: string }>;
}

export const SDRConversionTooltip = React.memo(function SDRConversionTooltip({
  active, payload, label, chartData, sdrs,
}: SDRConversionTooltipProps) {
  if (!active || !payload?.length) return null;

  const dataPoint = chartData.find(p => p.label === label);

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
      <p className="font-semibold text-foreground text-sm">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: { name?: string; value?: number; color?: string; dataKey?: string; stroke?: string }) => {
          const isTeamAverage = entry.dataKey === 'teamAverage';
          const sdr = sdrs.find(s => s.id === entry.dataKey);
          const details = dataPoint?.details?.[String(entry.dataKey ?? '')];
          const teamAvg = dataPoint?.teamAverage ?? 0;
          const diff = !isTeamAverage ? (entry.value as number) - teamAvg : 0;

          return (
            <div key={entry.dataKey} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
                <span className="text-xs text-muted-foreground">
                  {isTeamAverage ? 'Média Equipe' : sdr?.name}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  {!isTeamAverage && (
                    <>
                      {diff > 0 ? (
                        <TrendingUp className="w-3 h-3 text-status-success" />
                      ) : diff < 0 ? (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      ) : (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      )}
                    </>
                  )}
                  <span className={`text-xs font-semibold ${
                    !isTeamAverage
                      ? diff > 0 ? 'text-status-success' : diff < 0 ? 'text-destructive' : ''
                      : ''
                  }`}>
                    {entry.value}%
                  </span>
                </div>
              </div>
              {!isTeamAverage && details && (
                <div className="ml-4 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{details.meetings} reuniões</span>
                  <span>{details.leads} leads</span>
                  {diff !== 0 && (
                    <span className={`font-medium ${diff > 0 ? 'text-status-success' : 'text-destructive'}`}>
                      {diff > 0 ? '+' : ''}{diff}% vs média
                    </span>
                  )}
                </div>
              )}
              {isTeamAverage && dataPoint && (
                <div className="ml-4 flex gap-3 text-[10px] text-muted-foreground">
                  <span>{dataPoint.teamMeetings} reuniões</span>
                  <span>{dataPoint.teamLeads} leads</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
