import { FC, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tab {
  value: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsContainerProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const TabsContainer: FC<TabsContainerProps> = ({
  tabs,
  value,
  onValueChange,
  children,
  className,
  variant = 'default'
}) => {
  const listClasses = {
    default: '',
    pills: 'bg-transparent gap-2',
    underline: 'bg-transparent border-b rounded-none'
  };

  const triggerClasses = {
    default: '',
    pills: 'rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
    underline: 'rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
  };

  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className={cn(listClasses[variant])}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn("gap-2", triggerClasses[variant])}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabPanel: FC<TabPanelProps> = ({ value, children, className }) => (
  <TabsContent value={value} className={cn("mt-4", className)}>
    {children}
  </TabsContent>
);

interface IconTabsProps {
  tabs: Array<{ value: string; icon: ReactNode; label: string }>;
  value: string;
  onValueChange: (value: string) => void;
}

export const IconTabs: FC<IconTabsProps> = ({ tabs, value, onValueChange }) => (
  <div className="flex border rounded-lg p-1 bg-muted/50">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onValueChange(tab.value)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors",
          value === tab.value
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        title={tab.label}
      >
        {tab.icon}
        <span className="hidden sm:inline">{tab.label}</span>
      </button>
    ))}
  </div>
);
