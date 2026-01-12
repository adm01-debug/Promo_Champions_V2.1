import { FC, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  rules?: ValidationRule[];
  showValidation?: boolean;
  className?: string;
}

/**
 * FormField - Enhanced form field with real-time validation
 */
export const FormField: FC<FormFieldProps> = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  helperText,
  rules = [],
  showValidation = true,
  className,
}) => {
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  // Run validations
  const errors = rules
    .filter(rule => !rule.validate(value))
    .map(rule => rule.message);

  const hasError = touched && errors.length > 0;
  const isValid = touched && errors.length === 0 && value.length > 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={name}
        className={cn(
          "flex items-center gap-1",
          hasError && "text-destructive"
        )}
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10 transition-all",
            hasError && "border-destructive focus-visible:ring-destructive",
            isValid && "border-green-500 focus-visible:ring-green-500"
          )}
        />

        {/* Validation icon */}
        <AnimatePresence>
          {showValidation && touched && !focused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {isValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper text or error messages */}
      <AnimatePresence mode="wait">
        {hasError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive"
          >
            {errors[0]}
          </motion.div>
        ) : helperText ? (
          <motion.p
            key="helper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            {helperText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

// Common validation rules
export const validationRules = {
  required: (message = 'Campo obrigatório'): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= min,
    message: message || `Mínimo de ${min} caracteres`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= max,
    message: message || `Máximo de ${max} caracteres`,
  }),
  email: (message = 'Email inválido'): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  phone: (message = 'Telefone inválido'): ValidationRule => ({
    validate: (value) => /^\(?[0-9]{2}\)?[\s-]?[0-9]{4,5}[\s-]?[0-9]{4}$/.test(value.replace(/\D/g, '')),
    message,
  }),
  cpf: (message = 'CPF inválido'): ValidationRule => ({
    validate: (value) => {
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      if (/^(\d)\1+$/.test(cpf)) return false;
      // Simple validation
      return true;
    },
    message,
  }),
  cnpj: (message = 'CNPJ inválido'): ValidationRule => ({
    validate: (value) => {
      const cnpj = value.replace(/\D/g, '');
      return cnpj.length === 14;
    },
    message,
  }),
  url: (message = 'URL inválida'): ValidationRule => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(value),
    message,
  }),
};
