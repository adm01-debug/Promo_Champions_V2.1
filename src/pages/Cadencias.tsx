import { useCadences, useCadenceSteps, useDeleteCadence, useCadenceStats, Cadence as CadenceRecord, ProspectCadence } from "@/hooks/useCadences";
import { Helmet } from "react-helmet-async";
import { CreateCadenceDialog } from "@/components/cadences/CreateCadenceDialog";
import { EnrollmentRulesDialog } from "@/components/cadences/EnrollmentRulesDialog";
import { ABTestDialog } from "@/components/cadences/ABTestDialog";
import { CadenceCard } from "@/components/cadences/CadenceCard";
import { ContactRulesDialog } from "@/components/cadences/ContactRulesDialog";
import { TodaysCadenceTasks } from "@/components/cadences/TodaysCadenceTasks";
import { CadenceMetricsPanel } from "@/components/cadences/CadenceMetricsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Zap, Clock, CheckCircle, Search, Filter, PauseCircle, LayoutDashboard, Settings2, FileText, ChevronDown, CheckCircle2, Sparkles } from "lucide-react";
import { CadenciasLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { useState, useMemo } from "react";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadenceTemplateManager } from "@/components/sales/cadence/CadenceTemplateManager";
import { ContactFrequencyRules } from "@/components/sales/cadence/ContactFrequencyRules";
import { CadenceSimulationDialog } from "@/components/sales/cadence/CadenceSimulationDialog";
import { CadenceFunnel } from "@/components/sales/cadence/CadenceFunnel";
import { CadenceReportPanel } from "@/components/sales/cadence/CadenceReportPanel";
import { CadenceFunnelConfig } from "@/components/sales/cadence/CadenceFunnelConfig";
import { LeadDetailedAuditLogs } from "@/components/sales/cadence/LeadDetailedAuditLogs";
import { CadenceAlertConfig } from "@/components/sales/cadence/CadenceAlertConfig";
import { CadenceOutcomeConfig } from "@/components/sales/cadence/CadenceOutcomeConfig";
import { RuleAuditLogs } from "@/components/sales/cadence/RuleAuditLogs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProspectCadences } from "@/hooks/cadences/useCadenceQueries";
import { EliteCadenceAnalytics } from "@/components/sales/cadence/EliteCadenceAnalytics";

