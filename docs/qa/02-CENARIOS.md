# 02 — Matriz de cenários por jornada

Cada cenário cruza **ator** × **estado do dado** × **entrada** × **condição**, e é
rastreado de ponta a ponta (interface → hook → chamada → backend → banco → resposta →
interface).

**Modo** diz como o cenário foi apurado:
- **EXECUTADO** — foi rodado de verdade (requisição, consulta ou comando) e o resultado
  abaixo é o que voltou.
- **RASTREADO** — o caminho foi seguido lendo o código que roda. Não é teste.

Nenhum cenário envolveu escrita em produção. Por isso, toda operação que grava dado
aparece como RASTREADO, exceto onde o próprio caminho de erro do servidor pôde ser
exercitado sem efeito colateral (ex.: webhook recusando requisição sem assinatura antes
de qualquer gravação).

**Convenção de ID:** `C-<jornada>-<nº>`. Cenário cujo "encontrado" difere do "esperado"
aponta o achado correspondente em `03-ACHADOS.md`.

---

## J1 — Acesso e identidade (anônimo → autenticado)

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J1-01 | anônimo | — | `GET /auth/v1/settings` | cadastro público fechado em CRM interno | `"disable_signup": false`, `"email": true`, `"mailer_autoconfirm": false` — **qualquer pessoa pode criar conta** | EXECUTADO | A-01 |
| C-J1-02 | anônimo que se cadastra | sem registro em `salespeople` | cadastro por e-mail | sem papel até um admin liberar | trigger `on_auth_user_created_role` grava `role='salesperson'` em `user_roles` (migration `20251214103344:86-103`) | RASTREADO | A-01 |
| C-J1-03 | anônimo | — | e-mail de domínio externo no cadastro | domínio restrito à empresa | nenhuma restrição de domínio em migrations, functions ou `src/` | RASTREADO | A-01 |
| C-J1-04 | anônimo | — | 30 tabelas sensíveis via PostgREST com a chave publishable | nenhuma linha | 27 × HTTP 200 com corpo `[]`; 3 × 42501 (grant revogado). **Nenhum vazamento** | EXECUTADO | — (ponto forte) |
| C-J1-05 | anônimo | — | mesmas 30 tabelas, olhando o *grant* e não só a RLS | grant negado nas sensíveis | só `login_attempts`, `audit_log` e `monthly_sales_summary` recusam por grant; as outras 27 dependem exclusivamente de RLS | EXECUTADO | A-04 |
| C-J1-06 | anônimo | — | 29 views via PostgREST | nenhuma view legível | `v_platform_slo` devolve 30 linhas (`content-range: 0-0/30`); as outras 14 com grant devolvem 0 linhas | EXECUTADO | A-05 |
| C-J1-07 | anônimo | — | RPCs privilegiadas (`fn_test_cleanup_dedupe_privileges`, `fn_admin_platform_slo`) | execução negada | 42501 `permission denied` nas duas | EXECUTADO | — (ponto forte) |
| C-J1-08 | usuário com 2 papéis em `user_roles` | duas linhas | login | papel de maior privilégio, de forma explícita | `.order('role').limit(1)` — **ordem alfabética**: `admin` > `manager` > `salesperson`. Funciona por acidente do alfabeto, não por regra | RASTREADO | A-19 |
| C-J1-09 | autenticado | consulta de papel falha/timeout | abrir rota protegida | negar (fail-closed) | `useUserRoles` devolve `null` e o guard nega — correto | RASTREADO | — (ponto forte) |
| C-J1-10 | `salesperson` | — | abrir URL de admin digitada à mão | negado + registro | `Navigate('/acesso-negado')` + insert em `access_denied_logs` (`ProtectedRoute.tsx:33-40`) | RASTREADO | — |

