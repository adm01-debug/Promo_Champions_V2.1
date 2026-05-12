import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface NeuralInsight {
  title: string;
  description: string;
  type: "opportunity" | "warning" | "trend";
  score: number;
}

interface ABCNeuralInsightsProps {
  insights: NeuralInsight[];
}

export function ABCNeuralInsights({ insights }: ABCNeuralInsightsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass border-border/40 hover:border-primary/40 transition-all duration-500 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              {insight.type === "opportunity" && <Sparkles className="h-12 w-12 text-status-success" />}
              {insight.type === "warning" && <AlertTriangle className="h-12 w-12 text-status-error" />}
              {insight.type === "trend" && <TrendingUp className="h-12 w-12 text-primary" />}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  insight.type === "opportunity" ? "bg-status-success/20 text-status-success" :
                  insight.type === "warning" ? "bg-status-error/20 text-status-error" :
                  "bg-primary/20 text-primary"
                }`}>
                  <Brain className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-display font-semibold uppercase tracking-wider">
                  {insight.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {insight.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Confidence Score</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div 
                      key={s} 
                      className={`h-1 w-4 rounded-full ${
                        s <= insight.score ? "bg-primary" : "bg-muted/30"
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