export default function Cadencias() {
  const { data: cadences, isLoading } = useCadences();
  const { data: cadenceStats } = useCadenceStats();
  const deleteCadence = useDeleteCadence();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { data: allProspects } = useProspectCadences();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Auto-process trigger
  useState(() => {
    supabase.functions.invoke('process-cadence-tasks').catch(console.error);
  });

  const activeCadences = cadences?.filter(c => c.is_active) || [];

  const filteredCadences = useMemo(() => {
    if (!cadences) return [];
    return cadences.filter(c => {
      const matchesSearch = !searchTerm || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && c.is_active) ||
        (statusFilter === "inactive" && !c.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [cadences, searchTerm, statusFilter]);

  return (
    <PageTransition>
      <>
      <Helmet>
        <title>Cadências | Promo Champions</title>
        <meta name="description" content="Gerenciamento de cadências de prospecção" />
      </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<CadenciasLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title gradient-text">Gestão de Cadências</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Crie sequências automáticas de contato para seus prospects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Automação</span>
              </div>
              <CadenceSimulationDialog />
              <EnrollmentRulesDialog />
              <ContactRulesDialog />
              <ABTestDialog />
              <CreateCadenceDialog />
            </div>
          </div>
        </div>

        {/* Tabs System */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-muted/50 border border-border/40 p-1">
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-background">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Monitoramento
              </TabsTrigger>
              <TabsTrigger value="elite-analytics" className="data-[state=active]:bg-background">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Elite Analytics
              </TabsTrigger>
              <TabsTrigger value="strategy" className="data-[state=active]:bg-background">
                <Settings2 className="h-4 w-4 mr-2" />
                Estratégia e Regras
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-background">
                <FileText className="h-4 w-4 mr-2" />
                Templates SINGU
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-background">
                <Search className="h-4 w-4 mr-2" />
                Auditoria por Lead
              </TabsTrigger>
              <TabsTrigger value="rule-audit" className="data-[state=active]:bg-background">
                <Zap className="h-4 w-4 mr-2" />
                Auditoria de Regras
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <CreateCadenceDialog />
            </div>
          </div>

          <TabsContent value="monitoring" className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass border-border/40 hover-lift-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-metric">{activeCadences.length}</p>
                    <p className="text-xs text-muted-foreground">Cadências Ativas</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border/40 hover-lift-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-info/10">
                    <Clock className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-metric">{cadenceStats?.prospectsInCadence ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Prospects em Cadência</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border/40 hover-lift-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-metric">{cadenceStats?.tasksCompletedToday ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Tarefas Concluídas Hoje</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass border-border/40 hover-lift-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-status-warning/10">
                    <PauseCircle className="h-5 w-5 text-status-warning" />
                  </div>
                  <div>
                    <p className="text-metric">{cadenceStats?.autoPausedLast7Days ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Auto-pausadas (7d)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <CadenceFunnel />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Tasks + Metrics */}
              <div className="space-y-6">
                <TodaysCadenceTasks />
                <CadenceReportPanel />
              </div>

              {/* Cadences List */}
              <div className="lg:col-span-2">
                <Card className="glass border-border/40 hover-lift-sm h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        Suas Cadências
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {filteredCadences.length} de {cadences?.length || 0}
                      </Badge>
                    </div>
                    {/* Search & Filter */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar cadência..."
                          className="h-8 pl-8 text-xs bg-muted/30 border-border/50 focus:border-primary"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as "all" | "active" | "inactive")}>
                        <SelectTrigger className="h-8 w-[120px] text-xs bg-muted/30 border-border/50">
                          <Filter className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass border-border/50">
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="active">Ativas</SelectItem>
                          <SelectItem value="inactive">Inativas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredCadences.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <GitBranch className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm font-medium">
                          {cadences?.length === 0 ? "Nenhuma cadência criada" : "Nenhuma cadência encontrada"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredCadences.map(cadence => (
                          <CadenceCardWithSteps
                            key={cadence.id}
                            cadence={cadence}
                            onDelete={() => deleteCadence.mutate(cadence.id)}
                            isDeleting={deleteCadence.isPending}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="elite-analytics" className="animate-in fade-in-50 duration-500">
            <EliteCadenceAnalytics />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ContactFrequencyRules />
                <CadenceFunnelConfig />
                <CadenceAlertConfig />
                <CadenceOutcomeConfig />
              </div>
              <div className="space-y-6">
                <Card className="glass border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Configurações de Automação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <EnrollmentRulesDialog />
                    <ContactRulesDialog />
                    <ABTestDialog />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="audit" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass border-border/40 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Selecionar Lead</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-2 space-y-1">
                      {allProspects?.map((p: any) => (
                        <Button
                          key={p.id}
                          variant={selectedLeadId === p.sale_id ? "secondary" : "ghost"}
                          className="w-full justify-start text-xs h-auto py-3 px-4 flex flex-col items-start gap-1 text-left"
                          onClick={() => setSelectedLeadId(p.sale_id)}
                        >
                          <span className="font-bold">{(p as any).sale?.client_name || (p as any).client_name || "Lead sem nome"}</span>
                          <span className="text-[10px] text-muted-foreground">Status: {p.status} | Etapa: {p.funnel_stage}</span>
                        </Button>
                      ))}
                      {(!allProspects || allProspects.length === 0) && (
                        <div className="p-8 text-center text-muted-foreground text-xs">
                          Nenhum lead em cadência encontrado.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                {selectedLeadId ? (
                  <LeadDetailedAuditLogs 
                    clientId={selectedLeadId} 
                    clientName={(allProspects?.find((p: any) => p.sale_id === selectedLeadId) as any)?.sale?.client_name || (allProspects?.find((p: any) => p.sale_id === selectedLeadId) as any)?.client_name || "Lead"} 
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 glass border border-dashed rounded-xl border-border/40 text-muted-foreground">
                    <Search className="h-12 w-12 opacity-20 mb-3" />
                    <p className="text-sm">Selecione um lead para ver o histórico detalhado.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rule-audit" className="animate-in fade-in-50 duration-500">
            <RuleAuditLogs />
          </TabsContent>

          <TabsContent value="templates" className="animate-in fade-in-50 duration-500">
            <CadenceTemplateManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </SkeletonTransition>
      </>
    </PageTransition>
  );
}

function CadenceCardWithSteps({
  cadence, 
  onDelete,
  isDeleting,
}: { 
  cadence: CadenceRecord; 
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const { data: steps } = useCadenceSteps(cadence.id);
  
  return (
    <CadenceCard
      cadence={cadence}
      steps={steps || []}
      onDelete={onDelete}
      isDeleting={isDeleting}
    />
  );
}
