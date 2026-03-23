# ADR-002: React Query como Gerenciador de Estado do Servidor

## Status
Aceito — Janeiro 2025

## Contexto
O SalesPro é uma aplicação data-intensive com 55+ páginas que consomem dados do backend. Precisávamos de uma solução para gerenciar cache, refetch, deduplicação de queries e estados de loading/error.

## Decisão
Adotamos `@tanstack/react-query` como gerenciador de estado do servidor, sem Redux ou Zustand para estado global.

### Configuração padrão:
- `staleTime: 3 minutos` — reduz requests redundantes.
- `gcTime: 15 minutos` — mantém cache para navegação rápida.
- `refetchOnWindowFocus: false` — evita requests desnecessários.
- `networkMode: offlineFirst` — suporte PWA offline.

## Consequências

### Positivas
- Eliminação de boilerplate de Redux (reducers, actions, selectors).
- Deduplicação automática de queries idênticas.
- Suporte nativo a mutations com invalidação de cache.
- DevTools integrado para debugging.

### Negativas
- Estado client-only (tema, sidebar) gerenciado com hooks locais (`useState`/`useContext`).
- Curva de aprendizado para patterns como `queryKey` hierárquico.

## Alternativas Consideradas
1. **Redux Toolkit + RTK Query**: Rejeitado por boilerplate excessivo para o caso de uso.
2. **SWR**: Rejeitado por features inferiores (sem mutations nativas, DevTools limitado).
