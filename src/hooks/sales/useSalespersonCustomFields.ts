import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomFieldWithValue {
  fieldId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  numericValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
}

export function useSalespersonCustomFields(salespersonId?: string) {
  return useQuery({
    queryKey: ['salesperson-custom-fields', salespersonId],
    queryFn: async (): Promise<CustomFieldWithValue[]> => {
      if (!salespersonId) return [];

      // Get all active custom fields
      const { data: fields, error: fieldsError } = await supabase
        .from('team_custom_fields')
        .select('id, field_key, field_label, field_type')
        .eq('is_active', true);

      if (fieldsError) throw fieldsError;
      if (!fields || fields.length === 0) return [];

      // Get values for this salesperson
      const { data: values, error: valuesError } = await supabase
        .from('salesperson_custom_field_values')
        .select('field_id, numeric_value, text_value, boolean_value')
        .eq('salesperson_id', salespersonId);

      if (valuesError) throw valuesError;

      const valuesMap = new Map((values || []).map(v => [v.field_id, v]));

      return fields.map(field => {
        const val = valuesMap.get(field.id);
        return {
          fieldId: field.id,
          fieldKey: field.field_key,
          fieldLabel: field.field_label,
          fieldType: field.field_type,
          numericValue: val?.numeric_value ?? null,
          textValue: val?.text_value ?? null,
          booleanValue: val?.boolean_value ?? null,
        };
      });
    },
    enabled: !!salespersonId,
  });
}
