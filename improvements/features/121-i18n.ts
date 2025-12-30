// Melhoria 121 - Internationalization
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "dashboard": "Dashboard",
      "clients": "Clients",
      "deals": "Deals",
      "pipeline": "Pipeline",
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido",
      "dashboard": "Tablero",
      "clients": "Clientes",
      "deals": "Ofertas",
      "pipeline": "Pipeline",
    }
  },
  pt: {
    translation: {
      "welcome": "Bem-vindo",
      "dashboard": "Dashboard",
      "clients": "Clientes",
      "deals": "Negócios",
      "pipeline": "Pipeline",
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
