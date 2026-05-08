import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Search, Filter, Download, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// Mock data since the table might not exist yet
const mockLogs = [
  { id: 1, date: "2026-05-08 14:22:10", entity: "Lead: João Silva", type: "Duplicidade de Email", status: "Bloqueado", agent: "System IA", confidence: "99.8%" },
  { id: 2, date: "2026-05-08 13:05:45", entity: "Cliente: Alpha Corp", type: "Duplicidade de CNPJ", status: "Bloqueado", agent: "System IA", confidence: "100%" },
  { id: 3, date: "2026-05-08 11:30:12", entity: "Lead: Maria Souza", type: "Fuzzy Name Match", status: "Em Revisão", agent: "Closer Audit", confidence: "87.5%" },
  { id: 4, date: "2026-05-07 18:45:00", entity: "Lead: Roberto Costa", type: "Duplicidade de Telefone", status: "Bloqueado", agent: "System IA", confidence: "99.2%" },
];

export const DuplicateBlockAudit = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por entidade ou tipo..." className="pl-9 bg-black/20 border-white/10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-black/20">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-black/20">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">Data / Hora</TableHead>
              <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">Entidade</TableHead>
              <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">Tipo de Bloqueio</TableHead>
              <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider">Agente / Auditor</TableHead>
              <TableHead className="text-[10px] font-mono font-bold uppercase tracking-wider text-right">Confiança IA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="font-mono text-[11px] text-muted-foreground">{log.date}</TableCell>
                <TableCell className="font-bold text-xs">{log.entity}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px] font-mono bg-primary/5 text-primary border-primary/20">
                    {log.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {log.status === "Bloqueado" ? (
                      <XCircle className="h-3 w-3 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-warning" />
                    )}
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      log.status === "Bloqueado" ? "text-destructive" : "text-warning"
                    )}>
                      {log.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{log.agent}</TableCell>
                <TableCell className="text-right font-mono font-bold text-primary">{log.confidence}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
