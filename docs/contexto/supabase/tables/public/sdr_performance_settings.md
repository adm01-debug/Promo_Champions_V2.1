# public.sdr_performance_settings

> Tabela public.sdr_performance_settings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NULLABLE, rejection_rate_threshold numeric NULLABLE DEFAULT 30, outcome_mix_alert_enabled boolean NULLABLE DEFAULT true, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sdr_performance_settings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.sdr_performance_settings. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 3 | `rejection_rate_threshold` | `numeric` | sim | `30` |  | Coluna rejection_rate_threshold da tabela public.sdr_performance_settings. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: 30. |
| 4 | `outcome_mix_alert_enabled` | `boolean` | sim | `true` |  | Coluna outcome_mix_alert_enabled da tabela public.sdr_performance_settings. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 5 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.sdr_performance_settings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 6 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.sdr_performance_settings. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sdr_performance_settings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sdr_performance_settings_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sdr_performance_settings_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_sdr_performance_settings_user_id ON public.sdr_performance_settings USING btree (user_id)` |
| sdr_performance_settings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sdr_performance_settings_pkey ON public.sdr_performance_settings USING btree (id)` |


## Policies (RLS)

### `Users can manage their own performance settings`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK | `(auth.uid() = user_id)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
