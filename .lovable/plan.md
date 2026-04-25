## Cards de saúde por conexão

Hoje, o status detalhado de cada integração só aparece em uma linha de tabela. Vou adicionar uma seção visual de **cards individuais por conexão** acima da `ConnectionsOverviewTable`, mostrando todos os dados úteis para diagnóstico rápido.

### Novo componente: `IntegrationHealthCardsGrid.tsx`

Localização: `src/components/admin/connections/IntegrationHealthCardsGrid.tsx`

Renderiza um grid responsivo (`md:grid-cols-2 lg:grid-cols-3`) de `IntegrationHealthCard`, um por conexão filtrada pelo `useCredentialsSource()`.

### Card individual: `IntegrationHealthCard`

Para cada `integration_connection`, exibe:

- **Header**: ícone por tipo (Database / Plug / Webhook / Bot / Workflow) + label + badge de tipo + badge de origem (`db` / `env` / `secret`)
- **Status atual** (do último `integration_health_checks`):
  - Badge verde "Operacional" se `status = success`
  - Badge vermelha "Falhando" se `status = error`
  - Badge cinza "Não testado" se sem registros
  - Badge amarela "Desativado" se `enabled = false` (override visual)
- **Métricas inline**:
  - Última verificação (`formatDistanceToNow` em pt-BR)
  - Latência do último teste (ms)
  - Taxa de sucesso nas **últimas 10 execuções** (% calculado client-side a partir de `useIntegrationHealth(connectionId)` filtrado)
  - Mini sparkline de latência (últimos 10 testes) usando `MiniSparkline` existente em `src/components/ui` se disponível, senão omitir
- **Bloco de erro** (apenas se último check falhou):
  - `Alert` destrutivo com mensagem `error` truncada (max 200 chars) + tooltip com texto completo
- **Footer**: 2 botões — "Testar agora" (chama `useTestConnection`) e "Ver histórico" (abre `Sheet` lateral com tabela das últimas 50 execuções)

### Sheet de histórico: `IntegrationHealthHistorySheet`

- `Sheet` lateral com `SheetTrigger` no card
- Tabela com colunas: Data/hora, Status, Latência (ms), Erro, Origem do trigger (`manual` / `auto` / `smoke`)
- Reusa `useIntegrationHealth(connectionId)` (já existe e aceita filtro por id)
- Limita a 50 últimos registros (já é o `.limit(100)` do hook → ajustar para receber limit opcional, default 100)

### Ajustes em hook existente

Em `src/hooks/admin/useIntegrationConnections.ts`:

- Atualizar `useIntegrationHealth(connectionId?, limit = 100)` para aceitar `limit` opcional, mantendo retrocompatibilidade.
- Tipar o retorno como `IntegrationHealthCheck[]` (interface nova exportada) com campos: `id, connection_id, status, latency_ms, error, checked_at, triggered_by`.

### Integração na página

Em `src/pages/admin/AdminConexoesPage.tsx`, inserir o novo grid **entre `ConnectionsOverviewTable` e o grid dos 3 cards de auto-teste**:

```tsx
<ConnectionsOverviewTable />

<IntegrationHealthCardsGrid />   {/* NOVO */}

<div className="grid gap-4 md:grid-cols-3">
  <AutoTestIntervalCard />
  ...
</div>
```

Ambos consomem o mesmo `CredentialsSourceFilterProvider`, então o filtro Banco/ENV/Secret afeta os dois automaticamente.

### Comportamento de loading e empty

- Loading: 6 skeletons no grid (mesma altura ~180px)
- Empty (após filtro): mensagem "Nenhuma conexão para esta origem"
- Empty global (zero conexões): omite o grid inteiro (a tabela acima já comunica)

### Arquivos a criar
- `src/components/admin/connections/IntegrationHealthCardsGrid.tsx`
- `src/components/admin/connections/IntegrationHealthCard.tsx`
- `src/components/admin/connections/IntegrationHealthHistorySheet.tsx`

### Arquivos a editar
- `src/hooks/admin/useIntegrationConnections.ts` (tipo `IntegrationHealthCheck` + parâmetro `limit` opcional)
- `src/pages/admin/AdminConexoesPage.tsx` (montar o grid)

### Validação final
- `tsc --noEmit` limpo
- Smoke visual: criar 1 conexão fake (n8n), rodar teste, confirmar card mostra status, latência e abre sheet de histórico

Sem mudanças de schema, sem nova edge function, sem novas migrations — usa exclusivamente as tabelas `integration_connections` e `integration_health_checks` já criadas.