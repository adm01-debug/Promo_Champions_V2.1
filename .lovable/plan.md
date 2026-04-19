
Adicionar novo preset F1 "Rocket Man" em `src/components/race/raceColors.ts`, no bloco F1 (após `pai-ta-on`):

```ts
{ id: 'rocket-man', name: 'Rocket Man', style: 'f1', primary: '#0a0a0a', secondary: '#ff0033', pattern: 'stripes', accent: '#ff0033', emoji: '🚀' }
```

Preto `#0a0a0a` base + vermelho vivo `#ff0033` nas listras/accent. Mantém consistência visual da família neon-on-black (Black Thunder, Power Girl, O PAI TA ON). Zero migração SQL.
