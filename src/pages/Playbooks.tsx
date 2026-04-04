import { Helmet } from "react-helmet-async";
import { PlaybooksManager } from "@/components/playbooks/PlaybooksManager";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { PlaybooksLoadingSkeleton } from "@/components/skeletons/PageLoadingSkeleton";
import { SkeletonTransition } from "@/components/skeletons/SkeletonTransition";

export default function Playbooks() {
  const { isLoading } = usePlaybooks();

  return (
    <>
    <Helmet>
      <title>Playbooks | Promo Champions</title>
      <meta name="description" content="Estratégias e roteiros de vendas" />
    </Helmet>
    <SkeletonTransition
      isLoading={isLoading}
      skeleton={<PlaybooksLoadingSkeleton />}
      duration={400}
    >
      <div className="space-y-6">
        <PlaybooksManager />
      </div>
    </SkeletonTransition>
  </>
  );
}
