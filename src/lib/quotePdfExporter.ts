import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Quote, QuoteItem } from "@/hooks/useQuotes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function generateQuotePDF(quote: Quote, items: QuoteItem[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(quote.quote_number ? `Orçamento ${quote.quote_number}` : quote.title, 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Criado em ${format(new Date(quote.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, 29);
  doc.text(`Status: ${quote.status.toUpperCase()}`, 14, 35);

  if (quote.valid_until) {
    doc.text(`Válido até: ${format(new Date(quote.valid_until), "dd/MM/yyyy")}`, 14, 41);
  }

  // Client info
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cliente", 14, 52);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(quote.client_name, 14, 58);

  if (quote.external_reference) {
    doc.text(`Ref: ${quote.external_reference}`, 14, 64);
  }

  if (quote.salespeople?.name) {
    doc.setFont("helvetica", "bold");
    doc.text("Vendedor", pageWidth / 2, 52);
    doc.setFont("helvetica", "normal");
    doc.text(quote.salespeople.name, pageWidth / 2, 58);
  }

  let startY = quote.external_reference ? 72 : 66;

  // Items table
  if (items.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Itens do Orçamento", 14, startY);
    startY += 4;

    autoTable(doc, {
      startY,
      head: [["Produto", "Personalização", "Qtd", "Unitário", "Total"]],
      body: items.map((item) => {
        const persText = item.personalizations.length > 0
          ? item.personalizations.map(p => `${p.technique_name} (${p.colors_count} cor, ${p.positions_count} pos)`).join("\n")
          : "—";
        return [
          `${item.product_sku ? `[${item.product_sku}] ` : ""}${item.product_name}${item.color_name ? ` - ${item.color_name}` : ""}`,
          persText,
          item.quantity.toString(),
          fmt(item.unit_price),
          fmt(item.subtotal),
        ];
      }),
      headStyles: { fillColor: [234, 88, 12], fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 60 },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Summary
  const productSubtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const persTotal = items.reduce((s, i) => s + i.personalizations.reduce((ps, p) => ps + p.total_cost, 0), 0);
  const discount = quote.discount_amount || 0;

  const summaryData: [string, string][] = [];
  if (items.length > 0) {
    summaryData.push(["Subtotal produtos:", fmt(productSubtotal)]);
    if (persTotal > 0) summaryData.push(["Personalização:", fmt(persTotal)]);
    if (discount > 0) {
      const pct = ((discount / (productSubtotal + persTotal)) * 100).toFixed(0);
      summaryData.push([`Desconto (${pct}%):`, `-${fmt(discount)}`]);
    }
  }
  summaryData.push(["TOTAL:", fmt(Number(quote.total_value))]);

  autoTable(doc, {
    startY,
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { halign: "right", fontStyle: "normal", cellWidth: pageWidth - 80 },
      1: { halign: "right", fontStyle: "bold", cellWidth: 50 },
    },
    didParseCell: (data) => {
      if (data.row.index === summaryData.length - 1) {
        data.cell.styles.fontSize = 12;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Notes
  if (quote.notes) {
    const notesY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Observações", 14, notesY);
    doc.setFont("helvetica", "normal");
    doc.text(quote.notes, 14, notesY + 6, { maxWidth: pageWidth - 28 });
  }

  const filename = quote.quote_number
    ? `proposta-${quote.quote_number.replace("/", "-")}`
    : `proposta-${quote.id.slice(0, 8)}`;

  doc.save(`${filename}.pdf`);
}

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
