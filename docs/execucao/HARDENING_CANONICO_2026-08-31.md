# Hardening do Supabase canônico — 2026-08-31

## Resultado executivo

O destino foi identificado por conexão e DNS como o projeto Supabase
`usyxfpqlsspldubptrdl`. A análise encontrou divergências reais entre as
migrations versionadas e o catálogo vivo, além de exposições não documentadas.

Este lote entrega código, migrations, testes de contrato, simulações por role e
um executor de rollback forçado. Nenhuma tabela, coluna, função ou registro é
removido. Os únicos `DROP` são de policies inseguras, recriadas quando o fluxo
continua necessário.

## Cenários simulados antes da aplicação

As oito migrations do lote foram executadas no banco canônico dentro de uma
única transação, seguidas de:

1.  pós-condições de catálogo para views, policies, ACLs, RPCs, índices e
    buckets;
2.  troca de role para `anon` e `authenticated`;
3.  registro sintético de falha de login e leitura apenas do resumo agregado;
4.  troca do IP de origem para provar que uma tentativa isolada não bloqueia a
    vítima, payload de IP inválido registrado sem contaminar uma origem válida
    e ataque distribuído que produz lockout agregado e rejeita a 11ª tentativa;
5.  tentativas negativas de SELECT cru, DELETE operacional, claim interno e
    hard delete sem identidade;
6.  exceção sentinela obrigatória para reverter toda a transação.

Resultado: as dez entradas — oito migrations e dois arquivos de asserção —
compilaram e todas as pós-condições passaram. Uma consulta posterior confirmou
que RPC, bucket, índice e coluna sentinela continuavam ausentes, provando o
rollback integral.

A simulação iterativa também barrou uma primeira versão que comparava a coluna
`login_attempts.ip_address` (`text`) como `inet`. A incompatibilidade apareceu
antes de qualquer escrita persistente, foi corrigida e a simulação integral foi
reexecutada com sucesso.

Arquivos reproduzíveis:

- `scripts/db/simulate-migrations-via-mcp.ts`;
- `supabase/tests/canonical_post_migration_assertions.sql`;
- `supabase/tests/canonical_role_simulation.sql`.

## Correções implementadas

### Segurança e RLS

- nove views internas passam a `security_invoker=true`;
- `anon` perde acesso às views internas e ao materialized ranking completo;
- `race_spectator_view` permanece como contrato público específico;
- removidas cinco policies placeholder `deleted_at IS NULL AND true` que
  expunham registros ativos;
- oito tabelas de configuração interna deixam de ter SELECT público;
- `maintenance_log` deixa de aceitar DELETE anônimo pela policy `ALL`;
- `login_attempts` deixa de expor linhas e INSERT direto para `anon`;
- o fluxo pré-login usa RPCs agregadas, validação de e-mail, IP derivado do
  gateway, lockout por par e-mail/IP, contenção agregada de ataques
  distribuídos e limite de dez eventos por minuto;
- sucesso de login é derivado do e-mail do JWT, nunca do payload do navegador.

### RPCs privilegiadas

- `claim_pending_cadence_tasks` e limpeza de cache passam a `service_role`;
- quatro RPCs de teste de cron deixam de ser públicas;
- mutadores de XP/combo/meta deixam de aceitar `anon`;
- 2FA valida o próprio usuário ou administração;
- o logger de segurança exige autenticação e valida payload;
- helpers genéricos de soft delete usam allowlist real, `auth.uid()` e RBAC;
- `hard_delete_record` deixa de confiar no UUID de admin enviado pelo cliente.

### Jobs e performance

- `detect_slow_queries` usa `extensions.digest`;
- retenção de telemetria elimina a ambiguidade de `table_name`;
- reset semanal usa `extensions.pg_stat_statements_reset`;
- detecção de cron travado usa `ON CONFLICT DO NOTHING` contra concorrência e
  a migration garante os dois índices únicos exigidos pelos conflitos;
