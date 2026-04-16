import React, { useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CACHE_TIMES } from "@/constants";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Mail, Clock, Plus, Trash2, Calendar, Send } from "lucide-react";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  report_type: string;
  is_active: boolean;
  next_run: string;
}

// Local state management (no DB table needed yet)
const useScheduledReports = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      name: "Resumo Diário de Vendas",
      frequency: "daily",
      recipients: ["gestor@empresa.com"],
      report_type: "sales_summary",
      is_active: true,
      next_run: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: "2",
      name: "Pipeline Semanal",
      frequency: "weekly",
      recipients: ["equipe@empresa.com"],
      report_type: "pipeline_status",
      is_active: true,
      next_run: new Date(Date.now() + 604800000).toISOString(),
    },
    {
      id: "3",
      name: "KPIs Mensais",
      frequency: "monthly",
      recipients: ["diretoria@empresa.com"],
      report_type: "monthly_kpis",
      is_active: false,
      next_run: new Date(Date.now() + 2592000000).toISOString(),
    },
  ]);

  const addReport = useCallback((report: Omit<ScheduledReport, "id">) => {
    setReports((prev) => [...prev, { ...report, id: crypto.randomUUID() }]);
    toast.success("Relatório agendado criado!");
  }, []);

  const toggleReport = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Relatório removido");
  }, []);

  return { reports, addReport, toggleReport, deleteReport };
};

const FREQ_LABELS: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
};

const REPORT_TYPES = [
  { value: "sales_summary", label: "Resumo de Vendas" },
  { value: "pipeline_status", label: "Status do Pipeline" },
  { value: "monthly_kpis", label: "KPIs Mensais" },
  { value: "team_performance", label: "Performance da Equipe" },
  { value: "lead_conversion", label: "Conversão de Leads" },
];

const ScheduledReports = () => {
  const { reports, addReport, toggleReport, deleteReport } = useScheduledReports();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFreq, setNewFreq] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [newType, setNewType] = useState("sales_summary");
  const [newEmail, setNewEmail] = useState("");

  const handleAdd = useCallback(() => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Preencha nome e email");
      return;
    }
    const nextRun = newFreq === "daily"
      ? Date.now() + 86400000
      : newFreq === "weekly"
        ? Date.now() + 604800000
        : Date.now() + 2592000000;

    addReport({
      name: newName,
      frequency: newFreq,
      recipients: newEmail.split(",").map((e) => e.trim()),
      report_type: newType,
      is_active: true,
      next_run: new Date(nextRun).toISOString(),
    });
    setNewName("");
    setNewEmail("");
    setShowForm(false);
  }, [newName, newFreq, newType, newEmail, addReport]);

  return (
    <>
      <Helmet>
        <title>Relatórios Agendados | Promo Champions</title>
        <meta name="description" content="Configure relatórios automáticos por email." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">Relatórios Agendados</h1>
              <p className="text-sm text-muted-foreground mt-1">Receba KPIs automaticamente por email</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </motion.div>

          {/* New report form */}
          {showForm && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 glass border-border/40 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Nome do relatório"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Input
                    placeholder="Email(s) — separar com vírgula"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Select value={newFreq} onValueChange={(v) => setNewFreq(v as "daily" | "weekly" | "monthly")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleAdd}>Criar Agendamento</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Reports list */}
          <motion.div variants={itemVariants} className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className={cn(
                "p-4 glass border-border/40 flex items-center gap-4",
                !r.is_active && "opacity-50"
              )}>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.recipients.join(", ")}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  <Clock className="h-3 w-3 mr-1" />
                  {FREQ_LABELS[r.frequency]}
                </Badge>
                <Badge variant={r.is_active ? "default" : "secondary"} className="text-xs shrink-0 cursor-pointer" onClick={() => toggleReport(r.id)}>
                  {r.is_active ? "Ativo" : "Pausado"}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteReport(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </motion.div>
        </div>
      </PageTransition>
    </>
  );
};

export default ScheduledReports;
