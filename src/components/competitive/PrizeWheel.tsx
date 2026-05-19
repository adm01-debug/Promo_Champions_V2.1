import React, { FC, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, RotateCw, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePrizeWheel, PRIZE_SLICES } from '@/hooks/gamification/usePrizeWheel';
import { toast } from 'sonner';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrizeWheelProps {
  salespersonId?: string;
  className?: string;
}

const PrizeWheelComponent: FC<PrizeWheelProps> = ({ salespersonId, className }) => {
  const { availableSpins, history, spin } = usePrizeWheel(salespersonId);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sliceAngle = 360 / PRIZE_SLICES.length;

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;

    ctx.clearRect(0, 0, size, size);

    PRIZE_SLICES.forEach((slice, i) => {
      const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + (endAngle - startAngle) / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(slice.label, radius - 10, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [sliceAngle]);

  const handleSpin = async () => {
    if (isSpinning || availableSpins <= 0 || !salespersonId) return;

    setIsSpinning(true);
    setWonPrize(null);

    try {
      const result = await spin.mutateAsync();
      const targetAngle = 360 - (result.prizeIndex * sliceAngle + sliceAngle / 2);
      const totalRotation = rotation + 1440 + targetAngle;
      setRotation(totalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setWonPrize(result.prize.label);
        toast.success(`🎉 Você ganhou: ${result.prize.label}!`);
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.5 },
            colors: [result.prize.color, '#FFD700', '#FF6347'],
          });
        });
      }, 3500);
    } catch {
      setIsSpinning(false);
      toast.error('Erro ao girar a roda');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Gift className="h-4 w-4 text-primary-foreground" />
            </div>
            Roda da Sorte
            <Badge variant="outline" className="text-xs ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              {availableSpins} giro{availableSpins !== 1 ? 's' : ''} disponíve{availableSpins !== 1 ? 'is' : 'l'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wheel */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-destructive drop-shadow-lg" />
              </div>

              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 3.5, ease: [0.2, 0.8, 0.2, 1] }}
                className="relative"
              >
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={240}
                  className="rounded-full shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Won prize display */}
            {wonPrize && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-lg font-bold text-primary">🎉 {wonPrize}</p>
                <p className="text-xs text-muted-foreground">Prêmio adicionado à sua conta!</p>
              </motion.div>
            )}

            <Button
              onClick={handleSpin}
              disabled={isSpinning || availableSpins <= 0 || !salespersonId}
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground shadow-lg"
            >
              <RotateCw className={cn('h-4 w-4', isSpinning && 'animate-spin')} />
              {isSpinning ? 'Girando...' : availableSpins > 0 ? 'Girar a Roda!' : 'Sem giros'}
            </Button>

            {!salespersonId && (
              <p className="text-xs text-muted-foreground">Faça login para girar a roda</p>
            )}
          </div>

          {/* History */}
          {history && history.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border/20">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <History className="h-3 w-3" /> Últimos prêmios
              </p>
              <div className="space-y-1">
                {history.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1">
                    <span className="font-medium text-foreground">{s.prize_label}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(s.spun_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export const PrizeWheel = React.memo(PrizeWheelComponent);
