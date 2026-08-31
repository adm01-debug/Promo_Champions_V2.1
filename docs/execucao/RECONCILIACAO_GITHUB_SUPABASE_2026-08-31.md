# Reconciliação GitHub × Supabase canônico — 2026-08-31

## 1. Escopo e regra de decisão

Esta reconciliação verifica se as correções atribuídas aos agentes Cline/Codex estão:

1. incorporadas à branch `main` do repositório remoto;
2. validadas por testes proporcionais ao risco;
3. comprovadamente implantadas no projeto Supabase canônico `usyxfpqlsspldubptrdl`.

Nenhuma escrita remota em banco, Auth, Storage ou Edge Functions foi executada. A identidade do destino e o estado anterior à mudança não puderam ser comprovados por uma conexão autenticada; por isso, aplicar DDL ou publicar funções violaria o gate de ambiente canônico e poderia alterar o projeto errado.

## 2. Veredito executivo

| Superfície | Resultado | Evidência |
|---|---|---|
| `main` local × `origin/main` | Idênticos no início da reconciliação | ambos em `ce5dd167954f6ef20855c31a02675657f1169e32` após `git fetch --prune origin` |
| PR #66 — correções funcionais | Incorporado ao GitHub | merge `c59a4f21a80f733fc54780b1dfedd30a9b439b3a` |
| PR #67 — auditoria/handoff | Incorporado ao GitHub | merge `aa0a12a427713923d68aa939d9188e5d0b3cff0f` |
| PR #68 — status v1 | Incorporado ao GitHub | merge `ce5dd167954f6ef20855c31a02675657f1169e32` |
| PR #69 — status revisado pelo Cline | Não incorporado | PR aberto, head observado `86e7fada4ae54756ea0f43aff71e540d8b65539d`, altera apenas um Markdown e está `UNSTABLE` |
| Banco Supabase canônico | Não verificável e não atualizado | MCP de produção retorna HTTP 401; CLI vinculada retorna HTTP 403; GitHub Actions não possui secrets/variables de deploy |
| Banco self-hosted disponível | Rejeitado como destino | identidade e catálogo não correspondem ao projeto `usyxfpqlsspldubptrdl` |

Conclusão: o código do PR #66 está no GitHub, mas não existe evidência suficiente de que as quatro migrations e as vinte Edge Functions alteradas tenham sido implantadas no Supabase canônico. Presença no repositório não equivale a deploy.

## 3. Rastreabilidade do pacote funcional

O merge do PR #66 alterou 129 arquivos, incluindo:

- aplicação React, hooks, serviços e testes;
- 20 entrypoints `supabase/functions/*/index.ts`;
- bibliotecas compartilhadas de autenticação, integridade de webhook, CORS, rate limit e request ID;
- quatro migrations recentes:
  - `20260827000001_harden_webhooks_portfolio_and_idempotency.sql`;
  - `20260830000000_fix_race_leaderboard_status.sql`;
  - `20260830000001_secure_prize_wheel_spins.sql`;
  - `20260830000002_harden_lead_routing.sql`.

O repositório não contém workflow que execute `supabase db push` ou `supabase functions deploy`. Também não há secrets/variables de GitHub Actions disponíveis para essa publicação. Portanto, o merge do PR #66 não implantou automaticamente essas mudanças.

## 4. Identidade e acesso ao banco

### 4.1 Evidências positivas

- `supabase/config.toml` aponta para `usyxfpqlsspldubptrdl`.
- O vínculo local do Supabase CLI identifica `usyxfpqlsspldubptrdl`, projeto `Promo Champions - V2`.

Essas evidências identificam a intenção do repositório, mas não concedem acesso ao catálogo vivo.

### 4.2 Bloqueios reproduzidos

