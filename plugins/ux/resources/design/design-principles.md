# Design Principles

Core UX and visual design principles to apply to all design artifacts produced by this plugin.

---

## 1. Visual Hierarchy

Visual hierarchy directs the user's eye to the most important content first.

**Rules:**

- Use size, weight, and colour contrast to establish importance order.
- The most important element on a screen (primary action or key data) must be visually dominant.
- Limit heading levels to three per screen to avoid competing hierarchy levels.
- Use whitespace to separate and group related elements — proximity implies relationship.

**Common hierarchy pattern:**

```
[Page Title — largest, bold]
[Section Heading — medium, semi-bold]
[Body Text — base size, regular weight]
[Supporting / Meta — smaller, lighter weight or muted colour]
```

---

## 2. Colour

### Colour Roles

| Role | Purpose |
|---|---|
| **Primary** | Main brand colour; used for primary actions and key UI landmarks |
| **Secondary** | Complementary accent; used for secondary actions, highlights |
| **Neutral** | Backgrounds, borders, text — greys or warm/cool neutrals |
| **Semantic: Success** | Confirms positive outcomes (green family) |
| **Semantic: Warning** | Draws attention to caution states (amber/yellow family) |
| **Semantic: Error** | Indicates failure or destructive actions (red family) |
| **Semantic: Info** | Neutral informational messages (blue family) |

### Colour Rules

- Never use colour as the only way to communicate meaning — always pair with a label, icon, or pattern.
- Minimum contrast ratio: 4.5:1 for normal text (WCAG 2.1 AA), 3:1 for large text and UI components.
- Limit the active palette to 2–3 hue families per screen to avoid visual noise.
- Dark-mode equivalents must be defined for every colour token.

---

## 3. Typography

### Type Scale

Use a modular scale based on a base size (typically 16 px for body text on web).

| Token | Size | Weight | Usage |
|---|---|---|---|
| `display` | 36–48 px | Bold (700) | Hero headlines |
| `h1` | 28–32 px | Bold (700) | Page titles |
| `h2` | 22–24 px | Semi-bold (600) | Section headings |
| `h3` | 18–20 px | Semi-bold (600) | Sub-section headings |
| `body` | 16 px | Regular (400) | Primary body copy |
| `body-sm` | 14 px | Regular (400) | Secondary body, helper text |
| `caption` | 12 px | Regular (400) | Metadata, timestamps, labels |
| `label` | 12–14 px | Medium (500) | Form labels, tags |

### Typography Rules

- Limit to two font families per product: one for headings, one for body text (or use a single variable font).
- Line height: 1.4–1.6 for body text; 1.2–1.3 for headings.
- Maximum line length (measure): 60–80 characters for comfortable reading.
- Avoid centre-aligning body text — reserve centring for short headings and callouts.
- Never use pure black (`#000000`) for body text — use a near-black (`#1A1A1A` or similar) to reduce harshness.

---

## 4. Spacing

### Base Unit

Use an 8 px base unit (or 4 px for micro-spacing). All spacing values should be multiples of the base unit.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4 px | Micro gaps (icon-to-label, badge offset) |
| `space-2` | 8 px | Tight internal component padding |
| `space-3` | 12 px | Internal component padding (small components) |
| `space-4` | 16 px | Standard component padding; gap between related elements |
| `space-5` | 24 px | Gap between distinct elements in a group |
| `space-6` | 32 px | Section spacing within a content area |
| `space-8` | 48 px | Major section breaks |
| `space-10` | 64 px | Page-level section dividers |

### Spacing Rules

- Use consistent padding inside components: same value on all sides or symmetric (vertical vs. horizontal).
- Increase spacing proportionally as element size increases.
- Use whitespace intentionally — space implies separation and helps users scan content.
- Do not use spacing as a substitute for visual grouping (borders, backgrounds) when a component boundary is needed.

---

## 5. Interaction States

Every interactive element must have defined states:

| State | Visual Treatment |
|---|---|
| Default | Resting appearance |
| Hover | Subtle colour shift, cursor change (`pointer`) |
| Focus | Visible focus ring — do not remove `outline` without an equivalent |
| Active / Pressed | Darker fill or depressed effect |
| Disabled | Reduced opacity (typically 40%), `not-allowed` cursor, no interaction |
| Loading | Spinner or skeleton; disable interaction during loading |
| Error | Error colour border/icon + error message below the field |
| Success | Success colour indicator + confirmation message |

### Focus Ring Requirements

- Focus ring must be visible in all themes including high-contrast modes.
- Minimum 2 px solid offset focus ring with at least 3:1 contrast against adjacent colours (WCAG 2.1 AA).
- Do not rely solely on colour change for focus indication.

---

## 6. Motion and Animation

### Principles

- **Purpose first.** Motion should communicate state change, guide attention, or reinforce hierarchy — not decorate.
- **Brevity.** Most UI transitions should complete in 150–300 ms. Avoid animations longer than 500 ms for interactive elements.
- **Ease, not linear.** Use ease-in-out or ease-out curves for natural-feeling transitions. Avoid linear for UI motion.
- **Respect user preference.** Always honour `prefers-reduced-motion` by providing static alternatives.

### Standard Presets

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion-fast` | 150 ms | ease-out | Hover states, tooltips, badges |
| `motion-standard` | 250 ms | ease-in-out | Panel transitions, dropdown reveal |
| `motion-slow` | 400 ms | ease-in-out | Modal entry, page-level transitions |

---

## 7. Accessibility Checklist

Apply this checklist to every design artifact:

- [ ] Contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components.
- [ ] Colour is not the only differentiator for meaning.
- [ ] All interactive elements are keyboard-operable.
- [ ] Focus order is logical and matches visual order.
- [ ] Focus rings are visible in all themes.
- [ ] All images and icons have alt text or ARIA labels.
- [ ] Form fields have associated labels (not placeholder-only).
- [ ] Error messages identify the field and describe the problem.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] Touch targets are at least 44 × 44 px on mobile.
