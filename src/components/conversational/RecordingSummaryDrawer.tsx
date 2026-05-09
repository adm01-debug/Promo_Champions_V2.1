import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCallRecordings } from "@/hooks/conversational/useCallRecordings";
import { MeetingSummaryCard } from "./MeetingSummaryCard";
import { ActionItemsList } from "./ActionItemsList";
import { DecisionsAndObjectionsPanel } from "./DecisionsAndObjectionsPanel";
import { NextStepsTimeline } from "./NextStepsTimeline";
import { SummarizeButton } from "./SummarizeButton";
import { CompetitorMentionsCard } from "./CompetitorMentionsCard";
import { CoachingActionsList } from "./CoachingActionsList";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useExtractCommitteeFromCall } from "@/hooks/deal-intelligence/useCommitteeCoverage";
import { SentimentTimelineChart } from "./SentimentTimelineChart";
import { CriticalMomentsList } from "./CriticalMomentsList";
import { useCriticalMoments } from "@/hooks/conversational/useCriticalMoments";
import { ConversationMetricsCard } from "./metrics/ConversationMetricsCard";
import { QuestionQualityCard } from "./questions/QuestionQualityCard";
import { ObjectionHandlingCard } from "./objections/ObjectionHandlingCard";
import { CoachingScorecardCard } from "./coaching/CoachingScorecardCard";
import { Skeleton } from "@/components/ui/skeleton";
import { IntentTracker, type Intent } from "./IntentTracker";
import type { ActionItem, Decision, NextStep, Objection } from "./meetingSummaryHelpers";

interface Props {
  recordingId: string | null;
  onClose: () => void;
}

export const RecordingSummaryDrawer = ({ recordingId, onClose }: Props) => {
  const { data: recordings, isLoading } = useCallRecordings();
  const rec = recordings?.find((r) => r.id === recordingId) ?? null;
  const { data: moments } = useCriticalMoments(rec?.id);

  return (
    <Sheet open={!!recordingId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="pr-6">{rec?.title ?? "Carregando..."}</SheetTitle>
          <SheetDescription>Resumo executivo gerado por IA</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-24" />
          </div>
        ) : rec ? (
          <div className="space-y-4">
            <div className="flex justify-end gap-2 flex-wrap">
              <SummarizeButton recordingId={rec.id} hasSummary={!!rec.summary} />
              {rec.sale_id && <ExtractCommitteeButton recordingId={rec.id} />}
            </div>

            <CoachingScorecardCard recordingId={rec.id} />

            {!rec.summary && (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <p className="text-sm">Esta gravação ainda não tem resumo de IA.</p>
                <p className="text-xs mt-1">Clique em "Gerar resumo IA" acima.</p>
              </div>
            )}

            <MeetingSummaryCard
              summary={rec.summary ?? null}
              sentiment={rec.sentiment ?? null}
              keyTopics={rec.key_topics ?? null}
              summarizedAt={rec.summarized_at ?? null}
            />
            <ActionItemsList
              recordingId={rec.id}
              items={(rec.action_items as ActionItem[]) ?? []}
            />
            <DecisionsAndObjectionsPanel
              decisions={(rec.decisions as Decision[]) ?? []}
              objections={(rec.objections_summary as Objection[]) ?? []}
            />
            <NextStepsTimeline steps={(rec.next_steps as NextStep[]) ?? []} />
            <SentimentTimelineChart recordingId={rec.id} moments={moments ?? []} />
            <ConversationMetricsCard recordingId={rec.id} />
            <QuestionQualityCard recordingId={rec.id} />
            <ObjectionHandlingCard recordingId={rec.id} />
            <CriticalMomentsList recordingId={rec.id} />
            <CompetitorMentionsCard recordingId={rec.id} />
            <CoachingActionsList recordingId={rec.id} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

function ExtractCommitteeButton({ recordingId }: { recordingId: string }) {
  const extract = useExtractCommitteeFromCall();
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => extract.mutate(recordingId)}
      disabled={extract.isPending}
      className="gap-1"
    >
      <Users className="h-3.5 w-3.5" />
      {extract.isPending ? "Mapeando..." : "Mapear comitê"}
    </Button>
  );
}

export const useRecordingSummaryDrawer = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  return { openId, open: setOpenId, close: () => setOpenId(null) };
};
