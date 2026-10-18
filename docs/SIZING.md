# Sizing — gatilhos de upgrade de plano (Supabase + Vercel)

Quando considerar subir de plano. Revisar estes gatilhos trimestralmente
ou quando os monitores de docs/RUNBOOK.md §4 começarem a falhar.

## Supabase

| Plano                     | O que muda                                                                                            | Gatilho para subir                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free → Pro**            | Backup diário gerenciado (retenção 7d), sem pausa por inatividade, 8 GB DB, 100 GB bandwidth, suporte | (1) O workflow `db-backup.yml` existe mas está **inoperante** (2026-10-18: o secret `SUPABASE_DB_URL` aponta para outro projeto — o backup efetivo do canônico não roda), então retenção >7 dias ou PITR dependem de subir o plano; (2) banco passar de ~4 GB (50% do limite Free); (3) qualquer incidente de pausa por inatividade |
| **Pro → Team/Enterprise** | PITR (point-in-time recovery), mais read replicas, SLA de uptime                                      | (1) RPO < 24h virar requisito de negócio (perda de um dia de vendas inaceitável); (2) alertas de CPU/RAM recorrentes no dashboard; (3) necessidade de SLA contratual                                                                                                                                                                |

### Sinais práticos (verificar no dashboard do projeto)

- **Database size** > 4 GB → planejar Pro; > 7 GB → urgente (Free trava em 8 GB).
- **Edge function invocations** crescendo além do free tier (500k/mês) ou
  latência de cold start afetando o dialer.
- **Egress** > 80 GB/mês → Pro ou revisar queries/paginação.
- **Realtime/conexões simultâneas** saturando (uso de arena/ranking ao vivo).

## Vercel (frontend)

- Deploy atual é **Vercel + GitHub** (verificado 2026-10-18 — o frontend saiu
  da Lovable; os comentários de `deploy.yml` ainda citam Lovable e estão
  desatualizados).
- Gatilhos de upgrade: preview environments pagos, proteção de produção,
  analytics/observabilidade ou mais bandwidth. Reavaliar junto com
  docs/STAGING.md.

## Regra de bolso

Custo de upgrade < custo de uma manhã de indisponibilidade = subir o plano.
Antes de qualquer upgrade, registrar a decisão em `docs/decisions/`.
