import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Users, TrendingUp, BarChart3, Zap, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export const IntelligenceZones = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6 border-border/40 bg-card/50">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
            <Users className="size-4 text-primary" /> Visão 360° do Cliente
          </h3>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {["LTV", "Ticket Médio", "Recência", "Pedidos"].map((m) => (
              <div key={m} className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase">{m}</p>
                <p className="text-lg font-black font-mono">--</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Timeline Pedidos</p>
            <div className="h-24 flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-xs italic">
              Carregando histórico...
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/40 bg-card/50">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
            <Zap className="size-4 text-primary" /> Sugestão do Especialista
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="size-10 bg-primary/20 rounded flex items-center justify-center">
                  <Brain className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold">Produto Curadoria {i}</p>
                  <p className="text-[10px] text-muted-foreground">Alta conversão no seu ramo</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-border/40 bg-card/50">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
            <BarChart3 className="size-4 text-primary" /> Cliente vs Setor (Benchmark)
          </h3>
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-xs">
            Gráfico de barras de métricas em desenvolvimento...
          </div>
        </Card>

        <Card className="p-6 border-border/40 bg-card/50">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
            <TrendingUp className="size-4 text-primary" /> Tendência do Setor (90 dias)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-xs p-3 bg-white/5 rounded border border-white/5">
                Produto Trend {i}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/40 bg-card/50">
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
          <CalendarDays className="size-4 text-primary" /> Sazonalidade 24 Meses
        </h3>
        <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg text-muted-foreground text-xs italic">
          Heatmap de sazonalidade mensal em desenvolvimento...
        </div>
      </Card>
    </div>
  );
};
