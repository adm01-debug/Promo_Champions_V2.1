# Rotação de secrets — Promo Champions V2.1

Guia de rotação das credenciais do projeto. Rodar a cada 90 dias ou
imediatamente após qualquer suspeita de vazamento.

## Chaves Supabase (projeto `usyxfpqlsspldubptrdl`)

| Secret                  | Onde rotacionar                                   | Onde atualizar depois                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `anon` / `service_role` | Dashboard → Project Settings → API → "Regenerate" | Frontend: variáveis `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (Lovable env). Edge functions: `SUPABASE_SERVICE_ROLE_KEY` é injetada automaticamente — mas qualquer secret custom que a copie precisa ser atualizado. **Atenção:** rotacionar `service_role` invalida tokens JWT de serviço em uso — coordenar janela de manutenção. |
| `JWT secret`            | Dashboard → Project Settings → API → JWT          | **Alto impacto**: invalida todas as sessões ativas (logout global). Só em incidente ou com aviso prévio.                                                                                                                                                                                                                               |

## Secrets de edge functions

Onde: Dashboard → Edge Functions → Manage secrets (`supabase secrets set`).

| Secret                                                        | Provider de origem                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                                              | Resend → API Keys                                                                                     |
| `BITRIX24_CLIENT_ID` / `BITRIX24_CLIENT_SECRET`               | Bitrix24 → aplicativo OAuth                                                                           |
| `TWILIO_*` (SID/auth token)                                   | Twilio Console                                                                                        |
| `ELEVENLABS_API_KEY`                                          | ElevenLabs                                                                                            |
| `VAPID_*` (push)                                              | Gerado localmente (`web-push generate-vapid-keys`) — exige re-subscribe dos usuários                  |
| `LOVABLE_API_KEY`                                             | Lovable                                                                                               |
| Segredos em `_internal_secrets` (ex.: `coaching_cron_secret`) | Tabela interna — gerar novo valor aleatório e atualizar o job pg_cron que o envia via `X-Cron-Secret` |
| `ALLOWED_ORIGINS`                                             | Não é credencial — lista de origens CORS permitidas                                                   |

## Secrets de CI (GitHub Actions)

Onde: GitHub → Settings → Secrets and variables → Actions.

| Secret                                                                    | Uso                                |
| ------------------------------------------------------------------------- | ---------------------------------- |
| `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_PROJECT_ID` | Workflows de migration/drift/types |
| `E2E_*` (credenciais de teste)                                            | Suíte Playwright                   |
| `SUPABASE_ACCESS_TOKEN`                                                   | CLI `supabase gen types`           |

## Procedimento

1. Gerar a nova credencial no provider.
2. Atualizar o secret (edge function / GitHub / Lovable env).
3. Validar: health da function, CI verde, login funcionando.
4. Revogar a credencial antiga **só depois** de confirmar que nada usa.
5. Registrar a rotação (data + responsável) neste arquivo ou no runbook de ops.

## Inventário rápido (onde cada coisa mora)

- **Frontend (`VITE_*`)**: Lovable env vars — públicas por definição (bundle).
- **Edge functions**: `supabase secrets` — nunca commitar.
- **Banco**: `_internal_secrets` — apenas service_role lê.
- **CI**: GitHub Actions secrets.
