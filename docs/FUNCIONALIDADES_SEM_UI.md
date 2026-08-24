# 🧩 Funcionalidades com Backend/Hook prontos mas SEM UI Completa

> Análise gerada em 2026-04-16 cruzando `src/hooks/` (182 hooks) com importações reais em `src/pages/` e `src/components/`.
> Critério: hooks importados em **0 ou 1** componente isolado, ou cuja UI atual é apenas parcial/embrionária.

---

## 🔴 Tier 1 — ZERO interface visual (0 imports)

Hooks completamente implementados mas **nunca consumidos** pelo frontend.

| Hook | Propósito | O que falta |
|------|-----------|-------------|
| `useCompetencyData` | Mapa de competências por vendedor (skills, gaps, evolução) | Página `/competencias` com radar chart, matriz de skills e plano de desenvolvimento |
| `useFeatureFlags` | Sistema de feature flags com rollouts graduais e A/B testing | A página `/feature-flags` existe mas **não consome o hook** — está usando query direta. Falta integrar toggles por usuário/rollout % |

---

## 🟠 Tier 2 — UI parcial / hook usado em apenas 1 componente

Funcionalidades implementadas no backend mas com interface mínima ou sem página dedicada.

### 9.1 Inteligência Comercial / Analytics

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `useABCAnalysis` | Pareto 80/20 sobre clientes | Aba dentro de Analytics | Página dedicada com curvas A/B/C, exportação e ações em massa |
| `useClosingTime` | Tempo médio de fechamento por estágio | Componente isolado | Dashboard com benchmarks e alertas |
| `useDealVelocity` | Velocidade de deals | Widget único | Visão histórica + comparativo entre vendedores |
| `useEvolutionCurves` | Curvas de evolução de KPIs | Componente solto | Página comparativa com seleção de métricas |
| `useObjectionsLibrary` | Biblioteca de objeções com efetividade | Card único | CRUD completo com tags, busca e ranking de efetividade |
| `useWinLossAnalysis` | Análise de ganhos/perdas | 2 imports | Página dedicada com motivos categorizados, drill-down por vendedor/produto |
| `useEmailMetrics` | Métricas de e-mail (open/click rate) | Card simples | Dashboard com funil de e-mail, A/B subject lines |

### 9.2 Gamificação

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `useCollectibleBadges` | Badges colecionáveis com raridade | Lista simples | Galeria visual com unlock animations e showcase no perfil |
| `useDailyMissions` | Missões diárias separadas dos desafios | Componente isolado | Painel "Missões do Dia" no dashboard com progress bars |
| `useGamifiedProfile` | Perfil gamificado completo | Sub-componente | Página `/perfil-gamer` com stats, badges, histórico XP |
| `useKudos` | Sistema de elogios entre colegas | 1 import | Feed social com botões de kudos, leaderboard de mais elogiados |
| `usePrizeWheel` | Roleta de prêmios | Modal único | Histórico de spins, configuração de prêmios pelo admin |
| `useProgressiveGoals` | Metas progressivas (escalonadas) | Card único | Visualização de jornada com milestones desbloqueáveis |
| `useSalesBattles` | Batalhas 1v1/equipes | Lista | Tela de batalha em tempo real com placar dramático |
| `useSalesStreaks` | Streaks de vendas consecutivas | Badge | Página dedicada com calendário de streaks e recordes |
| `useWeeklyMatchups` | Matchups semanais | 2 imports | Bracket visual estilo torneio |
| `useWeeklyRanking` | Ranking semanal | 1 import | Painel separado do ranking geral, com prêmios da semana |
| `useCompetitiveChat` | Chat competitivo entre players | 1 import | Interface de chat dedicada com reações |

### 9.3 IA & Automação

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `useAICopilot` | Copilot anônimo (edge function) | Botão flutuante | Painel lateral persistente com sugestões inline |
| `useDealChatHistory` | Histórico de Q&A IA por deal | 4 imports | Timeline de coaching no detalhe do deal |
| `useElevenLabsVoice` | Síntese de voz | 3 imports | Configuração de voz/idioma na settings, leitura de relatórios |
| `useNextBestAction` | Próxima melhor ação IA | 2 imports | Card persistente em todas as telas operacionais |

### 9.4 Operação & CRM

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `useLeadAssignment` | Atribuição manual de leads | 2 imports | Modal de transferência em massa com preview de carga |
| `useStagnantTasks` | Tarefas geradas por deals parados | 1 import | Inbox dedicada "Deals Esquecidos" com bulk actions |
| `useTerritories` | Gestão de territórios | 1 import | Mapa interativo com edição de polígonos |
| `useSavedFilters` | Filtros salvos por usuário | 1 import | UI de gerenciamento (renomear/excluir/compartilhar filtros) |
| `useSalespersonCustomFields` | Campos customizados por vendedor | 1 import | Editor visual de campos no painel admin |
| `useOnboardingChecklist` | Onboarding gamificado | 1 import | Tour interativo passo-a-passo, não só checklist estática |

