import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2, Plus, CheckCircle2, Trash2, Wallet, ShieldCheck } from "lucide-react";
import { useAllCommissions, useUpdateCommissionStatus, type CommissionStatus } from "@/hooks/useCommissions";
import { useCommissionRules, useCreateCommissionRule, useDeleteCommissionRule, useUpdateCommissionRule } from "@/hooks/useCommissionRules";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

const statusBadge: Record<CommissionStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", variant: "outline" },
  approved: { label: "Aprovada", variant: "secondary" },
  paid: { label: "Paga", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

function NewRuleDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState(5);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(0);
  const create = useCreateCommissionRule();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || percentage <= 0) return;
    create.mutate(
      { name, percentage, category: category || null, priority },
      {
        onSuccess: () => {
          setOpen(false);
          setName(""); setPercentage(5); setCategory(""); setPriority(0);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" />Nova regra</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova regra de comissão</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="r-name">Nome</Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="r-pct">Percentual (%)</Label>
              <Input id="r-pct" type="number" step="0.01" min="0" max="100" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="r-pri">Prioridade</Label>
              <Input id="r-pri" type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label htmlFor="r-cat">Categoria (opcional)</Label>
            <Input id="r-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: brindes, premium" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? "Salvando…" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RulesPanel() {
  const { data: rules = [], isLoading } = useCommissionRules();
  const remove = useDeleteCommissionRule();
  const update = useUpdateCommissionRule();
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" />Regras de comissão</CardTitle>
        <NewRuleDialog />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma regra criada. O padrão é <strong>5%</strong> sobre vendas concluídas.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.percentage}% · prioridade {r.priority}
                    {r.salespeople?.name && ` · vendedor ${r.salespeople.name}`}
                    {r.category && ` · categoria ${r.category}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={r.is_active}
                    onCheckedChange={(checked) => update.mutate({ id: r.id, is_active: checked })}
                    aria-label="Ativar regra"
                  />
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)} aria-label="Remover">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommissionsList({ status }: { status?: CommissionStatus }) {
  const { data: commissions = [], isLoading } = useAllCommissions(status);
  const update = useUpdateCommissionStatus();

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;
  if (commissions.length === 0) return <Card className="p-8 text-center text-sm text-muted-foreground">Nenhuma comissão</Card>;

  return (
    <div className="space-y-3">
      {commissions.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="font-semibold">{c.salespeople?.name ?? "Vendedor"} → {c.sales?.client_name ?? "Cliente"}</p>
              <p className="text-sm text-muted-foreground truncate">{c.sales?.product_name ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(c.created_at), "dd MMM yyyy", { locale: ptBR })}
                {" · "}Base: {formatBRL(c.base_amount)} · {c.percentage}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold font-display">{formatBRL(c.commission_amount)}</p>
              <Badge variant={statusBadge[c.status].variant} className="mt-1">{statusBadge[c.status].label}</Badge>
            </div>
            <div className="flex flex-col gap-1">
              {c.status === "pending" && (
                <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: c.id, status: "approved" })}>
                  <ShieldCheck className="h-4 w-4 mr-1" />Aprovar
                </Button>
              )}
              {c.status === "approved" && (
                <Button size="sm" onClick={() => update.mutate({ id: c.id, status: "paid" })}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />Marcar como paga
                </Button>
              )}
              {(c.status === "pending" || c.status === "approved") && (
                <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: c.id, status: "cancelled" })}>
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminComissoes() {
  const { data: all = [] } = useAllCommissions();
  const totals = useMemo(() => {
    const t = { pending: 0, approved: 0, paid: 0, count: all.length };
    for (const c of all) {
      if (c.status === "pending") t.pending += c.commission_amount;
      else if (c.status === "approved") t.approved += c.commission_amount;
      else if (c.status === "paid") t.paid += c.commission_amount;
    }
    return t;
  }, [all]);

  return (
    <>
      <Helmet>
        <title>Admin Comissões | Promo Champions</title>
        <meta name="description" content="Gerenciamento de regras, aprovação e pagamento de comissões." />
      </Helmet>

      <main className="container max-w-7xl py-6 space-y-6">
        <header>
          <h1 className="text-page-title flex items-center gap-2"><Wallet className="h-7 w-7 text-primary" />Admin Comissões</h1>
          <p className="text-sm text-muted-foreground">Gerencie regras, aprove e marque como pagas</p>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">A aprovar</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-display">{formatBRL(totals.pending)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">A pagar</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-display">{formatBRL(totals.approved)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Pago no histórico</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-display">{formatBRL(totals.paid)}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total registros</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold font-display">{totals.count}</p></CardContent></Card>
        </section>

        <RulesPanel />

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">A aprovar</TabsTrigger>
            <TabsTrigger value="approved">A pagar</TabsTrigger>
            <TabsTrigger value="paid">Pagas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4"><CommissionsList status="pending" /></TabsContent>
          <TabsContent value="approved" className="mt-4"><CommissionsList status="approved" /></TabsContent>
          <TabsContent value="paid" className="mt-4"><CommissionsList status="paid" /></TabsContent>
          <TabsContent value="all" className="mt-4"><CommissionsList /></TabsContent>
        </Tabs>
      </main>
    </>
  );
}
