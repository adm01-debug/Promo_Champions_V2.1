import { useState } from "react";
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
import { useClientPortfolio, usePortfolioStats } from "@/hooks/useClientPortfolio";
import { useRoutingHistory, useSalespersonPerformance } from "@/hooks/useLeadRouting";
import { useSalespeople } from "@/hooks/useSalespeople";
import { PortfolioStatsCards } from "@/components/portfolio/PortfolioStatsCards";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { AssignClientDialog } from "@/components/portfolio/AssignClientDialog";
import { AutoRouteDialog } from "@/components/portfolio/AutoRouteDialog";
import { RoutingHistoryTable } from "@/components/portfolio/RoutingHistoryTable";
import { PerformanceRankingCard } from "@/components/portfolio/PerformanceRankingCard";
import { Briefcase, Plus, Search, Filter, Zap, History } from "lucide-react";

export default function Portfolio() {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);

  const salespersonId = selectedSalesperson === "all" ? undefined : selectedSalesperson;

  const { data: portfolio, isLoading: loadingPortfolio } = useClientPortfolio(salespersonId);
  const { data: stats, isLoading: loadingStats } = usePortfolioStats(salespersonId);
  const { data: routingHistory, isLoading: loadingHistory } = useRoutingHistory();
  const { data: performers, isLoading: loadingPerformers } = useSalespersonPerformance();
  const { data: salespeople } = useSalespeople();

  // Filter to Closers and Hybrids (portfolio owners)
  const closers = salespeople?.filter(
    (sp) => sp.role === "closer" || sp.role === "hybrid"
  );

  // Apply filters
  const filteredPortfolio = portfolio?.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client?.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Helmet>
        <title>Portfólio de Clientes | SalesPro</title>
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
          <CardContent>
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
