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
