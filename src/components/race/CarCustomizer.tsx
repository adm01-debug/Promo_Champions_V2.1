import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RaceCar } from './RaceCar';
import { CarPresetCard } from './CarPresetCard';
import {
  RACE_CAR_PRESETS,
  DEFAULT_PRESET_ID,
  getPresetById,
  inferPresetFromColors,
} from './raceColors';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CarCustomizer({ open, onOpenChange }: Props) {
  const { data: car, upsert } = useMyRaceCar();
  const [number, setNumber] = useState<number>(7);
  const [presetId, setPresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [nickname, setNickname] = useState('');

  const preset = useMemo(() => getPresetById(presetId), [presetId]);

  useEffect(() => {
    if (car) {
      setNumber(car.car_number);
      setNickname(car.nickname ?? '');
      const inferred = car.preset_id
        ? getPresetById(car.preset_id).id
        : inferPresetFromColors(car.primary_color, car.car_style, car.secondary_color).id;
      setPresetId(inferred);
    }
  }, [car, open]);

  const handleSave = async () => {
    await upsert.mutateAsync({
      car_number: number,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      car_style: preset.style,
      preset_id: preset.id,
      nickname: nickname || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏎️ Personalize seu Carro
            <span className="text-xs font-normal text-muted-foreground">
              · {RACE_CAR_PRESETS.length} modelos
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Preview grande do preset selecionado */}
        <div className="rounded-lg bg-gradient-to-b from-sky-100 to-sky-50 p-6 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-center">
            <svg viewBox="-50 -28 100 56" className="h-32 w-56" aria-label={`Preview ${preset.name}`}>
              <RaceCar
                number={number}
                primaryColor={preset.primary}
                secondaryColor={preset.secondary}
                style={preset.style}
                scale={1.1}
                livery={preset.pattern}
                liveryAccent={preset.accent}
                liveryUid="preview"
              />
            </svg>
          </div>
          <p className="mt-2 text-center text-sm font-bold">
            {preset.emoji} {preset.name}
            {preset.pride && (
              <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                Pride
              </span>
            )}
          </p>
        </div>

        {/* Inputs número + apelido */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="car-number">Número (1-99)</Label>
            <Input
              id="car-number"
              type="number"
              min={1}
              max={99}
              value={number}
              onChange={(e) => setNumber(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            />
          </div>
          <div>
            <Label htmlFor="car-nick">Apelido</Label>
            <Input
              id="car-nick"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Relâmpago"
            />
          </div>
        </div>

        {/* Grid de presets */}
        <div>
          <Label>Modelo & Pintura</Label>
          <ScrollArea className="mt-1 h-72 rounded-md border p-2">
            <div role="radiogroup" aria-label="Modelo e pintura do carro" className="grid grid-cols-4 gap-2">
              {RACE_CAR_PRESETS.map((p) => (
                <CarPresetCard
                  key={p.id}
                  preset={p}
                  selected={p.id === presetId}
                  carNumber={number}
                  onSelect={setPresetId}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending ? 'Salvando...' : 'Salvar Carro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
