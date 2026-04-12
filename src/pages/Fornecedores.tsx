import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Truck, Plus, AlertTriangle, Star, Building2, TrendingUp, Shield } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierTable } from "@/components/fornecedores/SupplierTable";
import { PageTransition } from "@/components/transitions/PageTransition";

export default function Fornecedores() {
  const { suppliers, suppliersLoading, riskAssessments, createSupplier, isCreating } = useSuppliers();
  const [isOpen, setIsOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact_name: '', email: '', phone: '', cnpj: '', category: 'geral', payment_terms: '30 dias', lead_time_days: 7 });

  const handleCreate = () => {
    createSupplier(newSupplier);
    setIsOpen(false);
    setNewSupplier({ name: '', contact_name: '', email: '', phone: '', cnpj: '', category: 'geral', payment_terms: '30 dias', lead_time_days: 7 });
  };

  const getRiskBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = { low: "outline", medium: "secondary", high: "destructive", critical: "destructive" };
    const labels: Record<string, string> = { low: "Baixo", medium: "Médio", high: "Alto", critical: "Crítico" };
    return <Badge variant={variants[level] || "outline"}>{labels[level] || level}</Badge>;
  };

  const activeSuppliers = suppliers?.filter(s => s.is_active) || [];
  const highRiskSuppliers = riskAssessments?.filter(r => r.risk_level === 'high' || r.risk_level === 'critical') || [];

  return (
    <PageTransition>
    <>
      <Helmet>
        <title>Fornecedores | PROMO CHAMPIONS</title>
        <meta name="description" content="Gestão de fornecedores, preços e análise de risco" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-page-title flex items-center gap-2"><Truck className="h-6 w-6 text-primary" />Gestão de Fornecedores</h1>
              <p className="text-muted-foreground">Cadastre, compare e analise seus fornecedores</p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Fornecedor</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Adicionar Fornecedor</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Nome da Empresa *</Label><Input value={newSupplier.name} onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))} placeholder="Nome do fornecedor" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Contato</Label><Input value={newSupplier.contact_name} onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_name: e.target.value }))} placeholder="Nome do contato" /></div>
                    <div className="space-y-2"><Label>CNPJ</Label><Input value={newSupplier.cnpj} onChange={(e) => setNewSupplier(prev => ({ ...prev, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))} placeholder="email@empresa.com" /></div>
                    <div className="space-y-2"><Label>Telefone</Label><Input value={newSupplier.phone} onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))} placeholder="(00) 00000-0000" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Prazo de Pagamento</Label><Input value={newSupplier.payment_terms} onChange={(e) => setNewSupplier(prev => ({ ...prev, payment_terms: e.target.value }))} placeholder="30 dias" /></div>
                    <div className="space-y-2"><Label>Lead Time (dias)</Label><Input type="number" value={newSupplier.lead_time_days} onChange={(e) => setNewSupplier(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) }))} /></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreate} disabled={!newSupplier.name || isCreating}>{isCreating ? 'Salvando...' : 'Salvar'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/40 hover-lift-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Building2 className="h-4 w-4" />Total de Fornecedores</CardTitle></CardHeader><CardContent><div className="text-metric">{suppliers?.length || 0}</div></CardContent></Card>
            <Card className="glass border-status-success/30 bg-status-success/5"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-status-success flex items-center gap-2"><TrendingUp className="h-4 w-4" />Fornecedores Ativos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-status-success">{activeSuppliers.length}</div></CardContent></Card>
            <Card className="glass border-status-warning/30 bg-status-warning/5"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-status-warning flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Alto Risco</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-status-warning">{highRiskSuppliers.length}</div></CardContent></Card>
            <Card className="glass border-border/40 hover-lift-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4" />Média Confiabilidade</CardTitle></CardHeader><CardContent><div className="text-metric">{suppliers?.length ? Math.round((suppliers.reduce((sum, s) => sum + (s.reliability_score || 0), 0) / suppliers.length) * 100) : 0}%</div></CardContent></Card>
          </div>

          <SupplierTable suppliers={suppliers as never[]} isLoading={suppliersLoading} />

          <Card className="glass border-border/40 hover-lift-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Análises de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              {riskAssessments && riskAssessments.length > 0 ? (
                <div className="space-y-4">
                  {riskAssessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30">
                      <div><div className="font-medium">{assessment.suppliers?.name}</div><div className="text-sm text-muted-foreground">Avaliado em {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}</div></div>
                      <div className="flex items-center gap-4"><div className="text-right"><div className="text-sm text-muted-foreground">Risco Geral</div><div className="font-medium">{Math.round((assessment.overall_risk || 0) * 100)}%</div></div>{getRiskBadge(assessment.risk_level)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground"><p>Nenhuma análise de risco realizada.</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
    </PageTransition>
  );
}
