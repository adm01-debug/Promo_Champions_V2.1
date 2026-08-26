# Validação exaustiva — onda 0

Data: 26/08/2026
Escopo: validação somente leitura das correções e melhorias já presentes no branch. Nenhum código, banco remoto, deploy ou dado foi alterado.

## Resultado executivo

O sistema não atingiu condição de aceite 10/10. A base compilou e os testes unitários/focados principais passaram, mas a validação encontrou regressões de qualidade, lacunas de idempotência e segurança, impedimento de reprodução local de migrations e falhas reais de acessibilidade. Este documento separa comportamento confirmado, simulações e itens que exigem decisão antes de correção estrutural.

## Evidências de execução

| Frente | Evidência | Resultado |
| --- | --- | --- |
| Aplicação web | `typecheck`, `lint`, build e 458 testes Vitest | Aprovado; 2 testes deliberadamente ignorados |
| Regressão funcional focal | 32 testes de pedidos, assinaturas, roteamento, portfólio, navegação e atribuição | 32/32 aprovados |
| Funções Edge alteradas | 43 testes diretamente relacionados e bundle de 17 funções | 43/43 e 17/17 aprovados |
| Suite Edge completa | 573 testes Deno | 545 aprovados, 28 falharam por legado/integração sem ambiente, além dos pontos listados abaixo |
| Segurança | 43 testes de autenticação, assinaturas, CORS, limites e RBAC; 9 Vitest; `deno check` | Aprovado nos contratos exercitados |
| Banco/migrations | contrato de leaderboard, contrato de reatribuição, tipos e lint focal | Aprovado, mas replay integral bloqueado |
| E2E isolado com mocks | Playwright | 6/10 aprovados; 4 especificações/mocks desatualizados |
| Acessibilidade pública | axe nas rotas de autenticação e 404 | Reprovado: 2 problemas reais no login |
| Integridade | `git diff --check`, varredura de segredos | Aprovados |
| Formatação | `npm run format:check` | Reprovado em 1.681 arquivos; 3 regressões novas identificadas |
| Dependências órfãs | `npm run deps:check` | Exitou com sucesso, mas há 8 avisos preexistentes |

## Simulações e achados confirmados

### P0 — impede reprodução confiável do banco local

O `supabase start --debug` falha antes de executar migrations recentes por colisões de versões em `supabase_migrations.schema_migrations`. A primeira ocorre entre `20250102_audit_log.sql`, `20250102_saved_filters.sql` e `20250102_versioning.sql`; há outras colisões em `20251228`, `20260530`, `20260104143930`, `20260104170152` e `20260104181000`. Também existem sete nomes de arquivos SQL que a CLI ignora por não seguirem o padrão de versão.

Consequência: não foi possível simular um banco limpo para validar RLS, funções e triggers de ponta a ponta. Renomear migrations pode afetar históricos já aplicados; não foi realizado e exige plano de compatibilidade e autorização explícita.

### P1 — duplicação em alertas e webhooks

- `campaign-health-alert/index.ts` verifica deduplicação em memória e insere depois. Em invocações paralelas, ambas podem concluir que não existe alerta e gravar duplicatas; a migration atual cria índice não exclusivo.
- A mesma função insere em `notifications` sem usar os validadores e o particionamento adotados no restante das funções. Um item inválido pode interromper o lote inteiro.
- `inbound-email-webhook/index.ts` persiste cada evento e depois chama RPCs de supressão/pausa sem chave de idempotência, upsert ou transação. Uma repetição assinada ou falha parcial pode duplicar eventos e efeitos colaterais. Não há `UNIQUE (provider, message_id)` em `inbound_reply_events`.

Esses cenários foram avaliados por inspeção de fluxo, contratos e testes de borda; não foram disparados contra ambiente remoto.

### P1 — autorização incompleta no portfólio de clientes

A migration recente remove a policy de inserção própria, mas mantém `Users can update own client_portfolio`. Ao mesmo tempo, `ClientKanban.tsx` e `useClientPortfolio.ts` fazem atualização direta de status. Isso contradiz a intenção registrada de concentrar escrita em RPC/serviço e permite alteração sem bloqueio/auditoria. Não houve alteração em policy por depender de autorização explícita para mudanças no banco.

