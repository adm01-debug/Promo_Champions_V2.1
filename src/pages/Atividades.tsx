import { Helmet } from "react-helmet-async";
import { ActivityLogForm } from "@/components/activities/ActivityLogForm";
import { ActivityList } from "@/components/activities/ActivityList";
import { ActivityStats } from "@/components/activities/ActivityStats";
import { ActivityEffectiveness } from "@/components/activities/ActivityEffectiveness";
import { ActivityChannelEffectiveness } from "@/components/activities/ActivityChannelEffectiveness";
import { ActivityHeatmap } from "@/components/activities/ActivityHeatmap";
import { ClipboardList, Filter, Bell } from "lucide-react";
import { useActivities } from "@/hooks/useActivities";
import { AtividadesLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";
import { PageTransition } from "@/components/transitions/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SDRAlertSettings } from "@/components/activities/SDRAlertSettings";

export default function Atividades() {
  const { isLoading } = useActivities();

  return (
    <PageTransition>
    <>
    <Helmet>
      <title>Atividades | Promo Champions</title>
      <meta name="description" content="Registro e acompanhamento de atividades comerciais" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<AtividadesLoadingSkeleton />}
      duration={400}
    >
      <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-page-title gradient-text">SDR & Prospecção</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ecossistema de alta performance para qualificação e atividades
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <ClipboardList className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">Modo Registro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <ActivityStats />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/40 p-1">
            <TabsTrigger value="overview" className="text-xs font-bold uppercase tracking-wider px-6">Visão Geral</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs font-bold uppercase tracking-wider px-6 flex items-center gap-2">
              <Bell className="h-3 w-3" /> Configurar Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="space-y-6">
                  <ActivityLogForm />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    <ActivityEffectiveness />
                    <ActivityChannelEffectiveness />
                  </div>
                  <ActivityHeatmap />
                </div>
              </div>
              <div className="lg:col-span-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <ActivityList limit={100} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="max-w-xl">
            <div className="opacity-0 animate-fade-in-up">
              <SDRAlertSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </SkeletonTransition>
  </>
    </PageTransition>
  );
}
