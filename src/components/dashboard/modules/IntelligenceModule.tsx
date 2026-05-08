import { MicroGoalsWidget } from "@/components/dashboard/widgets/MicroGoalsWidget";
import { VelocityScoreWidget } from "@/components/dashboard/widgets/VelocityScoreWidget";
import { ActivityQualityWidget } from "@/components/dashboard/widgets/ActivityQualityWidget";
import { SelfBenchmarkWidget } from "@/components/dashboard/widgets/SelfBenchmarkWidget";

export const IntelligenceModule = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MicroGoalsWidget />
      <VelocityScoreWidget />
      <ActivityQualityWidget />
      <SelfBenchmarkWidget />
    </div>
  );
};
