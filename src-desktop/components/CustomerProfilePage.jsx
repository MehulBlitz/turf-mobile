import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2, Save, X, Mail, Bell, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { validatePhone, validateFullName } from '../utils/validation';
import AppAvatar from './common/AppAvatar';

export default function CustomerProfilePage({ profile, onClose, onUpdate, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    preferred_city: profile?.preferred_city || 'Hyderabad'
  });

  const popularCities = ['Hyderabad', 'Mumbai', 'Bangalore', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];

  const validateForm = () => {
    const newErrors = {};

    if (!validateFullName(formData.full_name)) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must be a valid 10-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onUpdate({
        full_name: formData.full_name,
        phone: formData.phone,
        preferred_city: formData.preferred_city,
        updated_at: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col pb-24 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-zinc-100 z-10">
        <div className="p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-zinc-900">My Profile</h2>
          <button
            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex justify-center">
          <AppAvatar
            src={profile?.avatar_url}
            name={profile?.full_name}
            email={profile?.email}
            size="xl"
            className="border-4 border-white shadow-lg"
          />
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Email</label>
            <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
              <Mail size={18} className="text-zinc-400" />
              <p className="text-sm font-medium text-zinc-900">{profile?.email || 'Not provided'}</p>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Your email cannot be changed</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              className={cn(
                "w-full p-4 rounded-2xl border transition-all text-sm font-medium",
                isEditing
                  ? "bg-white border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  : "bg-zinc-50 border-transparent text-zinc-600"
              )}
            />
            {errors.full_name && <p className="text-xs text-red-500 mt-2">{errors.full_name}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="p-4 bg-zinc-50 rounded-2xl text-zinc-600 font-medium text-sm">+91</span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                disabled={!isEditing}
                placeholder="0000000000"
                className={cn(
                  "flex-1 p-4 rounded-2xl border transition-all text-sm font-medium",
                  isEditing
                    ? "bg-white border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    : "bg-zinc-50 border-transparent text-zinc-600"
                )}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-2">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Preferred City</label>
            <select
              value={formData.preferred_city}
              onChange={(e) => setFormData({ ...formData, preferred_city: e.target.value })}
              disabled={!isEditing}
              className={cn(
                "w-full p-4 rounded-2xl border transition-all text-sm font-medium appearance-none",
                isEditing
                  ? "bg-white border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  : "bg-zinc-50 border-transparent text-zinc-600"
              )}
            >
              {popularCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 space-y-3">
          <h3 className="font-bold text-zinc-900 mb-4">Account Settings</h3>

          <button className="w-full p-4 hover:bg-zinc-50 rounded-2xl flex items-center justify-between font-medium text-zinc-900 transition-colors border border-transparent hover:border-zinc-100">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-zinc-400" />
              <span>Notifications</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold">ON</span>
          </button>

          <button className="w-full p-4 hover:bg-zinc-50 rounded-2xl flex items-center justify-between font-medium text-zinc-900 transition-colors border border-transparent hover:border-zinc-100">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-zinc-400" />
              <span>Change Password</span>
            </div>
          </button>
        </div>

        {/* Member Info */}
        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 space-y-2">
          <p className="text-sm font-bold text-emerald-900">Member Since 2024</p>
          <p className="text-xs text-emerald-800">
            Welcome to TurfBook! You&apos;ve made {0} bookings so far.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-2xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </motion.div>
  );
}
