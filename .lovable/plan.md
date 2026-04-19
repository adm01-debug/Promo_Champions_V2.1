
Race Arena já está em 10/10 (Frentes A+B+C+D + 5 refinos + telemetria entregues). Você pediu para pular a "Onda Final - Polimento Premium". Para continuar evoluindo rumo à perfeição, proponho uma nova onda focada em **qualidade silenciosa** — coisas que ninguém pede, mas que separam um produto bom de um produto memorável.

## Onda Extra — Resiliência & Detalhe Invisível

### 1. Empty states ilustrados 🎨
- Substituir "Nenhum carro no grid ainda" e similares por ilustrações SVG inline (semáforo apagado, pista vazia) + CTA contextual ("Aguarde início da season" ou "Configure carros no admin").
- Componente `RaceEmptyState.tsx` reutilizável (variantes: no-season, no-cars, no-rival, no-history).

### 2. Skeleton loaders fiéis ao layout 💀
- Hoje a Race Arena mostra spinner genérico ao carregar. Trocar por skeletons que **respeitem o layout final** (pista cinza com 5 retângulos representando carros, sidebar com 8 linhas).
- `RaceArenaSkeleton.tsx` + `RaceSidebarSkeleton.tsx`.

### 3. Error boundaries granulares 🛡️
- Hoje qualquer erro num overlay derruba toda a Race Arena. Envolver `RaceTrack`, `RaceLeaderboardSidebar`, `DailyBriefing`, `MyRivalCard` em `<ErrorBoundary fallback={...}>` individuais.
- Fallback minimalista: "Este painel está indisponível agora" + botão retry.

### 4. Persistência de preferências do usuário 💾
- Hoje view mode, calm mode e mute estão em localStorage isolados. Consolidar em tabela `race_user_preferences` (user_id, view_mode, calm_mode, audio_muted, tour_completed) com sync automático.
- Hook `useRacePreferences.ts` com fallback local-first → cloud-sync.

### 5. Audit de performance & bundle 📦
- `React.memo` com comparator em `RaceCar.tsx` (re-render só quando posição muda).
- `useDeferredValue` no `RaceLeaderboardSidebar` para suavizar updates em massa.
- Lazy imports reais em `SeasonRecapCard`, `CareerTimeline`, `RaceArenaAdmin`.

## Arquivos

**Novos:**
- `src/components/race/RaceEmptyState.tsx`
- `src/components/race/RaceArenaSkeleton.tsx`
- `src/components/race/RaceSidebarSkeleton.tsx`
- `src/components/race/RacePanelErrorBoundary.tsx`
- `src/hooks/race/useRacePreferences.ts`

**Editados:**
- `src/components/race/RaceLeaderboardSidebar.tsx` (empty states + useDeferredValue)
- `src/components/race/RaceTrack.tsx` (skeleton + memoização)
- `src/components/race/RaceCar.tsx` (React.memo comparator)
- `src/pages/RaceArenaHub.tsx` (error boundaries + skeleton)
- `src/components/race/SeasonRecapCard.tsx` (lazy html-to-image confirmado)

**Migração SQL:**
- `race_user_preferences` (RLS: user só lê/escreve o próprio registro)

## Garantias
Tokens HSL · Skeletons respeitam reduced-motion · Error boundaries não engolem erros (logam via console em dev) · Preferências local-first (não bloqueia UI se cloud falhar) · arquivos < 200 linhas · zero regressões.
