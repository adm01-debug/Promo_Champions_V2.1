import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Plus, Edit2, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import { useCommissionRules, useUpsertCommissionRule, useDeleteCommissionRule, type CommissionRule } from "@/hooks/useCommissionRules";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import { PageTransition, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CommissionRules() {
  const { data: rules = [], isLoading } = useCommissionRules();
  const { data: salespeople = [] } = useSalespeople();
  const upsertRule = useUpsertCommissionRule();
  const deleteRule = useDeleteCommissionRule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<CommissionRule> | null>(null);

  const handleEdit = (rule: Partial<CommissionRule> = { is_active: true, priority: 1, percentage: 5 }) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRule) return;
    await upsertRule.mutateAsync(editingRule);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta regra?")) {
      await deleteRule.mutateAsync(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Regras de Comissão | Admin</title>
      </Helmet>

      <PageTransition>
        <div className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-page-title font-display italic uppercase tracking-tighter">Regras de Comissão</h1>
              <p className="text-sm text-muted-foreground">Configure os percentuais de comissão por categoria, vendedor e valor</p>
            </div>
            <Button onClick={() => handleEdit()} className="gradient-primary text-xs font-black uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Nova Regra
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest w-[40px]">Prior.</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Nome / Descrição</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Alvo</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Percentual</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                        Nenhuma regra configurada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => (
                      <TableRow key={rule.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-mono text-xs text-center">{rule.priority}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{rule.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[250px]">{rule.description || "Sem descrição"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {rule.salesperson_id ? (
                              <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                                👤 {rule.salespeople?.name}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] bg-white/5 text-muted-foreground">Todos Vendedores</Badge>
                            )}
                            {rule.category ? (
                              <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                                📦 {rule.category}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] bg-white/5 text-muted-foreground">Todas Categorias</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-black italic text-primary text-lg">{rule.percentage}%</span>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={rule.is_active} 
                            onCheckedChange={() => upsertRule.mutate({ ...rule, is_active: !rule.is_active })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => handleEdit(rule)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => handleDelete(rule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4">
             <AlertCircle className="h-5 w-5 text-primary shrink-0" />
             <div className="text-xs space-y-1">
               <p className="font-bold uppercase tracking-widest text-primary">Sistema de Precedência</p>
               <p className="text-muted-foreground">
                 O sistema busca a regra mais específica primeiro. Se várias regras se aplicarem, a de maior <strong>prioridade</strong> vence. 
                 Caso não existam regras aplicáveis, o padrão é <strong>5%</strong>.
               </p>
             </div>
          </motion.div>
        </div>
      </PageTransition>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-white/10 shadow-2xl max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display italic uppercase tracking-tighter">
              {editingRule?.id ? 'Editar Regra de Comissão' : 'Nova Regra de Comissão'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome da Regra</Label>
              <Input 
                placeholder="Ex: Comissão Black Friday"
                className="bg-white/5 border-white/10"
                value={editingRule?.name || ""}
                onChange={(e) => setEditingRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Percentual (%)</Label>
              <Input 
                type="number"
                placeholder="10"
                className="bg-white/5 border-white/10"
                value={editingRule?.percentage || ""}
                onChange={(e) => setEditingRule(prev => ({ ...prev, percentage: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prioridade</Label>
              <Input 
                type="number"
                placeholder="1"
                className="bg-white/5 border-white/10"
                value={editingRule?.priority || ""}
                onChange={(e) => setEditingRule(prev => ({ ...prev, priority: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendedor (Opcional)</Label>
              <Select 
                value={editingRule?.salesperson_id || "all"} 
                onValueChange={(v) => setEditingRule(prev => ({ ...prev, salesperson_id: v === "all" ? null : v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {salespeople.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categoria (Opcional)</Label>
              <Input 
                placeholder="Ex: Software"
                className="bg-white/5 border-white/10"
                value={editingRule?.category || ""}
                onChange={(e) => setEditingRule(prev => ({ ...prev, category: e.target.value || null }))}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descrição</Label>
              <Input 
                placeholder="Detalhes sobre quando esta regra se aplica..."
                className="bg-white/5 border-white/10"
                value={editingRule?.description || ""}
                onChange={(e) => setEditingRule(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={upsertRule.isPending} className="gradient-primary text-[10px] font-black uppercase tracking-widest px-8">
              Salvar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
