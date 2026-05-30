# ♿ Accessibility Checklist — Promo Champions v2

## Keyboard Navigation
- [ ] All interactive elements have keyboard handlers
- [ ] `div onClick` replaced with `<button>` or has `onKeyDown` + `tabIndex={0}`
- [ ] Tab order is logical (tabIndex only used when necessary)
- [ ] Focus trap in modals/dialogs via FocusTrap component
- [ ] Skip-to-content link present on all pages

## Screen Readers
- [ ] All form inputs have labels (`<label htmlFor>` or `aria-label`)
- [ ] Modals use `role="dialog"` and `aria-modal="true"`
- [ ] Live regions (`aria-live="polite"`) for dynamic content updates
- [ ] Decorative images have `alt=""`
- [ ] Functional images have descriptive `alt` text
- [ ] SVGs have `aria-hidden="true"` when decorative

## Color & Contrast
- [ ] Color is never the only indicator of state (add icons/text)
- [ ] Focus rings visible on all interactive elements
- [ ] Error states include text message (not just red border)
- [ ] Dark mode tested for all components

## Motion
- [ ] `prefers-reduced-motion` respected via `motion-safe:` Tailwind prefix
- [ ] Animations don't auto-play for more than 5 seconds

## Component Guidelines

### Buttons
```tsx
// ✅ DO: semantic button
<button onClick={handler} className="...">Click</button>

// ❌ DON'T: div with only onClick
<div onClick={handler}>Click</div>
```

### Forms
```tsx
// ✅ DO: labeled input
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Alternative for icon-only inputs
<input aria-label="Search" type="search" />
```

### Modals
```tsx
<Dialog role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Title</h2>
</Dialog>
```
