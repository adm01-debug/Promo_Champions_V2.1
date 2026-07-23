import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { useSalespeopleList } from '@/hooks/sales/useSalespeopleList';
import {
  useCommissionBonuses,
  useUpsertCommissionBonus,
  useDeleteCommissionBonus,
  type BonusType,
  type BonusKind,
  type CommissionBonus,
} from '@/hooks/useCommissionBonuses';

const bonusTypeLabels: Record<BonusType, string> = {
  first_sale: 'Primeira Venda',
  milestone: 'Marco de Faturamento',
  ranking: 'Ranking',
  streak: 'Sequência',
  other: 'Outro',
};

const bonusTypeColors: Record<BonusType, string> = {
  first_sale: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  milestone: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  ranking: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  streak: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  other: 'bg-muted text-muted-foreground border-border',
};

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);

interface FormState {
  id?: string;
  name: string;
  description: string;
  bonus_type: BonusType;
  bonus_kind: BonusKind;
  bonus_amount: number;
  salesperson_id: string | null;
  priority: number;
  is_active: boolean;
  trigger_condition_text: string;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  bonus_type: 'milestone',
  bonus_kind: 'fixed',
  bonus_amount: 0,
  salesperson_id: null,
  priority: 0,
  is_active: true,
  trigger_condition_text: '{}',
};

export default function AdminPremiacoes() {
  const { data: bonuses = [], isLoading } = useCommissionBonuses();
  const { data: salespeople = [] } = useSalespeopleList();
  const upsert = useUpsertCommissionBonus();
  const del = useDeleteCommissionBonus();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const openNew = () => {
    setForm(emptyForm);
    setJsonError(null);
    setOpen(true);
  };

  const openEdit = (b: CommissionBonus) => {
    setForm({
      id: b.id,
      name: b.name,
      description: b.description ?? '',
      bonus_type: b.bonus_type,
      bonus_kind: b.bonus_kind,
      bonus_amount: Number(b.bonus_amount),
      salesperson_id: b.salesperson_id,
      priority: b.priority,
      is_active: b.is_active,
      trigger_condition_text: JSON.stringify(b.trigger_condition ?? {}, null, 2),
    });
    setJsonError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    let trigger: Record<string, unknown> = {};
    try {
      trigger = form.trigger_condition_text.trim()
        ? JSON.parse(form.trigger_condition_text)
        : {};
      if (typeof trigger !== 'object' || Array.isArray(trigger)) {
        throw new Error('Deve ser um objeto JSON');
      }
    } catch (err) {
      setJsonError((err as Error).message || 'JSON inválido');
      return;
    }
    setJsonError(null);

    await upsert.mutateAsync({
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      bonus_type: form.bonus_type,
      bonus_kind: form.bonus_kind,
      bonus_amount: form.bonus_amount,
      salesperson_id: form.salesperson_id,
      priority: form.priority,
      is_active: form.is_active,
      trigger_condition: trigger,
    });
    setOpen(false);
  };

  const totalActive = useMemo(() => bonuses.filter((b) => b.is_active).length, [bonuses]);

  return (
    <>
      <Helmet>
        <title>Premiações e Bônus | Admin</title>
        <meta
          name="description"
          content="Cadastre e gerencie premiações, bônus e prêmios especiais para a equipe comercial."
        />
        <link rel="canonical" href="/admin/premiacoes" />
      </Helmet>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Premiações e Bônus
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Cadastro de prêmios, bônus por marcos, ranking e sequências que
              complementam o percentual de comissão. Ativos aparecem para os
              vendedores elegíveis.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Premiação
          </Button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Cadastradas
            </p>
            <p className="text-2xl font-black tabular-nums">{bonuses.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Ativas
            </p>
            <p className="text-2xl font-black tabular-nums text-emerald-500">
              {totalActive}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Globais
            </p>
            <p className="text-2xl font-black tabular-nums">
              {bonuses.filter((b) => !b.salesperson_id).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Individuais
            </p>
            <p className="text-2xl font-black tabular-nums">
              {bonuses.filter((b) => !!b.salesperson_id).length}
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Carregando…
                  </TableCell>
                </TableRow>
              ) : bonuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma premiação cadastrada. Clique em "Nova Premiação".
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                bonuses.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <p className="font-semibold">{b.name}</p>
                      {b.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {b.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={bonusTypeColors[b.bonus_type]}>
                        {bonusTypeLabels[b.bonus_type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums font-semibold">
                      {b.bonus_kind === 'fixed'
                        ? formatBRL(Number(b.bonus_amount))
                        : `${Number(b.bonus_amount).toFixed(2)}%`}
                    </TableCell>
                    <TableCell>
                      {b.salesperson_id
                        ? b.salespeople?.name ?? 'Vendedor'
                        : <span className="text-muted-foreground">Global</span>}
                    </TableCell>
                    <TableCell className="tabular-nums">{b.priority}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          b.is_active
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }
                      >
                        {b.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(b)}
                          aria-label={`Editar ${b.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Remover a premiação "${b.name}"?`)) {
                              del.mutate(b.id);
                            }
                          }}
                          aria-label={`Remover ${b.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? 'Editar Premiação' : 'Nova Premiação'}
            </DialogTitle>
            <DialogDescription>
              Prêmios ativos ficam visíveis para vendedores elegíveis. A aplicação
              automática em folha de comissão é opcional e configurada em etapa futura.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Bônus Top 3 do mês"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Explique o critério e como é comunicado à equipe"
                rows={2}
              />
            </div>

            <div>
              <Label>Tipo</Label>
              <Select
                value={form.bonus_type}
                onValueChange={(v: BonusType) => setForm({ ...form, bonus_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(bonusTypeLabels) as BonusType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {bonusTypeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Formato do valor</Label>
              <Select
                value={form.bonus_kind}
                onValueChange={(v: BonusKind) => setForm({ ...form, bonus_kind: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">
                Valor {form.bonus_kind === 'fixed' ? '(R$)' : '(%)'}
              </Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={form.bonus_kind === 'fixed' ? 10 : 0.1}
                value={form.bonus_amount}
                onChange={(e) =>
                  setForm({ ...form, bonus_amount: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Vendedor</Label>
              <Select
                value={form.salesperson_id ?? 'global'}
                onValueChange={(v) =>
                  setForm({ ...form, salesperson_id: v === 'global' ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (todos)</SelectItem>
                  {salespeople.map((s: { id: string; name: string }) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="trigger">
                Condição de disparo (JSON)
              </Label>
              <Textarea
                id="trigger"
                value={form.trigger_condition_text}
                onChange={(e) =>
                  setForm({ ...form, trigger_condition_text: e.target.value })
                }
                rows={4}
                className="font-mono text-xs"
                placeholder='{ "milestone_amount": 50000 }'
              />
              {jsonError && (
                <p className="text-xs text-destructive mt-1">JSON inválido: {jsonError}</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">
                Exemplos: <code>{'{"milestone_amount": 50000}'}</code> ·{' '}
                <code>{'{"rank_top": 3}'}</code> ·{' '}
                <code>{'{"streak_days": 7}'}</code>
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label htmlFor="active">Premiação ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.name.trim() || upsert.isPending}
            >
              {upsert.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