### 9.5 Notificações & Engajamento

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `useRankNotifications` | Notificações de mudança de rank | 2 imports | Toast animado com confetti ao subir de posição |
| `useGoals` | Goals genéricos | 5 imports (parcial) | Página unificada de metas (hoje espalhada) |

### 9.6 Segurança

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `useWebAuthn` | Passkeys/biometria | 1 import (Settings) | Onboarding de passkey no login + lista de credenciais com nicknames |

### 9.7 Telemetria

| Hook | Backend pronto | UI atual | Falta |
|------|---------------|----------|-------|
| `usePageAnalytics` | Tracking de páginas visitadas | 2 imports | Dashboard de heatmap de navegação para admin |

---

## 🟡 Tier 3 — Edge Functions sem UI dedicada

Backend serverless implementado mas **sem tela de configuração/visualização**.

| Edge Function | Status | UI faltante |
|---------------|--------|-------------|
| `salesperson-coaching` | Ativa | Painel "Meu Coach" com sugestões personalizadas |
| `sdr-consecutive-alerts` | Ativa (CRON) | Configuração de thresholds pelo gestor |
| `activity-goal-alerts` | Ativa (CRON) | Configuração de horário/canal de envio |
| `challenge-expiration-alerts` | Ativa (CRON) | Lista de alertas enviados |
| `auto-reassign-inactive` | Ativa | Página de regras de inatividade (existe `/inactivity-triggers` mas é básica) |
| `visual-search` | Ativa | Botão de upload de imagem na busca (hoje só semantic search aparece) |
| `push-subscribe` / `send-push-notification` | Ativa | Centro de preferências de push (categorias, horários) |
| `external-db-bridge` | Ativa | Painel de monitoramento detalhado (existe parcialmente em `/admin-telemetria`) |
| `ranking-api` | Ativa | API documentada mas sem UI de teste/playground |

---

## 🟢 Helpers/Utils sem consumidor

Arquivos de lógica pura nunca importados:

- `biGestorHelpers` — funções para BI Gestor não utilizadas
- `biVendedorHelpers` — funções para BI Vendedor não utilizadas
- `circuitBreakerUtils` — utilitários de circuit breaker
- `playbooks` — helper de playbooks duplicado
- `salesRealtimeUtils` — utilities de realtime de vendas
- `sessionHelpers` — helpers de sessão
- `suppliers` — helper de fornecedores
- `tasks` — helper de tarefas
- `useCursorPagination` — paginação cursor-based (não adotada nas listas grandes)
- `useOptimisticMutation` — wrapper de mutations otimistas (poderia ser aplicado em CRUDs)
- `useRetryMutation` — usado em 1 lugar (`useSalesData`), poderia ser pattern padrão
- `useSalesAssistantHelpers` — helpers do assistant
- `useUnsavedChanges` — guard de mudanças não salvas (não plugado em forms)
- `useAnnounce` — A11y announcer (não plugado em rotas)
- `usePrefetchRoute` — prefetch de rotas (não usado para otimização)
- `usePWA` — controles PWA (não exposto em UI)
- `useROIDashboard` — hook do ROI (página `/roi` parcial)
- `useSalespersonPreferences` — preferências de vendedor (sem tela de edição)
- `useCompetitiveSeasons` — gestão de temporadas (página admin existe mas básica)
- `useCircuitBreaker` — proteção de cascata (não exposto)
- `webAuthnUtils` — utilitários WebAuthn

---

## 📊 Resumo Quantitativo

| Categoria | Quantidade |
|-----------|------------|
| Hooks com **0 imports** | 2 |
| Hooks com **1 import** (UI mínima) | 24 |
| Hooks com **2-3 imports** (parcial) | 9 |
| Helpers/utils órfãos | 21 |
| **Total de funcionalidades com UI incompleta** | **~56** |
| Edge Functions sem painel admin | 9 |

---

## 🎯 Top 10 Prioridades de UI a Construir

Ordem sugerida por impacto x esforço:

1. **Galeria de Badges Colecionáveis** (`useCollectibleBadges`) — alto engajamento gamificação
2. **Página Win/Loss Analysis dedicada** (`useWinLossAnalysis`) — insight comercial crítico
3. **Painel "Meu Coach IA"** (`salesperson-coaching` + `useAICopilot`) — diferencial de produto
4. **Inbox de Deals Esquecidos** (`useStagnantTasks`) — recupera receita
5. **Mapa interativo de Territórios** (`useTerritories`) — gestão visual
6. **Bracket de Matchups Semanais** (`useWeeklyMatchups`) — torneios visuais
7. **Editor de Campos Customizados** (`useSalespersonCustomFields`) — flexibilidade admin
8. **Centro de Preferências Push** (push functions) — controle do usuário
9. **Onboarding de Passkey no Login** (`useWebAuthn`) — segurança + UX
10. **Dashboard de Competências** (`useCompetencyData`) — desenvolvimento de equipe

---

> Documento gerado por análise estática cruzada (hooks ↔ imports). Pode haver hooks consumidos via re-export ou dynamic import não detectados.
