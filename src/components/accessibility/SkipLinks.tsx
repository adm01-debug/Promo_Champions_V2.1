import { FC } from 'react';
import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Pular para o conteúdo principal' },
  { href: '#main-navigation', label: 'Pular para a navegação' },
  { href: '#nav-item-dashboard', label: 'Pular para o Dashboard' },
  { href: '#nav-item-pipeline', label: 'Pular para o Pipeline' },
  { href: '#search', label: 'Pular para a busca' },
];

export const SkipLinks: FC<SkipLinksProps> = ({ 
  links = defaultLinks,
  className 
}) => {
  return (
    <nav 
      aria-label="Atalhos de navegação"
      className={cn("sr-only focus-within:not-sr-only", className)}
    >
      <ul className="fixed top-0 left-0 z-[100] flex flex-col gap-1 p-2 bg-background">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={cn(
                "block px-4 py-2 text-sm font-medium rounded-md",
                "bg-primary text-primary-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "sr-only focus:not-sr-only"
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
