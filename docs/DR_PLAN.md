# Plano de Recuperação de Desastres (DR Plan)

## 1. Estratégia de Backup (estado real — verificado 2026-10-18)

- **Banco de Dados:** Backups diários automáticos via Supabase conforme o plano
  do projeto (Free = sem backup gerenciado; Pro = retenção 7d). **Confirmar o
  tier vigente no dashboard** antes de assumir cobertura.
- **Backup off-site próprio:** o workflow `.github/workflows/db-backup.yml`
  existe, mas está **inoperante** — o secret `SUPABASE_DB_URL` aponta para
  outro projeto e a conexão falha. O backup efetivo do canônico **não roda**
  até o secret ser corrigido (precisa da senha do Postgres).
- **Point-in-Time Recovery (PITR):** **não contratado/evidenciado**
  (2026-10-18) — PITR exige plano Pro+ no Supabase; não há prova de que esteja
  ativo no projeto `usyxfpqlsspldubptrdl`. Tratar como indisponível até
  confirmação no dashboard.
- **Código:** Repositório Git hospedado no GitHub com redundância geográfica.

## 2. Procedimentos de Recuperação

### 2.1 Falha Crítica no Banco de Dados

1. Notificar a equipe de SRE/DevOps.
2. Avaliar a extensão dos danos.
3. Se houver corrupção de dados massiva, restaurar pelo último backup
   disponível:
   - Dashboard Supabase -> Database -> Backups (se o plano tiver backup
     gerenciado) ou o artifact mais recente de `db-backup.yml` (quando o
     workflow estiver operante).
   - **PITR não está disponível** (ver §1) — não prometer granularidade
     por segundo até contratar plano com PITR.

### 2.2 Indisponibilidade Regional (Cloud Provider)

1. Monitorar o status do Supabase/AWS.
2. Caso a indisponibilidade exceda o RTO (Recovery Time Objective) de 4 horas:
   - Considerar o redirecionamento do tráfego para uma região secundária (se configurado).

### 2.3 Perda de Acesso (Secrets/Auth)

**Detentores das Recovery Keys** — as chaves de recuperação de cada plataforma
vivem no cofre de senhas da empresa (Bitwarden/1Password), na pasta
`Promo Champions / Recovery`:

- **GitHub** (`adm01-debug`): recovery codes do 2FA da conta + PAT de emergência
  com escopo `repo` (válido apenas para destravar acesso, revogar após uso).
  Detentor primário: Joaquim (`adm01@promobrindes.com.br`). Secundário:
  `ti@promobrindes.com.br`.
- **Supabase** (projeto `usyxfpqlsspldubptrdl`): recovery codes do 2FA da conta
  dona + `service_role` key atual e anterior + credencial do cofre para reset
  de senha via e-mail `adm01@promobrindes.com.br`. Mesmos detentores.
- **Vercel** (deploy do frontend): recovery codes do 2FA + credencial da
  conta dona do projeto `promo-champions-v2-1`. Mesmos detentores.
  (2026-10-18: o deploy saiu da Lovable — recovery codes da conta Lovable
  mantidos apenas para o domínio legado `championgifts.lovable.app`.)

**Procedimento de acesso emergencial:**

1. Segundo detentor abre o cofre de senhas (acesso individual auditado) e
   recupera o recovery code da plataforma afetada.
2. Login com recovery code → redefinir 2FA/senha → **gerar novos recovery
   codes e guardar de volta no cofre** (os usados expiram).
3. Rotacionar todas as chaves de API afetadas imediatamente
   (Supabase: Settings → API → rotate keys; GitHub: revogar PATs/tokens;
   re-cadastrar secrets no Lovable/Supabase Edge Functions) — inventário,
   donos e procedimento sem downtime em [SECRETS_ROTATION.md](SECRETS_ROTATION.md).
4. Registrar o evento em `docs/postmortems/` (quem, quando, o que girou).

**Teste:** o acesso emergencial deve ser exercitado pelo menos 1x por semestre
(simular login via recovery code em sessão supervisionada) — primeira execução
pendente de agendamento pelo responsável técnico.

## 3. Matriz de Contatos

- **Responsável Técnico:** CTO / Lead Dev
- **Suporte Supabase:** [https://supabase.com/dashboard/support/new](https://supabase.com/dashboard/support/new)

## 4. Testes de DR

- Um teste de restauração de backup deve ser realizado trimestralmente em ambiente de staging para garantir a integridade dos dados.
