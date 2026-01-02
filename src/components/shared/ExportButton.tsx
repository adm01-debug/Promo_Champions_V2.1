import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/lib/csvExporter';
import { exportToExcel } from '@/lib/excelExporter';
import { exportToPDF } from '@/lib/pdfExporter';

export function ExportButton({ data, filename }: { data: any[]; filename: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportToCSV(data, filename)}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel(data, filename)}>Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToPDF(data, filename, filename)}>PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
