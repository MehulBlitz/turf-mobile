import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

const CANCELLATION_REASONS = [
  'Change of plans',
  'Scheduling conflict',
  'Found another venue',
  'Weather concerns',
  'Other'
];

const REFUND_POLICY = {
  before_24h: 100,  
  before_6h: 75,    
  before_2h: 50,    
  less_than_2h: 0   
};

export default function CancellationModal({ booking, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1: confirm, 2: reason, 3: summary
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate refund percentage
  const bookingTime = new Date(booking.start_time);
  const now = new Date();
  const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

  let refundPercentage = REFUND_POLICY.less_than_2h;
  if (hoursUntilBooking >= 24) refundPercentage = REFUND_POLICY.before_24h;
  else if (hoursUntilBooking >= 6) refundPercentage = REFUND_POLICY.before_6h;
  else if (hoursUntilBooking >= 2) refundPercentage = REFUND_POLICY.before_2h;

  const refundAmount = (booking.total_price * refundPercentage) / 100;
  const cancellationFee = booking.total_price - refundAmount;

  const handleConfirm = async () => {
    if (!selectedReason) {
      alert('Please select a cancellation reason');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        reason: selectedReason,
        notes,
        refund_amount: refundAmount
      });
      onClose();
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-md rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-900">Cancel Booking</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step 1: Confirmation */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-red-900">Cannot be undone</p>
                  <p className="text-xs text-red-800">Once cancelled, you&apos;ll need to book again if you want to use this slot.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-3 text-sm text-yellow-800">
                  Cancellation fees will be deducted from your refund amount based on how close the booking is to the slot time.
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                  <span className="text-sm text-zinc-600">Turf</span>
                  <span className="font-bold text-zinc-900">{booking.turfs?.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                  <span className="text-sm text-zinc-600">Date & Time</span>
                  <span className="font-bold text-zinc-900">
                    {new Date(booking.start_time).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                  <span className="text-sm text-zinc-600">Booking Amount</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(booking.total_price)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Reason */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-zinc-900 mb-3">Why are you cancelling?</p>
                <div className="space-y-2">
                  {CANCELLATION_REASONS.map(reason => (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(reason)}
                      className={cn(
                        "w-full p-3 rounded-xl border-2 text-left transition-all text-sm font-medium",
                        selectedReason === reason
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      )}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReason === 'Other' && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Please let us know why..."
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm font-medium h-24 resize-none"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedReason}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Refund Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-zinc-900 mb-3">Refund Details</p>

                {hoursUntilBooking < 2 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-start gap-2">
                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-amber-800">
                      Cancellations within 2 hours of booking are non-refundable
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-zinc-50 rounded-xl">
                    <span className="text-sm text-zinc-600">Original Amount</span>
                    <span className="font-bold text-zinc-900">{formatCurrency(booking.total_price)}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-sm text-red-600">Cancellation Fee ({100 - refundPercentage}%)</span>
                    <span className="font-bold text-red-600">-{formatCurrency(cancellationFee)}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-emerald-50 rounded-xl border-2 border-emerald-500">
                    <span className="text-sm font-bold text-emerald-900">Refund Amount</span>
                    <span className="font-black text-emerald-600 text-lg">{formatCurrency(refundAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-500 text-center">
                <p>Refund will be processed within 5-7 business days</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold transition-colors"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
