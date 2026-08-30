# Auditoria exaustiva do Promo Champions V2.1

**Data da medição:** 30/08/2026  
**Origem informada:** Lovable Cloud, projeto rapjswienfhkobhlamxb  
**Destino informado:** Supabase, projeto usyxfpqlsspldubptrdl  
**Repositório:** adm01-debug/Promo_Champions_V2.1  
**Escopo:** repositório, frontend, Edge Functions, migrations e catálogos vivos dos dois bancos  
**Modo de banco:** exclusivamente leitura; nenhuma DDL, DML, chamada mutável, rotação, deploy ou exclusão foi executada  
**Documento substituído para decisões futuras:** AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md

## Veredito executivo

O sistema tem uma base visual e funcional ampla, e os gates locais principais de TypeScript, lint, testes unitários e build passam. Porém, o estado medido não pode ser classificado como 90% pronto para produção com segurança. A avaliação técnica mais honesta é:

- frontend/design e muitos fluxos centrais: maduros;
- qualidade local principal: saudável;
- Edge Functions: parcialmente compiláveis, com 7 falhas de sintaxe/import e 34 falhas adicionais de typecheck;
- banco destino: estruturalmente maior que a origem, sem perda de tabela ou coluna pública da origem;
- reconciliação de dados: quase completa em quantidade, mas com 3 lacunas de registros operacionais ainda não explicadas e 7 divergências de histórico/retention;
- segurança de banco e Edge: bloqueadora;
- migrations e tipos gerados: fora de sincronia com o estado vivo;
- CI/E2E: não verde;
- dados apresentados como reais: ainda existem simulações e valores fabricados em fluxos de produto.

O design não precisa ser refeito. O caminho seguro é congelar mudanças visuais, conter os riscos P0/P1, corrigir contratos e migrations em lotes pequenos, validar cada lote e só então limpar candidatos aprovados.

## Regras de preservação aplicadas

1. Nenhuma tabela, coluna, constraint, índice, policy, função, trigger, view, enum, extensão, privilégio, bucket, job ou migration foi alterado ou removido.
2. Nenhum arquivo candidato a lixo foi apagado.
3. Tabela vazia não foi classificada como lixo.
4. Ausência de chamada literal no código foi tratada como indício, nunca como prova de inutilidade.
5. Objetos adicionais do destino com auditoria, rollback ou dados foram classificados como protegidos.
6. Credenciais encontradas não são reproduzidas neste documento.
7. O plano exige autorização explícita antes de qualquer alteração remota ou exclusão.

## Método e evidências

A análise combinou:

- leitura integral do README, CLAUDE.md e documentação em docs;
- mapa estrutural Graphify do backend, com 1.387 nós, 2.936 arestas e 122 comunidades;
- busca estática por relações, RPCs, buckets, Edge invocations, mocks, placeholders e credenciais;
- npm ci, typecheck, ESLint, Vitest, build, análise de bundle, dependency-cruiser, Prettier e npm audit;
- Deno bundle/typecheck de todas as 170 Edge Functions em resolução limpa;
- testes Deno completos e testes compartilhados;
- inventário Playwright e execução de acessibilidade pública;
- leitura de execuções do GitHub Actions;
- consultas SELECT nos catálogos vivos de origem e destino;
- comparação normalizada de relações, colunas, constraints, índices, policies, triggers, views, funções, enums, extensões, privilégios, publicações, storage, cron e ledger de migrations;
- contagem exata de linhas nas tabelas públicas e identificação exata de colunas totalmente nulas em tabelas não vazias.

O snapshot vivo foi coletado aproximadamente entre 15:23 e 15:47 UTC de 30/08/2026. Partições internas do Realtime mudaram durante a coleta; elas foram separadas dos objetos funcionais do schema public.

## Escala do sistema

| Superfície                     |            Medição |
| ------------------------------ | -----------------: |
| Arquivos em src                |              2.032 |
| Arquivos TypeScript/TSX em src |              2.030 |
| Linhas TypeScript/TSX em src   |            298.323 |
| Rotas declaradas               |                175 |
| Diretórios de Edge Functions   |                170 |
| Arquivos em supabase/functions |                284 |
| Linhas TypeScript de Edge      |             53.626 |
| Migrations SQL locais          |                595 |
| Linhas SQL de migrations       |             39.825 |
| Arquivos de teste TypeScript   |                190 |
| Casos E2E Playwright coletados | 483 em 46 arquivos |

No grafo do backend, os hubs são withRequestId, corsHeaders, fetchWithTimeout, chunkedIn, getUserClient e UnauthorizedError. A adoção de withRequestId chegou a 169 de 170 handlers; a exceção é migrate-helper. O circuito compartilhado withEdgeCircuitBreaker aparece em somente 5 handlers principais, ainda longe de uma política uniforme de resiliência.

## Placar de verificações locais

| Verificação                    | Resultado                | Evidência                                                                  |
| ------------------------------ | ------------------------ | -------------------------------------------------------------------------- |
| npm ci                         | aprovado                 | 1.353 dependências instaladas                                              |
| npm run typecheck              | aprovado                 | sem erro                                                                   |
| npm run lint                   | aprovado                 | sem erro                                                                   |
| npm test                       | aprovado                 | 50 arquivos aprovados, 1 pulado; 458 testes aprovados, 2 pulados           |
| npm run build                  | aprovado com alertas     | 6.515 módulos transformados                                                |
| npm run deps:check             | aprovado com 8 avisos    | 8 módulos sem entrada estática                                             |
| npm run security:secrets       | aprovado, mas incompleto | não detectou a chave fixa de migrate-helper                                |
| npm run format:check           | reprovado                | 1.666 arquivos fora do Prettier                                            |
| Deno bundle das Edge Functions | reprovado                | 129 aprovadas, 7 com erro de sintaxe/import                                |
| Deno typecheck adicional       | reprovado                | 34 funções com erros apenas de tipo                                        |
| Testes Deno completos          | reprovado                | 545 aprovados e 28 reprovados                                              |
| Testes Deno compartilhados     | reprovado                | 95 aprovados e 1 reprovado                                                 |
| Bundle budget                  | aprovado                 | 2.423,0 KiB gzip em 414 chunks                                             |
| Acessibilidade pública local   | parcial                  | 2 aprovados e 8 autenticados pulados                                       |
| CI principal                   | reprovado/bloqueado      | execuções recentes encerradas antes dos steps por orçamento/infraestrutura |
| E2E histórico no CI            | reprovado                | 92 falharam, 382 pularam e 9 passaram                                      |

O build emite ciclos vendor para vendor-core e vendor para vendor-markdown. AbcPieChart é importado de forma estática e dinâmica, tornando o lazy import ineficaz. Os budgets monitorados passam, mas chunks grandes como App e WinLoss não têm budget próprio.

## Achados bloqueadores de segurança

### P0 — migrate-helper foi reintroduzida e continua implantada na origem

O arquivo supabase/functions/migrate-helper/index.ts contém:

- chave fixa hexadecimal de 48 caracteres;
- CORS curinga;
- autenticação somente por x-access-key;
- ação credentials que devolve SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_DB_URL.

A função havia sido removida por segurança, mas foi reintroduzida pelo commit 79f0ed63c em 28/08/2026. CLAUDE.md e supabase/config.toml afirmam que ela foi removida, enquanto o código atual contradiz essa afirmação.

No runtime da origem foram observadas somente duas Edge Functions implantadas: analyze-call com JWT e migrate-helper sem JWT. A ação credentials não foi chamada. O estado de implantação das funções no destino não pôde ser enumerado pelo conector disponível.

Impacto: uma credencial fixa versionada protege um endpoint capaz de exfiltrar credenciais administrativas. A contenção correta exige autorização operacional explícita para desativar o runtime e rotacionar todas as credenciais potencialmente expostas.

### P0 — views adicionais do destino podem contornar RLS e estão abertas a anon

As 9 views exclusivas do destino não têm security_invoker=true e possuem SELECT efetivo para anon:

- activities_active;
- clients_active;
- tasks_active;
- v_active_activities;
- v_active_clients;
- v_active_products;
- v_active_suppliers;
- v_active_teams;
- v_deleted_clients.

Elas pertencem a postgres e selecionam diretamente as tabelas-base. clients_active e v_active_clients expõem nome, email, telefone, empresa, coordenadas e dados de verificação. v_deleted_clients inclui os mesmos campos e o email de quem excluiu. Mesmo vazia hoje para excluídos, a view cria exposição futura. A materialized view mv_competitive_ranking também ganhou leitura efetiva para anon.

Na origem, 26 de 26 views convencionais usam security_invoker=true. No destino, somente 26 de 35 usam essa proteção.

### P0/P1 — 30 funções SECURITY DEFINER executáveis por anon

O ADR-008 permite 11 funções pré-login revisadas. O destino possui 30 funções de aplicação SECURITY DEFINER executáveis por anon, contra 10 na origem. Todas têm search_path configurado, mas isso não corrige autorização ausente.

