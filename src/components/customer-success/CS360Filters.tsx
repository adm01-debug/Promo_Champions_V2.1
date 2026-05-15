import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, Download, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CS360FiltersProps {
  period: string;
  setPeriod: (p: string) => void;
  startDate: string;
  endDate: string;
  handleDateChange: (type: "start" | "end", value: string) => void;
  resetFilters: () => void;
  exportPDF: () => void;
  exportCSV: () => void;
}

export function CS360Filters({
  period,
  setPeriod,
  startDate,
  endDate,
  handleDateChange,
  resetFilters,
  exportPDF,
  exportCSV
}: CS360FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px] h-9 bg-muted/30 border-primary/20">
            <Filter className="h-3 w-3 mr-2 text-primary" />
            <SelectValue placeholder="Período" className="text-xs" />
          </SelectTrigger>
          <SelectContent className="glass border-primary/20">
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
            <SelectItem value="0">Tudo</SelectItem>
          </SelectContent>
        </Select>

        {period === "custom" && (
          <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-300">
            <Input
              type="date"
              className="w-[130px] h-9 bg-muted/30 border-primary/20 text-xs"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
            />
            <span className="text-muted-foreground text-[10px] uppercase">até</span>
            <Input
              type="date"
              className="w-[130px] h-9 bg-muted/30 border-primary/20 text-xs"
              value={endDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
            />
            {(startDate || endDate) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-2 text-muted-foreground hover:text-primary" 
                onClick={resetFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Resetar
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" onClick={exportPDF} className="h-9 bg-muted/30 border-primary/20 hover:bg-primary/10 transition-colors text-xs">
          <Download className="h-3 w-3 mr-2" />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={exportCSV} className="h-9 bg-muted/30 border-primary/20 hover:bg-primary/10 transition-colors text-xs">
          <Activity className="h-3 w-3 mr-2" />
          CSV
        </Button>
      </div>
    </div>
  );
}
