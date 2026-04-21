` tag, not a tool.

<lov-plan>

## `updateSubscription` chamado exatamente 1× com `last_status` da última tentativa

### Objetivo
Garantir, via testes determinísticos, que `dispatchOne` chama `updateSubscription` **exatamente uma vez** ao final do loop, e que o `status` propagado é o da **última tentativa executada** — independente do caminho (sucesso imediato, recovery, falha persistente, erro de rede no fim).

### Estado atual
`retry_test.ts` cobre apenas dois pontos isolados:
- Linha 102: sucesso na 1ª (`updates === [{id, status:200}]`).
- Linha 446-450: falha persistente 500 (`updates.length === 1`, `status:500`).

Faltam os casos críticos de **recovery** (status muda entre tentativas) e **transição HTTP ↔ erro de rede**, onde uma regressão poderia gravar um status intermediário em vez do último.

### Mudanças

**Arquivo único**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` — nova seção `// ───────── updateSubscription: chamada única com último status ─────────` com 5 `Deno.test`:

1. **`updateSubscription: 1× com 200 em recovery 500 → 500 → 200`**
   - Garante que o último status (200) sobrescreve intermediários (500). Asserts: `h.updates.length === 1`, `h.updates[0] === {id:"sub-1", status:200}`.

2. **`updateSubscription: 1× com 200 em recovery na 2ª (502 → 200)`**
   - Loop encerra cedo. Asserts: `h.updates.length === 1`, `status === 200`, `h.fetches === 2`.

3. **`updateSubscription: 1× com 503 em falha persistente que muda de status (500 → 502 → 503)`**
   - Asserts: `status === 503` (último, não 500/502).

4. **`updateSubscription: 1× com status=0 quando última tentativa é erro de rede`**
   - 500 → 500 → throw ENETDOWN. Asserts: `h.updates.length === 1`, `status === 0` (não 500).

5. **`updateSubscription: 1× com 200 quando última é HTTP após erros de rede`**
   - throw → throw → 200. Asserts: `h.updates.length === 1`, `status === 200` (não 0).

### Detalhes técnicos
- Reutiliza `makeHarness` existente (já registra `updates` via push).
- Nenhuma mudança em `retry.ts` ou `index.ts`.
- Os 2 testes existentes (linhas 102 e 446) permanecem inalterados — esses já cobrem "sucesso 1ª" e "falha persistente uniforme".

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~55 linhas).

### Verificação
`deno test supabase/functions/winloss-webhook-dispatcher/retry_test.ts` — esperado **38 atuais + 5 novos = 43 ✓**.

