import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Building2, Tag, Banknote, Users, CheckCircle2, XCircle, Edit, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ICPRadarChart } from "./ICPRadarChart";
import type { ICPData } from "@/hooks/useICPData";

interface ICPTableProps {
  data: ICPData[];
  clientMap: Map<string, string>;
  onEdit: (item: ICPData) => void;
}

const formatCurrency = (value: number | null) => {
  if (!value) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
};

export const ICPTable = React.memo(function ICPTable({ data, clientMap, onEdit }: ICPTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum dado ICP encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Ramo de Atividade</TableHead>
            <TableHead>Grupo/Nicho</TableHead>
            <TableHead>Capital Social</TableHead>
            <TableHead>Colaboradores</TableHead>
            <TableHead>Score Fit</TableHead>
            <TableHead>Status ICP</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <TableCell className="font-medium">{clientMap.get(item.client_id) || "Cliente Desconhecido"}</TableCell>
              <TableCell>
                {item.ramo_atividade ? (
                  <Badge variant="outline" className="gap-1"><Building2 className="h-3 w-3" />{item.ramo_atividade}</Badge>
                ) : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                {item.grupo_nicho ? (
                  <Badge variant="outline" className="gap-1"><Tag className="h-3 w-3" />{item.grupo_nicho}</Badge>
                ) : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                {item.capital_social ? (
                  <span className="flex items-center gap-1"><Banknote className="h-3 w-3 text-muted-foreground" />{formatCurrency(item.capital_social)}</span>
                ) : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                {item.num_colaboradores ? (
                  <span className="flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" />{item.num_colaboradores}</span>
                ) : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${item.icp_score && item.icp_score >= 70 ? 'bg-status-success' : 'bg-status-warning'}`} 
                      style={{ width: `${item.icp_score || 0}%` }} 
                    />
                  </div>
                  <span className="text-xs font-mono">{item.icp_score || 0}%</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 border-none">
                      <ICPRadarChart clientIcp={item} />
                    </PopoverContent>
                  </Popover>
                </div>
              </TableCell>
              <TableCell>
                {item.is_icp_match ? (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 font-bold uppercase tracking-widest text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" />Match
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="opacity-70 font-bold uppercase tracking-widest text-[10px]">
                    <XCircle className="h-3 w-3 mr-1" />Sem Match
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="hover-glow"><Edit className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
