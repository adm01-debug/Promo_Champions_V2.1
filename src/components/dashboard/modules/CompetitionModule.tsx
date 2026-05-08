import { FuturisticRanking } from "@/components/dashboard/FuturisticRanking";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { MiniLeaderboard } from "@/components/dashboard/MiniLeaderboard";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { DailyChallengesCard } from "@/components/gamification/DailyChallengesCard";
import { WeeklyChallengesCard } from "@/components/gamification/WeeklyChallengesCard";

interface CompetitionModuleProps {
  salesperson: any;
}

export const CompetitionModule = ({ salesperson }: CompetitionModuleProps) => {
  return (
    <div className="space-y-8">
      <FuturisticRanking />
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        data-tour="gamification"
      >
        <RecentDeals />
        <TopProducts />
        <MiniLeaderboard />
        <div className="lg:col-span-2">
          <StreakWidget salespersonId={salesperson?.id} />
        </div>
        <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
        <div className="lg:col-span-3">
          <WeeklyChallengesCard salespersonId={salesperson?.id} compact />
        </div>
      </div>
    </div>
  );
};
