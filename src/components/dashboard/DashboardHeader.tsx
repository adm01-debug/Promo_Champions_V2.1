import { Calendar, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard de <span className="gradient-text">Vendas</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas métricas e resultados em tempo real
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Select defaultValue="30d">
          <SelectTrigger className="w-[160px] glass border-border/50">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Este ano</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="glass border border-border/50 hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="glow" className="gradient-primary text-primary-foreground">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  );
};
