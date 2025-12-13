import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSoundSettings } from "./useSoundSettings";

interface SalePayload {
  id: string;
  client_name: string;
  amount: number;
  salesperson_id: string | null;
  status: string;
  created_at: string;
}

const RANK_TITLES = {
  1: { title: "Lenda", emoji: "👑", color: "text-yellow-400" },
  2: { title: "Elite", emoji: "⚔️", color: "text-purple-400" },
  3: { title: "Veterano", emoji: "🏆", color: "text-amber-500" },
};

export function useSalesRealtime(currentSalespersonId?: string) {
  const queryClient = useQueryClient();
  const { playSound } = useSoundSettings();

  const triggerConfetti = useCallback(async () => {
    const confetti = (await import('canvas-confetti')).default;
    
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.2),
      spread: 60,
      origin: { x: 0.5, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.35),
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.8, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.1),
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.6 },
    });
  }, []);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel("sales-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sales",
        },
        async (payload) => {
          const newSale = payload.new as SalePayload;
          
          // Only notify for completed sales
          if (newSale.status !== "completed") return;

          // Get salesperson info
          if (newSale.salesperson_id) {
            const { data: salesperson } = await supabase
              .from("salespeople")
              .select("name, avatar_url")
              .eq("id", newSale.salesperson_id)
              .single();

            if (salesperson) {
              const formattedAmount = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(newSale.amount);

              // Play celebration sound and confetti
              playSound();
              triggerConfetti();

              // Show toast notification
              toast.success(
                `🔥 ${salesperson.name} fechou uma venda!`,
                {
                  description: `${newSale.client_name} - ${formattedAmount}. O clima de vendas está bom! 🚀`,
                  duration: 8000,
                }
              );

              // Send push notification if not the current user
              if (
                currentSalespersonId !== newSale.salesperson_id &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification(`🔥 ${salesperson.name} fechou uma venda!`, {
                  body: `${newSale.client_name} - ${formattedAmount}. O clima de vendas está bom! Não perca a oportunidade! 🚀`,
                  icon: salesperson.avatar_url || "/placeholder.svg",
                  tag: `sale-${newSale.id}`,
                });
              }
            }
          }

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["sales"] });
          queryClient.invalidateQueries({ queryKey: ["goals-dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["salespeople-ranking"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSalespersonId, queryClient, playSound, triggerConfetti]);
}

export function getRankTitle(rank: number) {
  return RANK_TITLES[rank as keyof typeof RANK_TITLES] || null;
}
