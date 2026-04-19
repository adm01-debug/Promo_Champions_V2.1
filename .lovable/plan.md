
Adicionar novo preset F1 "Powerfull Girl" em `src/components/race/raceColors.ts`, no bloco F1 (após `lady-force`):

```ts
{ id: 'powerfull-girl', name: 'Powerfull Girl', style: 'f1', primary: '#0a0a0a', secondary: '#b026ff', pattern: 'stripes', accent: '#b026ff', emoji: '💜' }
```

Preto `#0a0a0a` base + lilás vivo `#b026ff` nas listras/accent. Mantém consistência visual da família neon-on-black (Black Thunder, Power Girl, O PAI TA ON, Rocket Man). Zero migração SQL.
