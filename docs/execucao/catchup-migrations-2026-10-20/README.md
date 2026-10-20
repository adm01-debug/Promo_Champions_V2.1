# Catch-up de migrations no banco de produção — 20/10/2026

Registro do que foi aplicado no banco do Promo Champions em 20/10/2026 e de como isso foi conferido.
Antes, estas evidências existiam só fora do repositório.

## O que aconteceu

Doze migrations já mergeadas na `main` não estavam aplicadas no banco. A medição foi feita pelo workflow
**DB Probe** (`.github/workflows/db-probe.yml`), que só lê. Elas foram aplicadas uma por vez, na ordem de
versão, pelo workflow **Apply Migration** (`.github/workflows/apply-migration.yml`), que registra cada
uma no ledger `supabase_migrations.schema_migrations`.

| Migration                                                    | Run do Apply Migration | Resultado                                                                     |
| ------------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------- |
| `20261013121000_wrappers_private_sequence_rpcs`              | 39439565233            | aplicada                                                                      |
| `20261013122000_admin_edge_cron_status`                      | 39439674813            | aplicada                                                                      |
| `20261013130000_comissao_regras_e_split_sdr`                 | 39439769694            | aplicada                                                                      |
| `20261013152000_fix_kpis_auditoria_top25`                    | 39439871361            | aplicada (preencheu 1.344 linhas de histórico, marcadas como `is_backfilled`) |
| `20261013153000_integration_secret_refs`                     | 39440011033            | aplicada                                                                      |
| `20261013170000_bitrix24_sync_cron`                          | 39440104249            | aplicada                                                                      |
| `20261014000001_fix_allowlist_bitrix24_gamificacao`          | 39440196077            | aplicada                                                                      |
| `20261014000002_fix_concurrently_indexes`                    | 39440316376            | **falhou, não aplicada**                                                      |
| `20261018120000_lgpd_consent_e_optout_por_telefone`          | 39440516770            | aplicada                                                                      |
| `20261018190000_lgpd_fixes_consent_anonymize`                | 39440610400            | aplicada                                                                      |
| `20261018190100_gamificacao_claim_matchups_rotations`        | 39440702203            | aplicada                                                                      |
| `20261018200000_fix_stage_history_views_e_forecast_category` | 39440792273            | aplicada                                                                      |

Os runs ficam em `https://github.com/adm01-debug/Promo_Champions_V2.1/actions/runs/<run>`.

A `20260903000001_enable_rls_leads.sql` ficou de fora **de propósito**: ela abriria a tabela `leads` para
qualquer usuário logado.

## Como foi conferido (sem confiar só no "success" do workflow)

| Arquivo                    | O que é                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ordem-12.txt`             | As 12 migrations, na ordem em que foram aplicadas                                                                      |
| `probe-desde-20260825.txt` | DB Probe **antes** (run 39434290636): 294 objetos sondados das migrations desde 25/08, com 240 presentes e 54 ausentes |
| `probe-pos-apply.txt`      | DB Probe **depois** (run 39440941191, a partir de `20261013000000`): 84 objetos, com 70 presentes e 14 ausentes        |

Formato de cada linha: `versão|tipo|objeto|existe`.

Os 14 objetos que continuam `false` no "depois" são todos da `20261014000002`. Nenhum objeto das 11
migrations aplicadas ficou faltando.

## A migration que não entra: `20261014000002_fix_concurrently_indexes`

Erro do psql na linha 18 do arquivo:

```text
ERROR:  relation "deals" does not exist
```

- Este banco **não tem tabela `deals`**, e a tabela `activities` não tem as colunas `user_id` nem `deal_id`
  que os índices usam. A migration foi escrita para um schema que este banco não tem.
- As linhas 13 a 16 (`idx_clients_*`) deram `NOTICE ... already exists, skipping`: esses índices já
  existiam. O psql roda com `ON_ERROR_STOP=1` dentro do workflow e parou na linha 18. **Não houve alteração
  parcial.**
- Ela continua fora do ledger. Qualquer nova tentativa de pôr o banco em dia vai parar nela de novo até
  ela ser substituída ou removida, o que é **tarefa separada** e precisa de plano próprio.

## Efeito colateral conhecido (não corrigido aqui)

A `20261018190100` tira do navegador o direito de gravar XP direto (o XP passa a ser concedido pelas RPCs
de resgate). O botão de teste "adicionar XP" em `src/components/gamification/CelebrationTestButtons.tsx`,
na página Vendedores, grava direto e por isso vai receber erro de permissão. Nenhuma outra tela grava XP
direto: as demais só leem.
