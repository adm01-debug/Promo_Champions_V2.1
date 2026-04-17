import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCallRecordings } from "@/hooks/conversational/useCallRecordings";
import { MeetingSummaryCard } from "./MeetingSummaryCard";
import { ActionItemsList } from "./ActionItemsList";
import { DecisionsAndObjectionsPanel } from "./DecisionsAndObjectionsPanel";
import { NextStepsTimeline } from "./NextStepsTimeline";
import { SummarizeButton } from "./SummarizeButton";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActionItem, Decision, NextStep, Objection } from "./meetingSummaryHelpers";

interface Props {
  recordingId: string | null;
  onClose: () => void;
}

export const RecordingSummaryDrawer = ({ recordingId, onClose }: Props) => {
  const { data: recordings, isLoading } = useCallRecordings();
  const rec = recordings?.find((r) => r.id === recordingId) ?? null;

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
            <div className="flex justify-end">
              <SummarizeButton recordingId={rec.id} hasSummary={!!rec.summary} />
            </div>

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
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export const useRecordingSummaryDrawer = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  return { openId, open: setOpenId, close: () => setOpenId(null) };
};
