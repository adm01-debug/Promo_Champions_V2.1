/**
 * RouteTracker — invisible component that tracks page navigation.
 * Placed once in the app layout. Listens to route changes and
 * delegates to the analytics lib.
 */
import React, { useEffect, useRef, memo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  setAnalyticsSalesperson,
  trackPageEnter,
  trackInteraction,
} from "@/lib/analytics";

// Map routes to human-readable titles
const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/pipeline": "Pipeline",
  "/tarefas": "Tarefas",
  "/vendedores": "Vendedores",
  "/clientes": "Clientes",
  "/produtos": "Produtos",
  "/metas": "Metas",
  "/relatorios": "Relatórios",
  "/gamificacao": "Gamificação",
  "/conquistas": "Conquistas",
  "/feed": "Feed de Vitórias",
  "/assistente": "Assistente IA",
  "/perfil": "Perfil",
  "/configuracoes": "Configurações",
  "/notificacoes": "Notificações",
  "/bi-gestor": "BI Gestor",
  "/admin": "Admin",
  "/cadencias": "Cadências",
  "/prospectos": "Prospectos",
  "/territorios": "Territórios",
  "/dashboard-custom": "Dashboard Personalizado",
  "/lead-scoring": "Lead Scoring",
  "/multichannel": "Multichannel",
  "/nps": "NPS & Satisfação",
};

function getPageTitle(pathname: string): string {
  // Try exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  // Try prefix match (e.g. /admin/seguranca → Admin)
  const prefix = Object.keys(ROUTE_TITLES)
    .filter((r) => r !== "/" && pathname.startsWith(r))
    .sort((a, b) => b.length - a.length)[0];

  if (prefix) return ROUTE_TITLES[prefix];

  // Fallback: capitalize the first segment
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Página";
}

export const RouteTracker = memo(function RouteTracker(): null {
  const location = useLocation();
  const { salesperson } = useAuth();
  const prevPathRef = useRef<string | null>(null);

  // Keep salesperson id in sync
  useEffect(() => {
    setAnalyticsSalesperson(salesperson?.id ?? null);
  }, [salesperson?.id]);

  // Track route changes
  useEffect(() => {
    const currentPath = location.pathname;
    const referrer = prevPathRef.current;

    trackPageEnter(currentPath, getPageTitle(currentPath), referrer);
    prevPathRef.current = currentPath;
  }, [location.pathname]);

  // Track clicks as interactions
  useEffect(() => {
    const handler = () => trackInteraction();
    document.addEventListener("click", handler, { passive: true });
    return () => document.removeEventListener("click", handler);
  }, []);

  return null; // Invisible component
});

RouteTracker.displayName = "RouteTracker";
