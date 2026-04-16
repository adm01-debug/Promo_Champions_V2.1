
Próxima melhoria atômica da fila Reporting & BI: **Cross-object Reports (joins)** no executor.

## Melhoria 2/7 — Cross-object Reports

### Estado atual
- `report-builder-execute` já lê `cfg.joins` mas só usa o primeiro join para trocar a entidade base — não faz join real.
- `ENTITY_FIELDS` não expõe campos de entidades relacionadas.
- `ReportBuilder` não tem UI para configurar joins.

### Mudanças

**1. Edge function `report-builder-execute`**
- Quando `entity === "cross"`:
  - Validar `cfg.joins[]` (entidade base + 1-3 joins permitidos)
  - Mapa whitelist de joins suportados:
    - `sales` → `accounts` (via `account_id`)
    - `sales` → `salespeople_public` (via `salesperson_id`)
    - `sales` → `clients` (via `client_id`)
    - `activities` → `salespeople_public` (via `salesperson_id`)
    - `activities` → `sales` (via `sale_id`)
    - `leads` → `salespeople_public` (via `salesperson_id`)
  - Construir `select` PostgREST embedded: `base.select("col1,col2,joined:joined_table(colA,colB)")`
  - Aceitar colunas com prefixo `joined.field` no `cfg.columns` e converter para sintaxe embedded
  - Filtros em colunas joined → usar sintaxe `joined_table.field` no `.eq()`

**2. Helpers (`reportBuilderHelpers.ts`)**
- Adicionar `JOIN_MAP: Record<entity, JoinDef[]>` com pares válidos + FK
- Adicionar `buildCrossEntityFields(base, joins)` que retorna `EntityFieldDef[]` agregados com prefixo
- Adicionar `serializeCrossSelect(columns, joins)` para gerar a string select PostgREST

**3. UI — novo `CrossObjectJoinPanel.tsx` (≤200L)**
- Select da entidade base
- Botão "Adicionar join" → dropdown de entidades compatíveis (filtrado por `JOIN_MAP[base]`)
- Lista de joins ativos com remover
- Preview do schema combinado

**4. `ReportBuilder.tsx`**
- Quando `entity === "cross"`: renderizar `CrossObjectJoinPanel` antes do `ReportFieldPicker`
- `ReportFieldPicker` recebe campos combinados quando cross
- `ReportFilterBuilder` aceita campos prefixados

**5. Validação**
- Deploy edge function
- `curl_edge_functions` com payload cross (sales+accounts, columns: id, amount, accounts.name, accounts.tier)
- Verificar que filtros e ordenação funcionam em campos joined

### Arquivos
- Editar: `supabase/functions/report-builder-execute/index.ts`, `src/hooks/reporting/reportBuilderHelpers.ts`, `src/components/reporting/ReportBuilder.tsx`, `src/components/reporting/ReportFieldPicker.tsx`, `src/components/reporting/ReportFilterBuilder.tsx`
- Criar: `src/components/reporting/CrossObjectJoinPanel.tsx`

Após esta, sigo automaticamente para 3/7 (Funnel visual rico), 4/7 (Cohort heatmap), 5/7 (Scheduled robusto), 6/7 (Embedded), 7/7 (widget dashboard + E2E).
