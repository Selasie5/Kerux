# Design System Master File

## Current visual direction (supersedes legacy recipes below)

- Primary: royal blue `#2457EB`; on-primary: white `#FFFFFF`.
- Primary text: `#1D46BC`; pale accent: `#EDF2FF`; background: `#FAFBFE`.
- All border radii: `0`, including buttons, cards, inputs, dialogs, badges, and authentication UI.
- Stack Sans Headline headings with restrained tracking; Geist body and supporting text.
- Hero: spacious typography, concise copy, a clear primary action, and a framed product preview.
- Navbar: solid white, aligned content edges, thin dividers, blue hover indicators.

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Kerux
**Generated:** 2026-08-29 16:12:10
**Category:** Financial Dashboard
**Design Dials:** Variance 6/10 (Balanced / Modern) | Motion 3/10 (Subtle) | Density 7/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#C7F252` | `--color-primary` |
| On Primary | `#1C1B17` | `--color-on-primary` |
| Primary Ink | `#3F6212` | `--color-primary-ink` |
| Secondary | `#EEF1EB` | `--color-secondary` |
| On Secondary | `#292D27` | `--color-on-secondary` |
| Accent/CTA | `#C7F252` | `--color-accent` |
| On Accent/CTA | `#1C1B17` | `--color-on-accent` |
| Background | `#FAFBF8` | `--color-background` |
| Foreground | `#1C1B17` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#1C1B17` | `--color-card-foreground` |
| Muted | `#F1F3EF` | `--color-muted` |
| Muted Foreground | `#5F665D` | `--color-muted-foreground` |
| Border | `rgba(28,27,23,0.13)` | `--color-border` |
| Destructive | `#BE123C` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#4D7C0F` | `--color-ring` |

**Color Notes:** Crisp white canvas, near-black ink, and a Ramp-inspired electric chartreuse reserved for actions, live status, and policy progress. Dark olive ink carries green text and focus states for accessible contrast.

### Typography

- **Heading Font:** Stack Sans Headline
- **Body Font:** Geist
- **Mood:** technical, editorial, precise, modern, trustworthy
- **Font Sources:** [Stack Sans Headline](https://fontsource.org/fonts/stack-sans-headline) + [Geist](https://fontsource.org/fonts/geist)

**CSS Import:**
```css
@import '@fontsource-variable/stack-sans-headline/wght.css';
@import '@fontsource-variable/geist/wght.css';
```

### Spacing Variables

*Density: 7/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 0 0 1px rgba(28,27,23,.07), 0 1px 2px -1px rgba(28,27,23,.08)` | Controls and inset groups |
| `--shadow-md` | `0 0 0 1px rgba(28,27,23,.07), 0 1px 2px -1px rgba(28,27,23,.08), 0 2px 4px rgba(28,27,23,.04)` | Cards and buttons |
| `--shadow-lg` | `0 0 0 1px rgba(28,27,23,.10), 0 6px 12px -4px rgba(28,27,23,.10)` | Modals and dropdowns |
| `--shadow-xl` | `0 0 0 1px rgba(28,27,23,.10), 0 12px 24px -8px rgba(28,27,23,.14)` | Rare floating surfaces |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #C7F252;
  color: #1C1B17;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 160ms cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
}

.btn-primary:hover {
  background: rgba(199,242,82,.85);
}

/* Secondary Button */
.btn-secondary {
  background: #FFFFFF;
  color: #1C1B17;
  border: 1px solid rgba(28,27,23,.13);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 160ms cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
}
```

### Inputs

```css
.input {
  background: #F3F5F1;
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #4D7C0F;
  outline: none;
  box-shadow: 0 0 0 3px rgba(77,124,15,.18);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Crisp White + Electric Chartreuse

**Keywords:** White theme, electric chartreuse, near-black ink, audit-grade, high contrast, precise, financial operations

**Best For:** Banking operations, transaction review, account controls, daylight workspaces

**Key Effects:** Near-white canvas, pure-white raised surfaces, neutral inset controls, electric-green highlights, subtle layered shadows, dark-green focus

### Page Pattern

**Pattern Name:** Enterprise Gateway

- **Conversion Strategy:** Path selection (I am a...). Mega menu navigation. Trust signals prominent. Provide pause/stop for video and rotating logos; stop on focus and reduced motion. Logo carousel controls must be keyboard operable; pause moving media offscreen/hidden and render a static final state under reduced motion.
- **CTA Placement:** Contact Sales (Primary) + Login (Secondary)
- **Section Order:** Hero (Video/Mission) > Solutions by Industry > Solutions by Role > Client Logos > Contact Sales

---

## Motion

**Scroll Reveal** (Subtle) — Trigger: scroll (viewport enter) | Duration: 300-400ms | Easing: `power1.out`

```js
gsap.from(el, { opacity: 0, y: 12, duration: 0.35, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
```

**Framework notes:** Requires the ScrollTrigger plugin registered once via gsap.registerPlugin(ScrollTrigger); Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Keep the y offset small (8-16px) so it reads as a fade, not a slide
- ❌ Don't reveal below-the-fold content needed for SEO/crawlers as invisible-by-default without a no-JS fallback
- ⚡ toggleActions 'play none none reverse' avoids re-triggering on every scroll direction change

---

## Anti-Patterns (Do NOT Use)

- ❌ Blue-black canvas or dark mode default
- ❌ Slow rendering

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
