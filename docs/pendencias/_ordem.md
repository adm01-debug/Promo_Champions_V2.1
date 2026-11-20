# Ordem de Execução — Backlog Verificado (Fase 1)

> Itens que PERSISTEM na main, ordenados por impacto (receita > segurança > correção). Um por branch/PR.
> Cada item vira `docs/pendencias/<ID>-<slug>.md` com plano antes de implementar.

## Executáveis por código (sem banco/secret)

| Ordem | ID  | O que                                                                     | Camada        | Por que agora                                                                 |
| ----- | --- | ------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| 1     | T8  | `mv_competitive_ranking` contar `won`/`closed` além de `completed`        | supabase      | Ranking põe venda ganha via sync fora do 1º lugar — decisão de ranking errada |
| 2     | A4  | `receive-quote-webhook` trocar `getPublicUrl` por `createSignedUrl`       | supabase/edge | Propósito comercial (orçamento) acessível por URL fixa = vazamento            |
| 3     | T22 | Consolidar fonte única por métrica (forecast/win-probability)             | supabase/edge | Dois números divergentes para a mesma métrica confundem diretoria             |
| 4     | A3  | Filtro de dono/papel em `scheduled-reports-runner` + `export-winloss-pdf` | supabase/edge | Relatório pode vazar venda de outro usuário (governança)                      |
| 5     | A5  | Endurecer prompt injection: instrução/dado separados + allowlist          | supabase/edge | Assistente IA pode ser induzido a agir indevidamente                          |
| 6     | T15 | Retry/reprocessamento de falhas no multichannel                           | supabase/edge | Mensagem marcada enviada que não saiu gera promessa quebrada                  |
| 7     | T16 | Bitrix24: verify_jwt off no callback + refresh token                      | supabase/edge | Sync para ~1h sem renovação; token legado em texto puro                       |
| 8     | T21 | Montar componentes órfãos de deal-health/segurança nas rotas              | frontend      | Investimento pronto e escondido                                               |

## Dependem de decisão do dono (regra 8 — não mergear sem você)

| ID        | O que                                                                      | Motivo                                                                 |
| --------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| T10       | Tornar repositório PRIVADO + limpar PII + rotação A2                       | Expõe dados pessoais e segredos históricos ao público. Só você decide. |
| T1/T13/A9 | Secrets `_internal_secrets`, gateway IA, reconciliação `schema_migrations` | Requer credenciais/banco vivo; conferir em produção antes de tocar     |
| T9        | Backup off-site criptografado + teste de restore                           | Requer secret off-site + custo de storage                              |

## Não é backlog (já resolvido nesta linha de base)

T3, T4, T5, T6, T7, T17, T19, T20, T23, T24, A1, A6, e parcialmente A7/A8.
