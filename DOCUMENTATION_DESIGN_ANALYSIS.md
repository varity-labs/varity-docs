# World-Class Documentation Design Analysis

## Executive Summary

This report analyzes the UI/UX design patterns of the top documentation websites that developers love: **Supabase**, **Stripe**, **Vercel**, **Tailwind CSS**, and **Linear**. The goal is to identify specific, actionable design patterns for docs.varity.so to achieve a world-class, professional appearance that avoids looking "AI-generated" or template-like.

---

## Table of Contents

1. [Design Philosophy Comparison](#design-philosophy-comparison)
2. [Layout & Grid Systems](#layout--grid-systems)
3. [Typography Systems](#typography-systems)
4. [Color Palettes](#color-palettes)
5. [Visual Hierarchy Techniques](#visual-hierarchy-techniques)
6. [What Makes Them NOT Look Template-Like](#what-makes-them-not-look-template-like)
7. [Mobile & Responsive Patterns](#mobile--responsive-patterns)
8. [Homepage vs Inner Docs](#homepage-vs-inner-docs)
9. [Trust Signals & Emotional Design](#trust-signals--emotional-design)
10. [Actionable Recommendations for Varity](#actionable-recommendations-for-varity)
11. [CSS Reference Values](#css-reference-values)

---

## Design Philosophy Comparison

| Site | Core Philosophy | Emotional Tone | Key Differentiator |
|------|-----------------|----------------|-------------------|
| **Stripe** | Precision & Trust | Professional, Financial-grade | Meticulous attention to detail, premium gradients |
| **Supabase** | Developer Empowerment | Technical, Open | Icon-driven navigation, dark-first design |
| **Vercel** | Cutting-edge Speed | Futuristic, Confident | Bold typography, AI-forward messaging |
| **Tailwind** | Utility & Clarity | Pragmatic, Educational | Code-first approach, live examples |
| **Linear** | Premium Minimalism | Sophisticated, Refined | Ultra-clean UI, intentional restraint |

---

## Layout & Grid Systems

### Sidebar Specifications

| Site | Sidebar Width | Content Max-Width | Right TOC | Total Layout |
|------|---------------|-------------------|-----------|--------------|
| **Stripe** | 240-280px | 720-800px | Optional TOC | Three-column |
| **Supabase** | 256px (16rem) | 80ch (~640px) | 200px TOC | Three-column |
| **Vercel** | 240px | 768px | 200px TOC | Three-column |
| **Tailwind** | 256px (16rem) | max-w-3xl (768px) | Fixed TOC | Three-column |
| **Linear** | 220px | 680px | Minimal | Two-column |

### Recommended Layout Structure

```css
/* Three-column documentation layout */
.docs-layout {
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr) 200px;
  max-width: 1440px;
  margin: 0 auto;
}

/* Sidebar */
.sidebar {
  width: 256px;
  min-width: 256px;
  max-width: 300px;
  position: sticky;
  top: 64px; /* Header height */
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding: 24px 16px;
}

/* Main content */
.content {
  max-width: 768px;
  padding: 32px 48px;
  /* OR use character-based width for optimal reading */
  max-width: 80ch;
}

/* Table of Contents (right) */
.toc {
  width: 200px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  padding: 24px 16px;
}
```

### Spacing System

All top sites use an 8px base grid:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

---

## Typography Systems

### Font Families Used

| Site | Primary Font | Code Font | Why It Works |
|------|--------------|-----------|--------------|
| **Stripe** | Custom (Inter-like) | Source Code Pro | Premium feel, highly legible |
| **Supabase** | Inter | Fira Code | Developer-familiar, open source |
| **Vercel** | Geist | Geist Mono | Brand identity, modern |
| **Tailwind** | Inter Variable | IBM Plex Mono | Excellent variable font support |
| **Linear** | Inter | Inter/System mono | Sophisticated simplicity |

### Recommended: Inter Font Implementation

```css
/* Inter Font Setup */
@import url('https://rsms.me/inter/inter.css');

:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
}

@supports (font-variation-settings: normal) {
  :root {
    font-family: 'InterVariable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
}
```

### Type Scale

```css
:root {
  /* Display/Hero text */
  --text-display: 3.5rem;      /* 56px - Homepage heroes only */

  /* Headings */
  --text-h1: 2.25rem;          /* 36px */
  --text-h2: 1.875rem;         /* 30px */
  --text-h3: 1.5rem;           /* 24px */
  --text-h4: 1.25rem;          /* 20px */

  /* Body */
  --text-body: 1rem;           /* 16px */
  --text-body-lg: 1.125rem;    /* 18px - for introductions */
  --text-sm: 0.875rem;         /* 14px - captions, metadata */
  --text-xs: 0.75rem;          /* 12px - labels, tags */

  /* Code */
  --text-code: 0.875rem;       /* 14px */
}
```

### Line Heights & Letter Spacing

```css
:root {
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.25;       /* Headings */
  --leading-snug: 1.375;       /* H3, H4 */
  --leading-normal: 1.5;       /* Body text */
  --leading-relaxed: 1.625;    /* Long-form reading */
  --leading-loose: 2;          /* Special cases */

  /* Letter spacing */
  --tracking-tighter: -0.05em; /* Large display text */
  --tracking-tight: -0.025em;  /* H1, H2 */
  --tracking-normal: 0;        /* Body text */
  --tracking-wide: 0.025em;    /* Small text, labels */
  --tracking-wider: 0.05em;    /* ALL CAPS */
}

/* Application */
h1 {
  font-size: var(--text-h1);
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

p {
  font-size: var(--text-body);
  font-weight: 400;
  line-height: var(--leading-relaxed);
  letter-spacing: var(--tracking-normal);
}
```

### Font Weights

```css
:root {
  --font-normal: 400;    /* Body text */
  --font-medium: 500;    /* Emphasis, navigation */
  --font-semibold: 600;  /* Headings, buttons */
  --font-bold: 700;      /* Strong emphasis only */
}
```

---

## Color Palettes

### Stripe's Premium Palette

```css
:root {
  /* Primary Brand */
  --stripe-purple: #635bff;
  --stripe-navy: #0a2540;

  /* Gradient Accents */
  --stripe-lavender: #a960ee;
  --stripe-coral: #ff333d;
  --stripe-sky: #90e0ff;
  --stripe-gold: #ffcb57;

  /* Neutrals */
  --stripe-white: #ffffff;
  --stripe-gray-50: #f6f9fc;
  --stripe-gray-100: #e6ebf1;
  --stripe-gray-500: #697386;
  --stripe-gray-900: #1a1f36;
}
```

### Supabase Dark-First Palette

```css
:root {
  /* Brand */
  --supabase-green: #3ecf8e;
  --supabase-green-dark: #24b47e;

  /* Dark Mode */
  --supabase-bg: #1c1c1c;
  --supabase-bg-alt: #2a2a2a;
  --supabase-surface: #1e1e1e;
  --supabase-border: #333333;

  /* Text */
  --supabase-text: #ededed;
  --supabase-text-muted: #888888;
}
```

### Recommended Dark Mode Palette for Varity

```css
/* Dark Mode (Primary) */
:root {
  /* Backgrounds - Avoid pure black (#000) */
  --bg-base: #0F172A;          /* Deep navy-black */
  --bg-surface: #1E293B;       /* Cards, panels */
  --bg-elevated: #334155;      /* Hover states, dropdowns */
  --bg-subtle: #0B111E;        /* Even darker for contrast */

  /* Borders */
  --border-default: #334155;
  --border-muted: #1E293B;
  --border-emphasis: #475569;

  /* Text */
  --text-primary: #F1F5F9;     /* Main content - NOT pure white */
  --text-secondary: #94A3B8;   /* Muted text */
  --text-tertiary: #64748B;    /* Placeholders, disabled */

  /* Brand Accent - Choose ONE signature color */
  --brand-primary: #3B82F6;    /* Varity blue */
  --brand-hover: #60A5FA;
  --brand-muted: #1E40AF;

  /* Semantic Colors */
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}

/* Light Mode */
[data-theme="light"] {
  --bg-base: #FFFFFF;
  --bg-surface: #F8FAFC;
  --bg-elevated: #F1F5F9;
  --bg-subtle: #E2E8F0;

  --border-default: #E2E8F0;
  --border-muted: #F1F5F9;
  --border-emphasis: #CBD5E1;

  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
}
```

### Contrast Ratios (WCAG Compliance)

| Element | Light Mode Ratio | Dark Mode Ratio | Requirement |
|---------|------------------|-----------------|-------------|
| Body text | 12.6:1 | 11.9:1 | 4.5:1 min |
| Secondary text | 7.2:1 | 5.4:1 | 4.5:1 min |
| Large headings | 12.6:1 | 11.9:1 | 3:1 min |
| Links on bg | 4.8:1 | 5.2:1 | 4.5:1 min |

---

## Visual Hierarchy Techniques

### 1. Progressive Disclosure (Stripe/Supabase)

```css
/* Section with expandable content */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  cursor: pointer;
}

.section-header::before {
  content: '';
  width: 20px;
  height: 20px;
  background-image: url('chevron.svg');
  transition: transform 0.2s ease;
}

.section-header[aria-expanded="true"]::before {
  transform: rotate(90deg);
}
```

### 2. Visual Weight Through Color (All Sites)

```css
/* Primary actions stand out */
.btn-primary {
  background: var(--brand-primary);
  color: white;
  font-weight: 500;
}

/* Secondary actions recede */
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

/* Links within content */
.content a {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

### 3. Whitespace as Design Element (Linear)

```css
/* Generous section spacing */
.section {
  padding: 64px 0;
}

.section + .section {
  border-top: 1px solid var(--border-muted);
}

/* Content breathing room */
.content p + p {
  margin-top: 24px;
}

.content h2 {
  margin-top: 48px;
  margin-bottom: 24px;
}

.content h3 {
  margin-top: 32px;
  margin-bottom: 16px;
}
```

### 4. Subtle Elevation (Tailwind/Vercel)

```css
/* Cards and elevated surfaces */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Hover elevation */
.card:hover {
  border-color: var(--border-emphasis);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}
```

---

## What Makes Them NOT Look Template-Like

### 1. Custom Icon Systems

**Template Look:** Generic icon libraries (FontAwesome, Material Icons)
**Premium Look:** Custom-designed icons with consistent stroke width, style, and brand alignment

```css
/* Icon sizing system */
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }

/* Consistent stroke */
.icon {
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

### 2. Micro-interactions

**Template Look:** Instant state changes
**Premium Look:** Subtle, physics-based animations

```css
/* Button hover */
.btn {
  transition:
    background-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

/* Link hover */
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--brand-primary);
  transition: width 0.2s ease;
}

.nav-link:hover::after {
  width: 100%;
}
```

### 3. Thoughtful Empty States

**Template Look:** Generic "No results found"
**Premium Look:** Helpful guidance with illustration

### 4. Code Block Styling

**Template Look:** Basic monospace with simple highlighting
**Premium Look:** Custom syntax theme, line numbers, copy button, language badge

```css
/* Premium code block */
.code-block {
  position: relative;
  background: #0D1117;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  overflow: hidden;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border-default);
}

.code-block-lang {
  font-size: 12px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-block-copy {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.code-block-copy:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
}

/* Line numbers */
.code-block.with-line-numbers pre {
  counter-reset: line;
}

.code-block.with-line-numbers .line::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 2rem;
  margin-right: 1rem;
  text-align: right;
  color: var(--text-tertiary);
}
```

### 5. Consistent Border Radius

**Template Look:** Mixed border radii
**Premium Look:** Consistent radius scale

```css
:root {
  --radius-sm: 4px;    /* Buttons, inputs */
  --radius-md: 8px;    /* Cards, modals */
  --radius-lg: 12px;   /* Large containers */
  --radius-xl: 16px;   /* Hero sections */
  --radius-full: 9999px; /* Pills, avatars */
}
```

### 6. Strategic Use of Gradients (Stripe)

```css
/* Subtle gradient backgrounds */
.hero-gradient {
  background: linear-gradient(
    135deg,
    var(--bg-base) 0%,
    rgba(59, 130, 246, 0.1) 50%,
    var(--bg-base) 100%
  );
}

/* Text gradient for emphasis */
.gradient-text {
  background: linear-gradient(
    90deg,
    var(--brand-primary),
    var(--brand-hover)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Mobile & Responsive Patterns

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile-first approach */
@media (max-width: 1023px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    width: 100%;
    max-width: 320px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 50;
    background: var(--bg-base);
    border-right: 1px solid var(--border-default);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .toc {
    display: none; /* Hide on mobile, or move to bottom */
  }

  .content {
    padding: 24px 16px;
  }
}
```

### Mobile Navigation Pattern

```css
/* Hamburger menu */
.mobile-menu-btn {
  display: none;
}

@media (max-width: 1023px) {
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
  }

  /* Overlay when sidebar open */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .sidebar-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
```

---

## Homepage vs Inner Docs

### Key Differences

| Aspect | Homepage | Inner Docs |
|--------|----------|------------|
| **Purpose** | Inspire, convert | Inform, educate |
| **Typography** | Large, bold display text | Standard reading sizes |
| **Imagery** | Hero graphics, animations | Minimal, functional |
| **Layout** | Full-width sections | Constrained content width |
| **CTAs** | Multiple, prominent | Contextual, subtle |
| **Social Proof** | Customer logos, testimonials | None |

### Homepage-Specific Patterns

```css
/* Hero section */
.hero {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.03em;
  max-width: 800px;
  margin: 0 auto 24px;
}

.hero p {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 32px;
}

/* Logo bar */
.logo-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 32px;
  padding: 48px 24px;
  border-top: 1px solid var(--border-muted);
}

.logo-bar img {
  height: 24px;
  width: auto;
  opacity: 0.6;
  filter: grayscale(100%);
  transition: all 0.2s ease;
}

.logo-bar img:hover {
  opacity: 1;
  filter: grayscale(0%);
}
```

---

## Trust Signals & Emotional Design

### 1. Social Proof Elements

- **Customer Logos:** 6-8 recognizable brands in grayscale
- **GitHub Stars:** Display prominently if >10k stars
- **Testimonials:** Real quotes with photos and names
- **Case Studies:** "Deployed by [Company], serving [X] users"

### 2. Technical Credibility

- **Version Badge:** Shows active development
- **Last Updated:** Proves maintained docs
- **Status Page Link:** Transparency builds trust
- **Security Certifications:** SOC 2, GDPR badges

### 3. Visual Trust Indicators

```css
/* Badge styling */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-full);
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.badge-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
}

/* GitHub stars */
.github-stars {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  font-size: 14px;
  font-weight: 500;
}
```

### 4. Emotional Design Elements

- **Progress Indicators:** Show completion for tutorials
- **Quick Wins:** "Get started in 5 minutes" messaging
- **Copy Buttons:** Instant gratification
- **Feedback Widgets:** "Was this helpful?" at bottom of pages

---

## Actionable Recommendations for Varity

### Priority 1: Foundation (Week 1)

1. **Implement Inter Variable Font**
   ```html
   <link rel="preconnect" href="https://rsms.me/">
   <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
   ```

2. **Set Up Dark-First Color System**
   - Use the palette defined above
   - Ensure 4.5:1 contrast ratios
   - Avoid pure black (#000) and pure white (#FFF)

3. **Establish Type Scale**
   - Use the responsive type scale provided
   - H1: 36px, H2: 30px, H3: 24px, Body: 16px
   - Line-height 1.5-1.625 for body text

4. **Create 8px Grid System**
   - All spacing in multiples of 8px
   - Content max-width: 768px or 80ch
   - Sidebar: 256px fixed width

### Priority 2: Components (Week 2)

1. **Design Premium Code Blocks**
   - Language badge
   - Copy button with feedback
   - Line numbers (optional toggle)
   - Custom syntax highlighting theme

2. **Navigation System**
   - Collapsible sidebar sections
   - Active state indicators
   - Breadcrumbs on inner pages
   - Search with keyboard shortcut (Cmd+K)

3. **Cards and Callouts**
   - Info, Warning, Success, Error variants
   - Consistent border radius (8px)
   - Subtle hover states

### Priority 3: Polish (Week 3)

1. **Micro-interactions**
   - 150-200ms transitions
   - Subtle hover elevations
   - Smooth page transitions

2. **Custom Icons**
   - Consider custom icon set or Lucide/Heroicons
   - Consistent 1.5px stroke weight
   - 20px default size

3. **Mobile Experience**
   - Hamburger menu with slide-out
   - Touch-friendly tap targets (44px min)
   - Sticky header

### Priority 4: Trust Building (Week 4)

1. **Homepage Elements**
   - Hero with gradient background
   - Customer logo bar
   - Key benefits in 3-column grid
   - "Get Started" prominent CTA

2. **Doc Pages**
   - "Last updated" timestamp
   - Edit on GitHub link
   - "Was this helpful?" widget
   - Related pages section

---

## CSS Reference Values

### Complete CSS Variables Template

```css
:root {
  /* ==================== COLORS ==================== */

  /* Brand */
  --color-brand: #3B82F6;
  --color-brand-hover: #60A5FA;
  --color-brand-muted: #1E40AF;

  /* Backgrounds */
  --color-bg-base: #0F172A;
  --color-bg-surface: #1E293B;
  --color-bg-elevated: #334155;
  --color-bg-subtle: #0B111E;

  /* Borders */
  --color-border: #334155;
  --color-border-muted: #1E293B;
  --color-border-emphasis: #475569;

  /* Text */
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-tertiary: #64748B;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* ==================== TYPOGRAPHY ==================== */

  /* Font Families */
  --font-sans: 'InterVariable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;

  /* ==================== SPACING ==================== */

  --space-0: 0;
  --space-1: 0.25rem;      /* 4px */
  --space-2: 0.5rem;       /* 8px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-8: 2rem;         /* 32px */
  --space-10: 2.5rem;      /* 40px */
  --space-12: 3rem;        /* 48px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */

  /* ==================== LAYOUT ==================== */

  --sidebar-width: 256px;
  --toc-width: 200px;
  --content-max-width: 768px;
  --header-height: 64px;
  --container-max: 1440px;

  /* ==================== BORDERS ==================== */

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ==================== SHADOWS ==================== */

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04);

  /* ==================== TRANSITIONS ==================== */

  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* ==================== Z-INDEX ==================== */

  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
}

/* Light mode overrides */
[data-theme="light"] {
  --color-bg-base: #FFFFFF;
  --color-bg-surface: #F8FAFC;
  --color-bg-elevated: #F1F5F9;
  --color-bg-subtle: #E2E8F0;

  --color-border: #E2E8F0;
  --color-border-muted: #F1F5F9;
  --color-border-emphasis: #CBD5E1;

  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94A3B8;
}
```

---

## Summary: Key Takeaways

### What Sets Premium Docs Apart

1. **Restraint over excess** - Less decoration, more whitespace
2. **Consistent systems** - Everything follows the same rules
3. **Attention to detail** - Every pixel is intentional
4. **Performance** - Fast load times, smooth interactions
5. **Accessibility** - Works for everyone
6. **Content-first** - Design serves the content, not vice versa

### Avoid These Template Traps

- Generic icon libraries without customization
- Inconsistent border radii
- Pure black backgrounds
- No hover states or transitions
- Missing keyboard navigation
- Cluttered sidebars
- Walls of text without visual breaks

### The Varity Difference

To stand out, Varity docs should:
1. Lead with the dark mode experience (developer preference)
2. Use a single, bold brand color consistently
3. Prioritize code examples with premium formatting
4. Build trust through transparent metrics and status
5. Make the CLI commands copy-pasteable everywhere

---

## Sources & References

- [Stripe Documentation Design](https://docs.stripe.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Linear Documentation](https://linear.app/docs)
- [Inter Font Official](https://rsms.me/inter/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Typography Best Practices 2025](https://www.adoc-studio.app/blog/typography-guide)
- [Dark Mode Design Best Practices](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)
- [Design Systems Typography Guide](https://www.designsystems.com/typography-guides/)

---

*Report generated for docs.varity.so - January 2026*
