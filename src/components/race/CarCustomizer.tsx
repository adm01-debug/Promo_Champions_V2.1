import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RaceCar } from './RaceCar';
import { RACE_CAR_COLORS, CAR_STYLES, type CarStyle } from './raceColors';
import { useMyRaceCar } from '@/hooks/race/useMyRaceCar';
import { Check } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CarCustomizer({ open, onOpenChange }: Props) {
  const { data: car, upsert } = useMyRaceCar();
  const [number, setNumber] = useState<number>(7);
  const [primary, setPrimary] = useState<string>(RACE_CAR_COLORS[0].primary);
  const [secondary, setSecondary] = useState<string>(RACE_CAR_COLORS[0].secondary);
  const [style, setStyle] = useState<CarStyle>('f1');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (car) {
      setNumber(car.car_number);
      setPrimary(car.primary_color);
      setSecondary(car.secondary_color);
      setStyle(car.car_style);
      setNickname(car.nickname ?? '');
    }
  }, [car, open]);

  const handleSave = async () => {
    await upsert.mutateAsync({
      car_number: number,
      primary_color: primary,
      secondary_color: secondary,
      car_style: style,
      nickname: nickname || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>🏎️ Personalize seu Carro</DialogTitle>
        </DialogHeader>

        <div className="bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6 flex items-center justify-center">
          <svg viewBox="-40 -25 80 50" className="w-48 h-32">
            <RaceCar number={number} primaryColor={primary} secondaryColor={secondary} style={style} scale={1} />
          </svg>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="car-number">Número (1-99)</Label>
              <Input
                id="car-number" type="number" min={1} max={99}
                value={number}
                onChange={(e) => setNumber(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
              />
            </div>
            <div>
              <Label htmlFor="car-nick">Apelido</Label>
              <Input id="car-nick" maxLength={20} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Ex: Relâmpago" />
            </div>
          </div>

          <div>
            <Label>Estilo</Label>
            <Tabs value={style} onValueChange={(v) => setStyle(v as CarStyle)} className="mt-1">
              <TabsList className="grid grid-cols-3 w-full">
                {CAR_STYLES.map((s) => (
                  <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="grid grid-cols-6 gap-2 mt-1">
              {RACE_CAR_COLORS.map((c) => (
                <button
                  key={c.name} type="button"
                  onClick={() => { setPrimary(c.primary); setSecondary(c.secondary); }}
                  className="relative w-full aspect-square rounded-md border-2 hover:scale-110 transition-transform"
                  style={{ background: c.primary, borderColor: c.secondary }}
                  title={c.name}
                >
                  {primary === c.primary && (
                    <Check className="absolute inset-0 m-auto w-4 h-4" style={{ color: c.secondary }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending ? 'Salvando...' : 'Salvar Carro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
