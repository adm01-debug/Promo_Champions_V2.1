import { useIntelligenceZones } from '@/hooks/dashboard/useIntelligenceZones';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useBIDossierExport = (
  clientId?: string,
  clientName?: string,
  ramoAtividade?: string
) => {
  const { data: biData, isLoading } = useIntelligenceZones(clientId, ramoAtividade);
  const { salesperson } = useAuth();

  const exportToPDF = async () => {
    if (!biData) {
      toast.error('Dados de BI ainda não carregados.');
      return;
    }

    try {
      const doc = new jsPDF();
      type AutoTableDoc = typeof doc & {
        autoTable: (opts: unknown) => void;
        lastAutoTable: { finalY: number };
        internal: typeof doc.internal & { getNumberOfPages: () => number };
      };
      const adoc = doc as AutoTableDoc;
      const timestamp = format(new Date(), 'yyyy-MM-dd');
      const clientSlug = (clientName || 'cliente').toLowerCase().replace(/\s+/g, '-');
      const primaryColor = [76, 29, 149]; // Dark Violet

      // Page 1: Capa Violeta
      doc.setFillColor(76, 29, 149);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(40);
      doc.setFont('helvetica', 'bold');
      doc.text('CIRCÜITO', 105, 80, { align: 'center' });
      doc.setFontSize(20);
      doc.text('Dossiê de Inteligência BI', 105, 100, { align: 'center' });

      doc.setFontSize(28);
      doc.text(clientName || 'Relatório Analítico', 105, 130, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Vendedor: ${salesperson?.name || 'N/A'}`, 105, 160, { align: 'center' });
      doc.text(`Setor: ${ramoAtividade || 'Geral'}`, 105, 170, { align: 'center' });
      doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy')}`, 105, 180, {
        align: 'center',
      });

      doc.setFontSize(10);
      doc.text('Confidencial · uso interno comercial', 105, 280, { align: 'center' });

      // Page 2: Visão 360°
      doc.addPage();
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Visão 360° do Cliente', 20, 30);

      // KPI Boxes (Simulated with Rects)
      const kpis = [
        { label: 'LTV', value: `R$ ${biData.customer360.ltv.toLocaleString()}` },
        {
          label: 'Ticket Médio',
          value: `R$ ${biData.customer360.avgTicket.toLocaleString()}`,
        },
        { label: 'Recência', value: `${biData.customer360.recency} dias` },
        { label: 'Total Pedidos', value: biData.customer360.orderCount.toString() },
      ];

      kpis.forEach((kpi, i) => {
        const x = 20 + i * 45;
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(x, 40, 40, 30, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(kpi.label, x + 20, 50, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x + 20, 62, { align: 'center' });
      });

      doc.setFontSize(14);
      doc.text('Timeline de Pedidos (Últimos 5)', 20, 90);

      const orders = biData.customer360.lastOrders.map(o => [
        format(new Date(o.date), 'dd/MM/yyyy'),
        `R$ ${o.value.toLocaleString()}`,
        o.status === 'delivered' ? 'Entregue' : o.status,
      ]);

      adoc.autoTable({
        startY: 100,
        head: [['Data', 'Valor', 'Status']],
        body: orders,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
      });

      // Page 3: Cliente vs Setor
      doc.addPage();
      doc.setFontSize(18);
      doc.text('2. Benchmark Cliente vs Setor', 20, 30);

      const benchmarkData = biData.benchmarks.map(b => {
        const diff = ((b.client - b.sector) / b.sector) * 100;
        return [
          b.metric,
          `${b.client}${b.unit}`,
          `${b.sector}${b.unit}`,
          `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
        ];
      });

      adoc.autoTable({
        startY: 40,
        head: [['Métrica', 'Cliente', 'Média Setor', 'Variação (Delta)']],
        body: benchmarkData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
      });

      doc.setFontSize(12);
      doc.text('Insights de Performance:', 20, adoc.lastAutoTable.finalY + 15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const insightText = biData.benchmarks
        .map(b => `• ${b.metric}: ${b.insight}`)
        .join('\n');
      doc.text(insightText, 25, adoc.lastAutoTable.finalY + 25);

      // Page 4: Recomendações
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Matriz de Recomendações', 20, 30);

      doc.setFontSize(14);
      doc.text('Afinidade de Categorias e Produtos', 20, 45);
      const categoryText = `Categorias Dominantes: ${biData.affinity.topCategories.join(', ')}`;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(categoryText, 20, 52);

      const suggestions = biData.affinity.suggestedProducts.map(p => [
        p.name,
        `${p.confidence}%`,
      ]);
      adoc.autoTable({
        startY: 60,
        head: [['Produto Sugerido', 'Confiança da IA']],
        body: suggestions,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
      });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'Tendências do Setor (Janela 90 dias)',
        20,
        adoc.lastAutoTable.finalY + 15
      );
      const trends = biData.sectorTrends.map(t => [t.name, t.growth, (t.sales ?? 0).toString()]);
      adoc.autoTable({
        startY: adoc.lastAutoTable.finalY + 25,
        head: [['Produto em Alta', 'Crescimento', 'Volume de Vendas']],
        body: trends,
        theme: 'grid',
      });

      doc.setFontSize(14);
      doc.text('Sugestão do Especialista', 20, adoc.lastAutoTable.finalY + 15);
      const curated = biData.expertCurated.map((e: { name: string; reason: string }) => [
        e.name,
        e.reason,
      ]);
      adoc.autoTable({
        startY: adoc.lastAutoTable.finalY + 25,
        head: [['Produto Curadoria', 'Justificativa Estratégica']],
        body: curated,
        theme: 'striped',
      });

      // Page 5: Sazonalidade
      doc.addPage();
      doc.setFontSize(18);
      doc.text('4. Análise de Sazonalidade (Fase 4)', 20, 30);

      const seasonalityTable = biData.seasonality.months.map((m, i) => {
        const clientPoint = biData.seasonality.clientIntensity.find(
          p => Number(p.month) === i + 1
        );
        const sectorPoint = biData.seasonality.industryIntensity.find(
          p => Number(p.month) === i + 1
        );
        const clientVol = Number(clientPoint?.quotes_count || 0);
        const totalYearVol = biData.seasonality.clientIntensity.reduce(
          (acc, p) => acc + Number(p.quotes_count || 0),
          0
        );
        const share =
          totalYearVol > 0 ? ((clientVol / totalYearVol) * 100).toFixed(1) + '%' : '0%';

        return [
          m,
          clientVol.toString(),
          share,
          (sectorPoint?.intensity || 0).toFixed(1) + '%',
        ];
      });

      adoc.autoTable({
        startY: 40,
        head: [['Mês', 'Pedidos (Cliente)', '% do Ano', 'Intensidade Setor']],
        body: seasonalityTable,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
      });

      const nextPeakY = adoc.lastAutoTable.finalY + 20;
      doc.setFillColor(245, 245, 255);
      doc.roundedRect(20, nextPeakY, 170, 35, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(76, 29, 149);
      doc.text(
        `PRÓXIMO PICO ESTIMADO: ${biData.seasonality.nextPeak.month.toUpperCase()}`,
        105,
        nextPeakY + 12,
        { align: 'center' }
      );
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const splitInsight = doc.splitTextToSize(
        `INSIGHT: ${biData.seasonality.nextPeak.insight}`,
        150
      );
      doc.text(splitInsight, 30, nextPeakY + 22);

      // Rodapé Fixo
      const pageCount = adoc.internal.getNumberOfPages();
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Confidencial · uso interno comercial', 105, 285, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, 200, 285, { align: 'right' });
      }

      doc.save(`dossie-bi-${clientSlug}-${timestamp}.pdf`);
      toast.success('Dossiê BI exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Falha ao gerar o dossiê PDF.');
    }
  };

  return { exportToPDF, isExporting: isLoading };
};
