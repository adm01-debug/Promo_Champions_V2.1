import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      common: {
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Deletar',
        edit: 'Editar',
        add: 'Adicionar',
        search: 'Buscar',
        loading: 'Carregando...',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Bem-vindo',
      },
      deals: {
        title: 'Negócios',
        create: 'Criar Negócio',
        edit: 'Editar Negócio',
      },
    },
  },
  'en': {
    translation: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
      },
      deals: {
        title: 'Deals',
        create: 'Create Deal',
        edit: 'Edit Deal',
      },
    },
  },
  'es': {
    translation: {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        add: 'Añadir',
        search: 'Buscar',
        loading: 'Cargando...',
      },
      dashboard: {
        title: 'Panel',
        welcome: 'Bienvenido',
      },
      deals: {
        title: 'Negocios',
        create: 'Crear Negocio',
        edit: 'Editar Negocio',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR',
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