## J2 — Venda: fechar, reabrir, refechar (gera comissão)

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J2-01 | closer | venda em `negotiation` | status → `completed` | 1 linha em `commissions` | trigger insere (closer) + 1 linha do SDR se for ativação (`20261013130000:72-101`) | RASTREADO | — |
| C-J2-02 | closer/gestor | venda já `completed` | `completed` → `closed` → `negotiation` → `completed` | venda refecha; comissão recalculada ou mantida | **UPDATE abortado**: INSERT sem `ON CONFLICT` viola `commissions_sale_salesperson_key`; a máquina de estado (`20261001213000:28-29`) **permite** esse ciclo | RASTREADO | A-02 |
| C-J2-03 | closer | venda com categoria fora de toda regra ativa | status → `completed` | recusar ou alertar | grava **5% fixo** e `rule_id` NULL, sem aviso (`20261013130000:68`) | RASTREADO | A-03 |
| C-J2-04 | closer | `amount` nulo ou zero | status → `completed` | validação impede | comparação `NEW.amount >= COALESCE(min_amount,0)` com NULL não casa nenhuma regra → cai no fallback de 5% sobre NULL | RASTREADO | A-03 |
| C-J2-05 | parceiro externo (service_role) | — | webhook grava `status` inválido | máquina de estado recusa | `enforce_status_transition` **não se aplica** a service_role, por desenho declarado (`20261001213000:15-18,35-43`) | RASTREADO | A-20 |
| C-J2-06 | gestor | consulta de comissões falha (RLS/rede) | abrir `/admin/comissoes` | mensagem de erro | mostra *"Nenhuma comissão encontrada para os critérios selecionados"* — erro vira lista vazia | RASTREADO | A-06 |
| C-J2-07 | qualquer | 957 vendas / 944 comissões | abrir lista | página paginada | a apurar por página — ver `01-INVENTARIO.md` | RASTREADO | — |

## J3 — Premiações e bônus (dinheiro)

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J3-01 | admin | nova premiação | `trigger_condition` com chave errada (`{"milestone": 50000}` em vez de `milestone_amount`) | premiação inválida ou nunca atingida | `evaluateBonus` cai no fallback `achieved: true` (`useEligibleBonuses.ts:99-100`) e `useAutoAwardBonuses` registra o prêmio **para todo vendedor que abrir o painel**; a RPC `award_bonus_if_eligible` **não revalida a condição** (`20261027210000:306-367`) | RASTREADO | A-07 |
| C-J3-02 | admin | premiação `{"rank_top": 3}` | vendedor é 1º do mês | prêmio registrado | `monthlyRank` é literal `null` em produção (`useEligibleBonuses.ts:154`) → **nunca** atinge | RASTREADO | A-08 |
| C-J3-03 | admin | premiação com `{}` | qualquer vendedor abre o dashboard | nada acontece | fallback permissivo registra o prêmio no valor cheio | RASTREADO | A-07 |
| C-J3-04 | admin | prêmio já concedido no mês | vendedor reabre o painel | sem duplicata | idempotência por `(bonus_id, salesperson_id, period_month)` na RPC — correto | RASTREADO | — (ponto forte) |
| C-J3-05 | admin | registro de prêmio | clique no botão de cancelar | confirmação antes | cancela sem confirmar; o botão vizinho de exclusão definitiva usa ícone de "check" girado 45°, sem `aria-label` (`AdminAuditoriaPremiacoes.tsx:579-602`) | RASTREADO | A-09 |
| C-J3-06 | vendedor | — | girar a roleta de prêmios | prêmio decidido no servidor | `spin_prize_wheel` decide, bloqueia saldo e registra em transação; faixas do banco (`20261014000000:201-217`) **idênticas** às do cliente (`usePrizeWheel.ts:22-30`) | RASTREADO | — (ponto forte) |
| C-J3-07 | vendedor | duplo clique na roleta | mesma tentativa reenviada | um único giro | `p_request_id` estável por tentativa (`usePrizeWheel.ts:~62`) + idempotência no banco | RASTREADO | — (ponto forte) |

