import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Plus, RefreshCw, Crown, Target, Heart, AlertTriangle } from "lucide-react";
import {
  useAccounts,
  useAccountContacts,
  useCreateAccount,
  useCreateContact,
  useRecalculateAccountScore,
  type Account,
  type AccountTier,
  type BuyingRole,
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
                Selecione uma conta para ver detalhes do buying committee.
              </CardContent>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">{selected.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tierLabel[selected.tier]} {selected.industry && `· ${selected.industry}`}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => recalc.mutate(selected.id)} disabled={recalc.isPending}>
                      <RefreshCw className="h-4 w-4 mr-2" />Recalcular Score
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Account Score</Label>
                      <Badge variant={healthVariant(selected.health_status)}>{selected.health_status}</Badge>
                    </div>
                    <Progress value={selected.account_score} />
                    <p className="text-xs text-muted-foreground mt-1">{selected.account_score}/100</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />Buying Committee ({contacts?.length ?? 0})
                    </h3>
                    <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Contato</Button>
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
                          <Button onClick={handleCreateContact} disabled={!ctForm.name || createContact.isPending}>Adicionar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    {(!contacts || contacts.length === 0) && (
                      <p className="text-sm text-muted-foreground">Nenhum contato mapeado ainda. Adicione decisores e champions para multi-threading.</p>
                    )}
                    {contacts?.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {roleIcon[c.buying_role]}
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.job_title || "—"} · {roleLabel[c.buying_role]}</p>
                          </div>
                        </div>
                        <Badge variant="outline">Influência {c.influence_level}/5</Badge>
                      </div>
                    ))}
                  </div>

                  {selected.notes && (
                    <div>
                      <Label>Notas</Label>
                      <Textarea value={selected.notes} readOnly className="mt-1" />
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
