# Matriz forense dos bancos e contratos de integração

**Data de fechamento:** 26 de agosto de 2026
**Escopo:** catálogo da origem em leitura, contrato estático do repositório e
tentativa de catálogo do destino em leitura.
**Regra aplicada:** nenhuma tabela, coluna, constraint, índice, policy, função,
trigger, view, enum, extensão, privilégio, job, migration, bucket ou dado remoto
foi criado, alterado, executado, apagado ou sincronizado.

## Veredito

Não é seguro copiar, apagar, renomear, aplicar migrations ou alinhar os dois
bancos neste momento. A origem tem um domínio predominantemente de catálogo,
fornecedores, estoque e orçamento; o contrato versionado do repositório é
predominantemente de CRM, cadências, gamificação e inteligência comercial.

Além disso, o catálogo vivo do destino não pôde ser lido. Os dois endpoints MCP
fornecidos para origem e destino são literalmente iguais, e o gateway destinado
ao ambiente de destino falha antes de executar qualquer SELECT. Portanto,
ausência no destino nunca foi inferida a partir desse erro: a classificação
correta é **não observável**.

Há sete falhas estruturais confirmadas na origem, mas toda correção remota
permanece dependente de autorização explícita do responsável e de uma janela de
mudança. Os candidatos vazios, sem ligação estática ou pouco usados foram
preservados como candidatos de investigação, não como lixo.

## Cadeia de evidência e limites

| Superfície | Evidência obtida | Limite |
| --- | --- | --- |
| Origem informada: rapjswienfhkobhlamxb | Conector de leitura com current_user igual a supabase_read_only_user, PostgreSQL 17.6 e catálogo PostgreSQL completo | O conector não expõe o project ref; a associação ao ref decorre da URL/rotulagem fornecida |
| Destino informado: usyxfpqlsspldubptrdl | Metadados locais temporários apontam para o ref; tentativa de gerar tipos pelo CLI falhou por privilégio de conta | MCP sem exec_sql/token da Management API; não foi possível provar identidade nem ler o catálogo vivo |
| Repositório | supabase/config.toml aponta para a origem; supabase/.temp/project-ref e pooler temporário apontam para o destino; tipos gerados e migrations foram analisados | Arquivos .temp não substituem catálogo nem são fonte de verdade de schema |

O bloqueio do destino apareceu de forma consistente nos leitores de identidade,
schemas, tabelas, colunas, constraints, índices, RLS, policies, funções,
triggers, views, enums, extensões, privilégios, jobs e migrations:

> A função interna exec_sql não existe no projeto, ou falta
> SUPABASE_ACCESS_TOKEN para a Management API.

Criar essa função para destravar a análise seria uma alteração remota com uma
superfície de escrita genérica. Não foi feito. O desbloqueio seguro é um MCP
inequivocamente ligado ao destino, com token de Management API de leitura ou
catálogo SQL somente leitura.

## Simulação de falhas antes de qualquer mudança

| Cenário previsto | Falha provável | Barreira aplicada |
| --- | --- | --- |
| MCP roteado ao projeto errado | Migração de CRM aplicada no catálogo, ou cópia de catálogo aplicada no CRM | Nenhum DDL/DML; exigir fingerprint do destino |
| Reproduzir as 594 migrations locais | Colisões de versão, replays incompletos, DROP/DELETE históricos e perda de rastreabilidade | Ledger e DDL normalizado antes de qualquer baseline |
| Apagar tabela vazia ou sem .from() | Quebra de job, trigger, cliente externo, partição futura ou integração dinâmica | Classificar como candidato; nenhuma exclusão |
| Regenerar tipos a partir da origem | Contrato CRM inteiro trocado por contrato de catálogo e falhas massivas de runtime | Tipos por ambiente, em arquivos/ref separados |
| Ligar o job de webhook imediatamente | Reprocessamento de backlog ou entregas duplicadas | Inspecionar outbox, idempotência e destino antes de ativar |
| Corrigir trigger direto em produção | Duplicação de histórico/evento ou quebra de consumidores não mapeados | Migration aditiva, teste em staging e rollback |
| Habilitar RLS na partição futura sem teste | Jobs legítimos passam a falhar; manter como risco de segurança latente | Matriz de papéis e smoke por operação antes do deploy |
| Criar os 25 índices candidatos | Mais custo de escrita/armazenamento sem ganho mensurável | EXPLAIN ANALYZE e workload real antes de cada índice |
| Equalizar o enum app_role | Login/autorização podem aceitar ou negar papéis errados | ADR de papéis e teste de autorização por papel |
| Tratar idx_scan igual a zero como lixo | Remoção de índice sazonal ou após reset estatístico desconhecido | Proibida remoção sem janela estatística confiável |
| Criar buckets ausentes no destino automaticamente | Objetos públicos/privados e policies divergentes | Especificar ACL, retenção e dono antes de provisionar |

