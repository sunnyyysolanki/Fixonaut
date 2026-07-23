# Fixonaut Design System

## Design direction

```text
Theme:       Mission Control
Components:  shadcn/ui-inspired
Layout:      Linear-inspired
Typography:  Clean enterprise SaaS
```

Fixonaut should feel like a calm operations control center: focused, reliable, technical, and easy to use during a busy service day.

## Product personality

- Professional, not corporate-heavy
- Technical, not intimidating
- Operational, not decorative
- Clear, not crowded
- Fast to scan
- Strong visual feedback for job states

## Color tokens

### Dark theme

```text
Background:       #020617  slate-950
Surface:          #0f172a  slate-900
Elevated surface: #1e293b  slate-800
Border:           #334155  slate-700
Primary action:   #f97316  orange-500
Primary hover:    #ea580c  orange-600
Primary soft:     #431407  orange-950
Text primary:     #f8fafc  slate-50
Text secondary:   #cbd5e1  slate-300
Text muted:       #94a3b8  slate-400
Success:          #10b981  emerald-500
Warning:          #f59e0b  amber-500
Danger:           #ef4444  red-500
Info:             #3b82f6  blue-500
```

## Service-request status colors

```text
NEW:              blue
ASSIGNED:         violet
ACCEPTED:         cyan
IN_PROGRESS:      orange
WAITING_FOR_PART: amber
COMPLETED:        emerald
CANCELLED:        red
```

Status should be communicated with color and text/icon together. Never rely on color alone.

## Responsive breakpoints

```text
Mobile:  320px–639px
Tablet:  640px–1023px
Desktop: 1024px–1279px
Large:   1280px+
```

### Layout behavior

- Desktop: fixed collapsible sidebar and content area.
- Tablet: narrower sidebar or collapsible sidebar.
- Mobile: sidebar becomes a drawer.
- Tables: horizontal scroll or card transformation on small screens.
- Forms: one column on mobile, two columns on desktop.
- Metric cards: one column on mobile, two on tablet, four on large screens.
- Modals: never exceed viewport width or height.
- Long content: wrap or scroll instead of overlapping.

## Spacing

Use Tailwind spacing tokens consistently:

```text
Page padding:      p-4 mobile, p-6 desktop, p-8 large
Card padding:      p-4 mobile, p-6 desktop
Section spacing:   gap-6 or gap-8
Form field gap:    gap-4
Navigation gap:    gap-1
```

## Shape and depth

```text
Small controls:    rounded-lg
Cards/panels:      rounded-xl or rounded-2xl
Modals:            rounded-2xl
Borders:           1px solid slate-800
Shadows:           subtle; avoid excessive elevation
```

## Typography

Use a clean system sans-serif stack initially:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Hierarchy:

```text
Page title:       text-2xl/3xl, font-bold
Section title:    text-lg, font-semibold
Body:             text-sm/base
Supporting text:  text-sm, text-slate-400
Labels:           text-sm, font-medium
Metadata:         text-xs, text-slate-500
```

## Component rules

### Buttons

- Primary buttons use orange.
- Destructive actions use red and require confirmation when appropriate.
- Secondary actions use slate surfaces and borders.
- Every button has a visible disabled state.
- Buttons must remain usable on mobile.

### Cards

- Use cards for grouped information, not every element.
- Keep card hierarchy clear.
- Avoid heavy gradients and excessive shadows.

### Tables

- Use compact readable rows.
- Provide loading, empty, and error states.
- Provide pagination for server data.
- Use horizontal scrolling on narrow screens.
- Keep actions in a consistent final column.

### Forms

- Every input has a visible label.
- Validation errors appear near the field.
- Required fields are clear.
- Submit buttons show loading state.
- Server errors are shown in a consistent alert.

### Navigation

- Desktop: sidebar with active orange link.
- Mobile: menu button opens a drawer.
- Active route must be visually obvious.
- Navigation labels must not wrap unexpectedly.

## Accessibility rules

- Maintain readable contrast.
- Never communicate status only through color.
- Provide focus styles.
- Use semantic buttons and links.
- Add labels to form fields.
- Support keyboard navigation.
- Use `aria-label` for icon-only controls.

## Responsive quality checklist

For every screen, verify at:

```text
375 × 667   mobile
768 × 1024  tablet
1366 × 768  laptop
1920 × 1080 large desktop
```

Check:

- No horizontal page overflow.
- No overlapping text or controls.
- Navigation remains usable.
- Tables remain readable.
- Buttons remain accessible.
- Modals fit the viewport.
- Loading and error states do not shift the layout unexpectedly.

## Component building order

1. App shell
2. Sidebar and mobile drawer
3. Page header
4. Button
5. Input and form field
6. Card
7. Badge/status pill
8. Table
9. Modal/dialog
10. Toast/alert
11. Empty state
12. Loading skeleton

## Inspiration

Use these as visual references, not copy sources:

- Linear — navigation and calm dark product UI
- shadcn/ui — accessible component patterns
- Tailwind UI — responsive application shells
- Vercel — typography and spacing discipline

## Design decision

We will build a custom Fixonaut visual identity using Tailwind CSS and shadcn/ui-inspired patterns rather than copying a template. The interface should prioritize operational clarity over visual decoration.
