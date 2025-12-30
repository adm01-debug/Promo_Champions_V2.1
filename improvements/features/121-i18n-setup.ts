// Melhoria 121 - Internationalization
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      dashboard: 'Dashboard',
      pipeline: 'Pipeline',
      clients: 'Clientes',
      deals: 'Negócios',
      revenue: 'Receita',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
    },
  },
  'en': {
    translation: {
      dashboard: 'Dashboard',
      pipeline: 'Pipeline',
      clients: 'Clients',
      deals: 'Deals',
      revenue: 'Revenue',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
    },
  },
  'es': {
    translation: {
      dashboard: 'Panel',
      pipeline: 'Pipeline',
      clients: 'Clientes',
      deals: 'Negocios',
      revenue: 'Ingresos',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

// Usage:
// import { useTranslation } from 'react-i18next';
// const { t } = useTranslation();
// <h1>{t('dashboard')}</h1>
