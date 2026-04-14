import React from 'react';
import { motion } from 'motion/react';

/**
 * Renders a card-shaped loading skeleton for a turf item with an image placeholder and text-like bars.
 *
 * @returns {JSX.Element} A styled skeleton card element containing a top rectangular placeholder and multiple horizontal text placeholders using pulse animation.
 */
export function TurfCardSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm animate-pulse">
      <div className="relative h-56 bg-zinc-200"></div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 bg-zinc-200 rounded-lg w-2/3"></div>
          <div className="h-6 bg-zinc-200 rounded-lg w-16"></div>
        </div>
        <div className="h-4 bg-zinc-200 rounded-lg w-1/2"></div>
      </div>
    </div>
  );
}

/**
 * Render a skeleton-style booking card placeholder used during loading.
 *
 * @returns {JSX.Element} A JSX element representing a pulsing booking-card skeleton with an avatar block and text placeholder lines.
 */
export function BookingCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-200 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-zinc-200 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
    </div>
  );
}

/**
 * Renders a vertical stack of three TurfCardSkeleton placeholder cards for loading states.
 *
 * @returns {JSX.Element} A container element with three stacked TurfCardSkeleton components.
 */
export function TurfListSkeleton() {
  return (
    <div className="space-y-5">
      {[...Array(3)].map((_, i) => (
        <TurfCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Render a two-column grid of four statistic loading skeleton cards.
 *
 * Each card is a placeholder tile representing a statistic (icon block and two text bars)
 * and is intended for use while data is loading.
 *
 * @returns {JSX.Element} A container element with four skeleton statistic cards arranged in two columns.
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-200 mb-3"></div>
          <div className="h-3 bg-zinc-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-zinc-200 rounded w-2/3"></div>
        </motion.div>
      ))}
    </div>
  );
}