Casos críticos comprovados pela definição viva:

- soft_delete_record aceita p_user_id fornecido pelo chamador e altera registros sem validar auth.uid;
- restore_deleted_record restaura registros sem validar o chamador;
- restore_record aceita nome de tabela e restaura qualquer registro com deleted_at, sem whitelist nem autorização;
- get_deleted_records lista registros apagados e email administrativo sem validar o chamador;
- claim_pending_cadence_tasks muda tarefas para processing sem autenticação interna;
- add_salesperson_xp, add_league_weekly_xp, increment_combo e increment_goal_progress usam comparação com !=; quando o vendedor atual é NULL, a condição de bloqueio também fica NULL e o IF não barra a chamada;
- funções fn*test*\* que escrevem em cron_failure_alerts permanecem disponíveis a anon;
- cleanup_expired_narrative_cache e log_security_event também mantêm superfície mutável anônima.

hard_delete_record está quebrada: consulta user_roles.is_admin, coluna inexistente, e confia em um UUID administrativo fornecido pelo chamador. Hoje tende a falhar, mas continua sendo contrato inseguro e não testado.

### P1 — RLS existe, porém policies permissivas expõem dados

Todas as 398 tabelas públicas do destino têm RLS, e 2 usam FORCE RLS. Isso é positivo, mas não basta:

- login_attempts permite INSERT e SELECT irrestrito para anon;
- salesperson_xp tem policy chamada Users can view their own XP, mas a expressão é true para PUBLIC;
- cadence_alert_templates, cadence_funnel_rules, cadence_outcome_rules, expansion_playbooks e follow_up_settings têm leitura pública irrestrita;
- maintenance_log permite leitura a anon; a policy chamada Deny writes usa USING true e WITH CHECK false;
- entity_versions tem policy pública true, mas os grants atuais ainda bloqueiam anon;
- plan_rollback_ddl tem RLS sem policy, ficando inacessível via API comum.

Os grants de tabela são amplos: anon tem SELECT em 384 das 398 tabelas e INSERT/UPDATE em 384; a proteção real depende das policies. Isso aumenta o impacto de qualquer policy incorreta.

### P1 — papel administrativo baseado em raw_user_meta_data

Quatro policies usam auth.users.raw_user_meta_data para decidir privilégio:

- audit_log;
- lead_detailed_logs;
- webhook_logs;
- webhooks.

raw_user_meta_data é metadata controlável pelo usuário e não deve elevar privilégio. Em webhooks a policy é FOR ALL, permitindo que um usuário que se marque como admin gerencie endpoints. A decisão deve vir de user_roles, raw_app_meta_data controlado pelo servidor ou helper canônico revisado.

### P1 — Edge Functions com service_role sem autorização de recurso

Em 140 dos 170 handlers existe referência a service_role ou cliente privilegiado; apenas 9 usam o helper central getServiceClient. A validação JWT padrão do Supabase comprova identidade, mas não propriedade do recurso nem papel administrativo.

Exemplos:

- deal-probability aceita qualquer lista de dealIds e devolve dados lidos com service_role;
- lead-scoring aceita qualquer lista de deals e grava lead_scores;
- customer-success-360 devolve até centenas de contas, tickets, renovações, pesquisas e pedidos;
- pipeline-pulse-aggregator lê agregados amplos e usa uma relação inexistente;
- customer-success-360 ainda assume que orders.user_id equivale a account_id.

É necessária uma matriz função por função com identidade, papel, ownership, limite e efeito de escrita.

### P1 — CORS e contratos públicos inconsistentes

156 dos 170 handlers importam corsHeaders estático; somente 9 usam getCorsHeaders dinâmico. O fallback continua sendo Access-Control-Allow-Origin: \* quando ALLOWED_ORIGINS não está configurado.

O config local marca cinco funções sem JWT: log-web-vitals, receive-quote-sync, email-unsubscribe, inbound-email-webhook e multichannel-status-webhook. Outros contratos de provider, callback, iframe ou pré-login continuam atrás do JWT padrão, embora tenham autenticação própria ou precisem ser públicos, incluindo receive-quote-webhook, Twilio callbacks, report-embed-public, OAuth e WebAuthn. A decisão deve ser explícita por endpoint, não um desligamento em massa.

## Integridade funcional do frontend

### Dados fabricados apresentados como reais

Foram confirmados os seguintes casos:

- enrich-lead gera empresa, receita, funding, tecnologia, setor, pessoa, sinais de compra e verificações aleatórios; depois persiste email_verified=true e phone_verified aleatório;
- UsageAnalytics chama contagens de status de vendas de page views e gera login_count aleatório;
- LiveIntelligenceFeed injeta insights fixos de Salesforce, objeção e sentimento após um timer, mas mostra REAL-TIME FEED;
- RecordingSummaryDrawer fabrica confidence, timestamp_sec e excerpt;
- PriceElasticityChart gera curva aleatória quando não recebe dados, mas mostra Live Model e correlação neural;
- FuturisticSpeedometerDashboard deriva históricos artificiais e os chama mockRevenueHistory e mockSalesHistory;
- ArenaAITips sorteia uma suposta tendência de queda e a apresenta como inteligência detectada;
- EnhancedActivityCard inicia contagem de reações aleatória;
- SentimentTimelineChart envia mock-id e Concorrente Direto para recomendação de battlecard;
- useWhatsApp grava a mensagem localmente como sent e mostra Mensagem enviada via WhatsApp sem chamar provedor;
- pipeline-pulse-aggregator chama wonAmount multiplicado por 1,05 de projeção IA e usa 50% de capacidade quando não há roteamentos.

Esses casos não são apenas demos visuais: alguns persistem dados falsos ou declaram sucesso operacional. Devem falhar de forma honesta, mostrar modo demonstração inequívoco ou integrar a fonte real.

### Contratos quebrados no código

Relações literais chamadas, mas ausentes nos dois bancos:

- auth_users_view em FollowUpTerritoryRules;
- lead_routing_assignments em pipeline-pulse-aggregator;
- leads em sequence-runner e ai-agent-orchestrator;
- team_members em ranking-api.

RPCs chamadas no código e ausentes no destino:

- auto_pause_enrollment;
- auto_promote_sequence_winners;
- enqueue_email;
- route_unassigned_client_portfolio;
- spin_prize_wheel.

As duas últimas têm migrations preparadas em 30/08, mas não aplicadas. enqueue_email não possui definição SQL local encontrada. auto_pause_enrollment e auto_promote_sequence_winners aparecem no código/tipos, mas não no catálogo vivo.

Duas quick actions apontam para Edge Functions inexistentes:

- deal-health-scorer;
- smart-lead-router.

BackendAutomationMonitor ainda aceita functionName dinâmico e precisa de allowlist administrativa.

### Funcionalidades parciais adicionais

- export-winloss-pdf emite Markdown, não PDF, e tenta criar o bucket winloss-reports em runtime;
- receive-quote-webhook grava getPublicUrl para o bucket privado quote-pdfs;
- digital signatures mantém criação de rascunho, mas envio/status estão honestamente desabilitados;
- WebAuthn está honestamente desabilitado com 503, o que é preferível a uma falsa validação;
- ElevenLabs devolve 503 quando a chave não existe, apesar de o log ainda usar a palavra placeholder;
- order tracking já foi corrigido e consulta dados reais.

## Edge Functions

### Inventário e compilação

Existem 170 diretórios e 170 index.ts.

As 7 falhas de sintaxe/import são:

1. calculate-committee-coverage — caractere de controle U+0001;
2. calibrate-win-probabilities — fechamento extra;
3. calibrate-win-probability — caractere de controle U+0001;
4. check-v4-callback-alerts — caractere de controle U+0001;
5. coaching-impact-summary — caractere de controle U+0001;
6. nlq-query — erro de sintaxe próximo ao import;
7. notify-v4-quote-status — uso TypeScript inválido de typeof com indexação de tipo.

As 34 funções com falhas adicionais de typecheck são:

aggregate-coaching-scorecard, ai-copilot, ai-email-composer, analyze-objection-handling, analyze-stage-conversion, bitrix24-sync, deal-probability, deal-risk-digest, edge-retry-threshold-alert, elevenlabs-voice, execute-workflow, external-db-bridge, extract-committee-from-call, forecast-narrative, generate-loss-coaching, lead-scoring, notify-quote-conversion, onboarding-launcher, personal-assistant-stream, predict-quota-attainment, predictive-scoring-explain, process-race-event, refresh-stage-baselines, report-builder-execute, report-embed-public, run-retry-tests, salesperson-coaching, scheduled-reports-runner, semantic-search, semantic-search-universal, stress-test-contracts, wal-health-alert, winloss-webhook-health-monitor e workflow-executor.

Os testes Deno completos tiveram 545 aprovações e 28 falhas. Parte depende de ambiente, mas há regressão objetiva no guard chunked_in_lint_test: \_shared/unsubscribe.ts usa .in('email', slice) fora do helper reconhecido. Dois contratos de run-retry também falham.

