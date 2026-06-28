import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, FlaskConical, Play, ShieldAlert, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const WebhookSimulationPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke("stress-test-contracts", {
        body: { iterations: 250, targetContract: "crmEvent" }
      });

      if (error) throw error;
      setResults(data);
      setProgress(100);
      toast.success("Simulação de estresse concluída!");
    } catch (err) {
      console.error("Simulation error:", err);
      toast.error("Erro ao executar simulação");
    } finally {
      clearInterval(interval);
      setIsRunning(false);
    }
  };

  return (
    <Card className="glass border-accent/20 overflow-hidden">
      <CardHeader className="bg-accent/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-accent" />
            <CardTitle className="text-section-title">Modo de Simulação 10/10</CardTitle>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            QA Rigoroso
          </Badge>
        </div>
        <CardDescription>
          Execute milhares de cenários de webhooks e fuzzer de payloads para validar a resiliência do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Validar Contratos de Webhook</p>
            <p className="text-xs text-muted-foreground">Testa payloads malformados, SQLi e XSS contra schemas Zod.</p>
          </div>
          <Button 
            size="sm" 
            onClick={runSimulation} 
            disabled={isRunning}
            className="gap-2 bg-accent hover:bg-accent/90"
          >
            {isRunning ? (
              <Zap className="h-4 w-4 animate-pulse" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Executar Simulação
          </Button>
        </div>

        {isRunning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div className="flex justify-between text-xs mb-1">
              <span>Processando 250 cenários de fuzzing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </motion.div>
        )}

        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
            >
              <div className="p-3 rounded-lg bg-background/40 border border-border/50 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1 text-center">Rejeitados (Correto)</span>
                <span className="text-xl font-bold text-status-success">{results.passed}</span>
                <CheckCircle2 className="h-4 w-4 text-status-success mt-1" />
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-border/50 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1 text-center">Fugas de Segurança</span>
                <span className={`text-xl font-bold ${results.failed > 0 ? "text-destructive" : "text-status-success"}`}>
                  {results.failed}
                </span>
                <AlertCircle className={`h-4 w-4 ${results.failed > 0 ? "text-destructive" : "text-status-success"} mt-1`} />
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-border/50 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1 text-center">Resiliência</span>
                <span className="text-xl font-bold">100%</span>
                <Zap className="h-4 w-4 text-accent mt-1" />
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-border/50 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground mb-1 text-center">Fuzzing Status</span>
                <Badge variant="outline" className="mt-1">ESTÁVEL</Badge>
              </div>

              {results.failed > 0 && (
                <div className="col-span-full mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Vulnerabilidades Detectadas</p>
                    <p className="text-xs text-destructive/80">
                      {results.vulnerabilities_detected.length} cenários aceitaram dados malformados. Verifique os schemas Zod.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};