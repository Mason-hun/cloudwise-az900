---
name: Cloud Learning Workspace
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-xxl: 3rem
---

## Brand & Style

The design system embodies a calm, authoritative, and encouraging learning environment tailored for technical certification preparation. It serves candidates navigating complex architectural principles, compliance standards, and cloud economics by turning dense reference material into structured, stress-free micro-learning modules.

The aesthetic philosophy fuses **Modern Corporate Clarity** with **Refined Educational Minimalism**:
- **Tone & Demeanor**: Measured, clear, motivating, and institutional without feeling bureaucratic or sterile.
- **Cognitive Hygiene**: Generous negative space, minimal decorative noise, and strictly purposeful visual accents prioritize extended reading endurance and deep focus.
- **Trust Architecture**: Subtle structural borders, precise typographic scale, and dedicated unofficial-companion indicators establish transparent academic credibility.

## Colors

The palette balances technical precision with warm digital comfort. Blue acts as an orienting, confidence-building anchor, supported by deep structural neutrals and unambiguous functional tones.

### Palette Roles
- **Primary (`#0284C7`)**: Azure blue deployed for active states, key milestones, primary interactive targets, and progress rings.
- **Secondary (`#0F172A`)**: Deep navy slate used for high-contrast headlines, grounding structural frames, and primary text hierarchies.
- **Tertiary / Success (`#10B981`)**: Soft emerald reserved strictly for validation, mastery states, correct quiz selections, and domain completion.
- **Warning / Review (`#F59E0B` / `#F43F5E`)**: Calibrated amber for review queues and flagged questions; soft coral for incorrect answers and domain gap alerts.
- **Canvas & Surface System**:
  - `surface-canvas`: `#F8FAFC` (soft off-white to eliminate glare across long study periods)
  - `surface-card`: `#FFFFFF` (pure white for elevated cognitive blocks)
  - `surface-subtle`: `#F1F5F9` (neutral containment for code blocks and inactive controls)
  - `surface-tint`: `#E0F2FE` (muted sky tint for selection fills, tips, and active navigational items)
- **Border & Rule**: `#E2E8F0` for foundational low-contrast card outlines and separators.

## Typography

The typographic hierarchy pairs the open geometry of **Plus Jakarta Sans** with the systematic legibility of **Inter**.

- **Display & Headlines (`Plus Jakarta Sans`)**: Delivers an approachable, modern academic feel. Generous counterforms and tight proportional tracking keep long module titles compact yet friendly.
- **Body & Functional Text (`Inter`)**: Neutral, neutral-grotesque text system designed for extended reading in study guides, practice question explanations, and technical specification definitions.
- **Monospace Environments**: Standard technical excerpts and CLI examples fall back to a monospaced font at `13px` with a strict `1.5` line-height ratio, set against `#F1F5F9`.

## Layout & Spacing

The workspace implements a structured, desktop-first responsive layout centered on a **12-column fluid grid** bounded by a `1280px` maximum viewport container.

### Breakpoints & Geometry
- **Desktop (1024px+)**: 12 columns, 24px gutters, 32px canvas margins. Side navigation remains persistent at 260px; primary workspace occupies remaining columns.
- **Tablet (768px - 1023px)**: 8 columns, 20px gutters, 24px canvas margins. Study sidebars collapse to slide-over drawers.
- **Mobile (< 768px)**: 4 columns, 16px gutters, 16px canvas margins. Full-width modular stacking for questions, flashcards, and control actions.

### Spacing Philosophy
Rhythm follows a disciplined 4px/8px modular base. Dense information displays (e.g., exam domain breakdowns) leverage `space-xs` and `space-sm` for inline grouping, while practice question blocks and explanatory text maintain `space-lg` and `space-xl` breathing room to reduce decision fatigue during tests.

## Elevation & Depth

Visual hierarchy uses crisp boundary lines and subtle, tinted ambient occlusion. Heavy, dark drop shadows and opaque glossy blurs are omitted to preserve reading clarity.

### Depth Tiers
- **Flat (Level 0)**: Canvas baseline (`#F8FAFC`). Flat utility surfaces, readouts, and question passage panels.
- **Outlined Surface (Level 1)**: Base study cards, flashcards, and navigation rails. Defined by a `1px` border of `#E2E8F0` and an ambient tint shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04)`.
- **Raised Focus (Level 2)**: Active quiz question selection cards, hovered lesson items, and dropdown overlays. `1px` border of `#CBD5E1` with `0 4px 12px -1px rgba(2, 132, 199, 0.08)`.
- **Floating Overlays (Level 3)**: Exam submission modals, diagnostic dialogs, and timed break reminders. `0 12px 24px -4px rgba(15, 23, 42, 0.08)`.

## Shapes

The interface adopts a balanced `roundedness: 2` scale (0.5rem / 8px baseline) to balance software precision with approachable learning tools.

- **Micro Components (8px / `0.5rem`)**: Buttons, text input controls, checkbox boxes, and inline status badges.
- **Cards & Containers (12px - 16px / `0.75rem - 1rem`)**: Exam question containers, diagnostic charts, flashcard viewports, and modal bodies.
- **Pill Elements (`9999px`)**: Reserved strictly for certification compliance tags, domain module chips, and active progress status pills.

## Components

### Buttons
- **Primary**: Solid `#0284C7` background, white text, 8px radius, medium weight. Subtle active scale feedback without dimensional shadows.
- **Secondary**: Pure white fill with `1px` border in `#E2E8F0`, slate `#0F172A` text. Hover transitions to `#F8FAFC` border-color `#CBD5E1`.
- **Ghost/Tertiary**: No border, slate `#64748B` text, background tint `#E0F2FE` on hover.

### Badges & Status Chips
- **Compliance Badge ("Unofficial Study Companion")**: Neutral slate pill outline with `#F1F5F9` background, `#475569` text, and a distinct subtle lock/book icon.
- **Domain Chips**: 24px height, uppercase `label-sm`, subtle color coding: Azure `#E0F2FE` (Cloud Concepts), Emerald `#DCFCE7` (Architecture), Amber `#FEF3C7` (Security & Governance).

### Question & Exam Cards
- Standard state: `#FFFFFF` fill, `1px` solid `#E2E8F0` border, 12px radius, 24px internal padding.
- Interactive Option Choice:
  - Default: Border `#E2E8F0`, background `#FFFFFF`.
  - Selected: Border `1.5px` `#0284C7`, background `#F0F9FF`.
  - Correct Feedback: Border `1.5px` `#10B981`, background `#ECFDF5`.
  - Incorrect Feedback: Border `1.5px` `#F43F5E`, background `#FFF1F2`.

### Inputs & Selection Controls
- **Form Inputs**: 40px height, 8px radius, `#FFFFFF` surface, `1px` `#E2E8F0` border. Active focus triggers a 2px `#0284C7` ring with zero vertical offset.
- **Checkboxes & Radios**: 18px dimensions with 4px inner curve. Selected checkbox fills with `#0284C7` and white check icon; radios display an internal dot.

### Progress & Diagnostic Trackers
- Linear bars use a 6px height with 9999px pill curves. Unfilled track is `#F1F5F9`; filled track transitions smoothly using `#0284C7` for general progress and `#10B981` once the readiness threshold (e.g., 85%) is attained.