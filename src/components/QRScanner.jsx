import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, QrCode as QrCodeIcon, Camera, Image as ImageIcon } from 'lucide-react';
import { capturePhoto, checkCameraPermission, pickPhotoFromGallery, requestCameraPermission } from '../lib/capacitorPlugins';
import { fetchBookingById, fetchBookingByQrToken, supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function QRScanner({ onClose }) {
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  const [liveScanError, setLiveScanError] = useState(null);

  const codeReaderRef = useRef(null);
  const videoRef = useRef(null);

  const isUuid = (value) => {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89abAB][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
  };

  const parseBookingPayload = (rawData) => {
    if (!rawData) return {};

    const trimmedData = rawData.trim();
    if (isUuid(trimmedData)) {
      return { bookingId: trimmedData };
    }

    try {
      const parsed = JSON.parse(trimmedData);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      // not JSON
    }

    if (/^https?:\/\//i.test(trimmedData)) {
      try {
        const url = new URL(trimmedData);
        const bookingId = url.searchParams.get('bookingId') || url.searchParams.get('id');
        const qrToken = url.searchParams.get('qrToken') || url.searchParams.get('token');
        if (bookingId || qrToken) {
          return { bookingId, qrToken };
        }

        const segments = url.pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (isUuid(lastSegment)) {
          return { bookingId: lastSegment };
        }
      } catch {
        // invalid URL
      }
    }

    const bookingMatch = trimmedData.match(/booking(?:Id|_id)?[:=]?\s*([0-9a-f-]{36})/i);
    if (bookingMatch) {
      return { bookingId: bookingMatch[1] };
    }

    return { raw: trimmedData };
  };

  const lookupBooking = async (rawData) => {
    const parsed = parseBookingPayload(rawData);
    if (parsed.qrToken) {
      return fetchBookingByQrToken(parsed.qrToken);
    }
    if (parsed.bookingId) {
      return fetchBookingById(parsed.bookingId);
    }
    return null;
  };

  const getCodeReader = () => {
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }
    return codeReaderRef.current;
  };

  const scanQRFromPhoto = async (photoUrl) => {
    try {
      const image = document.createElement('img');
      image.src = photoUrl;
      await image.decode();

      const codeReader = getCodeReader();
      const result = await codeReader.decodeFromImageElement(image);
      if (!result?.text) {
        setError('No QR code found in image. Try again with a clearer photo.');
        return;
      }

      const booking = await lookupBooking(result.text);
      if (booking) {
        const currentUser = await supabase.auth.getUser();
        const ownsTicket = currentUser?.data?.user?.id === booking.user_id;

        setScannedData({
          id: booking.id,
          turf: booking.turfs?.name,
          date: booking.start_time,
          time: `${new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          amount: booking.total_price,
          status: booking.status,
          ownsTicket,
          raw: result.text,
        });
      } else {
        setScannedData({
          raw: result.text,
          id: isUuid(result.text) ? result.text : result.text.substring(0, 8),
        });
      }
    } catch (err) {
      console.error('QR scan from photo error:', err);
      setError('Failed to scan QR code from image. Try a clearer image or a different angle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapturePhoto = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const photo = await capturePhoto();
      if (!photo) {
        setIsLoading(false);
        return;
      }

      await scanQRFromPhoto(photo);
    } catch (err) {
      console.error('Camera capture error:', err);
      setError(`Camera Error: ${err.message || 'Cannot access camera. Check permissions.'}`);
      setIsLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const photo = await pickPhotoFromGallery();
      if (!photo) {
        setIsLoading(false);
        return;
      }

      await scanQRFromPhoto(photo);
    } catch (err) {
      console.error('Gallery pick error:', err);
      setError(`Gallery Error: ${err.message || 'Cannot access gallery. Check permissions.'}`);
      setIsLoading(false);
    }
  };

  const stopLiveScan = async () => {
    if (codeReaderRef.current) {
      try {
        await codeReaderRef.current.reset();
      } catch (err) {
        console.warn('Error stopping live QR scanner:', err);
      }
      codeReaderRef.current = null;
    }
    setIsLiveScanning(false);
  };

  const handleStartLiveScan = async () => {
    setError(null);
    setLiveScanError(null);

    try {
      const permissions = await checkCameraPermission();
      if (permissions.camera !== 'granted') {
        const requested = await requestCameraPermission();
        if (requested.camera !== 'granted') {
          throw new Error('Camera permission is required for live scanning.');
        }
      }

      const codeReader = getCodeReader();
      const videoElement = videoRef.current;
      if (!videoElement) {
        throw new Error('QR scan video element is not available.');
      }

      setIsLiveScanning(true);

      await codeReader.decodeFromVideoDevice(null, videoElement, async (result, error) => {
        if (result) {
          await stopLiveScan();
          const decodedText = result.getText();
          const booking = await lookupBooking(decodedText);
          if (booking) {
            const currentUser = await supabase.auth.getUser();
            const ownsTicket = currentUser?.data?.user?.id === booking.user_id;
            setScannedData({
              id: booking.id,
              turf: booking.turfs?.name,
              date: booking.start_time,
              time: `${new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              amount: booking.total_price,
              status: booking.status,
              ownsTicket,
              raw: decodedText,
            });
          } else {
            setLiveScanError('QR scanned but booking was not found.');
          }
        } else if (error) {
          setLiveScanError(error.message || 'Scanning failed.');
        }
      });
    } catch (err) {
      console.error('Live scan error:', err);
      setLiveScanError(err.message || 'Could not start camera scanner.');
      setIsLiveScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopLiveScan();
    };
  }, []);

  const handleRescan = () => {
    setScannedData(null);
    setError(null);
    setLiveScanError(null);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-white rounded-[3rem] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-emerald-500 p-6 text-white text-center relative flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center gap-2">
              <QrCodeIcon size={24} />
              <h3 className="text-lg font-black uppercase">Scan QR</h3>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="p-6">
            {!scannedData && (
              <div className="space-y-4">
                {!error ? (
                  <>
                    <div className="rounded-2xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border-4 border-emerald-300 aspect-square">
                      <Camera size={48} className="text-emerald-300 opacity-50" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-600 font-medium">Capture or select a photo with QR code</p>
                      <p className="text-xs text-zinc-400 mt-2">The system will scan automatically.</p>
                    </div>
                    {isLiveScanning && (
                      <div className="space-y-3">
                        <video ref={videoRef} className="w-full h-72 rounded-3xl overflow-hidden bg-black" muted playsInline />
                        <button
                          onClick={stopLiveScan}
                          className="w-full py-3 bg-red-500 text-white rounded-2xl font-bold active:scale-95 transition-all"
                        >
                          Stop Live Scan
                        </button>
                        {liveScanError && (
                          <p className="text-xs text-red-600">{liveScanError}</p>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleCapturePhoto}
                        disabled={isLoading}
                        className="py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Camera size={18} />
                        <span className="text-sm">Take Photo</span>
                      </button>
                      <button
                        onClick={handlePickFromGallery}
                        disabled={isLoading}
                        className="py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ImageIcon size={18} />
                        <span className="text-sm">Gallery</span>
                      </button>
                      <button
                        onClick={handleStartLiveScan}
                        disabled={isLiveScanning}
                        className="py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <QrCodeIcon size={18} />
                        <span className="text-sm">Live Scan</span>
                      </button>
                    </div>
                  </>
                ) : null}

                {error && (
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-2xl p-6 text-center border border-red-200">
                      <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
                      <p className="text-red-700 font-semibold mb-2">{error}</p>
                      <ul className="text-sm text-red-600 text-left mb-4">
                        <li>✓ Grant camera/gallery permission</li>
                        <li>✓ Ensure good lighting</li>
                        <li>✓ QR code must be clear and visible</li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setError(null);
                        }}
                        className="py-3 bg-emerald-500 text-white rounded-2xl font-bold active:scale-95 transition-all"
                      >
                        Try Camera
                      </button>
                      <button
                        onClick={() => {
                          setError(null);
                        }}
                        className="py-3 bg-blue-500 text-white rounded-2xl font-bold active:scale-95 transition-all"
                      >
                        Try Gallery
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {scannedData && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200 flex items-start gap-3">
                  <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-green-900">Ticket Scanned!</p>
                    <p className="text-sm text-green-700">Booking details loaded</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {scannedData.id && (
                    <div className="bg-zinc-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Booking ID</p>
                      <p className="text-lg font-black text-zinc-900">{scannedData.id}</p>
                    </div>
                  )}

                  {scannedData.turf && (
                    <div className="bg-zinc-50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Turf</p>
                      <p className="font-bold text-zinc-900">{scannedData.turf}</p>
                    </div>
                  )}

                  {scannedData.date && scannedData.time && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-50 rounded-xl p-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Date</p>
                        <p className="font-bold text-zinc-900">{new Date(scannedData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      </div>
                      <div className="bg-zinc-50 rounded-xl p-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase mb-1">Time</p>
                        <p className="font-bold text-zinc-900">{scannedData.time}</p>
                      </div>
                    </div>
                  )}

                  {scannedData.amount && (
                    <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Amount</p>
                      <p className="text-2xl font-black text-emerald-600">{formatCurrency(scannedData.amount)}</p>
                    </div>
                  )}
                </div>

                {typeof scannedData.ownsTicket === 'boolean' && (
                  <div className={`rounded-xl p-4 text-sm font-bold ${scannedData.ownsTicket ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-yellow-50 border border-amber-200 text-amber-800'}`}>
                    {scannedData.ownsTicket
                      ? 'This ticket is linked to your account.'
                      : 'This ticket belongs to a different account. Please sign in with the correct user if needed.'}
                  </div>
                )}

                {scannedData.raw && (
                  <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                    <p className="text-[10px] font-black text-orange-600 uppercase mb-2">Raw Data</p>
                    <p className="text-xs text-orange-700 break-all">{scannedData.raw}</p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                  <p className="text-sm font-semibold text-blue-900">✅ Ready for Check-In</p>
                  <p className="text-xs text-blue-700 mt-1">Booking verified and ready!</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleRescan} className="py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold active:scale-95 transition-all">
                    Scan Again
                  </button>
                  <button onClick={handleClose} className="py-3 bg-zinc-900 text-white rounded-2xl font-bold active:scale-95 transition-all">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
