import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, CalendarDays, Users, TrendingUp, Target, ShieldCheck, History, AlertTriangle, ShieldAlert } from "lucide-react";
import { ClientSelector } from "./ClientSelector";
import { PurchaseHeatmapGrid } from "./PurchaseHeatmapGrid";
import { PurchasePredictionCard } from "./PurchasePredictionCard";
import { SeasonalityHeatmap } from "./SeasonalityHeatmap";
import { IntelligenceAlerts } from "../dashboard/modules/IntelligenceAlerts";
import { EmptyStateGuide } from "./EmptyStateGuide";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DuplicateBlockAudit } from "./DuplicateBlockAudit";

export function PurchaseIntelligenceHub() {
  const [clientId, setClientId] = useState<string | undefined>();
  const [hasData, setHasData] = useState(true); // Toggle to test empty state

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-[1600px]">
      <Helmet>
        <title>Inteligência de Compras 360° | Promo Champions</title>
        <meta
          name="description"
          content="Mapa de calor temporal de compras + análise preditiva 360° por cliente: passado, presente e futuro."
        />
      </Helmet>

      {/* Futuristic HUD Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-md"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Brain className="h-32 w-32 text-primary" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                Inteligência de Compras 360°
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Mecanismo tático de IA para prever ciclos de consumo, identificar riscos de churn e dominar a janela ideal de negociação.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary/70">
                <Target className="h-3 w-3" /> Score Médio
              </div>
              <div className="text-2xl font-bold">88.4</div>
              <Badge variant="outline" className="w-fit text-[10px] bg-primary/10 border-primary/20">Alta Precisão</Badge>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-success/70">
                <ShieldCheck className="h-3 w-3" /> Retenção IA
              </div>
              <div className="text-2xl font-bold text-success">92%</div>
              <Badge variant="outline" className="w-fit text-[10px] bg-success/10 border-success/20 text-success">+4.2% mês</Badge>
            </div>
          </div>
        </div>
      </motion.header>

      {!hasData ? (
        <EmptyStateGuide />
      ) : (
        <Tabs defaultValue="client" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border border-border/50 h-12">
            <TabsTrigger value="client" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" /> Visão por Cliente
            </TabsTrigger>
            <TabsTrigger value="global" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flame className="h-4 w-4" /> Heatmap Global
            </TabsTrigger>
            <TabsTrigger value="seasonality" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="h-4 w-4" /> Sazonalidade
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShieldAlert className="h-4 w-4" /> Auditoria de Bloqueios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="space-y-6 focus-visible:outline-none">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ClientSelector value={clientId} onChange={setClientId} />
            </motion.div>
            
            <div className="grid lg:grid-cols-12 gap-6">
              <motion.div 
                className="lg:col-span-5 xl:col-span-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <PurchasePredictionCard clientId={clientId} />
              </motion.div>
              <motion.div 
                className="lg:col-span-7 xl:col-span-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <PurchaseHeatmapGrid clientId={clientId} months={24} />
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="global" className="focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PurchaseHeatmapGrid months={18} />
            </motion.div>
          </TabsContent>

          <TabsContent value="seasonality" className="focus-visible:outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SeasonalityHeatmap />
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
