---
version: alpha
name: ACGME Fellowship Tracker
description: Premium healthcare dashboard for ACGME anesthesiology fellowship requirements tracking. Material Design 3 foundations elevated with SaaS-grade polish, smooth animations, and professional data visualization.
colors:
  primary: "#37474F"
  primary-dark: "#263238"
  surface: "#FFFFFF"
  background: "#F0F2F5"
  border: "#E6E0E9"
  text-primary: "#1C1B1F"
  text-secondary: "#79747E"
  text-muted: "#9E9E9E"
  green: "#2E7D52"
  green-bg: "#E6F4EA"
  green-text: "#1E6E42"
  red: "#B3261E"
  red-bg: "#FFEDEA"
  red-text: "#B3261E"
typography:
  h1:
    fontFamily: Google Sans, Segoe UI, sans-serif
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Google Sans, Segoe UI, sans-serif
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: Google Sans, Segoe UI, sans-serif
    fontSize: 0.95rem
    fontWeight: 700
  body:
    fontFamily: Google Sans Text, Segoe UI, sans-serif
    fontSize: 0.88rem
    fontWeight: 400
    lineHeight: 1.5
  label-upper:
    fontFamily: Google Sans Text, Segoe UI, sans-serif
    fontSize: 0.68rem
    fontWeight: 700
    letterSpacing: 0.1em
    textTransform: uppercase
  mono:
    fontFamily: Roboto Mono, monospace
    fontSize: 0.78rem
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  metric-card:
    backgroundColor: "{colors.surface}"
    border: 1px solid "{colors.border}"
    borderRadius: "{rounded.lg}"
    padding: 24px 32px
    shadow: "0 4px 12px rgba(55,71,79,0.08), 0 1px 3px rgba(0,0,0,0.06)"
    transition: box-shadow 250ms, transform 250ms
    hoverShadow: "0 8px 24px rgba(55,71,79,0.12), 0 2px 6px rgba(0,0,0,0.06)"
    hoverTransform: translateY(-2px)
  category-card:
    backgroundColor: "{colors.surface}"
    border: 1px solid "{colors.border}"
    borderRadius: "{rounded.lg}"
    padding: 24px
    textAlign: center
    shadow: "0 1px 2px rgba(0,0,0,0.04)"
    transition: box-shadow 250ms, transform 250ms
    hoverShadow: "0 8px 24px rgba(55,71,79,0.12), 0 2px 6px rgba(0,0,0,0.06)"
    hoverTransform: translateY(-4px)
  progress-ring:
    size: 80px
    strokeWidth: 8
    linecap: round
    fill: none
    bgStroke: "{colors.border}"
    greenStroke: "{colors.green}"
    redStroke: "{colors.red}"
  status-chip:
    padding: 4px 12px
    borderRadius: "{rounded.sm}"
    fontFamily: Google Sans Text, sans-serif
    fontSize: 0.78rem
    fontWeight: 600
  status-chip-green:
    backgroundColor: "{colors.green-bg}"
    textColor: "{colors.green-text}"
    border: 1px solid #A8D5B5
  status-chip-red:
    backgroundColor: "{colors.red-bg}"
    textColor: "{colors.red-text}"
    border: 1px solid #F2B8B5
  table-header:
    backgroundColor: "{colors.primary}"
    color: white
    fontFamily: Google Sans, sans-serif
    fontSize: 0.82rem
    fontWeight: 700
    letterSpacing: 0.05em
    textTransform: uppercase
    padding: 12px 20px
  sidebar:
    width: 280px
    backgroundColor: "{colors.primary}"
    position: fixed
    top: 0
    left: 0
    height: 100vh
    boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
  sidebar-brand:
    padding: 24px
    borderBottom: 1px solid rgba(255,255,255,0.1)
  fellow-hero:
    background: "linear-gradient(135deg, {colors.primary} 0%, {colors.primary-dark} 100%)"
    borderRadius: "{rounded.xl}"
    padding: 32px 48px
    color: white
    display: flex
    alignItems: center
    gap: 24px
    boxShadow: "0 16px 48px rgba(55,71,79,0.16), 0 4px 12px rgba(0,0,0,0.08)"
---

# ACGME Fellowship Tracker

A premium web application for tracking ACGME anesthesiology fellowship requirements across a PGY-5 cohort. Built with Bun + Hono backend and React + Vite frontend — demonstrating that a purpose-built web app can vastly outperform general-purpose tools like Streamlit.

## Design Philosophy

