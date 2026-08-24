import { FC } from "react";
import { SkillGapSummary } from "./SkillGapSummary";
import { SkillRadarChart } from "./SkillRadarChart";
import { SkillMaturityMatrix } from "./SkillMaturityMatrix";
import { SkillTrackCards } from "./SkillTrackCards";

export const SkillGapAnalyzerPanel: FC = () => (
  <div className="space-y-6">
    <SkillGapSummary />
    <div className="grid gap-4 lg:grid-cols-2">
      <SkillRadarChart />
      <SkillMaturityMatrix />
    </div>
    <SkillTrackCards />
  </div>
);
