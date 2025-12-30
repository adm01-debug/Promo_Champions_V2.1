import { FC } from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

const SkipLink: FC<SkipLinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
  >
    {children}
  </a>
);

export const SkipLinks: FC = () => {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">
        Pular para conteúdo principal
      </SkipLink>
      <SkipLink href="#main-navigation">
        Pular para navegação
      </SkipLink>
    </div>
  );
};

export const VisuallyHidden: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);
