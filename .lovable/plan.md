
User quer:
1. **Admin separado para Race Arena** — painel exclusivo de gestão (temporadas, regras, carros, badges, power-ups, auditoria) fora da arena pública.
2. **Separar módulos de corrida Closer vs SDR** — duas arenas distintas com seus próprios rankings, temporadas e regras de pontuação (já existe `role_type` em `race_seasons` + `useRaceSeasonByRole`, mas a UI atual mistura tudo em `/race-arena`).

Já existe infra: `role_type` em `race_seasons` ('closer'|'sdr'), hook `useRaceSeasonByRole`, e `RaceLeaderboardEntry.role_type`. Falta segmentar UI e criar console admin dedicado.

## Plano: Race Arena — Split Closer/SDR + Admin Console

### 1. Separação Closer vs SDR (rotas + UI)
Substituir rota única `/race-arena` por:
- **`/race-arena/closer`** — Arena dos Closers (temporada ativa role_type='closer')
- **`/race-arena/sdr`** — Arena dos SDRs (temporada ativa role_type='sdr')
- **`/race-arena`** — Hub seletor: dois cards grandes (Closer/SDR) com preview do líder atual, total de pilotos e CTA "Entrar na pista"

Cada arena consome `useRaceSeasonByRole(role)` + filtra `useRaceLeaderboard` pela season correspondente. Mesmo layout atual (Ranking esquerda, mapa 75%, feed flutuante), apenas escopado por role.

Sidebar nav: agrupar sob "Race Arena" com sub-itens "Hub", "Pista Closers", "Pista SDRs".

### 2. Admin Console — `/admin/race-arena`
Rota protegida (`isAdmin` only via `usePermissions`). Layout em tabs:

- **Temporadas**: tabela de seasons (filtro role), ações: criar (reusa `StartSeasonDialog` com toggle Closer/SDR), pausar, encerrar, definir vencedor, duplicar regras
- **Regras de Pontuação**: editor por season (reusa `ScoringRulesEditor`) — pesos por métrica, pontos/unidade
- **Garagem**: lista todos os `race_cars`, permite admin reatribuir cores/números, resetar customização, banir carro
- **Power-ups**: CRUD de `race_powerups` ativos no track (tipo, posição %, season)
- **Badges**: catálogo + atribuição manual a vendedores (audit log)
- **Auditoria**: feed de `race_events` + ajustes manuais (XP, posição) com motivo obrigatório

Componentes novos em `src/components/race/admin/`:
- `RaceAdminHub.tsx` (tabs container, ≤200L)
- `SeasonsManagerTable.tsx`
- `GaragemAdminTable.tsx`
- `PowerUpsManager.tsx`
- `BadgesAssigner.tsx`
- `RaceAuditFeed.tsx`

### 3. Páginas e rotas
- `src/pages/RaceArenaHub.tsx` (novo seletor)
- `src/pages/RaceArenaCloser.tsx` (novo, role-scoped)
- `src/pages/RaceArenaSDR.tsx` (novo, role-scoped)
- `src/pages/admin/RaceArenaAdmin.tsx` (novo console)
- Renomear/refatorar `src/pages/RaceArena.tsx` → componente compartilhado `RaceArenaView.tsx` (recebe `roleType` prop)

### 4. Edits
- `src/routes/AppRoutes.tsx`: 4 novas rotas, gate admin via `isAdmin`
- Sidebar nav: novo grupo "Race Arena" + entrada admin "Admin Race"
- `src/components/race/StartSeasonDialog.tsx`: já aceita `role_type` — garantir UX clara (toggle obrigatório)

### 5. Padrões
- Semantic tokens, Sora títulos / Inter UI
- Framer-motion nas transições entre tabs e cards
- Skeleton loading em todas tabelas admin
- Strict TS, ≤300L por arquivo (extrair helpers se passar)
- RLS já cobre `race_*` — UI gating duplo via `isAdmin`
- Toast de sucesso/erro em toda mutação admin

### Resultado
- Closers e SDRs competem em arenas independentes com regras próprias
- Admin tem console dedicado para curadoria total da gamificação de corrida
- Hub central deixa claro qual pista entrar