## Inventário da origem

O inventário abaixo separa schemas de negócio e schemas gerenciados.
pg_catalog e information_schema foram deliberadamente omitidos da tabela por
serem internos do PostgreSQL; não foram tratados como objetos do produto.

| Schema | Tabelas/partições | Colunas | Views | MVs | Funções | Triggers | Policies | Enums | Natureza |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| analytics | 0 | 94 | 0 | 7 | 0 | 0 | 0 | 0 | analítico |
| auth | 23 | 240 | 0 | 0 | 4 | 1 | 0 | 9 | Supabase |
| cf_recon | 6 | 98 | 7 | 0 | 0 | 0 | 6 | 0 | negócio/auditoria |
| classification_audit | 1 | 34 | 2 | 0 | 5 | 0 | 0 | 0 | auditoria |
| cron | 2 | 19 | 0 | 0 | 7 | 1 | 2 | 0 | extensão |
| extensions | 1 | 71 | 4 | 0 | 175 | 0 | 0 | 0 | extensão |
| graphql e graphql_public | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 | plataforma |
| internal | 0 | 7 | 0 | 1 | 0 | 0 | 0 | 0 | interno |
| net | 2 | 14 | 0 | 0 | 12 | 0 | 0 | 1 | extensão |
| pgbouncer | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | plataforma |
| pgmq | 1 | 4 | 0 | 0 | 40 | 0 | 0 | 0 | extensão |
| prod_audit | 5 | 71 | 1 | 0 | 6 | 0 | 0 | 0 | auditoria |
| public | 391 | 7.723 | 192 | 4 | 1.280 | 385 | 927 | 15 | aplicação |
| realtime | 10 | 83 | 0 | 0 | 15 | 1 | 0 | 2 | Supabase |
| storage | 8 | 71 | 0 | 0 | 17 | 4 | 52 | 1 | Supabase |
| supabase_functions | 2 | 7 | 0 | 0 | 1 | 0 | 0 | 0 | Supabase |
| supabase_migrations | 1 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | Supabase |
| supplier_stricker | 17 | 388 | 4 | 0 | 4 | 5 | 0 | 0 | integração/fornecedor |
| vault | 1 | 17 | 1 | 0 | 5 | 0 | 0 | 0 | Supabase |

### Estrutura e saúde mecânica de public

| Categoria | Estado medido |
| --- | --- |
| Tabelas/partições | 391 |
| Colunas de tabelas/partições | 5.086: 2.057 NOT NULL, 2.025 com default, 8 identity e 24 generated |
| Colunas de views/MVs | 2.637; total public de 7.723 |
| Views/MVs | 192 / 4; as quatro MVs públicas estão populadas |
| Constraints | 1.324: 391 PK, 396 FK, 190 UNIQUE, 347 CHECK |
| Constraints não validadas | nenhuma em public; a única fora de pg_* é gerenciada, em realtime |
| Índices | 1.170: 632 únicos, 152 parciais, 7 de expressão; nenhum inválido, not-ready ou duplicado exato |
| Sequências | 23 |
| RLS | 390 de 391 relações com RLS |
| Policies | 927: 118 ALL, 150 DELETE, 187 INSERT, 326 SELECT, 146 UPDATE |
| Funções | 1.280 overloads, 1.273 nomes únicos; 530 SECURITY DEFINER |
| Triggers | 385 não internos, todos habilitados |
| Enums | 15 tipos, 90 valores |
| Extensões | 16 |
| Jobs pg_cron | 137: 135 ativos e 2 inativos |
| Ledger de migrations | 2.354 versões distintas |

Extensões instaladas: http, hypopg, index_advisor, moddatetime, pg_cron,
pg_graphql, pg_net, pg_stat_statements, pg_trgm, pgcrypto, pgmq, plpgsql,
supabase_vault, unaccent, uuid-ossp e wrappers. O histórico local pede ainda
vector; a origem não o tem instalado. Isso é diferença a investigar, não
autorização para instalar.

## RLS, policies, views e privilégios

### Achados confirmados

1. supplier_products_raw_history_p2026_11 é uma partição futura vazia com RLS
   desabilitado, zero policies e privilégios diretos amplos para authenticated,
   incluindo SELECT/INSERT/UPDATE/DELETE/TRIGGER/REFERENCES/MAINTAIN. As
   partições de setembro e outubro têm RLS e duas policies. É uma perda real de
   hardening, ainda latente.
2. anon_catalog_grant_audit_log tem RLS e nenhuma policy local. Apesar de
   grants, o efeito para os papéis usuais é deny-by-default; o desenho parece
   ser um log de auditoria escrito por privilegiado, não uma tabela incompleta.
3. magazine_public_view_events_2026_11 é partição futura, com RLS e sem
   policy/grant próprio. É candidato a comportamento de herança/deny padrão,
   não defeito automático.
