import { FC, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export const Breadcrumb: FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 4,
  showHome = true,
  homeHref = '/',
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const allItems = showHome
    ? [{ label: 'Home', href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  const shouldCollapse = allItems.length > maxItems && !expanded;
  const visibleItems = shouldCollapse
    ? [allItems[0], null, ...allItems.slice(-2)]
    : allItems;

  return (
    <nav className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1">
        {visibleItems.map((item, index) => {
          if (item === null) {
            return (
              <li key="ellipsis" className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(true)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <span className="text-muted-foreground">{separator}</span>
              </li>
            );
          }

          const isLast = index === visibleItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
              {!isLast && (
                <span className="text-muted-foreground ml-1">{separator}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Auto Breadcrumb from Route
interface AutoBreadcrumbProps {
  routeLabels?: Record<string, string>;
  className?: string;
}

export const AutoBreadcrumb: FC<AutoBreadcrumbProps> = ({
  routeLabels = {},
  className,
}) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = pathnames.map((segment, index) => {
    const href = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  return <Breadcrumb items={items} className={className} />;
};