### Funções sem invocação literal no frontend

Há 63 diretórios sem supabase.functions.invoke literal no frontend:

activity-goal-alerts, admin-conversion-trail, ai-agent-orchestrator, analyze-pipeline-coverage, auto-reassign-inactive, broadcast-sale-notification, campaign-health-alert, challenge-expiration-alerts, check-lead-sla, check-quote-expiration, check-v4-callback-alerts, compute-forecast-accuracy, conversational-intelligence, cron-failure-alerter, customer-success-360, customer-success-hub, deal-risk-digest, elevenlabs-stt, elevenlabs-tts, elevenlabs-voice, email-unsubscribe, extract-deal-stakeholders, forecast-narrative, generate-coaching-actions, generate-loss-coaching, generate-revenue-forecast, get-client-ip, inbound-email-webhook, lead-scoring, log-web-vitals, migrate-helper, multichannel-status-webhook, new-device-alert, notify-critical-pattern, personal-assistant-stream, pricing-intelligence, process-scheduled-sends, ranking-api, receive-quote-sync, receive-quote-webhook, report-embed-public, revenue-intelligence, revops-hub, run-retry-tests, sales-assistant-chat, scheduled-reports-runner, semantic-coverage, semantic-reindex-batch, semantic-search, semantic-search-universal, send-push-notification, send-quote-to-client, sequence-record-reply, simulate-load, territory-optimization, twilio-call-status, twilio-call-twiml, visual-search, wal-health-alert, winloss-webhook-dispatcher, winloss-webhook-health-monitor, winloss-webhook-replay-batch e winloss-webhook-timeline.

Isso não significa lixo: a lista inclui cron, webhook, callback, API pública e consumidores Edge-to-Edge. Cada item precisa de owner e evidência de tráfego antes de qualquer remoção.

## Banco de dados — inventário vivo

| Métrica                                        |                 Origem |          Destino |
| ---------------------------------------------- | ---------------------: | ---------------: |
| PostgreSQL                                     |               17.6 ARM |         17.6 x86 |
| Tamanho do banco                               |              288,3 MiB |         71,1 MiB |
| Tabelas public                                 |                    378 |              398 |
| Views public                                   |                     26 |               35 |
| Materialized views public                      |                      1 |                1 |
| Sequências public                              |                      1 |                3 |
| Tabelas public com RLS                         |                    378 |              398 |
| Tabelas public com FORCE RLS                   |                      2 |                2 |
| Constraints public                             |                  1.294 |            1.350 |
| Índices public                                 |                  1.390 |            1.486 |
| Policies public                                |                    976 |            1.032 |
| Triggers public                                |                    365 |              377 |
| Rotinas não sistêmicas                         |                    558 |              596 |
| Funções/procedures de aplicação public/private |                    292 |              329 |
| Enums                                          |       38 / 160 valores | 38 / 160 valores |
| Extensões                                      |                      9 |                9 |
| Migrations no ledger                           |                    242 |              242 |
| Tabelas public vazias                          |                    328 |              304 |
| Tabelas public não vazias                      | 50/51 durante snapshot |               94 |
| Usuários auth                                  |                      1 |                2 |
| Jobs cron ativos                               |                      0 |               25 |
| Buckets                                        |                      5 |                5 |
| Objetos em storage                             |                      0 |                0 |

A pequena oscilação 50/51 na origem ocorreu porque os coletores foram executados em instantes distintos. O valor aritmeticamente consistente com 378 tabelas e 328 vazias é 50; nenhuma conclusão de perda foi baseada nessa leitura intermediária.

## Reconciliação origem versus destino

### Relações

Todas as 406 relações public da origem — tabelas, views, MV e sequência — existem no destino. Não há tabela, view, materialized view ou sequência pública exclusiva da origem.

O destino adiciona:

- tabelas: ab_tests, audit_log, cadence_enrollments, data_access_log, entity_versions, experiment_assignments, experiment_variants, experiments, migration_log, password_history, plan_rollback_ddl, roles, security_events, session_activity, user_2fa, user_2fa_backup_codes, user_2fa_log, user_permissions_cache, webhook_events e webhook_logs;
- views: activities_active, clients_active, tasks_active, v_active_activities, v_active_clients, v_active_products, v_active_suppliers, v_active_teams e v_deleted_clients;
- sequências: migration_log_id_seq e plan_rollback_ddl_id_seq.

Não são todas vazias. audit_log tem 330 linhas, data_access_log 101, migration_log 5, plan_rollback_ddl 82 e roles 3. Esses objetos devem ser preservados. As demais 15 tabelas adicionais estavam vazias no snapshot.

### Colunas

Não existe coluna presente em relação comum da origem e ausente no destino.

O destino adiciona:

- deleted_at, deleted_by e delete_reason em activities, clients, products, suppliers e teams;
- deleted_at em tasks;
- stage, segment, notes, loss_reason, competitor_name e closed_at em sales;
- enabled em webhooks.

Drifts adicionais:

- error_logs.user_id e scheduled_reports.created_by usam auth.uid no destino e uid sem qualificação na origem;
- feature_flags.id muda de uuid_generate_v4 para gen_random_uuid;
- feature_flags.created_at perde NOT NULL no destino;
- webhooks.secret passa a NOT NULL;
- webhooks.created_at e updated_at perdem NOT NULL;
- o default de webhooks.events é semanticamente equivalente.

As mudanças de soft delete e sales são aditivas. A fotografia de nulidade deve ser interpretada coluna a coluna — conforme o apêndice — e não autoriza remover nenhuma delas por inferência.

### Constraints

Após normalizar qualificações auth/public, somente 9 relações comuns têm drift real:

- activities, clients, products, suppliers e teams ganharam FK deleted_by para auth.users;
- saved_filters ganhou FK para auth.users e unique(user_id, entity_type, name);
- automation_workflows expandiu trigger_type com proposal_opened e price_clicked;
- client_portfolio expandiu status com nurturing, at_risk e churned;
- stock_movements trocou in/out por entry/exit.

As três mudanças de domínio combinam com o código atual e parecem intencionais. A alteração stock_movements é necessária para Estoque.tsx e useInventory, que usam entry/exit.

Há uma constraint NOT VALID, realtime.messages_payload_exclusive, em schema gerenciado do Supabase. Não foi classificada como perda do aplicativo.

### Índices

Nenhum índice da origem desaparece por completo, exceto a semântica do índice quotes_inbound(source,status): na origem ele é parcial para source=promogifts; no destino é global.

O destino adiciona índices de soft delete, busca textual, relacionamentos e filtros. Existem 6 grupos exatamente duplicados:

- audit_log: idx_audit_log_user_id / idx_audit_user;
- audit_log: idx_audit_created / idx_audit_log_created_at;
- clients: idx_clients_created / idx_clients_created_at;
- conversation_analyses: idx_conv_analyses_analyzed_by / idx_conversation_analyses_analyzed_by;
- race_badges: constraint index / race_badges_unique_per_season;
- saved_filters: idx_saved_filters_user / idx_saved_filters_user_entity.

Existem 11 FKs sem índice líder compatível:

activities_deleted_by_fkey, cadence_enrollments_cadence_id_fkey, cadence_enrollments_client_id_fkey, client_churn_alerts_state_last_task_id_fkey, experiment_assignments_experiment_id_fkey, experiment_assignments_variant_id_fkey, experiment_variants_experiment_id_fkey, products_deleted_by_fkey, slow_query_alerts_acknowledged_by_fkey, suppliers_deleted_by_fkey e teams_deleted_by_fkey.

Todos os 1.486 índices do destino estão válidos e prontos.

### Policies e privilégios

Depois de normalizar auth.uid versus uid, 14 relações comuns têm drift de policy. A maior parte são adições do destino, mas os riscos relevantes são:

- login_attempts perdeu a policy de leitura administrativa da origem e ganhou leitura/insert anônimos irrestritos;
- error_logs trocou insert autenticado próprio por insert anon limitado;
- clients ganhou policies próprias e de has_permission, além de policy active;
- portfolio_settings ganhou uma leitura não sensível por chave e leitura total para admin;
- webhooks ganhou policy administrativa baseada em raw_user_meta_data;
- activities, products, suppliers e teams ganharam policies active que, por serem permissivas e combinadas por OR, não restringem policies anteriores.

Os papéis anon e authenticated têm grants amplos por default ACL. O hardening precisa tratar grants e policies em conjunto.

### Triggers

O destino adiciona auditoria e soft-delete em activities, clients, products, suppliers e teams, mais updated_at em saved_filters.

Perda funcional provável: a origem possui tr_log_lead_stage_transition em clients chamando private.log_lead_stage_transition; o trigger não existe no destino.

auto_victory_post e ensure_single_default_filter mudaram de private para public no destino. A chamada continua presente, mas a exposição de schema/grants aumentou.

### Views

As 27 views/MVs comuns são iguais, exceto race_leaderboard_view:

