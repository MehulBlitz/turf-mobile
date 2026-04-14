import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Share2, Download, Copy, QrCode } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import jsPDF from 'jspdf';

export default function TicketModal({ showTicket, onClose }) {
  const [showQR, setShowQR] = useState(true);

  if (!showTicket) return null;

  const handleShare = async () => {
    try {
      const ticketInfo = `
🎉 Booking Confirmation

Turf: ${showTicket.turf.name}
Date: ${new Date(showTicket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
Time: ${showTicket.slot.start} - ${showTicket.slot.end}
Price: ₹${Math.round(showTicket.total_price)}
Booking ID: ${showTicket.id.slice(0, 8).toUpperCase()}

Book your next game on TurfBook! 🏟️
      `.trim();

      // Try native share first (Capacitor)
      if (navigator.share) {
        await navigator.share({
          title: 'Booking Confirmation',
          text: ticketInfo,
        });
      } else {
        // Fallback: Copy to clipboard and alert
        await navigator.clipboard.writeText(ticketInfo);
        alert('Booking info copied to clipboard! You can paste it anywhere.');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set font
      pdf.setFont('Helvetica');

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(16, 185, 129); // emerald-500
      pdf.text('BOOKING CONFIRMED', 105, 30, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // gray-600
      pdf.text(`ID: ${showTicket.id.slice(0, 8).toUpperCase()}`, 105, 40, { align: 'center' });

      // Separator
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 48, 190, 48);

      // Turf Name
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(showTicket.turf.name, 20, 60);

      // Amount
      pdf.setFontSize(14);
      pdf.setTextColor(16, 185, 129);
      pdf.text(`₹${Math.round(showTicket.total_price)}`, 190, 60, { align: 'right' });

      // Separator
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 68, 190, 68);

      // Date and Time
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('DATE', 20, 78);
      pdf.text('TIME', 110, 78);

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const dateStr = new Date(showTicket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      pdf.text(dateStr, 20, 88);
      pdf.text(`${showTicket.slot.start} - ${showTicket.slot.end}`, 110, 88);

      // Separator
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 96, 190, 96);

      // QR Code placeholder
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('QR CODE', 105, 110, { align: 'center' });

      // Simple QR placeholder (text-based)
      pdf.setFontSize(8);
      pdf.setTextColor(180, 188, 208);
      const qrText = `Scan QR on device for:\nBooking: ${showTicket.id.slice(0, 8)}\nTurf: ${showTicket.turf.name}`;
      pdf.text(qrText, 105, 120, { align: 'center', maxWidth: 150 });

      // Separator
      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 145, 190, 145);

      // Footer
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text('SCAN AT ENTRY', 105, 160, { align: 'center' });
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 105, 270, { align: 'center' });
      pdf.text('Keep this ticket safe', 105, 277, { align: 'center' });

      // Save PDF
      pdf.save(`turfbook-${showTicket.id.slice(0, 8).toUpperCase()}.pdf`);
      alert('Ticket downloaded successfully! Check your Downloads folder.');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download ticket. Try again.');
    }
  };

  const handleCopyID = async () => {
    try {
      await navigator.clipboard.writeText(showTicket.id);
      alert('Booking ID copied!');
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const isCancelled = showTicket.status === 'cancelled';
  const cancellationReason = showTicket.cancellation_reason || showTicket.cancellation_notes || 'Not provided';
  const cancelledBy = showTicket.cancelled_by || 'Customer';
  const refundAmount = showTicket.refund_amount || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-500 p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 transition-all border border-white/20"
          >
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-widest">Booking Confirmed</h3>
          {isCancelled && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Cancelled by {cancelledBy}
            </div>
          )}
          <button
            onClick={handleCopyID}
            className="text-emerald-100 text-[10px] mt-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center gap-1 mx-auto"
          >
            ID: {showTicket.id.slice(0, 8).toUpperCase()}
            <Copy size={12} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Turf Info */}
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-black text-zinc-900 text-lg">{showTicket.turf.name}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</p>
              <p className="text-lg font-black text-emerald-600">{formatCurrency(showTicket.total_price)}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 py-6 border-y border-zinc-100">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-bold text-zinc-900">
                {new Date(showTicket.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Time</p>
              <p className="text-sm font-bold text-zinc-900">{showTicket.slot.start} - {showTicket.slot.end}</p>
            </div>
          </div>

          {isCancelled && (
            <div className="space-y-3 p-4 rounded-3xl bg-red-50 border border-red-100 text-red-700">
              <p className="font-bold">This booking has been cancelled</p>
              <p>Cancelled by: {cancelledBy}</p>
              <p>Reason: {cancellationReason}</p>
              <p>Refund: {formatCurrency(refundAmount)}</p>
            </div>
          )}

          {/* QR Code Section */}
          <div className="pt-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full text-center mb-3 text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode size={16} />
              {showQR ? 'Hide' : 'Show'} QR Code
            </button>

            {showQR && (
              <div className="space-y-3">
                {isCancelled ? (
                  <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                    <p className="font-bold mb-2">QR invalidated</p>
                    <p>This booking was cancelled, so its QR ticket is no longer valid for entry.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 p-4 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
                          JSON.stringify({
                            bookingId: showTicket.id,
                            qrToken: showTicket.qr_token,
                            ticketUrl: `https://turfbook.example/verify?bookingId=${showTicket.id}&qrToken=${showTicket.qr_token}`,
                          })
                        )}`}
                        alt="QR Code"
                        className="w-56 h-56"
                      />
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-sm font-semibold text-zinc-900">Booking ID</p>
                      <p className="text-xs text-zinc-500 break-all">{showTicket.id}</p>
                      <p className="text-center text-xs text-zinc-500">
                        Scan this QR code in the app on another device or use the Booking ID manually if needed.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
            {!showQR && (
              <div className="bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 p-4 py-8 text-center text-zinc-400">
                <p className="text-sm">QR Code hidden</p>
              </div>
            )}

            <p className="text-center text-[8px] font-black text-zinc-300 uppercase tracking-[0.4em] mt-3">Scan at Entry</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={handleShare}
              className="py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-emerald-100"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-100"
            >
              <Download size={18} />
              Save
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-zinc-900/20 active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
