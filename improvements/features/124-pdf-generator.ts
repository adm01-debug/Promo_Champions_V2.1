// Melhoria 124 - PDF Generator
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProposal = (deal: Deal) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Commercial Proposal', 105, 20, { align: 'center' });
  
  // Client info
  doc.setFontSize(12);
  doc.text(`Client: ${deal.client_name}`, 20, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
  
  // Table
  autoTable(doc, {
    startY: 60,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: deal.items.map(item => [
      item.name,
      item.quantity,
      `$${item.price}`,
      `$${item.quantity * item.price}`
    ]),
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.text(`Total: $${deal.value}`, 150, finalY + 10);
  
  // Save
  doc.save(`proposal-${deal.id}.pdf`);
};
