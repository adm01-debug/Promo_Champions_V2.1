

## Bateria de testes E2E — Fase 3 (#16–#20) do módulo Cadência de Orçamentos

### Escopo
Validar exclusivamente as 5 melhorias da Fase 3 recém-entregues, sem alterações de código.

### Camadas de teste

**1. Banco de dados (read-only via `supabase--read_query`)**
- Confirmar que mocks `MOCK-CAD-*` continuam visíveis e que `overdueCount` retorna >0 (necessário para validar #17).
- Conferir contagens de `prospect_cadences` ativos / pausados / concluídos / cancelados.
- Validar `next_action_date` em pelo menos 1 registro = hoje e 1 < hoje.

**2. Build & estática**
- `tsc --noEmit` (zero erros).
- `grep` por uso real do hook `useQuoteCadenceShortcuts` em `QuoteCadencesPage`.
- `wc -l` em arquivos editados — confirmar ≤400 linhas (padrão arquitetural).

**3. UI — Desktop 1561×861 (`/cadencias-orcamentos`)**
- **#17 Urgência visual:** screenshot identificando borda pulsante em cards "hoje" e badge vermelho "Atrasado X dias".
- **#17 Métrica "Atrasados":** confirmar 4º card visível com ícone `AlertTriangle` e número correto.
- **#19 Animação tabs:** `act` clicar em Ativos → Pausados → Concluídos → Todos, screenshot intermediário.
- **#19 Animação drawer:** abrir card, alternar abas Tarefas ↔ Histórico, observar cross-fade.
- **#18 Atalhos:**
  - `Ctrl+E` → confirmar download CSV (network log).
  - `Ctrl+A` → selecionar todos, BulkBar surge.
  - `Escape` → limpa seleção; abrir drawer e `Escape` → fecha.
  - Validar que digitar em input não dispara atalho.

**4. UI — Mobile 390×844**
- **#16 Responsividade:** snap-x horizontal nos cards, BulkBar com safe-area, drawer com `max-h-[85vh]`, filtros colapsáveis.
- Screenshot inicial + após scroll horizontal.

**5. A11y**
- Inspeção via `observe` confirmando `aria-label` na BulkBar, role="region", foco visível ao tabular.
- Verificar respeito a `prefers-reduced-motion` no CSS gerado para `animate-pulse`.

**6. Console & rede**
- `code--read_console_logs` filtrando "error" / "warn".
- `browser--list_network_requests` durante export e mudanças de tab — sem 4xx/5xx.

### Entrega final
Relatório consolidado em tabela:

| # | Camada | Cenário | Resultado | Evidência |

Bugs (se houver) listados com severidade. Score 0–10 por critério: Funcionalidade, UX, A11y, Performance, Mobile.

**Sem mutações destrutivas reais.** Bulk cancel apenas observado na UI sem confirmação. Bugs encontrados entram em plano separado.