4. Existem 48 policies SELECT anônimas com predicado literalmente verdadeiro;
   não foi encontrada policy anônima incondicional de INSERT, UPDATE, DELETE ou
   ALL. As políticas anônimas de leitura se concentram em catálogo/referência.

### Privilégios efetivos e superfície a revisar

RLS continua sendo o controle decisivo para as relações protegidas; grants de
tabela não equivalem, por si, a acesso à linha. Ainda assim, os grants merecem
governança:

| Objeto/role | anon | authenticated | service_role |
| --- | ---: | ---: | ---: |
| Tabelas com SELECT direto | 42 | 363 | 391 |
| Tabelas com INSERT direto | 231 | 341 | 391 |
| Tabelas com UPDATE direto | 229 | 337 | 391 |
| Tabelas com DELETE direto | 229 | 336 | 391 |
| Tabelas com MAINTAIN direto | 304 | 367 | 391 |
| Views/MVs com SELECT direto | 14 | 69 | 196 |
| Sequências com SELECT/UPDATE/USAGE | 23 | 23 | 23 |
| Funções com EXECUTE efetivo | 356 | 712 | 1.280 |

Há também EXECUTE por PUBLIC em 81 rotinas. Dez funções SECURITY DEFINER são
efetivamente executáveis por anon; todas possuem search_path fixo:

- check_login_rate_limit
- fn_check_login_allowed
- fn_global_search
- fn_product_active_for_rls
- fn_super_filtro
- fn_super_filtro_facets
- fn_super_filtro_price_range
- get_catalog_bestseller_page
- get_quote_token_by_value
- submit_quote_response

As nove views públicas sem security_invoker são v_kit_component_media_public,
v_kit_component_print_areas_public, v_product_compositions_public,
v_product_properties_public, v_product_tags_public, v_products_public,
v_suppliers_public, v_tabela_preco_gravacao_oficial_public e
v_variant_sale_prices_public. São projeções deliberadas de catálogo; devem ser
revisadas por minimização de dados, não removidas automaticamente.

## Falhas reais confirmadas na origem

| Prioridade | Evidência | Consequência | Correção segura futura |
| --- | --- | --- | --- |
| P0 | fn_check_login_allowed(text,text,text,text) é SECURITY DEFINER, executável por anon, e em EXCEPTION WHEN OTHERS devolve allowed igual a true | Falha de segurança abre o caminho de login e expõe detalhes de erro | Implementar fail-closed, testar rate limit e não revelar erro interno |
| P1 | trg_log_price_change está ativo em product_variants, mas fn_log_price_change() só executa RETURN NEW | Histórico automático de preço não é gravado; nenhuma função menciona price_history | Definir evento/campos/idempotência e testar contra os 212 registros existentes |
| P1 | trg_dispatch_webhook_kit_share chama dispatch_quote_webhook_event() em kit_share_tokens | A rotina lê sete campos de quote inexistentes na tabela, captura o erro e retorna sucesso; outbox não recebe evento | Criar handler específico ou corrigir vínculo, com teste de entrega e rollback |
| P1 | process-webhook-outbox está inativo e nunca executou | Mesmo um evento válido da outbox não é processado automaticamente | Inspecionar backlog/destino/idempotência antes de ativar |
| P1 | validate_status_fields() declara os branches de kit_share_tokens e quote_approval_tokens removidos, mas ambas as tabelas e triggers existem | Os dois triggers ativos só retornam NEW; não há CHECK de status | Restaurar validação/constraint em migration aditiva após definir estados válidos |
| P1 | Job ativo vacuum-high-dead-tuples falhou em 23/08/2026: VACUUM cannot run inside a transaction block | Manutenção não ocorre nesse job | Separar os VACUUMs segundo contrato de pg_cron, testar fora de transação |
| P2 | Job inativo pipeline-classify-categories referencia fn_pipeline_classify_pending_products(50), que não existe | Módulo de classificação está estruturalmente incompleto | Decidir se o módulo será restaurado ou oficialmente descontinuado |

No webhook de kit, os campos incompatíveis comprovados são quote_number,
client_id, client_company, subtotal, total, discount_percent e valid_until.

## Jobs, índices, enums e objetos sem ligação comprovada

Dos 137 jobs, 133 têm última execução bem-sucedida; smoke_tests_monthly ainda
não possui execução observável, dois estão inativos e o job 297 falhou. Os dois
inativos são process-webhook-outbox (202) e pipeline-classify-categories (274).
Não há evidência para chamar os demais jobs de lixo. As quatro MVs públicas
possuem jobs de refresh ativos: mv_ema_kpi_by_level, mv_product_images_audit,
mv_stock_rupture_alert e mv_supplier_reliability.

Há 25 FKs sem índice cuja liderança cubra as colunas da FK. São candidatos de
performance, não defeitos comprovados:

