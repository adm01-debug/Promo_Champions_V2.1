import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoutingRulesPanel } from "./RoutingRulesPanel";
import { CapacityDashboard } from "./CapacityDashboard";
import { RoutingHistoryPanel } from "./RoutingHistoryPanel";
import { RoutingPerformanceCard } from "./RoutingPerformanceCard";

export function LeadRoutingHub() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-xl font-display font-semibold">Smart Lead Routing</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Distribuição inteligente de leads para o vendedor certo — baseado em capacidade,
          performance histórica e regras configuráveis.
        </p>
      </div>

      <RoutingPerformanceCard />

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="capacity">Capacidade</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="rules" className="mt-4">
          <RoutingRulesPanel />
        </TabsContent>
        <TabsContent value="capacity" className="mt-4">
          <CapacityDashboard />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <RoutingHistoryPanel />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
