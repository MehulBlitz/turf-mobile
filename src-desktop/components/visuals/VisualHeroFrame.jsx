import VisualBackground from './VisualBackground';
import { cn } from '../../lib/utils';

const grainSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch"/></filter><rect width="220" height="220" filter="url(#g)" opacity="0.2"/></svg>');
const grainTexture = `url("data:image/svg+xml,${grainSvg}")`;

/**
 * Renders a framed hero section with an animated visual background, translucent borders/backdrop blur, a subtle grain overlay, and centered content.
 *
 * The frame's outer rounding and inner clipping radius are configurable; `innerRadius` is clamped to a minimum of 16 pixels. The animated background is rendered behind the frame and the grain overlay is non-interactive and aria-hidden.
 *
 * @param {Object} props - Component props.
 * @param {import('react').ReactNode} props.children - Content rendered inside the inner frame.
 * @param {string} [props.className] - Additional class names applied to the root section.
 * @param {number} [props.density=12] - Density parameter passed to the visual background.
 * @param {number} [props.speed=0.55] - Speed parameter passed to the visual background.
 * @param {number} [props.amplitude=14] - Amplitude parameter passed to the visual background.
 * @param {number} [props.outerRadius=34] - Outer border radius in pixels for the frame.
 * @param {number} [props.padding=12] - Padding in pixels between outer frame and inner clipping region.
 * @returns {import('react').ReactElement} A JSX element containing the composed hero frame with animated background and grain overlay.
 */
export default function VisualHeroFrame({
  children,
  className,
  density = 12,
  speed = 0.55,
  amplitude = 14,
  outerRadius = 34,
  padding = 12,
}) {
  const innerRadius = Math.max(16, outerRadius - padding);

  return (
    <section className={cn('relative', className)}>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius: `${outerRadius + 10}px` }}
      >
        <VisualBackground density={density} speed={speed} amplitude={amplitude} className="opacity-95" />
      </div>

      <div
        className="relative border border-white/75 bg-white/56 shadow-[0_26px_52px_-36px_rgba(15,23,42,0.62)] backdrop-blur-md"
        style={{ borderRadius: `${outerRadius}px`, padding: `${padding}px` }}
      >
        <div
          className="relative overflow-hidden border border-white/80 bg-white/80"
          style={{ borderRadius: `${innerRadius}px` }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
            style={{ backgroundImage: grainTexture, backgroundSize: '180px 180px' }}
          />
          <div className="relative z-[1]">{children}</div>
        </div>
      </div>
    </section>
  );
}
