import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type jsPDF from "jspdf";

interface ReportData {
  period: string;
  revenue: { current: number; previous: number; change: number };
  sales: { current: number; previous: number; change: number };
  conversion: { current: number; change: number };
  avgTicket: { current: number; change: number };
  topDeals: Array<{ client: string; product: string; amount: number; status: string }>;
  teamRanking: Array<{ name: string; sales: number; goal: number; progress: number }>;
  pipelineStages: Array<{ stage: string; count: number; value: number }>;
}

const BRAND_GREEN = [0, 128, 64] as const;
const BRAND_DARK = [30, 30, 30] as const;

function addHeader(doc: jsPDF, title: string, period: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PROMO CHAMPIONS", 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(title, 14, 22);
  doc.setFontSize(9);
  doc.text(period, pageWidth - 14, 18, { align: "right" });
  doc.setTextColor(...BRAND_DARK);
}

function addFooter(doc: jsPDF, pageNum: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · Página ${pageNum}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );
}

function addKPISection(doc: jsPDF, data: ReportData, startY: number): number {
  let y = startY;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_DARK);
  doc.text("Indicadores Principais", 14, y);
  y += 8;

  const kpis = [
    { label: "Faturamento", value: `R$ ${data.revenue.current.toLocaleString("pt-BR")}`, change: data.revenue.change },
    { label: "Vendas", value: String(data.sales.current), change: data.sales.change },
    { label: "Conversão", value: `${data.conversion.current.toFixed(1)}%`, change: data.conversion.change },
    { label: "Ticket Médio", value: `R$ ${data.avgTicket.current.toLocaleString("pt-BR")}`, change: data.avgTicket.change },
  ];

  const cardWidth = 42;
  const gap = 4;
  kpis.forEach((kpi, i) => {
    const x = 14 + (cardWidth + gap) * i;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, cardWidth, 24, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.label, x + 4, y + 7);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_DARK);
    doc.text(kpi.value, x + 4, y + 16);
    doc.setFontSize(7);
    const changeColor = kpi.change >= 0 ? [0, 150, 50] : [200, 50, 50];
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.text(`${kpi.change >= 0 ? "+" : ""}${kpi.change}%`, x + 4, y + 22);
  });

  doc.setFont("helvetica", "normal");
  return y + 30;
}

function addTopDeals(doc: jsPDF, autoTable: (doc: jsPDF, options: Record<string, unknown>) => void, deals: ReportData["topDeals"], startY: number): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_DARK);
  doc.text("Top Oportunidades", 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [["#", "Cliente", "Produto", "Valor", "Status"]],
    body: deals.map((d, i) => [
      String(i + 1),
      d.client,
      d.product,
      `R$ ${d.amount.toLocaleString("pt-BR")}`,
      d.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: [BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]] as [number, number, number], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
    styles: { cellPadding: 2 },
  });

  return (doc as unknown as Record<string, unknown>).lastAutoTable
    ? ((doc as unknown as Record<string, { finalY: number }>).lastAutoTable.finalY + 8)
    : startY + 60;
}

function addTeamRanking(doc: jsPDF, autoTable: (doc: jsPDF, options: Record<string, unknown>) => void, team: ReportData["teamRanking"], startY: number): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_DARK);
  doc.text("Performance do Time", 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [["Pos.", "Vendedor", "Vendas", "Meta", "Progresso"]],
    body: team.map((t, i) => [
      `${i + 1}º`,
      t.name,
      `R$ ${t.sales.toLocaleString("pt-BR")}`,
      `R$ ${t.goal.toLocaleString("pt-BR")}`,
      `${t.progress.toFixed(0)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [BRAND_GREEN[0], BRAND_GREEN[1], BRAND_GREEN[2]] as [number, number, number], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
    styles: { cellPadding: 2 },
  });

  return (doc as unknown as Record<string, { finalY: number }>).lastAutoTable?.finalY + 8 || startY + 60;
}

export async function generateSalesReport(data: ReportData) {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Page 1
    addHeader(doc, "Relatório de Performance", data.period);
    let y = addKPISection(doc, data, 38);
    y = addTopDeals(doc, autoTable, data.topDeals, y + 4);

    // Check if team ranking fits, otherwise new page
    if (y > 220) {
      addFooter(doc, 1);
      doc.addPage();
      addHeader(doc, "Relatório de Performance", data.period);
      y = 38;
    }

    addTeamRanking(doc, autoTable, data.teamRanking, y);
    addFooter(doc, doc.getNumberOfPages());

    doc.save(`relatorio-vendas-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Relatório PDF gerado com sucesso!");
  } catch (error) {
    console.error("PDF generation error:", error);
    toast.error("Erro ao gerar relatório PDF");
  }
}