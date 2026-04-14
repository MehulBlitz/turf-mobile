import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Check, ChevronDown, X } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

const AMENITY_ICONS = {
  'Parking': '🅿️',
  'Changing Rooms': '👕',
  'Showers': '🚿',
  'Floodlights': '💡',
  'Drinking Water': '💧',
  'First Aid': '🏥',
  'WiFi': '📶',
  'Cafeteria': '🍽️'
};

/**
 * Render a bottom-sheet modal that displays detailed information about a turf and provides a UI to select and book time slots.
 *
 * @param {{id?: string, name?: string, image_url?: string, media_urls?: string[], rating?: number|string, price_per_hour?: number, description?: string, games?: string[], amenities?: string[], time_slots?: {start: string, end: string, price: number}[]}|null} turf - Turf data object; may be null or undefined while loading.
 * @param {() => void} onClose - Callback invoked when the modal close control is activated.
 * @param {(selectedSlot: {start: string, end: string, price: number}) => void} onBooking - Callback invoked with the selected time slot when booking is confirmed.
 * @returns {JSX.Element} The TurfDetailPage React element (a fixed, animated bottom-sheet with turf info and booking controls).
 */
export default function TurfDetailPage({ turf, onClose, onBooking }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotSelector, setShowSlotSelector] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: view, 2: select slot, 3: confirm

  if (!turf) {
    return <div className="p-6 text-center text-zinc-400">Loading turf details...</div>;
  }

  const handleBookClick = () => {
    if (selectedSlot && bookingStep === 3) {
      onBooking(selectedSlot);
    } else if (bookingStep === 1) {
      setBookingStep(2);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-2xl mx-auto bg-white rounded-t-[3rem] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Turf Details</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 rounded-2xl overflow-hidden bg-zinc-100">
              <img
                src={turf.image_url}
                alt={turf.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{turf.rating || '4.8'}</span>
              </div>
            </div>

            {/* Media Thumbnails */}
            {turf.media_urls && turf.media_urls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {turf.media_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`gallery-${idx}`}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">{turf.name}</h1>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-emerald-600">{formatCurrency(turf.price_per_hour)}</div>
                <div className="text-xs text-zinc-500 font-bold">per hour</div>
              </div>
            </div>

            {turf.description && (
              <p className="text-zinc-600 leading-relaxed">{turf.description}</p>
            )}
          </div>

          {/* Games & Type */}
          {turf.games && turf.games.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-3">Games Supported</h3>
              <div className="flex flex-wrap gap-2">
                {turf.games.map(game => (
                  <span
                    key={game}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold"
                  >
                    {game}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {turf.amenities && turf.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {turf.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center gap-2">
                    <span className="text-lg">{AMENITY_ICONS[amenity] || '✓'}</span>
                    <span className="text-sm text-zinc-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Slots */}
          {turf.time_slots && turf.time_slots.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-3">Available Slots</h3>
              <button
                onClick={() => setShowSlotSelector(!showSlotSelector)}
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between hover:bg-zinc-100 transition-colors"
              >
                <span className="text-sm font-bold text-zinc-900">
                  {selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : 'Select a time slot'}
                </span>
                <ChevronDown size={18} className={cn("transition-transform", showSlotSelector && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showSlotSelector && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {turf.time_slots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setShowSlotSelector(false);
                          setBookingStep(3);
                        }}
                        className={cn(
                          'w-full p-4 rounded-2xl border-2 transition-all text-sm font-bold flex items-center justify-between',
                          selectedSlot?.start === slot.start
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300'
                        )}
                      >
                        <span>
                          {slot.start} - {slot.end} • {formatCurrency(slot.price)}
                        </span>
                        {selectedSlot?.start === slot.start && <Check size={18} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Owner Info */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Managed By</p>
            <p className="text-sm font-bold text-zinc-900">Professional Turf Provider</p>
            <p className="text-xs text-zinc-600">Member since 2024</p>
          </div>

          {/* Booking Button */}
          <button
            disabled={!selectedSlot}
            onClick={handleBookClick}
            className="w-full bg-emerald-500 disabled:bg-zinc-300 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all disabled:cursor-not-allowed"
          >
            {selectedSlot ? `Book for ${formatCurrency(selectedSlot.price)}` : 'Select a Slot to Book'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