- `match_weekly_players` é recriada, serializada, idempotente e alterna a ordem
  deterministicamente por semana;
- onze FKs recebem índice líder; nenhum dos 42 pares de índices duplicados foi
  removido, pois isso exige validação nominal separada.

A atualização lenta de `sales` filtra pela PK `id`; portanto, adicionar outro
índice não resolveria os 388 ms médios. O custo está em triggers/RLS e deve ser
tratado em profiling próprio, sem criar índice cosmético.

### Storage

- limites e MIME allowlists para os cinco buckets existentes;
- a allowlist de gravações cobre todos os formatos aceitos pela UI, inclusive
  `audio/m4a` e `audio/vnd.wave`; tipos genéricos do navegador são
  normalizados pela extensão antes do upload;
- criação explícita e privada de `winloss-reports`;
- policies de áudio e snapshots passam de `public` para `authenticated`;
- a policy de export é renomeada para refletir o comportamento real.

### Contratos de negócio pendentes no banco

As migrations já versionadas abaixo foram incluídas na simulação e devem ser
aplicadas antes deste lote porque estão ausentes no catálogo vivo:

- `20260827000001_harden_webhooks_portfolio_and_idempotency.sql`;
- `20260830000001_secure_prize_wheel_spins.sql`;
- `20260830000002_harden_lead_routing.sql`.

A migration da leaderboard de corrida já está aplicada/equivalente; sua
execução idempotente também foi simulada para permitir registro fiel no ledger.

## Gate de Edge Functions

O inventário HTTP dos 170 entrypoints versionados encontrou:

- 81 com resposta 200;
- 85 ausentes com 404;
- 3 com resposta 500;
- 1 com resposta 503.

O Supabase CLI retorna HTTP 403 ao listar ou implantar functions no projeto. O
MCP canônico possui ping/invoke, mas não oferece operação de deploy. Assim, o
deploy das Edge Functions continua tecnicamente bloqueado por privilégio de
Management API; não será declarado como concluído por presença no GitHub.

## Evidências locais

- ESLint com zero erro e zero warning;
- TypeScript `tsc --noEmit` aprovado;
- 469 testes Vitest aprovados e dois testes condicionais ignorados;
- 13 testes Deno puros de contrato/autorização aprovados;
- suíte Deno integrada de cron aprovada no typecheck; execução viva condicionada
  às credenciais isoladas do workflow;
- `deno check` da Edge Function alterada aprovado;
- build Vite/PWA de produção aprovado;
- 483 casos Playwright descobertos e compilados por `--list`;
- scanner do repositório sem credencial literal de `service_role`.

A execução E2E completa não foi disparada contra o backend canônico: os specs
incluem INSERT/UPDATE/DELETE e dados de autenticação reais. Executá-los sem um
ambiente isolado seria uma mutação de produção sem escopo seguro. Esse gate deve
rodar em staging efêmero ou com fixture/tenant descartável.

Em especial, a migration `20260831130003_fix_campaign_health_cron.sql` só pode
ser aplicada depois do deploy da versão correspondente de
`campaign-health-alert`, pois o novo cron usa `X-Cron-Secret`. A ordem segura é:

1. publicar a Edge Function compatível;
2. executar seu smoke test com segredo inválido e válido;
3. aplicar a migration do trigger;
4. validar a próxima execução do cron e a resposta em `net._http_response`.

## Critério de 10/10

O lote só alcança 10/10 quando, cumulativamente:

- PR incorporado à `main` com CI aprovado;
- migrations aplicadas e registradas no ledger canônico;
- Edge Functions necessárias publicadas;
- zero 404/500/503 nos jobs ativos;
- zero falha SQL de cron durante 24 horas;
- smoke tests por role aprovados no ambiente vivo;
- tráfego real dos fluxos de login, roda de prêmio, roteamento, cadência,
  relatórios e campanha observado sem regressão.

Até esses gates, o status correto é **código e SQL validados; produção ainda
não pode ser classificada como 10/10**.
