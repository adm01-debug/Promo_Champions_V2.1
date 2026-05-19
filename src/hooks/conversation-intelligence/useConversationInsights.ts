import { useMemo } from "react";
import { useConversationAnalyses } from "@/hooks/conversation-intelligence/useConversationAnalyses";
import {
  sentimentDistribution,
  topObjectionsAcross,
} from "@/components/conversation-intelligence/conversationHelpers";

export function useConversationInsights(limit = 100) {
  const query = useConversationAnalyses(undefined, limit);
  const insights = useMemo(() => {
    const items = query.data ?? [];
    return {
      total: items.length,
      sentiment: sentimentDistribution(items),
      topObjections: topObjectionsAcross(items, 6),
      buyingSignalsTotal: items.reduce((acc, i) => acc + (i.buying_signals?.length ?? 0), 0),
      riskSignalsTotal: items.reduce((acc, i) => acc + (i.risk_signals?.length ?? 0), 0),
    };
  }, [query.data]);
  return { ...query, insights };
}
