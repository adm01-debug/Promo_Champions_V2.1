import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useICPData, useUpdateICPData, type ICPData } from "@/hooks/useICPData";
import { useClients } from "@/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { TableSkeleton, PageHeaderSkeleton, SkeletonCard } from "@/components/skeletons/PageLoadingSkeleton";
import { Target, Search, CheckCircle2, XCircle, Filter, Settings2, BarChart3, Users } from "lucide-react";
import { ICPTable } from "@/components/icp/ICPTable";
import { ICPEditDialog } from "@/components/icp/ICPEditDialog";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICPConfigForm } from "@/components/icp/ICPConfigForm";
import { ICPPerformanceChart } from "@/components/icp/ICPPerformanceChart";

export default function ICP() {
  const { data: icpData, isLoading: isLoadingICP } = useICPData();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const updateICP = useUpdateICPData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterICP, setFilterICP] = useState<"all" | "match" | "no-match">("all");
  const [editingICP, setEditingICP] = useState<ICPData | null>(null);
  const [editForm, setEditForm] = useState({ ramo_atividade: "", grupo_nicho: "", capital_social: "", num_colaboradores: "", is_icp_match: false });

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients?.forEach(client => map.set(client.id, client.name));
    return map;
  }, [clients]);

  const filteredData = useMemo(() => {
    if (!icpData) return [];
    return icpData.filter(item => {
      const clientName = clientMap.get(item.client_id) || "";
      const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || item.ramo_atividade?.toLowerCase().includes(searchTerm.toLowerCase()) || item.grupo_nicho?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterICP === "all" || (filterICP === "match" && item.is_icp_match) || (filterICP === "no-match" && !item.is_icp_match);
      return matchesSearch && matchesFilter;
    });
  }, [icpData, clientMap, searchTerm, filterICP]);

  const stats = useMemo(() => {
    if (!icpData) return { total: 0, matches: 0, noMatch: 0 };
    const matches = icpData.filter(i => i.is_icp_match).length;
    return { total: icpData.length, matches, noMatch: icpData.length - matches };
  }, [icpData]);

  const handleEdit = (icp: ICPData) => {
    setEditingICP(icp);
    setEditForm({ ramo_atividade: icp.ramo_atividade || "", grupo_nicho: icp.grupo_nicho || "", capital_social: icp.capital_social?.toString() || "", num_colaboradores: icp.num_colaboradores?.toString() || "", is_icp_match: icp.is_icp_match || false });
  };

  const handleSave = async () => {
    if (!editingICP) return;
    await updateICP.mutateAsync({ id: editingICP.id, ramo_atividade: editForm.ramo_atividade || null, grupo_nicho: editForm.grupo_nicho || null, capital_social: editForm.capital_social ? parseFloat(editForm.capital_social) : null, num_colaboradores: editForm.num_colaboradores ? parseInt(editForm.num_colaboradores) : null, is_icp_match: editForm.is_icp_match });
    setEditingICP(null);
  };

  const isLoading = isLoadingICP || isLoadingClients;

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>ICP - Perfil Ideal de Cliente | PROMO CHAMPIONS</title>
        <meta name="description" content="Gerencie critérios de perfil ideal de clientes" />
      </Helmet>

      <SkeletonTransition isLoading={isLoading} skeleton={<div className="space-y-6"><PageHeaderSkeleton /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div><TableSkeleton rows={6} /></div>}>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text">Ideal Customer Profile</h1>
              <p className="text-muted-foreground mt-1">Inteligência e qualificação de perfil ideal de clientes</p>
            </div>
          </div>

          <Tabs defaultValue="analytics" className="w-full space-y-6">
            <TabsList className="bg-muted/50 p-1 border border-border/40">
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="h-4 w-4" />
                Gestão de Clientes
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Configuração
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass border-border/40 hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Clientes Analisados</p>
                        <p className="text-metric">{stats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass border-border/40 hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ICP Match Rate</p>
                        <p className="text-2xl font-bold text-emerald-500">
                          {stats.total > 0 ? Math.round((stats.matches / stats.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass border-border/40 hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-status-warning/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-status-warning" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Oportunidade de Mercado</p>
                        <p className="text-2xl font-bold text-status-warning">{stats.noMatch}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <ICPPerformanceChart />
            </TabsContent>

            <TabsContent value="clients" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Filters */}
              <Card className="glass border-border/40">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Buscar por cliente, ramo ou nicho..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="pl-9" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant={filterICP === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterICP("all")}>
                        <Filter className="h-4 w-4 mr-1" />Todos
                      </Button>
                      <Button variant={filterICP === "match" ? "default" : "outline"} size="sm" onClick={() => setFilterICP("match")}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />Match
                      </Button>
                      <Button variant={filterICP === "no-match" ? "default" : "outline"} size="sm" onClick={() => setFilterICP("no-match")}>
                        <XCircle className="h-4 w-4 mr-1" />Sem Match
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="glass border-border/40 overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Base de Clientes e Fit ICP
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ICPTable data={filteredData} clientMap={clientMap} onEdit={handleEdit} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ICPConfigForm />
            </TabsContent>
          </Tabs>
        </div>
      </SkeletonTransition>

      <ICPEditDialog open={!!editingICP} onClose={() => setEditingICP(null)} form={editForm} onFormChange={setEditForm} onSave={handleSave} isPending={updateICP.isPending} />
    </>
    </PageTransition>
  );
}
