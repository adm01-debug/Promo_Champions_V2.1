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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-3xl bg-gradient-to-b from-primary/5 to-transparent border border-primary/10 p-1 shadow-2xl">
        <FuturisticRanking />
      </div>
      
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        data-tour="gamification"
      >
        <div className="rounded-2xl border border-border/40 bg-card p-2 shadow-lg hover:border-primary/20 transition-all">
          <RecentDeals />
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-2 shadow-lg hover:border-primary/20 transition-all">
          <TopProducts />
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-2 shadow-lg hover:border-primary/20 transition-all">
          <MiniLeaderboard />
        </div>
        
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/20 transition-all">
          <StreakWidget salespersonId={salesperson?.id} />
        </div>
        
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/20 transition-all">
          <DailyChallengesCard salespersonId={salesperson?.id} compact showTestButton />
        </div>
        
        <div className="lg:col-span-3 rounded-2xl border border-border/40 bg-card p-4 shadow-lg hover:border-primary/20 transition-all bg-gradient-to-r from-card via-card to-primary/5">
          <WeeklyChallengesCard salespersonId={salesperson?.id} compact />
        </div>
      </div>
    </div>
  );
};
