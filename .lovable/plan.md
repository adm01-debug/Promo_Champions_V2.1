## Evolução do `SmokeTestChecklist`

Refatorar `src/components/admin/connections/SmokeTestChecklist.tsx` (componente já existe e já está montado em `AdminConexoesPage`) para virar uma checklist de validação rápida com feedback por item.

### Mudanças no componente

**Header (CardHeader)**
- Mantém título "Smoke test"
- Adiciona resumo agregado: `{passed}/{total} passaram` + `{failed} falharam` (badges) — atualiza durante a execução
- Adiciona `Progress` (de `@/components/ui/progress`) abaixo do título quando `running`
- Botões à direita:
  - `Rodar todos` (mantém)
  - Novo: dropdown "Incluir desativadas" (Switch ou Toggle) — quando off, mantém comportamento atual; quando on, lista também conexões com `enabled = false` e marca-as visualmente como inactive
- Respeita `useCredentialsSource()` para filtrar a lista pela origem global (db/env/secret) — alinhado com o resto da página

**Linha por conexão**
- Ícone de status (mantém: pending dot / spinner / check / x)
- Label + badge de tipo (mantém)
- Nova coluna direita: latência do último run (ms) + timestamp relativo (`formatDistanceToNow` pt-BR)
- Quando `fail`, mostra mensagem de erro truncada (max 120 chars) com tooltip do texto completo
- Botão "Rodar" individual (size="sm", variant="ghost") em cada linha — chama `test.mutateAsync(c.id)` e atualiza só aquele item
- Indicação visual quando a conexão está `enabled = false` (opacity-60 + badge "Desativada")

**Persistência leve da última execução**
- Após cada `runAll` ou run individual, gravar em `localStorage` sob chave `smoke-test:last-run` o objeto `{ ts, results: Record<id,{status,latency,error}> }`
- Ao montar, hidratar `results` a partir do localStorage para que o checklist não "esqueça" o último estado ao trocar de aba

**Export**
- Botão "Copiar relatório" no footer do card (visível só após primeiro run)
- Gera markdown:
  ```
  Smoke test — 25/04/2026 13:42
  ✅ 4/5 passaram, ❌ 1 falhou
  
  - [x] Bitrix24 OAuth — 312ms
  - [x] n8n produção — 87ms
  - [ ] MCP Claude — falhou: timeout after 8000ms
  - [x] Webhook Quote — 124ms
  - [x] Banco GIFT STORE — 201ms
  ```
- Usa `navigator.clipboard.writeText` + toast de confirmação

### Estado interno

Substituir o estado atual `Record<string, "pending" | "ok" | "fail" | "running">` por:

```ts
type ItemResult = {
  status: "idle" | "running" | "ok" | "fail";
  latency_ms?: number;
  error?: string;
  ran_at?: string;
};
const [results, setResults] = useState<Record<string, ItemResult>>({});
const [includeDisabled, setIncludeDisabled] = useState(false);
const [running, setRunning] = useState<"all" | string | null>(null); // "all" durante runAll, id durante run individual
```

Derivar `passed`/`failed`/`total` via `useMemo` a partir de `results` filtrado pela lista visível.

### Lógica

- `runOne(id)`: setar item como `running`, chamar `test.mutateAsync(id)`, gravar `{status, latency_ms, error, ran_at: new Date().toISOString()}`, persistir em localStorage
- `runAll()`: marcar todos como `idle`, iterar sequencial chamando `runOne` (preserva ordem para diagnóstico previsível). Sem paralelismo para não causar burst no edge function
- Cancelar: não implementar v1 (simples — runs são curtos, edge function tem timeout 8s próprio)

### Helper extraído

Mover lógica de geração do markdown e leitura/escrita do localStorage para `src/components/admin/connections/smokeTestHelpers.ts` (segue padrão "Helper Modules" do projeto, mantém componente abaixo de 200 linhas).

### Arquivos a editar
- `src/components/admin/connections/SmokeTestChecklist.tsx` (refator completo)

### Arquivos a criar
- `src/components/admin/connections/smokeTestHelpers.ts` (markdown export, localStorage I/O, types)

### Sem mudanças
- Sem nova edge function (reusa `test-integration-connection`)
- Sem migration
- Sem nova rota
- Sem nova dependência (usa `Progress`, `Switch`, `Tooltip`, `Badge` já existentes em `@/components/ui`)

### Validação
- `tsc --noEmit` limpo
- Smoke visual: rodar 1 conexão sucesso + 1 desativada + filtrar por origem; copiar relatório e colar em editor para confirmar markdown
- Confirmar que ao recarregar a página o último resultado persiste
