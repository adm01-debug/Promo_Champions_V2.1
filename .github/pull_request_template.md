## 📝 Descrição
<!-- Descreva as mudanças desta PR -->

## 🎯 Issue Relacionada
Closes #

## 🔄 Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova feature
- [ ] 💥 Breaking change
- [ ] 📚 Documentação
- [ ] ♻️ Refatoração
- [ ] 🧪 Testes
- [ ] 🔒 Segurança
- [ ] ⚡ Performance

## ✅ Checklist Obrigatório
- [ ] `tsc --noEmit` passa sem erros (strict mode)
- [ ] `eslint` passa sem warnings
- [ ] Testes existentes continuam passando (`vitest run`)
- [ ] Novos testes adicionados para lógica de negócio
- [ ] Build passa sem erros

## 🔒 Checklist de Segurança
- [ ] Nenhum secret/credencial no código-fonte
- [ ] RLS policies atualizadas (se tabelas foram modificadas)
- [ ] Inputs validados no backend (Edge Functions)
- [ ] Sem `console.info` em código de produção (usar guard `import.meta.env.DEV`)
- [ ] CORS restritivo em Edge Functions

## ⚡ Checklist de Performance
- [ ] Componentes pesados usam `React.memo` / `useMemo`
- [ ] Lazy loading para rotas e componentes grandes
- [ ] Queries com paginação server-side
- [ ] Bundle size não aumentou significativamente

## ♿ Checklist de Acessibilidade
- [ ] Labels ARIA em botões de ícone
- [ ] Contraste adequado (WCAG AA)
- [ ] Navegação por teclado funcional

## 🧪 Como Testar
1. Checkout desta branch
2. Executar `npm install`
3. Executar `npm run health` (typecheck + lint + tests)
4. Testar funcionalidade descrita

## 📸 Screenshots
<!-- Se aplicável -->

## 📝 Notas Adicionais
<!-- Qualquer informação relevante -->
