import { MicroGoalsWidget } from "@/components/dashboard/widgets/MicroGoalsWidget";
import { VelocityScoreWidget } from "@/components/dashboard/widgets/VelocityScoreWidget";
import { ActivityQualityWidget } from "@/components/dashboard/widgets/ActivityQualityWidget";
import { SelfBenchmarkWidget } from "@/components/dashboard/widgets/SelfBenchmarkWidget";

export const IntelligenceModule = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
        <MicroGoalsWidget />
      </div>
      <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
        <VelocityScoreWidget />
      </div>
      <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
        <ActivityQualityWidget />
      </div>
      <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/30 transition-all hover:shadow-primary/5">
        <SelfBenchmarkWidget />
      </div>
    </div>
  );
};
