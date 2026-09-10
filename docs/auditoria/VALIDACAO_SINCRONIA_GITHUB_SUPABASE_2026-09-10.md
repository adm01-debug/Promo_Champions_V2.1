# Validação de sincronia GitHub × Supabase — 2026-09-10

## 1. Escopo e conclusão

- Repositório: `adm01-debug/Promo_Champions_V2.1`, branch canônica `main`.
- Banco canônico confirmado pela Management API: `usyxfpqlsspldubptrdl`
  (`Promo_Champions_V2.1`, `us-east-2`, `ACTIVE_HEALTHY`).
- Modo da auditoria remota: somente leitura. Nenhuma DDL, DML, alteração de
  configuração, segredo, job, storage ou deploy de Edge Function foi executado.
- Resultado: o GitHub está íntegro no commit `f5370737d`, mas o repositório e o
  runtime Supabase **não estavam integralmente sincronizados**. O tipo TypeScript
  foi regenerado nesta mudança; migrations e Edge Functions permanecem sob gate
  porque há divergências incompatíveis com aplicação/deploy em massa.

## 2. GitHub e validação local

O `main` local e `origin/main` apontavam para o mesmo commit antes da mudança:
`f5370737dd7def26ffcafac8e4cb0435c025c593` (PR #122).

Validações executadas após regenerar os tipos e corrigir os cinco contratos que
o arquivo antigo mascarava:

| Gate | Resultado |
|---|---:|
| ESLint, zero warnings | passou |
| TypeScript (`tsc --noEmit`) | passou |
| Detector de credencial de serviço | passou |
| Vitest | 516 passaram, 2 ignorados |
| Cobertura de statements/linhas | 99,93% |
| Build Vite | passou |
| Budget de bundles | passou |

O primeiro replay falhou em dois testes de `useLeadRouting` porque o contrato
antigo exigia enviar `null`. A função viva declara os parâmetros como
`DEFAULT NULL`, e o tipo gerado corretamente os representa como opcionais. O
cliente e os testes foram ajustados para omitir parâmetros opcionais; o replay
completo posterior passou.

## 3. Inventário estrutural vivo

| Objeto/controle (`public`, salvo indicação) | Estado vivo |
|---|---:|
| Tabelas | 398 |
| Tabelas com RLS | 398 |
| Tabelas sem RLS | 0 |
| Policies | 1.003 |
| Views | 35 |
| Materialized views | 1 |
| Funções (assinaturas) | 292 |
| Funções `SECURITY DEFINER` | 228 |
| `SECURITY DEFINER` sem `search_path` fixado no catálogo | 0 |
| Índices | 1.365 |
| Índices inválidos | 0 |
| Constraints | 1.214 |
| Constraints não validadas | 0 |
| Tabelas sem chave primária | 0 |
| Triggers não internos | 370 |
| Enums | 25 |
| Extensões | 9 |
| Buckets | 6 |
| Objetos em storage | 0 |
| Jobs `pg_cron` | 25, todos ativos |

Este quadro prova integridade estrutural básica, mas não prova equivalência com
as migrations nem autorização correta de cada operação.

## 4. Drift do tipo TypeScript

Antes desta mudança:

- arquivo local: 22.829 linhas;
- geração do banco vivo: 25.026 linhas;
- 20 tabelas e 9 views vivas ausentes no arquivo local;
- 34 nomes de RPC remotos ausentes no arquivo local;
- `has_permission` e oito enums existiam apenas no tipo local;
- cinco incompatibilidades de nulabilidade afetavam `useLeadRouting`,
  `useLoginRateLimiter` e `useWebhooks`.

O arquivo `src/integrations/supabase/types.ts` foi regenerado diretamente do
projeto canônico. O modo sem HMAC da tela de webhooks continua representado por
string vazia porque `public.webhooks.secret` é `NOT NULL` no banco, enquanto a
Edge Function só assina quando a string é não vazia.

O workflow `Supabase Types Drift` existe, porém registra sucesso por *skip* se o
secret `SUPABASE_ACCESS_TOKEN` não estiver configurado no GitHub. Isso deve ser
corrigido com um token novo e de baixo privilégio; o token utilizado nesta
auditoria não deve ser reaproveitado porque foi transmitido em chat.

## 5. Ledger de migrations

| Medida | Resultado |
|---|---:|
| Arquivos SQL locais | 608 |
| Versões locais únicas | 595 |
| Entradas no ledger remoto | 256 |
| Conteúdo remoto correspondente a algum SQL local | 252/256 |
| Entradas remotas sem nome | 133 |

Os 123 nomes remotos não vazios têm correspondência lógica local. A maioria das
diferenças de versão é causada por importações/renomes com timestamps distintos,
e não autoriza reaplicar os 608 arquivos.

Quatro entradas recentes foram registradas sem o SQL integral no ledger:

- `20260902120000`: somente comentário apontando para o arquivo;
- `20260902121000`: `statements` nulo;
- `20260902180000`: `statements` nulo;
- `20260904190000`: `statements` nulo.

Os efeitos funcionais das migrations de `120000`, `180000` e `04190000` foram
confirmados no catálogo vivo. A de `121000` está incompleta: ainda existem dois
default grants `TRUNCATE`, para `anon` e `authenticated`, de propriedade de
`supabase_admin`. O SQL versionado executa `ALTER DEFAULT PRIVILEGES` sem `FOR
ROLE supabase_admin`, portanto atinge o papel executor e não o ACL efetivo.

Três arquivos posteriores não constam no ledger remoto:

1. `20260902221500_enable_rls_orphan_tables_and_fix_search_path.sql`;
2. `20260903000001_enable_rls_leads.sql`;
3. `20260903000002_fix_cron_project_ref.sql`.

Eles **não devem ser aplicados em lote**:

- a primeira migration pretende revogar grants e criar uma policy que não
  corresponde ao conjunto atual de policies de negócio; sua aplicação poderia
  interromper acesso legítimo;
- `public.leads` não existe no destino, logo a segunda migration falharia;
- não há project ref antigo ou canônico nos comandos atuais de `cron.job`, logo
  a terceira não tem efeito sobre o estado atual.

## 6. Edge Functions

- 169 diretórios locais possuem `index.ts`;
- 98 funções estão publicadas e `ACTIVE` no destino;
- nenhuma função remota está ausente do repositório;
- 71 funções locais não estão publicadas;
- das remotas, 74 têm `verify_jwt=false` e 24 têm `verify_jwt=true`;
- `supabase/config.toml` declara explicitamente somente 15 funções.

Classificação estática inicial das 71 locais não publicadas:

| Evidência de consumidor | Quantidade |
|---|---:|
| Referência no frontend | 50 |
| Referência em migration/automação | 4 |
| Referência apenas entre Edge Functions | 5 |
| Sem referência de runtime localizada | 12 |

Referência estática não comprova que a função deva ser publicada. Cada função
precisa de classificação de ambiente, `verify_jwt`, segredos, autenticação do
provedor, teste negativo, canário e rollback antes do deploy.

## 7. Advisors oficiais

### Segurança

Foram retornados 229 warnings e 1 informação:

- 204 RPCs `SECURITY DEFINER` executáveis por `authenticated`;
- 15 RPCs `SECURITY DEFINER` executáveis por `anon`;
- 8 funções marcadas com `search_path` mutável pelo Advisor;
- 1 materialized view (`mv_competitive_ranking`) exposta a `anon` ou
  `authenticated`;
- proteção contra senhas vazadas desabilitada;
- `plan_rollback_ddl` com RLS e sem policy (informação; pode ser deny-all
  intencional).

As oito funções sinalizadas pelo Advisor são `create_version`,
`check_failed_attempts`, `log_soft_delete`, `refresh_materialized_views`,
`reindex_tables`, `cleanup_deleted_records`, `update_2fa_updated_at` e
`cleanup_old_audit_logs`. Elas não são `SECURITY DEFINER` sem path segundo a
consulta específica anterior; o alerta alcança também funções invoker e deve ser
tratado por assinatura, owner e chamadas reais.

### Performance

- 811 ocorrências de chamada RLS não convertida em InitPlan;
- 401 casos de múltiplas policies permissivas;
- 479 índices potencialmente não usados;
- 6 pares de índices idênticos.

Os pares duplicados estão em `audit_log` (dois pares), `clients`,
`conversation_analyses`, `race_badges` e `saved_filters`. Nenhum índice foi
removido: exclusão exige confirmar constraints, workload, plano e janela.

## 8. Decisões e gates

### Seguro e executado no repositório

- regeneração determinística do tipo Supabase;
- correção dos cinco contratos TypeScript revelados;
- atualização dos testes afetados;
- validação CI completa.

### Não executado no banco/runtime

- revogação dos dois default grants de `supabase_admin`;
- alteração das 15/204 permissões de execução de RPC;
- alteração das oito funções apontadas pelo Advisor;
- alteração da exposição da materialized view;
- ativação da proteção contra senhas vazadas;
- remoção dos seis índices duplicados;
- aplicação/reparo do ledger;
- publicação das 71 Edge Functions.

Esses itens mudam produção e exigem pacotes separados, reversíveis e com aceite
explícito. A primeira correção recomendada é criar uma nova migration — sem
editar a migration histórica — contendo a revogação `FOR ROLE supabase_admin`,
validá-la em staging e só então aplicá-la ao destino com registro íntegro no
ledger.

## 9. Estado final desta rodada

O código proposto fica sincronizado com o schema tipável vivo e passa todos os
gates locais. O banco está saudável em controles estruturais básicos, mas **não
está 10/10 nem integralmente reconciliado com o repositório**. Os gaps de grants,
ledger, Advisors e deploy de funções permanecem documentados para execução em
lotes seguros.
