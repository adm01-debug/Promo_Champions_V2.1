import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Target } from "lucide-react";

interface ICPEditForm {
  ramo_atividade: string;
  grupo_nicho: string;
  capital_social: string;
  num_colaboradores: string;
  is_icp_match: boolean;
}

interface ICPEditDialogProps {
  open: boolean;
  onClose: () => void;
  form: ICPEditForm;
  onFormChange: (form: ICPEditForm) => void;
  onSave: () => void;
  isPending: boolean;
}

export const ICPEditDialog = React.memo(function ICPEditDialog({ open, onClose, form, onFormChange, onSave, isPending }: ICPEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
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
            <Input id="ramo" value={form.ramo_atividade} onChange={(e) => onFormChange({ ...form, ramo_atividade: e.target.value })} placeholder="Ex: Tecnologia, Varejo, Indústria..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nicho">Grupo/Nicho</Label>
            <Input id="nicho" value={form.grupo_nicho} onChange={(e) => onFormChange({ ...form, grupo_nicho: e.target.value })} placeholder="Ex: E-commerce, B2B, SaaS..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capital">Capital Social (R$)</Label>
            <Input id="capital" type="number" value={form.capital_social} onChange={(e) => onFormChange({ ...form, capital_social: e.target.value })} placeholder="Ex: 500000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="colaboradores">Número de Colaboradores</Label>
            <Input id="colaboradores" type="number" value={form.num_colaboradores} onChange={(e) => onFormChange({ ...form, num_colaboradores: e.target.value })} placeholder="Ex: 50" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="match">Match ICP</Label>
            <Switch id="match" checked={form.is_icp_match} onCheckedChange={(checked) => onFormChange({ ...form, is_icp_match: checked })} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave} disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
