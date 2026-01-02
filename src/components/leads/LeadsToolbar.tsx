import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, UserPlus, Target } from 'lucide-react';
import { SearchInput } from '@/components/SearchInput';
import { SavedFiltersDropdown } from '@/components/SavedFiltersDropdown';
import { AdvancedFilters, FilterValue, FilterConfig } from '@/components/AdvancedFilters';
import { DataImporter } from '@/components/DataImporter';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { leadSchema, salesproImportTemplates, salesproFilterConfigs } from '@/lib/salesproSchemas';
import { exportToExcel } from '@/lib/excelImporter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeadsToolbarProps {
  onSearch: (term: string) => void;
  onFiltersChange: (filters: FilterValue[]) => void;
  onRefresh: () => void;
  onNewClick: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkQualificar: () => void;
  onBulkConverter: () => void;
  currentFilters: Record<string, unknown>;
  data?: unknown[];
}

export const LeadsToolbar = memo(function LeadsToolbar({ onSearch, onFiltersChange, onRefresh, onNewClick, selectedCount, onClearSelection, onBulkQualificar, onBulkConverter, currentFilters, data = [] }: LeadsToolbarProps) {
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  const handleImport = async (leads: unknown[]) => {
    const { error } = await supabase.from('leads').insert(leads);
    if (error) throw error;
    toast.success(`${leads.length} leads importados!`);
    onRefresh();
  };

  const handleExport = () => {
    if (data.length === 0) { toast.warning('Nenhum dado'); return; }
    exportToExcel(data as Record<string, unknown>[], [
      { key: 'nome' as const, label: 'Nome' },
      { key: 'email' as const, label: 'E-mail' },
      { key: 'empresa' as const, label: 'Empresa' },
      { key: 'status' as const, label: 'Status' },
      { key: 'valor_estimado' as const, label: 'Valor Est.' },
    ], 'leads', 'Leads');
    toast.success('Exportado!');
  };

  const bulkActions = [
    { key: 'qualificar', label: 'Qualificar', icon: <Target className="h-4 w-4" />, onClick: onBulkQualificar },
    { key: 'converter', label: 'Converter', icon: <UserPlus className="h-4 w-4" />, onClick: onBulkConverter },
  ];

  return (
    <div className="space-y-3">
      {selectedCount > 0 && <BulkActionsBar selectedCount={selectedCount} onClearSelection={onClearSelection} actions={bulkActions} />}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <SearchInput onSearch={onSearch} placeholder="Buscar lead..." className="w-64" />
          <AdvancedFilters filters={salesproFilterConfigs.leads as FilterConfig[]} values={filterValues} onChange={(v) => { setFilterValues(v); onFiltersChange(v); }} />
          <SavedFiltersDropdown entityType="leads" currentFilters={currentFilters} onApplyFilter={(f) => { const values = Object.entries(f).map(([k,v]) => ({ key: k, operator: 'eq' as const, value: v })); setFilterValues(values); onFiltersChange(values); }} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>
          <DataImporter schema={leadSchema} columns={salesproImportTemplates.leads} onImport={handleImport} templateName="leads" title="Importar Leads" trigger={<Button variant="outline" size="sm"><Upload className="h-4 w-4" /></Button>} onSuccess={onRefresh} />
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" /></Button>
          <Button size="sm" onClick={onNewClick}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
});
export default LeadsToolbar;
