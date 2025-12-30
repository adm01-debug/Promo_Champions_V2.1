# 🎯 INTEGRAÇÃO LOVABLE.DEV - SALESPRO

Este guia explica como conectar o projeto SalesPro ao Lovable.dev para desenvolvimento visual e AI-powered.

## 📋 PRÉ-REQUISITOS

- ✅ Conta no Lovable.dev
- ✅ Conta no GitHub (você já tem)
- ✅ Repositório: `adm01-debug/salespro`

## 🔗 COMO CONECTAR AO LOVABLE

### Método 1: Integração Direta (Recomendado)

1. **Acesse Lovable.dev**
   - Vá para https://lovable.dev
   - Faça login com sua conta

2. **Conecte o GitHub**
   - Clique em Settings → Connectors → GitHub
   - Clique em "Add organizations"
   - Autorize o acesso ao repositório `adm01-debug/salespro`

3. **Importe o Projeto**
   - Crie um novo projeto no Lovable
   - Escolha "Connect to GitHub"
   - Selecione o repositório `adm01-debug/salespro`
   - O Lovable irá sincronizar automaticamente

4. **Aguarde a Sincronização**
   - O Lovable irá carregar todos os arquivos
   - O preview será gerado automaticamente
   - Pode levar 1-2 minutos

### Método 2: Importação Manual (Alternativa)

Se a integração direta não funcionar:

1. Baixe o repositório como ZIP do GitHub
2. No Lovable, crie um novo projeto vazio
3. Use o recurso "Import" para fazer upload do ZIP
4. Configure a sincronização bidirecional

## ✅ VERIFICAÇÕES PÓS-INTEGRAÇÃO

Após conectar, verifique se:

- [ ] O preview está carregando corretamente
- [ ] Não há erros no console do navegador
- [ ] O hot-reload está funcionando
- [ ] As mudanças no Lovable aparecem no GitHub

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Variáveis de Ambiente

Configure no Lovable (Settings → Environment Variables):

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica
```

### Portas e Servidores

- **Porta de Desenvolvimento**: 8080
- **Preview URL**: Gerado automaticamente pelo Lovable
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`

## 🐛 TROUBLESHOOTING

### Preview em Branco

Se o preview aparecer em branco:

1. Abra o DevTools (F12)
2. Verifique erros no console
3. No Lovable, clique em "Try to Fix"
4. Se persistir, peça ao Lovable: "Review vite.config.ts file"

### Erros de Build

Se houver erros de build:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Execute localmente: `npm run build`
3. Se funcionar localmente mas não no Lovable, reporte o erro

### Sincronização Quebrada

Se a sincronização GitHub parar:

1. Vá em Settings → GitHub
2. Clique em "Disconnect"
3. Reconecte o repositório
4. Force um refresh no preview

## 📚 RECURSOS ÚTEIS

- **Documentação Lovable**: https://docs.lovable.dev
- **Troubleshooting**: https://docs.lovable.dev/tips-tricks/troubleshooting
- **GitHub Integration**: https://docs.lovable.dev/integrations/github
- **Support**: https://lovable.dev/support

## 🎨 DICAS DE USO

### Editando com AI

No Lovable, você pode:

```
"Adicione um botão de exportar dados na página de analytics"
"Mude a cor principal para #7c3aed"
"Crie um componente de notificações toast"
```

### Modo Chat vs Modo Edit

- **Chat Mode**: Para planejamento e discussões
- **Edit Mode**: Para mudanças diretas no código
- Use "Try to Fix" quando houver erros

### Best Practices

1. Sempre comite mudanças significativas
2. Use branches para features experimentais
3. Teste no preview antes de fazer push
4. Mantenha o GitHub como fonte da verdade

## ✨ PRÓXIMOS PASSOS

Após conectar ao Lovable:

1. Explore o preview interativo
2. Experimente fazer mudanças via AI
3. Teste a sincronização bidirecional
4. Configure deployment (Vercel, Netlify, etc.)

---

**Status**: ✅ Projeto pronto para Lovable  
**Última atualização**: 2024-12-30  
**Versão**: 1.0
