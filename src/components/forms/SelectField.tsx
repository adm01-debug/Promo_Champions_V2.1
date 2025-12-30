import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, ChevronDown, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  tooltip?: string;
  isRequired?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SelectField: FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  error,
  success,
  hint,
  tooltip,
  isRequired,
  disabled,
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

      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            'transition-all duration-200',
            error && 'border-destructive focus:ring-destructive/30',
            success && 'border-success focus:ring-success/30'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
