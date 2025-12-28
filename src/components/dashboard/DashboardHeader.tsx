import { Calendar, RefreshCw, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold font-display">
            Dashboard de <span className="gradient-text">Vendas</span>
          </h1>
          <Badge variant="outline" className="gap-1.5 bg-primary/5 border-primary/20 text-primary">
            <Sparkles className="h-3 w-3" />
            Live
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Acompanhe suas métricas e resultados em tempo real
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Select defaultValue="30d">
          <SelectTrigger className="w-[160px] glass border-border/40 hover:border-primary/30 transition-colors">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-md border-border/50">
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Este ano</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="glass border border-border/40 hover:bg-muted hover:border-primary/30 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="glow" className="gradient-primary text-primary-foreground gap-2 shadow-md hover:shadow-glow-primary transition-shadow duration-300">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