- origem conta somente sales.status=completed e filtra vendedores pelo role_type da temporada;
- destino conta won e completed e remove o filtro de papel.

Isso parece uma correção intencional para o modelo atual, mas foi aplicada fora do ledger. As views duplicadas activities_active/v_active_activities e clients_active/v_active_clients são candidatas de consolidação somente após aprovação e telemetria.

### Funções

Em public/private:

- 4 assinaturas existem apenas na origem;
- 41 existem apenas no destino;
- 22 assinaturas comuns têm corpo ou atributo alterado.

Somente na origem:

- private.add_league_weekly_xp;
- private.increment_combo;
- private.increment_goal_progress;
- public.exec_sql.

As três primeiras foram movidas para public. A remoção de exec_sql no destino é uma melhoria de segurança intencional.

Somente no destino:

add_league_weekly_xp, add_salesperson_xp, aggregate_sales_stats, archive_old_activities, archive_old_data, audit_trigger, audit_trigger_func, auto_victory_post, bulk_update_deal_stages, calculate_deal_health_score, calculate_deal_probability, calculate_team_performance, check_2fa_failed_attempts, check_failed_attempts, claim_pending_cadence_tasks, cleanup_deleted_records, cleanup_old_audit_logs, cleanup_old_records, create_version, ensure_single_default_filter, generate_sales_forecast, get_deleted_records, hard_delete_record, has_permission, increment_combo, increment_goal_progress, log_audit, log_audit_event, log_data_access, log_security_event, log_soft_delete, record_login_attempt, refresh_materialized_views, reindex_tables, restore_deleted_record, restore_record, soft_delete_record, update_2fa_updated_at, update_client_score, update_lead_score e update_saved_filters_updated_at.

O arquivo de tipos contém 184 funções. Há 3 tipadas mas ausentes no vivo — reassign_inactive_client_portfolio, route_unassigned_client_portfolio e spin_prize_wheel — e 97 nomes vivos ausentes nos tipos. Muitos dos 97 são triggers, mas o drift confirma que types.ts não representa o destino.

### Enums e extensões

Os 38 enums e 160 valores são idênticos. Todos os enums do schema public são usados por ao menos uma coluna. Não há candidato de enum para remoção por esse critério.

As 9 extensões são as mesmas. O destino atualiza:

- pg_net de 0.20.0 para 0.20.4;
- vector de 0.8.0 para 0.8.2.

Isso parece evolução intencional de plataforma.

### Realtime

A publicação funcional public passa de 8 tabelas na origem para 77 no destino, um aumento de 69 tabelas. A expansão inclui IA, coaching, forecast, gamificação, pipeline, cadências e Win/Loss. Ela pode ser intencional para recursos em tempo real, mas amplia WAL, tráfego e superfície de dados; exige owner e medição de consumo.

As demais diferenças observadas são partições diárias internas de realtime.messages.

### Storage

Os dois ambientes possuem os mesmos buckets:

| Bucket           | Público | Objetos |
| ---------------- | ------: | ------: |
| avatars          |     sim |       0 |
| call-recordings  |     não |       0 |
| quote-pdfs       |     não |       0 |
| report-exports   |     não |       0 |
| report-snapshots |     não |       0 |

As 14 policies de storage são semanticamente iguais entre origem e destino após normalizar qualificações. Há um nome enganoso: service_role_can_write_exports é concedida a authenticated e exige pasta do próprio usuário; o comportamento é de owner upload, não service role.

O código usa call-recordings, quote-pdfs e report-snapshots. export-winloss-pdf espera winloss-reports, ausente nos dois bancos, e tenta criá-lo em runtime. report-exports não tem consumidor literal identificado.

### Jobs

A origem não possui jobs ativos, mas preserva cerca de 800 falhas no histórico de 7 dias, coerente com jobs removidos.

O destino possui 25 jobs ativos. Quatro contratos falham:

- weekly-matchmaking — chama public.match_weekly_players, função inexistente;
- purge-telemetry-retention-daily — referência ambígua table_name;
- reset-pg-stat-statements-weekly — chama pg_stat_statements_reset sem o schema extensions;
- detect_slow_queries_hourly — chama digest sem o schema extensions.

No snapshot, esses erros somavam 10 falhas em 7 dias. Três jobs ainda não tinham executado desde a criação: deal-risk-digest-daily, purge_old_telemetry_daily e purge-rollback-snapshots-daily.

### Migrations

Os ledgers vivos são exatamente idênticos:

- 242 versões;
- primeira 20260511141832;
- última 20260802150910;
- nomes e hashes de statements iguais.

O repositório contém 595 SQLs. Portanto, o diretório local não é uma sequência replayável equivalente ao ledger.

Problemas objetivos:

- 15 SQLs não seguem timestamp estrito de 14 dígitos;
- 8 grupos de prefixo numérico duplicado;
- três timestamps de 14 dígitos duplicados: 20260104143930, 20260104170152 e 20260104181000;
- 10 ocorrências de CREATE POLICY IF NOT EXISTS, sintaxe inválida no PostgreSQL;
- 80 statements textualmente destrutivos/de manutenção exigem classificação;
- replay local é bloqueado;
- migrations 20260830000000, 20260830000001 e 20260830000002 não constam no ledger.

O estado vivo é misto: race_leaderboard_view se parece com a correção preparada de 30/08, mas request_id/spin_prize_wheel e as novas funções de roteamento não existem. Isso prova aplicação manual ou parcial fora do ledger, não uma onda aplicada integralmente.

## Reconciliação de dados

Nas 378 tabelas comuns:

- 315 têm a mesma contagem;
- 63 divergem;
- 54 têm mais linhas no destino;
- 9 têm menos linhas no destino.

As três lacunas mais relevantes são:

| Tabela                 | Origem | Destino | Classificação                                     |
| ---------------------- | -----: | ------: | ------------------------------------------------- |
| quote_sync_inbound_log |      1 |       0 | log operacional; validar retention                |
| webhook_inbound_dedupe |      1 |       0 | dedupe operacional; validar retention             |
| quotes_inbound         |    155 |     154 | provável lacuna de negócio; reconciliar por chave |

Outras divergências com destino menor:

| Tabela                | Origem | Destino | Leitura inicial               |
| --------------------- | -----: | ------: | ----------------------------- |
| cron_failure_alerts   |  2.163 |      37 | histórico/retention           |
| db_rollback_snapshots |  8.752 |   6.515 | retenção de snapshots         |
| error_logs            |  1.184 |   1.132 | logs voláteis                 |
| maintenance_log       |  1.437 |     788 | logs voláteis                 |
| notifications         |  2.139 |       6 | retenção ou migração seletiva |
| slow_query_alerts     |      5 |       3 | histórico operacional         |

O destino tem crescimento/seed próprios em 54 tabelas, incluindo sales 900 para 954, salespeople 9 para 18, territories 6 para 18, products 0 para 17, stock_movements 0 para 478, accounts 1 para 100, client_portfolio 0 para 100 e audit_logs 386 para 6.933. Uma ressincronização cega destruiria ou duplicaria dados válidos do destino.

## Tabelas e colunas parcialmente interligadas

### Tabelas sem chamada literal .from

Há 63 tabelas do destino sem chamada literal .from em src ou Edge. Entre elas, 51 também estão vazias:

ab_tests, ai_sales_insights, buying_committee, cadence_ab_assignments, cadence_advanced_stats, cadence_enrollments, call_intelligence_triggers, call_metric_benchmarks, cohort_analyses, competitors_pricing, contact_send_time_profile, critical_moment_notifications, dead_letter_replay_audit, embedded_report_tokens, entity_versions, experiment_assignments, experiment_variants, experiments, follow_up_notifications, league_history, mfa_verification_attempts, mql_qualifications, password_history, pipeline_inspections, price_protection_rules, pricing_rules, product_stock_log, product_usage_events, quote_conversion_audit, race_daily_snapshots, race_user_daily_checkins, race_user_preferences, report_executions, report_schedules, salesperson_performance_telemetry, sdr_performance_settings, security_events, session_activity, sms_verification_codes, user_2fa, user_2fa_backup_codes, user_2fa_log, user_mfa_settings, user_permissions_cache, webauthn_challenges, webauthn_credentials, webhook_events, webhook_inbound_log, webhook_logs, website_visitor_logs e win_loss_insight_comments.

Esses são candidatos a completar, documentar ou descontinuar, não candidatos automáticos a DROP. Funções, triggers, cron, SQL dinâmico e integrações externas podem ser consumidores indiretos.

As 12 sem .from literal mas com dados são audit_log, coaching_scorecard_config, cron_failure_alerts, data_access_log, db_rollback_snapshots, lead_score_history, maintenance_log, migration_log, monthly_sales_summary, plan_rollback_ddl, roles e territories. Dados existentes elevam a exigência de preservação.

### Colunas totalmente nulas em tabelas não vazias

Foram encontradas 137 colunas totalmente nulas. Muitas são opcionais legítimas, mas os grupos abaixo revelam fluxos ainda sem produtor:

