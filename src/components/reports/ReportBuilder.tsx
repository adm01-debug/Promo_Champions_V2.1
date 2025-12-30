import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface ReportConfig {
  name: string;
  type: 'sales' | 'performance' | 'pipeline' | 'activities';
  dateRange: string;
  format: 'pdf' | 'excel' | 'csv';
}

interface ReportBuilderProps {
  onGenerate?: (config: ReportConfig) => void;
  isLoading?: boolean;
}

export const ReportBuilder: FC<ReportBuilderProps> = ({ onGenerate, isLoading }) => {
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: 'sales',
    dateRange: 'month',
    format: 'pdf'
  });

  const reportTypes = [
    { value: 'sales', label: 'Relatório de Vendas', icon: TrendingUp },
    { value: 'performance', label: 'Performance da Equipe', icon: BarChart3 },
    { value: 'pipeline', label: 'Análise de Pipeline', icon: PieChart },
    { value: 'activities', label: 'Atividades', icon: FileText }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Gerador de Relatórios</h3>
          <p className="text-sm text-muted-foreground">Configure e exporte relatórios personalizados</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Nome do Relatório</label>
          <Input
            placeholder="Ex: Vendas Janeiro 2024"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select value={config.type} onValueChange={(v) => setConfig({ ...config, type: v as ReportConfig['type'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={config.dateRange} onValueChange={(v) => setConfig({ ...config, dateRange: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Formato de Exportação</label>
          <div className="flex gap-2">
            {['pdf', 'excel', 'csv'].map((format) => (
              <Button
                key={format}
                variant={config.format === format ? 'default' : 'outline'}
                size="sm"
                onClick={() => setConfig({ ...config, format: format as ReportConfig['format'] })}
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={() => onGenerate?.(config)}
          disabled={isLoading || !config.name}
        >
          <Download className="h-4 w-4 mr-2" />
          {isLoading ? 'Gerando...' : 'Gerar Relatório'}
        </Button>
      </div>
    </Card>
  );
};

interface ReportTemplateProps {
  id: string;
  name: string;
  description: string;
  icon: 'sales' | 'performance' | 'pipeline';
  onSelect?: () => void;
}

export const ReportTemplate: FC<ReportTemplateProps> = ({ name, description, icon, onSelect }) => {
  const icons = {
    sales: TrendingUp,
    performance: BarChart3,
    pipeline: PieChart
  };
  const Icon = icons[icon];

  return (
    <Card 
      className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

interface ScheduledReportProps {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  recipients: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ScheduledReport: FC<ScheduledReportProps> = ({ 
  name, 
  frequency, 
  nextRun, 
  recipients,
  onEdit,
  onDelete 
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium">{name}</h4>
            <p className="text-sm text-muted-foreground">
              {frequency} • Próximo: {nextRun}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {recipients.length} destinatário(s)
          </span>
          <Button variant="ghost" size="sm" onClick={onEdit}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>Excluir</Button>
        </div>
      </div>
    </Card>
  );
};
