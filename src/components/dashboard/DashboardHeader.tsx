import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { useState } from "react";

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Dashboard de Vendas
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas métricas e desempenho em tempo real
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="mes">
          <SelectTrigger className="w-[160px] bg-card border-border shadow-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="ano">Este Ano</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="bg-card shadow-sm"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>

        <Button className="gradient-primary shadow-sm gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
}