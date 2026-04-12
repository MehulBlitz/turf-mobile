import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = ['Football', 'Cricket', 'Tennis', 'Badminton', 'Multi-sport'];
const AMENITIES_LIST = ['Parking', 'Changing Rooms', 'Showers', 'Floodlights', 'Drinking Water', 'First Aid', 'WiFi', 'Cafeteria'];
const POPULAR_CITIES = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

export default function SearchFilters({
  priceRange,
  selectedCategories,
  selectedCity,
  minRating,
  selectedAmenities,
  onPriceChange,
  onCategoryChange,
  onCityChange,
  onRatingChange,
  onAmenityChange,
  onClearAll,
  activeFilters = 0
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClearAll = () => {
    onClearAll();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-4 rounded-2xl flex items-center justify-between font-bold text-sm transition-all",
          isOpen ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500" : "bg-white border border-zinc-100 text-zinc-900"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <Sliders size={18} />
          <span>Filters</span>
          {activeFilters > 0 && (
            <span className="ml-2 px-2 py-1 bg-emerald-600 text-white rounded-full text-xs font-black">
              {activeFilters}
            </span>
          )}
        </div>
        <ChevronDown size={18} className={cn("transition-transform", isOpen && "rotate-180")} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 p-6 space-y-6 max-h-[70vh] overflow-y-auto"
            >
              {/* Price Range */}
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none accent-emerald-500"
                  />
                  <div className="flex items-center justify-between text-sm font-bold text-zinc-900">
                    <span>₹{priceRange[0]}</span>
                    <span className="text-emerald-600">- ₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* City/Location */}
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-3">
                  City
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => onCityChange(city)}
                      className={cn(
                        "p-3 rounded-xl text-xs font-bold transition-all text-center",
                        selectedCity === city
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-3">
                  Sport Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => onCategoryChange(category)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                        selectedCategories.includes(category)
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-3">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => onRatingChange(rating)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        minRating === rating
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      )}
                    >
                      {rating === 0 ? 'All' : `${rating}+ ⭐`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-3">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => onAmenityChange(amenity)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                        selectedAmenities.includes(amenity)
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                {activeFilters > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex-1 p-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-all"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 p-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
