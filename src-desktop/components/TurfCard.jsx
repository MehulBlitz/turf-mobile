import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

/**
 * Renders a clickable turf card showing an image, rating badge, type label, name, and hourly price.
 *
 * @param {object} turf - Turf data used to populate the card. Expected properties:
 *   - id: unique identifier used for shared layout animations
 *   - image_url: source URL for the card image
 *   - name: turf display name (also used as image alt text)
 *   - rating: optional rating value; falls back to '4.8' if falsy
 *   - type: label text shown on the type badge
 *   - price_per_hour: numeric value passed to `formatCurrency` for display
 * @param {function} onClick - Click handler invoked when the card is clicked.
 * @param {string} [className=''] - Optional additional CSS classes to merge into the root element.
 * @returns {JSX.Element} The rendered TurfCard React element.
 */
export default function TurfCard({ turf, onClick, className = '' }) {
  return (
    <motion.div
      layoutId={`card-${turf.id}`}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm group cursor-pointer card-shadow-hover transition-all duration-500",
        className
      )}
    >
      <div className="relative h-56">
        <img
          src={turf.image_url}
          alt={turf.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-zinc-900">{turf.rating || '4.8'}</span>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {turf.type}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-zinc-900 text-lg leading-tight">{turf.name}</h3>
          <div className="flex items-baseline gap-0.5">
            <span className="text-emerald-600 font-black text-xl">{formatCurrency(turf.price_per_hour)}</span>
            <span className="text-zinc-400 text-[10px] font-bold">/hr</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
