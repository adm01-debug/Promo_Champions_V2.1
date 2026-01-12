import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Trophy, Zap, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGamificationData } from "@/hooks/useGamificationData";
import { getLevelInfo } from "@/hooks/useSalespersonXP";
import {
  exportGamificationToCSV,
  exportXPHistoryToCSV,
  exportAchievementsToCSV,
  exportFullGamificationReport,
} from "@/utils/gamificationExport";

interface GamificationExportButtonProps {
  salespersonId?: string;
  salespersonName?: string;
}

export function GamificationExportButton({
  salespersonId,
  salespersonName,
}: GamificationExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { data: gamificationData } = useGamificationData();

  // Fetch XP history for individual export
  const { data: xpHistory } = useQuery({
    queryKey: ["xp-history-export", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from("xp_history")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salespersonId,
  });

  // Fetch achievements for individual export
  const { data: achievements } = useQuery({
    queryKey: ["achievements-export", salespersonId],
    queryFn: async () => {
      if (!salespersonId) return [];
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("salesperson_id", salespersonId)
        .order("achievement_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!salespersonId,
  });

  const handleExportTeamData = async () => {
    if (!gamificationData || gamificationData.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = gamificationData.map((person) => ({
        name: person.name,
        email: undefined,
        totalXP: person.totalXP,
        currentLevel: person.level,
        levelTitle: person.levelTitle,
        currentStreak: person.currentStreak,
        bestStreak: person.bestStreak,
        achievementsCount: person.totalAchievements,
        dailyGoals: person.dailyGoalsAchieved,
        weeklyGoals: 0,
        personalRecords: person.streakMilestonesAchieved,
      }));

      exportGamificationToCSV(exportData);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Export error:", error);
      }
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFullReport = async () => {
    if (!gamificationData || gamificationData.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = gamificationData.map((person) => ({
        name: person.name,
        email: undefined,
        totalXP: person.totalXP,
        currentLevel: person.level,
        levelTitle: person.levelTitle,
        currentStreak: person.currentStreak,
        bestStreak: person.bestStreak,
        achievementsCount: person.totalAchievements,
        dailyGoals: person.dailyGoalsAchieved,
        weeklyGoals: 0,
        personalRecords: person.streakMilestonesAchieved,
      }));

      exportFullGamificationReport(exportData, "Todos os tempos");
      toast.success("Relatório completo exportado!");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Export error:", error);
      }
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXPHistory = async () => {
    if (!xpHistory || xpHistory.length === 0) {
      toast.error("Nenhum histórico de XP para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = xpHistory.map((entry) => ({
        date: entry.created_at,
        xpAmount: entry.xp_amount,
        sourceType: entry.source_type,
        description: entry.description || "",
      }));

      exportXPHistoryToCSV(salespersonName || "Vendedor", exportData);
      toast.success("Histórico de XP exportado!");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Export error:", error);
      }
      toast.error("Erro ao exportar histórico");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAchievements = async () => {
    if (!achievements || achievements.length === 0) {
      toast.error("Nenhuma conquista para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = achievements.map((entry) => ({
        date: entry.achievement_date,
        type: entry.achievement_type,
        details: JSON.stringify(entry.details || {}),
      }));

      exportAchievementsToCSV(salespersonName || "Vendedor", exportData);
      toast.success("Conquistas exportadas!");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Export error:", error);
      }
      toast.error("Erro ao exportar conquistas");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleExportTeamData}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Dados do Time (CSV)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportFullReport}>
          <Trophy className="h-4 w-4 mr-2" />
          Relatório Completo (CSV)
        </DropdownMenuItem>

        {salespersonId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {salespersonName || "Vendedor"}
            </DropdownMenuLabel>

            <DropdownMenuItem onClick={handleExportXPHistory}>
              <Zap className="h-4 w-4 mr-2" />
              Histórico de XP
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleExportAchievements}>
              <Trophy className="h-4 w-4 mr-2" />
              Conquistas
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
