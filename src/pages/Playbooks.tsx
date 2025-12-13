import { PlaybooksManager } from "@/components/playbooks/PlaybooksManager";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { PlaybooksLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

export default function Playbooks() {
  const { isLoading } = usePlaybooks();

  return (
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<PlaybooksLoadingSkeleton />}
      duration={400}
    >
      <div className="space-y-6">
        <PlaybooksManager />
      </div>
    </SkeletonTransition>
  );
}
