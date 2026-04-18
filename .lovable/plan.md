
# Continuação: Race Arena 10/10 — Etapas 9 e 10 finais

Já entreguei 1-8 (spotlight, commentary IA, daily check-in, modo TV, tokens semânticos, view modes, onboarding+demo, rivalidades+highlights). Restam as duas últimas para fechar 10/10.

## Etapa 9 — Garagem + skins desbloqueáveis
**DB**
- Tabela `race_unlocks` (`user_id`, `unlock_key`, `unlocked_at`, unique pair) com RLS: usuário lê/insere apenas o próprio
- RPC `unlock_race_item(_unlock_key text)` SECURITY DEFINER: valida liga atual via `arena_user_stats` (ou tabela equivalente) antes de inserir
- Colunas novas em `race_cars`: `nickname text`, `victory_quote text` (default null)

**Catálogo**
- `src/components/race/garage/raceUnlockCatalog.ts`: lista de decals/neons/skins com `key`, `label`, `requiredLeague`, `preview`

**UI**
- Rota `/race-arena/garage` (`RaceArenaGarage.tsx`) com 3 abas (shadcn Tabs):
  - **Troféus**: lifetime wins, podiums, MVPs (consulta `race_seasons` + `race_results`)
  - **Carros**: grid de skins/decals/neons com cadeado se bloqueado, CTA "Desbloquear" quando elegível
  - **Stats**: deals fechados lifetime, melhor posição, dias em #1, streak máximo
- Estender `CarCustomizer` com tabs "Decals" e "Neons" (gateadas por unlocks) + inputs `nickname` e `victory_quote`
- Hook `useRaceUnlocks()` (lista) + `useUnlockRaceItem()` (mutação)
- Adicionar link "Garagem" no `RaceArenaHeader`

## Etapa 10 — Acessibilidade + Reactions ao vivo
**Acessibilidade**
- Setting `colorblind_mode` em Configurações → Skins (já existe a tab); persiste em `user_preferences`
- `RaceCar.tsx` recebe `pattern?: 'stripes' | 'dots' | 'checker'` derivado do número do carro quando colorblind ativo; `<pattern>` SVG em `TrackDefs`
- Hook `useRaceMotion()` lê `prefers-reduced-motion`; quando true, `RaceArena` troca `transition` de spring para `{ duration: 0, type: 'tween' }` (saltos discretos por checkpoint)
- `aria-live="polite"` invisível em `RaceArenaView` anunciando: nova liderança, X minutos para fim, próprio rank mudou
- Aumentar `fontSize` mínimo dos labels SVG de 11→13

**Reactions ao vivo**
- Tabela `race_reactions` (`id`, `season_id`, `target_car_id`, `reactor_user_id`, `emoji`, `created_at`); RLS: leitura pública na season ativa, insert autenticado (rate-limit via trigger: máx 10/min/usuário)
- Realtime channel `race-reactions:{seasonId}` no `RaceArena`
- `ReactionBar.tsx`: 4 emojis fixos (🔥 👏 😱 🚀); aparece on-hover sobre o carro
- `ReactionFloater.tsx`: emoji sobe e fade-out quando recebido (motion + auto-cleanup 1.5s)
- Contador agregado por carro nas últimas 60s (badge pequeno acima do label)

## Padrões mantidos
- ≤400 linhas/arquivo, helpers em `*Helpers.ts`
- Tokens semânticos (sem cores hardcoded)
- Framer Motion + haptics
- Zero erros de console
- React Query + RLS
- RPCs SECURITY DEFINER para escritas sensíveis

## Ordem
9 → 10. Cada etapa = commit completo. Ao concluir 10, listo as 10 entregas e declaro 10/10.
