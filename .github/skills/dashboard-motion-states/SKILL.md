---
name: dashboard-motion-states
description: Use when implementing dashboard chart motion, loading transitions, and premium empty states in React with Tailwind and Framer Motion.
---

# Dashboard Motion and Empty State Skill

You are an expert in building dashboard interfaces that feel alive but remain readable and performant. Apply this skill when users request chart animation polish, delightful loading/empty states, or premium admin/product analytics UI behavior.

## Use This Skill When
- The user asks for "dashboard polish," "animated charts," "micro-interactions," or "better empty states."
- A chart-heavy screen feels static or visually flat.
- A feature has no-data states and needs clear, branded placeholders.

## 1. Chart Motion Principles
- Prefer subtle motion that supports comprehension: reveal from baseline, stagger series, and smooth tooltip transitions.
- Keep motion durations in the `160ms-500ms` range and avoid excessive easing complexity.
- Respect reduced motion with `prefers-reduced-motion` fallbacks.

**Recommended Patterns**
- **Entry reveal:** animate chart container opacity + translateY (small offset).
- **Series stagger:** delay each line/bar series by `40-80ms`.
- **Data update transition:** interpolate values instead of hard swaps.
- **Hover focus:** raise hovered datapoint contrast while dimming non-focused series.

## 2. Premium Empty States
- Include three layers: **meaning**, **action**, **tone**.
- Meaning: a clear no-data message tied to current filters/date range.
- Action: one primary CTA (e.g., "Create report", "Expand date range").
- Tone: lightweight visual motif (icon, subtle illustration, or gradient blob) that matches product branding.

**Empty State Checklist**
1. Explain why data is missing.
2. Offer next step in one click.
3. Keep visual hierarchy simple and centered.
4. Ensure empty state adapts for mobile and desktop.

## 3. Loading and Skeleton Rhythm
- Use skeleton placeholders matching final layout geometry.
- Animate with gentle shimmer or opacity pulse; avoid heavy looping effects.
- Transition from skeleton to content with crossfade to reduce visual jump.

## 4. Implementation Workflow
1. Identify context: chart motion, loading state, or empty state.
2. Build reusable primitives:
   - `MotionCard`
   - `ChartReveal`
   - `DashboardEmptyState`
3. Add prop-driven controls for speed, delay, intensity, and variant.
4. Integrate reduced-motion behavior.
5. Validate with keyboard focus and responsive breakpoints.

## Example Pattern
```jsx
import { motion } from 'framer-motion';

export function DashboardEmptyState({
  title = 'No data for this range',
  message = 'Try a wider date range or add a new source.',
  ctaLabel = 'Adjust Filters',
  onCta,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 text-center"
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_55%)]" />
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>
        <button onClick={onCta} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">
          {ctaLabel}
        </button>
      </div>
    </motion.section>
  );
}
```

## Output Requirements
- Provide complete component code with imports.
- Include Tailwind classes and animation settings.
- Call out where to place components in existing dashboard pages.
- Include one reduced-motion fallback snippet.
