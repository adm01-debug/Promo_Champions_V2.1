# public.stage_probabilities

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
| usada por views | public.revenue_forecast_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `stage` | `text` | não |  |  |  |
| 2 | `probability` | `numeric` | não |  |  |  |
| 3 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_probabilities_pkey | PRIMARY KEY | `PRIMARY KEY (stage)` |  |  | sim |
| stage_probabilities_probability_check | CHECK | `CHECK (probability >= 0::numeric AND probability <= 1::numeric)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| stage_probabilities_pkey | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX stage_probabilities_pkey ON public.stage_probabilities USING btree (stage)` |


## Policies (RLS)

### `stage_probabilities_select`

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
