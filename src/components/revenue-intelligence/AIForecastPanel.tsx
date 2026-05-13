import { FC, useState } from "react";
import { RevenueForecastCard } from "./RevenueForecastCard";
import { ForecastDealsTable } from "./ForecastDealsTable";
import { BuyingCommitteeMap } from "./BuyingCommitteeMap";
import {
  ForecastPeriodType,
  useRevenueForecast,
} from "@/hooks/revenue-intelligence/useRevenueForecast";
import { getCurrentPeriodStart } from "./forecastHelpers";

export const AIForecastPanel: FC = () => {
  const [periodType, setPeriodType] = useState<ForecastPeriodType>("month");
  const [periodStart, setPeriodStart] = useState<string>(() => getCurrentPeriodStart("month"));
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
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
      <ForecastDealsTable 
        forecastId={data?.id} 
        onSelectSale={setSelectedSaleId}
      />
      {selectedSaleId && (
        <div className="mt-6">
          <BuyingCommitteeMap saleId={selectedSaleId} />
        </div>
      )}
    </div>
  );
};
