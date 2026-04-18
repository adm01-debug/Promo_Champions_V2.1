
User wants mock data populated in Race Arena to visualize the system. Currently the arena is empty (no cars on grid, no events). I need to seed mock race data.

Let me check what tables exist for the race system and what mock data would make it visual.

Key tables (from earlier context):
- `race_seasons` (já tem temporada ativa "Temporada de Estreia")
- `race_cars` (carros dos vendedores)
- `race_leaderboard_view` (view com progresso)
- `race_events` (narração)
- `race_powerups`
- `race_badges`
- `salespeople` (já tem mock)

Plan: criar migration de seed inserindo carros para vendedores existentes + eventos de narração + alguns power-ups + badges, garantindo cobertura de Closer e SDR.

## Mock Data Seed for Race Arena

### O que será populado
1. **race_cars** — 1 carro por vendedor existente (até 12), com cores variadas, números únicos, estilos misturados (f1/stock/kart) e nicknames divertidos
2. **Progresso simulado** — inserir vendas mock recentes para os top vendedores nas temporadas ativas (Closer e SDR) para que a `race_leaderboard_view` calcule progresso real (15%-85% espalhado)
3. **race_events** — 8-12 eventos de narração recentes (overtakes, milestones 25%/50%/75%, power-ups coletados) para popular o feed "Narração ao Vivo"
4. **race_powerups** — 4-5 power-ups espalhados pelo track (boost, shield, double_xp) com `position_pct` em pontos visíveis
5. **race_badges** — 3-4 badges atribuídos para top performers (first_blood, podium, overtaker)

### Estratégia técnica
- Migration SQL idempotente (`ON CONFLICT DO NOTHING` em todos inserts)
- Usar `salespeople` reais via subqueries com `LIMIT` e `ORDER BY` para distribuir entre Closer e SDR
- Cores em paleta vibrante (hex semântico-friendly): `#FF3B30`, `#007AFF`, `#34C759`, `#FFD60A`, `#AF52DE`, `#FF9500`, `#5AC8FA`, `#FF2D55`
- Eventos com `created_at` escalonados nos últimos 30 minutos para parecer ao vivo
- Progresso via inserts em `sales` (table base do leaderboard) com `amount` calibrado para gerar % desejado vs `goal_amount` da season

### Resultado visual esperado
- Track com 8-12 carros distribuídos pela pista (não todos no início)
- Sidebar "Grid de Largada" populada com ranking
- Feed "Narração ao Vivo" com 8+ eventos animados
- Power-ups visíveis no track (ícones flutuantes)
- Conquistas (badges) na aba "Conquistas"

### Arquivos
- 1 migration: `supabase/migrations/<timestamp>_seed_race_arena_mock.sql`

Sem mudanças em código TS — puramente seed de dados para visualização.
