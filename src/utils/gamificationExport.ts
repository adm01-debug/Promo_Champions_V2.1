import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalespersonGamificationData {
  name: string;
  email?: string;
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  currentStreak: number;
  bestStreak: number;
  achievementsCount: number;
  dailyGoals: number;
  weeklyGoals: number;
  personalRecords: number;
}

interface XPHistoryEntry {
  date: string;
  xpAmount: number;
  sourceType: string;
  description: string;
}

interface AchievementEntry {
  date: string;
  type: string;
  details: string;
}

// Export gamification data to CSV
export function exportGamificationToCSV(
  data: SalespersonGamificationData[],
  filename?: string
): void {
  const headers = [
    "Nome",
    "Email",
    "XP Total",
    "Nível",
    "Título",
    "Streak Atual",
    "Melhor Streak",
    "Total Conquistas",
    "Metas Diárias",
    "Metas Semanais",
    "Recordes Pessoais",
  ];

  const rows = data.map((person) => [
    person.name,
    person.email || "",
    person.totalXP.toString(),
    person.currentLevel.toString(),
    person.levelTitle,
    person.currentStreak.toString(),
    person.bestStreak.toString(),
    person.achievementsCount.toString(),
    person.dailyGoals.toString(),
    person.weeklyGoals.toString(),
    person.personalRecords.toString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `gamificacao_${format(new Date(), "yyyy-MM-dd")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export XP history to CSV
export function exportXPHistoryToCSV(
  salespersonName: string,
  history: XPHistoryEntry[],
  filename?: string
): void {
  const headers = ["Data", "XP Ganho", "Tipo", "Descrição"];

  const rows = history.map((entry) => [
    format(new Date(entry.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    entry.xpAmount.toString(),
    entry.sourceType,
    entry.description || "",
  ]);

  const csvContent = [
    `Histórico de XP - ${salespersonName}`,
    `Exportado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `xp_historico_${salespersonName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export achievements to CSV
export function exportAchievementsToCSV(
  salespersonName: string,
  achievements: AchievementEntry[],
  filename?: string
): void {
  const headers = ["Data", "Tipo de Conquista", "Detalhes"];

  const rows = achievements.map((entry) => [
    format(new Date(entry.date), "dd/MM/yyyy", { locale: ptBR }),
    entry.type,
    entry.details || "",
  ]);

  const csvContent = [
    `Conquistas - ${salespersonName}`,
    `Total: ${achievements.length} conquistas`,
    `Exportado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `conquistas_${salespersonName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export full gamification report to CSV
export function exportFullGamificationReport(
  teamData: SalespersonGamificationData[],
  periodLabel: string,
  filename?: string
): void {
  const totalXP = teamData.reduce((sum, p) => sum + p.totalXP, 0);
  const totalAchievements = teamData.reduce((sum, p) => sum + p.achievementsCount, 0);
  const avgLevel = teamData.length > 0 
    ? (teamData.reduce((sum, p) => sum + p.currentLevel, 0) / teamData.length).toFixed(1)
    : 0;
  const topPerformer = teamData.sort((a, b) => b.totalXP - a.totalXP)[0];

  const headers = [
    "Nome",
    "Nível",
    "Título",
    "XP Total",
    "Streak Atual",
    "Melhor Streak",
    "Conquistas",
    "Metas Diárias",
    "Recordes",
  ];

  const rows = teamData.map((person) => [
    person.name,
    person.currentLevel.toString(),
    person.levelTitle,
    person.totalXP.toString(),
    person.currentStreak.toString(),
    person.bestStreak.toString(),
    person.achievementsCount.toString(),
    person.dailyGoals.toString(),
    person.personalRecords.toString(),
  ]);

  const csvContent = [
    "=== RELATÓRIO DE GAMIFICAÇÃO ===",
    `Período: ${periodLabel}`,
    `Exportado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
    "",
    "=== RESUMO DO TIME ===",
    `Total de Vendedores: ${teamData.length}`,
    `XP Total do Time: ${totalXP.toLocaleString()}`,
    `Nível Médio: ${avgLevel}`,
    `Total de Conquistas: ${totalAchievements}`,
    topPerformer ? `Top Performer: ${topPerformer.name} (${topPerformer.totalXP.toLocaleString()} XP)` : "",
    "",
    "=== DADOS INDIVIDUAIS ===",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `relatorio_gamificacao_${format(new Date(), "yyyy-MM-dd")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
