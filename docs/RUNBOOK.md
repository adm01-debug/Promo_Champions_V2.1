# 🚀 Runbook Operacional — Promo Champions

## Índice
1. [Deploy](#deploy)
2. [Rollback](#rollback)
3. [Incidentes](#incidentes)
4. [Troubleshooting](#troubleshooting)

---

## Deploy

### Deploy Padrão (via Lovable)
1. Commit na branch principal via Lovable
2. Build automático é disparado
3. Preview disponível imediatamente
4. Publicar via botão "Publish" no Lovable

### Validação Pré-Deploy
```bash
npm run health     # typecheck + lint + tests
npm run build      # build de produção
```

### Deploy de Edge Functions
- Edge Functions são deployadas automaticamente pelo Lovable
- Para testar antes: use `curl_edge_functions` no painel

---

## Rollback

### Rollback Rápido (< 2 min)
1. Acessar **Lovable** → histórico de versões
2. Selecionar versão anterior estável
3. Restaurar

### Rollback de Migrations
- Migrations não são automaticamente reversíveis
- Para reverter: criar nova migration com `DROP`/`ALTER` inverso
- **NUNCA** deletar migrations existentes

---

## Incidentes

### Severidades

| Nível | Critério | SLA |
|-------|----------|-----|
| 🔴 P1 | Sistema fora do ar / Perda de dados | < 30 min |
| 🟠 P2 | Feature crítica quebrada | < 2 horas |
| 🟡 P3 | Bug não-bloqueante | < 24 horas |
| 🟢 P4 | Melhoria / cosmético | Próximo sprint |

### Procedimento de Incidente
1. **Detectar** — via monitoramento, alerta ou report de usuário
2. **Classificar** — atribuir severidade (P1-P4)
3. **Comunicar** — notificar stakeholders
4. **Investigar** — logs, métricas, reproduzir
5. **Mitigar** — hotfix ou rollback
6. **Resolver** — fix definitivo com testes
7. **Post-mortem** — documentar causa raiz e ações preventivas

---

## Troubleshooting

### DB Lento
1. Verificar queries lentas: `SELECT * FROM pg_stat_activity WHERE state = 'active'`
2. Checar índices: queries sem índice? Adicionar via migration
3. Connection pool: verificar se pooler está ativo

### Edge Function Timeout
1. Verificar logs da function
2. Checar se chamadas externas (Bitrix24, Resend) estão respondendo
3. Implementar timeout explícito com `AbortController`

### Erro 401/403 em API
1. Token expirado? Verificar refresh token flow
2. RLS blocking? Testar query como service_role
3. Role incorreto? Verificar `user_roles` table

### Push Notifications Não Chegam
1. Verificar `push_subscriptions` table — subscription existe?
2. Verificar VAPID keys — estão configuradas nos secrets?
3. Service Worker registrado? Checar `navigator.serviceWorker.getRegistration()`

### Build Falha
```bash
npm run typecheck   # Erros de tipo
npm run lint        # Erros de lint  
npm run test        # Testes quebrados
```

---

## Contatos

| Papel | Responsável |
|-------|-------------|
| Lead Dev | Configurar no README |
| DevOps | Lovable Cloud (automático) |
| Suporte DB | Lovable Cloud Dashboard |
