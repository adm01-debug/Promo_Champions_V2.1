import { motion } from "framer-motion";
import { 
  Database, 
  Settings, 
  Zap, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyStateGuide() {
  return (
    <Card className="border-dashed border-2 bg-muted/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-12 opacity-5">
        <Database className="h-40 w-40" />
      </div>
      
      <CardContent className="py-20 max-w-2xl mx-auto text-center space-y-8 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5"
        >
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </motion.div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            Ative o Motor de <span className="text-primary">Inteligência 360°</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Sua engine de IA precisa de combustível. Para gerar mapas térmicos e predições de compra, certifique-se de que os dados estão sincronizados.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-left">
          {[
            { 
              icon: <Database className="h-5 w-5" />, 
              title: "Volume de Dados", 
              desc: "Mínimo de 3 meses de histórico para predições precisas." 
            },
            { 
              icon: <Settings className="h-5 w-5" />, 
              title: "Configuração", 
              desc: "Vincule clientes aos vendedores para análise de share." 
            },
            { 
              icon: <Zap className="h-5 w-5" />, 
              title: "Tempo Real", 
              desc: "Sincronização automática a cada novo negócio fechado." 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="p-4 rounded-xl bg-card border border-border/50 space-y-2 hover:border-primary/30 transition-colors"
            >
              <div className="text-primary">{item.icon}</div>
              <div className="text-xs font-bold uppercase tracking-wider">{item.title}</div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2 font-bold px-8 shadow-lg shadow-primary/20 group">
            Começar Configuração <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="gap-2 font-bold px-8">
            <Info className="h-4 w-4" /> Ver Documentação
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
