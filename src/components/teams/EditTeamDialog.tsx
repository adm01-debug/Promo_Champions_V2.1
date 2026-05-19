import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone } from "lucide-react";
import { Team, useUpdateTeam, useAvailableClosers } from "@/hooks/useTeams";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CloserSelector } from "./CloserSelector";

const editTeamSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  sdr_id: z.string().min(1, "SDR é obrigatório"),
  inactivity_days: z.string().default("365"),
  is_active: z.boolean().default(true),
});

type EditTeamFormData = z.infer<typeof editTeamSchema>;

interface EditTeamDialogProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeamDialog({ team, open, onOpenChange }: EditTeamDialogProps) {
  const [selectedClosers, setSelectedClosers] = useState<string[]>([]);
  const { data: salespeople } = useSalespeople();
  const { data: availableClosers } = useAvailableClosers();
  const updateTeam = useUpdateTeam();

  const form = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: { name: "", sdr_id: "", inactivity_days: "365", is_active: true },
  });

  const sdrs = salespeople?.filter(s => s.role === 'sdr' || s.role === 'hybrid') || [];

  useEffect(() => {
    if (team) {
      form.reset({ name: team.name, sdr_id: team.sdr_id || "", inactivity_days: team.inactivity_days.toString(), is_active: team.is_active });
      setSelectedClosers(team.closers?.map((c) => c.closer_id) || []);
    }
  }, [team, form]);

  const closersValid = selectedClosers.length === 2;
  const validationMessage = selectedClosers.length !== 2 ? `Selecione exatamente 2 Closers (${selectedClosers.length}/2)` : null;

  const handleSubmit = async (data: EditTeamFormData) => {
    if (!team || !closersValid) return;
    await updateTeam.mutateAsync({ id: team.id, name: data.name, sdr_id: data.sdr_id || null, is_active: data.is_active, inactivity_days: parseInt(data.inactivity_days) || 365, closer_ids: selectedClosers });
    onOpenChange(false);
  };

  const toggleCloser = (closerId: string) => {
    if (selectedClosers.includes(closerId)) setSelectedClosers(selectedClosers.filter((id) => id !== closerId));
    else if (selectedClosers.length < 2) setSelectedClosers([...selectedClosers, closerId]);
  };

  const allClosers = [...(team?.closers?.map(c => c.salesperson) || []), ...(availableClosers || [])].filter((closer, index, self) => index === self.findIndex(c => c.id === closer.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle className="font-display text-xl">Editar Atribuição SDR</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Nome da Atribuição *</FormLabel><FormControl><Input {...field} placeholder="Ex: Atribuição Alpha" /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="is_active" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><div className="flex items-center gap-2 h-10"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><span className="text-sm">{field.value ? "Ativo" : "Inativo"}</span></div></FormItem>)} />
            </div>

            <FormField control={form.control} name="inactivity_days" render={({ field }) => (<FormItem><FormLabel>Dias para Inatividade</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl><SelectContent><SelectItem value="180">180 dias (6 meses)</SelectItem><SelectItem value="365">365 dias (1 ano)</SelectItem><SelectItem value="90">90 dias (3 meses)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />

            <FormField control={form.control} name="sdr_id" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Phone className="h-4 w-4" />SDR do Time *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione um SDR" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {team?.sdr && (<SelectItem key={team.sdr.id} value={team.sdr.id}><div className="flex items-center gap-2"><span>{team.sdr.name}</span><Badge variant="secondary" className="text-xs">Atual</Badge></div></SelectItem>)}
                    {sdrs.filter(sdr => sdr.id !== team?.sdr?.id).map((sdr) => (<SelectItem key={sdr.id} value={sdr.id}><div className="flex items-center gap-2"><span>{sdr.name}</span><Badge variant="outline" className="text-xs">{sdr.role === 'hybrid' ? 'Híbrido' : 'SDR'}</Badge></div></SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <CloserSelector allClosers={allClosers} selectedClosers={selectedClosers} onToggle={toggleCloser} validationMessage={validationMessage} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={updateTeam.isPending || !closersValid}>{updateTeam.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar Alterações</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
