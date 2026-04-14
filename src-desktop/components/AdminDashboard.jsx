import { useState, useEffect } from 'react';
import { Users, Calendar, Trash2, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn, formatCurrency } from '../lib/utils';
import AppAvatar from './common/AppAvatar';

/**
 * Render the admin dashboard UI with overview, bookings, turfs, and users tabs.
 *
 * On mount, loads aggregated counts, recent bookings, turfs list, confirmed revenue, and pending bookings from Supabase and updates internal state; includes a Refresh button and local filtering for bookings.
 *
 * @returns {JSX.Element} The Admin Dashboard UI component.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, turfs: 0, bookings: 0, revenue: 0, pendingBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [allTurfs, setAllTurfs] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const [usersCount, turfsCount, bookingsCount, bookings, turfs, revenueData, pendingCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('turfs').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*, turfs(*), profiles(*)').order('created_at', { ascending: false }).limit(10),
        supabase.from('turfs').select('*, owner:profiles(*)'),
        supabase.from('bookings').select('total_price').eq('status', 'confirmed'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        users: usersCount.count || 0,
        turfs: turfsCount.count || 0,
        bookings: bookingsCount.count || 0,
        revenue: revenueData.data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
        pendingBookings: pendingCount.count || 0
      });
      setRecentBookings(bookings.data || []);
      setAllTurfs(turfs.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = recentBookings.filter(booking => {
    if (bookingFilter === 'pending') return booking.status === 'pending';
    if (bookingFilter === 'confirmed') return booking.status === 'confirmed';
    return true;
  });

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="admin-dashboard flex-1 p-6 pb-24 bg-zinc-50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h2>
        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-white flex items-center gap-2 transition-all text-xs font-bold uppercase hover:bg-emerald-600"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-zinc-200">
        {['overview', 'bookings', 'turfs', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 px-1 border-b-2 font-bold text-sm transition-all capitalize",
              activeTab === tab
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid with Alerts */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                <Users size={20} />
              </div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Users</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.users}</p>
              <p className="text-xs text-zinc-500 mt-1">Active members</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Turfs</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.turfs}</p>
              <p className="text-xs text-zinc-500 mt-1">Available grounds</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-2 relative">
                <Calendar size={20} />
                {stats.pendingBookings > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {stats.pendingBookings}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bookings</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.bookings}</p>
              <p className="text-xs text-red-600 mt-1 font-bold">{stats.pendingBookings} pending</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 flex-shrink-0">
                <span className="font-bold text-lg">₹</span>
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.revenue)}</p>
              <p className="text-xs text-emerald-400 mt-1">Total earned</p>
            </div>
          </div>

          {/* Alert Section */}
          {stats.pendingBookings > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-900">Action Required</p>
                <p className="text-xs text-amber-800">{stats.pendingBookings} booking(s) awaiting confirmation from turf owners</p>
              </div>
            </div>
          )}

          {/* Recent Bookings Preview */}
          <section>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentBookings.slice(0, 5).map(booking => (
                <div key={booking.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AppAvatar
                      src={booking.profiles?.avatar_url}
                      name={booking.profiles?.full_name}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{booking.profiles?.full_name}</p>
                      <p className="text-[10px] text-zinc-500">{booking.turfs?.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider",
                      booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-600" :
                      booking.status === 'pending' ? "bg-amber-100 text-amber-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {booking.status === 'confirmed' ? <CheckCircle2 size={12} /> :
                       booking.status === 'pending' ? <Clock size={12} /> : null}
                      {booking.status}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(booking.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <section>
          <div className="flex gap-3 mb-6">
            {['all', 'pending', 'confirmed'].map(filter => (
              <button
                key={filter}
                onClick={() => setBookingFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                  bookingFilter === filter
                    ? "bg-emerald-500 text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                )}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} ({
                  filter === 'all' ? stats.bookings :
                  filter === 'pending' ? stats.pendingBookings :
                  stats.bookings - stats.pendingBookings
                })
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <p className="text-center text-zinc-400 py-8">No bookings found</p>
            ) : (
              filteredBookings.map(booking => (
                <div key={booking.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">{booking.profiles?.full_name}</p>
                      <p className="text-xs text-zinc-500">{booking.turfs?.name} • {new Date(booking.start_time).toLocaleDateString()}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                      booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600">{formatCurrency(booking.total_price)} • {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Turfs Tab */}
      {activeTab === 'turfs' && (
        <section>
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-zinc-500 uppercase text-[10px]">Turf</th>
                  <th className="px-4 py-3 font-bold text-zinc-500 uppercase text-[10px]">Owner</th>
                  <th className="px-4 py-3 font-bold text-zinc-500 uppercase text-[10px]">Price/hr</th>
                  <th className="px-4 py-3 font-bold text-zinc-500 uppercase text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {allTurfs.map(turf => (
                  <tr key={turf.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-zinc-900">{turf.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-zinc-700">{turf.owner?.full_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-emerald-600">{formatCurrency(turf.price_per_hour)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this turf?')) {
                            try {
                              const { error } = await supabase.from('turfs').delete().eq('id', turf.id);
                              if (error) throw error;
                              fetchAdminData();
                            } catch (err) {
                              alert(err.message);
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <section>
          <p className="text-center text-zinc-400 py-8">User management coming soon. Currently displaying {stats.users} total users.</p>
        </section>
      )}
    </div>
  );
}
