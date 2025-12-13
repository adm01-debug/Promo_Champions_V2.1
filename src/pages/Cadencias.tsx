import { useCadences, useCadenceSteps, useDeleteCadence } from "@/hooks/useCadences";
import { CreateCadenceDialog } from "@/components/cadences/CreateCadenceDialog";
import { CadenceCard } from "@/components/cadences/CadenceCard";
import { TodaysCadenceTasks } from "@/components/cadences/TodaysCadenceTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Clock, CheckCircle } from "lucide-react";
import { CadenciasLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

export default function Cadencias() {
  const { data: cadences, isLoading } = useCadences();
  const deleteCadence = useDeleteCadence();

  const activeCadences = cadences?.filter(c => c.is_active) || [];

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<CadenciasLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Gestão de Cadências</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Crie sequências automáticas de contato para seus prospects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Automação</span>
              </div>
              <CreateCadenceDialog />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCadences.length}</p>
                <p className="text-xs text-muted-foreground">Cadências Ativas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Prospects em Cadência</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/40">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Tarefas Concluídas Hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <TodaysCadenceTasks />
          </div>

          {/* Cadences List */}
          <div className="lg:col-span-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    Suas Cadências
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {cadences?.length || 0} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {cadences?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <GitBranch className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Nenhuma cadência criada</p>
                    <p className="text-xs mt-1">Crie sua primeira cadência de prospecção</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cadences?.map(cadence => (
                      <CadenceCardWithSteps
                        key={cadence.id}
                        cadence={cadence}
                        onDelete={() => deleteCadence.mutate(cadence.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </SkeletonTransition>
  );
}

function CadenceCardWithSteps({
  cadence, 
  onDelete 
}: { 
  cadence: any; 
  onDelete: () => void;
}) {
  const { data: steps } = useCadenceSteps(cadence.id);
  
  return (
    <CadenceCard
      cadence={cadence}
      steps={steps || []}
      onDelete={onDelete}
    />
  );
}
