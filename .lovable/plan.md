
**Bateria de testes E2E do módulo Cadência de Orçamentos** (melhorias #1–#9 + dados mockados)

### Escopo
Validar exclusivamente o que foi implementado nas melhorias #1–#9 do módulo `/cadencias-orcamentos`, usando os dados mockados (`MOCK-CAD-*`) recém-inseridos.

### Camadas de teste

**1. Banco de dados (read queries via `supabase--read_query`)**
- Confirmar 12 quotes `MOCK-CAD-*`, 12 `prospect_cadences` com `quote_id`, ~30 `cadence_tasks`.
- Validar distribuição de status (active/paused/completed/cancelled) e `next_action_date` = hoje em ≥3 registros.
- Verificar triggers de XP (#6): existência de `award_xp_on_quote_cadence_task_complete` e `award_xp_on_quote_approved_via_cadence` em `pg_trigger`.
- Verificar RLS de `prospect_cadences`/`cadence_tasks` (permissões corretas).

**2. Edge functions / RPCs**
- Testar `enroll_quote_in_cadence` via `supabase--read_query` (dry-run com SELECT) confirmando que `auth_user_id` foi corrigido.

**3. UI funcional (browser automation)**
- **Navegação**: `/cadencias-orcamentos` carrega sem erro, H1 "Cadência de Orçamentos" presente.
- **Métricas (#3, #9)**: 3 cards com valores > 0; shimmer some após load; ARIA `role="region"` + `aria-live` presentes.
- **Gráfico de conversão (#4)**: renderiza curva Enviados vs Aprovados; ToggleGroup (30/60/90d) muda período; `aria-label` correto.
- **Cards (#1, #2, #9)**: 12 cards exibidos com stagger animation; status badges corretos; foco visível ao tabular.
- **Filtro `?filter=today` (#7)**: navegar para `/cadencias-orcamentos?filter=today` exibe chip ativo + reduz lista a 3 cards.
- **Topbar badge (#7)**: ícone `FileText` no `DesktopTopBar` mostra contagem de tarefas do dia; click leva à página filtrada.
- **Drawer de detalhes (#5)**: abrir card → drawer mostra timeline de tarefas, ações Pausar/Retomar/Cancelar, `aria-describedby`.
- **Mutations (#5)**: testar Pausar (sem confirmar destrutivo), validar toast e revalidação.
- **Empty state premium (#9)**: navegar com filtro impossível (ex.: `?filter=today` quando não há) → SVG animado aparece.
- **SEO (#8)**: inspecionar `<head>`: title, description, canonical, OG, twitter:card.

**4. Acessibilidade**
- Tab navigation: foco visível em todos cards/botões.
- ARIA labels nos botões de ação, ToggleGroup, DropdownMenu.

**5. Console & rede**
- `code--read_console_logs` filtrado por `cadenc` / `error` — zero erros relacionados ao módulo.
- `browser--list_network_requests` confirma queries Supabase 200 OK.

### Entregáveis
Relatório consolidado em formato tabela:
| # | Camada | Cenário | Resultado | Evidência |
|---|--------|---------|-----------|-----------|
- Bugs encontrados (se houver) listados separadamente com severidade.
- Score final 0–10 por critério: Funcionalidade, UX, A11y, Performance, SEO.

**Sem mutações destrutivas reais** (DELETE/CANCEL serão apenas verificados via UI sem confirmar). **Sem alterações de código** nesta fase — apenas validação. Bugs identificados serão reportados; correções entram em plano separado.
