import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  addTitle(text: string) {
    this.doc.setFontSize(20);
    this.doc.text(text, 20, 20);
    return this;
  }

  addText(text: string, x: number, y: number) {
    this.doc.setFontSize(12);
    this.doc.text(text, x, y);
    return this;
  }

  addTable(headers: string[], data: any[][]) {
    (this.doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 30,
    });
    return this;
  }

  download(filename: string) {
    this.doc.save(filename);
  }

  getBlob() {
    return this.doc.output('blob');
  }
}