## J4 — Relatório público por link (embed)

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J4-01 | anônimo | sem token | `GET /functions/v1/report-embed-public` | 400 | 400 `{"error":"Token inválido"}` | EXECUTADO | — |
| C-J4-02 | anônimo | token inexistente de 36 chars + `Origin` hostil | GET | 404 e nada vazado | 404 `{"error":"Token não encontrado"}`, com `Cache-Control: no-store` e `Vary: X-Embed-Token, Origin` | EXECUTADO | — (ponto forte) |
| C-J4-03 | anônimo com token válido | `allowed_origins` configurado com um domínio | requisição de outro domínio, por `curl` | acesso recusado | **dados entregues**: o GET nunca rejeita por origem; `allowed_origins` só escolhe o header CORS (`report-embed-public/index.ts:70-74`), que apenas um navegador respeitaria | RASTREADO | A-10 |
| C-J4-04 | anônimo com token válido | `allowed_origins` vazio | qualquer origem | restrito | `pickCorsOrigin` devolve `"*"` | RASTREADO | A-10 |
| C-J4-05 | anônimo | token válido | 100 requisições em 1 min | limite de 60/min aplicado | limite vive em `new Map()` na memória do isolate (`:52-67`): cada instância tem o seu e perde o estado no cold start | RASTREADO | A-11 |
| C-J4-06 | anônimo | token válido | link aberto em site de terceiro | token não vaza | o front envia o token **também na query string** (`useEmbeddedReportPreview.ts`), e o próprio comentário diz que é transitório até o deploy das functions ser confirmado | RASTREADO | A-12 |
| C-J4-07 | anônimo | token válido, dois acessos simultâneos | GET × 2 | `view_count` +2 | read-modify-write fire-and-forget (`:~300`): uma das contagens é perdida | RASTREADO | A-13 |
| C-J4-08 | anônimo | token revogado / expirado | GET | 403 | 403 `Token revogado` / `Token expirado` — tratado | RASTREADO | — (ponto forte) |
| C-J4-09 | anônimo | relatório com coluna sensível | GET | colunas ocultas | `HIDDEN_FIELDS` (email, commission, commission_rate, phone, personal_email) e allowlist de entidades; **nunca** usa `select('*')` | RASTREADO | — (ponto forte) |

## J5 — Integrações de entrada (webhooks)

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J5-01 | anônimo | — | POST `{}` sem assinatura em `inbound-email-webhook` | 401 | 401 `signature_missing` | EXECUTADO | — (ponto forte) |
| C-J5-02 | anônimo | — | idem em `whatsapp-inbound-webhook` | 401 | 401 `signature_missing` | EXECUTADO | — (ponto forte) |
| C-J5-03 | anônimo | — | idem em `multichannel-status-webhook` | 401 | 401 `signature_missing` | EXECUTADO | — (ponto forte) |
| C-J5-04 | anônimo | — | idem em `receive-quote-sync` | 401 | 401 `missing_signature` | EXECUTADO | — (ponto forte) |
| C-J5-05 | parceiro gift_store | — | POST em `receive-quote-webhook` | cotação aceita | **500** `{"error":"Server misconfigured: missing QUOTE_SYNC_API_KEY"}` — segredo ausente em produção | EXECUTADO | A-14 |
| C-J5-06 | provedor | mesmo evento entregue 2× | reenvio | segunda entrega ignorada | reserva em `public.webhook_inbound_dedupe` serializa o replay antes da escrita | RASTREADO | — (ponto forte) |
| C-J5-07 | atacante | — | dois esquemas de assinatura no mesmo request | recusar | 401 `ambiguous_signature` (`_shared/webhook-auth.ts:387`) | RASTREADO | — (ponto forte) |
| C-J5-08 | provedor | segredo não configurado | POST assinado | recusar, não aceitar | 503 `webhook_not_configured` — fail-closed (`:391,403,416`) | RASTREADO | — (ponto forte) |
| C-J5-09 | anônimo | — | POST `{}` em `log-web-vitals` (público por desenho) | descartar | 200 `{"inserted":0}` — validação estrita descarta tudo | EXECUTADO | — (ponto forte) |

