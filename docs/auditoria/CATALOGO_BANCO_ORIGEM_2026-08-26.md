# Catálogo do banco de origem — leitura forense

**Data:** 26 de agosto de 2026
**Banco consultado:** projeto de origem acessível pelo conector em modo somente
leitura.
**Banco de destino:** não catalogável no momento; o conector responde que o
catálogo SQL/Management API não foi configurado. Nenhum bootstrap foi rodado,
pois isso alteraria o destino.

> **Atualização de fechamento:** a matriz canônica desta coleta está em
> [MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md](MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md).
> Ela corrige a contagem total de colunas de public para 7.723, registra 25 FKs
> candidatas a índice por ausência de prefixo líder e confirma sete falhas
> estruturais. O destino continua classificado como **não observável**, nunca
> como ausente.

## Escopo e método

Foram feitas consultas `SELECT` em catálogos PostgreSQL (`pg_class`,
`pg_constraint`, `pg_indexes`, `pg_policies`, `pg_proc`, `pg_trigger`,
`pg_type`, `pg_extension`, `cron.job` e `supabase_migrations`). Não houve DDL,
DML, aplicação de migration, alteração de policy, grant ou job.

Esse é um inventário de **estado**, não uma autorização para excluir objetos.
Uma tabela sem linhas, uma view pouco usada ou uma migration sem correspondência
local continuam sendo estruturas potencialmente necessárias.

## Inventário consolidado do schema `public`

| Tipo de objeto | Quantidade | Observação |
| --- | ---: | --- |
| Tabelas/partições | 391 | 390 com RLS habilitado |
| Colunas | 7.723 | 5.086 em tabelas/partições, 2.547 em views e 90 em MVs |
| Views | 192 | 183 com `security_invoker=true` |
| Views materializadas | 4 | requerem validação de refresh antes de qualquer mudança |
| Índices | 1.170 | 632 únicos |
| Constraints `CHECK` | 347 | — |
| Chaves estrangeiras | 396 | — |
| Chaves primárias | 391 | — |
| Constraints únicas | 190 | — |
| Policies RLS | 927 | 118 ALL, 150 DELETE, 187 INSERT, 326 SELECT, 146 UPDATE |
| Funções | 1.280 | 530 `SECURITY DEFINER` |
| Triggers não internos | 385 | — |
| Enums | 15 | 90 valores |
| Jobs `pg_cron` ativos/configurados | 137 | inclui manutenção e integrações |
| Migrations no ledger | 2.354 | ver reconciliação separada |

## Extensões presentes

`http`, `hypopg`, `index_advisor`, `moddatetime`, `pg_cron`, `pg_graphql`,
`pg_net`, `pg_stat_statements`, `pg_trgm`, `pgcrypto`, `pgmq`, `plpgsql`,
`supabase_vault`, `unaccent`, `uuid-ossp` e `wrappers`.

Nenhuma extensão deve ser removida por não aparecer diretamente no frontend:
várias atendem jobs, RLS, índices, filas, chamadas HTTP ou automações do banco.

## Classificação de diferenças e pontos de atenção

### RLS

A única relação `public` sem RLS próprio é
`supplier_products_raw_history_p2026_11`. Ela é uma **partição** da tabela
`supplier_products_raw_history`, cuja tabela-pai possui RLS habilitado e
particionamento por `captured_at`. Isso é um caso que exige teste de acesso por
papel antes de ser tratado como falha; não é evidência suficiente para alterar
ou excluir uma policy.

### Functions `SECURITY DEFINER`

As 530 funções `SECURITY DEFINER` de `public` têm `search_path` fixado no
catálogo, um controle positivo importante. Dez são executáveis por `anon`; a
superfície deve ser tratada como contrato público, não removida por padrão:

- `check_login_rate_limit(text,text)`
- `fn_check_login_allowed(text,text,text,text)`
- `fn_global_search(text,integer,text[])`
- `fn_product_active_for_rls(uuid)`
- `fn_super_filtro(...)`
- `fn_super_filtro_facets(...)`
- `fn_super_filtro_price_range(...)`
- `get_catalog_bestseller_page(text,integer,integer)`
- `get_quote_token_by_value(text)`
- `submit_quote_response(text,text,text)`

As duas últimas são fluxos públicos de orçamento e exigem validação contratual
e testes de token/replay antes de qualquer alteração de grant. Os demais
aparentam servir autenticação ou catálogo público; esta é uma classificação
provisória baseada em assinatura e privilégio, não uma autorização de mudança.

### Views sem `security_invoker`

Nove views explicitamente públicas não usam `security_invoker` e são
selecionáveis por `anon` e `authenticated`:

`v_kit_component_media_public`, `v_kit_component_print_areas_public`,
`v_product_compositions_public`, `v_product_properties_public`,
`v_product_tags_public`, `v_products_public`, `v_suppliers_public`,
`v_tabela_preco_gravacao_oficial_public` e `v_variant_sale_prices_public`.

Pelo nome, pertencem ao catálogo público. Antes de mudar opções ou grants, é
necessário validar as colunas projetadas e o requisito comercial de leitura
anônima; a ausência de `security_invoker` isoladamente não define perda real.

### Jobs

Foram identificados quatro jobs ativos que executam `VACUUM ANALYZE`, inclusive
um job com múltiplos comandos. `VACUUM` não pode rodar dentro de uma transação
explícita; a correção depende de confirmar o executor usado por `pg_cron` e a
definição canônica dos jobs no destino. Não foram modificados.

## Limite atual de reconciliação

O catálogo do **destino** ainda não pode ser lido pelo MCP disponível. Por
isso, não é possível distinguir com rigor, objeto a objeto, entre:

1. estrutura intencional apenas no origem;
2. estrutura ainda não migrada para o destino;
3. perda real do repositório ou destino.

O bloqueio e a sequência segura para resolver isso estão em
[`RECONCILIACAO_MIGRATIONS_2026-08-26.md`](./RECONCILIACAO_MIGRATIONS_2026-08-26.md).

## Cruzamento estático com o repositório

Um cruzamento conservador foi feito entre os nomes literais usados em
`.from('…')` no frontend, Edge Functions e scripts e as 587 relações `public`
do banco de origem. O resultado é uma barreira adicional contra deploy no
projeto errado:

| Medida | Quantidade |
| --- | ---: |
| Referências literais `.from()` no código | 358 |
| Relações `public` no origem (tabelas, views e MVs) | 587 |
| Nomes coincidentes | 21 |
| Referências locais ausentes do catálogo do origem | 337 |
| Tabelas/partições do origem sem referência literal local | 370 |
| Views/MVs do origem sem referência literal local | 196 |
| Referências literais `.rpc()` no código | 118 |

Esse resultado **não prova que 370 tabelas ou 196 views são lixo**: jobs,
triggers, funções, chamadas dinâmicas e outros clientes podem utilizá-las. Ele
prova, porém, que o repositório e o projeto tratado como origem não podem ser
considerados automaticamente o mesmo contrato de schema. A baixa coincidência
impede qualquer inferência segura sobre colunas, RLS, grants ou migrations no
destino até a identidade dos dois projetos ser confirmada e o catálogo do
destino ficar disponível em leitura.
