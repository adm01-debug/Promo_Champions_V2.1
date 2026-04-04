import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: Record<string, unknown>[];
}

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "hsl(142, 70%, 45%)",
  email: "hsl(var(--primary))",
  linkedin: "hsl(210, 80%, 50%)",
  sms: "hsl(var(--status-warning))",
  phone: "hsl(var(--status-info))",
};

export function ChannelChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card className="glass border-border/40">
        <CardContent className="py-12 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma interação registrada no período</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Interações por Canal (últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v: string) => {
                  const d = new Date(v + "T00:00:00");
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="whatsapp" name="WhatsApp" fill={CHANNEL_COLORS.whatsapp} radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="email" name="Email" fill={CHANNEL_COLORS.email} radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="linkedin" name="LinkedIn" fill={CHANNEL_COLORS.linkedin} radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="sms" name="SMS" fill={CHANNEL_COLORS.sms} radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="phone" name="Telefone" fill={CHANNEL_COLORS.phone} radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
