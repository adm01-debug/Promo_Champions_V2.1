import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  content: React.ReactNode;
  disabled?: boolean;
}

interface EnhancedAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'card' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EnhancedAccordion: FC<EnhancedAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default',
  size = 'md',
  className
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(id);
    }
    
    setOpenItems(newOpenItems);
  };

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4',
    lg: 'py-4 px-5 text-lg'
  };

  const variantClasses = {
    default: 'border-b border-border',
    card: 'mb-2 rounded-lg border border-border bg-card',
    ghost: 'mb-1'
  };

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className={cn(variantClasses[variant])}
          >
            {/* Header */}
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center justify-between text-left transition-colors',
                sizeClasses[size],
                'hover:bg-muted/50',
                item.disabled && 'opacity-50 cursor-not-allowed',
                variant === 'card' && isOpen && 'border-b border-border'
              )}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <Icon className={cn(
                    'text-muted-foreground',
                    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
                  )} />
                )}
                <div>
                  <span className="font-medium">{item.title}</span>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.badge !== undefined && (
                  <Badge variant={item.badgeVariant || 'secondary'}>
                    {item.badge}
                  </Badge>
                )}
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.span>
              </div>
            </button>

            {/* Content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={`accordion-content-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={cn(sizeClasses[size], 'pt-2')}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// Simple Tree View component
interface TreeNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: TreeNode[];
  onClick?: () => void;
}

interface TreeViewProps {
  nodes: TreeNode[];
  defaultExpanded?: string[];
  className?: string;
}

export const TreeView: FC<TreeViewProps> = ({
  nodes,
  defaultExpanded = [],
  className
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const Icon = node.icon;

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            node.onClick?.();
          }}
          className={cn(
            'w-full flex items-center gap-2 py-1.5 px-2 text-sm text-left rounded-md hover:bg-muted transition-colors',
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.span>
          ) : (
            <span className="w-4" />
          )}
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span>{node.label}</span>
        </button>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {node.children!.map(child => renderNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={cn('space-y-0.5', className)}>
      {nodes.map(node => renderNode(node))}
    </div>
  );
};
