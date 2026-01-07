import { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const FormSection: FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => (
  <div className={cn("space-y-4", className)}>
    {(title || description) && (
      <div>
        {title && <h3 className="text-lg font-medium">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    )}
    <div className="space-y-4">{children}</div>
  </div>
);

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const FormCard: FC<FormCardProps> = ({
  title,
  description,
  children,
  footer,
  className
}) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
    {footer && (
      <div className="px-6 py-4 border-t bg-muted/50 flex justify-end gap-2">
        {footer}
      </div>
    )}
  </Card>
);

interface FormRowProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const FormRow: FC<FormRowProps> = ({
  label,
  required,
  hint,
  error,
  children,
  className
}) => (
  <div className={cn("space-y-2", className)}>
    <label className="text-sm font-medium">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

interface FormGridProps {
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export const FormGrid: FC<FormGridProps> = ({ cols = 2, children, className }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn("grid gap-4", colClasses[cols], className)}>
      {children}
    </div>
  );
};

interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const FormActions: FC<FormActionsProps> = ({ children, align = 'right' }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn("flex items-center gap-2 pt-4", alignClasses[align])}>
      {children}
    </div>
  );
};

interface FormDividerProps {
  label?: string;
}

export const FormDivider: FC<FormDividerProps> = ({ label }) => (
  <div className="relative py-4">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    {label && (
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">{label}</span>
      </div>
    )}
  </div>
);
