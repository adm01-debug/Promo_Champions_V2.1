# Replay do repo: medição e decisão — 17/11/2026

Registro da pergunta "o banco se reconstrói a partir de `supabase/migrations/`?".
Medido, não estimado. Quem pegar esta pergunta de novo: leia isto antes de abrir editor.

## Resposta curta

**Não, e não é um conserto de uma tarefa.** Replay das 692 migrations num Postgres
limpo: **271 arquivos falham, 377 erros**. A maior causa isolada é a tabela
fantasma `deals` (58 erros, 15%), mas ela é uma de ~8 relações fantasmas, mais
62 erros de coluna. Consertar `deals` sozinho não torna o repo replayável.

## Como foi medido

Postgres 16 local, base vazia, bootstrap mínimo do que o Supabase oferece de
fábrica (roles `anon`/`authenticated`/`service_role`, schemas `auth`/`storage`/
`extensions`/`private`, `auth.users`, `auth.uid()`/`role()`/`jwt()`, extensões
`pgcrypto`/`uuid-ossp`/`pg_trgm`/`btree_gin`). Em seguida, os 692 arquivos de
`supabase/migrations/` aplicados em ordem de versão, erro capturado por arquivo.

Parte dos erros é do ambiente, não do repo — ver "Ressalvas".

## Erros por categoria

| Erros | Arquivos | Categoria |
|------:|---------:|-----------|
| 144 | 37 | relação inexistente |
| 100 | 53 | outro |
| 62 | 15 | coluna inexistente |
| 28 | 24 | schema ausente |
| 18 | 13 | extensão ausente |
| 16 | 8 | objeto já existe |
| 8 | 2 | função inexistente |
| 1 | 1 | tipo inexistente |

## Objetos que o repo referencia e que não existem

| Erros | Objeto |
|------:|--------|
| 56 | `deals` |
| 29 | coluna `user_id` |
| 27 | `storage.objects` |
| 12 | `storage.buckets` |
| 10 | `public.semantic_index` |
| 9 | `users` |
| 6 | coluna `assigned_to` |
| 5 | coluna `is_admin` |
| 5 | `notes` |
| 5 | `cron.job` |
| 4 | `call_tracking` |
| 2 | `public.geo_access_logs` |
| 2 | `public.leads` |
| 2 | coluna `deal_id` |
| 1 | `public.migration_log` |

## O caso `deals`, em detalhe

`deals` **não existe em produção** — verificado contra o banco oficial:

```sql
SELECT c.relname, n.nspname FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE c.relname = 'deals';
-- []  (nenhum schema, nenhum tipo de objeto)
```

No repo, `deals` é usada **como relação em 84 statements, em 21 arquivos**:

| Statements | Forma |
|-----------:|-------|
| 28 | `CREATE INDEX ... ON deals(...)` |
| 21 | `FROM`/`JOIN deals` |
| 18 | `CREATE POLICY`/`TRIGGER ... ON deals` |
| 5 | `ALTER TABLE deals` |
| 4 | `UPDATE deals` |
| 3 | `CREATE INDEX ... USING` |
| 3 | `REINDEX`/`ANALYZE deals` |
| 1 | `REFERENCES deals(id)` |
| 1 | `DELETE FROM deals` |

Dos 21 arquivos, **19 estão num bloco contíguo** de dez/2025 a jan/2026
(`20251228*`, `20260104*`, `20260105*`): uma geração de schema escrita contra um
desenho que nunca chegou a este banco.

O projeto já havia decidido que `deals` é obsoleta, e está escrito em migration:

- `20261001203100_drop_legacy_rbac.sql:29`
  `-- deals nao existe no schema canonico (pipeline usa public.sales) — guardar.`
- `20261014000002_fix_concurrently_indexes.sql:18`
  `-- deals: tabela pode não existir em DBs de staging/teste sem seed completo`

Esses dois arquivos **já guardam** suas referências com `to_regclass` /
`pg_class`. Os outros 19 não.

