import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditLogs, exportAuditLogsToCSV, AuditFilters } from "@/hooks/admin/useAuditLogs";
import { ScrollText, Download, Filter, User, Activity, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageTransition } from "@/components/transitions/PageTransition";
import { cn } from "@/lib/utils";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

const ACTION_COLORS: Record<string, string> = {
  create: "bg-status-success/10 text-status-success border-status-success/30",
  update: "bg-primary/10 text-primary border-primary/30",
  delete: "bg-destructive/10 text-destructive border-destructive/30",
  login: "bg-accent/10 text-accent border-accent/30",
  logout: "bg-muted text-muted-foreground border-border",
};

const AuditLogsPage = () => {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [search, setSearch] = useState("");
  const { data: logs, isLoading } = useAuditLogs(filters, 500);

  const filtered = useMemo(() => {
    if (!search) return logs ?? [];
    const s = search.toLowerCase();
    return (logs ?? []).filter(l =>
      l.action.toLowerCase().includes(s) ||
      l.entity_type.toLowerCase().includes(s) ||
      (l.actor_email ?? "").toLowerCase().includes(s) ||
      (l.entity_id ?? "").toLowerCase().includes(s)
    );
  }, [logs, search]);

  const stats = useMemo(() => {
    const all = logs ?? [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return {
      total: all.length,
      today: all.filter(l => new Date(l.created_at) >= today).length,
      actors: new Set(all.map(l => l.actor_email).filter(Boolean)).size,
      entities: new Set(all.map(l => l.entity_type)).size,
    };
  }, [logs]);

  return (
    <>
      <Helmet>
        <title>Audit Trail | Promo Champions</title>
        <meta name="description" content="Histórico completo de ações realizadas no sistema com exportação CSV." />
      </Helmet>
      <PageTransition>
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-page-title font-display">Audit Trail</h1>
                <p className="text-sm text-muted-foreground">Histórico completo de ações no sistema</p>
              </div>
            </div>
            <Button size="sm" className="gap-2" onClick={() => exportAuditLogsToCSV(filtered)} disabled={!filtered.length}>
              <Download className="h-4 w-4" /> Exportar CSV ({filtered.length})
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total de Eventos", value: stats.total, icon: Activity, color: "text-primary" },
              { label: "Hoje", value: stats.today, icon: Clock, color: "text-status-success" },
              { label: "Atores Únicos", value: stats.actors, icon: User, color: "text-accent" },
              { label: "Tipos de Entidade", value: stats.entities, icon: ScrollText, color: "text-muted-foreground" },
            ].map(s => (
              <Card key={s.label} className="glass border-border/40">
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={cn("h-8 w-8", s.color)} />
                  <div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Filtros */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40">
              <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                  <Filter className="h-4 w-4" /> Filtros:
                </div>
                <Input placeholder="Buscar por ação, entidade, email..." value={search}
                  onChange={e => setSearch(e.target.value)} className="flex-1" />
                <Select value={filters.action ?? "all"} onValueChange={v => setFilters(p => ({ ...p, action: v === "all" ? undefined : v }))}>
                  <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Ação" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="create">Criar</SelectItem>
                    <SelectItem value="update">Atualizar</SelectItem>
                    <SelectItem value="delete">Excluir</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={filters.from?.split("T")[0] ?? ""}
                  onChange={e => setFilters(p => ({ ...p, from: e.target.value ? `${e.target.value}T00:00:00Z` : undefined }))}
                  className="w-full md:w-44" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista */}
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40">
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh]">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                    </div>
                  ) : !filtered.length ? (
                    <div className="p-8 text-center">
                      <ScrollText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="font-display font-semibold">Nenhum registro encontrado</p>
                      <p className="text-sm text-muted-foreground">As ações do sistema aparecerão aqui.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {filtered.map(log => (
                        <div key={log.id} className="p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className={cn("text-[10px] uppercase shrink-0",
                              ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground")}>
                              {log.action}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.entity_type}</code>
                                {log.entity_id && (
                                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                    #{log.entity_id.slice(0, 8)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{log.actor_email ?? "Sistema"}</span>
                                <span>•</span>
                                <span title={format(new Date(log.created_at), "PPpp", { locale: ptBR })}>
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                                </span>
                              </div>
                              {Object.keys(log.changes ?? {}).length > 0 && (
                                <details className="mt-1">
                                  <summary className="text-xs text-primary cursor-pointer hover:underline">Ver mudanças</summary>
                                  <pre className="text-[10px] bg-muted/50 p-2 rounded mt-1 overflow-x-auto max-w-full">
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </PageTransition>
    </>
  );
};

export default AuditLogsPage;
