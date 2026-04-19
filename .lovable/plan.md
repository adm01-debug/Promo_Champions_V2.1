
Race Arena já está em 10/10 (Frentes A+B+C+D + 5 refinos cirúrgicos + telemetria de overlays + Onda Extra de Resiliência). Para continuar evoluindo, proponho a próxima onda focada em **inteligência preditiva e engajamento social** — features que diferenciam um produto excelente de um produto inesquecível.

## Onda Inteligência — Predição & Social

### 1. Predição "What-If" no Briefing 🔮
- `useRaceWhatIf.ts`: simula cenários ("se você fechar +R$X hoje, sobe Y posições"). Usa baseline de vendas do líder/rival.
- Integra ao `DailyBriefingModal` como seção "E se você...?" com 3 cenários (conservador, realista, agressivo).

### 2. Compartilhamento social de conquistas 📸
- `RaceAchievementShareCard.tsx`: cartão exportável quando piloto faz overtake top-3, vence corrida, ou bate recorde pessoal.
- Botão "Compartilhar" gera PNG via `html-to-image` (lazy) + Web Share API com fallback download.

### 3. Modo Espectador 👁️
- `/race-arena/spectator/:seasonId`: rota pública (RLS-safe via view sanitizada) que mostra pista em tempo real sem dados sensíveis (sem comissões, sem metas individuais).
- Útil para TVs no escritório, dashboards de gestão.

### 4. Notificações inteligentes de corrida 🔔
- `useRaceSmartNotifications.ts`: dispara toasts contextuais: "Rival ultrapassou você", "Você está a 1 venda do pódio", "Última hora da corrida".
- Configurável em `RaceAudioPreferences` (renomear para `RacePreferences`).

### 5. Replay temporal da temporada ⏮️
- `SeasonReplayModal.tsx`: scrubber temporal mostrando posições dia-a-dia da season. Útil para post-mortem.
- Usa `race_events` agregados por dia.

## Arquivos

**Novos:**
- `src/hooks/race/useRaceWhatIf.ts`
- `src/hooks/race/useRaceSmartNotifications.ts`
- `src/components/race/RaceAchievementShareCard.tsx`
- `src/components/race/SeasonReplayModal.tsx`
- `src/pages/RaceSpectator.tsx`

**Editados:**
- `src/components/race/DailyBriefingModal.tsx` (seção What-If)
- `src/components/race/RaceAudioPreferences.tsx` (renomear → RacePreferences + toggle notificações)
- `src/components/race/SeasonRecapCard.tsx` (botão "Compartilhar conquista")
- `src/routes/AppRoutes.tsx` (rota spectator pública)
- `src/pages/RaceArenaHub.tsx` (montar SmartNotifications)

**Migração SQL:**
- View `race_spectator_view` (sanitiza dados sensíveis: sem `commission`, sem `personal_goal`, só posição+nome+score)
- Política pública de leitura na view

## Garantias
Tokens HSL · `useReducedMotion` + `useCalmMode` respeitados · Notificações opt-in (default OFF) · Spectator sem dados sensíveis (RLS via view) · arquivos < 200 linhas · zero regressões · html-to-image lazy.
