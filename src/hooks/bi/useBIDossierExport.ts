import { useAuth } from "@/contexts/AuthContext";
import { generateDossierPDF } from "@/lib/bi/dossierPdfGenerator";
import { toast } from "sonner";

export const useBIDossierExport = () => {
  const { salesperson } = useAuth();

  const exportToPDF = async (clientName: string, ramoAtividade: string, biData: any, comparisonData: any, trendsData: any, seasonalityData: any) => {
    try {
      await generateDossierPDF(
        biData.customer360,
        comparisonData,
        trendsData,
        seasonalityData,
        biData.expertCurated,
        clientName,
        salesperson?.name || "N/A",
        ramoAtividade
      );
      toast.success("Dossiê BI exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Falha ao gerar o dossiê PDF.");
    }
  };

  return { exportToPDF };
};
