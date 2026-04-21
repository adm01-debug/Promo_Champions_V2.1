

## Upgrade da edge function `winloss-webhook-replay`

### Estado atual (já implementado em sessões anteriores)
A função já existe com:
- Auth via `getClaims` + checagem `user_roles.role = 'admin'` → 403 se não admin.
- Validação manual de `dead_letter_ids` / `delivery_ids` (regex UUID, 1–50, exclusividade).
- Marca DLQ como `replaying` antes de chamar dispatcher; restaura para `pending` em caso de erro.
- Skip de delivery já bem-sucedida.
- Retorno: `{ requestId, source, results: [{ id, succeeded, status, error, skipped? }] }`.
- Logs estruturados `replay_start` / `replay_complete` / `replay_fatal`.

### O que será adicionado/modificado
Refinos pedidos pelo usuário:

**1. Validação com Zod**
- Substituir validação manual por schema Zod (`https://esm.sh/zod@3.23.8`).
- Schema: union discriminado garantindo "exatamente um de `dead_letter_ids` OU `delivery_ids`":
  ```
  z.union([
    z.object({ dead_letter_ids: z.array(z.string().uuid()).min(1).max(50) }).strict(),
    z.object({ delivery_ids:    z.array(z.string().uuid()).min(1).max(50) }).strict(),
  ])
  ```
- Aceitar também forma singular (`dead_letter_id` / `delivery_id`) via `.preprocess` que normaliza para array antes do parse.
- 400 com `{ error: "invalid_input", details: zodError.flatten() }`.

**2. Status por ID enriquecido**
- Atualizar o tipo de retorno para incluir `status_label` derivado, sem quebrar consumidores atuais:
  ```
  { id, succeeded, status, status_label: "succeeded"|"failed"|"skipped", error, attempts? }
  ```
- `attempts` populado a partir de `data.results[0].attempts` quando o dispatcher devolver.
- Mantém os campos antigos (`succeeded`, `status`, `error`, `skipped`) para compatibilidade com `useWebhookDeadLetters`.

**3. Checagem de admin via helper**
- Manter a checagem existente, mas extrair em função local `assertAdmin(supabase, userId, requestId)` que retorna `Response | null` para reduzir aninhamento.
- Log padronizado `auth_forbidden` quando falhar.

**4. Logs com `describeError`**
- Importar `describeError` de `../winloss-webhook-dispatcher/retry.ts` (já compartilhado entre funções).
- Aplicar nos catches: dispatcher invoke, restauração de DLQ, fatal.
- Padroniza `error_name` / `error` / `error_stack` (consistente com a iniciativa anterior).

**5. Persistência do resultado de replay (DLQ)**
- Após cada item DLQ processado, gravar:
  - sucesso → `status='replayed'`, `replay_count = replay_count + 1`, `last_replay_at`, `last_replay_status`, `last_replay_error=null`.
  - falha → `status='pending'`, `replay_count = replay_count + 1`, `last_replay_at`, `last_replay_status`, `last_replay_error`.
- Usar RPC inline (update simples; não precisa de migração — os campos já existem na tabela `winloss_webhook_dead_letters` conforme o hook).

### Arquivos
- **Modificar**: `supabase/functions/winloss-webhook-replay/index.ts` (~80 linhas refatoradas, mesmo arquivo único).
- **Não modificar**: `supabase/config.toml` — função permanece com `verify_jwt` no default (validamos JWT em código via `getClaims`).
- **Não modificar**: `src/hooks/win-loss/useWebhookDeadLetters.ts` — contrato de resposta é retrocompatível (`status_label` é additive).

### Verificação
1. `supabase--deploy_edge_functions` em `winloss-webhook-replay`.
2. `supabase--curl_edge_functions` POST sem auth → 401.
3. POST como não-admin → 403, log `auth_forbidden`.
4. POST com body inválido (ex: `{}`, `{ dead_letter_ids: ["x"] }`, ambos arrays presentes) → 400 com `details` do Zod.
5. POST com 1 DLQ válido (admin) → 200 com `results: [{ id, succeeded, status, status_label, error }]`; tabela `winloss_webhook_dead_letters` reflete `replay_count` e `last_replay_*`.
6. Re-replay do mesmo ID se sucesso → registro continua em `replayed` (regravando `last_replay_*`).
7. UI `/admin/webhooks-dead-letters` continua funcional sem mudanças (campos antigos preservados).

