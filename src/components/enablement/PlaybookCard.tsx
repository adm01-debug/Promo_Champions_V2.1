import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, ArrowRight, Shield, Zap, PlayCircle } from "lucide-react";
import type { Playbook } from "@/hooks/useSalesEnablement";
import { PlaybookExecutionDialog } from "./PlaybookExecutionDialog";

export const PlaybookCard = ({ playbook }: { playbook: Playbook }) => {
  return (
    <Card className="glass border-primary/20 hover:border-primary/40 transition-all group overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Shield className="size-24 text-primary" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px] font-black">
            {playbook.stage || "Geral"}
          </Badge>
          <Badge className="bg-success/10 text-success border-success/30 text-[10px]">
            <Zap className="size-3 mr-1" /> IA Ativa
          </Badge>
        </div>
        <CardTitle className="text-lg font-display font-bold mt-2 group-hover:gradient-text transition-all">
          {playbook.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {playbook.description || "Guia estratégico para condução de deals."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {playbook.items?.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="size-4 rounded-full border border-border flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-2.5 opacity-20" />
              </div>
              <span className="truncate">{item.content}</span>
            </div>
          ))}
          {playbook.items?.length > 3 && (
            <p className="text-[10px] text-muted-foreground pl-6">
              + {playbook.items.length - 3} passos recomendados
            </p>
          )}
        </div>
        <PlaybookExecutionDialog playbook={playbook} />
      </CardContent>
    </Card>
  );
};
