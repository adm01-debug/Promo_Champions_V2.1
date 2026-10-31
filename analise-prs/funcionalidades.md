# Inventário de Funcionalidades

Gerado em: 2026-10-31. SHA principal: `7e7ca4342ce9e96ed74f277f7027101b9ff9cdf9`.

| ID | Área | Funcionalidade | Descrição | Status | Arquivo Principal | Observações |
|----|------|----------------|-----------|--------|-------------------|-------------|
| 1 | Auth | Login com senha | Autenticação tradicional email+senha via Supabase Auth | ATIVO | src/integrations/supabase/client.ts | |
| 2 | Auth | Login WebAuthn/Passkeys | Autenticação sem senha via WebAuthn | ATIVO | supabase/functions/webauthn/index.ts | C4 corrigido — account takeover prevenido |
| 3 | CRM | Gestão de Champions | Cadastro e gestão de promotores/champions | ATIVO | src/pages/ | |
| 4 | CRM | Gestão de Clientes | Cadastro e gestão de clientes/prospects | ATIVO | src/pages/ | |
| 5 | Campanhas | Campanhas Promocionais | Criação e gestão de campanhas de vendas | ATIVO | src/pages/ | |
| 6 | Campanhas | Status de Pedidos | Fluxo draft→pending→confirmed→fulfilled/cancelled | ATIVO | supabase/migrations/20260718000001_fix_sync_quote_no_status_downgrade.sql | C1 corrigido — sem downgrade de terminal |
| 7 | Mensagens | Envio Multicanal | Disparo de mensagens por WhatsApp/Email/SMS | ATIVO | supabase/functions/send-multichannel-message/index.ts | C5 corrigido — auth obrigatório |
| 8 | Relatórios | Relatórios Agendados | Geração e envio periódico de relatórios | ATIVO | supabase/functions/scheduled-reports-runner/index.ts | C6 corrigido — formula injection prevenida |
| 9 | Relatórios | Download de Relatórios | Export de dados em CSV pelo usuário | ATIVO | src/utils/reportDownload.ts | C7 corrigido — sanitização linha 75 |
| 10 | Portfolio | Configurações de Portfolio | Configurações por portfolio de produtos | ATIVO | supabase/migrations/20260718000002_fix_portfolio_settings_rls_credential_leak.sql | C10 corrigido — RLS key-pattern |
| 11 | Tasks | Tarefas de Cadência | Worker de processamento de tarefas periódicas | ATIVO | supabase/migrations/20260718000003_add_claim_pending_cadence_tasks.sql | C8+C9 corrigidos — status+SKIP LOCKED |
| 12 | Infra | Pipeline CI/CD | Lint + TypeCheck + Build + Tests + E2E automatizados | ATIVO | .github/workflows/ | C3 pendente — E2E não é gate obrigatório |
| 13 | Infra | Dependências | Gestão automatizada via Dependabot | ATIVO | .github/dependabot.yml | PR #344 mergeada |
| 14 | UI | Dashboard Principal | Visão geral de métricas e KPIs | ATIVO | src/pages/ | |
