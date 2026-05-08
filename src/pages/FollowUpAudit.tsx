import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter, MessageCircle, Zap, UserPlus, Clock, History, AlertTriangle, RotateCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { PageTransition } from "@/components/transitions/PageTransition";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

const actionIcons: Record<string, any> = {
  "whatsapp_sent": { icon: MessageCircle, color: "text-green-500", label: "WhatsApp Enviado" },
  "whatsapp_attempt": { icon: Send, color: "text-blue-400", label: "Tentativa WhatsApp" },
  "task_created": { icon: UserPlus, color: "text-blue-500", label: "Tarefa Criada" },
  "lead_reactivated": { icon: Zap, color: "text-amber-500", label: "Lead Reativado" },
  "status_change": { icon: Clock, color: "text-purple-500", label: "Mudança de Status" },
  "intent_trigger": { icon: Zap, color: "text-red-500", label: "Gatilho de Intenção" },
};

const FollowUpAudit = () => {
  const [searchLead, setSearchLead] = useState("");
  const [searchSalesperson, setSearchSalesperson] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["follow-up-audit", searchLead, searchSalesperson, filterAction, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("follow_up_audit_view" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (searchLead) {
        query = query.ilike("lead_name", `%${searchLead}%`);
      }
      if (searchSalesperson) {
        query = query.ilike("user_name", `%${searchSalesperson}%`);
      }
      if (filterAction !== "all") {
        query = query.eq("action_type", filterAction);
      }
      if (dateRange.from) {
        query = query.gte("created_at", `${dateRange.from}T00:00:00`);
      }
      if (dateRange.to) {
        query = query.lte("created_at", `${dateRange.to}T23:59:59`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  const handleRetry = async (log: any) => {
    if (log.action_type === 'whatsapp_sent') {
      toast.info("Re-enviando WhatsApp...");
      
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      const message = details?.message_preview || "Olá! Gostaríamos de retomar nosso contato.";
      
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      
      // Update retry count and status in audit logs
      const { error } = await supabase
        .from('follow_up_audit_logs')
        .update({ 
          retry_count: (log.retry_count || 0) + 1,
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', log.id);
        
      if (!error) {
        toast.success("Status atualizado e retentativa registrada.");
      }
    }
  };

  return (
    <PageTransition>
      <Helmet>
        <title>Auditoria de Follow-up | Promo Champions</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auditoria de Follow-up</h1>
            <p className="text-muted-foreground text-sm">Rastreie cada interação e ação realizada nos seus leads.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 font-medium">
              <History className="h-3 w-3" />
              {logs.length} registros recentes
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Lead..."
                  value={searchLead}
                  onChange={(e) => setSearchLead(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Vendedor..."
                  value={searchSalesperson}
                  onChange={(e) => setSearchSalesperson(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="whatsapp_sent">WhatsApp Enviado</SelectItem>
                  <SelectItem value="task_created">Tarefa Criada</SelectItem>
                  <SelectItem value="lead_reactivated">Lead Reativado</SelectItem>
                  <SelectItem value="status_change">Mudança de Status</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="h-9 text-[10px]"
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="h-9 text-[10px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SkeletonTransition 
              isLoading={isLoading} 
              skeleton={
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
                  ))}
                </div>
              }
            >
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[180px]">Data/Hora</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nenhum registro encontrado para os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log: any) => {
                        const action = actionIcons[log.action_type] || { icon: History, color: "text-muted-foreground", label: log.action_type };
                        const ActionIcon = action.icon;
                        
                        return (
                          <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="text-xs font-medium">
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="font-semibold">{log.lead_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ActionIcon className={`h-4 w-4 ${action.color}`} />
                                <span className="text-sm">{action.label}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {log.user_name?.substring(0, 2).toUpperCase() || "UN"}
                                </div>
                                <span className="text-xs">{log.user_name || "Sistema"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={log.status === 'sent' || log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}
                                className="text-[10px] uppercase px-1.5 h-5 font-black"
                              >
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              <div className="flex items-center justify-end gap-2">
                                {log.retry_count > 0 && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {log.retry_count} retentativas
                                  </Badge>
                                )}
                                {log.action_type === 'whatsapp_sent' && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRetry(log)}>
                                    <RotateCw className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <span className="text-muted-foreground italic truncate max-w-[200px] inline-block">
                                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </SkeletonTransition>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default FollowUpAudit;
