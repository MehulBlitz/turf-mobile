import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserBookings = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select('*, turfs(*)')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
      if (err) throw err;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError(err.message);
    }
  }, []);

  const fetchBookedSlots = useCallback(async (turfId, date) => {
    if (!turfId || !date) return;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .select('start_time, end_time, status')
        .eq('turf_id', turfId)
        .in('status', ['confirmed', 'pending'])
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (err) throw err;
      setBookedSlots(data || []);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setError(err.message);
    }
  }, []);

  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (err) throw err;
      return { success: true, data };
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (bookingId, status) => {
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      if (err) throw err;
      return { success: true };
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    setBookings,
    bookedSlots,
    setBookedSlots,
    loading,
    error,
    fetchUserBookings,
    fetchBookedSlots,
    createBooking,
    updateBookingStatus
  };
}