- asia_image_import_queue.variant_id
- categories.parent_id
- inbound_webhook_events.endpoint_id
- magazine_public_reactions.item_id
- magazines.owner_id
- markup_configurations.category_id e markup_configurations.variant_id
- price_history.variant_id
- product_images.canonical_image_id, product_images.color_id e product_images.variant_id
- product_novelties.product_id e product_novelties.supplier_id
- products.padronizacao_id
- produtos_padronizacao.product_id
- produtos_padronizacao_variantes.color_id_2, pad_id e raw_id
- quote_history.quote_id
- supplier_colors.color_variation_id
- supplier_products_raw.product_id e variant_id
- suppliers.organization_id
- tabela_preco_gravacao_oficial.grupo_tecnica
- webhook_dispatcher_log.quote_id

Existem 159 índices não únicos com idx_scan igual a zero, ocupando cerca de
68,4 MiB, mas stats_reset está nulo. A janela de observação é desconhecida e
nenhum índice foi classificado como descartável.

Cinco enums públicos não são usados por coluna nem assinatura de rotina:
categoria_cor_enum, familia_cor_enum, payment_status, silver_norm_status e
tipo_cor_enum. Podem ser roadmap, casts externos ou legado; não devem ser
removidos.

## Contrato local versus origem

O arquivo src/integrations/supabase/types.ts tem 378 tabelas, 27 views, 184
funções, 25 enums e 809 entradas de relacionamento, correspondentes a 351
nomes de FK distintos. É um snapshot de contrato, não uma prova do banco vivo
de destino.

| Comparação | Resultado |
| --- | ---: |
| Relações públicas da origem | 587 |
| Relações tipadas: tabelas + views | 405 |
| Relações com nome idêntico | 21 |
| Relações da origem fora dos tipos | 566 |
| Objetos tipados ausentes da origem | 384 |
| Colunas tipadas nos 21 nomes comuns | 242 |
| Colunas da origem nos 21 nomes comuns | 515 |
| Nomes de coluna idênticos | 134 |
| Colunas tipadas ausentes da origem | 108 |
| Colunas da origem ausentes dos tipos | 381 |
| FKs no recorte comum: tipos/origem/exatas | 28 / 32 / 3 |
| Enums com mesmo nome | apenas app_role |

O enum comum confirma drift severo: no tipo local, app_role é admin, manager e
salesperson; na origem, contém dev, supervisor, admin, manager, agente,
coordenador e vendedor. Somente admin e manager coincidem.

O rastreio produtivo encontrou 354 nomes literais de relação em .from() no
frontend/Edge Functions, e pelo menos 359 após resolver referências dinâmicas
enumeradas. Apenas 21 coincidem com a origem:

ip_whitelist, login_attempts, notification_preferences, notifications,
order_items, orders, password_reset_requests, permissions, price_history,
products, push_subscriptions, query_telemetry, quote_items, quotes,
role_permissions, sales_goals, saved_filters, scheduled_reports, suppliers,
user_roles e webhook_deliveries.

Foram encontrados 128 nomes de RPC em produção; somente nove coincidem com
funções da origem: check_rate_limit, get_client_seasonality,
get_client_top_products, get_industry_benchmark_stats,
get_industry_seasonality, get_industry_top_products, has_role,
mark_all_notifications_read e search_products_semantic.

Essa baixa interseção é evidência de contratos distintos, não de que os 566
objetos da origem ou os 384 objetos tipados tenham sido perdidos.

## Drift e implementações parciais no repositório

Os itens abaixo são problemas de contrato local comprovados por chamadas
produtivas; ainda não podem ser corrigidos no banco destino enquanto ele não
puder ser catalogado:

| Tipo | Objetos |
| --- | --- |
| Relações chamadas e ausentes dos tipos e migrations locais | auth_users_view, lead_routing_assignments, leads, team_members |
| RPCs chamadas e ausentes dos tipos | auto_pause_enrollment, auto_promote_sequence_winners, claim_pending_cadence_tasks, enqueue_email, is_admin_or_manager |
| RPC sem definição local | enqueue_email, usado por email-bulk-send, email-bulk-retry e send-churn-alert-email |
| Edge Functions invocadas dinamicamente e inexistentes no código | deal-health-scorer, smart-lead-router |
| Buckets usados pelo código | call-recordings, quote-pdfs, report-snapshots, winloss-reports |
| Realtime sem ADD TABLE histórico local | ai_agent_actions, call_recording_ingest_jobs, daily_metrics, email_bulk_drafts, email_bulk_jobs, intent_audit_logs, lead_churn_risk, lead_score_trends, scheduled_sends |

winloss-reports é criado em runtime em modo best-effort, portanto integra uma
parte do schema de Storage que está fora das migrations. O snapshot histórico
do destino documentava apenas buckets financeiros; isso não prova estado atual
porque o destino está não observável.

