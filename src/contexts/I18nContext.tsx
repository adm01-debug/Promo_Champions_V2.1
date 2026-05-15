import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";

type Locale = "pt-BR" | "en" | "es";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "pt-BR" as Locale,
      setLocale: () => {},
      t: (_key: string, fallback?: string) => fallback || _key,
    };
  }
  return context;
}

const translations: Record<Locale, Record<string, string>> = {
  "pt-BR": {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.sales": "Vendas",
    "nav.clients": "Clientes",
    "nav.products": "Produtos",
    "nav.pipeline": "Pipeline",
    "nav.goals": "Metas",
    "nav.analytics": "Analytics",
    "nav.activities": "Atividades",
    "nav.notifications": "Notificações",
    "nav.settings": "Configurações",
    "nav.reports": "Relatórios",
    "nav.ranking": "Ranking",
    "nav.challenges": "Desafios",
    "nav.assistant": "Assistente IA",

    // Dashboard
    "dashboard.welcome": "Bem-vindo de volta",
    "dashboard.revenue": "Faturamento",
    "dashboard.sales": "Vendas",
    "dashboard.clients": "Clientes",
    "dashboard.conversion": "Conversão",
    "dashboard.goal_progress": "Progresso da Meta",
    "dashboard.recent_deals": "Negócios Recentes",
    "dashboard.top_products": "Top Produtos",

    // Actions
    "action.new_sale": "Nova Venda",
    "action.new_client": "Novo Cliente",
    "action.save": "Salvar",
    "action.cancel": "Cancelar",
    "action.delete": "Excluir",
    "action.edit": "Editar",
    "action.search": "Buscar",
    "action.filter": "Filtrar",
    "action.export": "Exportar",

    // Gamification
    "gamification.level_up": "Subiu de Nível!",
    "gamification.xp_earned": "XP Ganho",
    "gamification.streak": "Sequência",
    "gamification.challenge": "Desafio",
    "gamification.quiz": "Quiz Diário",
    "gamification.mood": "Como você está hoje?",

    // Common
    "common.loading": "Carregando...",
    "common.no_data": "Sem dados disponíveis",
    "common.error": "Ocorreu um erro",
    "common.success": "Sucesso!",
    "common.today": "Hoje",
    "common.yesterday": "Ontem",
    "common.this_week": "Esta Semana",
    "common.this_month": "Este Mês",
  },
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.sales": "Sales",
    "nav.clients": "Clients",
    "nav.products": "Products",
    "nav.pipeline": "Pipeline",
    "nav.goals": "Goals",
    "nav.analytics": "Analytics",
    "nav.activities": "Activities",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",
    "nav.reports": "Reports",
    "nav.ranking": "Ranking",
    "nav.challenges": "Challenges",
    "nav.assistant": "AI Assistant",

    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.revenue": "Revenue",
    "dashboard.sales": "Sales",
    "dashboard.clients": "Clients",
    "dashboard.conversion": "Conversion",
    "dashboard.goal_progress": "Goal Progress",
    "dashboard.recent_deals": "Recent Deals",
    "dashboard.top_products": "Top Products",

    // Actions
    "action.new_sale": "New Sale",
    "action.new_client": "New Client",
    "action.save": "Save",
    "action.cancel": "Cancel",
    "action.delete": "Delete",
    "action.edit": "Edit",
    "action.search": "Search",
    "action.filter": "Filter",
    "action.export": "Export",

    // Gamification
    "gamification.level_up": "Level Up!",
    "gamification.xp_earned": "XP Earned",
    "gamification.streak": "Streak",
    "gamification.challenge": "Challenge",
    "gamification.quiz": "Daily Quiz",
    "gamification.mood": "How are you feeling?",

    // Common
    "common.loading": "Loading...",
    "common.no_data": "No data available",
    "common.error": "An error occurred",
    "common.success": "Success!",
    "common.today": "Today",
    "common.yesterday": "Yesterday",
    "common.this_week": "This Week",
    "common.this_month": "This Month",
  },
  es: {
    // Navigation
    "nav.dashboard": "Panel de Control",
    "nav.sales": "Ventas",
    "nav.clients": "Clientes",
    "nav.products": "Productos",
    "nav.pipeline": "Pipeline",
    "nav.goals": "Objetivos",
    "nav.analytics": "Analítica",
    "nav.activities": "Actividades",
    "nav.notifications": "Notificaciones",
    "nav.settings": "Configuración",
    "nav.reports": "Informes",
    "nav.ranking": "Ranking",
    "nav.challenges": "Desafíos",
    "nav.assistant": "Asistente IA",

    // Dashboard
    "dashboard.welcome": "Bienvenido de nuevo",
    "dashboard.revenue": "Facturación",
    "dashboard.sales": "Ventas",
    "dashboard.clients": "Clientes",
    "dashboard.conversion": "Conversión",
    "dashboard.goal_progress": "Progreso del Objetivo",
    "dashboard.recent_deals": "Negocios Recientes",
    "dashboard.top_products": "Top Productos",

    // Actions
    "action.new_sale": "Nueva Venta",
    "action.new_client": "Nuevo Cliente",
    "action.save": "Guardar",
    "action.cancel": "Cancelar",
    "action.delete": "Eliminar",
    "action.edit": "Editar",
    "action.search": "Buscar",
    "action.filter": "Filtrar",
    "action.export": "Exportar",

    // Gamification
    "gamification.level_up": "¡Subiste de Nivel!",
    "gamification.xp_earned": "XP Ganado",
    "gamification.streak": "Racha",
    "gamification.challenge": "Desafío",
    "gamification.quiz": "Quiz Diario",
    "gamification.mood": "¿Cómo estás hoy?",

    // Common
    "common.loading": "Cargando...",
    "common.no_data": "Sin datos disponibles",
    "common.error": "Ocurrió un error",
    "common.success": "¡Éxito!",
    "common.today": "Hoy",
    "common.yesterday": "Ayer",
    "common.this_week": "Esta Semana",
    "common.this_month": "Este Mes",
  },
};

const LOCALE_KEY = "app-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return (localStorage.getItem(LOCALE_KEY) as Locale) || "pt-BR";
    } catch {
      return "pt-BR";
    }
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_KEY, newLocale);
    } catch { /* localStorage unavailable */ }
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[locale]?.[key] || fallback || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
