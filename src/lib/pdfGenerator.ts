// PDF Generator
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFConfig {
  title: string;
  subtitle?: string;
  footer?: string;
  orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
  private doc: jsPDF;
  
  constructor(config: PDFConfig) {
    this.doc = new jsPDF({
      orientation: config.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    this.addHeader(config.title, config.subtitle);
  }
  
  private addHeader(title: string, subtitle?: string) {
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 105, 20, { align: 'center' });
    
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, 105, 30, { align: 'center' });
    }
  }
  
  addSection(title: string, content: string, y: number = 50) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 20, y);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const lines = this.doc.splitTextToSize(content, 170);
    this.doc.text(lines, 20, y + 7);
    
    return y + 7 + (lines.length * 5);
  }
  
  addTable(headers: string[], data: any[][], y: number = 50) {
    autoTable(this.doc, {
      startY: y,
      head: [headers],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });
    
    return (this.doc as any).lastAutoTable.finalY;
  }
  
  addImage(imageData: string, x: number, y: number, width: number, height: number) {
    this.doc.addImage(imageData, 'PNG', x, y, width, height);
  }
  
  save(filename: string) {
    this.doc.save(filename);
  }
  
  getBlob(): Blob {
    return this.doc.output('blob');
  }
  
  getDataURL(): string {
    return this.doc.output('dataurlstring');
  }
}

// Pre-built templates
export const generateProposal = (data: {
  client: string;
  products: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  validUntil: string;
}) => {
  const pdf = new PDFGenerator({
    title: 'Proposta Comercial',
    subtitle: `Cliente: ${data.client}`,
  });
  
  let yPos = 50;
  
  yPos = pdf.addSection(
    'Produtos e Serviços',
    'Segue abaixo a relação de produtos e serviços propostos:',
    yPos
  );
  
  const tableData = data.products.map(p => [
    p.name,
    p.quantity.toString(),
    `R$ ${p.price.toFixed(2)}`,
    `R$ ${(p.quantity * p.price).toFixed(2)}`,
  ]);
  
  yPos = pdf.addTable(
    ['Produto', 'Qtd', 'Preço Unit.', 'Total'],
    tableData,
    yPos + 10
  );
  
  yPos = pdf.addSection(
    'Valor Total',
    `R$ ${data.total.toFixed(2)}`,
    yPos + 10
  );
  
  pdf.addSection(
    'Validade',
    `Esta proposta é válida até ${data.validUntil}`,
    yPos + 10
  );
  
  return pdf;
};

export const generateReport = (data: {
  title: string;
  period: string;
  metrics: Array<{ label: string; value: string }>;
  charts?: string[]; // Base64 images
}) => {
  const pdf = new PDFGenerator({
    title: data.title,
    subtitle: data.period,
  });
  
  let yPos = 50;
  
  const tableData = data.metrics.map(m => [m.label, m.value]);
  yPos = pdf.addTable(['Métrica', 'Valor'], tableData, yPos);
  
  if (data.charts) {
    data.charts.forEach((chart, index) => {
      if (yPos > 250) {
        pdf.doc.addPage();
        yPos = 20;
      }
      pdf.addImage(chart, 20, yPos, 170, 100);
      yPos += 110;
    });
  }
  
  return pdf;
};