O reindexador semântico monta uma lista dinâmica que inclui notes,
email_messages, whatsapp_messages e proposals, ausentes de tipos e de
migrations; ele captura o erro e segue como se não houvesse candidatos.
scheduled-reports-runner usa admin.from(entity) com entidade de configuração
persistida sem allowlist local. external-db-bridge aceita rpcName externo
arbitrário, portanto não é enumerável por análise estática.

### Colunas chamadas fora do contrato tipado

Foram encontradas 44 referências diretas de leitura/filtro ausentes dos tipos,
em 15 objetos. As três expressões abaixo podem ser aliases PostgREST, não
colunas físicas: cadence_tasks.prospect_cadence, deal_health_scores.sales e
lead_scores.sales.

| Relação | Campos ausentes do contrato |
| --- | --- |
| cadence_tasks | prospect_cadence |
| call_recordings | sentiment_score |
| call_sentiment_timeline | sentiment_score |
| clients | company_name, created_by, industry, notes, salesperson_id, segment |
| coaching_actions | sale_id |
| deal_health_scores | sales |
| deal_velocity_predictions | status |
| lead_scores | client_id, sales, temperature, total_score |
| race_leaderboard_view | total_overtakes |
| sales | closed_at, competitor_name, deal_name, expected_close_date, forecast_category, loss_reason, lost_reason, next_action, notes, probability, score, segment, stage, title, total_amount, value |
| salespeople | active, level, monthly_goal, user_id, xp |
| sequence_enrollments | salesperson_id |
| tasks | assigned_to, is_completed |
| teams | description |
| v_platform_wal_health | long_running_tx, wal_size_bytes |

Há oito chaves literais de escrita ausentes dos tipos:

- client_interactions.interaction_type e client_interactions.notes
- coaching_sessions.related_analysis_id, sentiment e topic
- deal_health_scores.calculated_at
- race_events.payload
- sales.stage

Foram detectadas ainda 236 escritas cujo payload é variável/helper/configuração;
elas não podem ser classificadas por varredura textual. As 339 ocorrências de
select com curinga também impedem declarar uma coluna isolada como sem uso.

## Migrations

| Medida | Repositório atual | Ledger da origem |
| --- | ---: | ---: |
| Arquivos SQL em supabase/migrations | 594 | — |
| Versões distintas reconhecidas | 578 | 2.354 |
| Coincidentes entre os dois históricos | 3 | 3 |
| Ausentes do outro lado | 575 locais | 2.351 da origem |

Há três colisões de timestamp estrito de 14 dígitos: 20260104143930,
20260104170152 e 20260104181000; existem 15 arquivos que não obedecem ao
formato estrito. Pelo critério de qualquer prefixo numérico, há seis grupos de
colisão. O histórico local também contém operações destrutivas históricas.
Nada disso prova perda; prova que o diretório não é seguro para replay até uma
reconciliação por assinatura de objeto, checksum/DDL e definição de fonte
canônica.

O inventário textual histórico das migrations, que não equivale ao estado final,
encontrou aproximadamente 395 tabelas, 46 views/MVs, 324 funções, 230
triggers, 757 índices, 1.486 CREATE POLICY, 25 enums, cinco extensões, 249
GRANTs, 170 REVOKEs, 12 cron.schedule e 10 cron.unschedule.

## Decisão de classificação

| Classe | Itens |
| --- | --- |
| Perda/falha confirmada | sete itens da tabela de falhas, com prioridade P0–P2 |
| Contrato parcial comprovado | relações, RPCs, Edge, Realtime, Storage e colunas listados acima |
| Candidato forte de implementação parcial | funções no-op, trigger functions sem consumidor, tabelas vazias/desconectadas, colunas all-null, FKs sem índice líder e enums sem uso |
| Diferença possivelmente intencional | schemas Supabase, views públicas projetadas, MVs populadas, partições futuras, jobs de catálogo, objetos internos de trigger/cron |
| Não classificável hoje | todo objeto do destino que depende de catálogo vivo, dados de tráfego, consumidor externo ou SQL dinâmico |

## Próximos gates, em ordem segura

1. Corrigir o acesso de leitura do destino e provar o project ref antes de
   qualquer comparação ou deploy.
2. Exportar manifests de schema, colunas, constraints, índices, RLS, ACLs,
   funções, triggers, views, enums, extensões, cron, Storage e ledger dos dois
   ambientes na mesma janela.
3. Assinar um ADR que define se origem é catálogo compartilhado, legado ou
   fonte canônica que o destino deve reproduzir.
4. Corrigir primeiro as falhas P0/P1 por migrations aditivas testadas em
   staging; não usar alteração manual remota.
5. Só após telemetria, dependências e aprovação explícita decidir por
   deprecar/remover qualquer candidato.

O plano de execução de 100 etapas continua em
[AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md](AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md).
Os apêndices abaixo preservam a lista nominal dos principais candidatos sem
transformá-los em autorização de limpeza.