| Rota | Operação somente leitura | Resultado |
|---|---|---|
| MCP `supabase_producao` | health/connection/overview/migrations | `Management API 401: Unauthorized` |
| MCP `supabase_producao` | `SELECT` com `read_only:true` | `Management API 401: Unauthorized` |
| Supabase CLI vinculada | `supabase migration list --linked` | HTTP 403 por privilégios insuficientes |
| GitHub Actions | listagem de nomes de secrets/variables | nenhum secret/variable disponível |

O MCP self-hosted acessível anteriormente aponta para outro servidor e possui catálogo incompatível. Ele não foi usado como substituto e não recebeu escritas.

### 4.3 Motivo para não aplicar as migrations

As quatro migrations não são um pacote inofensivo: criam/substituem views e funções, alteram tabelas, removem policies e modificam grants. Sem `SELECT` de pré-condições, diff do catálogo vivo, ledger e backup verificável, um push seria não determinístico.

Além disso, o replay local integral do histórico de migrations não é reproduzível no estado atual. A validação isolada já encontrou, em sequência:

1. versões duplicadas no ledger local;
2. recriação não idempotente do índice `idx_versions_entity` após normalização temporária dos nomes;
3. referência à relação `public.deals`, que não é criada pelo histórico versionado do repositório.

Logo, `supabase db push` não é um mecanismo seguro para reconciliar o destino enquanto essas divergências não forem resolvidas por baseline/diff nominal.

## 5. Validação do código incorporado

### 5.1 Aplicação Node/React

| Verificação | Resultado |
|---|---|
| ESLint com zero warnings | aprovado |
| TypeScript `tsc --noEmit` | aprovado |
| Vitest | 458 aprovados, 2 ignorados, 0 falhas |
| Build Vite/PWA | aprovado; permanecem avisos de chunks circulares e import dinâmico/estático duplicado |

O número alto de cobertura anteriormente reportado não representa todo o sistema: `vitest.config.ts` limita a instrumentação a um conjunto curado de arquivos Tier 1.

### 5.2 Edge Functions — compilação real

Com Deno 2.9.5 e `deno check --node-modules-dir=none` nos 170 entrypoints:

| Resultado | Quantidade |
|---|---:|
| aprovados | 129 |
| falhas de sintaxe/parser | 7 |
| falhas TypeScript | 34 |
| total de falhas | 41 |

As 20 Edge Functions alteradas diretamente no PR #66 estão entre as 129 que compilam. Isso valida o recorte modificado, mas não autoriza declarar a camada Edge completa como saudável.

O PR #69 descreve a mesma execução como 5 aprovados e 158 falhas ambientais de resolução npm. Essa interpretação é incorreta: ela mistura o `node_modules` da aplicação com o grafo Deno. O modo isolado acima resolve as dependências e expõe 41 falhas reais.

### 5.3 Testes Deno

Antes deste follow-up:

- 19 arquivos de teste adicionados/modificados no PR #66: 50 aprovados e 1 falha determinística;
- suíte recursiva sem rede/credenciais: 538 aprovados e 30 falhas.

Foram corrigidas quatro falhas determinísticas:

1. o teste de autorização de `campaign-health-alert` dependia do estilo de aspas do código-fonte;
2. dois testes do contrato `CRMEvent` procuravam o campo na mensagem agregada, embora o contrato exponha o campo em `details`;
3. `_shared/unsubscribe.ts` fazia `.in()` diretamente com array dinâmico, fora do guard-rail canônico `chunkedIn`.

Depois das correções:

| Verificação | Resultado |
|---|---|
| recorte Deno do PR #66 | 51 aprovados, 0 falhas |
| regressões diretamente corrigidas | 20 aprovados, 0 falhas |
| suíte Deno recursiva | 543 aprovados, 26 falhas |

As 26 falhas restantes dependem majoritariamente de fixtures/credenciais/serviço local ausentes e de testes que inicializam `Deno.serve` durante import. Elas não foram mascaradas nem convertidas em skips.

### 5.4 P0 encontrado pelo CI desta reconciliação

