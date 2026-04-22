import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type jsPDF from "jspdf";
import type { SalesReportData } from "@/hooks/reports/salesReportHelpers";
import { formatBRL } from "@/hooks/reports/salesReportHelpers";

const BRAND_GREEN: [number, number, number] = [0, 128, 64];
const BRAND_DARK: [number, number, number] = [30, 30, 30];

function header(doc: jsPDF, periodLabel: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, w, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PROMO CHAMPIONS", 14, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Relatório de Vendas", 14, 20);
  doc.setFontSize(9);
  doc.text(periodLabel, w - 14, 18, { align: "right" });
  doc.setTextColor(...BRAND_DARK);
}

function footer(doc: jsPDF, page: number, total: number) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · Página ${page} de ${total}`,
    w / 2,
    h - 8,
    { align: "center" }
  );
  doc.setTextColor(...BRAND_DARK);
}

function kpis(doc: jsPDF, data: SalesReportData, startY: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Indicadores principais", 14, startY);
  let y = startY + 6;
  const items = [
    { label: "Receita total", value: formatBRL(data.current.revenue), delta: data.current.revenueDelta },
    { label: "Nº de vendas", value: String(data.current.salesCount), delta: data.current.salesCountDelta },
    { label: "Ticket médio", value: formatBRL(data.current.avgTicket), delta: data.current.avgTicketDelta },
    { label: "Conversão", value: `${data.current.conversionRate.toFixed(1)}%`, delta: data.current.conversionRateDelta },
  ];
  const cardW = 42;
  items.forEach((it, i) => {
    const x = 14 + i * (cardW + 4);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, cardW, 26, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(it.label, x + 4, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BRAND_DARK);
    doc.text(it.value, x + 4, y + 16);
    doc.setFontSize(8);
    const c: [number, number, number] = it.delta >= 0 ? [0, 150, 50] : [200, 50, 50];
    doc.setTextColor(...c);
    doc.text(`${it.delta >= 0 ? "+" : ""}${it.delta}%`, x + 4, y + 23);
  });
  doc.setTextColor(...BRAND_DARK);
  return y + 32;
}

async function captureChart(selector: string): Promise<string | null> {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  } catch (e) {
    if (import.meta.env.DEV) console.error("chart capture failed", selector, e);
    return null;
  }
}

function addImage(doc: jsPDF, png: string | null, x: number, y: number, w: number, h: number, fallback: string) {
  if (png) {
    try {
      doc.addImage(png, "PNG", x, y, w, h);
      return;
    } catch {/* fallthrough */}
  }
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(fallback, x + w / 2, y + h / 2, { align: "center" });
  doc.setTextColor(...BRAND_DARK);
}

export async function generateSalesReportPdf(data: SalesReportData, periodLabel: string) {
  try {
    const { default: JsPDFCtor } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new JsPDFCtor();
    const pageW = doc.internal.pageSize.getWidth();

    // Capture all charts in parallel
    const [revenuePng, productsPng, statusPng, teamPng] = await Promise.all([
      captureChart('[data-report-chart="revenue"]'),
      captureChart('[data-report-chart="top-products"]'),
      captureChart('[data-report-chart="status"]'),
      captureChart('[data-report-chart="team"]'),
    ]);

    // ===== Page 1 — Cover =====
    header(doc, periodLabel);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("Relatório de Vendas", pageW / 2, 100, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(120, 120, 120);
    doc.text(periodLabel, pageW / 2, 114, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, pageW / 2, 124, {
      align: "center",
    });
    doc.setTextColor(...BRAND_DARK);

    // ===== Page 2 — KPIs + revenue chart =====
    doc.addPage();
    header(doc, periodLabel);
    let y = kpis(doc, data, 36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Receita ao longo do período", 14, y);
    addImage(doc, revenuePng, 14, y + 4, pageW - 28, 80, "Gráfico de receita indisponível");

    // ===== Page 3 — Top products + status =====
    doc.addPage();
    header(doc, periodLabel);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Top produtos", 14, 36);
    addImage(doc, productsPng, 14, 40, pageW - 28, 80, "Sem dados de produtos");
    doc.text("Distribuição por status", 14, 130);
    addImage(doc, statusPng, 14, 134, pageW - 28, 80, "Sem dados de status");

    // ===== Page 4 — Team ranking + top deals =====
    doc.addPage();
    header(doc, periodLabel);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Ranking de vendedores", 14, 36);
    addImage(doc, teamPng, 14, 40, pageW - 28, 80, "Sem ranking disponível");

    autoTable(doc, {
      startY: 130,
      head: [["#", "Cliente", "Produto", "Vendedor", "Valor", "Status"]],
      body: data.topDeals.map((d, i) => [
        String(i + 1),
        d.client,
        d.product,
        d.salesperson,
        formatBRL(d.amount),
        d.status,
      ]),
      theme: "grid",
      headStyles: { fillColor: BRAND_GREEN, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
      styles: { cellPadding: 2 },
    });

    // Footers
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      footer(doc, i, total);
    }

    doc.save(`relatorio-vendas-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Relatório PDF gerado com sucesso!");
  } catch (error) {
    if (import.meta.env.DEV) console.error("PDF generation error:", error);
    toast.error("Erro ao gerar relatório PDF");
  }
}