## Apêndice A — funções no-op ou neutralizadas

- build_full_scope_grants_v: SELECT 1
- refresh_full_scope_grants_view: SELECT 1
- next_in_step_up_queue: objeto vazio
- process_step_up_queue: 0
- fn_force_user_logout: RETURN NEW
- fn_log_login_attempt: RETURN NEW
- fn_log_price_change: RETURN NEW e está ligada a trigger
- fn_log_step_up_event: RETURN NEW
- fn_validate_role_change: RETURN NEW
- limit_recently_viewed_products: RETURN NEW
- magic_up_audit_changes: RETURN NEW
- voice_command_audit: RETURN NEW

fn_apply_transform, no overload de quatro parâmetros, mantém o tipo lookup como
placeholder e devolve o valor original; o overload de seis parâmetros
implementa lookup. purge_expired_security_data limpa dados, mas sua telemetria
final é placeholder. Ambos são candidatos de completude, não de remoção.

## Apêndice B — trigger functions sem trigger consumidor no catálogo

Foram encontradas 62 rotinas de retorno de trigger sem trigger consumidor
ativo. Chamadas SQL dinâmicas, clientes externos ou reparos manuais não são
detectáveis por esta regra:

audit_mcp_api_keys_changes, audit_mcp_key_insert, audit_mcp_key_revoke,
audit_user_role_changes, cleanup_old_telemetry, enforce_created_by_owner,
ensure_single_primary_image, fill_integration_credential_metadata,
fn_audit_role_changes, fn_auto_classify_packing, fn_cor_generate_slug,
fn_cor_updated_at, fn_force_user_logout, fn_handle_new_user, fn_hex_to_rgb,
fn_inherit_techniques_from_material, fn_log_login_attempt, fn_log_step_up_event,
fn_silver_set_updated_at, fn_sync_novelty_to_product, fn_sync_vss_to_variant,
fn_trigger_auto_sync_dimensions, fn_trigger_variant_price,
fn_update_product_search_vector, fn_validate_role_change, generate_order_number,
generate_order_number_v3, guard_mcp_api_keys_writes,
limit_recently_viewed_products, log_mcp_key_changes, log_mcp_key_revocation,
log_price_change, magic_up_audit_changes, mark_for_processing_trigger,
move_favorite_to_trash, notify_new_order, prevent_profile_role_change,
prevent_role_self_update, set_is_imported_from_origin,
set_optimization_queue_updated_at, sync_order_payment_status, tg_set_updated_at,
trg_auto_revoke_mcp_on_role_loss, trg_sync_external_connections,
trg_update_is_thermal, trg_validate_allowed_techniques,
trigger_auto_classify_product, trigger_gerar_nome_variante,
trigger_mark_for_processing, trigger_set_updated_at,
trim_connection_test_history, update_app_settings_timestamp,
update_categories_updated_at, update_notebook_tables_timestamp,
update_product_images_timestamp, update_product_videos_timestamp,
update_staging_updated_at, validate_discount_approval_status,
validate_ip_access_control, validate_secret_rotation_action_type e
voice_command_audit.

## Apêndice C — relações tipadas sem .from() produtivo visível

São 55 objetos tipados, 43 tabelas e 12 views, com 453 colunas, sem ligação
literal visível no frontend/Edge Functions:

ai_sales_insights, buying_committee, cadence_ab_assignments,
cadence_advanced_stats, call_intelligence_triggers, call_metric_benchmarks,
call_sentiment_summary, coaching_scorecard_config, cohort_analyses,
competitors_pricing, contact_send_time_profile, conversation_insights_summary,
critical_moment_notifications, cron_failure_alerts, db_rollback_snapshots,
dead_letter_replay_audit, embedded_report_tokens, follow_up_notifications,
latest_briefing_view, lead_score_history, league_history, maintenance_log,
mfa_verification_attempts, monthly_sales_summary, mql_qualifications,
mv_competitive_ranking, pipeline_inspections, price_protection_rules,
pricing_rules, product_stock_log, product_usage_events, quote_conversion_audit,
race_daily_snapshots, race_rivalries_view, race_user_daily_checkins,
race_user_preferences, report_executions, report_schedules,
salesperson_performance_telemetry, sdr_performance_settings,
sms_verification_codes, territories, user_mfa_settings,
v_pipeline_coverage_summary, v_platform_slo, v_quote_to_sale_invariants,
v_rate_limit_blocked_sellers, v_security_definer_exposure, v_web_vitals_p75,
web_vitals_p75_last7d, webauthn_challenges, webauthn_credentials,
webhook_inbound_log, website_visitor_logs e win_loss_insight_comments.

## Apêndice D — funções tipadas sem .rpc() produtivo visível

