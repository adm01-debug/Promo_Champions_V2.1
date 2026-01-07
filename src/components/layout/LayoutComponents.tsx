import { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: ReactNode;
  className?: string;
  container?: boolean;
}

export const Section: FC<SectionProps> = ({ 
  children, 
  className,
  container = true 
}) => (
  <section className={cn("py-12 md:py-16", className)}>
    {container ? (
      <div className="container mx-auto px-4">{children}</div>
    ) : (
      children
    )}
  </section>
);

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  centered = true,
  className
}) => (
  <div className={cn(
    "mb-8 md:mb-12",
    centered && "text-center",
    className
  )}>
    <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
    {subtitle && (
      <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
    )}
  </div>
);

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
};

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8'
};

export const Grid: FC<GridProps> = ({
  children,
  cols = 3,
  gap = 'md',
  className
}) => (
  <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
    {children}
  </div>
);

interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
}

export const Flex: FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className
}) => (
  <div className={cn(
    "flex",
    direction === 'col' ? 'flex-col' : 'flex-row',
    `items-${align}`,
    `justify-${justify}`,
    gapClasses[gap],
    wrap && 'flex-wrap',
    className
  )}>
    {children}
  </div>
);

interface StackProps {
  children: ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Stack: FC<StackProps> = ({
  children,
  gap = 'md',
  className
}) => (
  <div className={cn("flex flex-col", gapClasses[gap], className)}>
    {children}
  </div>
);

interface CenterProps {
  children: ReactNode;
  className?: string;
}

export const Center: FC<CenterProps> = ({ children, className }) => (
  <div className={cn("flex items-center justify-center", className)}>
    {children}
  </div>
);

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({
  sidebar,
  header,
  children,
  className
}) => (
  <div className={cn("min-h-screen flex", className)}>
    <aside className="w-64 border-r bg-card hidden lg:block">
      {sidebar}
    </aside>
    <div className="flex-1 flex flex-col">
      {header && (
        <header className="border-b bg-card px-6 py-4">
          {header}
        </header>
      )}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

interface ContentCardProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const ContentCard: FC<ContentCardProps> = ({
  title,
  children,
  actions,
  className
}) => (
  <Card className={className}>
    {(title || actions) && (
      <CardHeader className="flex flex-row items-center justify-between">
        {title && <CardTitle>{title}</CardTitle>}
        {actions}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
  </Card>
);
