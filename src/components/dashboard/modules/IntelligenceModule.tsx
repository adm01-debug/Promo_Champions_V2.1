import IntelligenceCockpit from "@/components/intelligence/IntelligenceCockpit";
import { MicroGoalsWidget } from "@/components/dashboard/widgets/MicroGoalsWidget";
import { VelocityScoreWidget } from "@/components/dashboard/widgets/VelocityScoreWidget";
import { ActivityQualityWidget } from "@/components/dashboard/widgets/ActivityQualityWidget";
import { SelfBenchmarkWidget } from "@/components/dashboard/widgets/SelfBenchmarkWidget";
import { CompetencyRadar } from "@/components/analytics/CompetencyRadar";
import { useCompetencyData } from "@/hooks/useCompetencyData";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Brain, LayoutDashboard, Target } from "lucide-react";
import { PredictiveSuccessMap } from "@/components/sdr/PredictiveSuccessMap";
import { PerformanceCoaching } from "@/components/sdr/PerformanceCoaching";
import { LeadScoreBreakdown } from "@/components/sdr/LeadScoreBreakdown";

export const IntelligenceModule = () => {
  const { salesperson } = useAuth();
  const { data: competencyData } = useCompetencyData(salesperson?.id);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Tabs defaultValue="cockpit" className="space-y-8">
        <div className="flex justify-center sm:justify-start">
          <TabsList className="bg-muted/50 p-1 border border-border/40 backdrop-blur-sm">
            <TabsTrigger value="cockpit" className="data-[state=active]:bg-background gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Cockpit Hub
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-background gap-2">
              <Sparkles className="w-4 h-4" />
              Skills & Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-background gap-2">
              <Brain className="w-4 h-4" />
              Tactical Insights
            </TabsTrigger>
            <TabsTrigger value="sdr" className="data-[state=active]:bg-background gap-2">
              <Target className="w-4 h-4" />
              SDR Intelligence
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cockpit" className="mt-0 outline-none">
          <IntelligenceCockpit />
        </TabsContent>

        <TabsContent value="skills" className="mt-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <CompetencyRadar 
                data={competencyData} 
                compact 
                showDetails={false}
                className="h-full glass border-border/40"
              />
            </div>
            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
                <MicroGoalsWidget />
              </div>
              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
                <VelocityScoreWidget />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-0 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
              <ActivityQualityWidget />
            </div>
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
              <SelfBenchmarkWidget />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sdr" className="mt-0 outline-none space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <PredictiveSuccessMap />
              <PerformanceCoaching />
            </div>
            <div className="lg:col-span-4">
              <LeadScoreBreakdown />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
