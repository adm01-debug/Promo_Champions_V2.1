# Runbook de plantão — Promo Champions V2.1

> Escala mínima e contatos de escalonamento. **Os campos `{{ ... }}` são
> placeholders nomeados — o responsável deve preenchê-los.**

## Escala mínima

- **Janela de atendimento**: horário comercial, dias úteis (o produto é um
  CRM interno — incidentes fora do horário seguem severidade S2/S3).
- **Resposta-alvo**: S1 = 15 min · S2 = 1 h · S3 = próximo dia útil
  (severidades definidas em `docs/RUNBOOK.md`).
- **Cobertura**: 1 pessoa de plantão primário + 1 backup. Sem rotação formal
  hoje — o plantão é assumido pelo time de produto.

## Contatos (preencher)

| Papel | Nome | Contato |
|-------|------|---------|
| Plantão primário | {{ NOME_PLANTAO_PRIMARIO }} | {{ CANAL/TELEFONE }} |
| Backup | {{ NOME_BACKUP }} | {{ CANAL/TELEFONE }} |
| Dono do produto | {{ NOME_PO }} | {{ CANAL }} |
| Admin Supabase/Lovable | {{ NOME_ADMIN_INFRA }} | {{ CANAL }} |
| Conta Twilio/Meta/Resend/ElevenLabs | {{ NOME_DONO_CREDENCIAIS }} | {{ CANAL }} |

## Fluxo quando algo cai

1. **Confirmar**: health externo (`docs/RUNBOOK.md` → Monitoramento de
   Uptime) + reprodução manual em `championgifts.lovable.app`.
2. **Classificar** a severidade (S1–S3, `docs/RUNBOOK.md`).
3. **Identificar o domínio**: frontend (Lovable), banco/PostgREST (Supabase),
   edge functions, ou integração externa → abrir o runbook específico em
   `docs/runbooks/`.
4. **Mitigar primeiro, diagnosticar depois**: rollback Lovable / secret
   corrigido / feature flag — o que restaurar tráfego mais rápido.
5. **Escalonar** se não resolvido em 30 min (S1) ou 2 h (S2): acionar o
   backup/dono do produto.
6. **Registrar**: abrir item no CHANGELOG/RELEASE_NOTES se houver release
   corretiva; causa raiz em `docs/RUNBOOK.md` se for padrão novo.

## Links de emergência

- Dashboard Supabase: https://supabase.com/dashboard/project/usyxfpqlsspldubptrdl
- Logs edge functions: Dashboard → Edge Functions → Logs
- Painel admin interno: `/admin/conexoes`, `/admin/platform-slo`,
  `/admin/webhooks-dead-letters`, `/admin/web-vitals`
- Deploy/rollback frontend: painel Lovable → History
