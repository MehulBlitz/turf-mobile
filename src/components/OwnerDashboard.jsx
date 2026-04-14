import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Calendar, Loader2, X, Upload, Clock, Database, Camera as CameraIcon } from 'lucide-react';
import CancellationModal from './CancellationModal';
import { createNotification, generateQrToken, recordBookingCancellation, supabase } from '../lib/supabase';
import { cn, formatCurrency } from '../lib/utils';
import { capturePhoto, pickPhotoFromGallery } from '../lib/capacitorPlugins';

const AMENITIES = ['Parking', 'Changing Rooms', 'Showers', 'Floodlights', 'Drinking Water', 'First Aid', 'WiFi', 'Cafeteria'];
const GAMES = ['Football', 'Cricket', 'Tennis', 'Badminton', 'Basketball', 'Volleyball'];
const POPULAR_CITIES = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

export default function OwnerDashboard({ user, onTurfUpdate }) {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTurf, setEditingTurf] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeView, setActiveView] = useState('turfs');
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tempMediaUrls, setTempMediaUrls] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Nearby');
  const [showCityModal, setShowCityModal] = useState(false);

  const analytics = React.useMemo(() => {
    const confirmedBookings = ownerBookings.filter(b => b.status === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const totalBookings = confirmedBookings.length;
    const grossProfit = totalRevenue * 0.85;
    const totalRefunds = ownerBookings.filter(b => b.status === 'cancelled').reduce((sum, b) => sum + (b.refund_amount || 0), 0);
    const cancelledBookings = ownerBookings.filter(b => b.status === 'cancelled').length;

    const turfStats = confirmedBookings.reduce((acc, b) => {
      const name = b.turfs?.name || 'Unknown turf';
      acc[name] = acc[name] || { count: 0, revenue: 0 };
      acc[name].count += 1;
      acc[name].revenue += b.total_price || 0;
      return acc;
    }, {});

    const revenueByTurf = Object.entries(turfStats)
      .map(([turf, stats]) => ({ turf, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    const monthlyData = confirmedBookings.reduce((acc, b) => {
      const month = new Date(b.start_time).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (b.total_price || 0);
      return acc;
    }, {});

    return {
      totalRevenue,
      totalBookings,
      grossProfit,
      totalRefunds,
      cancelledBookings,
      monthlyData,
      revenueByTurf,
      avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
      pendingBookings: ownerBookings.filter(b => b.status === 'pending').length,
      blockedSlots: turfs.reduce((sum, t) => sum + (t.blocked_slots?.length || 0), 0)
    };
  }, [ownerBookings, turfs]);
  
  const fetchOwnerBookings = useCallback(async () => {
    try {
      // First get owner's turf IDs
      const { data: myTurfs } = await supabase
        .from('turfs')
        .select('id')
        .eq('owner_id', user.id);
      
      const turfIds = myTurfs?.map(t => t.id) || [];
      
      if (turfIds.length === 0) {
        setOwnerBookings([]);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*, turfs(*), profiles(*)')
        .in('turf_id', turfIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const now = new Date();
      const expiredBookingIds = (data || [])
        .filter((booking) =>
          booking.status !== 'cancelled' &&
          booking.status !== 'rejected' &&
          booking.end_time &&
          new Date(booking.end_time) < now &&
          booking.booking_status !== 'time is gone'
        )
        .map((booking) => booking.id);

      const cancelledBookingIds = (data || [])
        .filter((booking) =>
          booking.status === 'cancelled' &&
          booking.booking_status !== 'cancelled'
        )
        .map((booking) => booking.id);

      if (expiredBookingIds.length > 0) {
        await supabase
          .from('bookings')
          .update({ booking_status: 'time is gone' })
          .in('id', expiredBookingIds);
      }

      if (cancelledBookingIds.length > 0) {
        await supabase
          .from('bookings')
          .update({ booking_status: 'cancelled' })
          .in('id', cancelledBookingIds);
      }

      const normalizedBookings = (data || []).map((booking) => {
        let booking_status = booking.booking_status || 'booked';
        if (booking.status === 'cancelled') {
          booking_status = 'cancelled';
        } else if (booking.status === 'rejected') {
          booking_status = booking.booking_status || 'rejected';
        } else if (booking.end_time && new Date(booking.end_time) < now) {
          booking_status = 'time is gone';
        } else {
          booking_status = 'booked';
        }
        return { ...booking, booking_status };
      });

      setOwnerBookings(normalizedBookings);
    } catch (err) {
      console.error(err);
    }
  }, [user.id]);

  const fetchMyTurfs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .eq('owner_id', user.id);
      if (error) throw error;
      setTurfs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // New state for enhanced form
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [otherAmenity, setOtherAmenity] = useState('');
  const [selectedGames, setSelectedGames] = useState([]);
  const [otherGame, setOtherGame] = useState('');
  const [timeSlots, setTimeSlots] = useState([{ start: '06:00', end: '07:00', price: '' }]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('06:00');
  const [blockEnd, setBlockEnd] = useState('07:00');
  const [blockReason, setBlockReason] = useState('');
  const [selectedCancelBooking, setSelectedCancelBooking] = useState(null);
  const [, setCancelProcessing] = useState(false);

  useEffect(() => {
    fetchMyTurfs();
    fetchOwnerBookings();
  }, [fetchMyTurfs, fetchOwnerBookings]);

  useEffect(() => {
    if (editingTurf) {
      setSelectedCity(editingTurf.location || 'Hyderabad');
      setTempMediaUrls(editingTurf.media_urls || []);
      setSelectedAmenities(editingTurf.amenities || []);
      setSelectedGames(editingTurf.games || []);
      setTimeSlots(editingTurf.time_slots || [{ start: '06:00', end: '07:00', price: '' }]);
      setBlockedSlots(editingTurf.blocked_slots || []);
      setBlockDate('');
      setBlockStart('06:00');
      setBlockEnd('07:00');
      setBlockReason('');
    } else {
      setSelectedCity('Hyderabad');
      setTempMediaUrls([]);
      setSelectedAmenities([]);
      setSelectedGames([]);
      setTimeSlots([{ start: '06:00', end: '07:00', price: '' }]);
      setBlockedSlots([]);
      setBlockDate('');
      setBlockStart('06:00');
      setBlockEnd('07:00');
      setBlockReason('');
    }
  }, [editingTurf]);

  const [processingBooking, setProcessingBooking] = useState(null);

  const [showSetupGuide, setShowSetupGuide] = useState(false);

  
  async function handleBookingStatus(bookingId, status) {
    setProcessingBooking(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      if (error) throw error;
      await fetchOwnerBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingBooking(null);
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('turf-media')
          .upload(filePath, file);

        if (uploadError) {
          if (uploadError.message.includes('row-level security')) {
            setShowSetupGuide(true);
            throw new Error('Storage permissions missing. Please follow the setup guide.');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('turf-media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setTempMediaUrls(prev => [...prev, ...uploadedUrls]);
      return uploadedUrls;
    } catch (err) {
      alert('Error uploading file: ' + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = async (source = 'camera') => {
    setUploading(true);
    try {
      let imagePath = null;
      if (source === 'camera') {
        imagePath = await capturePhoto();
      } else {
        imagePath = await pickPhotoFromGallery();
      }

      if (!imagePath) {
        throw new Error('No image captured');
      }

      // Convert webPath to blob for upload
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();

      // Upload to Supabase
      const fileExt = 'jpg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('turf-media')
        .upload(filePath, blob);

      if (uploadError) {
        if (uploadError.message.includes('row-level security')) {
          setShowSetupGuide(true);
          throw new Error('Storage permissions missing. Please follow the setup guide.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('turf-media')
        .getPublicUrl(filePath);

      setTempMediaUrls(prev => [...prev, publicUrl]);
    } catch (err) {
      alert(`Error capturing/uploading photo: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const finalAmenities = [...selectedAmenities];
    if (otherAmenity.trim()) finalAmenities.push(otherAmenity.trim());

    const finalGames = [...selectedGames];
    if (otherGame.trim()) finalGames.push(otherGame.trim());

    const turfData = {
      name: formData.get('name'),
      location: formData.get('location'),
      full_address: formData.get('full_address'),
      latitude: parseFloat(formData.get('latitude') || '0'),
      longitude: parseFloat(formData.get('longitude') || '0'),
      price_per_hour: parseFloat(formData.get('price')),
      description: formData.get('description'),
      type: finalGames[0] || 'Multi-sport',
      owner_id: user.id,
      amenities: finalAmenities,
      games: finalGames,
      time_slots: timeSlots.filter(slot => slot.price !== ''),
      blocked_slots: blockedSlots,
      image_url: tempMediaUrls[0] || editingTurf?.image_url,
      media_urls: tempMediaUrls
    };

    try {
      if (editingTurf) {
        const { error } = await supabase.from('turfs').update(turfData).eq('id', editingTurf.id);
        if (error) {
          if (error.message.includes('column') || error.message.includes('schema cache')) {
            setShowSetupGuide(true);
            throw new Error('Database columns missing. Please follow the setup guide.');
          }
          throw error;
        }
      } else {
        const { error } = await supabase.from('turfs').insert([turfData]);
        if (error) {
          if (error.message.includes('column') || error.message.includes('schema cache')) {
            setShowSetupGuide(true);
            throw new Error('Database columns missing. Please follow the setup guide.');
          }
          throw error;
        }
      }
      setEditingTurf(null);
      setIsAdding(false);
      fetchMyTurfs();
      if (onTurfUpdate) onTurfUpdate();
    } catch (err) {
      alert(err.message);
    }
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: '06:00', end: '07:00', price: '' }]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const addBlockedSlot = () => {
    if (!blockDate || !blockStart || !blockEnd) {
      return alert('Please set a date, start time and end time to block a slot.');
    }

    setBlockedSlots(prev => [
      ...prev,
      {
        id: `${blockDate}-${blockStart}-${blockEnd}`,
        date: blockDate,
        start: blockStart,
        end: blockEnd,
        reason: blockReason.trim() || 'Unavailable'
      }
    ]);
    setBlockDate('');
    setBlockReason('');
    setBlockStart('06:00');
    setBlockEnd('07:00');
  };

  const removeBlockedSlot = (index) => {
    setBlockedSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleBookingCancellation = async (booking, reasonData) => {
    setCancelProcessing(true);
    try {
      const { data, error } = await supabase.from('bookings').update({
        status: 'cancelled',
        booking_status: 'cancelled',
        cancellation_reason: reasonData.reason,
        cancellation_notes: reasonData.notes,
        refund_amount: reasonData.refund_amount,
        cancelled_by: 'owner',
        qr_token: generateQrToken(),
      })
      .match({ id: booking.id })
      .not('status', 'eq', 'cancelled')
      .not('status', 'eq', 'rejected')
      .select()
      .maybeSingle();
      if (error) throw error;
      if (!data) {
        alert('This booking is no longer eligible for cancellation.');
        setSelectedCancelBooking(null);
        return;
      }

      await recordBookingCancellation({
        booking_id: booking.id,
        cancelled_by: 'owner',
        actor_id: user.id,
        cancellation_reason: reasonData.reason,
        cancellation_notes: reasonData.notes,
        refund_amount: reasonData.refund_amount,
      });

      await createNotification({
        recipient_id: booking.user_id,
        sender_id: user.id,
        title: 'Booking Cancelled by Owner',
        message: `Your booking for ${booking.turfs?.name} was cancelled by the turf owner.`,
        type: 'cancel',
        booking_id: booking.id,
      });
      await fetchOwnerBookings();
      setSelectedCancelBooking(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelProcessing(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 bg-zinc-50">
      
      
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setActiveView('turfs')}
            className={cn(
              "text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all flex-shrink-0",
              activeView === 'turfs' ? "text-emerald-600 border-emerald-600" : "text-zinc-400 border-transparent"
            )}
          >
            My Turfs
          </button>
          <button 
            onClick={() => setActiveView('bookings')}
            className={cn(
              "text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all flex-shrink-0",
              activeView === 'bookings' ? "text-emerald-600 border-emerald-600" : "text-zinc-400 border-transparent"
            )}
          >
            Bookings
          </button>
          <button 
            onClick={() => setActiveView('analytics')}
            className={cn(
              "text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all flex-shrink-0",
              activeView === 'analytics' ? "text-emerald-600 border-emerald-600" : "text-zinc-400 border-transparent"
            )}
          >
            Analytics
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              showSetupGuide ? "bg-amber-100 text-amber-600" : "bg-white border border-zinc-200 text-zinc-400"
            )}
            title="Supabase Setup Guide"
          >
            <Database size={20} />
          </button>
          {activeView === 'turfs' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {activeView === 'turfs' ? (
        <div className="space-y-4">
          {turfs.map(turf => (
            <div key={turf.id} className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex gap-4">
              <div className="w-24 h-24 rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0">
                <img src={turf.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-zinc-900">{turf.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-600 font-bold">{formatCurrency(turf.price_per_hour)}/hr</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingTurf(turf)}
                      className="p-2 bg-zinc-100 text-zinc-600 rounded-lg"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this turf?')) {
                          try {
                            const { error } = await supabase.from('turfs').delete().eq('id', turf.id);
                            if (error) throw error;
                            fetchMyTurfs();
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                      className="p-2 bg-red-50 text-red-500 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-zinc-500">
                  {turf.blocked_slots?.length > 0 ? `${turf.blocked_slots.length} hidden slot${turf.blocked_slots.length > 1 ? 's' : ''}` : 'No hidden slots configured'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeView === 'bookings' ? (
        <div className="space-y-4">
          {ownerBookings.length === 0 ? (
            <div className="py-20 text-center text-zinc-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-20" />
              <p>No bookings for your turfs yet</p>
            </div>
          ) : (
            ownerBookings.map(booking => (
              <div key={booking.id} className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden">
                      <img src={booking.profiles?.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{booking.profiles?.full_name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{booking.turfs?.name}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    booking.booking_status === 'booked' ? "bg-emerald-100 text-emerald-600" : 
                    booking.booking_status === 'time is gone' ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    {booking.booking_status || booking.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-emerald-500" />
                      <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-500" />
                      <span>{new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                          disabled={processingBooking === booking.id}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                          {processingBooking === booking.id ? <Loader2 size={10} className="animate-spin" /> : null}
                          Confirm
                        </button>
                        <button 
                          onClick={() => handleBookingStatus(booking.id, 'rejected')}
                          disabled={processingBooking === booking.id}
                          className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                          {processingBooking === booking.id ? <Loader2 size={10} className="animate-spin" /> : null}
                          Reject
                        </button>
                      </>
                    )}

                    {booking.booking_status !== 'cancelled' && booking.status === 'confirmed' && new Date(booking.start_time) > new Date() && (
                      <button
                        onClick={() => setSelectedCancelBooking(booking)}
                        className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-sm hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                {booking.status === 'cancelled' && (
                  <div className="mt-4 p-4 rounded-3xl bg-red-50 border border-red-100 text-sm text-red-700">
                    <p className="font-bold">Refund issued: {formatCurrency(booking.refund_amount || 0)}</p>
                    <p>Reason: {booking.cancellation_reason || booking.cancellation_notes || 'Not provided'}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-2xl font-black text-zinc-900">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Gross Profit</p>
              <p className="text-2xl font-black text-emerald-600">{formatCurrency(analytics.grossProfit)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Avg. Booking</p>
              <p className="text-xl font-bold text-zinc-900">{formatCurrency(analytics.avgBookingValue)}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pending Actions</p>
              <p className="text-xl font-bold text-amber-600">{analytics.pendingBookings}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Monthly Performance</h3>
            <div className="flex items-end justify-between h-40 gap-2 px-2">
              {Object.entries(analytics.monthlyData).map(([month, value]) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(value / (analytics.totalRevenue || 1)) * 100}%`, minHeight: '4px' }}
                  ></div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{month}</span>
                </div>
              ))}
              {Object.keys(analytics.monthlyData).length === 0 && (
                <p className="w-full text-center text-zinc-400 text-xs py-10">No monthly data available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Top Turf Revenue</h3>
              {analytics.revenueByTurf.length > 0 ? (
                <div className="space-y-3">
                  {analytics.revenueByTurf.slice(0, 3).map((item) => (
                    <div key={item.turf} className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-50">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{item.turf}</p>
                        <p className="text-xs text-zinc-400">{item.count} confirmed bookings</p>
                      </div>
                      <span className="text-sm font-black text-emerald-600">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">No revenue data to show yet.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Owner Actions</h3>
              <div className="space-y-3 text-sm text-zinc-600">
                <div className="flex justify-between items-center">
                  <span>Hidden slots across turfs</span>
                  <span className="font-bold text-zinc-900">{analytics.blockedSlots}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cancelled bookings</span>
                  <span className="font-bold text-red-600">{analytics.cancelledBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Refunds issued</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(analytics.totalRefunds)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Business Health</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Your turfs are performing well. You have {analytics.totalBookings} confirmed bookings this period. 
                Keep your turf details updated to attract more users.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCancelBooking && (
        <CancellationModal
          booking={selectedCancelBooking}
          onClose={() => setSelectedCancelBooking(null)}
          onConfirm={(reasonData) => handleBookingCancellation(selectedCancelBooking, reasonData)}
        />
      )}

      {(isAdding || editingTurf) && (
        <div className="modal-backdrop flex items-end">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full bg-white rounded-t-[40px] p-6 viewport-scroll"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-zinc-900">{editingTurf ? 'Edit Turf' : 'Add New Turf'}</h2>
              <button onClick={() => { setEditingTurf(null); setIsAdding(false); }} className="text-zinc-400"><X /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <input name="name" defaultValue={editingTurf?.name} placeholder="Turf Name" required className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none text-sm text-zinc-900" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Select City</label>
                    <button
                      type="button"
                      onClick={() => setShowCityModal(true)}
                      className="w-full p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-200 outline-none text-sm text-zinc-900 text-left flex justify-between items-center hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                    >
                      <span className="font-semibold">{selectedCity}</span>
                      <span className="text-xs">▼</span>
                    </button>
                    <input type="hidden" name="location" value={selectedCity} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Base Price/hr</label>
                    <input name="price" type="number" defaultValue={editingTurf?.price_per_hour} placeholder="Price" required className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none text-sm text-zinc-900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Full Address</label>
                  <input name="full_address" defaultValue={editingTurf?.full_address} placeholder="Detailed Address" required className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none text-sm text-zinc-900" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Latitude</label>
                    <input name="latitude" type="number" step="any" defaultValue={editingTurf?.latitude} placeholder="e.g. 17.3850" className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none text-sm text-zinc-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Longitude</label>
                    <input name="longitude" type="number" step="any" defaultValue={editingTurf?.longitude} placeholder="e.g. 78.4867" className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none text-sm text-zinc-900" />
                  </div>
                </div>
                <textarea name="description" defaultValue={editingTurf?.description} placeholder="Description" className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none text-sm h-24 text-zinc-900" />
              </div>

              {/* Games Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Games Supported</label>
                <div className="flex flex-wrap gap-2">
                  {GAMES.map(game => (
                    <button
                      key={game}
                      type="button"
                      onClick={() => setSelectedGames(prev => prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game])}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                        selectedGames.includes(game) ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-zinc-500 border-zinc-100"
                      )}
                    >
                      {game}
                    </button>
                  ))}
                </div>
                <input 
                  placeholder="Other game..." 
                  value={otherGame}
                  onChange={(e) => setOtherGame(e.target.value)}
                  className="w-full p-3 bg-zinc-50 rounded-xl border-none outline-none text-xs text-zinc-900"
                />
              </div>

              {/* Amenities Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => setSelectedAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity])}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                        selectedAmenities.includes(amenity) ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-zinc-500 border-zinc-100"
                      )}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
                <input 
                  placeholder="Other amenity..." 
                  value={otherAmenity}
                  onChange={(e) => setOtherAmenity(e.target.value)}
                  className="w-full p-3 bg-zinc-50 rounded-xl border-none outline-none text-xs text-zinc-900"
                />
              </div>

              {/* Time Slots Specifier */}
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Time Slots & Pricing</label>
                  <button type="button" onClick={addTimeSlot} className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Plus size={12} /> Add Slot
                  </button>
                </div>
                <div className="space-y-2">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-zinc-50 p-3 rounded-2xl">
                      <input 
                        type="time" 
                        value={slot.start} 
                        onChange={(e) => updateTimeSlot(idx, 'start', e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold w-24 text-zinc-900"
                      />
                      <span className="text-zinc-300">-</span>
                      <input 
                        type="time" 
                        value={slot.end} 
                        onChange={(e) => updateTimeSlot(idx, 'end', e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold w-24 text-zinc-900"
                      />
                      <input 
                        type="number" 
                        placeholder="Price"
                        value={slot.price}
                        onChange={(e) => updateTimeSlot(idx, 'price', e.target.value)}
                        className="flex-1 bg-white p-2 rounded-lg border-none outline-none text-xs font-bold text-emerald-600"
                      />
                      <button type="button" onClick={() => removeTimeSlot(idx)} className="text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div>
                      <p className="text-sm font-black text-emerald-900 uppercase tracking-widest">Hide Slot for Date</p>
                      <p className="text-xs text-emerald-700">Block specific slot availability with an owner note.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addBlockedSlot}
                      className="rounded-2xl bg-emerald-600 px-4 py-2 text-[10px] font-bold uppercase text-white hover:bg-emerald-700 transition-colors"
                    >
                      Add Block
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-emerald-200 bg-white text-sm text-zinc-900"
                    />
                    <input
                      type="time"
                      value={blockStart}
                      onChange={(e) => setBlockStart(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-emerald-200 bg-white text-sm text-zinc-900"
                    />
                    <input
                      type="time"
                      value={blockEnd}
                      onChange={(e) => setBlockEnd(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-emerald-200 bg-white text-sm text-zinc-900"
                    />
                  </div>

                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Reason for hiding this slot"
                    className="w-full min-h-[5.5rem] p-3 rounded-2xl border border-emerald-200 bg-white text-sm text-zinc-900 resize-none"
                  />

                  {blockedSlots.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Hidden slots</p>
                      <div className="space-y-2">
                        {blockedSlots.map((block, idx) => (
                          <div key={block.id || `${block.date}-${block.start}-${block.end}`} className="rounded-3xl bg-white p-3 border border-emerald-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{new Date(block.date).toLocaleDateString('en-GB')}</p>
                              <p className="text-xs text-zinc-500">{block.start} - {block.end}</p>
                              <p className="text-xs text-zinc-500">{block.reason}</p>
                            </div>
                            <button type="button" onClick={() => removeBlockedSlot(idx)} className="self-start sm:self-center rounded-2xl bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-100 transition-colors">
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative group">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-4 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center gap-2 text-zinc-400 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all">
                      {uploading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Upload size={20} />
                      )}
                      <span className="text-[10px] font-bold text-center">Browse</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCameraCapture('camera')}
                    disabled={uploading}
                    className="p-4 border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center gap-2 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <CameraIcon size={20} />
                    )}
                    <span className="text-[10px] font-bold text-center">Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCameraCapture('gallery')}
                    disabled={uploading}
                    className="p-4 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center gap-2 text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Upload size={20} />
                    )}
                    <span className="text-[10px] font-bold text-center">Gallery</span>
                  </button>
                </div>

                {tempMediaUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {tempMediaUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 group">
                        {url.includes('.mp4') ? (
                          <video src={url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                        <button
                          type="button"
                          onClick={() => setTempMediaUrls(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20">
                {editingTurf ? 'Update Turf' : 'Create Turf'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* City Selection Modal */}
      {showCityModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCityModal(false)} />
          <div className="safe-modal viewport-center p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-900">Select City</h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="text-zinc-400" size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {POPULAR_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setShowCityModal(false);
                  }}
                  className={cn(
                    "w-full p-4 text-sm font-bold rounded-xl border-2 transition-all text-left active:scale-95",
                    selectedCity === city
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg"
                      : "bg-white border-zinc-200 text-zinc-900 hover:border-emerald-300 hover:bg-emerald-50"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
