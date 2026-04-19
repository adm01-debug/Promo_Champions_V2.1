
Frente A + B + D entregues. Resta **Frente C — Camada identitária** (semanas 5-8) e os **5 refinos cirúrgicos de microinterações**. Vamos executar Frente C agora, que é a de maior impacto emocional restante.

## Frente C — Camada identitária

### 1. Equipes/Escuderias 🏎️
- **Migração:** tabela `race_teams` (id, season_id, name, color_primary, color_secondary, emoji) + `race_team_members` (team_id, car_id). RLS: leitura pública autenticada, escrita admin.
- `useRaceTeams.ts`: lista equipes da season + agregação de pontos (soma `total_sales` dos membros).
- `TeamLeaderboard.tsx`: ranking de escuderias no sidebar (colapsável, abaixo do Live Timing).
- `RaceCar.tsx`: aceita `teamColor` opcional como faixa secundária no carro (stripe lateral).

### 2. Rival nomeado persistente ⚔️
- `useMyRival.ts`: identifica rival = piloto adjacente no ranking (1 acima OU 1 abaixo, alterna por season). Persiste escolha em `race_rivalries` (car_id, rival_car_id, season_id).
- `MyRivalCard.tsx`: card destacado no sidebar — "Seu rival: João · gap +2.3%" com sparkline de 7 dias do duelo. CTA "Ver no replay".
- Highlight visual na pista: rival ganha contorno tracejado dourado quando hover no MyRivalCard.

### 3. Career Mode (histórico vitalício) 🏆
- `useMyCareer.ts`: agrega histórico do salesperson em todas as seasons (`race_seasons` + `race_cars` + `race_season_results`).
- `CareerTimeline.tsx`: nova rota `/race-arena/career` com lista cronológica de seasons (rank final, podiums, takeovers totais, badges permanentes).
- Card resumo no Hub: "Career: 12 seasons · 3 títulos · 47 podiums".

### 4. Shareable season card 📸
- `SeasonRecapCard.tsx`: card visual exportável (PNG via html-to-image) gerado ao final de cada season — "Lucas · P2 Season 12 · 3 takeovers · 12 dias de streak".
- Botão "Compartilhar" no `ChampionsHistoryPanel`. Download direto + cópia para clipboard.

## Arquivos

**Novos:**
- `src/hooks/race/useRaceTeams.ts`
- `src/hooks/race/useMyRival.ts`
- `src/hooks/race/useMyCareer.ts`
- `src/components/race/TeamLeaderboard.tsx`
- `src/components/race/MyRivalCard.tsx`
- `src/components/race/CareerTimeline.tsx`
- `src/components/race/SeasonRecapCard.tsx`
- `src/pages/RaceArenaCareer.tsx`

**Editados:**
- `src/components/race/RaceCar.tsx` (faixa lateral teamColor)
- `src/components/race/RaceLeaderboardSidebar.tsx` (montar TeamLeaderboard + MyRivalCard)
- `src/components/race/ChampionsHistoryPanel.tsx` (botão "Compartilhar season")
- `src/pages/RaceArenaHub.tsx` (card Career resumo + link `/race-arena/career`)
- `src/routes/AppRoutes.tsx` (rota `/race-arena/career`)

**Migração SQL:**
- `race_teams`, `race_team_members`, `race_rivalries` (RLS + índices)
- Trigger para auto-criar rivalidade na 1ª inserção de car em season

## Garantias
Tokens HSL · RLS rigorosa (leitura autenticada, escrita admin) · arquivos < 200 linhas · `aria-label` em todos os badges de equipe/rival · retrocompatível (carros sem team rendem sem stripe) · html-to-image lazy-loaded.
