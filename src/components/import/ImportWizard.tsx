import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, Check, AlertTriangle, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface ImportStep {
  id: number;
  title: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface ImportWizardProps {
  type: 'clients' | 'products' | 'sales';
  onComplete?: (data: unknown[]) => void;
  onCancel?: () => void;
}

export const ImportWizard: FC<ImportWizardProps> = ({ type, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const steps: ImportStep[] = [
    { id: 1, title: 'Upload', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, title: 'Mapeamento', status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, title: 'Validação', status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, title: 'Importação', status: currentStep === 4 ? 'current' : 'pending' }
  ];

  const typeLabels = {
    clients: 'Clientes',
    products: 'Produtos',
    sales: 'Vendas'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Importar {typeLabels[type]}</h3>
          <p className="text-sm text-muted-foreground">Siga os passos para importar seus dados</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${step.status === 'completed' ? 'bg-green-500 text-white' : ''}
              ${step.status === 'current' ? 'bg-primary text-primary-foreground' : ''}
              ${step.status === 'pending' ? 'bg-muted text-muted-foreground' : ''}
              ${step.status === 'error' ? 'bg-destructive text-destructive-foreground' : ''}
            `}>
              {step.status === 'completed' ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span className="ml-2 text-sm hidden sm:block">{step.title}</span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${step.status === 'completed' ? 'bg-green-500' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[200px]">
        {currentStep === 1 && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium mb-2">Arraste seu arquivo aqui</p>
            <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
            <Button variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos aceitos: CSV, XLSX, XLS
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mapeie as colunas do seu arquivo para os campos do sistema
            </p>
            <div className="space-y-2">
              {['Nome', 'Email', 'Telefone', 'Empresa'].map((field) => (
                <div key={field} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{field}</span>
                  <span className="text-sm text-muted-foreground">Coluna A</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
              <Check className="h-5 w-5" />
              <span>150 registros válidos</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>3 registros com avisos</span>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Importando... {progress}%
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}>
          {currentStep === 4 ? 'Concluir' : 'Próximo'}
          {currentStep < 4 && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </Card>
  );
};

interface FieldMappingProps {
  sourceFields: string[];
  targetFields: { key: string; label: string; required: boolean }[];
  mapping: Record<string, string>;
  onMappingChange?: (mapping: Record<string, string>) => void;
}

export const FieldMapping: FC<FieldMappingProps> = ({ 
  sourceFields, 
  targetFields, 
  mapping, 
  onMappingChange 
}) => {
  return (
    <div className="space-y-3">
      {targetFields.map((field) => (
        <div key={field.key} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <span className="font-medium">{field.label}</span>
            {field.required && <span className="text-destructive ml-1">*</span>}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <select 
            className="flex-1 p-2 rounded border bg-background"
            value={mapping[field.key] || ''}
            onChange={(e) => onMappingChange?.({ ...mapping, [field.key]: e.target.value })}
          >
            <option value="">Selecione...</option>
            {sourceFields.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};
