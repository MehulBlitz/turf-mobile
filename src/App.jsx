import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Search,
  Calendar,
  User,
  Star,
  Clock,
  ChevronRight,
  Bell,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Users,
  CalendarDays,
  LogOut,
  LayoutDashboard,
  Settings,
  Wifi,
  WifiOff,
  QrCode,
  MessageCircle
} from 'lucide-react';
import { cn, formatCurrency } from './lib/utils';
import { supabase, isSupabaseConfigured, createBookingWithTicket, createNotification, fetchNotificationsForUser, generateQrToken, recordBookingCancellation } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import BookingsCalendar from './components/BookingsCalendar';
import TicketModal from './components/TicketModal';
import CancellationModal from './components/CancellationModal';
import QRScanner from './components/QRScanner';
import SearchFilters from './components/SearchFilters';
import TurfFeedbackPage from './components/TurfFeedbackPage';
import { getCurrentLocation, checkNetworkStatus, onNetworkStatusChange, showBookingConfirmation, showSuccessToast, showErrorToast, addBookingToCalendar } from './lib/capacitorPlugins';
import { ensureFirebaseProfile, getFirebaseProfile, saveFirebaseProfile, uploadProfilePhoto, isFirebaseConfigured } from './lib/firebase';
import { fetchTurfRatingSummary } from './lib/supabase';
import { StatusBar, Style } from '@capacitor/status-bar';

