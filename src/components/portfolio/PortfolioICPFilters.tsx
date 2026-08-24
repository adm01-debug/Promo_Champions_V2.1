import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Target, Building2, Users, Banknote, Tag, X, ChevronDown } from "lucide-react";

interface PortfolioICPFiltersProps {
  icpFiltersOpen: boolean;
  setIcpFiltersOpen: (open: boolean) => void;
  icpMatchOnly: boolean;
  setIcpMatchOnly: (v: boolean) => void;
  ramoFilter: string;
  setRamoFilter: (v: string) => void;
  nichoFilter: string;
  setNichoFilter: (v: string) => void;
  minCapital: string;
  setMinCapital: (v: string) => void;
  minColaboradores: string;
  setMinColaboradores: (v: string) => void;
  ramos: string[];
  nichos: string[];
  activeIcpFilters: number;
  onClear: () => void;
}

export const PortfolioICPFilters = React.memo(function PortfolioICPFilters({
  icpFiltersOpen, setIcpFiltersOpen,
  icpMatchOnly, setIcpMatchOnly,
  ramoFilter, setRamoFilter,
  nichoFilter, setNichoFilter,
  minCapital, setMinCapital,
  minColaboradores, setMinColaboradores,
  ramos, nichos,
  activeIcpFilters, onClear,
}: PortfolioICPFiltersProps) {
  return (
    <Collapsible open={icpFiltersOpen} onOpenChange={setIcpFiltersOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span>Filtros ICP Avançados</span>
            {activeIcpFilters > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeIcpFilters} ativo{activeIcpFilters > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${icpFiltersOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-status-success" />
              <Label htmlFor="icp-match" className="font-medium">Apenas Match ICP</Label>
            </div>
            <Switch id="icp-match" checked={icpMatchOnly} onCheckedChange={setIcpMatchOnly} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm"><Building2 className="h-3 w-3" />Ramo de Atividade</Label>
              <Select value={ramoFilter} onValueChange={setRamoFilter}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {ramos.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm"><Tag className="h-3 w-3" />Grupo/Nicho</Label>
              <Select value={nichoFilter} onValueChange={setNichoFilter}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {nichos.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm"><Banknote className="h-3 w-3" />Capital Mínimo (R$)</Label>
              <Input type="number" placeholder="Ex: 100000" value={minCapital} onChange={(e) => setMinCapital(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm"><Users className="h-3 w-3" />Colaboradores Mín.</Label>
              <Input type="number" placeholder="Ex: 10" value={minColaboradores} onChange={(e) => setMinColaboradores(e.target.value)} />
            </div>
          </div>

          {activeIcpFilters > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" />Limpar filtros ICP
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});
