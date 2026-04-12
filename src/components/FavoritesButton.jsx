import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function FavoritesButton({ turfId, isFavorited, onToggle, className = '' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => onToggle(turfId)}
      className={`relative inline-flex items-center justify-center transition-all ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <motion.div
        animate={{
          scale: isFavorited ? [1, 1.3, 1] : 1,
          rotate: isFavorited ? [0, 12, -12, 0] : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          size={24}
          className={`transition-all ${
            isFavorited
              ? 'fill-red-500 text-red-500'
              : 'text-zinc-400 hover:text-red-400'
          }`}
        />
      </motion.div>

      {/* Particle effect on favorite */}
      {isFavorited && (
        <>
          <motion.div
            initial={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            animate={{ scale: 0, opacity: 0, y: -30, x: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-2 h-2 bg-red-500 rounded-full pointer-events-none"
          />
          <motion.div
            initial={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            animate={{ scale: 0, opacity: 0, y: -30, x: 20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-2 h-2 bg-red-500 rounded-full pointer-events-none"
          />
        </>
      )}
    </motion.button>
  );
}
