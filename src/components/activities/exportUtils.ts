import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityRecord } from '@/hooks/useActivities';
import { activityLabels, outcomeLabels } from './activityConstants';

export const exportActivitiesToCSV = (activities: ActivityRecord[]) => {
  const headers = ['Data', 'Tipo', 'Contato', 'Resultado', 'Duração (min)', 'Notas'];
  const rows = activities.map(a => [
    format(new Date(a.created_at), 'dd/MM/yyyy HH:mm'),
    activityLabels[a.activity_type] || a.activity_type,
    a.contact_name || '',
    outcomeLabels[a.outcome]?.label || a.outcome,
    a.duration_minutes || 0,
    a.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `atividades_sdr_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportActivitiesToPDF = (activities: ActivityRecord[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Relatório de Atividades SDR', 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}`, 14, 28);

  const tableColumn = ['Data', 'Tipo', 'Contato', 'Resultado', 'Duração', 'Notas'];
  const tableRows = activities.map(a => [
    format(new Date(a.created_at), 'dd/MM/yyyy'),
    activityLabels[a.activity_type] || a.activity_type,
    a.contact_name || '',
    outcomeLabels[a.outcome]?.label || a.outcome,
    `${a.duration_minutes || 0}m`,
    (a.notes || '').substring(0, 30) + ((a.notes?.length || 0) > 30 ? '...' : '')
  ]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 133, 244] }
  });

  doc.save(`relatorio_sdr_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
