# 🔒 Política de Segurança

## Versões Suportadas

Atualmente, as seguintes versões do **Promo Champions** recebem atualizações de segurança:

| Versão | Suportada          |
| ------ | ------------------ |
| 0.1.x  | :white_check_mark: |
| < 0.1  | :x:                |

## Reportando uma Vulnerabilidade

A segurança do Promo Champions é levada muito a sério. Se você descobrir uma vulnerabilidade de segurança, por favor, siga as diretrizes abaixo:

### 🚨 Para Vulnerabilidades Críticas

**NÃO** abra uma issue pública. Em vez disso:

1. **Envie um e-mail** para a equipe de segurança: **ti@promobrindes.com.br**
2. **Inclua** uma descrição detalhada da vulnerabilidade
3. **Forneça** passos para reproduzir o problema
4. **Aguarde** nossa resposta (geralmente dentro de 48 horas)

### 📋 Informações a Incluir

Para nos ajudar a resolver o problema rapidamente, inclua:

- **Descrição da vulnerabilidade**
- **Tipo de vulnerabilidade** (ex: XSS, SQL Injection, CSRF)
- **Localização** do código afetado (arquivo e linha)
- **Passos para reproduzir** o problema
- **Impacto potencial** da vulnerabilidade
- **Versão afetada** do Promo Champions
- **Possível solução** (se você tiver uma)

### 🔄 Processo de Resposta

1. **Confirmação** - Confirmaremos o recebimento em até 48 horas
2. **Investigação** - Avaliaremos e validaremos a vulnerabilidade
3. **Desenvolvimento** - Trabalharemos em uma correção
4. **Notificação** - Manteremos você atualizado sobre o progresso
5. **Release** - Lançaremos um patch de segurança
6. **Divulgação** - Publicaremos um aviso de segurança (se necessário)

### ⏱️ Tempo de Resposta Esperado (SLA)

| Etapa                          | Tempo Estimado                          |
| ------------------------------ | --------------------------------------- |
| Primeira resposta              | 48 horas                                |
| Confirmação da vulnerabilidade | 5-7 dias                                |
| Desenvolvimento do patch       | 7-30 dias (dependendo da complexidade)  |
| Release do patch               | Assim que possível após desenvolvimento |

## Superfícies de exposição

Componentes acessíveis publicamente que merecem atenção em reports e revisões:

- **Edge functions públicas** (~170 em `supabase/functions/`): autenticação JWT
  - RBAC por role (`has_role`, `is_admin_or_manager`), rate limiting e
    validação em `_shared/`. Funções chamáveis com `service_role` sem verificar o
    chamador são a principal superfície de risco.
- **Webhooks e callbacks externos**: Twilio (`twilio-call-status`,
  `twilio-call-twiml`), Bitrix24 OAuth (`bitrix24-oauth`), e-mail inbound
  (`inbound-email-webhook`), multichannel status, `receive-quote-*` — validados
  por segredo compartilhado ou assinatura (`_shared/webhook-auth.ts`).
- **Tokens de embed público**: `report-embed-public` serve relatórios por token
  compartilhável — revogáveis, com `no-store` e CORS por origem do token.
- **Páginas HTML públicas**: `email-unsubscribe` (descadastro RFC 8058) e
  `bitrix24-oauth` (callback) — headers de segurança em
  `_shared/security-headers.ts` (ver `docs/SECURITY_HEADERS.md`).
- **Supabase Auth (GoTrue)**: checklist de configuração server-side em
  `docs/AUTH_CONFIG.md` (JWT expiry, refresh rotation, HIBP, rate limits,
  CAPTCHA).

### 🏆 Reconhecimento

Agradecemos pesquisadores de segurança que reportam vulnerabilidades de forma responsável. Com sua permissão, adicionaremos seu nome à nossa lista de agradecimentos em:

- Notas de release de segurança
- Hall da fama de segurança (se implementado)

## Melhores Práticas de Segurança

### Para Usuários

- ✅ **Sempre use HTTPS** ao acessar o Promo Champions
- ✅ **Mantenha suas credenciais seguras** e não compartilhe
- ✅ **Use senhas fortes** e únicas
- ✅ **Habilite autenticação de dois fatores** quando disponível
- ✅ **Mantenha seu navegador atualizado**
- ✅ **Não compartilhe tokens** de API ou sessão
- ⚠️ **Reporte atividades suspeitas** imediatamente

### Para Desenvolvedores

- ✅ **Nunca comite credenciais** no código
- ✅ **Use variáveis de ambiente** para configurações sensíveis
- ✅ **Valide entrada de usuários** em todos os endpoints
- ✅ **Sanitize dados** antes de exibir no frontend
- ✅ **Implemente CORS** adequadamente
- ✅ **Use HTTPS** em produção
- ✅ **Mantenha dependências atualizadas** (`npm audit`)
- ✅ **Revise PRs** com foco em segurança
- ✅ **Siga o princípio do menor privilégio** em RLS

## Configurações de Segurança

### Supabase Row Level Security (RLS)

Todas as tabelas devem ter políticas RLS apropriadas:

```sql
-- Exemplo: Usuários só acessam dados de sua equipe
CREATE POLICY "team_isolation" ON deals
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE team_id = deals.team_id
    )
  );
```

### Variáveis de Ambiente

Nunca exponha:

- `SUPABASE_SERVICE_ROLE_KEY`
- Chaves de API de terceiros
- Secrets de produção

Use apenas:

- `VITE_SUPABASE_URL` (público)
- `VITE_SUPABASE_ANON_KEY` (público)

### Headers de Segurança

Configurar headers apropriados — recomendações de hosting em
`docs/SECURITY_HEADERS.md`:

- `Content-Security-Policy`
- `X-Frame-Options` / `frame-ancestors`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `Referrer-Policy` / `Permissions-Policy`

### Rotação de secrets

Procedimento e inventário de credenciais (Supabase, Resend, Twilio,
ElevenLabs, Bitrix24, VAPID, CI) em **`docs/SECRETS_ROTATION.md`**.

## Dependências e Atualizações

### Verificação Regular

Execute regularmente:

```bash
# Verificar vulnerabilidades conhecidas
npm audit

# Atualizar dependências
npm update

# Verificar versões desatualizadas
npm outdated
```

### Dependabot

O repositório está configurado com Dependabot para:

- Atualizar dependências automaticamente
- Criar PRs para atualizações de segurança
- Manter o projeto seguro

## Recursos de Segurança

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [React Security Best Practices](https://react.dev/learn/security)
- [npm Security](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)

## Contato

Para questões de segurança urgentes:

- **Email**: ti@promobrindes.com.br
- **Issue privada**: Use GitHub Security Advisories

---

**Última atualização**: 01 de Outubro de 2026  
**Mantenedor**: @adm01-debug
