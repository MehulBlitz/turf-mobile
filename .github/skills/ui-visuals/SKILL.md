---
name: ui-visuals
description: Use when building premium React visuals with Background Studio waves/rings, Shape Magic containers, and Texture Lab grain/noise overlays.
---

# React Bits Visual Engineering Skill

You are an expert in implementing advanced visual effects using React, Tailwind CSS, and Framer Motion, specifically focusing on the three pillars of the React Bits toolset. Use this skill whenever a user requests "visual flair," "landing page backgrounds," or "custom shapes."

## Fast Path Recipes
Use these defaults when the user asks for polished hero visuals quickly:
- **Hero Waves (Background Studio):** soft moving wave field behind content with low amplitude and medium speed.
- **Shape Card (Shape Magic):** inner-rounded content shell where `innerRadius = outerRadius - padding`.
- **Grain Layer (Texture Lab):** subtle pseudo-element noise overlay with low opacity for depth.

```jsx
// Fast path scaffold: waves + shape container + grain overlay
const HeroVisualShell = ({ children }) => {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem]">
      <VisualBackground density={12} speed={0.8} amplitude={0.35} />
      <div className="relative z-10 rounded-[1.6rem] bg-white/75 backdrop-blur-md p-8">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] texture-grain" />
    </section>
  );
};
```

## 1. Background Studio Integration
When the user asks for animated backgrounds, implement components based on the Background Studio patterns:
- **Threads/Waves:** Use Canvas-based or SVG-based line animations with `amplitude`, `speed`, and `color` props.
- **Magic Rings:** Implement concentric SVG circles with CSS blur/bloom and rotation offsets.
- **Shape Grids:** Create interactive CSS grids where individual cells respond to hover using `framer-motion`.

**Example Pattern:**
```jsx
// Logic for a "Background Studio" style component
const VisualBackground = ({ density = 10, speed = 1 }) => {
  // Use requestAnimationFrame for high-performance canvas backgrounds
  // or Framer Motion for SVG-based element backgrounds
};
```

## 2. Shape Magic Implementation
When creating layouts, use the "Shape Magic" logic for inner-rounded corners and complex SVG masks:
- **Inner Rounding:** Calculate nested border-radii where `innerRadius = outerRadius - padding`.
- **Custom SVG Shapes:** Generate SVG paths for non-standard UI containers (e.g., hexagons, organic blobs).
- **Masking:** Use `mask-image` or `clip-path` to apply these shapes to UI sections.

## 3. Texture Lab Effects
Apply granular visual noise and dithering to the frontend using these CSS/SVG filter techniques:
- **Noise Overlay:** Use a small base64 noise texture or an SVG `feTurbulence` filter.
- **Dithering/Halftone:** Apply SVG filters with `feColorMatrix` and `feComponentTransfer` for a retro/stylized look.
- **Glassmorphism:** Combine `backdrop-filter: blur()` with a subtle noise texture from the "Texture Lab" patterns.

## Implementation Workflow
1. **Identify the Visual Goal:** Does the user need a background (Background Studio), a container (Shape Magic), or a surface effect (Texture Lab)?
2. **Generate Code:** Provide the full React component code, ensuring it is modular and uses props for all customization (colors, intensity, speed).
3. **Frontend Integration:** Wrap the main content in the generated visual components, ensuring proper `z-index` and `absolute` positioning for backgrounds.
4. **Polish Pass:** Tighten spacing rhythm, hover/press transitions, and reduced-motion fallback.

## Technical Implementation Notes
- For Background Studio implementations, prefer Canvas or WebGL wrappers for performance and support prop-driven color arrays (RGB) with optional interaction toggles.
- For Shape Magic patterns, prioritize SVG exports or `clip-path` definitions that dynamically resize while preserving inner-rounding aesthetics.
- For Texture Lab patterns, use CSS pseudo-elements (`::after`) to layer grain/noise over surfaces without reducing text readability.
