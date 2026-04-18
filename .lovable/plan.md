
User wants to use the checkered flag victory celebration (VictoryLapOverlay) as a monthly winner celebration — triggered at month-end for the top performer of the Race Arena, not just on individual race victory events.

Let me check the current VictoryLapOverlay and how it's triggered.

The current `VictoryLapOverlay.tsx` listens to `race_events` of type `'victory'`. We need a separate **MonthlyChampionOverlay** that fires at end-of-month (or when admin closes the season) showing the #1 ranked Closer/SDR with the same gold trophy + checkered flag aesthetic.

## Plano: Cerimônia do Campeão do Mês 🏁

### Conceito
Reaproveitar o visual da `VictoryLapOverlay` (troféu dourado + bandeira quadriculada + confetes) para criar uma **cerimônia oficial de premiação mensal** do vencedor da Race Arena (Closer e SDR separadamente).

### Trigger
Quando o mês vira (ou quando admin fecha a season manualmente):
1. Sistema identifica o líder do `useRaceLeaderboard` da season encerrada
2. Registra um evento `monthly_champion` em `race_events` (via RPC ou no fechamento da season)
3. Overlay aparece para todos os usuários conectados ao abrir a arena daquele role

Detecção client-side: hook `useMonthlyChampion(roleType)` que:
- Busca a season mais recente com `status='finished'` e `ended_at` no mês corrente
- Identifica o `winner_id` (ou top 1 do leaderboard daquela season)
- Marca como "visto" em `localStorage` (`monthly-champion-seen-${seasonId}`) para não repetir
- Retorna `{ champion, season, shouldShow }`

### Componente novo: `MonthlyChampionOverlay.tsx`
Variação premium do `VictoryLapOverlay`:
- **Header**: "🏆 CAMPEÃO DO MÊS 🏆" + nome do mês (ex: "Outubro 2025")
- **Centro**: Avatar grande do vencedor + troféu animado + bandeira quadriculada SVG procedural (não emoji) ondulando com framer-motion
- **Stats**: Total de vendas, # de deals, dias liderando, XP ganho na season
- **Ações**: "Compartilhar conquista" (copia link/imagem) + "Fechar"
- **Animações**: Spring entry, confete dourado contínuo (5s), reveal sequencial (troféu → nome → stats)
- **Áudio opcional**: respeitar `RaceSoundToggle` setting

### Bandeira quadriculada SVG
Componente `CheckeredFlag.tsx` em `src/components/race/`:
- SVG com padrão de xadrez 8x4 células pretas/brancas
- Animação de wave usando `<animateTransform>` ou framer-motion `path` morph
- Reutilizável: usar também no header da arena para reforçar branding

### Integração
- `RaceArenaView.tsx`: montar `<MonthlyChampionOverlay roleType={roleType} />` ao lado do `VictoryLapOverlay` existente
- Admin Console (`SeasonsManagerTable`): ao "Encerrar season", chamar RPC que define `winner_salesperson_id` e insere evento `monthly_champion` → dispara overlay para todos

### Backend (mínimo)
Migration leve:
- Confirmar coluna `winner_salesperson_id` em `race_seasons` (provavelmente já existe)
- RPC `finalize_race_season(season_id uuid)` SECURITY DEFINER (admin only via `has_role`):
  1. Calcula top 1 do leaderboard da season
  2. Set `status='finished'`, `winner_salesperson_id`, `ended_at=now()`
  3. Insere `race_events` tipo `monthly_champion` com metadata (ranking final top 5)
  4. Concede badge "Campeão do Mês" via `salesperson_badges`

### Arquivos
- **Novo**: `src/components/race/MonthlyChampionOverlay.tsx` (~250L)
- **Novo**: `src/components/race/CheckeredFlag.tsx` (~80L SVG animado)
- **Novo**: `src/hooks/race/useMonthlyChampion.ts` (~80L)
- **Editar**: `src/pages/RaceArenaView.tsx` (montar overlay)
- **Editar**: `src/components/race/admin/SeasonsManagerTable.tsx` (botão "Finalizar e Premiar" → chama RPC)
- **Editar**: `src/components/race/index.ts` (exportar novos)
- **Migration**: 1 RPC `finalize_race_season` + garantir colunas

### Padrões
Semantic tokens (rank-gold, amber-*), Sora p/ "CAMPEÃO DO MÊS", framer-motion spring, ≤300L por arquivo, RPC SECURITY DEFINER + RLS, localStorage para deduplicação client-side.

### Resultado
Cerimônia mensal automática e cinematográfica que coroa o campeão de cada pista (Closer/SDR), reaproveitando o visual de bandeira quadriculada como assinatura da Race Arena.
