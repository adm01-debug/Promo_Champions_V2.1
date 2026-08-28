# Contenção de integridade — webhooks públicos

**Data:** 26 de agosto de 2026
**Escopo desta onda:** `inbound-email-webhook` e
`multichannel-status-webhook`, sem alteração remota, DDL, migration ou dado.

## Cenários tratados localmente

| Cenário | Contenção implementada | Limite explícito |
| --- | --- | --- |
| Callback multicanal atrasado (`delivered` após `read`) | O `UPDATE` de `outbound_messages` usa o status anterior como predicado atômico. Só há avanço `queued → sent → delivered → read`; `failed` só pode vir de `queued`/`sent`. | Não há ordenação pelo horário original do provedor, pois ele não é persistido na mensagem. |
| Dois callbacks `read` simultâneos ou replay | Apenas a requisição que efetivamente muda o status para `read` chama `record_engagement_signal`; as demais retornam `stale_or_replayed`. | Isso entrega **no máximo uma** abertura por transição. Uma falha entre o `UPDATE` e a RPC de engajamento ainda exige operação transacional no banco para oferecer exatamente uma vez. |
| Corpo excessivo antes da assinatura | Ambos os endpoints usam `readUtf8BodyWithinLimit` antes de qualquer autenticação criptográfica e respondem `413`. O teto é 256 KiB. | Não substitui rate limit de borda. |
| Lote SendGrid | Cada objeto autenticado é transformado, validado e persistido individualmente. A validação de todos os itens ocorre antes da primeira escrita; a resposta indica `processed`. | As operações remotas do lote não formam uma transação única. Uma falha depois de itens já processados retorna `500` para o provedor não considerar o lote concluído. |
| Evento de telemetria SendGrid | `delivered`, `open` e equivalentes são registrados como `other`; não são convertidos em `reply` nem pausam cadência. | A classificação segue os campos disponíveis no callback; novos tipos precisam de teste de contrato. |

## Bloqueio para deduplicação persistente

O schema versionado declara apenas um índice não único em
`outbound_messages(provider_message_id)` e nenhuma chave única de replay em
`inbound_reply_events(provider, message_id, event_type, received_at)`. Também
não há RPC versionada que una, na mesma transação, a mudança de status, o
registro de engajamento e a marcação de dedupe.

Não foi criada tabela, índice, coluna ou migration para preencher essa lacuna:
o catálogo do banco destino continua indisponível e a reconciliação de
migrations identificou divergência material entre repositório e origem. Antes
de uma solução de exatamente uma vez, é necessário confirmar o schema canônico
e aprovar explicitamente uma migration com chave idempotente e transação/RPC.

## Observação fora do contrato transacional

`receive-quote-sync` agora libera a reserva em `webhook_inbound_dedupe` quando
a busca ou o upsert subsequente falha, evitando que uma falha já conhecida
classifique o retry como duplicado. Ainda existe uma janela de queda entre a
operação dependente e a liberação da reserva. Fechá-la exige RPC/transação no
schema canônico, após a reconciliação.

## Evidência local

- `deno check` nos dois handlers e no módulo de integridade: aprovado.
- `deno test --allow-read --allow-env --allow-net` nos testes de limite de
  corpo, integridade e autenticação: 13 aprovados.
- Bundle direcionado (`ONLY=inbound-email-webhook,multichannel-status-webhook`):
  2/2 imports resolvidos.
- A validação de bundle da coleção completa deve ser executada pelo
  orquestrador junto das demais alterações concorrentes antes do commit.