admin_capture_rollback_snapshot, backfill_orders_conversion_seq,
calculate_lead_distribution, calculate_performance_pace, calculate_source_roi,
check_performance_bets_completion, cleanup_expired_narrative_cache,
count_failed_login_attempts, count_reset_requests_24h, detect_slow_queries,
detect_stalled_cron_jobs, enforce_telemetry_retention,
fn_admin_cleanup_stale_logs, fn_admin_reset_circuit,
fn_admin_security_definer_exposure, fn_admin_wal_health,
fn_backfill_orders_conversion_seq, fn_cleanup_stale_logs,
fn_cleanup_webhook_dedupe, fn_convert_quote_to_sale,
fn_cron_expected_interval, fn_cron_stalled_threshold,
fn_gc_call_recording_ingest_jobs, fn_get_orders_conversion_seq_last,
fn_list_cron_jobs, fn_purge_rollback_snapshots, fn_test_backdate_cron_alert,
fn_test_cleanup_cron_alerts, fn_test_cleanup_dedupe_privileges,
fn_test_mark_cron_failure, fn_test_simulate_stalled_check,
generate_device_fingerprint, generate_mfa_backup_codes, get_bulk_job_summary,
get_current_user_email, get_embedded_report_by_token, get_historical_benchmark,
get_user_permissions, get_user_role, has_pending_reset_request, has_permission,
increment_sales_streak, is_authenticated, is_country_blocked,
is_email_opted_out, is_known_device, is_mfa_enabled, mark_entity_for_reindex,
normalize_bulk_failure_reason, purge_old_telemetry, purge_telemetry_retention,
reconcile_forecast_accuracy, reset_pg_stat_statements_weekly, start_of_week,
trigger_campaign_health_alert, update_own_profile, update_own_sale,
update_user_mfa_settings, user_owns_engagement_contact e
user_owns_sequence_step.

auto_assign_lead tem chamada estática, mas ela está em useAutoAssignLead, sem
importador produtivo encontrado.

## Apêndice E — tabelas vazias e colunas all-null

Estimativa de tabela vazia, ou estatística de coluna com null_frac igual a um,
não prova que um objeto seja lixo. As tabelas podem ser roadmap, auditoria,
partição futura, alvo de escrita externa ou ainda não terem passado por ANALYZE.

Há 131 tabelas/partições com estimativa de zero linhas. Doze foram verificadas
como sem linhas e, no recorte de catálogo, sem FK, trigger, view dependente,
menção literal em função ou job:

- ai_usage_events
- collection_item_reactions
- comparison_reactions
- magic_up_comments
- order_item_personalizations
- product_search_logs
- product_sync_logs
- simulator_wizard_drafts
- supplier_products_raw_history_p2026_09
- supplier_products_raw_history_p2026_10
- supplier_products_raw_history_p2026_11
- video_variant_links

As três últimas partições de histórico são futuras e não são candidatas de
remoção. A partição de novembro também tem o problema de RLS documentado acima.

Foram encontradas 182 colunas all-null em 60 tabelas com pelo menos 100 linhas.
A lista completa, agrupada por relação, é a seguinte:

