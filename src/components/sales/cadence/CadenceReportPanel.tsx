
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Mail, Phone, MessageSquare, Target } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const METRICS = [
  { label: "Taxa de Abertura", value: "42.5%", sub: "+2.3%", icon: Mail, color: "text-blue-500" },
  { label: "Taxa de Resposta", value: "18.2%", sub: "+1.5%", icon: MessageSquare, color: "text-purple-500" },
  { label: "Agendamentos", value: "8", sub: "Meta: 10", icon: Target, color: "text-orange-500" },
  { label: "Conversão Final", value: "5.4%", sub: "-0.2%", icon: TrendingUp, color: "text-green-500" },
];

const CHANNEL_PERFORMANCE = [
  { channel: "WhatsApp", conversion: "12.4%", efficiency: 92, icon: MessageSquare, color: "bg-green-500" },
  { channel: "Ligação", conversion: "8.1%", efficiency: 85, icon: Phone, color: "bg-blue-500" },
  { channel: "E-mail", conversion: "3.2%", efficiency: 45, icon: Mail, color: "bg-purple-500" },
];

export function CadenceReportPanel() {
  const [period, setPeriod] = useState("weekly");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Relatórios de Desempenho
        </h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${metric.color}/10`}>
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <Badge variant={metric.sub.startsWith('+') ? "success" : "secondary"} className="text-[10px] h-4">
                    {metric.sub}
                  </Badge>
                </div>
                <p className="text-xl font-bold">{metric.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Eficácia por Canal (Benchmarking SINGU)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {CHANNEL_PERFORMANCE.map((item) => (
            <div key={item.channel} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-md ${item.color}/20`}>
                    <item.icon className={`h-3 w-3 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-medium">{item.channel}</span>
                </div>
                <span className="text-muted-foreground">Conversão: <span className="text-foreground font-bold">{item.conversion}</span></span>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.efficiency}%` }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
