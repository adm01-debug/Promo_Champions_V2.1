
**Status atual:** Módulo Cadência de Orçamentos já está em 10/10 — todas as 10 melhorias planejadas foram concluídas (#1 cards premium, #2 stagger, #3 métricas, #4 gráfico conversão, #5 drawer + mutations, #6 triggers XP, #7 badge topbar + filtro today, #8 SEO + a11y, #9 skeletons + empty state, #10 documentação) e os 3 bugs do teste E2E foram corrigidos.

Como você pediu para continuar rumo à perfeição, proponho **Fase 2 — Polimento Avançado (5 novas melhorias)** elevando o módulo de 10/10 funcional para *Awwwards-tier*.

### #11 — Bulk actions nos cards
Seleção múltipla via checkbox no `QuoteCadenceCard`, barra flutuante inferior com ações em lote: Pausar, Retomar, Cancelar, Reagendar próxima ação. Hook novo: `useBulkQuoteCadenceMutations`.

### #12 — Exportação CSV/Excel
Botão "Exportar" no header da página gerando CSV (client-side via `papaparse`) com colunas: Cliente, Nº Orçamento, Valor, Status, Step Atual, Próxima Ação, Vendedor. Respeita filtros ativos.

### #13 — Histórico de interações no Drawer
Nova aba "Histórico" no `QuoteCadenceDetailDrawer` listando tarefas concluídas em ordem cronológica reversa, com ícone do canal (email/whatsapp/call), data relativa (`date-fns`) e nota opcional do vendedor.

### #14 — Realtime updates
Subscrever `prospect_cadences` e `cadence_tasks` via `supabase.channel` filtrado por `salesperson_id`. Invalidar queries React Query no evento. Toast sutil "Nova tarefa do dia" quando insert chega. Migration: adicionar tabelas ao `supabase_realtime` publication.

### #15 — Comparativo de cadências (mini-BI)
Nova seção colapsável na página: tabela comparando cadências usadas (nome, total enrolados, taxa conversão, tempo médio até aprovação). Hook `useQuoteCadenceComparison` agregando via SQL. Útil para identificar qual template performa melhor.

### Padrões mantidos
Tokens semânticos, Sora/Inter, ≤400 linhas/arquivo, TS strict, RLS preservada, zero warnings, Framer Motion + skeletons, react-helmet-async.

### Ordem de execução (sequencial, sem perguntas)
1. #11 Bulk actions
2. #12 Exportação CSV
3. #13 Histórico no drawer
4. #14 Realtime
5. #15 Comparativo de cadências
6. Teste E2E final + relatório consolidado 10/10

**Sem impacto** em outros módulos. Schema só altera publication do realtime.
