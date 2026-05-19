import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Phone, Handshake, X } from "lucide-react";
import { useCreateTeam, useAvailableClosers } from "@/hooks/useTeams";
import { useSalespeople } from "@/hooks/sales/useSalespeople";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const teamSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  sdr_id: z.string().min(1, "SDR é obrigatório"),
  inactivity_days: z.string().default("365"),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [selectedClosers, setSelectedClosers] = useState<string[]>([]);

  const { data: salespeople } = useSalespeople();
  const { data: availableClosers } = useAvailableClosers();
  const createTeam = useCreateTeam();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      sdr_id: "",
      inactivity_days: "365",
    },
  });

  // Filter SDRs from all salespeople
  const sdrs = salespeople?.filter(s => s.role === 'sdr' || s.role === 'hybrid') || [];

  // Validation: must have exactly 2 Closers
  const closersValid = selectedClosers.length === 2;
  const validationMessage = selectedClosers.length !== 2 
    ? `Selecione exatamente 2 Closers (${selectedClosers.length}/2)` 
    : null;

  const handleSubmit = async (data: TeamFormData) => {
    if (!closersValid) return;

    await createTeam.mutateAsync({
      name: data.name,
      sdr_id: data.sdr_id || null,
      inactivity_days: parseInt(data.inactivity_days) || 365,
      closer_ids: selectedClosers,
    });

    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setSelectedClosers([]);
    onOpenChange(false);
  };

  const toggleCloser = (closerId: string) => {
    if (selectedClosers.includes(closerId)) {
      setSelectedClosers(selectedClosers.filter((id) => id !== closerId));
    } else if (selectedClosers.length < 2) {
      setSelectedClosers([...selectedClosers, closerId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Atribuição SDR</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome da Atribuição */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Atribuição *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Atribuição Alpha"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dias de Inatividade */}
            <FormField
              control={form.control}
              name="inactivity_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias para Inatividade</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="180">180 dias (6 meses)</SelectItem>
                      <SelectItem value="365">365 dias (1 ano)</SelectItem>
                      <SelectItem value="90">90 dias (3 meses)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Cliente sem compra nesse período vira inativo
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selecionar SDR */}
            <FormField
              control={form.control}
              name="sdr_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    SDR do Time *
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um SDR" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sdrs.map((sdr) => (
                        <SelectItem key={sdr.id} value={sdr.id}>
                          <div className="flex items-center gap-2">
                            <span>{sdr.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {sdr.role === 'hybrid' ? 'Híbrido' : 'SDR'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selecionar Closers */}
            <div className="space-y-2">
              <FormLabel className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" />
                  Closers Atendidos *
                </span>
                <Badge variant="outline" className="text-xs">
                  {selectedClosers.length}/2
                </Badge>
              </FormLabel>
              
              <p className="text-xs text-muted-foreground">
                Selecione os 2 Closers que este SDR vai atender (são concorrentes entre si)
              </p>
              {selectedClosers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedClosers.map((closerId) => {
                    const closer = availableClosers?.find((c) => c.id === closerId);
                    if (!closer) return null;
                    return (
                      <Badge
                        key={closerId}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {closer.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon" aria-label="Fechar"
                          className="h-4 w-4 ml-1 hover:bg-destructive/20"
                          onClick={() => toggleCloser(closerId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              <ScrollArea className="h-[180px] border rounded-lg p-2">
                <div className="space-y-2">
                  {availableClosers?.map((closer) => (
                    <div
                      key={closer.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleCloser(closer.id)}
                    >
                      <Checkbox
                        checked={selectedClosers.includes(closer.id)}
                        disabled={!selectedClosers.includes(closer.id) && selectedClosers.length >= 2}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={closer.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {closer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{closer.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {closer.role === 'hybrid' ? 'Híbrido' : 'Closer'}
                      </Badge>
                    </div>
                  ))}
                  {(!availableClosers || availableClosers.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum closer disponível
                    </p>
                  )}
                </div>
              </ScrollArea>
              {validationMessage && (
                <p className="text-sm text-status-warning flex items-center gap-1">
                  ⚠️ {validationMessage}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createTeam.isPending || !closersValid}>
                {createTeam.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Atribuição
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}