Atenção ao contar: a palavra `deals` aparece muito mais vezes no repo como
**string** (`bet_type IN ('deals','revenue',...)`, `has_permission(uid,'deals',...)`)
e como **coluna** (`monthly_sales_summary.deals` = quantidade de vendas). Essas
são legítimas e não têm nada a ver com a tabela.

## Por que não foi consertado agora

Guardar os 19 arquivos restantes custaria ~84 edições em migrations históricas e
derrubaria 58 dos 377 erros — 15%. O repo continuaria não replayável por causa de
`semantic_index`, `call_tracking`, `notes`, `leads`, `geo_access_logs`,
`migration_log` e das 62 divergências de coluna. Entregar 15% de um replay é
vender aparência de progresso: ninguém pode confiar no resultado para reconstruir
nada, e o diff teria tocado 19 arquivos de história aplicada.

Tornar o repo replayável é um projeto com escopo próprio, não um item de fila.

## O que isso significa na prática

1. **Supabase Branching está seguro.** Ele clona produção e aplica só o que falta
   no ledger. Depois da reconciliação (PR #543) o ledger tem 692 = 692 arquivos,
   divergência zero nos dois sentidos — nada é replayado sobre o clone.
2. **`supabase db reset` / base nova a partir do repo não funciona.** Único
   caminho realmente quebrado, e ninguém o usa hoje.
3. **Produção não é reconstruível a partir do repo.** Ela nasceu de outra
   linhagem; as migrations de dez/2025–jan/2026 estão no ledger como aplicadas
   sem nunca terem rodado de fato contra um `deals` (ele nunca existiu).

## Ressalvas honestas

- `storage.objects` (27), `storage.buckets` (12), `cron.job` (5) e os 18 erros de
  extensão **não são bug do repo** — são o que o container não tem
  (`pg_cron`, `pg_net`, `supabase_vault`, `vector`, schema `storage` populado).
  Num Supabase real esses objetos existem. Da mesma forma, parte dos 28 "schema
  ausente" é limitação do bootstrap local.
- Por isso **377 não deve ser lido como "o repo tem 377 defeitos"**. O recorte
  confiável é a lista de relações fantasmas de `public` — `deals`,
  `semantic_index`, `call_tracking`, `notes`, `leads`, `geo_access_logs`,
  `migration_log` — e as divergências de coluna.
- Os 100 erros em "outro" não foram abertos um por um. **NÃO VERIFICADO**: motivo,
  tempo. É provável que a maioria seja cascata dos anteriores (objeto não criado
  → statement seguinte falha), mas isso não foi medido.

## Estado de backup do banco oficial

`GET /v1/projects/usyxfpqlsspldubptrdl/database/backups`:

```json
{"region":"us-east-2","walg_enabled":true,"pitr_enabled":false,
 "backups":[],"physical_backup_data":{}}
```

- **PITR desligado** — sem recuperação para um instante no tempo.
- **Nenhum backup restaurável listado** pela API.
- `walg_enabled: true` — o mecanismo físico está ligado.
- **Plano da organização: `free`** — verificado em
  `GET /v1/organizations/xkwxmfhdzgjzbkmbozcg` → `{"plan":"free"}`. O plano gratuito
  do Supabase não inclui backup: nem snapshot diário, nem PITR. É por isso que a
  listagem vem vazia. Não há snapshot escondido fora dela.
  (Isto substitui o "NÃO VERIFICADO" que esta seção trazia na primeira versão.)

Isto importa junto com o resto: se o repo não reconstrói o banco **e** não há
backup restaurável, não existe caminho verificado de reconstrução. Hoje o dado é
de teste (957 linhas em `public.sales`, todas fictícias), então a perda seria de
**schema**, não de dado de cliente — 692 migrations e os 11 objetos órfãos
reconciliados em #538. Ligar backup exige sair do plano gratuito — decisão de
custo, do dono.

**Mitigação feita:** `supabase/schema.sql`, dump do schema de produção por
introspecção de catálogo, versionado no repo. Não substitui backup (não tem dado),
mas passa a existir um caminho de reconstrução do schema onde antes não havia
nenhum. Ver o cabeçalho do próprio arquivo.

### O dump foi testado, não só gerado

Aplicado num Postgres limpo e comparado **objeto por objeto** com produção:

```
producao: 5329 objetos   restaurado: 5329 objetos
FALTA: 0   SOBRA: 0
```

| classe | produção | restaurado |
|---|---:|---:|
| índice | 1423 | 1423 |
| constraint | 1245 | 1245 |
| policy | 1017 | 1017 |
| tabela | 408 | 408 |
| RLS ligado | 408 | 408 |
| trigger | 386 | 386 |
| função | 378 | 378 |
| view | 35 | 35 |
| enum | 25 | 25 |
| sequence | 3 | 3 |
| matview | 1 | 1 |

Dois erros sobram na aplicação, e são **do container de teste**, não do arquivo:
`pg_net` e `supabase_vault` não existem no apt desta máquina (`pgvector` e
`pg_cron` foram instalados e por isso saíram da lista).

Um terceiro grupo de 1.289 erros aparece **somente** num Postgres 16: o privilégio
`MAINTAIN`, que existe a partir do **Postgres 17**. Produção roda 17.6. Medido
com duas aplicações idênticas onde a única diferença era remover essa palavra:

```
íntegro:         erros=1291  privilegio=1289  outros=2
sem MAINTAIN:    erros=2     privilegio=0     outros=2
```

Contagens de objeto iguais nas duas. Em alvo PG17 (que é o caso de produção) esses
1.289 não ocorrem. **Não testável localmente**: o PG17 não está nos repositórios
deste container.

### Três defeitos de ordem achados pelo teste, e corrigidos

O arquivo só chegou a 0 divergência depois de três correções que **apenas a
aplicação real revelou** — nenhuma delas aparecia na leitura do SQL:

1. `migration_log_id_seq` caía depois das tabelas, mas `migration_log.id` tem
   `DEFAULT nextval(...)`. O roteador testava `OWNED BY` no texto todo e um
   comentário acima do `CREATE SEQUENCE` citava a expressão.
2. **Ciclo entre classes de objeto**: `fn_admin_platform_slo`,
   `fn_admin_security_definer_exposure`, `fn_admin_wal_health` e
   `fn_admin_web_vitals_p75` retornam `SETOF v_*` (precisam das views antes),
   enquanto `revenue_forecast_view` e `sales_with_markup` usam `has_role` e
   `is_salesperson_active` (precisam de funções antes). Ordenar por classe não
   resolve: as 4 funções saem depois das views.
3. O índice de `mv_competitive_ranking` saía na seção de índices, antes da matview
   existir — e a seção de views já o emitia no lugar certo. Duplicata removida.

Antes dessas correções: 59 erros não-privilégio. Depois: 2, ambos de ambiente.

### Cinco lacunas achadas por revisor externo

Meus 12 críticos adversariais não acharam nenhuma delas, por um motivo que vale
registrar: **eu mesmo lhes dei o escopo** ("só `public` e `private`"). Crítico não
questiona a premissa que recebe. Foi preciso revisor de fora — Codex e Devin, na PR #548.

O critério certo não é o schema da tabela, é a **origem do objeto**: foi criado por
migration deste repo? Aplicado aos objetos fora de `public`/`private`, ele separa as
duas coisas sem ambiguidade. Produção tem 18 policies fora desses schemas: as 16 da
aplicação têm de 1 a 4 migrations no repo e entram no dump; `cron_job_policy` e
`cron_job_run_details_policy` têm **zero** e ficam de fora — prova disso é que, no
alvo restaurado, essas duas aparecem mesmo assim, criadas pela extensão `pg_cron`.
Os 12 triggers de `storage.buckets`/`storage.objects`/`realtime.subscription` passam
no mesmo teste com zero e também ficam de fora; `on_auth_user_created_role` tem uma
migration e é justamente o item 2.

1. **ACL herdada (segurança).** 371 das 378 funções não têm `anon` no EXECUTE em
   produção, e 297 dessas são `SECURITY DEFINER`. O dump só concedia e revogava de
   `PUBLIC`; num Supabase novo, cujo padrão já concede a `anon`, ausência de linha
   **não é revogação**. Corrigido com uma seção de normalização que zera as ACLs
   antes dos grants. Verificado no alvo restaurado: `anon` com EXECUTE em 7 funções
   (igual a produção) e `add_salesperson_xp` em `service_role, postgres`.
2. **Trigger da aplicação em tabela de plataforma.** `auth.users` →
   `on_auth_user_created_role` → `private.handle_new_user_role`. A seção de triggers
   filtrava pelo schema da *tabela*. Sem ele, cadastro novo não recebe papel.
   Verificado: triggers 387 → 388 no alvo.
3. **Publicação `supabase_realtime`** (77 tabelas) ausente. **NÃO VERIFICADO
   localmente**: a publicação é da plataforma e não existe num Postgres avulso; a
   guarda roda sem erro, mas o `ADD TABLE` não foi exercitado.
4. **`REPLICA IDENTITY FULL`** em 26 tabelas, ausente. Verificado: 26 no alvo.
5. **Policies da aplicação em tabela de plataforma, e os buckets.** Mesma causa do
   item 2, agora em `storage.objects` (14 policies), `realtime.messages` (2) e a
   definição dos 6 buckets. A seção de RLS filtrava pelo schema da *tabela*. Sem
   elas, o alvo restaurado teria `storage.objects` com RLS ligada e **zero** policy:
   avatar, áudio de ligação, PDF de orçamento e export de relatório ficariam
   inacessíveis ao usuário final. E sem os buckets, `file_size_limit` e
   `allowed_mime_types` ficariam nulos — o alvo aceitaria upload que produção recusa
   (`call-recordings` tem 100 MB e 12 mime types; `quote-pdfs`, só `application/pdf`).
   Verificado no alvo restaurado: 14 + 2 policies e os 6 buckets idênticos a produção
   nas 6 colunas de definição.

   **Os dois totais de policy não se contradizem, têm escopos diferentes:** a tabela do
   inventário acima conta **1017**, que são as de `public`/`private`; somando as 18 que
   vivem em schema de plataforma (16 da aplicação + 2 que o `pg_cron` cria sozinho)
   chega-se a **1035**, e esse é o total de `pg_policy` tanto no alvo quanto em produção.
   O inventário de 5329 objetos cobre só `public`/`private`; a verificação desta seção
   precisou sair desse recorte, por definição.

### A seção 92 não pode abortar a restauração

`CREATE POLICY` exige ser dono da tabela, e em produção `storage.objects` pertence a
`supabase_storage_admin` e `realtime.messages` a `supabase_realtime_admin` — `postgres`
não é membro de nenhum dos dois. Com `ON_ERROR_STOP=1`, um único `must be owner of table
objects` mataria o `psql` **ali**, e tudo o que vem depois nunca rodaria: publicação
realtime, `REPLICA IDENTITY`, as 1017 policies de `public`/`private`, a normalização de
ACL, os grants e as foreign keys. O arquivo ficaria pela metade, e em silêncio.

Cada statement da seção roda dentro do seu próprio `BEGIN ... EXCEPTION WHEN
insufficient_privilege`. Medido num Postgres 16 com as tabelas de plataforma de outro
dono e a restauração rodando como papel não-dono:

| | sem o `EXCEPTION` | com o `EXCEPTION` |
|---|---|---|
| saída do `psql` | **3** (abortou) | **0** |
| statement seguinte executou | **não** | **sim** |
| o que foi pulado | — | 6 buckets + 16 policies, cada um com `WARNING` nominal |

Rodando o **mesmo arquivo** depois como dono da tabela: **0 warnings, 16 policies, 6
buckets**. Ele é idempotente, então a recuperação é reexecutá-lo.

E a falha é segura: o que não instala deixa a tabela com RLS ligada e **sem** policy —
acesso fechado, não aberto.

Um bug dentro da própria correção, achado pelo crítico da seção de ACL: o bloco de
verificação usava `COALESCE(pg_get_userbyid(grantee),'PUBLIC')`, mas
`pg_get_userbyid(0)` devolve a string `'unknown (OID=0)'`, nunca NULL — sobra de ACL
do `PUBLIC` passava em silêncio anunciando "0 entrada".
