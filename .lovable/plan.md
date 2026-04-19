
Adicionar novo preset F1 "The Panther" em `src/components/race/raceColors.ts`, no bloco F1 (após `powerfull-girl`):

```ts
{ id: 'the-panther', name: 'The Panther', style: 'f1', primary: '#0a0a0a', secondary: '#ff6a00', pattern: 'stripes', accent: '#ff6a00', emoji: '�black' }
```

Preto `#0a0a0a` base + laranja neon `#ff6a00` nas listras/accent. Mantém consistência da família neon-on-black (Black Thunder, Power Girl, O PAI TA ON, Rocket Man, Powerfull Girl). Zero migração SQL.