### P1 — acessibilidade do login

O axe encontrou duas violações reproduzíveis no `AuthFormCard`:

- botão de mostrar/ocultar senha sem nome acessível (WCAG 4.1.2, crítica), em torno da linha 235;
- contraste de `ou via credenciais` de 2,61:1 (WCAG 1.4.3, séria), em torno da linha 156.

### P2 — proteção temporária de WebAuthn

A Edge Function de WebAuthn responde 503 para operações não-OPTIONS e o hook bloqueia as ações. É uma contenção apropriada do fluxo criptograficamente incompleto anterior, mas passkeys estão indisponíveis. Deve ser tratada como mitigação temporária, não como funcionalidade concluída.

### P2 — cobertura insuficiente em funcionalidades novas

Não existem testes determinísticos para concorrência, repetição de `request_id`, saldo zero, ausência de vendedor, bloqueio direto via RLS ou rollback da roleta. Também faltam E2E isolados para UI de roteamento/portfólio, passkeys e estados vazio/erro/detalhe de pedidos.

### P2 — qualidade de testes e formatação

Dos 27 arquivos tocados recentemente que não passam no formatador, três são regressões novas:

- `src/hooks/useWebAuthn.ts`;
- `src/lib/safeNavigation.ts`;
- `src/lib/safeNavigation.test.ts`.

Quatro cenários Playwright falharam por fixtures ou expectativas desatualizadas: login mock não atende ao rate limiter/estado atual, chave de sessão incompatível, reset espera comportamento anterior do modal e seletor/heading Win/Loss incompatível. São falhas de automação até que se prove divergência de produto.

## Riscos preexistentes confirmados

- O limitador compartilhado trata um Bearer sintaticamente válido como autenticado sem verificar JWT; isso pode reduzir proteção quando funções usam o padrão permissivo.
- A proteção de rate limit é por instância e pode depender de cabeçalhos encaminhados pela plataforma.
- `dispatch-webhook` administrativo não possui allowlist explícita de destino, expondo risco de SSRF conforme a origem das URLs permitidas.
- `auto_assign_lead` é idempotente pelo lock do RPC, porém `lead_assignments.sale_id` não tem unicidade; inserção administrativa direta pode duplicar atribuições. A regra de negócio precisa definir histórico versus uma atribuição ativa.
- `lead_routing_rules.filter_state` e `filter_role` seguem sem consumo pelo novo fluxo de roteamento.

## Limites preservados

- Nenhuma tabela, coluna, função, policy, índice, trigger, view, enum, extensão, privilégio, job ou migration remota foi criada, alterada ou removida.
- Não houve execução de Edge Function, deploy, escrita de dado nem uso de credenciais contra os bancos.
- Um servidor local compartilhado já existente na porta 5173 não foi usado para testes autenticados, evitando interferência com outros agentes.
- Artefatos não versionados preexistentes foram preservados: `deno.lock`, `graphify-out/`, `supabase/.temp/cli-latest` e `supabase/functions/graphify-out/`.

## Próxima sequência segura

1. Corrigir as duas violações de acessibilidade e as três regressões de formatação, depois repetir axe e formatter.
2. Decidir e implementar idempotência persistente para alertas de campanha e e-mails inbound, com índices/constraints somente após aprovação explícita para alteração de banco.
3. Definir a regra de escrita do portfólio: RPC auditável ou policy de atualização restrita; só então alterar RLS e front-end em conjunto.
4. Criar plano de recuperação de histórico de migrations sem reescrever versões já aplicadas em ambientes existentes; validar em banco efêmero antes de tocar no destino.
5. Recriar fixtures Playwright isoladas e adicionar cenários de concorrência/RLS para roleta, roteamento e portfólio.
6. Reavaliar o retorno de WebAuthn somente com validação criptográfica e testes de registro, autenticação, replay e revogação.
