import { MoodTrackerWidget } from "@/components/engagement/MoodTrackerWidget";
import { PulseSurveyWidget } from "@/components/engagement/PulseSurveyWidget";
import { DailyQuizWidget } from "@/components/gamification/DailyQuizWidget";

export const EngagementModule = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 shadow-xl hover:border-primary/20 transition-all">
        <MoodTrackerWidget />
      </div>
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 shadow-xl hover:border-primary/20 transition-all">
        <PulseSurveyWidget />
      </div>
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 shadow-xl hover:border-primary/20 transition-all">
        <DailyQuizWidget />
      </div>
    </div>
  );
};
