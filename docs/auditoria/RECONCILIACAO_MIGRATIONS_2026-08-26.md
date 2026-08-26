# Reconciliação de migrations — evidência de segurança

**Data:** 26 de agosto de 2026
**Método:** leitura do ledger do projeto de origem pelo conector somente leitura,
inventário estático do diretório `supabase/migrations` e tentativa local de
inicialização. Nenhuma migration foi aplicada em banco remoto.

## Conclusão executiva

O diretório de migrations do repositório **não pode ser usado como trilha de
deploy ou de reconstrução do banco** até uma reconciliação formal. Isso não é
evidência de que tabelas vazias ou objetos ausentes sejam lixo; é evidência de
que os históricos não representam o mesmo ledger.

Renomear migrations históricas, apagar arquivos ou aplicar o diretório em
destino seria uma alteração destrutiva de rastreabilidade. Essas ações ficam
proibidas nesta onda, inclusive para os arquivos que parecem malformados.

## Evidências medidas

| Medida | Resultado |
| --- | ---: |
| Arquivos SQL em `supabase/migrations` | 593 |
| Prefixos numéricos distintos no repositório | 578 |
| Versions no ledger do banco de origem | 2.354 |
| Versions do repositório presentes no ledger de origem | 3 |
| Versions do ledger de origem ausentes do repositório | 2.351 |
| Versions do repositório ausentes do ledger de origem | 575 |
| Grupos de prefixo repetido no repositório | 6 |
| Arquivos sem prefixo numérico reconhecível | 6 |

As únicas três versões locais que coincidem com o ledger de origem são:

1. `20241231000000_saved_filters.sql`
2. `20241231000001_entity_versions.sql`
3. `20260317222414_c12099ab-6e90-45d0-a69b-233eb11444c6.sql`

Essa coincidência de apenas três versões confirma que uma correção mecânica de
nomes não é segura: não há base para inferir a ordem, o conteúdo já aplicado
ou o projeto canônico de cada arquivo.

## Defeitos locais bloqueadores de replay

### Prefixos duplicados

| Prefixo | Arquivos |
| --- | --- |
| `20250102` | `audit_log`, `saved_filters`, `versioning` |
| `20251228` | `add_soft_delete`, `advanced_permissions`, `move_extensions_to_schema` |
| `20260104143930` | `audit_trail`, `webhooks_system` |
| `20260104170152` | `additional_indexes`, `stored_procedures` |
| `20260104181000` | `materialized_views_enhanced`, `stored_procedures_additional` |
| `20260530` | `add_missing_fk_indexes`, `enable_rls_and_remove_env_risk`, `idempotent_tables_if_not_exists` |

O `supabase start` local parou no primeiro grupo repetido por chave duplicada
em `supabase_migrations.schema_migrations`. Portanto, a validação de schema
local não é válida enquanto esse bloqueio existir.

### Arquivos sem prefixo reconhecível

- `202601050000ad_additional_indexes.sql`
- `202601050000ma_materialized_views.sql`
- `202601050000so_soft_delete_integration.sql`
- `20260105ab_new_ab_tests.sql`
- `20260105fe_new_feature_flags.sql`
- `20260105we_new_webhooks.sql`

Há também três grupos com prefixos de oito dígitos (`20250102`, `20251228` e
`20260530`), em desacordo com o timestamp de quatorze dígitos usado pelo
Supabase CLI atual. Os nomes com sufixo UUID não são, por si, um defeito: o
problema analisado é apenas o prefixo que forma a versão do ledger.

## Diferença entre perda real e diferença intencional

Ainda não é possível classificar os 2.351 objetos do ledger de origem ausentes
do repositório como perda real. Eles podem incluir histórico de desenvolvimento,
migrations compactadas, correções diretas no projeto de origem ou uma linha de
produto diferente. Da mesma forma, as 575 versões locais ausentes do ledger de
origem podem pertencer a outro projeto ou a uma exportação incompleta.

O projeto de destino não pôde ser catalogado: todas as consultas de leitura do
conector retornaram que a infraestrutura de catálogo (`exec_sql` ou token de
Management API) não está configurada. Não foi executado bootstrap porque ele
alteraria o projeto de destino.

## Plano seguro de reconciliação, antes de qualquer alteração de schema

1. Confirmar por escrito qual URL é o **origem canônico**, qual é o **destino
   canônico** e se o destino deve reproduzir o estado atual ou apenas uma
   seleção de domínios.
2. Habilitar somente leitura do catálogo no destino e exportar seus ledgers,
   tabelas, colunas, índices, constraints, RLS, grants, funções, triggers,
   views, enums, extensões e jobs.
3. Gerar um snapshot de schema de cada banco e comparar por assinatura de
   objeto, não apenas por nome de arquivo.
4. Construir uma matriz `origem × destino × repositório`, marcando cada
   diferença como intencional, desconhecida ou perda confirmada.
5. Criar uma nova migration de baseline/aditiva somente para diferenças
   confirmadas, com rollback testado em staging.
6. Somente depois decidir o destino dos arquivos históricos inválidos; essa
   decisão exige autorização explícita antes de renomear, arquivar ou apagar
   qualquer um deles.

## Estado desta onda

- Nenhuma tabela, coluna, constraint, índice, policy, função, trigger, view,
  enum, extensão, privilégio, job ou migration remoto foi alterado ou apagado.
- A migration nova de roleta permanece **preparada localmente** e depende da
  reconciliação acima antes de qualquer aplicação remota.
