import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Users, Plus, RefreshCw, Crown, Target, Heart, 
  AlertTriangle, FileText, TrendingUp, Shield, Zap, Search,
  Hierarchy, ChevronRight
} from "lucide-react";
import {
  useAccounts,
  useAccountContacts,
  useCreateAccount,
  useCreateContact,
  useRecalculateAccountScore,
  useAccountPlan,
  useUpdateAccountPlan,
  type Account,
  type AccountTier,
  type BuyingRole,
  type AccountPlan
} from "@/hooks/abm/useAccounts";


const tierLabel: Record<AccountTier, string> = {
  strategic: "Estratégica",
  enterprise: "Enterprise",
  mid_market: "Mid-Market",
  smb: "SMB",
};

const roleLabel: Record<BuyingRole, string> = {
  decision_maker: "Decisor",
  champion: "Champion",
  influencer: "Influenciador",
  blocker: "Bloqueador",
  user: "Usuário",
  technical: "Técnico",
};

const roleIcon: Record<BuyingRole, JSX.Element> = {
  decision_maker: <Crown className="h-4 w-4 text-amber-500" />,
  champion: <Heart className="h-4 w-4 text-rose-500" />,
  influencer: <Target className="h-4 w-4 text-blue-500" />,
  blocker: <AlertTriangle className="h-4 w-4 text-destructive" />,
  user: <Users className="h-4 w-4 text-muted-foreground" />,
  technical: <Users className="h-4 w-4 text-muted-foreground" />,
};

const healthVariant = (status: string) => {
  if (status === "healthy") return "default";
  if (status === "at_risk") return "secondary";
  if (status === "critical") return "destructive";
  return "outline";
};

