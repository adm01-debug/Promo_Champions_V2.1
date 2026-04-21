

## Cobrir validação Zod do `winloss-webhook-replay` com testes Deno isolados

### Estado atual
A validação **já existe e funciona** em `supabase/functions/winloss-webhook-replay/index.ts` (linhas 36–56):
- `idArray = z.array(z.string().uuid()).min(1).max(50)`.
- `z.union` exige exatamente um dos arrays (`dead_letter_ids` XOR `delivery_ids`).
- `safeParse` retorna **400** com `{ error: "invalid_input", message, details: error.flatten(), requestId }`.

Porém **não há testes Deno** isolando esse schema — só existe `retry_test.ts` do dispatcher.

### O que será adicionado

1. **Extrair `BodySchema`** de `index.ts` para `supabase/functions/winloss-webhook-replay/schema.ts` (export nomeado). Re-importar em `index.ts` — zero mudança de comportamento em runtime.
2. **Criar `supabase/functions/winloss-webhook-replay/schema_test.ts`** com ~18 casos Deno:

**Aceita `delivery_ids`** (e simétrico para `dead_letter_ids`):
- 1 UUID válido → normaliza para `{ delivery_ids: [uuid], dead_letter_ids: undefined }`.
- 50 UUIDs válidos → ok (limite max).
- `delivery_id` singular → açúcar normalizado para array de 1.

**Rejeita exclusividade**:
- Ambos arrays presentes → falha union.
- Body `{}` / nenhum campo → falha union.
- `delivery_ids` + `dead_letter_id` singular do outro tipo após preprocess → falha.

**Rejeita limites**:
- `delivery_ids: []` → falha `min(1)`.
- 51 UUIDs → falha `max(50)`.
- 1 string não-UUID → falha `uuid()`.
- 49 válidos + 1 inválido → falha; `details.fieldErrors.delivery_ids` populado.
- `delivery_ids: "string"` ou `[123, 456]` → falha por tipo.

**Erro serializável**:
- Em todas as falhas, `error.flatten()` produz `{ fieldErrors, formErrors }` — garante que o handler consegue mandar `details` no 400.

### Onde
- **Criar**: `supabase/functions/winloss-webhook-replay/schema.ts` (export `BodySchema` + `idArray`).
- **Modificar**: `supabase/functions/winloss-webhook-replay/index.ts` — substitui definição inline por `import { BodySchema } from "./schema.ts"`.
- **Criar**: `supabase/functions/winloss-webhook-replay/schema_test.ts` (~18 testes Deno).

### Verificação
1. `supabase--test_edge_functions` com `functions: ["winloss-webhook-replay"]` — todos verdes.
2. Curl autenticado com body inválido continua retornando **400** com `details` Zod e `requestId` (sem regressão).