- activities: delete_reason, deleted_at, deleted_by, mql_qualified_at;
- accounts: country, domain, employee_count, last_aggregated_at, notes, parent_account_id, website;
- clients: activated_at, delete_reason, deleted_at, deleted_by, last_enrichment_id, last_interaction_at, user_id;
- commissions: approved_at, approved_by, paid_at, paid_by, payment_notes, rule_id;
- products: cost_synced_at, default_cost, delete_reason, deleted_at, deleted_by;
- quotes: approved_at, contract_start_date, contract_end_date, external_reference, external_seller_id, notes, pdf_url, rejected_at, rejection_reason, sent_at, subscription_type;
- sales: account_id, approved_at, approved_by, buyer_persona_id, campaign_id, churn_reason, churned_at, cnae_code, contract_renewal_date, cost_center_id, external_seller_id, lost_reason, loss_reason_id, municipality_code, payment_method, product, proposal_probability, proposal_template_id, quote_id, receipt_url, referral_code, won_reason;
- suppliers: address, cnpj, delete_reason, deleted_at, deleted_by, notes, phone;
- tasks: client_id, completed_at, deleted_at, due_time, source_insight_id.

O apêndice traz a lista completa.

## Classificação das diferenças

### Intencionais ou fortemente justificadas

- destino como superconjunto de relações/colunas;
- soft delete, saved filters e novos índices;
- status entry/exit em estoque, alinhado ao frontend;
- novos gatilhos proposal_opened e price_clicked;
- novos estados de client_portfolio;
- race_leaderboard contando won e completed;
- remoção de exec_sql no destino;
- upgrades pg_net e vector;
- dados seed/crescimento exclusivos do destino;
- tabelas vazias de funcionalidades ainda em construção.

### Perdas ou regressões reais/prováveis

- migrate-helper reintroduzida e implantada;
- views sem security_invoker abertas a anon;
- 30 funções SECURITY DEFINER executáveis por anon, acima da allowlist de 11;
- policies administrativas baseadas em raw_user_meta_data;
- login_attempts e salesperson_xp expostos a anon;
- trigger tr_log_lead_stage_transition ausente no destino;
- quotes_inbound com uma linha a menos;
- cinco RPCs chamadas e ausentes;
- quatro relações chamadas e ausentes;
- duas quick actions apontando para Edge inexistente;
- 7 Edge Functions que não compilam;
- 34 Edge Functions com typecheck quebrado;
- 4 jobs com contrato quebrado;
- ledger/migrations/tipos divergentes;
- mocks persistentes ou apresentados como produção;
- CI/E2E não verde.

### Divergências que exigem decisão de negócio

- retenção de logs, notificações e snapshots;
- 69 tabelas adicionais na publicação Realtime;
- 304 tabelas vazias;
- 137 colunas integralmente nulas;
- 63 tabelas sem consumidor literal;
- 6 pares/grupos de índices duplicados;
- 2 pares de views idênticas;
- report-exports sem consumidor literal;
- 63 Edge Functions sem invocação literal do frontend.

## Candidatos a limpeza — nenhuma exclusão autorizada

| Candidato                                                                                  | Evidência atual                       | Risco                                      | Decisão sugerida                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------ | ------------------------------------- |
| 8 módulos órfãos apontados por deps:check                                                  | sem import estático                   | feature futura/dinâmica                    | validar individualmente               |
| src/lib/bi/mockData.ts                                                                     | órfão e nominalmente mock             | demo/documentação                          | provável remoção após aprovação       |
| AnimatedXPParticles, AnimatedLevelIndicator, AnimatedFireIndicator, AnimatedCoinsIndicator | órfãos                                | efeitos visuais futuros                    | validar no design                     |
| src/utils/fuzzing.ts                                                                       | órfão                                 | utilitário de teste                        | mover para testes ou remover          |
| src/lib/schemas/commercial.ts                                                              | órfão                                 | contrato futuro                            | confirmar owner                       |
| src/components/ui/sonner.tsx                                                               | órfão                                 | wrapper UI                                 | confirmar se substituído              |
| bundle-stats/stats.html e stats.json                                                       | 9,5 MiB rastreados e ignorados        | perder baseline                            | mover para artefato de CI             |
| bun.lockb                                                                                  | rastreado e ignorado                  | fluxo Bun externo                          | escolher lock canônico                |
| três lockfiles                                                                             | package-lock, bun.lock e bun.lockb    | build divergente                           | padronizar após validação             |
| supabase/.temp rastreado                                                                   | estado de máquina/projeto             | quebrar tooling local                      | desversionar com runbook              |
| deployed.txt e local.txt                                                                   | inventários estáticos desatualizáveis | consumidores manuais                       | substituir por geração                |
| cinco remove-demos\*.ts                                                                    | sobreposição nominal                  | procedimento operacional                   | consolidar, não apagar cegamente      |
| graphify-out rastreado                                                                     | saída gerada                          | documentação histórica                     | definir política de artefato          |
| 6 grupos de índices duplicados                                                             | definição idêntica                    | regressão de performance se escolha errada | medir e aprovar DROP individual       |
| 2 pares de views idênticas                                                                 | definição idêntica                    | consumidores externos                      | deprecar antes de consolidar          |
| report-exports                                                                             | bucket vazio sem consumidor literal   | integração futura                          | confirmar owner                       |
| 51 tabelas vazias e sem .from literal                                                      | evidência parcial                     | consumidores indiretos/futuros             | jamais excluir sem owner e telemetria |

Os arquivos gerados somente durante esta auditoria serão revertidos/limpos do worktree por serem artefatos próprios da execução, não por uma decisão sobre os artefatos já versionados do projeto.

## Autorizações necessárias antes de executar o plano

| Ação                                            | Exige autorização explícita? |
| ----------------------------------------------- | ---------------------------- |
| Desativar migrate-helper implantada             | sim                          |
| Rotacionar qualquer segredo/chave               | sim                          |
| Alterar tabela, coluna, constraint ou índice    | sim                          |
| Alterar RLS, policy, grant ou default ACL       | sim                          |
| Alterar função, trigger, view, enum ou extensão | sim                          |
| Alterar cron, publicação Realtime ou storage    | sim                          |
| Corrigir código local em branch isolada         | após aprovação do lote       |
| Excluir arquivo candidato a lixo                | sim, nominalmente            |
| Reconciliar/copiar dados                        | sim, após backup e dry-run   |
| Deploy, canário, tráfego ou release             | sim                          |

## Plano de melhorias e correções em 100 etapas

O plano abaixo é deliberadamente sequencial. Uma etapa que envolva alteração no banco, exclusão, rotação de credencial, deploy ou tráfego somente poderá começar após a autorização explícita correspondente. Cada lote deve ser uma mudança pequena, reversível, coberta por evidência antes/depois e executada em branch/worktree isolado.

### Fase 1 — contenção dos riscos críticos

1. Instituir congelamento temporário de releases até classificar os achados P0/P1; saída: registro de exceções e responsáveis; gate: aprovação do owner técnico.
2. Bloquear o uso operacional de migrate-helper sem alterar o banco; saída: decisão documentada entre desativação imediata ou janela controlada; gate: autorização explícita para ação externa.
3. Rotacionar a chave fixa encontrada no código e invalidar qualquer cópia exposta; saída: evidência de revogação sem registrar o segredo; gate: autorização do proprietário das credenciais.
4. Rotacionar as credenciais de origem potencialmente expostas pela ação credentials; saída: chaves de serviço e conexão antigas invalidadas; gate: plano de impacto e rollback aprovado.
5. Substituir migrate-helper por resposta segura de indisponibilidade e depois removê-la do deploy; saída: endpoint incapaz de revelar credenciais; gate: validação de que nenhum fluxo legítimo depende dele.
6. Ampliar o scanner de segredos para hexadecimal, URLs de banco, service-role e chaves fora dos padrões atuais; saída: teste de regressão que detecta o incidente sem falso sucesso.
7. Auditar logs de acesso disponíveis para migrate-helper e credenciais relacionadas; saída: linha do tempo de chamadas, IPs e ações, preservando dados sensíveis; gate: escalonamento se houver indício de uso indevido.
8. Conter as nove views exclusivas do destino que expõem dados a anon; saída: proposta individual de grant/security_invoker; gate: autorização antes de qualquer DDL.
9. Conter as funções mutáveis acessíveis por anon, priorizando restore, soft delete, cadence e gamificação; saída: matriz de EXECUTE atual/proposto; gate: autorização antes de REVOKE ou alteração de função.
10. Registrar um baseline imutável e somente leitura de código, schemas, grants, policies, jobs e contagens; saída: snapshot versionado com timestamp e hash para comparar todas as fases seguintes.

### Fase 2 — governança de ambientes e fonte de verdade

