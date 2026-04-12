import { createClient } from '@supabase/supabase-js';

// Use environment variables for credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'See .env.local.example for reference.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const handleError = (error) => {
  if (error) throw error;
  return null;
};

export const fetchTurfComments = async (turfId) => {
  if (!turfId) return [];
  const { data, error } = await supabase
    .from('turf_comments')
    .select('*')
    .eq('turf_id', turfId)
    .order('created_at', { ascending: false });
  handleError(error);
  return data || [];
};

export const fetchTurfFeedback = async (turfId) => {
  if (!turfId) return [];
  const { data, error } = await supabase
    .from('turf_feedback')
    .select('*')
    .eq('turf_id', turfId)
    .order('created_at', { ascending: false });
  handleError(error);
  return data || [];
};

export const submitTurfComment = async (turfId, commentData) => {
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
  if (!turfId) return { average: null, count: 0 };
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

