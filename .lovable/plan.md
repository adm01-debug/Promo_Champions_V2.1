

## Adicionar teste isolado: 1 sub falha em todas, demais seguem normais

### Estado atual
O cenário já existe parcialmente em `retry_test.ts` linha 660 (`"fan-out: sucesso e falha são independentes por subscription"`), mas:
- Não valida número de **deliveries persistidos** por sub (apenas fetches).
- Não testa **independência da ordem** das subs na chamada paralela.
- Não inspeciona campos do **DLQ entry** (status, attempts, latency).

### O que será adicionado
Um teste autônomo em `supabase/functions/winloss-webhook-dispatcher/retry_test.ts`, inserido após o teste da linha 689, com cenário:
- `SUB_A` → 200 OK (1 fetch)
- `SUB_B` → 500 em **todas** as tentativas (esgota `MAX_ATTEMPTS`)
- `SUB_C` → 202 OK (1 fetch)
- Subs disparadas em ordem invertida (`[SUB_C, SUB_B, SUB_A]`) via `Promise.all`

### Asserções
1. **Fetch por URL**: A=1, B=`MAX_ATTEMPTS`, C=1.
2. **Updates de last_status**: cada sub atualiza exatamente 1× — A=200, B=500, C=202.
3. **Deliveries persistidos**: A=1 (succeeded=true), C=1 (succeeded=true), B=3 (todas succeeded=false), com `attempt` cobrindo `[1,2,3]`.
4. **DLQ**: `deadLetters.length === 1`, somente sub-B, com `attempts === MAX_ATTEMPTS`, `last_status === 500`, `total_latency_ms` numérico.
5. **Resultados finais por id** (`succeeded`, `status`, `attempts`).

### Onde
- **Modificar**: `supabase/functions/winloss-webhook-dispatcher/retry_test.ts` (+~55 linhas, após linha 689).
- **Não modificar**: `retry.ts`.

### Verificação
1. `supabase--test_edge_functions` com `functions: ["winloss-webhook-dispatcher"]` — toda a suíte continua verde + 1 novo teste verde.
2. Filtro `pattern: "fan-out"` deve listar 7 testes (6 atuais + 1 novo), todos `ok`.

