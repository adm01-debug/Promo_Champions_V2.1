import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScriptVariantStats {
  variant: string;
  total: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface ScriptABResult {
  variants: ScriptVariantStats[];
  winnerVariant: string | null;
  chiSquare: number | null;
  significant: boolean;
}

interface SaleRow {
  status: string | null;
  script_variant: string | null;
}

/**
 * Chi-square independence test for two variants A/B.
 * Significant if p < 0.05 (chi² > 3.841 with df=1).
 */
function chiSquare2x2(a: ScriptVariantStats, b: ScriptVariantStats): number | null {
  const total = a.total + b.total;
  if (total < 30) return null;
  const totalWins = a.wins + b.wins;
  const totalLosses = a.losses + b.losses;
  if (totalWins === 0 || totalLosses === 0) return null;

  const expectedAWin = (a.total * totalWins) / total;
  const expectedALoss = (a.total * totalLosses) / total;
  const expectedBWin = (b.total * totalWins) / total;
  const expectedBLoss = (b.total * totalLosses) / total;

  const term = (o: number, e: number) => (e === 0 ? 0 : ((o - e) ** 2) / e);
  return (
    term(a.wins, expectedAWin) +
    term(a.losses, expectedALoss) +
    term(b.wins, expectedBWin) +
    term(b.losses, expectedBLoss)
  );
}

export function useScriptABTest() {
  return useQuery({
    queryKey: ["wl-script-ab"],
    queryFn: async (): Promise<ScriptABResult> => {
      const { data, error } = await supabase
        .from("sales")
        .select("status, script_variant")
        .not("script_variant", "is", null)
        .in("status", ["won", "lost"])
        .limit(2000);

      if (error) throw error;
      const rows = (data ?? []) as unknown as SaleRow[];

      const map = new Map<string, ScriptVariantStats>();
      rows.forEach((r) => {
        const v = r.script_variant ?? "—";
        const cur = map.get(v) ?? { variant: v, total: 0, wins: 0, losses: 0, winRate: 0 };
        if (r.status === "won") cur.wins++;
        else if (r.status === "lost") cur.losses++;
        cur.total = cur.wins + cur.losses;
        cur.winRate = cur.total ? (cur.wins / cur.total) * 100 : 0;
        map.set(v, cur);
      });

      const variants = Array.from(map.values()).sort((a, b) => b.winRate - a.winRate);
      let chi: number | null = null;
      let significant = false;
      let winnerVariant: string | null = null;

      if (variants.length >= 2) {
        chi = chiSquare2x2(variants[0], variants[1]);
        significant = chi !== null && chi > 3.841;
        winnerVariant = significant ? variants[0].variant : null;
      }

      return { variants, winnerVariant, chiSquare: chi, significant };
    },
    staleTime: 10 * 60_000,
  });
}
