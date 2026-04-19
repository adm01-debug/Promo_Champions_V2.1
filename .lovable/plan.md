
Adicionar novo preset F1 "Monster" em `src/components/race/raceColors.ts`, no bloco F1 (após `full-energy`):

```ts
{ id: 'monster', name: 'Monster', style: 'f1', primary: '#0a0a0a', secondary: '#39ff14', pattern: 'stripes', accent: '#39ff14', emoji: '👹' }
```

Preto `#0a0a0a` base + verde neon `#39ff14` nas listras/accent. Mantém consistência da família neon-on-black (Black Thunder, Girl Force, Rocket Man, The Panther). Zero migração SQL.
