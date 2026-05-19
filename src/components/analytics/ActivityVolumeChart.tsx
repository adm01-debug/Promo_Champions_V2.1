import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3 } from "lucide-react";
import { SalespersonActivityData } from "@/hooks/sales/useSalespersonActivityReport";

interface ActivityVolumeChartProps {
  data: SalespersonActivityData[];
}

export function ActivityVolumeChart({ data }: ActivityVolumeChartProps) {
  const chartData = data.slice(0, 8).map(sp => ({
    name: sp.salesperson_name.split(' ')[0],
    Calls: sp.calls,
    Emails: sp.emails,
    Reuniões: sp.meetings,
    LinkedIn: sp.linkedin,
    WhatsApp: sp.whatsapp,
  }));

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Volume por Tipo de Atividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar dataKey="Calls" stackId="a" fill="hsl(142, 76%, 36%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Emails" stackId="a" fill="hsl(217, 91%, 60%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Reuniões" stackId="a" fill="hsl(280, 87%, 63%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="LinkedIn" stackId="a" fill="hsl(199, 89%, 48%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="WhatsApp" stackId="a" fill="hsl(158, 64%, 52%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
