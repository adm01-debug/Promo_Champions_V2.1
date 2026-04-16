import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportBuilder } from "@/components/reporting/ReportBuilder";
import {
  useCustomReports, useCustomReport, useDeleteCustomReport,
} from "@/hooks/reporting/useCustomReports";
import { ENTITY_LABELS } from "@/hooks/reporting/reportBuilderHelpers";
import { Plus, FileBarChart2, Trash2, ArrowLeft, Users } from "lucide-react";

export default function CustomReports() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const list = useCustomReports();
  const single = useCustomReport(id);
  const del = useDeleteCustomReport();

  // ============ DETAIL VIEW ============
  if (id) {
    return (
      <>
        <Helmet>
          <title>Editar Relatório | Promo Champions</title>
          <meta name="description" content="Editor de relatório personalizado." />
        </Helmet>
        <PageTransition>
          <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/relatorios-custom")} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <h1 className="text-page-title font-display">{single.data?.name ?? "Carregando…"}</h1>
            </motion.div>
            {single.data && <ReportBuilder initialReport={single.data} onSaved={() => single.refetch()} />}
            {single.isLoading && <Skeleton className="h-96" />}
          </div>
        </PageTransition>
      </>
    );
  }

  // ============ CREATE VIEW ============
  if (creating) {
    return (
      <>
        <Helmet>
          <title>Novo Relatório | Promo Champions</title>
        </Helmet>
        <PageTransition>
          <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCreating(false)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <h1 className="text-page-title font-display">Novo Relatório</h1>
            </motion.div>
            <ReportBuilder onSaved={(r) => navigate(`/relatorios-custom/${r.id}`)} />
          </div>
        </PageTransition>
      </>
    );
  }

  // ============ LIST VIEW ============
  return (
    <>
      <Helmet>
        <title>Relatórios Personalizados | Promo Champions</title>
        <meta name="description" content="Crie relatórios sem código com drag-and-drop, filtros e múltiplas visualizações." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">Relatórios Personalizados</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Crie relatórios sem código sobre vendas, contas, atividades e mais
              </p>
            </div>
            <Button onClick={() => setCreating(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Novo relatório
            </Button>
          </motion.div>

          {list.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : list.data && list.data.length > 0 ? (
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.data.map((r) => (
                <Card key={r.id} className="p-4 glass border-border/40 hover:border-primary/40 transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileBarChart2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      {r.is_shared && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Users className="h-3 w-3" /> Compartilhado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/relatorios-custom/${r.id}`)}
                    className="text-left w-full"
                  >
                    <p className="font-medium text-sm line-clamp-1">{r.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
                      {r.description || "Sem descrição"}
                    </p>
                    <Badge variant="secondary" className="text-[10px] mt-2">
                      {ENTITY_LABELS[r.entity] ?? r.entity}
                    </Badge>
                  </button>
                  <div className="flex justify-end mt-3 pt-3 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => {
                        if (confirm(`Remover "${r.name}"?`)) del.mutate(r.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </motion.div>
          ) : (
            <Card className="p-12 glass border-border/40 text-center">
              <FileBarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base font-medium mb-1">Nenhum relatório ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro relatório personalizado em segundos
              </p>
              <Button onClick={() => setCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Criar relatório
              </Button>
            </Card>
          )}
        </div>
      </PageTransition>
    </>
  );
}