## J6 — Plataforma: deploy, cron e migrations

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J6-01 | — | 171 funções no repo | `OPTIONS` em cada uma | todas publicadas | 167×200, 1×204, 1×400, 2×401 — **todas publicadas**. Controle negativo (nome inexistente) devolveu 404, validando o método | EXECUTADO | — (refuta alerta do snapshot) |
| C-J6-02 | — | — | `GET /functions/v1/health` | versão do código no ar | `{"status":"ok","version":"dev",...}` | EXECUTADO | A-15 |
| C-J6-03 | agente/dev | maior migration em `main` é `20261125110000` | criar migration hoje (23/11) com timestamp real | gate aprova | **rejeitada**: `check-migrations.mjs:157-160` exige versão estritamente maior que a da base | EXECUTADO | A-16 |
| C-J6-04 | — | PR com `migrations-gate` vermelho | tentar merge | bloqueado | **liberado**: o único check obrigatório é `CI Gate`, que depende apenas de `lint-and-typecheck`, `test`, `build`, `instrucoes-agentes` | EXECUTADO (ruleset 22148182) | A-17 |
| C-J6-05 | — | job obrigatório **cancelado** | avaliar `CI Gate` | bloquear | `grep -c '"result": "failure"'` não conta `cancelled` → gate verde | RASTREADO | A-18 |
| C-J6-06 | — | 32 cron jobs | 7 dias de execução | sem falhas | 0 falhas em 24 h; 1 falha isolada em 7 d (taxa 0%); nenhuma hora parada | SNAPSHOT 2026-11-12 | — (ponto forte) |
| C-J6-07 | — | histórico de cron | crescimento | retenção aplicada | 229.106 linhas / 60,9 MB, 206.142 com mais de 7 dias; `DELETE` impossível (`42501: must be owner of table job_run_details`) | SNAPSHOT + migration `20261125100000:18` | A-21 |
| C-J6-08 | anônimo | — | headers de produção | CSP que limite script | CSP = apenas `frame-ancestors 'self'`; sem `default-src`/`script-src`; sem `Permissions-Policy` | EXECUTADO | A-22 |
| C-J6-09 | anônimo | — | arquivo inexistente em cada bucket | buckets privados | só `avatars` é público ("Object not found"); os outros 5 devolvem "Bucket not found" | EXECUTADO | A-23 |
| C-J6-10 | — | dependências de produção | `npm audit --omit=dev` | 0 vulnerabilidades | `found 0 vulnerabilities` (também com dev) | EXECUTADO | — (ponto forte) |
| C-J6-11 | — | arquivos versionados | scanner de service_role | nenhum segredo | "Nenhuma credencial de serviço literal foi encontrada" | EXECUTADO | — (ponto forte) |

