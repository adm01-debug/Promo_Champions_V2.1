# public.weekly_challenges

> Desafios de gamificação disponíveis durante um intervalo semanal.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do desafio semanal. |
| 2 | `title` | `text` | não |  |  | Título do desafio. |
| 3 | `description` | `text` | sim |  |  | Descrição do desafio. |
| 4 | `challenge_type` | `text` | não | `'activity'::text` |  | Tipo de atividade ou objetivo acompanhado pelo desafio. |
| 5 | `target_value` | `integer` | não | `10` |  | Valor-alvo necessário para concluir o desafio. |
| 6 | `xp_reward` | `integer` | não | `100` |  | Quantidade de XP concedida como recompensa. |
| 7 | `start_date` | `date` | não |  |  | Data de início do desafio. |
| 8 | `end_date` | `date` | não |  |  | Data de término do desafio. |
| 9 | `is_active` | `boolean` | não | `true` |  | Indica se o desafio está ativo. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do desafio. |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do desafio. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| weekly_challenges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.challenge_progress | challenge_progress_challenge_id_fkey | challenge_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_weekly_challenges_active | btree | is_active, start_date, end_date | não | sim |  | `CREATE INDEX idx_weekly_challenges_active ON public.weekly_challenges USING btree (is_active, start_date, end_date)` |
| weekly_challenges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX weekly_challenges_pkey ON public.weekly_challenges USING btree (id)` |


## Policies (RLS)

### `Admins and managers can delete weekly_challenges`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert weekly_challenges`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update weekly_challenges`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can view weekly challenges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_weekly_challenges_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