O workflow de adoção de `withRequestId` expôs uma falha que o script `security:secrets` não detectava: `migrate-helper` permanecia no HEAD apesar de `supabase/config.toml` e `CLAUDE.md` declararem a função aposentada. Não há consumidores no repositório. A implementação residual continha uma chave operacional literal e uma ação capaz de devolver credenciais administrativas.

A função não foi apagada nem implantada. O código versionado foi convertido em tombstone: preserva preflight, propaga request ID e responde `410 Gone` para qualquer operação. A leitura de segredos e a ação de credenciais foram removidas. O scanner foi ampliado para bloquear novas atribuições literais de segredos operacionais. A credencial que esteve no histórico ainda precisa ser rotacionada e tratada na remediação de histórico; remover o literal do HEAD não prova rotação.

## 6. CI do PR #69

No último head concluído antes da atualização concorrente do Cline (`dc147dcc`):

- aprovados: lint/typecheck, build, unit tests, bundle size, quality e quality-gate;
- falha: Lighthouse, porque o job tenta auditar `localhost:5173` sem iniciar o preview;
- E2E e simulação E2E permaneciam em execução no momento do snapshot;
- o PR está `UNSTABLE` e não deve ser usado como prova de CI integralmente verde.

Durante esta reconciliação, o Cline publicou o head `86e7fada`; os jobs Lighthouse e E2E desse novo head ainda estavam pendentes no snapshot. Como o novo commit continua restrito ao mesmo Markdown e não altera o workflow nem inicia o preview, ele não corrige a causa técnica do Lighthouse.

O PR #69 modifica apenas `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md`; não implanta código, migrations ou Edge Functions.

## 7. Correções deste follow-up

| Arquivo | Correção | Risco |
|---|---|---|
| `supabase/functions/_shared/unsubscribe.ts` | consulta de opt-out migrada para `chunkedIn`, preservando falha fechada e chunks de 200 | baixo; fluxo e erro público preservados |
| `supabase/functions/campaign-health-alert/authz_test.ts` | assertions independentes do estilo de aspas | somente teste |
| `supabase/functions/run-retry-tests/contract_test.ts` | assertions usam `details.field`, contrato real do validator | somente teste |
| `supabase/functions/migrate-helper/index.ts` | implementação aposentada convertida em tombstone `410`, sem leitura/exposição de credenciais | redução de superfície P0; função não apagada |
| `supabase/functions/migrate-helper/security_test.ts` | regressão impede reativação silenciosa da superfície administrativa | somente teste |
| `scripts/security/check-no-committed-service-role.ts` | scanner passa a detectar atribuições literais de segredos operacionais | guard-rail local/CI |

Nenhuma tabela, coluna, constraint, índice, policy, função SQL, trigger, view, enum, extensão, privilégio, bucket, job ou registro foi alterado.

## 8. Gate obrigatório para reconciliar o Supabase

Antes de qualquer escrita no canônico, o operador precisa fornecer uma destas rotas:

- token Supabase Management API com acesso ao projeto `usyxfpqlsspldubptrdl`; ou
- DSN PostgreSQL somente leitura para a auditoria e credencial separada de escrita apenas para a janela aprovada.

Com acesso válido, executar nesta ordem:

1. provar identidade (`project ref`, host, banco e usuário);
2. exportar ledger e catálogo de schemas/tabelas/colunas/constraints/índices/RLS/policies/funções/triggers/views/enums/extensões/grants/jobs/storage;
3. comparar semanticamente as quatro migrations com o estado vivo;
4. separar objetos já presentes, diferenças intencionais e perdas reais;
5. gerar SQL mínimo, transacional e reversível;
6. obter autorização nominal para cada DDL/GRANT/policy afetado;
7. aplicar primeiro em staging equivalente;
8. executar testes de contrato, RLS por role, RPC e Edge Functions;
9. aplicar no destino em janela aprovada e registrar hashes/evidências pós-deploy.

Até esse gate ser atendido, o estado correto é: **GitHub parcialmente reconciliado; Supabase canônico não verificável e deliberadamente não modificado**.
