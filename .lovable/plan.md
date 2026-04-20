

## Bateria E2E — Fase 3 (#16–#20) do módulo Cadência de Orçamentos

### Escopo
Validar exclusivamente as 5 melhorias da Fase 3 (mobile responsivo, urgência visual, keyboard shortcuts, animações de tab, documentação) sem alterar código.

### Camadas

**1. Banco (read-only via `supabase--read_query`)**
- Contagens de `prospect_cadences` por status (active/paused/completed/cancelled) com `quote_id NOT NULL`.
- Quantos têm `next_action_date = hoje` (validar #17 borda pulsante).
- Quantos têm `next_action_date < hoje` (validar #17 badge "Atrasado").
- Confirmar mocks `MOCK-CAD-*` continuam visíveis ao usuário logado.

**2. Build & estática**
- `tsc --noEmit` (zero erros).
- `wc -l` em `QuoteCadencesPage.tsx`, `QuoteCadenceCard.tsx`, `QuoteCadenceDetailDrawer.tsx`, `QuoteCadenceMetrics.tsx`, `useQuoteCadences.ts` — confirmar ≤400 linhas.
- `grep` confirmando uso real de `useQuoteCadenceShortcuts`, `AnimatePresence`, `animate-pulse`, `safe-area-inset-bottom`.

**3. UI Desktop 1561×861 em `/cadencias-orcamentos`**
- **#17 Métrica "Atrasados":** screenshot dos 4 cards de métrica, ícone `AlertTriangle`, valor numérico.
- **#17 Borda pulsante:** identificar card com ação hoje + badge "Atrasado X dias" em cards vencidos.
- **#19 Animações tabs:** clicar Ativos → Pausados → Concluídos → Todos, capturar cross-fade.
- **#19 Drawer:** abrir card, alternar Tarefas ↔ Histórico, observar transição.
- **#18 Ctrl+E:** disparar atalho, monitorar download CSV via network log.
- **#18 Ctrl+A:** selecionar todos, confirmar `QuoteCadenceBulkBar` aparece.
- **#18 Escape:** limpar seleção; abrir drawer e fechar via Esc.
- **#18 Atalho ignorado em input:** focar campo de busca, digitar "a", garantir que não dispara seleção.

**4. UI Mobile 390×844**
- **#16 Snap-x:** scroll horizontal entre cards, screenshot.
- **#16 BulkBar safe-area:** acionar bulk no mobile, confirmar `pb-[env(safe-area-inset-bottom)]`.
- **#16 Métricas 2×2:** grid responsivo nos 4 cards.

**5. A11y & motion**
- `observe` confirmando `role="region"`, `aria-label` na BulkBar e nas métricas.
- `aria-live="polite"` nos valores de métrica.
- Verificar respeito a `prefers-reduced-motion` (hook `useReducedMotion` já no projeto).

**6. Console & rede**
- `code--read_console_logs` filtrando "error"/"warn".
- `browser--list_network_requests` durante export e troca de tabs — sem 4xx/5xx.

### Entrega
Relatório consolidado em tabela:

```text
| # | Camada | Cenário | Resultado | Evidência |
```

Bugs encontrados (se houver) listados separadamente com severidade. Score final 0–10 por critério: Funcionalidade, UX, A11y, Performance, Mobile.

**Sem mutações destrutivas reais.** Bulk cancel apenas observado na UI sem confirmar. Bugs viram plano separado.