## J7 — Comissão: do fechamento ao pagamento

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J7-01 | closer | regra de comissão cadastrada para a categoria | fecha venda | tela e banco mostram o mesmo valor | tela usa `salespeople.commission_rate` (padrão 10%), banco usa `commission_rules.percentage` (padrão 5%) | RASTREADO | A-122 |
| C-J7-02 | gestor | taxa de 10% | abre `/roi` | custo de comissão = 10% da receita | **10× a receita** (`useROIDashboard.ts:98` não divide por 100) | RASTREADO | A-123 |
| C-J7-03 | gestor | taxa configurada no mês em `AdminComercial` | consulta a comissão | taxa do mês aplicada | `salesperson_commission_configs` **não é lida por ninguém** | RASTREADO | A-122 |
| C-J7-04 | closer | venda com `amount` nulo | fecha venda | recusa ou alerta | nenhuma regra casa → fallback de 5% sobre nulo | RASTREADO | A-03 |
| C-J7-05 | gestor | comissão em `paid` | reabre a venda e refecha | comissão paga preservada | o `INSERT` sem `ON CONFLICT` aborta o UPDATE (23505) | RASTREADO | A-02, A-128 |
| C-J7-06 | gestor | venda cancelada com comissão pendente | cancela a venda | comissão revista ou sinalizada | nada reavalia; segue "pendente de aprovação" | RASTREADO | A-129 |
| C-J7-07 | gestor | venda excluída logicamente | consulta meta e ranking | valor sai dos dois | consumidores leem a tabela direto, sem `deleted_at IS NULL` | RASTREADO | A-130 |
| C-J7-08 | SDR | cliente cuja única venda anterior foi excluída | nova venda | conta como ativação | `check_is_first_activation` considera a excluída → SDR perde a comissão | RASTREADO | A-130 |
| C-J7-09 | vendedor | comissão cancelada na lista | abre `/comissoes` | total exclui canceladas | o "Total Geral" soma todas | RASTREADO | A-140 |
| C-J7-10 | gestor | consulta falha | abre `/admin/comissoes` | erro visível | *"Nenhuma comissão encontrada…"* | RASTREADO | A-06 |
| C-J7-11 | gestor | comissão sem nome de vendedor no vínculo | abre a lista com busca vazia | a linha aparece | a linha **desaparece** (predicado devolve `undefined`) | RASTREADO | A-80 |
| C-J7-12 | — | 944 comissões | qualquer consulta | abaixo do teto de 1000 linhas | 944 — a 6% do corte do PostgREST | SNAPSHOT | A-24 |

## J8 — Pipeline: mover o negócio

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J8-01 | vendedor | pipeline padrão | arrasta card entre estágios | card move e o quadro responde na hora | a atualização otimista **nunca executa** (chave de cache não casa) | RASTREADO | A-85 |
| C-J8-02 | vendedor | rede caindo no meio | arrasta card | card volta e avisa o erro | o `onError` grava numa chave que ninguém observa; o quadro fica num estado que não é nem o antigo nem o novo | RASTREADO | A-85 |
| C-J8-03 | vendedor | pipeline de Pós-Venda, Renovações ou Parcerias | arrasta card | card move | "Erro ao mover deal" em toda tentativa | RASTREADO | A-134 |
| C-J8-04 | vendedor | — | arrasta card para "Arquivado" | negócio arquivado, sem receita | **registra venda ganha**, cria comissão e credita XP | RASTREADO | A-124 |
| C-J8-05 | qualquer autenticado | existe workflow ativo com `update_stage` | invoca `execute-workflow` com `sale_id` de outro | recusa | **move qualquer negócio** (`service_role` + id do corpo) | RASTREADO | A-30 |
| C-J8-06 | conta recém-criada (sem registro em `salespeople`) | idem | idem | recusa | `update_stage` **não exige** `callerSalespersonId` → funciona | RASTREADO | A-01 + A-30 |
| C-J8-07 | parceiro (service_role) | — | webhook grava transição inválida | máquina de estados recusa | `enforce_status_transition` não se aplica a `service_role` | RASTREADO | A-20 |

