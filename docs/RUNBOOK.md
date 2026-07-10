# 🚀 Runbook Operacional — Promo Champions

## Índice
1. [Deploy](#deploy)
2. [Rollback](#rollback)
3. [Incidentes](#incidentes)
4. [Troubleshooting](#troubleshooting)

---

## Deploy

### Deploy Padrão (via Lovable)
1. Commit na branch principal via Lovable
2. Build automático é disparado
3. Preview disponível imediatamente
4. Publicar via botão "Publish" no Lovable

### Validação Pré-Deploy
```bash
npm run health     # typecheck + lint + tests
npm run build      # build de produção
```

### Deploy de Edge Functions
- Edge Functions são deployadas automaticamente pelo Lovable
- Para testar antes: use `curl_edge_functions` no painel

---

## Rollback

### Rollback Rápido (< 2 min)
1. Acessar **Lovable** → histórico de versões
2. Selecionar versão anterior estável
3. Restaurar

### Rollback de Migrations
- Migrations não são automaticamente reversíveis
- Para reverter: criar nova migration com `DROP`/`ALTER` inverso
- **NUNCA** deletar migrations existentes

---

## Incidentes

### Severidades

| Nível | Critério | SLA |
|-------|----------|-----|
| 🔴 P1 | Sistema fora do ar / Perda de dados | < 30 min |
| 🟠 P2 | Feature crítica quebrada | < 2 horas |
| 🟡 P3 | Bug não-bloqueante | < 24 horas |
| 🟢 P4 | Melhoria / cosmético | Próximo sprint |

### Procedimento de Incidente
1. **Detectar** — via monitoramento, alerta ou report de usuário
2. **Classificar** — atribuir severidade (P1-P4)
3. **Comunicar** — notificar stakeholders
4. **Investigar** — logs, métricas, reproduzir
5. **Mitigar** — hotfix ou rollback
6. **Resolver** — fix definitivo com testes
7. **Post-mortem** — documentar causa raiz e ações preventivas

---

## Troubleshooting

### DB Lento
1. Verificar queries lentas: `SELECT * FROM pg_stat_activity WHERE state = 'active'`
2. Checar índices: queries sem índice? Adicionar via migration
3. Connection pool: verificar se pooler está ativo

### Edge Function Timeout
1. Verificar logs da function
2. Checar se chamadas externas (Bitrix24, Resend) estão respondendo
3. Implementar timeout explícito com `AbortController`

### Erro 401/403 em API
1. Token expirado? Verificar refresh token flow
2. RLS blocking? Testar query como service_role
3. Role incorreto? Verificar `user_roles` table

### Push Notifications Não Chegam
1. Verificar `push_subscriptions` table — subscription existe?
2. Verificar VAPID keys — estão configuradas nos secrets?
3. Service Worker registrado? Checar `navigator.serviceWorker.getRegistration()`

### Build Falha
```bash
npm run typecheck   # Erros de tipo
npm run lint        # Erros de lint  
npm run test        # Testes quebrados
```

---

## Contatos

| Papel | Responsável |
|-------|-------------|
| Lead Dev | Configurar no README |
| DevOps | Lovable Cloud (automático) |
| Suporte DB | Lovable Cloud Dashboard |

## Callback V4 (Promo Gifts V4)

Fila de notificações do CRM para o V4 (mudanças de status de quotes, criação de pedidos).

### Como ligar
1. Publique o endpoint receptor no V4 (POST + header `x-api-key`).
2. Configure os secrets no CRM: `V4_CALLBACK_URL` e `V4_CALLBACK_API_KEY`.
3. O cron do dispatcher `notify-v4-quote-status` drena a fila automaticamente.

### Como verificar
- Painel: `/admin/v4-callbacks` (admin) — KPIs, banner de status e tabela de dead letters.
- Logs estruturados JSON no console da edge function:
  - `v4_callback_disabled` — secrets ausentes; contém `pending` (backlog).
  - `v4_callback_misconfigured` — URL inválida.
  - `v4_callback_sent` — envio OK.
  - `v4_callback_failed` — falha isolada, com `next_retry_at`.
  - `v4_callback_exhausted` — atingiu 5 tentativas; **alerta operacional**.

### Como reprocessar
- Painel `/admin/v4-callbacks`: selecione itens e use **Reprocessar** (agenda retry para agora) ou **Resetar tentativas** (zera contador). Também é possível **Arquivar** manualmente.
- Botão **Executar dispatcher** força uma rodada imediata.

---

## Quote → Sale (`fn_convert_quote_to_sale`)

### Realidade dupla das orders

Existem dois geradores de `orders` associados a um quote — quem cria depende
do status em que o quote entra:

| Status semeado | Trigger dispara? | Cria order | Prefixo | `orders_conversion_seq` |
|---|---|---|---|---|
| `draft`             | não | — | — | não avança |
| `approved`          | **sim** (`trg_convert_quote_to_order`) | order `PED-…` | `PED-` | não avança |
| `accepted` / `won`  | não | RPC cria via `nextval()` | `ORC-YYYYMMDD-NNNNNNNN` | **avança +1** |

Consequência prática:

- Toda RPC `fn_convert_quote_to_sale` sobre um quote **approved** cai no
  branch de **reuso** — devolve `reused_order: true` e o `order_number`
  original criado pelo trigger. A sequence não avança.
- A RPC só executa o path novo (ORC-) quando o quote nunca esteve
  approved ou quando o trigger falhou. Em uso normal isso é raro.

### Idempotência

Chamadas repetidas para o mesmo quote:

1. **1ª chamada** — cria/reusa a order, cria `sales`, marca quote como
   `converted`, grava `audit_logs`.
2. **2ª+ chamadas** — retornam imediatamente com `idempotent: true`,
   `order_id` e `order_number` da 1ª chamada. Zero writes adicionais.
   Nenhuma nova entrada em `audit_logs`.

### Auditoria

Cada conversão bem-sucedida grava exatamente 1 linha em `audit_logs` com:

```json
{
  "action": "convert_quote_to_sale",
  "entity_type": "quote",
  "entity_id": "<quote_id>",
  "actor_id": "<auth.uid()>",
  "metadata": {
    "quote_id":     "...",
    "sale_id":      "...",
    "order_id":     "...",
    "order_number": "PED-… | ORC-…",
    "total_value":  0,
    "item_count":   0,
    "reused_order": true|false
  }
}
```

O INSERT em `audit_logs` está envolto em `EXCEPTION WHEN OTHERS THEN NULL`
para nunca abortar a conversão — se o log falhar (por exemplo, migração
alterou o schema), a venda ainda é criada. Contudo, o spec
`tests/e2e/quote-to-sale-audit-log.spec.ts` garante que o log é gravado
corretamente nos 3 caminhos (reuso, criação, idempotente).

### Códigos de erro padronizados

Todos formato `[CODIGO] mensagem`, para o front parsear com regex:

- `[NOT_AUTHENTICATED]` — sem sessão válida.
- `[QUOTE_NOT_FOUND]` — id inexistente.
- `[FORBIDDEN]` — quote não pertence ao caller (não-admin).
- `[INVALID_STATUS]` — status ≠ approved/accepted/won.
- `[INVALID_TOTAL]` — total nulo ou negativo.
- `[EMPTY_ITEMS]` — quote sem itens.
- `[TOTAL_MISMATCH]` — soma dos itens diverge de `total_value` em mais de 0.02.

Em qualquer erro, **nada** é persistido: nem sale, nem order, nem avanço
de sequence.
