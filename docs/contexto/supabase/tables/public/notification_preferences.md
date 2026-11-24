# public.notification_preferences

> Preferências do usuário para notificações e limites de alertas comerciais.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 5 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único das preferências. |
| 2 | `email` | `text` | não |  |  | Endereço de e-mail usado para notificações. |
| 3 | `is_active` | `boolean` | não | `true` |  | Indica se estas preferências estão ativas. |
| 4 | `frequency` | `text` | não | `'daily'::text` |  | Frequência de notificação: realtime, daily ou weekly. |
| 5 | `notify_stagnant_deals` | `boolean` | não | `true` |  | Indica se devem ser enviadas notificações sobre negócios estagnados. |
| 6 | `notify_inactive_clients` | `boolean` | não | `true` |  | Indica se devem ser enviadas notificações sobre clientes inativos. |
| 7 | `notify_at_risk_goals` | `boolean` | não | `true` |  | Indica se devem ser enviadas notificações sobre metas em risco. |
| 8 | `stagnant_threshold_days` | `integer` | não | `14` |  | Quantidade de dias usada como limite para considerar um negócio estagnado. |
| 9 | `inactive_threshold_days` | `integer` | não | `60` |  | Quantidade de dias usada como limite para considerar um cliente inativo. |
| 10 | `preferred_time` | `time without time zone` | não | `'08:00:00'::time without time zone` |  | Horário local preferido para receber notificações. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação das preferências. |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização das preferências. |
| 13 | `consecutive_days_threshold` | `integer` | não | `3` |  | Quantidade de dias consecutivos abaixo da meta para acionar o alerta SDR. |
| 14 | `user_id` | `uuid` | sim |  |  | Usuário do Supabase Auth associado às preferências, quando informado. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| notification_preferences_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| valid_frequency | CHECK | `CHECK (frequency = ANY (ARRAY['realtime'::text, 'daily'::text, 'weekly'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_notification_preferences_user | btree | user_id | não | sim |  | `CREATE INDEX idx_notification_preferences_user ON public.notification_preferences USING btree (user_id)` |
| notification_preferences_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id)` |


## Policies (RLS)

### `Users can delete own notification preferences`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can insert own notification preferences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(user_id = auth.uid())` |

### `Users can update own notification preferences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |

### `Users can update their notification preferences`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own notification preferences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_notification_preferences_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
