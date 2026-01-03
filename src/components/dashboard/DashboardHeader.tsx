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
import { useIsMobile } from "@/hooks/useMediaQuery";

export const DashboardHeader = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Title Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display">
            Dashboard de <span className="gradient-text">Vendas</span>
          </h1>
          <Badge variant="outline" className="gap-1 sm:gap-1.5 bg-primary/5 border-primary/20 text-primary text-[10px] sm:text-xs">
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Live
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
          Acompanhe suas métricas e resultados em tempo real
        </p>
      </div>
      
      {/* Actions Section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Select defaultValue="30d">
          <SelectTrigger className={`glass border-border/40 hover:border-primary/30 transition-colors ${isMobile ? 'w-[130px] h-9 text-xs' : 'w-[160px]'}`}>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-md border-border/50">
            <SelectItem value="7d" className="text-xs sm:text-sm">7 dias</SelectItem>
            <SelectItem value="30d" className="text-xs sm:text-sm">30 dias</SelectItem>
            <SelectItem value="90d" className="text-xs sm:text-sm">90 dias</SelectItem>
            <SelectItem value="1y" className="text-xs sm:text-sm">Este ano</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="glass border border-border/40 hover:bg-muted hover:border-primary/30 transition-all duration-200 h-9 w-9"
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button 
          variant="glow" 
          className="gradient-primary text-primary-foreground gap-1.5 sm:gap-2 shadow-md hover:shadow-glow-primary transition-shadow duration-300 h-9 text-xs sm:text-sm px-3 sm:px-4"
        >
          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </div>
    </div>
  );
};
