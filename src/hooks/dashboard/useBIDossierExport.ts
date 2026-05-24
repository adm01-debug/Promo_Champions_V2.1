import { useIntelligenceZones } from "@/hooks/dashboard/useIntelligenceZones";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useBIDossierExport = (clientId?: string, clientName?: string, ramoAtividade?: string) => {
  const { data: biData, isLoading } = useIntelligenceZones(clientId, ramoAtividade);
  const { salesperson } = useAuth();

  const exportToPDF = async () => {
    if (!biData) {
      toast.error("Dados de BI ainda não carregados.");
      return;
    }

    try {
      const doc = new jsPDF();
      const timestamp = format(new Date(), "yyyy-MM-dd");
      const clientSlug = (clientName || "cliente").toLowerCase().replace(/\s+/g, "-");
      
      // Page 1: Capa Violeta
      doc.setFillColor(76, 29, 149); // Dark Violet
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(40);
      doc.setFont("helvetica", "bold");
      doc.text("Dossiê BI", 105, 100, { align: "center" });
      
      doc.setFontSize(24);
      doc.text(clientName || "Relatório de Inteligência", 105, 120, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Vendedor: ${salesperson?.name || "N/A"}`, 105, 150, { align: "center" });
      doc.text(`Data: ${format(new Date(), "dd/MM/yyyy")}`, 105, 160, { align: "center" });
      
      doc.setFontSize(10);
      doc.text("Confidencial · uso interno comercial", 105, 280, { align: "center" });

      // Page 2: Visão 360°
      doc.addPage();
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.text("1. Visão 360° do Cliente", 20, 20);
      
      const kpis = [
        ["LTV", `R$ ${biData.customer360.ltv.toLocaleString()}`],
        ["Ticket Médio", `R$ ${biData.customer360.avgTicket.toLocaleString()}`],
        ["Recência", `${biData.customer360.recency} dias`],
        ["Total Pedidos", biData.customer360.orderCount.toString()]
      ];

      (doc as any).autoTable({
        startY: 30,
        head: [['Métrica', 'Valor']],
        body: kpis,
        theme: 'striped',
        headStyles: { fillColor: [76, 29, 149] }
      });

      doc.text("Timeline Recente", 20, (doc as any).lastAutoTable.finalY + 15);
      
      const orders = biData.customer360.lastOrders.map(o => [
        format(new Date(o.date), "dd/MM/yyyy"),
        `R$ ${o.value.toLocaleString()}`,
        o.status
      ]);

      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Data', 'Valor', 'Status']],
        body: orders,
        theme: 'grid'
      });

      // Page 3: Cliente vs Setor
      doc.addPage();
      doc.setFontSize(18);
      doc.text("2. Benchmark Cliente vs Setor", 20, 20);
      
      const benchmarkData = biData.benchmarks.map(b => {
        const diff = ((b.client - b.sector) / b.sector) * 100;
        return [b.metric, `${b.client}${b.unit}`, `${b.sector}${b.unit}`, `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`];
      });

      (doc as any).autoTable({
        startY: 30,
        head: [['Métrica', 'Cliente', 'Média Setor', 'Delta']],
        body: benchmarkData,
        theme: 'striped',
        headStyles: { fillColor: [76, 29, 149] }
      });

      // Page 4: Recomendações
      doc.addPage();
      doc.setFontSize(18);
      doc.text("3. Recomendações e Tendências", 20, 20);
      
      doc.setFontSize(14);
      doc.text("Afinidade de Categorias", 20, 35);
      doc.setFontSize(10);
      doc.text(biData.affinity.topCategories.join(", "), 20, 42);

      const suggestions = biData.affinity.suggestedProducts.map(p => [p.name, `${p.confidence}%`]);
      (doc as any).autoTable({
        startY: 45,
        head: [['Produto Sugerido', 'Confiança']],
        body: suggestions,
        theme: 'grid'
      });

      doc.setFontSize(14);
      doc.text("Tendências do Setor (90 dias)", 20, (doc as any).lastAutoTable.finalY + 15);
      const trends = biData.sectorTrends.map(t => [t.name, t.growth, t.sales.toString()]);
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Produto', 'Crescimento', 'Vendas']],
        body: trends,
        theme: 'grid'
      });

      // Page 5: Sazonalidade
      doc.addPage();
      doc.setFontSize(18);
      doc.text("4. Análise de Sazonalidade (24 meses)", 20, 20);
      
      const monthsTable = biData.seasonality.months.map((m, i) => {
        const clientVal = biData.seasonality.clientIntensity.find(p => Number(p.month) === i + 1)?.quotes_count || 0;
        return [m, clientVal.toString()];
      });

      (doc as any).autoTable({
        startY: 30,
        head: [['Mês', 'Volume Médio (Quotes)']],
        body: monthsTable,
        theme: 'striped',
        headStyles: { fillColor: [76, 29, 149] }
      });

      doc.setFontSize(12);
      doc.text(`Próximo Pico: ${biData.seasonality.nextPeak.month}`, 20, (doc as any).lastAutoTable.finalY + 15);
      doc.setFontSize(10);
      const splitInsight = doc.splitTextToSize(`Insight: ${biData.seasonality.nextPeak.insight}`, 170);
      doc.text(splitInsight, 20, (doc as any).lastAutoTable.finalY + 22);

      // Rodapé Fixo em todas as páginas (exceto capa)
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Confidencial · uso interno comercial", 105, 285, { align: "center" });
        doc.text(`Página ${i} de ${pageCount}`, 200, 285, { align: "right" });
      }

      doc.save(`dossie-bi-${clientSlug}-${timestamp}.pdf`);
      toast.success("Dossiê exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Falha ao gerar o dossiê PDF.");
    }
  };

  return { exportToPDF, isExporting: isLoading };
};