| Relação | Colunas all-null observadas |
| --- | --- |
| _archive_product_ai_20260626 | ai_summary, key_benefits, use_cases |
| _archive_product_seo_20260626 | schema_json |
| _archive_supplier_price_tiers_20260626 | valid_to |
| _bkp_kit_color_from_name_20260624 | old_color |
| _bkp_kit_packing_type_20260624 | old_packing_type |
| _bkp_kit_pkg_material_20260624 | old_pkg_material |
| _qa_pct_results | p3 |
| ai_enrichment_queue | locked_at, locked_by |
| anon_catalog_grant_audit_log | violations |
| audit_log_gravacao | campos_alterados |
| categories | bitrix_modified_at, created_by, synced_at, updated_by |
| color_equivalences | promo_nuance_id, verified_by |
| crm_callback_events | crm_quote_id |
| follow_up_reminders | completed_at |
| image_backfill_queue | last_error, started_at |
| included_packaging_print_areas | diameter_mm |
| included_packaging_techniques | technique_id |
| kit_component_enrichment_raw | imported_by, process_errors, source_url |
| kit_component_ficha_staging | weight_g |
| kit_component_padronizacao | color, component_product_id, pkg_color, pkg_finish, pkg_int_diameter_mm, pkg_int_height_mm, pkg_int_length_mm, pkg_int_width_mm, pkg_material, pkg_weight_g, rejection_reason, reviewed_by |
| ncm_codes | import_rate, notes |
| pipeline_run_log | error |
| price_history | change_reason, changed_by |
| print_area_techniques | unit_cost |
| product_ai_content | ai_keywords, key_benefits, use_cases |
| product_ai_history | ai_summary, schema_json |
| product_attributes | attribute_unit |
| product_commemorative_dates | category_id, custom_message |
| product_customization_prices | hotspot |
| product_deactivation_requests | approved_by, rejected_by, requested_by |
| product_deactivation_tokens | authorized_by |
| product_fiscal | cest, cst_icms, ean, gtin, warranty_months |
| product_images | cf_last_error, deleted_at, deleted_reason, r2_bucket, r2_object_key |
| product_included_packagings | cradle_material, description, finish, internal_diameter_cm, supplier_packaging_code, weight_g |
| product_kit_components | pkg_color, pkg_finish, pkg_int_diameter_mm, pkg_int_height_mm, pkg_int_length_mm, pkg_int_width_mm, pkg_weight_g |
| product_materials | created_by, updated_by |
| product_notebook_features | source_text |
| product_notebook_specs | extraction_notes |
| product_novelties | created_by |
| product_packaging | cradle_material, description_packaging_info, optional_packaging_ref, packaging_color, packaging_finish, packaging_material |
| product_packagings | additional_price |
| product_physical | internal_height_cm, internal_length_cm, internal_width_cm |
| product_similarity_group_members | notes |
| product_variants | next_date_4, next_date_5, next_date_6, next_quantity_4, next_quantity_5, next_quantity_6 |
| product_videos | description, filename |
| products | cest, cfop, cofins_rate, csosn, default_carrier, deleted_at, ean, freight_class, gtin, icms_rate, internal_diameter_cm, is_on_sale_expires_at, key_benefits, packaging_color, packaging_finish, pis_rate, shipping_height_cm, shipping_length_cm, shipping_notes, shipping_weight_kg, shipping_width_cm, tax_regime, use_cases, warranty_months |
| produtos_padronizacao | aliquota_ipi, diameter_cm, validation_errors |
| produtos_padronizacao_variantes | next_date_2, next_date_3, next_date_4, next_date_5, next_date_6, next_quantity_2, next_quantity_3, next_quantity_4, next_quantity_5, next_quantity_6 |
| produtos_site_padronizacao | brand, disclaimer, has_view_360, video_channel_url, view_360_icon_url |
| ramo_atividade_filho | descricao, icone |
| seo_redirects | created_by, expires_at, last_hit_at |
| sm_site_url_map | hex_color, nome_site |
| supplier_colors | api_optional_description |
| supplier_customization_raw | process_errors, processed_at |
| supplier_field_mappings | created_by |
| supplier_products_raw | process_errors, stock_processed_at |
| supplier_property_mappings | supplier_id |
| variant_supplier_sources | cest, csosn, lead_time_days, next_date_4, next_date_5, next_date_6, next_quantity_4, next_quantity_5, next_quantity_6, removed_at, supplier_availability_status, sync_error |
| video_import_queue | local_file_path |
| xbz_gallery_staging | error_message, file_size_bytes, http_status, image_id_site, partition_id, variant_id |

Os grupos de maior sinal para futuro saneamento de domínio são os slots
next_date/next_quantity 4–6, campos fiscais/frete/garantia e campos de IA ou
embalagem. Mesmo nesses grupos, a decisão exige requisito de negócio, histórico
de escrita e consumidores antes de qualquer ALTER ou DROP.

## Apêndice F — objetos de migration sem ligação literal atual

As seguintes tabelas aparecem apenas no histórico local de migrations, sem tipo
nem chamada literal produtiva atual:

ab_tests, audit_log, cadence_enrollments, call_tracking, data_access_log,
entity_versions, experiment_assignments, experiment_variants, experiments,
migration_log, password_history, roles, security_events, session_activity,
user_2fa, user_2fa_backup_codes, user_2fa_log, user_permissions_cache,
webhook_events e webhook_logs.

As seguintes views aparecem apenas no histórico local de migrations, sem tipo
nem chamada literal produtiva atual:

activities_active, clients_active, deals_active, mv_client_ltv,
mv_client_metrics, mv_monthly_revenue, mv_pipeline_health,
mv_product_performance, mv_sales_performance, mv_sales_summary, tasks_active,
v_active_activities, v_active_clients, v_active_deals, v_active_products,
v_active_suppliers, v_active_teams, v_deleted_clients e v_deleted_deals.

O contraste audit_log versus audit_logs, roles versus user_roles, deals versus
sales e cadence_enrollments versus modelos atuais sugere forks históricos. Não
autoriza exclusão, pois há consumidores externos, triggers, jobs e versões
legadas possíveis.

## Fechamento de segurança

Nenhuma operação de banco foi realizada. Também não foi removido nenhum arquivo
candidato de limpeza. O registro externo acidental com notes igual a
__probe__ permanece intocado e só poderá ser removido após confirmação
inequívoca do projeto e autorização explícita.

Esta matriz substitui, para a reconciliação atual, inferências antigas que
tratavam o snapshot estático do destino como catálogo vivo. Ela não invalida
achados locais de código; apenas impede que eles sejam usados para alterar o
ambiente remoto sem a evidência necessária.
