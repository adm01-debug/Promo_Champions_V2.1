import { FC, useState, useCallback, forwardRef, InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  locale?: string;
  error?: string;
  hint?: string;
  tooltip?: string;
  isRequired?: boolean;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(({
  label,
  value,
  onChange,
  currency = 'BRL',
  locale = 'pt-BR',
  error,
  hint,
  tooltip,
  isRequired,
  className,
  ...props
}, ref) => {
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  const formatCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }, [locale, currency]);

  const parseCurrency = useCallback((val: string): number => {
    // Remove currency symbol and formatting
    const cleanValue = val
      .replace(/[^\d,.-]/g, '')
      .replace('.', '')
      .replace(',', '.');
    
    return parseFloat(cleanValue) || 0;
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value > 0 ? value.toString().replace('.', ',') : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numericValue = parseCurrency(displayValue);
    onChange(numericValue);
    setDisplayValue('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Only allow numbers and comma
    const cleanValue = rawValue.replace(/[^\d,]/g, '');
    setDisplayValue(cleanValue);
  };

  const currencySymbol = currency === 'BRL' ? 'R$' : '$';

  return (
    <div className="space-y-2">
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

      <div className="relative">
        <span className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium transition-colors',
          isFocused ? 'text-primary' : 'text-muted-foreground'
        )}>
          {currencySymbol}
        </span>
        
        <Input
          ref={ref}
          id={fieldId}
          type="text"
          inputMode="decimal"
          value={isFocused ? displayValue : (value > 0 ? formatCurrency(value).replace(currencySymbol, '').trim() : '')}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="0,00"
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            'pl-10 text-right transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
          {...props}
        />
      </div>

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
});

MoneyInput.displayName = 'MoneyInput';
