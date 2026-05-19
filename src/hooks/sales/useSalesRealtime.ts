import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSoundSettings } from "@/hooks/useSoundSettings";
import { useSystemSoundSettings } from "@/hooks/useSystemSoundSettings";
import { XP_REWARDS, getLevelInfo } from "@/hooks/gamification/useSalespersonXP";
import { useCelebration } from "@/hooks/useCelebration";
import { useUserRoles } from "@/hooks/useUserRoles";
import { triggerConfetti, awardSaleXP, getRankTitle } from "./salesRealtimeUtils";

export { getRankTitle };

type SalespersonRole = "sdr" | "closer" | "hybrid";

interface SalePayload {
  id: string;
  client_name: string;
  amount: number;
  salesperson_id: string | null;
  status: string;
  created_at: string;
}

export function useSalesRealtime(currentSalespersonId?: string, currentSalespersonRole?: SalespersonRole) {
  const queryClient = useQueryClient();
  const { playSound } = useSoundSettings();
  const { playSoundForCategory } = useSystemSoundSettings();
  const { celebrateLevelUp, triggerLevelUpConfetti } = useCelebration();
  const { isAdmin, isManager } = useUserRoles();
  const celebrationRef = useRef({ celebrateLevelUp, triggerLevelUpConfetti });

  useEffect(() => {
    celebrationRef.current = { celebrateLevelUp, triggerLevelUpConfetti };
  }, [celebrateLevelUp, triggerLevelUpConfetti]);

  const shouldReceiveNotification = useCallback((sellerRole: SalespersonRole | null): boolean => {
    if (isAdmin || isManager) return true;
    if (!sellerRole || !currentSalespersonRole) return true;
    if (currentSalespersonRole === "hybrid") return true;
    if (currentSalespersonRole === "sdr") return sellerRole === "sdr" || sellerRole === "hybrid";
    if (currentSalespersonRole === "closer") return sellerRole === "closer" || sellerRole === "hybrid";
    return true;
  }, [isAdmin, isManager, currentSalespersonRole]);

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["competitive-ranking"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis-period"] });
    queryClient.invalidateQueries({ queryKey: ["salesperson-xp"] });
    queryClient.invalidateQueries({ queryKey: ["all-salespeople-xp"] });
  }, [queryClient]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel("sales-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sales" }, async (payload) => {
        const newSale = payload.new as SalePayload;
        if (newSale.status !== "completed" || !newSale.salesperson_id) return;

        // Fetch salesperson data with internal cache check or efficient query
        const salesperson = await queryClient.fetchQuery({
          queryKey: ["salesperson-details", newSale.salesperson_id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from("salespeople")
              .select("name, avatar_url, role")
              .eq("id", newSale.salesperson_id!)
              .single();
            if (error) throw error;
            return data;
          },
          staleTime: 5 * 60 * 1000 // 5 minutes cache
        });

        if (!salesperson) return;

        if (!shouldReceiveNotification(salesperson.role as SalespersonRole | null)) {
          invalidateQueries();
          return;
        }

        const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(newSale.amount);

        playSound();
        playSoundForCategory('newSale');
        triggerConfetti(newSale.amount);

        const xpFromSale = Math.floor(newSale.amount / 1000) * XP_REWARDS.SALE_PER_1000;
        if (xpFromSale > 0) {
          const levelUpResult = await awardSaleXP(newSale.salesperson_id!, xpFromSale, newSale.id, newSale.amount, salesperson.name);
          if (levelUpResult?.leveledUp) {
            const newLevelInfo = getLevelInfo(levelUpResult.newLevel);
            setTimeout(() => celebrationRef.current.celebrateLevelUp(salesperson.name, levelUpResult.newLevel, newLevelInfo.title, newLevelInfo.emoji), 1500);
          }
        }

        toast.success(`🔥 ${salesperson.name} fechou uma venda!`, { description: `${newSale.client_name} - ${formattedAmount}. +${xpFromSale} XP! 🚀`, duration: 8000 });

        if (currentSalespersonId !== newSale.salesperson_id && "Notification" in window && Notification.permission === "granted") {
          new Notification(`🔥 ${salesperson.name} fechou uma venda!`, {
            body: `${newSale.client_name} - ${formattedAmount}. +${xpFromSale} XP! 🚀`,
            icon: salesperson.avatar_url || "/placeholder.svg",
            tag: `sale-${newSale.id}`,
          });
        }

        invalidateQueries();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentSalespersonId, currentSalespersonRole, isAdmin, isManager, queryClient, playSound, shouldReceiveNotification, invalidateQueries, playSoundForCategory]);
}