11. Definir formalmente origem, destino, staging e produção, eliminando a ambiguidade entre README, CLAUDE.md, config e MCPs; saída: matriz canônica de ambientes aprovada.
12. Corrigir a documentação que afirma que migrate-helper foi removida quando ela está presente no código e implantada na origem; saída: documentação factual, sem alterar runtime.
13. Criar manifesto versionado de deploy com projeto, função, hash, verify_jwt e data; saída: rastreabilidade entre Git e Supabase.
14. Adicionar fingerprint não secreto do projeto às pipelines e comandos operacionais; saída: proteção contra execução no projeto errado.
15. Inventariar as Edge Functions efetivamente implantadas no destino; saída: comparação código × origem × destino; gate: acesso de leitura ao inventário do destino.
16. Consolidar a matriz verify_jwt declarada, implantada e exigida pelo código; saída: divergências classificadas por risco e fluxo público legítimo.
17. Atribuir owner e criticidade para módulos, tabelas, funções, jobs, buckets e integrações; saída: catálogo com SLA e contato de decisão.
18. Implantar verificação somente leitura de drift em CI; saída: alerta para divergência de schema, função, policy, grant, cron, storage e deploy, sem correção automática.
19. Documentar e testar a restauração em ambiente isolado; saída: RPO, RTO e evidência de restore utilizável antes de mudanças estruturais.
20. Formalizar gates de alteração: backup, dry-run, revisão SQL, autorização, observabilidade e rollback; saída: checklist obrigatório por PR e release.

### Fase 3 — reconciliação de dados origem/destino

21. Comparar todas as tabelas comuns por PK, contagem e hash em lotes, sem copiar dados; saída: catálogo linha a linha de igualdade, ausência e conflito.
22. Investigar a diferença 155→154 em quotes_inbound; saída: identificação exata da linha ausente e decisão entre retenção intencional e perda real.
23. Investigar quote_sync_inbound_log e webhook_inbound_dedupe com uma linha na origem e zero no destino; saída: classificação de retenção, reprocessamento ou perda.
24. Validar a retenção dos sete conjuntos históricos muito menores no destino, incluindo cron, rollback, erros, manutenção e notificações; saída: política e evidência por conjunto.
25. Preservar e explicar os 54 conjuntos que cresceram no destino; saída: prova de que são dados legítimos, seed ou operação nova, sem sobrescrita pela origem.
26. Classificar cada coluna exclusiva do destino como evolução intencional, compatibilidade ou drift; saída: matriz de coluna, default, nulabilidade, consumidor e owner.
27. Classificar as 137 colunas integralmente nulas sem tratá-las automaticamente como lixo; saída: decisão manter, implementar, deprecar ou preencher, sempre sem DDL nesta fase.
28. Atribuir owner às 304 tabelas vazias e prazo às que representam funções parciais; saída: catálogo vazio intencional × não conectado × abandonado.
29. Validar as 31 relações exclusivas do destino e os dados existentes em cinco delas; saída: decisão de negócio individual, sem drop implícito.
30. Reconciliar contratos de dados e storage, incluindo privacidade, owner-folder e URLs públicas; saída: plano de migração/correção por bucket e fluxo.

### Fase 4 — segurança do banco e autorização

31. Corrigir, após autorização, security_invoker e grants das nove views exclusivas do destino; saída: testes positivos e negativos por papel.
32. Revisar o SELECT anônimo de mv_competitive_ranking e seu refresh; saída: decisão pública/autenticada e política operacional do materialized view.
33. Substituir policies baseadas em raw_user_meta_data por fonte autoritativa de papéis; saída: testes que provem que o usuário não eleva o próprio privilégio.
34. Corrigir as policies permissivas de login_attempts, maintenance_log e salesperson_xp; saída: matriz CRUD anon/auth/service-role aderente ao negócio.
35. Auditar individualmente as 30 funções SECURITY DEFINER executáveis por anon contra a allowlist de 11; saída: justificativa, owner, autenticação e menor privilégio para cada uma.
36. Reescrever ou revogar soft_delete_record, restore_deleted_record, restore_record e get_deleted_records; saída: whitelist, auth.uid, autorização de papel e ausência de vazamento de e-mail.
37. Corrigir o bypass por comparação com NULL em add_salesperson_xp, add_league_weekly_xp, increment_combo e increment_goal_progress; saída: regressão que impede alteração por anônimo ou usuário alheio.
38. Proteger claim_pending_cadence_tasks e rotinas equivalentes de fila; saída: execução limitada ao worker autorizado e com claim atômico.
39. Reduzir grants de tabelas e default ACLs amplos; saída: menor privilégio comprovado por suíte de autorização; gate: aprovação por objeto antes do REVOKE.
40. Criar suíte automatizada de segurança SQL para RLS, grants, views e SECURITY DEFINER; saída: teste obrigatório no CI com personas anon, auth, admin e service-role.

### Fase 5 — integridade, performance e operação do banco

41. Decidir se tr_log_lead_stage_transition deve ser restaurado no destino ou aposentado; saída: compatibilidade validada e autorização antes de trigger DDL.
42. Validar todas as 1.350 constraints do destino com dados reais e cenários de concorrência; saída: lista de violações, constraints não validadas e contratos intencionais.
43. Medir os seis grupos de índices duplicados e propor remoção nominal; saída: EXPLAIN/uso/tamanho antes de solicitar autorização para cada DROP.
44. Avaliar e, se aprovado, criar índices para as 11 FKs sem cobertura; saída: comparação de planos e custo de escrita antes/depois.
45. Decidir a divergência entre índice parcial e global de quotes; saída: requisito de consulta e benchmark que justifique a definição escolhida.
46. Corrigir os quatro contratos de cron quebrados: matchmaking ausente, purge ambíguo, reset de estatísticas e digest sem schema; saída: jobs executando com sucesso em staging.
47. Validar os 25 jobs ativos, inclusive os que ainda não rodaram; saída: owner, agenda, timeout, idempotência, alerta e execução controlada por job.
48. Revisar as 69 tabelas adicionais em Realtime; saída: decisão por tabela baseada em consumidor, volume, privacidade e custo.
49. Qualificar schemas de extensões e funções operacionais; saída: independência segura de search_path e compatibilidade com versões pg_net/vector do destino.
50. Definir manutenção, refresh de materialized views, vacuum/analyze e limites de queries; saída: runbook medido, sem jobs genéricos que falhem silenciosamente.

### Fase 6 — migrations, schema e tipos

51. Gerar um baseline canônico do banco vivo após as contenções aprovadas; saída: schema reproduzível sem dados sensíveis.
52. Reconciliar as 242 entradas do ledger com os 595 arquivos SQL locais; saída: cada arquivo marcado aplicado, preparatório, legado, inválido ou apenas operacional.
53. Catalogar os 15 nomes de migration SQL não conformes sem renomear arquivos já aplicados; saída: mapa de compatibilidade e regra prospectiva.
54. Resolver os três timestamps duplicados com migrations corretivas novas, nunca reescrevendo histórico aplicado; saída: ordenação determinística em banco limpo.
55. Substituir os dez usos inválidos de CREATE POLICY IF NOT EXISTS por SQL idempotente suportado; saída: replay limpo e repetível.
56. Separar as 80 migrations com comandos destrutivos/manutenção e exigir gate explícito; saída: CI que bloqueia DROP/TRUNCATE/DELETE amplo sem aprovação.
57. Executar replay completo em banco efêmero; saída: banco criado do zero, migrations verdes e diff final explicado contra o destino.
58. Regenerar Database Types a partir do destino autorizado; saída: 398 tabelas, 35 views e funções refletidas sem edições manuais.
59. Criar teste de contrato entre chamadas .from/.rpc e objetos vivos/tipos; saída: falha explícita para relações ou RPCs inexistentes.
60. Bloquear merge quando ledger, migrations, tipos e schema vivo divergirem sem allowlist documentada; saída: gate de CI reproduzível.

### Fase 7 — Edge Functions e contratos de backend

61. Corrigir as sete Edge Functions com erro de sintaxe/importação; saída: bundle Deno limpo por função, com teste que cobre o parser.
62. Corrigir as 34 Edge Functions com typecheck quebrado; saída: deno check verde sem mascarar erros com exclusões globais.
63. Corrigir os 28 testes Deno atualmente falhos, separando dependência de ambiente de defeito real; saída: suíte determinística com mocks explícitos.
64. Corrigir o lint de \_shared/unsubscribe.ts e validar os contratos de retry; saída: utilitários compartilhados verdes.
65. Criar matriz de autenticação/autorização para as 170 funções; saída: ator permitido, recurso, owner e verificação de escopo por endpoint.
66. Centralizar o service-role e exigir checagem de propriedade em deal-probability, lead-scoring, customer-success-360, pipeline-pulse e equivalentes; saída: nenhum ID arbitrário aceito sem autorização.
67. Substituir CORS wildcard pelo resolvedor dinâmico e allowlist configurada; saída: preflight e respostas consistentes em todas as funções.
68. Aplicar timeout, circuit breaker, idempotência e request ID conforme criticidade; saída: padrões compartilhados e testes de falha de provedores.
69. Corrigir as duas quick actions sem Edge, as quatro relações ausentes e as cinco RPCs ausentes; saída: implementar contrato real ou remover chamada após decisão de produto.
70. Comparar verify_jwt, código e deploy de cada função na origem/destino; saída: inventário implantado validado e deploy somente após autorização.

