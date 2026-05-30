# 🎨 Style Guide — Promo Champions v2

## Golden Rule
**Always prefer Tailwind utility classes over inline `style={{}}` objects.**

### ✅ DO
```tsx
<div className="flex items-center gap-2 p-4 bg-card rounded-lg">
  <span className="text-sm text-muted-foreground">Content</span>
</div>
```

### ❌ DON'T
```tsx
<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: 'var(--card)', borderRadius: '8px' }}>
  <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Content</span>
</div>
```

## Exceptions
- Dynamic values computed at runtime (e.g., `transform`, `width` from measurements)
- Canvas/SVG coordinate props
- Ripple effect positions

## Design Tokens
All colors use CSS custom properties via Tailwind `hsl(var(--token))` syntax.
Dark mode is handled automatically via `dark:` prefix.

## Accessibility Checklist
- [ ] All interactive elements have keyboard handlers (`onKeyDown` + `tabIndex={0}` or use `<button>`)
- [ ] Form inputs have labels (`aria-label` or `<label htmlFor>`)
- [ ] Modals use `role="dialog"` and trap focus
- [ ] Images have `alt` text
- [ ] Color is never the only indicator of state
- [ ] `prefers-reduced-motion` is respected for animations
