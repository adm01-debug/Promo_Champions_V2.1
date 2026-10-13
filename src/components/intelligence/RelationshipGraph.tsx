import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Share2 } from 'lucide-react';

export const RelationshipGraph = () => {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm relative overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-section-title text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Share2 className="size-4 text-primary" />
              Insight <span className="text-primary">Relationship Graph</span>
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold opacity-60">
              Visualizando Conexões Estratégicas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] relative p-0 overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-2 px-6">
          <Share2 className="size-8 text-muted-foreground/40 mx-auto" />
          <p className="text-[11px] font-medium text-muted-foreground">
            Nenhum grafo de relacionamento disponível
          </p>
          <p className="text-[10px] text-muted-foreground/70 leading-snug">
            As conexões entre contas, stakeholders e deals serão exibidas aqui quando o
            módulo de deal intelligence mapear os relacionamentos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