The design draws from Material Design 3 foundations but elevates them with SaaS-grade polish: purposeful animations that communicate state, generous whitespace, rich data visualization (SVG progress rings vs. simple bars), and premium micro-interactions that make data feel alive rather than static.

The Streamlit prototype was functional but flat. This React implementation brings:
- Animated SVG progress rings with smooth stroke animations
- Staggered card entrance animations
- Accordion expand/collapse for category drill-down
- Hover lift effects on all cards
- Pulse animation on critical metrics
- Loading skeletons instead of spinners
- Full-page routing with smooth transitions

## Colors

- **Charcoal (#37474F):** Primary brand color — sidebar, headings, key UI elements. Deep and professional without being cold.
- **Green (#2E7D52):** Success / 100% completion. Used for all "met" states, On Track indicators, and full rings.
- **Red (#B3261E):** Attention required / incomplete. Used for gaps, Not Meeting status, and partial rings.
- **Surface (#FFFFFF):** Card backgrounds — clean white against a light gray page background.
- **Background (#F0F2F5):** Page background — subtle cool gray that makes white cards pop.
- **Border (#E6E0E9):** Subtle dividers between cards and table elements.

### Status Color Rule
Binary only: **100% = green**, anything less = red. No amber/yellow. This makes scanning the dashboard instant and unambiguous.

## Typography

- **Google Sans** (display): Headings, metric values, hero text, button labels, nav items
- **Google Sans Text** (body): Table text, descriptions, labels
- **Roboto Mono**: Numeric data (actual values, thresholds, percentages, gap counts) — gives data a structured, clinical feel

All loaded from Google Fonts CDN. Font loaded in `<head>` before body paint to avoid FOIT.

## Layout

- Fixed 280px dark charcoal sidebar — always visible, provides cohort-level context at a glance
- Fluid main content area with max-width constraint and generous padding (48px sides)
- 4-column metric card grid on overview
- 5-column category ring grid
- Responsive breakpoint at 1200px (2-column metric grid) and 900px (3→2 column category grid)

## Components

### Metric Cards
Large numeric values with uppercase label above. Staggered fade+slide-up animation on load. Subtle shadow, hover lift effect.

### Progress Rings (Category Cards)
SVG-based circular progress indicators with animated stroke-dashoffset on mount. Thick 8px stroke with rounded linecap. Ring color = green (100%) or red (<100%). Percentage centered in ring.

### Status Chips
Compact pill badges for fellow status in tables and hero cards. Green/red background tint with matching text and 1px border.

### Category Accordion (Fellow Detail)
Click-to-expand category sections. Smooth height animation. Header shows category name, color dot (green=all met, red=has gaps), and "N/N met" count. Expanded body shows per-requirement table with actual, required, progress bar, and status pill.

### Sidebar Fellow List
Sorted alphabetically by last name. Each item shows: initials avatar (white circle in primary, filled white when active), name, 🔴/🟢 status emoji. Selected state: white left border + lighter background.

### Loading Skeleton
Shimmer animation replacing spinners — communicates loading without jarring transitions.

## Animation System

All animations use CSS transitions with cubic-bezier easing for natural feel:
- `150ms cubic-bezier(0.4, 0, 0.2, 1)` — micro (hover, press)
- `250ms cubic-bezier(0.4, 0, 0.2, 1)` — base (card hover, accordion toggle)
- `400ms cubic-bezier(0.4, 0, 0.2, 1)` — page elements
- `500ms cubic-bezier(0.34, 1.56, 0.64, 1)` — spring (metric card entrance)

Staggered entrance: metric cards 0/80/160/240ms, category cards 100/180/260/340/420ms.

## Technical Architecture

- **Backend:** Bun + Hono, TypeScript, port 3001, CORS enabled for Vite dev server
- **Frontend:** Vite + React 18 + TypeScript, React Router v6, port 5173
- **Data:** All CSV files read server-side, UTF-16 LE encoded TSV format
- **API Design:**
  - `GET /api/master` → full fellow list with gaps_count and status
  - `GET /api/summary` → category aggregation (pct, met/total)
  - `GET /api/fellow/:name` → individual fellow evaluation with per-requirement results

## Why This Beats Streamlit

Streamlit renders Python data as generic web components with forced styling overrides. This implementation:
1. Has full control over every pixel — no CSS fights
2. Animations are first-class — built into the component model
3. Routing enables proper page state management
4. SVG visualizations are precise and animatable
5. Bundle splitting and Vite HMR mean far better dev experience
6. TypeScript catches data shape mismatches at compile time
7. The sidebar is truly persistent, not an awkward sidebar reimplementation
