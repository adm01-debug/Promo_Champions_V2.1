# Procedimento de Rollback

Este documento descreve os passos necessários para reverter alterações em caso de falha crítica em produção.

## 1. Frontend (Vite + Lovable/Vercel)
O rollback do frontend é feito através da plataforma de deploy:
1. Acesse o painel do Lovable/Vercel.
2. Identifique o deploy anterior estável.
3. Clique em "Redeploy" ou "Promote to Production".

## 2. Banco de Dados (Supabase Migrations)
Para reverter uma migration que causou problemas:
1. Identifique a migration problemática.
2. Se a migration for destrutiva, utilize o backup mais recente:
   - Acesse o Dashboard do Supabase -> Database -> Backups.
   - Selecione o ponto de restauração anterior ao erro.
3. Se não for destrutiva, aplique uma "fix migration" que reverta as alterações de schema.

## 3. Edge Functions
Para reverter uma Edge Function:
1. Utilize o histórico de commits para encontrar a versão estável.
2. Re-deploy a função usando o CLI do Supabase:
   ```bash
   supabase functions deploy <nome-da-funcao>
   ```

## 4. Variáveis de Ambiente
Caso uma mudança de segredo/env tenha causado o erro:
1. Revertas os valores no painel do Supabase ou Lovable Cloud.
2. Reinicie os serviços afetados.