### Fase 8 — verdade funcional e integrações

71. Substituir os dados aleatórios de enrich-lead por provedor real ou estado explicitamente indisponível; saída: nenhum dado falso persistido como verificado.
72. Corrigir UsageAnalytics para consumir telemetria verdadeira; saída: nenhuma venda convertida em page view e nenhuma métrica de login inventada.
73. Separar LiveIntelligenceFeed em modo real e demo inequivocamente rotulado; saída: produção nunca apresenta feed fixo como evento ao vivo.
74. Fazer RecordingSummaryDrawer usar timestamps, confiança e trechos reais; saída: ausência de conteúdo fabricado quando a análise não existe.
75. Tornar PriceElasticity dependente de dados/modelo versionado ou rotulá-lo como simulação; saída: retirada das alegações Live Model/neural sem evidência.
76. Integrar WhatsApp a um provedor real e persistir status entregue pelo provedor; saída: nenhum sent/sucesso otimista antes de confirmação.
77. Remover ou rotular aleatoriedade em dicas de IA, reações, velocímetro e battlecards; saída: contrato visual coerente entre demo e produção.
78. Gerar PDF verdadeiro para win/loss e alinhar bucket, MIME, privacidade e URL assinada; saída: arquivo válido, acessível apenas a autorizados.
79. Corrigir pipeline-pulse e customer-success-360 para o modelo relacional real; saída: joins, ownership e previsões verificáveis, sem suposição orders.user_id=account_id.
80. Concluir ou manter honestamente desabilitadas as integrações de assinatura digital, WebAuthn e provedores incompletos; saída: UI sem promessa de sucesso para serviço indisponível.

### Fase 9 — qualidade, testes e higiene do repositório

81. Elevar cobertura unitária nos fluxos P0/P1 antes de refatorar; saída: testes de autorização, cálculo, persistência e falha externa.
82. Corrigir a configuração de ambiente do workflow E2E/CI; saída: Supabase de teste explícito e nenhum throw por variável ausente antes dos testes.
83. Triar os 483 testes Playwright por domínio e estabilizar o conjunto mínimo crítico; saída: smoke verde e backlog nominal para skips/falhas.
84. Executar acessibilidade autenticada nas 175 rotas; saída: violações priorizadas por impacto, com regressão automática nas rotas críticas.
85. Aplicar Prettier em lotes pequenos e separados de mudanças funcionais; saída: reduzir os 1.666 arquivos fora do padrão sem esconder diffs de lógica.
86. Corrigir as 14 vulnerabilidades npm por risco e compatibilidade; saída: upgrades testados, com plano específico para mudanças major de Vite/Vitest/React Router.
87. Eliminar ciclos de chunks e impor orçamento também a App e WinLoss; saída: build previsível, carregamento medido e budgets representativos.
88. Validar nominalmente com o proprietário os oito módulos órfãos antes de mover ou excluir; saída: decisão registrada para cada arquivo.
89. Padronizar lockfile e artefatos gerados, incluindo bundle-stats, supabase/.temp e graphify-out; saída: lista de limpeza aprovada, sem exclusão por inferência.
90. Consolidar README/docs/runbooks e arquivar relatórios históricos como históricos; saída: fonte de verdade atual com data, ambiente e status explícitos.

### Fase 10 — validação, release e tráfego real

91. Executar somente as limpezas nominais aprovadas pelo usuário; saída: PR separado, diff mínimo e evidência de que build/testes permanecem verdes.
92. Deprecar objetos de banco candidatos antes de qualquer remoção; saída: telemetria, aviso, janela de compatibilidade e autorização individual para DROP.
93. Entregar correções em PRs pequenos por risco/domínio; saída: revisão, testes, migration reversível e rollback próprios por PR.
94. Criar clone de staging e ensaiar migrations, reconciliação e deploy end-to-end; saída: relatório de dry-run sem modificar origem ou produção.
95. Fazer canário com parcela controlada de usuários/tráfego; saída: comparação de erros, latência, autorização e métricas de negócio contra baseline.
96. Implantar observabilidade e SLOs para frontend, Edge, banco, jobs e integrações; saída: dashboards e alertas acionáveis com owner.
97. Executar testes de carga, concorrência e degradação; saída: limites conhecidos para filas, RLS, Realtime, storage e APIs externas.
98. Conduzir UAT com casos reais por módulo e aceite dos responsáveis de negócio; saída: funcionalidades completas, parciais e adiadas explicitamente registradas.
99. Confirmar backup restaurável, rollback ensaiado e autorização final de release; saída: go/no-go assinado, sem pressupor que código mergeado está pronto.
100.  Implantar gradualmente em produção, observar tráfego real e encerrar somente após a janela de estabilidade; saída: métricas dentro dos SLOs, ausência de regressão e aceite final — este é o critério de pronto.

## Apêndice A — colunas integralmente nulas no destino

O levantamento encontrou 137 colunas integralmente nulas nas tabelas que contêm registros. Isso é sinal de contrato não exercitado, não prova de lixo. Agrupamento exato por tabela na fotografia auditada:

- access_denied_logs: ip_address;
- account_activities: contact_id, description;
- accounts: country, domain, employee_count, last_aggregated_at, notes, parent_account_id, website;
- activities: delete_reason, deleted_at, deleted_by, mql_qualified_at;
- audit_log: user_id;
- audit_logs: actor_email, actor_id, ip_address, user_agent;
- auto_task_queue_settings: last_run_created_count, last_run_date;
- churn_alert_settings: email_from, email_reply_to;
- client_portfolio: assigned_by, lead_source;
- clients: activated_at, delete_reason, deleted_at, deleted_by, last_enrichment_id, last_interaction_at, user_id;
- commissions: approved_at, approved_by, paid_at, paid_by, payment_notes, rule_id;
- csat_ces_surveys: contact_email, trigger_event;
- data_access_log: user_id;
- deal_stage_transitions: transitioned_by;
- deal_stakeholders: evidence_quote, last_interaction_at, linkedin_url, notes;
- expansion_opportunities: notes, playbook_id;
- external_seller_map: external_name;
- forecast_snapshots: owner_id, segment;
- maintenance_log: error_message;
- notifications: archived_at, expires_at, read_at;
- nps_surveys: score_ces;
- orders: cancellation_reason, notes, user_id;
- products: cost_synced_at, default_cost, delete_reason, deleted_at, deleted_by;
- quote_items: billing_period, product_id;
- quotes: approved_at, contract_end_date, contract_start_date, external_reference, external_seller_id, notes, pdf_url, rejected_at, rejection_reason, sent_at, subscription_type;
- quotes_inbound: seller_email, source_updated_at;
- race_cars: preset_id;
- race_reactions: season_id;
- renewals: notes;
- revenue_forecasts: owner_id;
- sales: account_id, approved_at, approved_by, buyer_persona_id, campaign_id, churn_reason, churned_at, cnae_code, contract_renewal_date, cost_center_id, external_seller_id, lost_reason, loss_reason_id, municipality_code, payment_method, product, proposal_probability, proposal_template_id, quote_id, receipt_url, referral_code, won_reason;
- sales_battles: created_by, winner_id;
- salespeople: avatar_url;
- slow_query_alerts: acknowledged_at, acknowledged_by;
- squads: created_by;
- stage_conversion_metrics: owner_id;
- stock_movements: performed_by, reference_id;
- suppliers: address, cnpj, delete_reason, deleted_at, deleted_by, notes, phone;
- support_tickets: assignee_email, description, external_id, requester_email, tags;
- tasks: client_id, completed_at, deleted_at, due_time, source_insight_id;
- teams: delete_reason, deleted_at, deleted_by;
- v4_callback_alert_settings: updated_by;
- win_loss_analyses: competitor, lost_stage.

## Apêndice B — catálogo completo das tabelas vazias no destino

A consulta exata COUNT(\*) em cada uma das 398 tabelas public encontrou as 304 tabelas abaixo sem linhas no snapshot. Vazio não significa inútil, incompleto ou autorizável para exclusão; várias têm código, migrations, jobs ou funcionalidades futuras associados.

