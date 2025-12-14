import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Team, useUpdateTeam, useAvailableClosers } from "@/hooks/useTeams";
import { useSalespeople } from "@/hooks/useSalespeople";

interface EditTeamDialogProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeamDialog({ team, open, onOpenChange }: EditTeamDialogProps) {
  const [name, setName] = useState("");
  const [sdrId, setSdrId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [inactivityDays, setInactivityDays] = useState("365");
  const [selectedClosers, setSelectedClosers] = useState<string[]>([]);

  const { data: salespeople } = useSalespeople();
  const { data: availableClosers } = useAvailableClosers();
  const updateTeam = useUpdateTeam();

  // Filter SDRs from all salespeople
  const sdrs = salespeople?.filter(s => s.role === 'sdr' || s.role === 'hybrid') || [];

  useEffect(() => {
    if (team) {
      setName(team.name);
      setSdrId(team.sdr_id || "");
      setIsActive(team.is_active);
      setInactivityDays(team.inactivity_days.toString());
      setSelectedClosers(team.closers?.map((c) => c.closer_id) || []);
    }
  }, [team]);

  // Validation: must have exactly 1 SDR and 2 Closers
  const isValidTeam = name.trim() && sdrId && selectedClosers.length === 2;
  const validationMessage = !sdrId 
    ? "Selecione 1 SDR" 
    : selectedClosers.length !== 2 
      ? `Selecione exatamente 2 Closers (${selectedClosers.length}/2)` 
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!team || !isValidTeam) return;

    await updateTeam.mutateAsync({
      id: team.id,
      name: name.trim(),
      sdr_id: sdrId || null,
      is_active: isActive,
      inactivity_days: parseInt(inactivityDays) || 365,
      closer_ids: selectedClosers,
    });

    onOpenChange(false);
  };

  const toggleCloser = (closerId: string) => {
    if (selectedClosers.includes(closerId)) {
      setSelectedClosers(selectedClosers.filter((id) => id !== closerId));
    } else if (selectedClosers.length < 2) {
      setSelectedClosers([...selectedClosers, closerId]);
    }
  };

  // Merge current team closers with available closers for display
  const allClosers = [
    ...(team?.closers?.map(c => c.salesperson) || []),
    ...(availableClosers || []),
  ].filter((closer, index, self) => 
    index === self.findIndex(c => c.id === closer.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Editar Atribuição SDR</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome e Status */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Nome da Atribuição *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Atribuição Alpha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className="text-sm">
                  {isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          {/* Dias de Inatividade */}
          <div className="space-y-2">
            <Label htmlFor="inactivity">Dias para Inatividade</Label>
            <Select value={inactivityDays} onValueChange={setInactivityDays}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="180">180 dias (6 meses)</SelectItem>
                <SelectItem value="365">365 dias (1 ano)</SelectItem>
                <SelectItem value="90">90 dias (3 meses)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selecionar SDR */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              SDR do Time
            </Label>
            <Select value={sdrId} onValueChange={setSdrId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um SDR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {/* Include current SDR even if not in available list */}
                {team?.sdr && (
                  <SelectItem key={team.sdr.id} value={team.sdr.id}>
                    <div className="flex items-center gap-2">
                      <span>{team.sdr.name}</span>
                      <Badge variant="secondary" className="text-xs">Atual</Badge>
                    </div>
                  </SelectItem>
                )}
                {sdrs
                  .filter(sdr => sdr.id !== team?.sdr?.id)
                  .map((sdr) => (
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
          </div>

          {/* Selecionar Closers */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Handshake className="h-4 w-4" />
                Closers Atendidos
              </span>
              <Badge variant="outline" className="text-xs">
                {selectedClosers.length}/2
              </Badge>
            </Label>
            
            <p className="text-xs text-muted-foreground">
              Os 2 Closers que este SDR atende (são concorrentes entre si)
            </p>
            
            {selectedClosers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedClosers.map((closerId) => {
                  const closer = allClosers.find((c) => c.id === closerId);
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
                        size="icon"
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
                {allClosers.map((closer) => (
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
                  </div>
                ))}
                {allClosers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum closer disponível
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {validationMessage && (
            <p className="text-sm text-status-warning flex items-center gap-1">
              ⚠️ {validationMessage}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTeam.isPending || !isValidTeam}>
              {updateTeam.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
