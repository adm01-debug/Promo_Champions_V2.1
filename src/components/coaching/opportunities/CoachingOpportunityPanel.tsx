import { FC } from "react";
import { motion } from "framer-motion";
import { CoachingOpportunitySummary } from "./CoachingOpportunitySummary";
import { CoachingGapByRepTable } from "./CoachingGapByRepTable";
import { CoachingSkillFocusChart } from "./CoachingSkillFocusChart";
import { CoachingSeverityHeatmap } from "./CoachingSeverityHeatmap";
import { CoachingActionsPanel } from "./CoachingActionsPanel";

export const CoachingOpportunityPanel: FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
  >
    <CoachingOpportunitySummary />
    <div className="grid gap-4 lg:grid-cols-2">
      <CoachingSkillFocusChart />
      <CoachingSeverityHeatmap />
    </div>
    <CoachingGapByRepTable />
    <CoachingActionsPanel />
  </motion.div>
);
