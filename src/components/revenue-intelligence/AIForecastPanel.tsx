import { FC, useState } from "react";
import { RevenueForecastCard } from "./RevenueForecastCard";
import { ForecastDealsTable } from "./ForecastDealsTable";
import {
  ForecastPeriodType,
  useRevenueForecast,
} from "@/hooks/revenue-intelligence/useRevenueForecast";
import { getCurrentPeriodStart } from "./forecastHelpers";

export const AIForecastPanel: FC = () => {
  const [periodType, setPeriodType] = useState<ForecastPeriodType>("month");
  const [periodStart, setPeriodStart] = useState<string>(() => getCurrentPeriodStart("month"));
  const { data } = useRevenueForecast(periodType, periodStart, null);

  const handleChangeType = (t: ForecastPeriodType) => {
    setPeriodType(t);
    setPeriodStart(getCurrentPeriodStart(t));
  };

  return (
    <div className="space-y-4">
      <RevenueForecastCard
        periodType={periodType}
        periodStart={periodStart}
        onChangeType={handleChangeType}
        onChangeStart={setPeriodStart}
        ownerId={null}
      />
      <ForecastDealsTable forecastId={data?.id} />
    </div>
  );
};
