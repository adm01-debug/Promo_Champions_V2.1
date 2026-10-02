# Sizing — gatilhos de upgrade de plano (Supabase + Lovable)

Quando considerar subir de plano. Revisar estes gatilhos trimestralmente
ou quando os monitores de docs/RUNBOOK.md §4 começarem a falhar.

## Supabase

| Plano | O que muda | Gatilho para subir |
|-------|-----------|--------------------|
| **Free → Pro** | Backup diário gerenciado (retenção 7d), sem pausa por inatividade, 8 GB DB, 100 GB bandwidth, suporte | (1) Backup off-site próprio já roda (`db-backup.yml`), mas retenção >7 dias ou PITR virar requisito; (2) banco passar de ~4 GB (50% do limite Free); (3) qualquer incidente de pausa por inatividade |
| **Pro → Team/Enterprise** | PITR (point-in-time recovery), mais read replicas, SLA de uptime | (1) RPO < 24h virar requisito de negócio (perda de um dia de vendas inaceitável); (2) alertas de CPU/RAM recorrentes no dashboard; (3) necessidade de SLA contratual |

### Sinais práticos (verificar no dashboard do projeto)

- **Database size** > 4 GB → planejar Pro; > 7 GB → urgente (Free trava em 8 GB).
- **Edge function invocations** crescendo além do free tier (500k/mês) ou
  latência de cold start afetando o dialer.
- **Egress** > 80 GB/mês → Pro ou revisar queries/paginação.
- **Realtime/conexões simultâneas** saturando (uso de arena/ranking ao vivo).

## Lovable

- Plano atual cobre o deploy do frontend; gatilho de upgrade é precisar de
  staging/preview environments separados ou mais seats de edição.
- Se o frontend sair da Lovable para hospedagem própria (Vercel/Cloudflare),
  reavaliar junto com docs/STAGING.md — o `deploy.yml` já isola a etapa de
  publicação.

## Regra de bolso

Custo de upgrade < custo de uma manhã de indisponibilidade = subir o plano.
Antes de qualquer upgrade, registrar a decisão em `docs/decisions/`.
