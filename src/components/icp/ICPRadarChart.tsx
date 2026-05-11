import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useICPConfig } from "@/hooks/useICPConfig";
import { ICPData } from "@/hooks/useICPData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface ICPRadarChartProps {
  clientIcp: ICPData | null;
}

export function ICPRadarChart({ clientIcp }: ICPRadarChartProps) {
  const { data: config } = useICPConfig();

  const chartData = useMemo(() => {
    if (!clientIcp || !config) return [];

    return [
      {
        subject: "Ramo de Atividade",
        value: clientIcp.ramo_atividade && config.target_industries.includes(clientIcp.ramo_atividade) ? 100 : 0,
        fullMark: 100,
      },
      {
        subject: "Capital Social",
        value: clientIcp.capital_social && config.min_capital > 0 ? Math.min(100, (clientIcp.capital_social / config.min_capital) * 100) : 0,
        fullMark: 100,
      },
      {
        subject: "Colaboradores",
        value: clientIcp.num_colaboradores && config.min_employees > 0 ? Math.min(100, (clientIcp.num_colaboradores / config.min_employees) * 100) : 0,
        fullMark: 100,
      },
      {
        subject: "Nicho/Grupo",
        value: clientIcp.grupo_nicho && config.preferred_niches.includes(clientIcp.grupo_nicho) ? 100 : 0,
        fullMark: 100,
      },
      {
        subject: "Perfil Geral",
        value: clientIcp.icp_score || 0,
        fullMark: 100,
      },
    ];
  }, [clientIcp, config]);

  if (!clientIcp) return null;

  return (
    <Card className="glass border-border/40 hover-lift-sm transition-all duration-300 overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Análise de Fit ICP
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" strokeOpacity={0.1} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 10, opacity: 0.6 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Fit Score"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="px-4 pb-4 text-center">
          <span className="text-2xl font-bold gradient-text">{clientIcp.icp_score}%</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score de Compatibilidade</p>
        </div>
      </CardContent>
    </Card>
  );
}
