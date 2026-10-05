# Staging — Promo Champions V2.1

Hoje existe um único projeto Supabase de produção (`usyxfpqlsspldubptrdl`).
Este guia provisiona um projeto de staging para testar migrations, edge
functions e mudanças de schema antes de ir para produção.

## 1. Criar o projeto Supabase de staging

1. https://supabase.com/dashboard → **New project**
   - Organization: a mesma do projeto de produção
   - Name: `promo-champions-staging`
   - Region: a mesma da produção (latência equivalente nos testes)
   - Database password: gerar e guardar no cofre de senhas do time
2. Plano: **Free** é suficiente para staging (ver docs/SIZING.md para os
   limites e quando considerar upgrade).

## 2. Provisionar o schema

```bash
supabase link --project-ref <STAGING_PROJECT_REF>
supabase db push --linked   # aplica as 600+ migrations do repo
```

Alternativa mais rápida (estado atual real, não replay de migrations):
restaurar um dump de produção anonizado — ver `.github/workflows/db-backup.yml`
e `docs/DR_PLAN.md`.

## 3. Deploy das edge functions em staging

```bash
supabase functions deploy --project-ref <STAGING_PROJECT_REF>
```

`supabase/config.staging.toml` já existe no repo com as portas/redirects de
staging — usar como base do `config.toml` do projeto de staging
(`supabase link` + `supabase config push` ou revisão manual dos blocos).

## 4. Variáveis de ambiente (frontend)

Criar um `.env.staging` (não commitar) ou configurar no Lovable/ambiente
de preview:

```
VITE_SUPABASE_URL=https://<STAGING_PROJECT_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<staging anon/publishable key>
```

As chaves estão em Supabase Dashboard → Settings → API do projeto de staging.
**Nunca** apontar staging para o project-ref de produção.

## 5. Secrets de edge functions em staging

Copiar somente os secrets necessários para os fluxos sob teste:

```bash
supabase secrets set --project-ref <STAGING_PROJECT_REF> CHAVE=valor
```

## 6. Dados de teste

Não copiar dados de produção com PII para staging sem anonização (LGPD —
ver migration de anonimização do pacote `dbpkg-lgpd-retencao`). Preferir os
seeds do repo: `scripts/seed-*.ts`.

## 7. CI com staging (futuro)

Quando o projeto existir, cadastrar os secrets `STAGING_SUPABASE_*` no
GitHub para que os workflows de drift (`migrations-drift.yml`) e backup
possam rodar também contra staging.
