# Frontend Knowledge — Maya

## Component Architecture

### One component, one job
A component should be describable in a single sentence without using "and".
Split when a component handles more than one of: layout, data, formatting, interaction.

### Composition over configuration
Build small focused components and compose them, rather than one large component
controlled by many props/flags.
- Wrong: `<Modal type="confirm" hasFooter showCloseButton title="..." />`
- Right: `<Modal><ModalHeader /><ModalBody /><ModalFooter /></Modal>`

### Props discipline
- Props are the public API of a component. Keep them minimal.
- Do not leak internal implementation details as props.
- Avoid boolean props that change behaviour entirely — use composition or separate components instead.
- Prop drilling beyond 2 levels is a signal to use context, a store, or component composition.

### Reuse checklist
Before writing a new component ask:
1. Does this already exist in the project?
2. Can an existing component be extended with a prop?
3. Can I compose two existing components instead?

---

## CSS Architecture

### Design tokens first
All repeated values live in CSS custom properties on `:root`.
Never hardcode a value that appears more than once.

```css
:root {
  /* Spacing scale — multiples of 4px */
  --space-1:  4px;
  --space-2:  8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Type scale */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */

  /* Animation */
  --duration-fast:  150ms;
  --duration-base:  250ms;
  --duration-slow:  400ms;
  --ease-out:       cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out:    cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

### Naming convention — BEM
- Block: `.card`
- Element: `.card__title`, `.card__body`
- Modifier: `.card--featured`, `.card__title--large`
- Do not nest BEM beyond two levels.

### Avoid
- Inline `style=""` attributes for static values — use classes.
- `!important` — it signals a specificity problem, fix the root cause.
- Overqualified selectors: `div.card` should just be `.card`.
- Deeply nested selectors: max 3 levels deep.

---

## Animations

### Every animation needs a purpose
State it in one sentence. If you cannot, remove the animation.
Examples of valid purposes:
- "Confirms the button was clicked" → brief scale pulse
- "Shows the menu is appearing from the top" → slide-down transition
- "Draws attention to a new notification" → subtle fade-in

### Performance rules
Only animate `transform` and `opacity`. These run on the compositor thread
and never trigger layout or paint.

| Want to animate | Use instead |
|---|---|
| `width` / `height` | `transform: scale()` |
| `top` / `left` | `transform: translate()` |
| `margin` / `padding` | `transform: translate()` |
| `display: none → block` | `opacity` + `visibility` or `transform: scale(0→1)` |

### Reduced motion — mandatory
Every animation must have a reduced-motion counterpart.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### When to use which tool
- `transition` — state changes on existing elements (hover, focus, open/close)
- `@keyframes` + `animation` — looping or multi-step sequences
- JS (Web Animations API) — only when CSS cannot achieve the result

---

## Framework-Agnostic Patterns

### React
- Prefer function components with hooks. No class components.
- Co-locate state as close to where it's used as possible.
- `useEffect` is for synchronising with external systems, not for derived state.
- Extract repeated logic into custom hooks (`useFetch`, `useToggle`, etc.).

### Vue
- Single File Components (`.vue`) — template, script, style in one file.
- Use `computed` for derived state, not `watch`.
- Prefer `defineProps` / `defineEmits` with explicit types.

### Svelte
- Reactivity is built in — `$:` for derived values, no `useState` needed.
- Use component slots for composition.
- Scoped styles by default — leverage this, don't fight it.

### Plain HTML/CSS/JS
- Use `<template>` elements and `cloneNode` for repeated markup.
- CSS custom properties work in all modern browsers — use them as your token system.
- Avoid jQuery or heavy libraries for simple DOM tasks — the native API is sufficient.

---

## Add Your Research Below
<!-- Paste notes, articles, patterns, and framework-specific findings here.
     Each agent loads this file at runtime so changes take effect immediately. -->
