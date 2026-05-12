import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";
import { motion } from "framer-motion";

export function CommissionCalculator() {
  const [saleAmount, setSaleAmount] = useState<number>(5000);
  const [percentage, setPercentage] = useState<number>(5);

  const commission = useMemo(() => (saleAmount * percentage) / 100, [saleAmount, percentage]);

  const formatBRL = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <Card className="glass border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
          <Calculator className="h-4 w-4" />
          Simulador de Ganhos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Valor da Venda</Label>
              <span className="text-sm font-black italic">{formatBRL(saleAmount)}</span>
            </div>
            <Input 
              type="number" 
              value={saleAmount} 
              onChange={(e) => setSaleAmount(Number(e.target.value))}
              className="bg-white/5 border-white/10"
            />
            <Slider 
              value={[saleAmount]} 
              onValueChange={([v]) => setSaleAmount(v)} 
              min={0} 
              max={100000} 
              step={500}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Sua Regra (%)</Label>
              <span className="text-sm font-black italic text-primary">{percentage}%</span>
            </div>
            <Slider 
              value={[percentage]} 
              onValueChange={([v]) => setPercentage(v)} 
              min={1} 
              max={30} 
              step={0.5}
              className="py-2"
            />
          </div>
        </div>

        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 text-center space-y-1"
          key={commission}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Comissão Estimada</p>
          <p className="text-3xl font-black italic tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            {formatBRL(commission)}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2 text-[9px] font-bold text-success uppercase tracking-widest">
            <TrendingUp className="h-3 w-3" />
            Impacto Real no BI
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
            <p className="text-[8px] text-muted-foreground uppercase font-bold">Acumulado Mês</p>
            <p className="text-xs font-bold">+ {formatBRL(commission * 1.2)}</p>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
            <p className="text-[8px] text-muted-foreground uppercase font-bold">Rank Potencial</p>
            <p className="text-xs font-bold text-amber-500">Top 3 🔥</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
