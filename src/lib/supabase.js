import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const handleError = (error) => {
  if (error) throw error;
  return null;
};

export const fetchTurfComments = async (turfId) => {
  if (!turfId || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('turf_comments')
    .select('*')
    .eq('turf_id', turfId)
    .order('created_at', { ascending: false });
  handleError(error);
  return data || [];
};

export const fetchTurfFeedback = async (turfId) => {
  if (!turfId || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('turf_feedback')
    .select('*')
    .eq('turf_id', turfId)
    .order('created_at', { ascending: false });
  handleError(error);
  return data || [];
};

export const submitTurfComment = async (turfId, commentData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (!turfId || !commentData) throw new Error('Missing comment payload.');
  const payload = {
    turf_id: turfId,
    ...commentData,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('turf_comments')
    .insert(payload)
    .select()
    .single();
  handleError(error);
  return data;
};

export const submitTurfFeedback = async (turfId, feedbackData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (!turfId || !feedbackData) throw new Error('Missing feedback payload.');
  const payload = {
    turf_id: turfId,
    ...feedbackData,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('turf_feedback')
    .insert(payload)
    .select()
    .single();
  handleError(error);
  return data;
};

export const fetchTurfRatingSummary = async (turfId) => {
  if (!turfId || !isSupabaseConfigured) return { average: null, count: 0 };
  const { data, error } = await supabase
    .from('turf_feedback')
    .select('rating')
    .eq('turf_id', turfId);
  handleError(error);
  const ratings = (data || []).map((item) => item.rating || 0).filter((value) => value > 0);
  const count = ratings.length;
  const average = count === 0 ? null : ratings.reduce((sum, value) => sum + value, 0) / count;
  return { average, count };
};

export const generateQrToken = () => {
  const globalCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return globalCrypto.randomUUID();
  }
  return `qr_${Math.random().toString(36).slice(2)}_${Date.now()}`;
};

export const createBookingWithTicket = async (bookingData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const payload = {
    ...bookingData,
    qr_token: generateQrToken(),
  };
  const { data, error } = await supabase
    .from('bookings')
    .insert(payload)
    .select()
    .single();
  handleError(error);
  return data;
};

export const fetchBookingByQrToken = async (token) => {
  if (!token || !isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('bookings')
    .select('*, turfs(*)')
    .eq('qr_token', token)
    .single();
  handleError(error);
  return data;
};

export const fetchBookingById = async (bookingId) => {
  if (!bookingId || !isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('bookings')
    .select('*, turfs(*)')
    .eq('id', bookingId)
    .single();
  handleError(error);
  return data;
};

export const createNotification = async (notificationData) => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  if (!notificationData || !notificationData.recipient_id) throw new Error('Missing notification recipient.');

  const payload = {
    ...notificationData,
    read: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(payload)
    .select()
    .single();

  handleError(error);
  return data;
};

export const fetchNotificationsForUser = async (userId) => {
  if (!userId || !isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
};

export const markNotificationRead = async (notificationId) => {
  if (!notificationId || !isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
  handleError(error);
  return data;
};

