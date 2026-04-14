import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const noiseSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" stitchTiles="stitch"/></filter><rect width="180" height="180" filter="url(#n)" opacity="0.22"/></svg>');
const noiseTexture = `url("data:image/svg+xml,${noiseSvg}")`;

/**
 * Render an animated empty-state card for dashboards with optional call-to-action.
 *
 * The card includes a decorative blurred glow and noise texture, an icon, title,
 * message, and an optional action button that is rendered only when both
 * `actionLabel` and `onAction` are provided.
 *
 * @param {Object} props
 * @param {import('react').ComponentType<{size?: number}>} [props.icon=Sparkles] - Icon component displayed in the card.
 * @param {string} [props.title='Nothing here yet'] - Heading text shown prominently.
 * @param {string} [props.message='Try changing filters or adding new data.'] - Supporting message text.
 * @param {import('react').ReactNode} [props.actionLabel] - Label or content for the action button.
 * @param {() => void} [props.onAction] - Click handler for the action button.
 * @param {string} [props.className] - Additional CSS class names applied to the root element.
 * @param {boolean} [props.compact=false] - When true, uses reduced padding for a denser layout.
 * @returns {import('react').JSX.Element} The rendered empty-state card element.
 */
export default function DashboardEmptyState({
  icon: Icon = Sparkles,
  title = 'Nothing here yet',
  message = 'Try changing filters or adding new data.',
  actionLabel,
  onAction,
  className,
  compact = false,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/86 text-center shadow-[0_26px_48px_-36px_rgba(15,23,42,0.55)]',
        compact ? 'p-6' : 'p-8',
        className
      )}
    >
      <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{ backgroundImage: noiseTexture, backgroundSize: '180px 180px' }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">{message}</p>
        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            {actionLabel}
            <ArrowRight size={14} />
          </button>
        ) : null}
      </div>
    </motion.section>
  );
}