## J9 — Cotação: entrada, conversão e expiração

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J9-01 | parceiro | cotação expirada | envia evento | vira perdida/encerrada | cai no status que o banco entende como **ganho** → receita e comissão | RASTREADO | A-125 |
| C-J9-02 | parceiro | cotação editada para rascunho | envia evento | venda ganha preservada | pode **rebaixar** a venda a "lead", com a comissão criada pendente | RASTREADO | A-125 |
| C-J9-03 | closer | cotação com venda vinculada | muda o status | orçamento e venda mudam juntos, ou nenhum | duas escritas sem transação: orçamento muda, venda não, e o cache não é invalidado | RASTREADO | A-87 |
| C-J9-04 | closer | cotação aprovada | converte em venda | conversão atômica | `fn_convert_quote_to_sale` é transacional e invalida 5 chaves — **correto** | RASTREADO | — (ponto forte) |
| C-J9-05 | integração | status fora do vocabulário | grava em `quotes.status` | recusa | `text` sem CHECK → aceita; a cotação desaparece dos filtros e dos indicadores | RASTREADO | A-126 |
| C-J9-06 | parceiro gift_store | — | POST em `receive-quote-webhook` | cotação aceita | **500** por `QUOTE_SYNC_API_KEY` ausente | EXECUTADO | A-14 |
| C-J9-07 | parceiro | mesmo evento duas vezes | reenvio | segunda ignorada | `receive-quote-sync` reserva no dedupe antes de escrever — correto; mas `webhook_inbound_dedupe` tem **0 linhas** com 364 no log de entrada | SNAPSHOT | A-120 |
| C-J9-08 | — | cotação convertida em pedido | conversão | total do pedido = total da cotação | `quotes.total_value` é `numeric` livre e entra em `orders.total` `numeric(12,2)` → arredondamento implícito | RASTREADO | A-49 |

## J10 — Premiação: do cadastro ao pagamento

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J10-01 | admin | `trigger_condition` com chave errada | vendedor abre o painel | nada é concedido | **prêmio registrado no valor cheio para todo vendedor** | RASTREADO | A-07 |
| C-J10-02 | admin | `{"rank_top": 3}` | vendedor é 1º | prêmio concedido | `monthlyRank` é `null` fixo → nunca atinge | RASTREADO | A-08 |
| C-J10-03 | admin | bônus de 5% (percentual) | concessão | 5% sobre a base, em reais | grava **R$ 5,00**; o total da tela soma reais com percentuais | RASTREADO | A-139 |
| C-J10-04 | admin | registro de prêmio | clica no botão ao lado de cancelar | confirmação clara | dois botões sem rótulo; o de excluir usa um "check" girado 45° | RASTREADO | A-09 |
| C-J10-05 | vendedor | consulta de vendas do mês falha | abre o painel | erro visível | `mtdRevenue` = 0 → nenhuma premiação por marco atingida, sem aviso | RASTREADO | A-86 |
| C-J10-06 | admin | mesmo prêmio, mesmo mês | vendedor reabre o painel | sem duplicata | idempotência por `(bonus_id, salesperson_id, period_month)` — **correta** | RASTREADO | — (ponto forte) |
| C-J10-07 | vendedor | — | chama as RPCs de XP/sequência/meta diretamente | recusa | executáveis por `authenticated` → pode inflar os próprios números | RASTREADO | A-137 |

## J11 — Operação e observabilidade

