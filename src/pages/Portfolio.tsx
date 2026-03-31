// Portfolio page
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useClientPortfolio, usePortfolioStats } from "@/hooks/useClientPortfolio";
import { useRoutingHistory, useSalespersonPerformance } from "@/hooks/useLeadRouting";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useICPDataMap } from "@/hooks/useICPData";
import { PortfolioStatsCards } from "@/components/portfolio/PortfolioStatsCards";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { AssignClientDialog } from "@/components/portfolio/AssignClientDialog";
import { AutoRouteDialog } from "@/components/portfolio/AutoRouteDialog";
import { RoutingHistoryTable } from "@/components/portfolio/RoutingHistoryTable";
import { PerformanceRankingCard } from "@/components/portfolio/PerformanceRankingCard";
import { Briefcase, Plus, Search, Filter, Zap, History, ChevronDown, Target, Building2, Users, Banknote, Tag, X } from "lucide-react";

export default function Portfolio() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  
  // ICP Filters
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

  // Filter to Closers and Hybrids (portfolio owners)
  const closers = salespeople?.filter(
    (sp) => sp.role === "closer" || sp.role === "hybrid"
  );

  // Get unique ramos and nichos for filter options
  const { ramos, nichos } = useMemo(() => {
    const ramoSet = new Set<string>();
    const nichoSet = new Set<string>();
    
    icpMap.forEach((icp) => {
      if (icp.ramo_atividade) ramoSet.add(icp.ramo_atividade);
      if (icp.grupo_nicho) nichoSet.add(icp.grupo_nicho);
    });
    
    return {
      ramos: Array.from(ramoSet).sort(),
      nichos: Array.from(nichoSet).sort()
    };
  }, [icpMap]);

  // Count active ICP filters
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

  // Apply filters including ICP
  const filteredPortfolio = useMemo(() => {
    return portfolio?.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client?.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // ICP filters
      const icpData = item.client_id ? icpMap.get(item.client_id) : null;
      
      const matchesIcpMatch = !icpMatchOnly || icpData?.is_icp_match;
      
      const matchesRamo = ramoFilter === "all" || 
        icpData?.ramo_atividade === ramoFilter;
      
      const matchesNicho = nichoFilter === "all" || 
        icpData?.grupo_nicho === nichoFilter;
      
      const matchesCapital = !minCapital || 
        (icpData?.capital_social && icpData.capital_social >= parseFloat(minCapital));
      
      const matchesColaboradores = !minColaboradores || 
        (icpData?.num_colaboradores && icpData.num_colaboradores >= parseInt(minColaboradores));

      return matchesSearch && matchesStatus && matchesIcpMatch && 
             matchesRamo && matchesNicho && matchesCapital && matchesColaboradores;
    });
  }, [portfolio, searchTerm, statusFilter, icpMatchOnly, ramoFilter, nichoFilter, minCapital, minColaboradores, icpMap]);

  return (
    <>
      <Helmet>
        <title>Portfólio de Clientes | PROMO CHAMPIONS</title>
        <meta
          name="description"
          content="Gerencie o portfólio de clientes por vendedor"
        />
      </Helmet>

      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              Portfólio de Clientes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie a carteira de clientes por Closer
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRouteDialogOpen(true)}>
              <Zap className="mr-2 h-4 w-4" />
              Rotear Lead
            </Button>
            <Button onClick={() => setAssignDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Atribuir Cliente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <PortfolioStatsCards stats={stats} isLoading={loadingStats} />

        {/* Filters */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Filters */}
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={selectedSalesperson}
                onValueChange={setSelectedSalesperson}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Todos os Closers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Closers</SelectItem>
                  {closers?.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ICP Filters - Collapsible */}
            <Collapsible open={icpFiltersOpen} onOpenChange={setIcpFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Filtros ICP Avançados</span>
                    {activeIcpFilters > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeIcpFilters} ativo{activeIcpFilters > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${icpFiltersOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
                  {/* ICP Match Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-status-success" />
                      <Label htmlFor="icp-match" className="font-medium">Apenas Match ICP</Label>
                    </div>
                    <Switch
                      id="icp-match"
                      checked={icpMatchOnly}
                      onCheckedChange={setIcpMatchOnly}
                    />
                  </div>

                  {/* ICP Criteria Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Ramo de Atividade */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3" />
                        Ramo de Atividade
                      </Label>
                      <Select value={ramoFilter} onValueChange={setRamoFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {ramos.map((ramo) => (
                            <SelectItem key={ramo} value={ramo}>
                              {ramo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Grupo/Nicho */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm">
                        <Tag className="h-3 w-3" />
                        Grupo/Nicho
                      </Label>
                      <Select value={nichoFilter} onValueChange={setNichoFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {nichos.map((nicho) => (
                            <SelectItem key={nicho} value={nicho}>
                              {nicho}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Capital Social Mínimo */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm">
                        <Banknote className="h-3 w-3" />
                        Capital Mínimo (R$)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Ex: 100000"
                        value={minCapital}
                        onChange={(e) => setMinCapital(e.target.value)}
                      />
                    </div>

                    {/* Colaboradores Mínimo */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        Colaboradores Mín.
                      </Label>
                      <Input
                        type="number"
                        placeholder="Ex: 10"
                        value={minColaboradores}
                        onChange={(e) => setMinColaboradores(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {activeIcpFilters > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearIcpFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar filtros ICP
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Portfolio Table */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="by-closer">Por Closer</TabsTrigger>
            <TabsTrigger value="routing" className="flex items-center gap-1">
              <History className="h-3 w-3" />
              Roteamentos
            </TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <Card className="glass">
              <CardContent className="pt-6">
                <PortfolioTable
                  data={filteredPortfolio}
                  isLoading={loadingPortfolio}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-closer">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closers?.map((closer) => {
                const closerPortfolio = portfolio?.filter(
                  (p) => p.salesperson_id === closer.id
                );
                const activeCount =
                  closerPortfolio?.filter((p) => p.status === "active").length || 0;
                const inactiveCount =
                  closerPortfolio?.filter((p) => p.status === "inactive").length ||
                  0;

                return (
                  <Card key={closer.id} className="glass hover-lift">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {closer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{closer.name}</CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">
                            {closer.role}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-status-success/10">
                          <p className="text-2xl font-bold text-status-success">
                            {activeCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Ativos</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-status-warning/10">
                          <p className="text-2xl font-bold text-status-warning">
                            {inactiveCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Inativos</p>
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-3">
                        Total: {closerPortfolio?.length || 0} clientes
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="routing">
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Roteamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RoutingHistoryTable data={routingHistory} isLoading={loadingHistory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking">
            <PerformanceRankingCard data={performers} isLoading={loadingPerformers} />
          </TabsContent>
        </Tabs>
      </div>

      <AssignClientDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />

      <AutoRouteDialog
        open={routeDialogOpen}
        onOpenChange={setRouteDialogOpen}
      />
    </>
  );
}