function AppContent() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [paymentStep, setPaymentStep] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [turfs, setTurfs] = useState([]);
  const [supabaseError, setSupabaseError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Nearby');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [filterCategories, setFilterCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [isNetworkConnected, setIsNetworkConnected] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [showRotateWarning, setShowRotateWarning] = useState(false);

  const getTurfRating = (turf) => {
    const ratingValue = turf?.average_rating != null ? turf.average_rating : turf?.rating;
    return ratingValue != null && ratingValue !== 0 ? ratingValue : null;
  };
  const [firebaseProfile, setFirebaseProfile] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [feedbackTurf, setFeedbackTurf] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedCancellation, setSelectedCancellation] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const pullStartYRef = useRef(null);

  const popularCities = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

  const resetPull = () => {
    setIsPulling(false);
    setPullDistance(0);
    pullStartYRef.current = null;
  };

  const handleTouchStart = (e) => {
    if (isRefreshing) return;
    const container = e.currentTarget;
    if (container.scrollTop <= 0) {
      pullStartYRef.current = e.touches[0].clientY;
      setIsPulling(true);
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || pullStartYRef.current === null) return;
    const distance = e.touches[0].clientY - pullStartYRef.current;
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, 120));
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    const shouldRefresh = pullDistance >= 80;
    resetPull();
    if (shouldRefresh && session) {
      setIsRefreshing(true);
      await fetchUserBookings(session.user.id);
      await loadNotifications(session.user.id);
      setIsRefreshing(false);
    }
  };

  const detectLocation = async () => {
    try {
      // Try native geolocation first (on mobile)
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation({
          lat: location.latitude,
          lng: location.longitude
        });
        setSelectedCity('Nearby');
      } else {
        // Fallback to browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              setSelectedCity('Nearby');
            },
            (error) => {
              console.error('Error detecting location:', error);
              alert('Could not detect location. Please select manually.');
            }
          );
        }
      }
    } catch (error) {
      console.error('Error in detectLocation:', error);
      // Fallback to browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setSelectedCity('Nearby');
          },
          (error) => {
            console.error('Error detecting location:', error);
            alert('Could not detect location. Please select manually.');
          }
        );
      }
    }
  };

  const handleBecomeOwner = async () => {
    if (!session?.user?.id) return alert('Please sign in to become a turf owner.');
    if (profile?.role === 'owner') return alert('You are already a turf owner.');

    setIsUpdatingRole(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'owner', updated_at: new Date().toISOString() })
        .eq('id', session.user.id);
      if (error) throw error;

      const updatedProfile = { ...profile, role: 'owner' };
      setProfile(updatedProfile);

      if (isFirebaseConfigured) {
        const updatedFirebaseProfile = await saveFirebaseProfile(session.user.id, {
          ...firebaseProfile,
          role: 'owner',
        });
        if (updatedFirebaseProfile) {
          setFirebaseProfile(updatedFirebaseProfile);
        }
      }

      alert('You are now a turf owner. Your owner dashboard is now available.');
      setIsSettingsOpen(false);
      fetchProfile(session.user.id, session.user);
    } catch (err) {
      alert(err.message || 'Failed to change role. Please try again.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const getVisibleSlots = (turf, date) => {
    if (!turf || !turf.time_slots) return [];
    const dateKey = new Date(date).toISOString().split('T')[0];
    const blocked = turf.blocked_slots || [];
    return turf.time_slots.filter((slot) => {
      return !blocked.some((block) => block.date === dateKey && block.start === slot.start && block.end === slot.end);
    });
  };

  const filteredTurfs = turfs
    .filter(turf => {
      const turfName = (turf.name || '').toLowerCase();
      const turfLocation = (turf.location || '').toLowerCase();
      const matchesSearch = turfName.includes(searchQuery.toLowerCase()) || turfLocation.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || turf.type === selectedCategory;
      const matchesFilterCategory = filterCategories.length === 0 || filterCategories.includes(turf.type);
      const matchesCity = selectedCity === 'Nearby' || turfLocation.includes(selectedCity.toLowerCase());
      const price = typeof turf.price_per_hour === 'number' ? turf.price_per_hour : parseFloat(turf.price_per_hour) || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const turfRating = turf.average_rating ?? turf.rating ?? 0;
      const matchesRating = turfRating >= minRating;
      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => (turf.amenities || []).includes(amenity));

      return matchesSearch && matchesCategory && matchesFilterCategory && matchesCity && matchesPrice && matchesRating && matchesAmenities;
    })
    .sort((a, b) => {
      if (userLocation && a.lat && a.lng && b.lat && b.lng) {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      }
      return 0;
    });

  const visibleSlots = selectedTurf ? getVisibleSlots(selectedTurf, selectedDate) : [];
  const hiddenSlotsForDate = selectedTurf ? (selectedTurf.blocked_slots || []).filter((block) => block.date === selectedDate) : [];

  const fetchProfile = useCallback(async (uid, authUser) => {
    let { data } = await supabase.from('profiles').select('*').eq('id', uid).single();

    if (!data && authUser) {
      const savedRole = localStorage.getItem('googleAuthRole');
      const profileRole = data?.role || authUser.user_metadata?.role || savedRole || 'customer';
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email || '';
      const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName || uid}`;

      const { error: createError, data: newProfile } = await supabase.from('profiles').insert({
        id: uid,
        full_name: fullName,
        role: profileRole,
        avatar_url: avatarUrl,
      }).select().single();

      if (createError) {
        console.error('Failed to create missing profile:', createError);
      } else {
        data = newProfile;
      }
      localStorage.removeItem('googleAuthRole');
    }

    setProfile(data);
    try {
      if (isFirebaseConfigured) {
        const fbProfile = await getFirebaseProfile(uid);
        if (fbProfile) {
          setFirebaseProfile(fbProfile);
        } else if (authUser) {
          const newProfile = await ensureFirebaseProfile(uid, {
            full_name: data?.full_name || authUser.user_metadata?.full_name || authUser.email || '',
            email: authUser.email,
            phone: data?.phone || '',
            preferred_city: data?.preferred_city || '',
            avatar_url: data?.avatar_url || '',
            role: data?.role || 'customer',
          });
          setFirebaseProfile(newProfile);
        }
      } else {
        setFirebaseProfile(null);
      }
    } catch (err) {
      console.error('Firebase profile sync failed:', err);
    }
  }, []);

  const fetchUserBookings = useCallback(async (uid) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, turfs(*)')
      .eq('user_id', uid)
      .order('start_time', { ascending: false });

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

    if (expiredBookingIds.length > 0) {
      await supabase
        .from('bookings')
        .update({ booking_status: 'time is gone' })
        .in('id', expiredBookingIds);
    }

    const normalizedBookings = (data || []).map((booking) => {
      let booking_status = booking.booking_status || 'booked';
      if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
        if (booking.end_time && new Date(booking.end_time) < now) {
          booking_status = 'time is gone';
        } else {
          booking_status = 'booked';
        }
      }
      return { ...booking, booking_status };
    });

    setBookings(normalizedBookings);
  }, []);

  const loadNotifications = useCallback(async (uid) => {
    if (!uid || !isSupabaseConfigured) return;
    const { data, error } = await fetchNotificationsForUser(uid);
    if (error) {
      console.error('Failed to load notifications:', error);
      return;
    }
    setNotifications((data || []).map((notification) => ({
      ...notification,
      timestamp: notification.created_at ? new Date(notification.created_at) : new Date(),
    })));
  }, []);

  const fetchTurfs = useCallback(async () => {
    try {
      // Load base turf list from Supabase only.
      // Feedback counts and average rating are then enriched from Firebase.
      const { data, error } = await supabase.from('turfs').select('*');
      if (error) throw error;
      const rawTurfs = data || [];
      setTurfs(rawTurfs);
      const enriched = await Promise.all(rawTurfs.map(async (turf) => {
        try {
          const { average, count } = await fetchTurfRatingSummary(turf.id);
          return {
            ...turf,
            average_rating: average,
            feedback_count: count,
          };
        } catch (summaryError) {
          console.error('Error fetching turf rating summary:', summaryError);
          return turf;
        }
      }));
      setTurfs(enriched);
      setSelectedTurf((prevSelected) => {
        if (!prevSelected) return prevSelected;
        return enriched.find((t) => t.id === prevSelected.id) || prevSelected;
      });
      setSupabaseError(null);
    } catch (err) {
      console.error('Error fetching turfs:', err);
      if (err.message === 'Failed to fetch') {
        setSupabaseError('Could not connect to Supabase. Please check your internet connection or Supabase project status.');
      } else {
        setSupabaseError(err.message);
      }
    }
  }, []);

  const refreshTurfRating = useCallback(async (turfId) => {
    if (!turfId) return;
    try {
      const { average, count } = await fetchTurfRatingSummary(turfId);
      setTurfs((current) => current.map((turf) => turf.id === turfId ? {
        ...turf,
        average_rating: average,
        feedback_count: count,
      } : turf));
      setSelectedTurf((current) => current && current.id === turfId ? {
        ...current,
        average_rating: average,
        feedback_count: count,
      } : current);
    } catch (err) {
      console.error('Error refreshing turf rating summary:', err);
    }
  }, []);

  const fetchBookedSlots = useCallback(async (turfId, date) => {
    if (!turfId || !date) return;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, status')
        .eq('turf_id', turfId)
        .in('status', ['confirmed', 'pending'])
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (error) throw error;
      setBookedSlots(data || []);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
    }
  }, []);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveFirebaseProfile = async (uid, profileUpdates) => {
    try {
      const updated = await saveFirebaseProfile(uid, profileUpdates);
      setFirebaseProfile(updated);
    } catch (err) {
      console.error('Save Firebase profile failed:', err);
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const updateViewportMode = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
      const isDesktop = width >= 900 && !isTouch;
      setIsDesktopViewport(isDesktop);
      setShowRotateWarning(!isDesktop && isTouch && width > height && width < 900);
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    window.addEventListener('orientationchange', updateViewportMode);

    const initAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const oauthRole = searchParams.get('google_role');
        if (oauthRole) {
          localStorage.setItem('googleAuthRole', oauthRole);
          searchParams.delete('google_role');
          const cleanSearch = searchParams.toString();
          const cleanUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${window.location.hash}`;
          window.history.replaceState({}, '', cleanUrl);
        }

        const urlFragment = window.location.hash + window.location.search;
        if (urlFragment.includes('access_token') || urlFragment.includes('refresh_token') || urlFragment.includes('error_description')) {
          const { data: redirectData, error: redirectError } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (redirectError) {
            console.error('OAuth redirect session error:', redirectError);
          } else if (redirectData?.session) {
            setSession(redirectData.session);
            fetchProfile(redirectData.session.user.id, redirectData.session.user);
            fetchUserBookings(redirectData.session.user.id);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          fetchProfile(session.user.id, session.user);
          fetchUserBookings(session.user.id);
          loadNotifications(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user);
        fetchUserBookings(session.user.id);
        loadNotifications(session.user.id);
      }
      else {
        setProfile(null);
        setBookings([]);
        setNotifications([]);
      }
    });

    // Real-time listener for turfs
    const turfChannel = supabase
      .channel('turfs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turfs'
        },
        () => {
          fetchTurfs();
        }
      )
      .subscribe();

    // Real-time listener for bookings to update availability
    const bookingChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          if (selectedTurf && selectedDate) {
            fetchBookedSlots(selectedTurf.id, selectedDate);
          }
          if (session) {
            fetchUserBookings(session.user.id);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(turfChannel);
      supabase.removeChannel(bookingChannel);
      window.removeEventListener('resize', updateViewportMode);
      window.removeEventListener('orientationchange', updateViewportMode);
    };
  }, [fetchTurfs, fetchProfile, fetchUserBookings, fetchBookedSlots]);

  useEffect(() => {
    if (!session?.user?.id) return;

    loadNotifications(session.user.id);
    const notificationsChannel = supabase
      .channel(`notifications-${session.user.id}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${session.user.id}`,
        },
        () => {
          loadNotifications(session.user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [session?.user?.id, loadNotifications]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Keep selectedTurf in sync with turfs array
  useEffect(() => {
    if (selectedTurf) {
      const updatedTurf = turfs.find(t => t.id === selectedTurf.id);
      if (updatedTurf && JSON.stringify(updatedTurf) !== JSON.stringify(selectedTurf)) {
        setSelectedTurf(updatedTurf);
      }
    }
  }, [turfs, selectedTurf]);

  useEffect(() => {
    if (isBooking && selectedTurf && selectedDate) {
      fetchBookedSlots(selectedTurf.id, selectedDate);
    }
  }, [isBooking, selectedTurf, selectedDate, fetchBookedSlots]);

  // Network status monitoring
  useEffect(() => {
    const initNetworkMonitoring = async () => {
      // Check initial network status
      const status = await checkNetworkStatus();
      setIsNetworkConnected(status.connected);

      if (status.connected) {
        setSupabaseError(null);
        fetchTurfs();
      } else {
        setSupabaseError('Offline. Please check your internet connection.');
      }

      // Monitor network status changes
      onNetworkStatusChange((status) => {
        setIsNetworkConnected(status.connected);
      });

      // Configure status bar
      try {
        await StatusBar.setBackgroundColor({ color: '#059669' }); // Dark emerald
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        console.log('Status bar not available on this platform');
      }
    };

    initNetworkMonitoring();
  }, [fetchTurfs]);

  useEffect(() => {
    if (!isNetworkConnected) {
      setSupabaseError('Offline. Please check your internet connection.');
      return;
    }

    // Retry fetch when connectivity returns.
    if (supabaseError) {
      fetchTurfs();
    }
  }, [isNetworkConnected, fetchTurfs, supabaseError]);

  // Add notification to list
  const addNotification = (type, title, message) => {
    const id = Date.now();
    const notification = {
      id,
      type, // 'booking', 'cancel', 'reminder', 'success'
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setProfile(null);
      setBookings([]);
      setActiveTab('home');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelConfirm = async (reasonData) => {
    if (!selectedCancellation) return;
    try {
      const { data: latestBooking, error: latestError } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', selectedCancellation.id)
        .maybeSingle();
      if (latestError) throw latestError;
      if (!latestBooking || latestBooking.status === 'cancelled' || latestBooking.status === 'rejected') {
        alert('This booking has already been cancelled or is no longer eligible for cancellation.');
        setSelectedCancellation(null);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          booking_status: 'cancelled',
          cancellation_reason: reasonData.reason,
          cancellation_notes: reasonData.notes,
          refund_amount: reasonData.refund_amount,
          cancelled_by: 'customer',
          qr_token: generateQrToken(),
        })
        .match({ id: selectedCancellation.id })
        .not('status', 'eq', 'cancelled')
        .not('status', 'eq', 'rejected')
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        alert('This booking is no longer eligible for cancellation.');
        setSelectedCancellation(null);
        return;
      }

      await recordBookingCancellation({
        booking_id: selectedCancellation.id,
        cancelled_by: 'customer',
        actor_id: session.user.id,
        cancellation_reason: reasonData.reason,
        cancellation_notes: reasonData.notes,
        refund_amount: reasonData.refund_amount,
      });

      await fetchUserBookings(session.user.id);
      await createNotification({
        recipient_id: session.user.id,
        sender_id: session.user.id,
        title: 'Booking Cancelled',
        message: `${selectedCancellation.turfs?.name} has been cancelled.`,
        type: 'cancel',
        booking_id: selectedCancellation.id,
      });
      if (selectedCancellation.turfs?.owner_id) {
        await createNotification({
          recipient_id: selectedCancellation.turfs.owner_id,
          sender_id: session.user.id,
          title: 'Booking Cancelled',
          message: `${profile?.full_name || 'A customer'} cancelled booking for ${selectedCancellation.turfs?.name}.`,
          type: 'cancel',
          booking_id: selectedCancellation.id,
        });
      }
      await loadNotifications(session.user.id);
      addNotification('cancel', 'Booking Cancelled', `${selectedCancellation.turfs?.name} has been cancelled.`);
      setSelectedCancellation(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      id: session.user.id,
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
      preferred_city: formData.get('preferred_city'),
      updated_at: new Date().toISOString(),
    };

    try {
      let avatarUrl = firebaseProfile?.avatar_url || '';
      if (profilePhotoFile && session?.user?.id && isFirebaseConfigured) {
        avatarUrl = await uploadProfilePhoto(session.user.id, profilePhotoFile);
      }

      const { error } = await supabase.from('profiles').upsert({
        ...updates,
        avatar_url: avatarUrl,
      });
      if (error) throw error;

      let updatedFirebaseProfile = null;
      if (isFirebaseConfigured) {
        updatedFirebaseProfile = await handleSaveFirebaseProfile(session.user.id, {
          full_name: updates.full_name,
          phone: updates.phone,
          preferred_city: updates.preferred_city,
          avatar_url: avatarUrl,
        });
      }

      if (updatedFirebaseProfile) {
        setFirebaseProfile(updatedFirebaseProfile);
      }
      setProfile((prev) => ({
        ...prev,
        full_name: updates.full_name,
        phone: updates.phone,
        preferred_city: updates.preferred_city,
        avatar_url: avatarUrl,
      }));

      alert('Profile updated!');
      setIsEditingProfile(false);
      setProfilePhotoFile(null);
      setProfilePhotoPreview('');
      fetchProfile(session.user.id, session.user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return alert('Please select a slot');
    if (!session) return alert('Please login to book');

    const [hours, minutes] = selectedSlot.start.split(':');
    const [endHours, endMinutes] = selectedSlot.end.split(':');
    
    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    const endTime = new Date(selectedDate);
    endTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);

    if (startTime < new Date()) {
      return alert('You cannot book a slot in the past. Please choose a future time.');
    }

    try {
      setIsProcessingPayment(true);
      
      // Simulate network delay for payment gateway
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Final check if already booked (to avoid race conditions)
      const { data: existing } = await supabase
        .from('bookings')
        .select('*')
        .eq('turf_id', selectedTurf.id)
        .eq('start_time', startTime.toISOString())
        .in('status', ['confirmed', 'pending']);

      if (existing && existing.length > 0) {
        setIsProcessingPayment(false);
        return alert('This slot was just booked by someone else. Please choose another one.');
      }

      const data = await createBookingWithTicket({
        turf_id: selectedTurf.id,
        user_id: session.user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        total_price: parseFloat(selectedSlot.price),
        status: 'confirmed', // Set to confirmed directly as requested
        booking_status: 'booked',
      });

      const newBooking = {
        ...data,
        turf: selectedTurf,
        booking_status: data.booking_status || 'booked',
      };

      setShowTicket({
        ...newBooking,
        slot: selectedSlot,
        date: selectedDate
      });
      setBookings((prevBookings) => [newBooking, ...(prevBookings || [])]);
      setIsProcessingPayment(false);
      setIsBooking(false);
      setPaymentStep(false);
      setSelectedSlot(null);
      await fetchUserBookings(session.user.id);

      // Mark booking in calendar
      await addBookingToCalendar({
        id: data.id,
        turfName: selectedTurf.name,
        date: selectedDate,
        timeSlot: `${selectedSlot.start} - ${selectedSlot.end}`,
        location: selectedCity,
        price: selectedSlot.price,
        pricePerHour: selectedTurf.price_per_hour
      });

      // Save synced notifications for customer and turf owner
      await createNotification({
        recipient_id: session.user.id,
        sender_id: session.user.id,
        title: 'Booking Confirmed',
        message: `Your booking for ${selectedTurf.name} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedSlot.start} is confirmed.`,
        type: 'booking',
        booking_id: data.id,
      });

      if (selectedTurf?.owner_id) {
        await createNotification({
          recipient_id: selectedTurf.owner_id,
          sender_id: session.user.id,
          title: 'New Turf Booking',
          message: `${profile?.full_name || 'A customer'} booked ${selectedTurf.name} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedSlot.start}.`,
          type: 'booking',
          booking_id: data.id,
        });
      }

      await loadNotifications(session.user.id);

      // Show notifications and toast
      addNotification('booking', '✅ Booking Confirmed!', `${selectedTurf.name} on ${new Date(selectedDate).toLocaleDateString()}`);
      await showBookingConfirmation(selectedTurf.name, selectedSlot.start, new Date(selectedDate).toLocaleDateString());
      await showSuccessToast('Booking confirmed! Check your notifications.');
    } catch (err) {
      setIsProcessingPayment(false);
      addNotification('cancel', '❌ Booking Failed', err.message);
      await showErrorToast(err.message);
    }
  };

  const closeTicket = () => {
    setShowTicket(null);
    setActiveTab('bookings');
  };

  if (!session) return <AuthScreen />;

  // Role-based view logic
  const isOwner = profile?.role === 'owner';
  const isAdmin = profile?.role === 'admin';

  const renderContent = () => {
    if (isOwner && activeTab === 'dashboard') {
      return (
        <div className="flex-1 flex flex-col pb-24">
          <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md active:scale-90 transition-all z-30"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-display font-bold text-zinc-900">Manage Turfs</h2>
          </header>
          <OwnerDashboard user={session.user} onTurfUpdate={fetchTurfs} />
        </div>
      );
    }

    if (isAdmin && activeTab === 'dashboard') {
      return (
        <div className="flex-1 flex flex-col pb-24">
          <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md active:scale-90 transition-all z-30"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-display font-bold text-zinc-900">Admin Panel</h2>
          </header>
          <AdminDashboard />
        </div>
      );
    }

    if (activeTab === 'bookings') {
      return (
        <div className="flex-1 flex flex-col pb-24">
          <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md active:scale-90 transition-all z-30"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-display font-bold text-zinc-900">My Bookings</h2>
          </header>
          <div className="p-6 space-y-4">
            {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Calendar size={48} className="mb-4 opacity-20" />
              <p className="font-medium">No bookings yet</p>
            </div>
          ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    onClick={() => setShowTicket({
                      ...booking,
                      turf: booking.turfs,
                      slot: {
                        start: new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        end: new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      },
                      date: booking.start_time
                    })}
                    className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  >
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100">
                      <img src={booking.turfs?.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{booking.turfs?.name}</h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Time Slot</p>
                        <p className="text-xs font-bold text-zinc-900">
                          {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        booking.booking_status === 'booked' ? "bg-emerald-100 text-emerald-600" : 
                        booking.booking_status === 'time is gone' ? "bg-amber-100 text-amber-600" :
                        "bg-red-100 text-red-600"
                      )}>
                        {booking.booking_status || booking.status}
                      </span>
                      {booking.booking_status !== 'cancelled' && booking.status !== 'cancelled' && booking.status !== 'rejected' && new Date(booking.start_time) > new Date() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCancellation(booking);
                          }}
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  {booking.status === 'cancelled' && (
                    <div className="mt-3 px-4 py-3 rounded-3xl bg-red-50 border border-red-100 text-sm text-red-700 space-y-1">
                      <p className="font-bold">Refund: {formatCurrency(booking.refund_amount || 0)}</p>
                      <p>Cancelled by: {booking.cancelled_by || 'Customer'}</p>
                      <p>Reason: {booking.cancellation_reason || booking.cancellation_notes || 'No reason provided'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      );
    }

    if (activeTab === 'feedback') {
      if (feedbackTurf) {
        return (
          <div className="flex-1 flex flex-col pb-24">
            <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
              <button 
                onClick={() => setFeedbackTurf(null)}
                className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md active:scale-90 transition-all z-30"
              >
                <ArrowLeft size={20} strokeWidth={3} />
              </button>
              <h2 className="text-xl font-display font-bold text-zinc-900">Feedback</h2>
            </header>
            <div className="flex-1 overflow-y-auto">
              <TurfFeedbackPage
                turf={feedbackTurf}
                user={{
                  id: session.user.id,
                  email: session.user.email,
                  avatar_url: firebaseProfile?.avatar_url || profile?.avatar_url || '',
                }}
                onBack={() => setFeedbackTurf(null)}
                onFeedbackUpdate={() => refreshTurfRating(feedbackTurf?.id)}
              />
            </div>
          </div>
        );
      }
      return (
        <div className="flex-1 flex flex-col pb-24">
          <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md active:scale-90 transition-all z-30"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-display font-bold text-zinc-900">Turf Feedback</h2>
          </header>
          <div className="p-6 space-y-4">
            {turfs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No turfs available for feedback yet.</p>
              </div>
            ) : (
              turfs.map((turf) => (
                <button
                  key={turf.id}
                  onClick={() => {
                    setFeedbackTurf(turf);
                  }}
                  className="w-full text-left bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm hover:border-emerald-200 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100">
                      <img src={turf.image_url} alt={turf.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{turf.name}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{turf.description}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'calendar') {
      return <BookingsCalendar userId={session?.user?.id} />;
    }

    if (activeTab === 'profile') {
      return (
        <div className="flex-1 flex flex-col pb-24">
          <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
            <button 
              onClick={() => setActiveTab('home')}
              className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-md active:scale-90 transition-all z-30"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <h2 className="text-xl font-display font-bold text-zinc-900">My Profile</h2>
          </header>
          <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 mb-4 overflow-hidden border-4 border-white shadow-lg">
              <img src={profilePhotoPreview || firebaseProfile?.avatar_url || profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || profile?.email}` } alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">{firebaseProfile?.full_name || profile?.full_name}</h2>
            <p className="text-zinc-500 capitalize mb-8">{firebaseProfile?.role || profile?.role}</p>
            
            <div className="w-full space-y-3">
              <div className="bg-white rounded-3xl p-2 border border-zinc-100 shadow-sm">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full p-4 hover:bg-zinc-50 rounded-2xl flex items-center justify-between font-bold text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-zinc-400" />
                    <span>App Settings</span>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300" />
                </button>
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full p-4 hover:bg-zinc-50 rounded-2xl flex items-center justify-between font-bold text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User size={20} className="text-zinc-400" />
                    <span>Edit Profile</span>
                  </div>
                  <ChevronRight size={18} className="text-zinc-300" />
                </button>
              </div>

              <button 
                onClick={handleLogout}
                className="w-full p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-bold"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-zinc-900">Settings</h3>
                    <button onClick={() => setIsSettingsOpen(false)}><XCircle className="text-zinc-300" /></button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-zinc-900">Notifications</p>
                        <p className="text-xs text-zinc-500">Get updates about bookings</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-emerald-500 relative">
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-zinc-50 p-4 border border-zinc-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-zinc-900">Become a Turf Owner</p>
                          <p className="text-xs text-zinc-500">
                            {profile?.role === 'owner' || firebaseProfile?.role === 'owner'
                              ? 'Your account already has owner access.'
                              : 'Opt in to become a turf owner and manage your turf listing.'}
                          </p>
                        </div>
                        <button
                          disabled={isUpdatingRole || profile?.role === 'owner' || firebaseProfile?.role === 'owner'}
                          onClick={handleBecomeOwner}
                          className={`px-4 py-2 rounded-2xl font-bold transition-all ${profile?.role === 'owner' || firebaseProfile?.role === 'owner'
                            ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                        >
                          {profile?.role === 'owner' || firebaseProfile?.role === 'owner'
                            ? 'Owner'
                            : isUpdatingRole
                              ? 'Updating...'
                              : 'Become Owner'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">App Version</p>
                      <p className="text-xs font-bold text-zinc-900">v1.2.5 (Stable)</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold mt-8"
                  >
                    Done
                  </button>
                </motion.div>
              </motion.div>
            )}

            {isEditingProfile && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-zinc-900">Edit Profile</h3>
                    <button onClick={() => setIsEditingProfile(false)}><XCircle className="text-zinc-300" /></button>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Full Name</label>
                      <input name="full_name" defaultValue={firebaseProfile?.full_name || profile?.full_name} className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none font-medium text-zinc-900" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Phone Number</label>
                      <input name="phone" defaultValue={firebaseProfile?.phone || profile?.phone} className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none font-medium text-zinc-900" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Preferred City</label>
                      <input name="preferred_city" defaultValue={firebaseProfile?.preferred_city || profile?.preferred_city || ''} className="w-full p-4 bg-zinc-50 rounded-2xl border-none outline-none font-medium text-zinc-900" />
                    </div>
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">Profile Photo</label>
                      <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-600" />
                    </div>
                    <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 mt-4">
                      Save Changes
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col pb-24">
        {supabaseError && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-3 text-red-600">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-xs font-bold">{supabaseError}</p>
            </div>
            <button
              onClick={fetchTurfs}
              className="self-start px-4 py-2 bg-red-600 text-white rounded-2xl text-xs font-bold hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Header */}
        <header className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-20">
          <div className="relative">
            <h1 className="font-display text-2xl font-bold tracking-tight text-gradient">TurfBook</h1>
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5 hover:text-emerald-500 transition-colors"
            >
              <span className="font-medium">{selectedCity}</span>
              <ChevronRight size={10} className={cn("transition-transform", showLocationPicker && "rotate-90")} />
            </button>

            <AnimatePresence>
              {showLocationPicker && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50"
                    onClick={() => setShowLocationPicker(false)}
                  />
                  <div className="safe-modal viewport-center p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-zinc-900">Select Location</h3>
                      <button onClick={() => setShowLocationPicker(false)} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors">
                        <XCircle className="text-zinc-400" size={20} />
                      </button>
                    </div>

                    <div className="space-y-3 mb-6 max-h-96 overflow-y-auto scrollbar-thin">
                      {popularCities.map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowLocationPicker(false);
                            setUserLocation(null);
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

                    <button
                      onClick={() => {
                        detectLocation();
                        setShowLocationPicker(false);
                      }}
                      className="w-full p-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm border-2 border-emerald-200 hover:bg-emerald-100 transition-colors active:scale-95"
                    >
                      📍 Auto Detect Location
                    </button>
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3">
            <button
              className={cn(
                "w-10 h-10 rounded-2xl border flex items-center justify-center text-sm font-bold shadow-sm transition-colors",
                isNetworkConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-red-50 border-red-200 text-red-600"
              )}
              title={isNetworkConnected ? "Connected" : "Offline"}
            >
              {isNetworkConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-600 shadow-sm hover:bg-emerald-50 transition-colors"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center overflow-hidden active:scale-90 transition-all"
            >
              <img src={firebaseProfile?.avatar_url || profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || profile?.email}`} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Notifications Modal */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-backdrop"
                onClick={() => setShowNotifications(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-[4.5rem] right-4 z-50 bg-white rounded-2xl shadow-xl border border-zinc-100 w-80 max-h-96 overflow-y-auto scrollbar-thin"
              >
                <div className="sticky top-0 bg-white p-4 border-b border-zinc-100 z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-zinc-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-zinc-50 transition-colors">
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                            notif.type === 'booking' ? 'bg-emerald-500' :
                            notif.type === 'cancel' ? 'bg-red-500' :
                            notif.type === 'reminder' ? 'bg-blue-500' :
                            'bg-green-500'
                          )}>
                            {notif.type === 'booking' ? '✓' :
                             notif.type === 'cancel' ? '✕' :
                             notif.type === 'reminder' ? '⏰' :
                             '✓'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-zinc-900 text-sm">{notif.title}</p>
                            <p className="text-zinc-600 text-xs mt-0.5">{notif.message}</p>
                            <p className="text-zinc-400 text-[10px] mt-1">
                              {notif.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Search Section */}
        <div className="px-6 mb-6 space-y-4">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-zinc-100">
            <div className="flex gap-3">
              <div className="flex-1 bg-zinc-50 rounded-2xl flex items-center px-4 py-3 gap-3 text-zinc-400 border border-zinc-100">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Find your favorite turf..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-zinc-900 w-full text-sm font-medium"
                />
              </div>
              <button
                onClick={() => setShowQRScanner(true)}
                className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-90 transition-all hover:bg-emerald-600"
                title="Scan QR Code"
              >
                <QrCode size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <SearchFilters
            priceRange={priceRange}
            selectedCategories={filterCategories}
            selectedCity={selectedCity}
            minRating={minRating}
            selectedAmenities={selectedAmenities}
            onPriceChange={setPriceRange}
            onCategoryChange={(cat) => {
              setFilterCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
            }}
            onCityChange={setSelectedCity}
            onRatingChange={setMinRating}
            onAmenityChange={(amenity) => {
              setSelectedAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]);
            }}
            onClearAll={() => {
              setPriceRange([0, 5000]);
              setFilterCategories([]);
              setMinRating(0);
              setSelectedAmenities([]);
            }}
            activeFilters={[...filterCategories, ...(minRating > 0 ? ['rating'] : []), ...(selectedAmenities.length > 0 ? selectedAmenities : [])].length}
          />
        </div>

        {/* Categories */}
        <div className="px-6 mb-6">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 flex-nowrap scroll-smooth">
            {['All', 'Football', 'Cricket', 'Tennis', 'Badminton'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border flex-shrink-0",
                  selectedCategory === cat 
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/20 scale-105" 
                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date Scroller */}
        <div className="px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-zinc-900">Select Date</h2>
            <div className="relative">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100">
                <Calendar size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 flex-nowrap scroll-smooth">
            {[...Array(14)].map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl border-2 transition-all duration-300 flex-shrink-0",
                    isSelected 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105" 
                      : "bg-white border-zinc-50 text-zinc-400"
                  )}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-black">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Section */}
        <div className="px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-zinc-900">
              {selectedCity === 'Nearby' ? 'Popular Near You' : `Popular in ${selectedCity}`}
            </h2>
            <button className="text-emerald-600 text-xs font-bold">See All</button>
          </div>
          <div className="space-y-5">
            {filteredTurfs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-zinc-400">No turfs found in this area.</p>
              </div>
            ) : (
              filteredTurfs.map((turf) => (
                <motion.div 
                  key={turf.id}
                  layoutId={`card-${turf.id}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTurf(turf)}
                  className="bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm group cursor-pointer card-shadow-hover transition-all duration-500"
                >
                  <div className="relative h-56">
                    <img 
                      src={turf.image_url} 
                      alt={turf.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-zinc-900">{getTurfRating(turf) != null ? getTurfRating(turf).toFixed(1) : '-'}</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] shadow-sm">
                      {turf.feedback_count || 0} feedback
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {turf.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-zinc-900 text-lg leading-tight">{turf.name}</h3>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-emerald-600 font-black text-xl">{formatCurrency(turf.price_per_hour)}</span>
                        <span className="text-zinc-400 text-[10px] font-bold">/hr</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isDesktopViewport) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-6">
        <div className="max-w-4xl w-full rounded-[2rem] border border-white/10 bg-zinc-900/95 p-10 shadow-2xl shadow-black/40">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-400 font-bold mb-3">Turf Mobile</p>
                <h1 className="text-4xl sm:text-5xl font-display font-bold text-white">Built for mobile booking and Android deployment</h1>
              </div>
              <p className="text-zinc-300 leading-relaxed text-base sm:text-lg">
                Turf Mobile is a mobile-first booking experience. This desktop browser view is intentionally simplified while we keep the main user flow optimized for phones and the Android Capacitor app.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <h2 className="text-sm font-semibold text-emerald-300 mb-2">Mobile-first design</h2>
                  <p className="text-zinc-400 text-sm">Best experience on portrait mobile screens with touch-friendly booking flows.</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                  <h2 className="text-sm font-semibold text-emerald-300 mb-2">Android app ready</h2>
                  <p className="text-zinc-400 text-sm">Use the Android build for offline-friendly turf search, booking, and owner management.</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <h2 className="text-sm font-semibold text-emerald-300 mb-2">What works here</h2>
                <ul className="space-y-2 text-zinc-400 text-sm list-disc list-inside">
                  <li>Explore available turfs</li>
                  <li>Review pricing, ratings, and feedback</li>
                  <li>Learn about phone-first booking flow</li>
                </ul>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-inner shadow-black/20">
              <div className="mb-6 rounded-[1.75rem] bg-zinc-900/80 p-6 border border-white/5">
                <h2 className="text-xl font-semibold text-white mb-3">Get the Android app</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Install the Android version for the full Turf Mobile experience, including camera, location, booking, and notifications.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-3xl bg-zinc-900/70 border border-white/5 p-4">
                    <Wifi size={20} className="text-emerald-400" />
                    <span className="text-sm text-zinc-300">Fast native booking performance</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl bg-zinc-900/70 border border-white/5 p-4">
                    <CalendarDays size={20} className="text-emerald-400" />
                    <span className="text-sm text-zinc-300">Live slot availability</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-3xl bg-zinc-900/70 border border-white/5 p-4">
                    <Users size={20} className="text-emerald-400" />
                    <span className="text-sm text-zinc-300">Owner & admin dashboards</span>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h3 className="text-sm uppercase tracking-[0.25em] text-emerald-300 font-semibold mb-2">Tip</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  If you want to try the native workflow, deploy the Android build from GitHub Releases or use `npm run android:debug` locally with a connected device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-100 min-h-screen font-sans">
      <div
        className="mobile-container overflow-y-auto"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex items-center justify-center text-xs text-zinc-500 transition-all duration-200"
          style={{ height: pullDistance > 0 || isRefreshing ? 40 : 0, opacity: pullDistance > 0 || isRefreshing ? 1 : 0 }}
        >
          {isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull down to refresh'}
        </div>
        {showRotateWarning && (
          <div className="mx-6 mt-6 p-4 rounded-3xl bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm shadow-sm text-center">
            For the best experience, rotate your phone back to portrait mode. The app is optimized for mobile portrait view.
          </div>
        )}
        <AnimatePresence mode="wait">
          {!selectedTurf ? (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {renderContent()}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-1 flex flex-col bg-white"
            >
              {/* Detail Header */}
              <div className="relative h-96">
                <motion.img 
                  layoutId={`image-${selectedTurf.id}`}
                  src={selectedTurf.image_url} 
                  alt={selectedTurf.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute top-8 left-6 right-6 flex justify-between z-50">
                  <button 
                    onClick={() => setSelectedTurf(null)}
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-zinc-900 shadow-xl active:scale-90 transition-all border border-zinc-100"
                  >
                    <ArrowLeft size={24} strokeWidth={3} />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                    <Users size={20} />
                  </button>
                </div>
                <div className="absolute bottom-10 left-8 right-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {selectedTurf.type}
                    </span>
                    <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 text-white border border-white/20">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold">{getTurfRating(selectedTurf) != null ? getTurfRating(selectedTurf).toFixed(1) : '-'}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-white border border-white/20">
                      {selectedTurf.feedback_count || 0} reviews
                    </div>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white leading-tight tracking-tight">
                    {selectedTurf.name}
                  </h2>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 bg-white rounded-t-[3rem] -mt-10 p-8 relative z-10 shadow-2xl overflow-y-auto">
                <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-100 flex flex-col items-center gap-1">
                    <Clock size={20} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Open</span>
                    <span className="text-xs font-bold text-zinc-900">06 AM - 11 PM</span>
                  </div>
                  <div className="flex-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-100 flex flex-col items-center gap-1">
                    <Trophy size={20} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Level</span>
                    <span className="text-xs font-bold text-zinc-900">Pro Grade</span>
                  </div>
                  <div className="flex-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-100 flex flex-col items-center gap-1">
                    <Users size={20} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Size</span>
                    <span className="text-xs font-bold text-zinc-900">5-a-side</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-display font-bold text-zinc-900 mb-3 text-lg">Description</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                    {selectedTurf.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="font-display font-bold text-zinc-900 mb-3 text-lg">Games Supported</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTurf.games?.map((game) => (
                      <span key={game} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        {game}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="font-display font-bold text-zinc-900 mb-4 text-lg">Amenities</h3>
                  {selectedTurf.amenities && selectedTurf.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTurf.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={16} />
                          </div>
                          <span className="text-xs font-bold text-zinc-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 text-center">
                      <p className="text-xs font-bold text-zinc-400">No amenities listed for this turf</p>
                    </div>
                  )}
                </div>

                <div className="mb-10">
                  <h3 className="font-display font-bold text-zinc-900 mb-4 text-lg">Available Slots for {new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</h3>
                  {hiddenSlotsForDate.length > 0 && (
                    <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      {hiddenSlotsForDate.length} slot{hiddenSlotsForDate.length > 1 ? 's' : ''} hidden for {new Date(selectedDate).toLocaleDateString('en-GB')}:
                      <ul className="mt-3 list-disc list-inside text-amber-800">
                        {hiddenSlotsForDate.map((block) => (
                          <li key={`${block.date}-${block.start}-${block.end}`}>
                            {block.start} - {block.end} ({block.reason})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {visibleSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {visibleSlots.map((slot, idx) => (
                        <div key={idx} className="flex flex-col p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-zinc-700">{slot.start} - {slot.end}</span>
                          </div>
                          <span className="text-sm font-black text-emerald-600">{formatCurrency(slot.price)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200 text-center">
                      <p className="text-xs font-bold text-zinc-400">No slots available for the selected date</p>
                    </div>
                  )}
                </div>

                {/* Pricing & Action */}
                <div className="mt-auto pt-6 flex flex-col gap-4 sticky bottom-0 bg-white/80 backdrop-blur-lg pb-6 px-2 -mx-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest block mb-1">Starting from</span>
                      <span className="text-3xl font-black text-emerald-600">{formatCurrency(selectedTurf.price_per_hour)}</span>
                    </div>
                    <button 
                      onClick={() => setIsBooking(true)}
                      className="bg-zinc-900 text-white px-10 py-5 rounded-[2rem] font-bold shadow-2xl shadow-zinc-900/40 active:scale-95 hover:bg-emerald-600 transition-all duration-500 flex items-center gap-2"
                    >
                      <span>Book Now</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTurf(null);
                      setFeedbackTurf(selectedTurf);
                      setActiveTab('feedback');
                    }}
                    className="w-full text-center bg-zinc-100 text-zinc-900 py-4 rounded-[2rem] font-bold border border-zinc-200 hover:bg-zinc-200 transition-all"
                  >
                    View Feedback for this Turf
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        {!selectedTurf && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[400px] z-30">
            <nav className="bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center shadow-2xl border border-white/10">
              <button 
                onClick={() => setActiveTab('home')}
                className={cn(
                  "flex items-center justify-center gap-2 h-14 rounded-3xl transition-all duration-300 flex-1",
                  activeTab === 'home' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500"
                )}
              >
                <Home size={20} className="flex-shrink-0" />
                {activeTab === 'home' && <span className="text-xs font-bold whitespace-nowrap">Home</span>}
              </button>
              
              {(isOwner || isAdmin) && (
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={cn(
                    "flex items-center justify-center gap-2 h-14 rounded-3xl transition-all duration-300 flex-1",
                    activeTab === 'dashboard' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500"
                  )}
                >
                  <LayoutDashboard size={20} className="flex-shrink-0" />
                  {activeTab === 'dashboard' && <span className="text-xs font-bold whitespace-nowrap">{isAdmin ? 'Admin' : 'Manage'}</span>}
                </button>
              )}

              <button
                onClick={() => setActiveTab('bookings')}
                className={cn(
                  "flex items-center justify-center gap-2 h-14 rounded-3xl transition-all duration-300 flex-1",
                  activeTab === 'bookings' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500"
                )}
              >
                <CalendarDays size={20} className="flex-shrink-0" />
                {activeTab === 'bookings' && <span className="text-xs font-bold whitespace-nowrap">Bookings</span>}
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={cn(
                  "flex items-center justify-center gap-2 h-14 rounded-3xl transition-all duration-300 flex-1",
                  activeTab === 'feedback' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500"
                )}
              >
                <MessageCircle size={20} className="flex-shrink-0" />
                {activeTab === 'feedback' && <span className="text-xs font-bold whitespace-nowrap">Feedback</span>}
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  "flex items-center justify-center gap-2 h-14 rounded-3xl transition-all duration-300 flex-1",
                  activeTab === 'calendar' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500"
                )}
              >
                <Calendar size={20} className="flex-shrink-0" />
                {activeTab === 'calendar' && <span className="text-xs font-bold whitespace-nowrap">Calendar</span>}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "flex items-center justify-center gap-2 h-14 rounded-3xl transition-all duration-300 flex-1",
                  activeTab === 'profile' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500"
                )}
              >
                <User size={20} className="flex-shrink-0" />
                {activeTab === 'profile' && <span className="text-xs font-bold whitespace-nowrap">Profile</span>}
              </button>
            </nav>
          </div>
        )}

        {/* Booking Modal */}
        <AnimatePresence>
          {isBooking && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-backdrop"
                onClick={() => setIsBooking(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[3rem] p-8 viewport-scroll"
              >
                <div className="w-16 h-1.5 bg-zinc-100 rounded-full mx-auto mb-10"></div>
                
                {paymentStep ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                      <button 
                        onClick={() => setPaymentStep(false)}
                        className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-sm active:scale-90 transition-all"
                      >
                        <ArrowLeft size={20} strokeWidth={3} />
                      </button>
                      <h2 className="text-2xl font-display font-bold text-zinc-900">Checkout</h2>
                    </div>

                    <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">Booking Summary</p>
                        <h3 className="text-xl font-bold mb-1">{selectedTurf.name}</h3>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Date</p>
                            <p className="text-sm font-bold">{new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Time</p>
                            <p className="text-sm font-bold">{selectedSlot.start} - {selectedSlot.end}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 ml-2">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 rounded-3xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center gap-3 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-8" />
                          </div>
                          <span className="text-xs font-bold text-emerald-600">UPI Pay</span>
                        </button>
                        <button className="p-6 rounded-3xl border-2 border-zinc-100 bg-zinc-50 flex flex-col items-center gap-3 opacity-50 grayscale">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                            <Settings size={20} className="text-zinc-400" />
                          </div>
                          <span className="text-xs font-bold text-zinc-400">Card</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-100">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-zinc-400 font-bold">Total Amount</span>
                        <span className="text-2xl font-black text-zinc-900">{formatCurrency(selectedSlot.price)}</span>
                      </div>
                      <button 
                        onClick={handleBooking}
                        className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
                      >
                        Confirm & Pay
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-display font-bold text-zinc-900">Select Slot</h2>
                        <p className="text-zinc-400 text-xs font-medium">Choose your preferred time</p>
                      </div>
                      <button 
                        onClick={() => setIsBooking(false)}
                        className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      {visibleSlots.map((slot, idx) => {
                        const booking = bookedSlots.find(b => {
                          const bStart = new Date(b.start_time);
                          return bStart.getHours() === parseInt(slot.start.split(':')[0], 10) && 
                                 bStart.getMinutes() === parseInt(slot.start.split(':')[1], 10);
                        });
                        const isBooked = !!booking;
                        const isPending = booking?.status === 'pending';

                        return (
                          <button 
                            key={idx}
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "py-4 px-2 rounded-2xl border-2 text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex flex-col items-center gap-1",
                              selectedSlot === slot 
                                ? "border-emerald-500 bg-emerald-50 text-emerald-600 scale-105" 
                                : isBooked 
                                  ? "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                                  : "border-zinc-50 bg-zinc-50 text-zinc-500"
                            )}
                          >
                            <span>{slot.start} - {slot.end}</span>
                            <span className="text-xs">{formatCurrency(slot.price)}</span>
                            {isBooked && (
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded-full",
                                isPending ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                              )}>
                                {isPending ? 'Pending' : 'Booked'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {visibleSlots.length === 0 && (
                        <p className="col-span-2 text-center text-zinc-400 text-xs py-4">No slots are available today; some hours may be hidden or already booked.</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-6 bg-zinc-900 rounded-[2rem] border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Payable</span>
                          <span className="text-2xl font-black text-white">{formatCurrency(selectedSlot?.price || 0)}</span>
                        </div>
                        <button 
                          onClick={() => selectedSlot ? setPaymentStep(true) : alert('Please select a slot')}
                          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          Continue
                        </button>
                      </div>
                      <button 
                        onClick={() => { setIsBooking(false); setSelectedSlot(null); }}
                        className="w-full text-zinc-400 py-2 text-xs font-bold uppercase tracking-widest"
                      >
                        Go Back
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mock Payment Gateway Overlay */}
        <AnimatePresence>
          {isProcessingPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-full max-w-sm space-y-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-zinc-100 border-t-emerald-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-10 opacity-50 grayscale" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-zinc-900">Processing Payment</h2>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                    Please do not close the app or press the back button. We are securely processing your transaction with your bank.
                  </p>
                </div>

                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-400 uppercase tracking-widest">Merchant</span>
                    <span className="text-zinc-900">TurfBook India</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-400 uppercase tracking-widest">Amount</span>
                    <span className="text-emerald-600">{formatCurrency(selectedSlot?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-400 uppercase tracking-widest">Ref No.</span>
                    <span className="text-zinc-900 font-mono">TXN{Math.floor(Math.random() * 1000000)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-zinc-300">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ticket Modal */}
        <TicketModal showTicket={showTicket} onClose={closeTicket} />

        {selectedCancellation && (
          <CancellationModal
            booking={selectedCancellation}
            onClose={() => setSelectedCancellation(null)}
            onConfirm={handleCancelConfirm}
          />
        )}

        {/* QR Code Scanner Modal */}
        <AnimatePresence>
          {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-2xl rounded-3xl border border-red-200 bg-white p-10 shadow-lg shadow-red-100/50">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Supabase configuration is missing</h1>
          <p className="text-zinc-700 mb-4">
            The app requires the following environment variables to connect to Supabase:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li><code>VITE_SUPABASE_URL</code></li>
            <li><code>VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="mt-6 text-zinc-600">
            Add them to your <code>.env.local</code> file for local development, or configure them as GitHub repository secrets for CI/deploy.
          </p>
        </div>
      </div>
    );
  }

  return <AppContent />;
}
