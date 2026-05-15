import React, { forwardRef, useCallback, useRef, memo } from "react";
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

// Route-to-lazy-import mapping for prefetch
const ROUTE_MODULES: Record<string, () => Promise<unknown>> = {
  '/vendas': () => import('@/pages/Vendas'),
  '/clientes': () => import('@/pages/Clientes'),
  '/produtos': () => import('@/pages/Produtos'),
  '/pipeline': () => import('@/pages/Pipeline'),
  '/analytics': () => import('@/pages/Analytics'),
  '/atividades': () => import('@/pages/Atividades'),
  '/ranking': () => import('@/pages/RankingCompetitivo'),
  '/arena': () => import('@/pages/ArenaCompetitiva'),
  '/assistente': () => import('@/pages/Assistente'),
  '/bi-vendedor': () => import('@/pages/BIVendedor'),
  '/bi-gestor': () => import('@/pages/BIGestor'),
  '/metas-atividades': () => import('@/pages/MetasAtividades'),
  '/configuracoes': () => import('@/pages/Configuracoes'),
  '/desafios': () => import('@/pages/DesafiosSemanais'),
  '/follow-up': () => import('@/pages/FollowUpInteligente'),
  '/lead-scoring': () => import('@/pages/LeadScoring'),
  '/multichannel': () => import('@/pages/Multichannel'),
  '/calendario': () => import('@/pages/Calendario'),
  '/nps': () => import('@/pages/NPSDashboard'),
  '/dashboard/visao-geral': () => import('@/pages/Index'),
  '/dashboard/performance': () => import('@/pages/Index'),
  '/dashboard/analises': () => import('@/pages/Index'),
  '/dashboard/competicao': () => import('@/pages/Index'),
  '/dashboard/inteligencia': () => import('@/pages/Index'),
  '/dashboard/engajamento': () => import('@/pages/Index'),
  '/sdr': () => import('@/pages/SDRDashboard'),
  '/closer': () => import('@/pages/CloserDashboard'),
  '/orcamentos': () => import('@/pages/Orcamentos'),
  '/assinatura-digital': () => import('@/pages/AssinaturaDigital'),
  '/fornecedores': () => import('@/pages/Fornecedores'),
  '/comissoes': () => import('@/pages/Comissoes'),
  '/tarefas': () => import('@/pages/Tarefas'),
  '/relatorios': () => import('@/pages/Relatorios'),
  '/estoque': () => import('@/pages/Estoque'),
  '/notificacoes': () => import('@/pages/Notificacoes'),
  '/admin': () => import('@/pages/AdminDashboard'),
};

const prefetched = new Set<string>();

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = memo(forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = useCallback(() => {
      const path = typeof to === 'string' ? to : to.pathname || '';
      if (prefetched.has(path)) return;
      timerRef.current = setTimeout(() => {
        const loader = ROUTE_MODULES[path];
        if (loader) {
          prefetched.add(path);
          loader();
        }
      }, 100);
    }, [to]);

    const handleMouseLeave = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
}));

NavLink.displayName = "NavLink";

export { NavLink };
