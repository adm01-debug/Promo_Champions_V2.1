import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Send, 
  Save, 
  Copy, 
  RefreshCw, 
  Sparkles,
  User,
  Building,
  Calendar,
  DollarSign 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
}

interface ProposalData {
  clientName: string;
  companyName: string;
  value: number;
  validUntil: Date;
  products: { name: string; quantity: number; price: number }[];
  notes?: string;
}

interface ProposalGeneratorProps {
  templates: ProposalTemplate[];
  onGenerate?: (proposal: string) => void;
  onSave?: (proposal: ProposalData) => void;
  onSend?: (proposal: ProposalData) => void;
  className?: string;
}

export const ProposalGenerator: FC<ProposalGeneratorProps> = ({
  templates,
  onGenerate,
  onSave,
  onSend,
  className,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [proposalContent, setProposalContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setProposalContent(template.content);
        onGenerate?.(template.content);
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalContent);
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} className="text-primary" />
        <h3 className="font-semibold">Gerador de Propostas</h3>
        <Badge variant="outline" className="gap-1">
          <Sparkles size={12} />
          IA
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={!selectedTemplate || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Proposta'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Conteúdo da Proposta</label>
            {proposalContent && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy size={14} className="mr-1" />
                Copiar
              </Button>
            )}
          </div>
          <Textarea
            value={proposalContent}
            onChange={e => setProposalContent(e.target.value)}
            placeholder="O conteúdo da proposta aparecerá aqui..."
            className="min-h-[200px]"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onSave?.({} as ProposalData)}>
            <Save size={16} className="mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => onSend?.({} as ProposalData)}>
            <Send size={16} className="mr-2" />
            Enviar Proposta
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface QuickProposalFormProps {
  onSubmit?: (data: ProposalData) => void;
  className?: string;
}

export const QuickProposalForm: FC<QuickProposalFormProps> = ({
  onSubmit,
  className,
}) => {
  return (
    <Card className={cn('p-4', className)}>
      <h3 className="font-semibold mb-4">Proposta Rápida</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <User size={14} />
            Cliente
          </label>
          <Input placeholder="Nome do cliente" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Building size={14} />
            Empresa
          </label>
          <Input placeholder="Nome da empresa" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <DollarSign size={14} />
            Valor
          </label>
          <Input type="number" placeholder="0,00" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar size={14} />
            Validade
          </label>
          <Input type="date" />
        </div>
      </div>
      <Button className="w-full mt-4" onClick={() => onSubmit?.({} as ProposalData)}>
        <FileText size={16} className="mr-2" />
        Criar Proposta
      </Button>
    </Card>
  );
};
