import React from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReviewsSection({ turf, onLeaveReview }) {
  // Sample reviews data - in a real app this would come from the database
  const reviews = [];
  const averageRating = turf.rating || 4.8;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-black text-zinc-900 mb-2">{averageRating}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-zinc-300"}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 font-medium">Based on {reviews.length} reviews</p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-600 min-w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0)}%` }}
                    className="h-full bg-yellow-400"
                  />
                </div>
                <span className="text-xs text-zinc-500 min-w-8 text-right">
                  {reviews.filter(r => r.rating === rating).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {reviews.length === 0 ? (
          <button
            onClick={onLeaveReview}
            className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Be the first to review this turf
          </button>
        ) : (
          <button
            onClick={onLeaveReview}
            className="w-full py-3 bg-zinc-50 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100"></div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{review.userName}</p>
                    <p className="text-xs text-zinc-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-300"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-zinc-700">{review.text}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
