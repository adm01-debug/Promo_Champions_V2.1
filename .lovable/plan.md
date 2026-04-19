
Adicionar novo preset F1 "Pink" em `src/components/race/raceColors.ts`, no bloco F1 (após `monster`):

```ts
{ id: 'pink', name: 'Pink', style: 'f1', primary: '#0a0a0a', secondary: '#ff10f0', pattern: 'stripes', accent: '#ff10f0', emoji: '💗' }
```

Preto `#0a0a0a` base + rosa neon `#ff10f0` nas listras/accent. Mantém consistência da família neon-on-black (Black Thunder, Girl Force, The Panther, Monster). Zero migração SQL.
