
Adicionar novo preset F1 "Lady Force" em `src/components/race/raceColors.ts`, no bloco F1 (após `rocket-man`):

```ts
{ id: 'lady-force', name: 'Lady Force', style: 'f1', primary: '#ffffff', secondary: '#ffb6d9', pattern: 'stripes', accent: '#ffb6d9', emoji: '🎀' }
```

Branco `#ffffff` base + rosa claro `#ffb6d9` nas listras/accent. Inverte a fórmula da família neon-on-black para uma variação clean & soft. Zero migração SQL.
