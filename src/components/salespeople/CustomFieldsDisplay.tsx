import { useSalespersonCustomFields, CustomFieldWithValue } from '@/hooks/sales/useSalespersonCustomFields';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hash, Type } from 'lucide-react';

interface CustomFieldsDisplayProps {
  salespersonId?: string;
  className?: string;
}

export function CustomFieldsDisplay({ salespersonId, className }: CustomFieldsDisplayProps) {
  const { data: fields = [], isLoading } = useSalespersonCustomFields(salespersonId);

  if (isLoading || fields.length === 0) return null;

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Campos Adicionais</h4>
      <div className="flex flex-wrap gap-2">
        {fields.map(field => (
          <FieldBadge key={field.fieldId} field={field} />
        ))}
      </div>
    </div>
  );
}

function FieldBadge({ field }: { field: CustomFieldWithValue }) {
  const displayValue = () => {
    if (field.fieldType === 'boolean') {
      return field.booleanValue ? (
        <CheckCircle2 className="h-3 w-3 text-success" />
      ) : (
        <XCircle className="h-3 w-3 text-muted-foreground" />
      );
    }
    if (field.fieldType === 'number') {
      return <span>{field.numericValue?.toLocaleString('pt-BR') ?? '—'}</span>;
    }
    return <span>{field.textValue ?? '—'}</span>;
  };

  const icon = field.fieldType === 'number' ? <Hash className="h-3 w-3" /> : <Type className="h-3 w-3" />;

  return (
    <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
      {field.fieldType !== 'boolean' && icon}
      <span className="text-muted-foreground">{field.fieldLabel}:</span>
      {displayValue()}
    </Badge>
  );
}
