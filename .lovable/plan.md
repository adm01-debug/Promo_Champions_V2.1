
**Popular módulo Cadência de Orçamentos com dados mockados** para análise visual das melhorias #1–#9.

### Objetivo
Inserir dados realistas via `INSERT` (sem alterar schema) para que `/cadencias-orcamentos` exiba: métricas preenchidas, gráfico de conversão com curva, cards variados (ativos/pausados/concluídos), tarefas do dia e empty state desativado.

### O que será inserido

**1. Cadência base (`cadences`)** — 1 cadência tipo `quote_followup`:
- "Follow-up Orçamento Premium" — 5 passos (D+1 email, D+3 whatsapp, D+7 call, D+14 email, D+21 call).

**2. Steps (`cadence_steps`)** — 5 passos vinculados à cadência acima.

**3. Quotes (`quotes`)** — 12 orçamentos mockados:
- 6 enviados nos últimos 30 dias (status `sent`) → enrolados em cadência ativa.
- 3 aprovados (status `approved`, `updated_at` espalhado nos últimos 20 dias) → cadência `completed` (alimenta taxa de conversão e curva "Aprovados").
- 2 pausados (cadência `paused`).
- 1 cancelado (cadência `cancelled`).
- Valores entre R$ 3.500 e R$ 47.000, clientes variados (Acme Corp, TechBrindes, Editora Solar, etc.), `seller_name` distribuído entre 2-3 vendedores existentes.

**4. Prospect cadences (`prospect_cadences` com `quote_id`)** — 12 registros:
- `started_at` distribuído nos últimos 30 dias.
- `current_step` variado (1 a 5) para mostrar progresso.
- `next_action_date` = hoje em 3 registros (alimenta badge "Tarefas do dia" e filtro `?filter=today`).
- `salesperson_id` = vendedor do usuário atual quando possível (para o hook `useTodaysQuoteCadenceTasks` retornar count > 0).

**5. Cadence tasks (`cadence_tasks`)** — ~25 tarefas:
- 3 `pending` com `scheduled_date = today` (notificação topbar).
- 8 `completed` com `completed_at` hoje (alimenta "Tarefas concluídas hoje").
- ~14 `completed` espalhadas nos últimos 30 dias.
- Algumas `pending` futuras para próximos passos.

### Estratégia de execução
- Antes de inserir: query rápida para descobrir IDs de `salespeople` existentes e o `user_id` atual, garantindo FKs válidas e que o vendedor logado veja as tarefas.
- IDs gerados com `gen_random_uuid()` inline.
- Datas calculadas com `now() - interval 'X days'` para realismo.
- Inserts idempotentes via prefixo identificável (`quote_number` começando com `MOCK-CAD-`) para fácil limpeza futura.

### Resultado esperado em `/cadencias-orcamentos`
- **Métricas**: Follow-ups ativos ~6, Tarefas concluídas hoje ~8, Taxa de conversão ~33%.
- **Gráfico**: curva de "Enviados" vs "Aprovados" populada nos 30/60/90 dias.
- **Cards**: 12 cards com mix de status, progresso visível, alguns com data de hoje.
- **Topbar**: badge mostrando 3 tarefas do dia.
- **Filtro `?filter=today`**: chip ativo mostrando 3 cards.
- **Empty state**: substituído pelos cards reais.

**Sem impacto** em prospect cadences (sale_id), race arena, gamificação real ou outros módulos. Schema intocado.
