# Portfolio Redesign Plan

## Overview
Complete aesthetic overhaul from cyberpunk/neon to a modern, refined design with smooth 2D/3D animations. Preserve all existing content (games, tools, pages) but completely rework the UI, theme system, and animation layer.

## Tech Stack Additions
- **Framer Motion** — Declarative 2D animations, page transitions, scroll-reveals, micro-interactions
- **Enhanced Three.js** — More planets, particle trails, scroll-driven 3D effects, mouse parallax
- **@react-three/drei** (already installed) — Text3D, Float, ScrollControls, etc.

---

## PHASE 1 — Install Dependencies & Foundational Setup

### 1.1 Install Libraries
```bash
npm install framer-motion
```
- Framer Motion for all 2D animations
- GSAP optional (only if needed for timeline-based complex animations)

### 1.2 Create Animation Hooks
- `src/hooks/use-scroll-reveal.ts` — Reusable intersection observer with Framer Motion variants
- `src/hooks/use-mouse-parallax.ts` — Mouse-follow transform for 3D elements

### 1.3 Create Utility Components
- `src/components/ui/motion-wrapper.tsx` — Reusable `motion.div` with scroll reveal presets
- `src/components/ui/section-header.tsx` — Animated section headers with consistent style

---

## PHASE 2 — Theme System Overhaul

### 2.1 New Color Palette
- **Dark mode base**: `#0a0a1a` (deep space slate) with subtle purple/blue undertones
- **Light mode base**: `#f7f8fa` (warm off-white) with cool gray accents
- **Primary**: Green → Shift to emerald/teal (`#10b981` / `#059669`)
- **Secondary**: Cyan → Shift to blue-indigo (`#6366f1` / `#818cf8`)
- **Tertiary**: Purple → Shift to warm amber/rose for contrast (`#f59e0b` / `#f97316`)
- **Neutrals**: Refined slate scale with proper contrast ratios

### 2.2 CSS Custom Properties
- Redefine all `--color-*` variables in `globals.css`
- Update `[data-theme='light']` overrides
- Add new properties: `--glow-*`, `--shadow-*`, `--radius-*`

### 2.3 Theme Provider Enhancements
- Add system preference detection (prefers-color-scheme)
- Add transition animation on theme toggle
- Persist to localStorage (already done)

---

## PHASE 3 — Global CSS & Tailwind Config Overhaul

### 3.1 Redesign globals.css
- Remove or tone down overly aggressive cyberpunk effects (scanlines, heavy glitch)
- Keep but refine: glassmorphism, gradient borders, glow effects
- Add smoother, more refined utility classes
- New: `.magnetic-hover`, `.smooth-shadow`, `.gradient-text`, `.frosted-glass`

### 3.2 Tailwind Config Updates
- Update animation keyframes: Add new ones, refine existing
  - New: `spin-reverse`, `ping-soft`, `pulse-soft`
- Update font families: Poppins for headings, Inter or Manrope for body
- Add new spacing/radius values for consistency

### 3.3 Scrollbar Refinements
- Match new color palette
- Thinner, more subtle

---

## PHASE 4 — 3D Planetary Section Enhancement

### 4.1 Current: OrbitalVisualization (5 planets)
### 4.2 Enhancements:
- **Add more planets**: Uranus, Neptune (total 7 planets)
- **Planet textures**: Use procedural textures instead of solid colors
- **Ring particles**: Add particle systems around Saturn's rings
- **Star field background**: Add distant stars via point cloud
- **Planet trails**: Add orbital trail lines behind each planet
- **Mouse interaction**: Camera follows mouse slightly, planets pulse on hover
- **Responsive**: Better mobile fallback (show simplified version or message)
- **Performance**: Use `@react-three/drei` `AdaptiveDpr` and `AdaptiveEvents`

### 4.3 New 3D Components
- `src/components/3d/planet-scene.tsx` — Enhanced scene with all features
- `src/components/3d/star-field.tsx` — Particle star background
- `src/components/3d/planet-trail.tsx` — Orbital trail lines
- `src/components/3d/scene-background.tsx` — Floating 3D geometry (torus, icosahedron) as page backgrounds

---

## PHASE 5 — Layout & Navigation Redesign

### 5.1 Navigation
- **Desktop**: Floating nav bar with stronger glass effect, subtle border, refined dropdowns with smooth animation
- **Mobile**: Bottom-drawer or full-screen overlay with Framer Motion slide
- **Active states**: More subtle indicator (dot instead of full underline)
- **Theme toggle**: Animated icon transition (rotate + scale)

