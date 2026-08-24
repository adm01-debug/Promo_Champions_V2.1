import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface DossierClientData {
  ltv: number;
  avgTicket: number;
  recency: number;
  orderCount: number;
  lastOrders: { date: string | number | Date; value: number; status: string }[];
}
interface DossierComparisonItem {
  metric: string;
  client: number;
  sector: number;
  unit: string;
}
interface DossierExpertItem {
  name: string;
  reason: string;
}
interface DossierSeasonalityData {
  nextPeak: { month: string; insight: string };
}

export const generateDossierPDF = async (
  clientData: unknown,
  comparisonData: unknown,
  trendsData: unknown,
  seasonalityData: unknown,
  expertData: unknown,
  clientName: string,
  salespersonName: string,
  ramoAtividade: string
) => {
  // Casts locais tipados para os dados dinâmicos vindos do BI.
  const client = clientData as DossierClientData;
  const comparison = comparisonData as DossierComparisonItem[];
  const seasonality = seasonalityData as DossierSeasonalityData;
  const expert = expertData as DossierExpertItem[];
  void trendsData;
  const doc = new jsPDF();
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
  doc.text(`Vendedor: ${salespersonName}`, 105, 160, { align: 'center' });
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

  const kpis = [
    { label: 'LTV', value: `R$ ${client.ltv.toLocaleString()}` },
    { label: 'Ticket Médio', value: `R$ ${client.avgTicket.toLocaleString()}` },
    { label: 'Recência', value: `${client.recency} dias` },
    { label: 'Total Pedidos', value: client.orderCount.toString() },
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
  const orders = client.lastOrders.map(o => [
    format(new Date(o.date), 'dd/MM/yyyy'),
    `R$ ${o.value.toLocaleString()}`,
    o.status,
  ]);
  (doc as jsPDF & { autoTable: (opts: unknown) => void }).autoTable({
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
  const benchmarkData = comparison.map(b => {
    const diff = ((b.client - b.sector) / b.sector) * 100;
    return [
      b.metric,
      `${b.client}${b.unit}`,
      `${b.sector}${b.unit}`,
      `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
    ];
  });
  (doc as jsPDF & { autoTable: (opts: unknown) => void }).autoTable({
    startY: 40,
    head: [['Métrica', 'Cliente', 'Média Setor', 'Variação (Delta)']],
    body: benchmarkData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
  });

  // Page 4: Recomendações
  doc.addPage();
  doc.setFontSize(18);
  doc.text('3. Matriz de Recomendações', 20, 30);
  const expertTable = expert.map(e => [e.name, e.reason]);
  (doc as jsPDF & { autoTable: (opts: unknown) => void }).autoTable({
    startY: 40,
    head: [['Sugestão IA/Especialista', 'Justificativa Estratégica']],
    body: expertTable,
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
  });

  // Page 5: Sazonalidade
  doc.addPage();
  doc.setFontSize(18);
  doc.text('4. Análise de Sazonalidade', 20, 30);
  doc.setFontSize(12);
  doc.text(`Próximo Pico Estimado: ${seasonality.nextPeak.month.toUpperCase()}`, 20, 45);
  doc.setFontSize(10);
  doc.text(`Insight: ${seasonality.nextPeak.insight}`, 20, 52);

  // Rodapé Fixo
  const pageCount = (
    doc as jsPDF & { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Confidencial · uso interno comercial', 105, 285, { align: 'center' });
  }

  doc.save(`dossie-bi-${clientSlug}-${timestamp}.pdf`);
};
