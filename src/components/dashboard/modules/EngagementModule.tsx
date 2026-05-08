import { MoodTrackerWidget } from "@/components/engagement/MoodTrackerWidget";
import { PulseSurveyWidget } from "@/components/engagement/PulseSurveyWidget";
import { DailyQuizWidget } from "@/components/gamification/DailyQuizWidget";

export const EngagementModule = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <MoodTrackerWidget />
      <PulseSurveyWidget />
      <DailyQuizWidget />
    </div>
  );
};
