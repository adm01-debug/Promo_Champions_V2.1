import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Zap, Shield, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  id: string;
  type: 'battlecard' | 'objection' | 'sentiment' | 'competitor';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export function LiveIntelligenceFeed({ recordingId }: { recordingId?: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);

  // Simulation of live detection
  useEffect(() => {
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'competitor',
        title: 'Concorrente Detectado: SalesForce',
        description: 'Lead mencionou migração. Use o Battlecard de ROI vs Enterprise.',
        timestamp: new Date().toISOString(),
        priority: 'high'
      },
      {
        id: '2',
        type: 'objection',
        title: 'Objeção de Preço',
        description: 'Detectado tom defensivo ao falar de orçamento. Sugestão: Explore plano parcelado.',
        timestamp: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: '3',
        type: 'sentiment',
        title: 'Pico de Engajamento',
        description: 'Tom de voz positivo detectado ao falar de automação.',
        timestamp: new Date().toISOString(),
        priority: 'low'
      }
    ];

    const timer = setTimeout(() => {
      setInsights(mockInsights);
    }, 1000);

    return () => clearTimeout(timer);
  }, [recordingId]);

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'competitor': return <Shield className="h-4 w-4 text-rank-gold" />;
      case 'objection': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'sentiment': return <Sparkles className="h-4 w-4 text-success" />;
      default: return <Brain className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="glass border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
          <div className="relative">
            <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/40 blur-md rounded-full animate-ping" />
          </div>
          Neural Battlecard Hub
          <Badge variant="outline" className="ml-auto text-[8px] font-black bg-primary/10 text-primary border-primary/30 px-2 py-0">
            REAL-TIME FEED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {insights.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground italic">
              Aguardando sinal de áudio...
            </div>
          ) : (
            insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 rounded-lg bg-background/50 border border-border/40 hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted/50 group-hover:scale-110 transition-transform">
                    {getIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                        {insight.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        Agora
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