### 5.2 Footer
- Minimal redesign: cleaner layout, subtle gradients, social links with hover effects
- Add subtle 3D floating element in corner

### 5.3 Page Transitions
- Add `AnimatePresence` for route transitions
- Use shared layout with motion

---

## PHASE 6 — Home Page Redesign

### 6.1 Hero Section
- **Background**: 3D star field + floating geometric shapes (via Three.js)
- **Left side**: 
  - Animated greeting text with Framer Motion
  - Name with gradient text effect (not glitch)
  - Typewriter role text (keep but refine)
  - Stats bar with animated counters
  - CTA buttons with magnetic hover effect
- **Right side**: Enhanced OrbitalVisualization (full height, more immersive)
- **Scroll indicator**: Animated chevron with pulse

### 6.2 Achievements Section
- Keep the scoreboard/terminal aesthetic but refine
- Add scroll-triggered number animations
- Better responsive layout

### 6.3 Professional Journey
- Keep timeline layout
- Add smoother expand/collapse with Framer Motion `AnimatePresence`
- Better card design with subtle 3D tilt on hover

### 6.4 Featured Projects
- Keep asymmetric grid
- Add Framer Motion layout animations
- Hover effects: smoother shine, better glow

### 6.5 New: Latest Blog Section
- Show 2-3 latest blog posts with brief excerpt
- Animated cards

### 6.6 CTA Section
- Refined design with gradient background
- Better button animations

---

## PHASE 7 — Games Page Redesign

### 7.1 Games Listing
- Better card design with animated preview/gradient
- Add game difficulty badges with color coding
- Hover effects: 3D tilt, glow, icon animation

### 7.2 Individual Game Pages
- Keep the game logic exactly as-is
- Redesign the wrapper/layout:
  - Better header with back button + game title
  - Stats panel with animated counters
  - Score/best score display
  - Mobile controls styling
- Add subtle particle background
- Add achievement notifications (Framer Motion toast)

---

## PHASE 8 — Tools Page Redesign

### 8.1 Tools Listing
- Keep search + filter + favorites system
- Better card design:
  - Smooth hover elevation
  - Icon background animation
  - Tag styling refinement
- Category filter with animated tabs
- Search with debounced highlight

### 8.2 Individual Tool Pages
- Redesign ToolShell wrapper component
- Better input/output styling
- Copy-to-clipboard with animated feedback
- Consistent dark/light mode

---

## PHASE 9 — Sub-Page Consistency

### 9.1 Pages to Update
- `/about` — Refined hero cards with 3D tilt
- `/skills` — Animated skill bars with Framer Motion, better category cards
- `/projects` — Enhanced project cards, filter by category
- `/blog` — Better article cards, refined subscribe section
- `/resume` — Cleaner layout, download button animation
- `/blog/[slug]` — Better article reading experience
- Error pages (404, error) — Creative design with 3D elements

### 9.2 Consistent Elements
- All pages use same section spacing
- Same header/footer pattern
- Same animation patterns (stagger, scroll-reveal)
- Same card/button styles

---

## PHASE 10 — Polish & Performance

### 10.1 Performance
- Lazy load all Three.js components (already dynamic imports)
- Use `next/dynamic` with ssr:false for heavy components
- Optimize Framer Motion with `layout` animations where possible
- Reduce JavaScript bundle by code-splitting

### 10.2 Accessibility
- Ensure all animations respect `prefers-reduced-motion`
- Maintain keyboard navigation
- Proper ARIA labels on new interactive elements

### 10.3 Testing
- Run `npm run build` to verify no errors
- Run `npm run lint` 
- Run `npm run type-check`
- Run `npm test` (Vitest)
- Test dark/light mode toggle
- Test mobile responsiveness
- Test all games and tools

### 10.4 Final Polish
- Cross-browser testing
- Performance audit
- Animation timing refinements
- Content consistency check

---

## Implementation Order

| Phase | Dependencies | Est. Effort |
|-------|-------------|-------------|
| 1. Install + Foundation | None | Small |
| 2. Theme System | Phase 1 | Medium |
| 3. Global CSS | Phase 2 | Medium |
| 4. 3D Enhancements | Phase 1 | Large |
| 5. Layout & Nav | Phase 2, 3 | Medium |
| 6. Home Page | Phase 2-5 | Large |
| 7. Games | Phase 2, 3 | Medium |
| 8. Tools | Phase 2, 3 | Medium |
| 9. Sub-pages | Phase 2, 3 | Medium |
| 10. Polish | All | Medium |

**Design Principle**: Modern, refined, smooth. Move from "loud cyberpunk" to "sophisticated tech". Keep personality but make it more professional and polished.