export default function AccountBasedSelling() {
  const { data: accounts, isLoading } = useAccounts();
  const [selected, setSelected] = useState<Account | null>(null);
  const { data: contacts } = useAccountContacts(selected?.id ?? null);
  const createAccount = useCreateAccount();
  const createContact = useCreateContact();
  const recalc = useRecalculateAccountScore();

  const [newAccountOpen, setNewAccountOpen] = useState(false);
  const [newContactOpen, setNewContactOpen] = useState(false);

  const [accForm, setAccForm] = useState({ name: "", tier: "smb" as AccountTier, industry: "", annual_revenue: "", employee_count: "" });
  const [ctForm, setCtForm] = useState({ name: "", email: "", job_title: "", buying_role: "user" as BuyingRole, influence_level: 3 });

  const handleCreateAccount = () => {
    createAccount.mutate({
      name: accForm.name,
      tier: accForm.tier,
      industry: accForm.industry || null,
      annual_revenue: accForm.annual_revenue ? Number(accForm.annual_revenue) : null,
      employee_count: accForm.employee_count ? Number(accForm.employee_count) : null,
    }, {
      onSuccess: () => {
        setNewAccountOpen(false);
        setAccForm({ name: "", tier: "smb", industry: "", annual_revenue: "", employee_count: "" });
      }
    });
  };

  const handleCreateContact = () => {
    if (!selected) return;
    createContact.mutate({
      account_id: selected.id,
      name: ctForm.name,
      email: ctForm.email || null,
      job_title: ctForm.job_title || null,
      buying_role: ctForm.buying_role,
      influence_level: ctForm.influence_level,
    }, {
      onSuccess: () => {
        setNewContactOpen(false);
        setCtForm({ name: "", email: "", job_title: "", buying_role: "user", influence_level: 3 });
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Account-Based Selling | Promo Champions</title>
        <meta name="description" content="Gestão estratégica de contas com hierarquia, buying committee e account scoring." />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-page-title font-bold flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              Account-Based Selling
            </h1>
            <p className="text-muted-foreground mt-1">
              Estratégia de venda em contas-chave com multi-threading e buying committee.
            </p>
          </div>
          <Dialog open={newAccountOpen} onOpenChange={setNewAccountOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Conta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Conta Estratégica</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome *</Label><Input value={accForm.name} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} /></div>
                <div>
                  <Label>Tier</Label>
                  <Select value={accForm.tier} onValueChange={(v) => setAccForm({ ...accForm, tier: v as AccountTier })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(tierLabel) as AccountTier[]).map(t => (
                        <SelectItem key={t} value={t}>{tierLabel[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Indústria</Label><Input value={accForm.industry} onChange={(e) => setAccForm({ ...accForm, industry: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Receita Anual (R$)</Label><Input type="number" value={accForm.annual_revenue} onChange={(e) => setAccForm({ ...accForm, annual_revenue: e.target.value })} /></div>
                  <div><Label>Funcionários</Label><Input type="number" value={accForm.employee_count} onChange={(e) => setAccForm({ ...accForm, employee_count: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateAccount} disabled={!accForm.name || createAccount.isPending}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de contas */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Contas ({accounts?.length ?? 0})</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
              {!isLoading && (!accounts || accounts.length === 0) && (
                <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
              )}
              {accounts?.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selected?.id === a.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.name}</span>
                    <Badge variant={healthVariant(a.health_status)}>{a.account_score}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{tierLabel[a.tier]}</Badge>
                    {a.industry && <span className="text-xs text-muted-foreground">{a.industry}</span>}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Detalhes */}
          <Card className="lg:col-span-2">
            {!selected ? (
              <CardContent className="p-12 text-center text-muted-foreground">
                Selecione uma conta para ver detalhes e o Plano Estratégico.
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{selected.name}</CardTitle>
                        {selected.parent_account_id && (
                          <Badge variant="outline" className="text-[10px] h-4">Subsidiária</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {tierLabel[selected.tier]} {selected.industry && `· ${selected.industry}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => recalc.mutate(selected.id)} disabled={recalc.isPending}>
                        <RefreshCw className={`h-4 w-4 ${recalc.isPending ? 'animate-spin' : ''} mr-2`} /> Score
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full max-w-[400px]">
                      <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                      <TabsTrigger value="committee">Buying Committee</TabsTrigger>
                      <TabsTrigger value="plan">Account Plan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Card variant="outline">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Label className="text-xs text-muted-foreground mb-1">Health Status</Label>
                            <Badge variant={healthVariant(selected.health_status)} className="capitalize">
                              {selected.health_status.replace('_', ' ')}
                            </Badge>
                          </CardContent>
                        </Card>
                        <Card variant="outline">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Label className="text-xs text-muted-foreground mb-1">Account Score</Label>
                            <span className="text-2xl font-bold text-primary">{selected.account_score}</span>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso do Engajamento</span>
                          <span className="font-medium">{selected.account_score}%</span>
                        </div>
                        <Progress value={selected.account_score} className="h-2" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Indústria</Label>
                          <p className="text-sm font-medium">{selected.industry || "Não informado"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Website</Label>
                          <p className="text-sm font-medium">
                            {selected.website ? (
                              <a href={selected.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                {selected.website} <Search className="h-3 w-3" />
                              </a>
                            ) : "—"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Receita Estimada</Label>
                          <p className="text-sm font-medium">{selected.annual_revenue ? `R$ ${selected.annual_revenue.toLocaleString()}` : "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Colaboradores</Label>
                          <p className="text-sm font-medium">{selected.employee_count || "—"}</p>
                        </div>
                      </div>

                      {selected.notes && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Contexto da Conta</Label>
                          <p className="text-sm mt-2 whitespace-pre-wrap leading-relaxed">{selected.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="committee" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Contatos Mapeados ({contacts?.length ?? 0})
                          </h3>
                          <p className="text-xs text-muted-foreground">Mapeamento de stakeholders e multi-threading.</p>
                        </div>
                        <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Stakeholder</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Adicionar ao Buying Committee</DialogTitle></DialogHeader>
                            <div className="space-y-3">
                              <div><Label>Nome *</Label><Input value={ctForm.name} onChange={(e) => setCtForm({ ...ctForm, name: e.target.value })} /></div>
                              <div><Label>E-mail</Label><Input type="email" value={ctForm.email} onChange={(e) => setCtForm({ ...ctForm, email: e.target.value })} /></div>
                              <div><Label>Cargo</Label><Input value={ctForm.job_title} onChange={(e) => setCtForm({ ...ctForm, job_title: e.target.value })} /></div>
                              <div>
                                <Label>Papel na decisão</Label>
                                <Select value={ctForm.buying_role} onValueChange={(v) => setCtForm({ ...ctForm, buying_role: v as BuyingRole })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {(Object.keys(roleLabel) as BuyingRole[]).map(r => (
                                      <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Nível de Influência (1-5)</Label>
                                <Input type="number" min={1} max={5} value={ctForm.influence_level} onChange={(e) => setCtForm({ ...ctForm, influence_level: Number(e.target.value) })} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleCreateContact} disabled={!ctForm.name || createContact.isPending}>Mapear Contato</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="grid gap-3">
                        {(!contacts || contacts.length === 0) && (
                          <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhum stakeholder mapeado ainda.</p>
                          </div>
                        )}
                        {contacts?.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                {roleIcon[c.buying_role]}
                              </div>
                              <div>
                                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{c.name}</p>
                                <p className="text-xs text-muted-foreground">{c.job_title || "Sem cargo"} · <span className="text-primary/70">{roleLabel[c.buying_role]}</span></p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-muted/50">
                                {c.influence_level}/5 Influência
                              </Badge>
                              {c.sentiment && (
                                <Badge variant={c.sentiment === 'positive' ? 'default' : c.sentiment === 'negative' ? 'destructive' : 'secondary'} className="h-5 text-[10px]">
                                  {c.sentiment === 'positive' ? 'Apoiador' : c.sentiment === 'negative' ? 'Detrator' : 'Neutro'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="plan" className="space-y-4">
                      <AccountPlanSection accountId={selected.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            )}
          </Card>

        </div>
      </div>
    </>
  );
function AccountPlanSection({ accountId }: { accountId: string }) {
  const { data: plan, isLoading } = useAccountPlan(accountId);
  const updatePlan = useUpdateAccountPlan();
  
  const [form, setForm] = useState<Partial<AccountPlan>>({
    executive_summary: "",
    account_strategy: "",
    revenue_target: 0
  });

  const handleSave = () => {
    updatePlan.mutate({ account_id: accountId, ...form });
  };

  if (isLoading) return <p>Carregando plano estratégico...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Strategic Account Planning
        </h3>
        <Button size="sm" onClick={handleSave} disabled={updatePlan.isPending}>Salvar Alterações</Button>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label>Sumário Executivo</Label>
          <Textarea 
            placeholder="Visão de longo prazo para esta conta..." 
            className="min-h-[100px]"
            defaultValue={plan?.executive_summary || ""}
            onBlur={(e) => setForm({ ...form, executive_summary: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="outline" className="border-green-500/20 bg-green-500/5">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingUp className="h-4 w-4" /> Forças (Strengths)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea 
                placeholder="Por que eles gostam de nós?" 
                className="text-xs bg-transparent border-none focus-visible:ring-0 p-0 resize-none min-h-[60px]"
                defaultValue={plan?.swot_strengths?.[0] || ""}
                onBlur={(e) => setForm({ ...form, swot_strengths: [e.target.value] })}
              />
            </CardContent>
          </Card>

          <Card variant="outline" className="border-red-500/20 bg-red-500/5">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                <Shield className="h-4 w-4" /> Fraquezas (Weaknesses)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea 
                placeholder="Nossas vulnerabilidades..." 
                className="text-xs bg-transparent border-none focus-visible:ring-0 p-0 resize-none min-h-[60px]"
                defaultValue={plan?.swot_weaknesses?.[0] || ""}
                onBlur={(e) => setForm({ ...form, swot_weaknesses: [e.target.value] })}
              />
            </CardContent>
          </Card>

          <Card variant="outline" className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                <Zap className="h-4 w-4" /> Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea 
                placeholder="Áreas de expansão..." 
                className="text-xs bg-transparent border-none focus-visible:ring-0 p-0 resize-none min-h-[60px]"
                defaultValue={plan?.swot_opportunities?.[0] || ""}
                onBlur={(e) => setForm({ ...form, swot_opportunities: [e.target.value] })}
              />
            </CardContent>
          </Card>

          <Card variant="outline" className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" /> Ameaças (Threats)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea 
                placeholder="Concorrência ou riscos externos..." 
                className="text-xs bg-transparent border-none focus-visible:ring-0 p-0 resize-none min-h-[60px]"
                defaultValue={plan?.swot_threats?.[0] || ""}
                onBlur={(e) => setForm({ ...form, swot_threats: [e.target.value] })}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Label>Estratégia da Conta</Label>
          <Textarea 
            placeholder="Como vamos vencer e expandir nesta conta?" 
            defaultValue={plan?.account_strategy || ""}
            onBlur={(e) => setForm({ ...form, account_strategy: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export default AccountBasedSelling;

