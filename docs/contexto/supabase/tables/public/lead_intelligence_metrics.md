# public.lead_intelligence_metrics

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `captured_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 3 | `avg_score` | `numeric` | sim |  |  |  |
| 4 | `hot_count` | `integer` | sim |  |  |  |
| 5 | `warm_count` | `integer` | sim |  |  |  |
| 6 | `cold_count` | `integer` | sim |  |  |  |
| 7 | `distribution` | `jsonb` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_intelligence_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| lead_intelligence_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_intelligence_metrics_pkey ON public.lead_intelligence_metrics USING btree (id)` |


## Policies (RLS)

### `Authenticated read lead_intelligence_metrics`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
