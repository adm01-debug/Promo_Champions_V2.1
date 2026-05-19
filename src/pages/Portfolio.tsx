import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientPortfolio, usePortfolioStats } from "@/hooks/useClientPortfolio";
import { useRoutingHistory, useSalespersonPerformance } from "@/hooks/useLeadRouting";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import { useICPDataMap } from "@/hooks/useICPData";
import { PortfolioStatsCards } from "@/components/portfolio/PortfolioStatsCards";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { AssignClientDialog } from "@/components/portfolio/AssignClientDialog";
import { AutoRouteDialog } from "@/components/portfolio/AutoRouteDialog";
import { RoutingHistoryTable } from "@/components/portfolio/RoutingHistoryTable";
import { PerformanceRankingCard } from "@/components/portfolio/PerformanceRankingCard";
import { PortfolioDistributionChart } from "@/components/portfolio/PortfolioDistributionChart";
import { PortfolioValueChart } from "@/components/portfolio/PortfolioValueChart";
import { PortfolioICPFilters } from "@/components/portfolio/PortfolioICPFilters";
import { PortfolioCloserGrid } from "@/components/portfolio/PortfolioCloserGrid";
import { Briefcase, Plus, Search, Filter, Zap, History } from "lucide-react";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function Portfolio() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [icpFiltersOpen, setIcpFiltersOpen] = useState(false);
  const [icpMatchOnly, setIcpMatchOnly] = useState(false);
  const [ramoFilter, setRamoFilter] = useState<string>("all");
  const [nichoFilter, setNichoFilter] = useState<string>("all");
  const [minCapital, setMinCapital] = useState<string>("");
  const [minColaboradores, setMinColaboradores] = useState<string>("");

  const salespersonId = selectedSalesperson === "all" ? undefined : selectedSalesperson;
  const { data: portfolio, isLoading: loadingPortfolio } = useClientPortfolio(salespersonId);
  const { data: stats, isLoading: loadingStats } = usePortfolioStats(salespersonId);
  const { data: routingHistory, isLoading: loadingHistory } = useRoutingHistory();
  const { data: performers, isLoading: loadingPerformers } = useSalespersonPerformance();
  const { data: salespeople } = useSalespeople();
  const { icpMap } = useICPDataMap();

  const closers = salespeople?.filter((sp) => sp.role === "closer" || sp.role === "hybrid");

  const { ramos, nichos } = useMemo(() => {
    const ramoSet = new Set<string>();
    const nichoSet = new Set<string>();
    icpMap.forEach((icp) => {
      if (icp.ramo_atividade) ramoSet.add(icp.ramo_atividade);
      if (icp.grupo_nicho) nichoSet.add(icp.grupo_nicho);
    });
    return { ramos: Array.from(ramoSet).sort(), nichos: Array.from(nichoSet).sort() };
  }, [icpMap]);

  const activeIcpFilters = useMemo(() => {
    let count = 0;
    if (icpMatchOnly) count++;
    if (ramoFilter !== "all") count++;
    if (nichoFilter !== "all") count++;
    if (minCapital) count++;
    if (minColaboradores) count++;
    return count;
  }, [icpMatchOnly, ramoFilter, nichoFilter, minCapital, minColaboradores]);

  const clearIcpFilters = () => {
    setIcpMatchOnly(false);
    setRamoFilter("all");
    setNichoFilter("all");
    setMinCapital("");
    setMinColaboradores("");
  };

  const filteredPortfolio = useMemo(() => {
    return portfolio?.filter((item) => {
      const matchesSearch = !searchTerm || item.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.client?.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const icpData = item.client_id ? icpMap.get(item.client_id) : null;
      const matchesIcpMatch = !icpMatchOnly || icpData?.is_icp_match;
      const matchesRamo = ramoFilter === "all" || icpData?.ramo_atividade === ramoFilter;
      const matchesNicho = nichoFilter === "all" || icpData?.grupo_nicho === nichoFilter;
      const matchesCapital = !minCapital || (icpData?.capital_social && icpData.capital_social >= parseFloat(minCapital));
      const matchesColaboradores = !minColaboradores || (icpData?.num_colaboradores && icpData.num_colaboradores >= parseInt(minColaboradores));
      return matchesSearch && matchesStatus && matchesIcpMatch && matchesRamo && matchesNicho && matchesCapital && matchesColaboradores;
    });
  }, [portfolio, searchTerm, statusFilter, icpMatchOnly, ramoFilter, nichoFilter, minCapital, minColaboradores, icpMap]);

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Portfólio de Clientes | PROMO CHAMPIONS</title>
        <meta name="description" content="Gerencie o portfólio de clientes por vendedor" />
      </Helmet>

      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-page-title flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center"><Briefcase className="h-5 w-5 text-primary-foreground" /></div>
              Portfólio de Clientes
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie a carteira de clientes por Closer</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRouteDialogOpen(true)}><Zap className="mr-2 h-4 w-4" />Rotear Lead</Button>
            <Button onClick={() => setAssignDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Atribuir Cliente</Button>
          </div>
        </div>

        <PortfolioStatsCards stats={stats} isLoading={loadingStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioDistributionChart portfolio={portfolio || []} salespeople={closers || []} />
          <PortfolioValueChart portfolio={portfolio || []} salespeople={closers || []} />
        </div>

        <Card className="glass">
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Filter className="h-4 w-4" />Filtros</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="Todos os Closers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Closers</SelectItem>
                  {closers?.map((sp) => <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <PortfolioICPFilters
              icpFiltersOpen={icpFiltersOpen} setIcpFiltersOpen={setIcpFiltersOpen}
              icpMatchOnly={icpMatchOnly} setIcpMatchOnly={setIcpMatchOnly}
              ramoFilter={ramoFilter} setRamoFilter={setRamoFilter}
              nichoFilter={nichoFilter} setNichoFilter={setNichoFilter}
              minCapital={minCapital} setMinCapital={setMinCapital}
              minColaboradores={minColaboradores} setMinColaboradores={setMinColaboradores}
              ramos={ramos} nichos={nichos} activeIcpFilters={activeIcpFilters} onClear={clearIcpFilters}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="by-closer">Por Closer</TabsTrigger>
            <TabsTrigger value="routing" className="flex items-center gap-1"><History className="h-3 w-3" />Roteamentos</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Card className="glass"><CardContent className="pt-6"><PortfolioTable data={filteredPortfolio} isLoading={loadingPortfolio} /></CardContent></Card>
          </TabsContent>
          <TabsContent value="by-closer">
            <PortfolioCloserGrid closers={closers || []} portfolio={portfolio || []} />
          </TabsContent>
          <TabsContent value="routing">
            <Card className="glass">
              <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" />Histórico de Roteamentos</CardTitle></CardHeader>
              <CardContent><RoutingHistoryTable data={routingHistory} isLoading={loadingHistory} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ranking"><PerformanceRankingCard data={performers} isLoading={loadingPerformers} /></TabsContent>
        </Tabs>
      </div>

      <AssignClientDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} />
      <AutoRouteDialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen} />
    </>
    </PageTransition>
  );
}
