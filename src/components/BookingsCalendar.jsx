import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function BookingsCalendar({ userId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshBookings = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, turfs(*)')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
      if (error) throw error;

      const normalized = (data || []).map((booking) => {
        const dateStr = booking.start_time ? new Date(booking.start_time).toISOString().split('T')[0] : null;
        return {
          ...booking,
          turfName: booking.turfs?.name || 'Unknown turf',
          location: booking.turfs?.location || 'Unknown location',
          date: dateStr,
          timeSlot: booking.start_time && booking.end_time
            ? `${new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : '',
          price: booking.total_price || 0,
        };
      });

      setBookings(normalized);
    } catch (err) {
      console.error('Error loading calendar bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBookings();
  }, [userId]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
    setSelectedDateBookings([]);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
    setSelectedDateBookings([]);
  };

  const handleSelectDate = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = selected.toISOString().split('T')[0];
    setSelectedDate(dateStr);

    const dayBookings = bookings.filter((b) => b.date === dateStr);
    setSelectedDateBookings(dayBookings);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  for (let i = 0; i < firstDay; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const bookingsForDisplay = bookings.filter((b) => {
    if (!b.date) return false;
    const bookingDate = new Date(b.date);
    return bookingDate.getMonth() === currentMonth.getMonth() && bookingDate.getFullYear() === currentMonth.getFullYear();
  });
  const daysWithBookings = new Set(bookingsForDisplay.map((b) => parseInt(b.date.split('-')[2], 10)));

  return (
    <div className="flex-1 flex flex-col pb-24">
      <header className="p-6 flex items-center gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200">
        <h2 className="text-xl font-display font-bold text-zinc-900">Bookings Calendar</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-lg font-bold text-zinc-900">{monthYear}</h3>
              <button
                onClick={handleNextMonth}
                className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-zinc-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  .toISOString()
                  .split('T')[0];
                const hasBookings = daysWithBookings.has(day);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDate(day)}
                    className={
                      `
                      aspect-square rounded-xl flex items-center justify-center font-semibold text-sm
                      transition-all duration-200
                      ${isSelected
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : hasBookings
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : isToday
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{day}</span>
                      {hasBookings && !isSelected && (
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-900">
                Bookings for {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h3>

              {selectedDateBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateBookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-2xl p-5 border-2 border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-zinc-900">{booking.turfName}</h4>
                            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400 mt-1">{booking.status}</p>
                          </div>
                          <div className="text-right text-sm text-zinc-500">
                            <p>{booking.timeSlot}</p>
                            <p>{booking.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                          <DollarSign size={16} className="text-emerald-600" />
                          <span>₹{Math.round(booking.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-50 rounded-2xl p-8 text-center">
                  <Clock size={32} className="mx-auto text-zinc-300 mb-3" />
                  <p className="text-zinc-500">No bookings on this date</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
              <p className="text-sm text-emerald-700 font-semibold mb-2">Total Bookings</p>
              <p className="text-3xl font-black text-emerald-600">{bookings.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">This Month</p>
              <p className="text-3xl font-black text-blue-600">{bookingsForDisplay.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <p className="text-sm text-orange-700 font-semibold mb-2">Total Spent</p>
              <p className="text-3xl font-black text-orange-600">
                ₹{Math.round(bookings.reduce((sum, b) => sum + (b.price || 0), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
