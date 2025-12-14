import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useICPData, useUpdateICPData } from "@/hooks/useICPData";
import { useClients } from "@/hooks/useClients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { TableSkeleton, HeaderSkeleton, StatCardSkeleton } from "@/components/skeletons/DashboardSkeletons";
import { 
  Target, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Users, 
  Banknote, 
  Tag,
  Edit,
  Filter
} from "lucide-react";

export default function ICP() {
  const { data: icpData, isLoading: isLoadingICP } = useICPData();
  const { data: clients, isLoading: isLoadingClients } = useClients();
  const updateICP = useUpdateICPData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterICP, setFilterICP] = useState<"all" | "match" | "no-match">("all");
  const [editingICP, setEditingICP] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    ramo_atividade: "",
    grupo_nicho: "",
    capital_social: "",
    num_colaboradores: "",
    is_icp_match: false
  });

  // Create a map of client_id to client name
  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients?.forEach(client => {
      map.set(client.id, client.name);
    });
    return map;
  }, [clients]);

  // Filter and search ICP data
  const filteredData = useMemo(() => {
    if (!icpData) return [];
    
    return icpData.filter(item => {
      const clientName = clientMap.get(item.client_id) || "";
      const matchesSearch = 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ramo_atividade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grupo_nicho?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterICP === "all" ||
        (filterICP === "match" && item.is_icp_match) ||
        (filterICP === "no-match" && !item.is_icp_match);
      
      return matchesSearch && matchesFilter;
    });
  }, [icpData, clientMap, searchTerm, filterICP]);

  // Stats
  const stats = useMemo(() => {
    if (!icpData) return { total: 0, matches: 0, noMatch: 0 };
    const matches = icpData.filter(i => i.is_icp_match).length;
    return {
      total: icpData.length,
      matches,
      noMatch: icpData.length - matches
    };
  }, [icpData]);

  const handleEdit = (icp: any) => {
    setEditingICP(icp);
    setEditForm({
      ramo_atividade: icp.ramo_atividade || "",
      grupo_nicho: icp.grupo_nicho || "",
      capital_social: icp.capital_social?.toString() || "",
      num_colaboradores: icp.num_colaboradores?.toString() || "",
      is_icp_match: icp.is_icp_match || false
    });
  };

  const handleSave = async () => {
    if (!editingICP) return;
    
    await updateICP.mutateAsync({
      id: editingICP.id,
      ramo_atividade: editForm.ramo_atividade || null,
      grupo_nicho: editForm.grupo_nicho || null,
      capital_social: editForm.capital_social ? parseFloat(editForm.capital_social) : null,
      num_colaboradores: editForm.num_colaboradores ? parseInt(editForm.num_colaboradores) : null,
      is_icp_match: editForm.is_icp_match
    });
    
    setEditingICP(null);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  };

  const isLoading = isLoadingICP || isLoadingClients;

  return (
    <>
      <Helmet>
        <title>ICP - Perfil Ideal de Cliente | SalesPro</title>
        <meta name="description" content="Gerencie critérios de perfil ideal de clientes" />
      </Helmet>

      <SkeletonTransition
        isLoading={isLoading}
        skeleton={
          <div className="space-y-6">
            <HeaderSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <TableSkeleton rows={6} />
          </div>
        }
      >
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text">
                Perfil Ideal de Cliente
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualize e edite critérios de qualificação ICP
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass border-border/40 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clientes ICP</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-status-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-status-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Match ICP</p>
                    <p className="text-2xl font-bold text-status-success">{stats.matches}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40 hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sem Match</p>
                    <p className="text-2xl font-bold text-muted-foreground">{stats.noMatch}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  <Button
                    variant={filterICP === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterICP("all")}
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Todos
                  </Button>
                  <Button
                    variant={filterICP === "match" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterICP("match")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Match
                  </Button>
                  <Button
                    variant={filterICP === "no-match" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterICP("no-match")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Sem Match
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Dados ICP
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum dado ICP encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Ramo de Atividade</TableHead>
                        <TableHead>Grupo/Nicho</TableHead>
                        <TableHead>Capital Social</TableHead>
                        <TableHead>Colaboradores</TableHead>
                        <TableHead>Status ICP</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <TableRow 
                          key={item.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium">
                            {clientMap.get(item.client_id) || "Cliente Desconhecido"}
                          </TableCell>
                          <TableCell>
                            {item.ramo_atividade ? (
                              <Badge variant="outline" className="gap-1">
                                <Building2 className="h-3 w-3" />
                                {item.ramo_atividade}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.grupo_nicho ? (
                              <Badge variant="outline" className="gap-1">
                                <Tag className="h-3 w-3" />
                                {item.grupo_nicho}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.capital_social ? (
                              <span className="flex items-center gap-1">
                                <Banknote className="h-3 w-3 text-muted-foreground" />
                                {formatCurrency(item.capital_social)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.num_colaboradores ? (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                {item.num_colaboradores}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.is_icp_match ? (
                              <Badge className="bg-status-success/20 text-status-success border-status-success/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Match
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                Sem Match
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="hover-glow"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SkeletonTransition>

      {/* Edit Dialog */}
      <Dialog open={!!editingICP} onOpenChange={() => setEditingICP(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Editar Dados ICP
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ramo">Ramo de Atividade</Label>
              <Input
                id="ramo"
                value={editForm.ramo_atividade}
                onChange={(e) => setEditForm(prev => ({ ...prev, ramo_atividade: e.target.value }))}
                placeholder="Ex: Tecnologia, Varejo, Indústria..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nicho">Grupo/Nicho</Label>
              <Input
                id="nicho"
                value={editForm.grupo_nicho}
                onChange={(e) => setEditForm(prev => ({ ...prev, grupo_nicho: e.target.value }))}
                placeholder="Ex: E-commerce, B2B, SaaS..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">Capital Social (R$)</Label>
              <Input
                id="capital"
                type="number"
                value={editForm.capital_social}
                onChange={(e) => setEditForm(prev => ({ ...prev, capital_social: e.target.value }))}
                placeholder="Ex: 500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colaboradores">Número de Colaboradores</Label>
              <Input
                id="colaboradores"
                type="number"
                value={editForm.num_colaboradores}
                onChange={(e) => setEditForm(prev => ({ ...prev, num_colaboradores: e.target.value }))}
                placeholder="Ex: 50"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="match">Match ICP</Label>
              <Switch
                id="match"
                checked={editForm.is_icp_match}
                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_icp_match: checked }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingICP(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateICP.isPending}>
              {updateICP.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
