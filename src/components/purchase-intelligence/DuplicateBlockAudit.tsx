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
import { ShieldAlert, Search, Filter, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DuplicateBlockAudit = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["duplicate-block-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("duplicate_block_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

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

      <Card className="border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
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
              {logs?.map((log) => (
                <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-bold text-xs">{log.entity_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-mono bg-primary/5 text-primary border-primary/20">
                      {log.block_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {log.status === "Blocked" ? (
                        <XCircle className="h-3 w-3 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-warning" />
                      )}
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        log.status === "Blocked" ? "text-destructive" : "text-warning"
                      )}>
                        {log.status === "Blocked" ? "Bloqueado" : "Em Revisão"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.auditor}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-primary">
                    {(log.confidence_score * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
