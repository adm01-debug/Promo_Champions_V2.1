import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStartRaceSeason } from '@/hooks/race/useStartRaceSeason';
import { Flag, Users, Target } from 'lucide-react';
import { ScoringRulesEditor } from './admin/ScoringRulesEditor';
import type { MetricCode } from '@/hooks/race/useRaceScoringRules';

interface Props { open: boolean; onOpenChange: (o: boolean) => void; }

type ScoringDraft = { metric_code: MetricCode; weight: number; points_per_unit: number; label: string };

export function StartSeasonDialog({ open, onOpenChange }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [name, setName] = useState('Nova Temporada 🏁');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(in30);
  const [goal, setGoal] = useState('100000');
  const [track, setTrack] = useState<'oval' | 'circuit' | 'street'>('oval');
  const [roleType, setRoleType] = useState<'closer' | 'sdr'>('closer');
  const [rulesEditorOpen, setRulesEditorOpen] = useState(false);
  const [customRules, setCustomRules] = useState<ScoringDraft[] | null>(null);
  const { mutate, isPending } = useStartRaceSeason();

  const submit = () => {
    mutate(
      {
        name, start_date: startDate, end_date: endDate,
        goal_amount: Number(goal), track_type: track,
        role_type: roleType,
        scoring_rules: customRules ?? undefined,
      },
      { onSuccess: () => { onOpenChange(false); setCustomRules(null); } }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Flag className="w-5 h-5 text-primary" /> Iniciar nova temporada
            </DialogTitle>
            <DialogDescription>
              Cada papel (Closer/SDR) tem sua própria temporada simultânea com regras de pontuação dedicadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Papel da corrida</Label>
              <Select value={roleType} onValueChange={(v) => { setRoleType(v as 'closer' | 'sdr'); setCustomRules(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="closer">🎯 Closer — fechamento</SelectItem>
                  <SelectItem value="sdr">📞 SDR — prospecção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Início</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Meta total de pontos</Label>
              <Input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <div>
              <Label>Tipo de pista</Label>
              <Select value={track} onValueChange={(v) => setTrack(v as 'oval' | 'circuit' | 'street')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oval">Oval</SelectItem>
                  <SelectItem value="circuit">Circuito</SelectItem>
                  <SelectItem value="street">Rua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setRulesEditorOpen(true)}>
              <Target className="w-4 h-4 mr-2" />
              {customRules ? `Regras personalizadas (${customRules.length})` : 'Configurar regras de pontuação'}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={isPending}>
              <Users className="w-4 h-4 mr-2" />
              {isPending ? 'Iniciando…' : 'Largada!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScoringRulesEditor
        open={rulesEditorOpen}
        onOpenChange={setRulesEditorOpen}
        roleType={roleType}
        initialRules={customRules?.map((r) => ({ ...r, season_id: '' })) ?? undefined}
        onConfirm={(rules) => setCustomRules(rules as ScoringDraft[])}
      />
    </>
  );
}