- **A:** ab_tests, account_contacts, account_plans, active_sessions, activity_audit_logs, agenda_events, ai_agent_actions, ai_agent_runs, ai_narrative_cache, ai_sales_insights, api_tokens, approval_decisions, approval_requests, approval_workflows, asset_usage_logs, available_spins.
- **B:** bitrix24_sync_logs, blocked_ips, buying_committee, buying_committee_members, buying_signals.
- **C:** cadence_ab_assignments, cadence_ab_tests, cadence_advanced_stats, cadence_alert_templates, cadence_enrollment_rules, cadence_enrollments, cadence_funnel_rules, cadence_outcome_rules, cadence_steps, cadence_tasks, cadences, call_coaching_scorecards, call_conversation_metrics, call_critical_moments, call_insights, call_intelligence_triggers, call_logs, call_metric_benchmarks, call_objection_analysis, call_objections, call_question_analysis, call_questions, call_recording_ingest_jobs, call_recordings, call_sentiment_timeline, call_transcripts, campaign_health_alerts, category_metrics, challenge_progress, channel_credentials, channel_interactions, chat_conversations, chat_messages, circuit_breaker_events, client_churn_alerts_state, client_interactions, client_renewals, coaching_actions, coaching_opportunities, coaching_sessions, coaching_skill_benchmarks, cohort_analyses, collectible_badges, combo_tracking, commercial_approval_requests, commission_bonus_awards, commission_bonuses, commission_rules, committee_coverage_history, committee_extraction_runs, competitive_chat_messages, competitor_mentions, competitors_pricing, competitors_registry, contact_engagement_score, contact_send_time_profile, conversation_analyses, critical_moment_notifications, cs_tickets, custom_reports.
- **D:** daily_challenge_progress, daily_challenges, daily_streak_achievements, dashboard_layouts, dead_letter_replay_audit, deal_chat_history, deal_committee_coverage, deal_probability_scores, deal_risk_signals, deal_stage_history, deal_velocity_alerts, demand_forecasts, dialer_queue_items, dialer_queues, digital_signatures, document_signers, duplicate_block_logs.
- **E:** edge_retry_events, email_bulk_drafts, email_bulk_jobs, email_engagement_score_history, email_engagement_scores, email_logs, email_opt_outs, email_tracking_events, embedded_report_tokens, engagement_score_history, enriched_company_intelligence, entity_versions, executive_briefings, expansion_playbooks, experiment_assignments, experiment_variants, experiments.
- **F:** feature_flags, follow_up_audit_logs, follow_up_notifications, follow_up_settings, follow_up_templates, follow_up_territory_rules, forecast_accuracy, forecast_confidence_scores, forecast_deal_contributions, forecast_narrative_dead_letters.
- **G:** geo_access_logs, geo_blocked_regions.
- **I:** icp_data, inbound_reply_events, integration_autotest_jobs, integration_autotest_settings, integration_connections, integration_health_checks, integration_logs, intent_audit_logs, ip_whitelist.
- **K:** known_devices, kudos.
- **L:** lead_assignments, lead_churn_risk, lead_detailed_logs, lead_intelligence_metrics, lead_routing_log, lead_routing_rules, lead_score_explanations, lead_score_trends, lead_source_configs, league_history, league_members, leagues, login_alerts, login_attempts.
- **M:** message_templates, mfa_verification_attempts, mood_entries, mql_qualifications.
- **N:** notification_preferences.
- **O:** objection_library, objections_library, onboarding_steps, outbound_messages.
- **P:** password_history, password_reset_requests, performance_bets, performance_impact_factors, permissions, person_intelligence, personal_assistant_briefings, personal_assistant_nudges, pipeline_coverage_recommendations, pipeline_coverage_snapshots, pipeline_inspection_snapshots, pipeline_inspections, playbook_items, playbook_progress, playbooks, portfolio_settings, price_protection_rules, pricing_rules, prize_wheel_spins, product_stock_log, product_usage, product_usage_events, progressive_goals, prospect_cadences, push_subscriptions.
- **Q:** qbr_reports, query_telemetry, quota_attainment_actions, quota_attainment_alerts, quota_attainment_forecasts, quota_attainment_predictions, quote_conversion_audit, quote_sync_inbound_log, quote_sync_logs.
- **R:** race_badges, race_daily_snapshots, race_events, race_overlay_telemetry, race_powerups, race_rivalries_persistent, race_scoring_rules, race_team_members, race_teams, race_unlocks, race_user_daily_checkins, race_user_preferences, rank_change_notifications, ranking_notifications, rate_limit_logs, rate_limit_settings, reauthentication_requests, report_embed_tokens, report_executions, report_schedules, role_permissions.
- **S:** sale_notifications_audit, sales_enablement_assets, salesperson_badges, salesperson_coaching_aggregates, salesperson_commission_configs, salesperson_custom_field_values, salesperson_leagues, salesperson_performance_telemetry, salesperson_preferences, salesperson_xp, saved_filters, scheduled_report_runs, scheduled_reports, scheduled_sends, score_change_logs, sdr_alert_configs, sdr_alert_history, sdr_performance_settings, security_alert_history, security_alert_settings, security_events, semantic_index, send_time_profiles, sequence_enrollments, sequence_step_assignments, sequence_step_executions, sequence_step_variants, sequence_steps, sequences, session_activity, skill_assessments, skill_development_tracks, sla_policies, sla_violations, sms_verification_codes, squad_members, stage_bottleneck_insights, stage_velocity_baselines, supplier_order_items, supplier_orders, supplier_risk_assessments.
- **T:** task_assignments, task_catalog, team_custom_fields, territory_history, tournament_matches, tournament_participants, tournaments, twilio_call_sessions.
- **U:** user_2fa, user_2fa_backup_codes, user_2fa_log, user_app_settings, user_mfa_settings, user_permissions_cache, user_winloss_preferences.
- **V:** v4_callback_alerts.
- **W:** web_vitals_samples, webauthn_challenges, webauthn_credentials, webhook_deliveries, webhook_events, webhook_inbound_dedupe, webhook_inbound_log, webhook_logs, webhooks, website_visitor_logs, weekly_challenges, weekly_matchups, whatsapp_conversations, whatsapp_template_versions, win_calibration_buckets, win_loss_insight_comments, win_loss_insights, win_probability_calibrations, win_probability_deal_calibrations, winloss_alert_settings, winloss_webhook_alerts, winloss_webhook_dead_letters, winloss_webhook_deliveries, winloss_webhook_dispatch_metrics, winloss_webhook_replay_audit, winloss_webhook_replay_invocations, winloss_webhook_subscriptions, workflow_executions, workflows.
- **X:** xp_adjustments, xp_history.

## Apêndice C — evidências reprodutíveis e limitações

Comandos de qualidade executados no worktree isolado:

- npm ci: aprovado;
- npm run typecheck: aprovado;
- npm run lint: aprovado;
- npm test: 50 arquivos aprovados, 1 ignorado; 458 testes aprovados, 2 ignorados;
- npm run build: aprovado, com ciclos de chunks advertidos;
- npm run deps:check: aprovado com oito órfãos advertidos;
- npm run security:secrets: aprovado, mas insuficiente para o segredo hexadecimal encontrado;
- npm run format:check: reprovado em 1.666 arquivos;
- npm audit: 14 vulnerabilidades no conjunto completo e quatro moderadas em produção;
- análise do bundle de produção: 2.423,0 KiB gzip e 414 chunks, dentro dos budgets existentes;
- npx playwright test --list: 483 testes em 46 arquivos.

Execuções recentes consultadas no GitHub:

- [CI na main, commit d150ec2ee](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/33316944920): falhou antes dos passos úteis, em aproximadamente três segundos;
- [Enterprise Checks no mesmo commit](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/33316944924): falhou de forma equivalente;
- [E2E recente](https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/33267860372): 9 aprovados, 92 reprovados e 382 ignorados;
- o workflow E2E não fornece as variáveis VITE do Supabase exigidas pelo cliente.

Limitações desta auditoria:

- não houve alteração, cópia, exclusão ou correção de dados;
- não houve DDL, alteração de policy/grant/job/storage, rotação de segredo ou deploy;
- o inventário de Edge Functions implantadas no destino não estava observável pelos acessos disponíveis;
- não foram executados fluxos E2E autenticados contra produção;
- contagens e nulidade são uma fotografia temporal e podem mudar com tráfego;
- referências dinâmicas ou consumidores externos podem não aparecer na busca literal; por isso ausência de referência nunca foi usada como autorização de exclusão;
- migrations locais não foram aplicadas em nenhum projeto vivo durante a análise.

## Critérios de aceite da remediação

O sistema somente poderá ser declarado pronto quando, cumulativamente:

- nenhum P0/P1 permanecer aberto ou aceito sem owner, prazo e mitigação;
- origem, destino, migrations, ledger, tipos, deploys e documentação estiverem reconciliados;
- testes unitários, contratos SQL/Edge, smoke, E2E crítico, segurança e acessibilidade estiverem verdes;
- mocks e simulações estiverem removidos da produção ou inequivocamente identificados;
- backup e rollback tiverem sido restaurados/ensaiados;
- não houver exclusão ou alteração estrutural sem aprovação nominal;
- canário e produção tiverem tráfego real observado dentro dos SLOs;
- responsáveis técnicos e de negócio tiverem dado aceite explícito.

Até que esses critérios sejam atendidos, a classificação correta é **sistema funcional em evolução, com riscos críticos conhecidos**, e não 90% pronto para produção.
