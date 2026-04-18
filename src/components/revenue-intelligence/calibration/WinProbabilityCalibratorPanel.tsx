import { FC } from "react";
import { CalibrationSummaryCard } from "./CalibrationSummaryCard";
import { CalibratorBucketCurve } from "./CalibratorBucketCurve";
import { CalibrationFlagDistribution } from "./CalibrationFlagDistribution";
import { OverconfidentDealsTable } from "./OverconfidentDealsTable";

export const WinProbabilityCalibratorPanel: FC = () => {
  return (
    <div className="space-y-4">
      <CalibrationSummaryCard />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <CalibratorBucketCurve />
        <CalibrationFlagDistribution />
      </div>
      <OverconfidentDealsTable />
    </div>
  );
};
