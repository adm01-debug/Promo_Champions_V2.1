import { FC } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DatePickerFieldProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  tooltip?: string;
  isRequired?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const DatePickerField: FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Selecione uma data',
  error,
  hint,
  tooltip,
  isRequired,
  disabled,
  minDate,
  maxDate,
  className
}) => {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium',
            error ? 'text-destructive' : 'text-foreground'
          )}
        >
          {label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            variant="outline"
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive focus:ring-destructive/30'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP", { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${fieldId}-error`}
            role="alert"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="text-sm text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hint text */}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
};