| ID | Ator | Estado | Entrada / Condição | Esperado | Encontrado | Modo | Achado |
|---|---|---|---|---|---|---|---|
| C-J11-01 | — | edge function devolve 404/500 ao cron | execução do job | job marcado como falho e alerta | `pg_net` é assíncrono → job sempre `succeeded`; o alertador olha só `job_run_details` | RASTREADO | A-104 |
| C-J11-02 | — | `wal-health-alert-5min`, 2016 execuções em 7 d | monitorar | falhas visíveis | `falhas_7d = 0` em todos os 10 jobs que passam por `trigger_internal_edge_job` | SNAPSHOT | A-104 |
| C-J11-03 | usuário | erro de JavaScript em produção | ocorre o erro | equipe notificada | nenhum destino ativo (Sentry sem variável; `error_logs` sem leitor que alerte) — e a tela **afirma** que a equipe foi notificada | RASTREADO | A-149 |
| C-J11-04 | operador | callback V4 com `attempts >= 5` | clica em "Reprocessar" | evento reenviado | grava só `next_retry_at`; o despachante filtra `attempts < 5` → **nada é reenviado**, e a tela diz que foi | RASTREADO | A-105 |
| C-J11-05 | — | 32 crons ativos | 7 dias | saúde real visível | 0 falhas em 24 h e 1 falha isolada em 7 d — mas ver C-J11-01: o indicador não mede o que parece | SNAPSHOT | A-104 |
| C-J11-06 | — | banco de 243 MB | crescimento | histórico com retenção | `cron.job_run_details` com 60,9 MB (25% do banco), 206.142 linhas acima de 7 dias, e `DELETE` recusado pelo Postgres gerenciado | SNAPSHOT | A-21, A-150 |
| C-J11-07 | — | release mergeada | tag `v*` criada automaticamente | deploy aguarda aprovação humana | `protection_rules: []` → aplica DDL e republica 171 funções sem ninguém autorizar | EXECUTADO | A-55 |
| C-J11-08 | — | PR com migration inválida | abre PR | `CI Gate` bloqueia | `migrations-gate` não está no `needs` do gate | EXECUTADO | A-17 |
| C-J11-09 | — | disparo manual do `pr-checks` em branch de código | executa | lint, testes e build rodam | **todos pulados** e `CI Gate: success` (run 44931311890) | EXECUTADO | A-24, A-18 |
| C-J11-10 | — | job obrigatório cancelado | avalia o gate | bloqueia | `grep -c '"result": "failure"'` não conta `cancelled` → verde | RASTREADO | A-18 |
| C-J11-11 | agente/dev | precisa alterar o banco hoje | cria migration com data real | gate aprova | rejeitada: a maior versão em `main` é de 25/11 | EXECUTADO | A-16 |
| C-J11-12 | — | banco precisa ser reconstruído | restaura de `schema.sql` | schema atual | 19 migrations atrás, e devolve um CHECK que causa erro 23514 em todo claim | RASTREADO | A-46 |

## Cobertura da matriz

| Dimensão | Como foi coberta |
|---|---|
| **Ator** | anônimo, conta recém-criada, vendedor (`salesperson`), SDR, Closer, gestor (`manager`), admin, parceiro externo (service_role), cron, operador |
| **Estado do dado** | vazio (`webhook_inbound_dedupe` com 0 linhas), um registro, muitos (30.840 em `audit_logs`), no limite (957 vendas contra o teto de 1000), inválido (status fora do vocabulário), duplicado (reenvio de webhook), já excluído (exclusão lógica em meta e ativação) |
| **Entrada** | válida, vazia (`{}` nos webhooks), malformada (CSV com vírgula entre aspas), com caractere especial (`_` em e-mail no `ilike`), no valor de borda (venda com 0, cotação expirada), identificador de terceiro (todos os cenários de IDOR) |
| **Condição** | duplo clique (roleta, com chave de idempotência), duas abas (tempo real), dois usuários ao mesmo tempo (contador de visualizações, trava otimista em `quotes`), rede caindo no meio (atualização otimista), sessão expirada (consulta de papel → fail-closed), terceiro fora do ar (reenvio ausente no webhook de saída), reenvio (dedupe), passos fora de ordem (reabrir e refechar venda) |

**Totais:** 11 jornadas, **99 cenários**, dos quais **28 com execução real** (25 marcados
EXECUTADO e 3 EXECUTADO + RASTREADO — requisição, consulta ou comando rodado, com o resultado
registrado), **66 RASTREADOS** (caminho seguido no código que roda) e **5 por SNAPSHOT**
(medição de 2026-11-12, não ao vivo).

**O que não foi simulado, e por quê:** nenhum cenário que exigisse **escrita** em produção
(criar usuário, inserir venda, disparar e-mail, aplicar DDL). Por isso todos os cenários de
IDOR e de ciclo de vida de venda são RASTREADOS: comprová-los exigiria um JWT de usuário real
e uma gravação. As etapas 002, 087, 153, 163, 168, 188, 206, 218 e 225 do plano existem
justamente para fechar essas lacunas com acesso adequado.
