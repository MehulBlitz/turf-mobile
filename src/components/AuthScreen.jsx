import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Briefcase, ArrowRight, Loader2, Trophy, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cn } from '../lib/utils';

/**
 * Renders an authentication screen that supports email/password sign-in, email/password sign-up with role and full name, and Google OAuth sign-in using Supabase.
 *
 * This component handles login vs. signup flows, shows an email-confirmation overlay after sign-up, and displays Supabase configuration errors when environment variables are missing.
 *
 * @param {{ onAuthSuccess?: () => void }} props - Component props.
 * @param {() => void} [props.onAuthSuccess] - Called after a successful sign-in (not called after sign-up; sign-up shows an email confirmation overlay until the user verifies their email).
 * @returns {JSX.Element} The authentication UI.
 */
export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-10 shadow-lg shadow-red-100/50">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Supabase configuration missing</h1>
          <p className="text-zinc-600 mb-4">
            The app was built without the required Supabase environment variables. Please add the following secrets to your repository or local environment:
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-700">
            <li><code>VITE_SUPABASE_URL</code></li>
            <li><code>VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="mt-6 text-sm text-zinc-500">
            On GitHub Actions, add them under the repository secrets. Locally, add them to <code>.env.local</code>.
          </p>
        </div>
      </div>
    );
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              avatar_url: ''
            }
          }
        });
        if (error) throw error;
        setShowSuccess(true);
        return; // Don't call onAuthSuccess yet as they need to confirm email
      }
      onAuthSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOAuthRedirectUrl = () => {
    const origin = window.location.origin;
    if (origin === 'capacitor://localhost') {
      return 'https://localhost';
    }
    return origin;
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('googleAuthRole', role);
      const redirectTo = `${getOAuthRedirectUrl()}?google_role=${encodeURIComponent(role)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (err) {
      const errorMessage = err.message?.toString?.() || '';
      if (errorMessage.includes('Unsupported provider')) {
        setError('Google sign-in is not enabled in Supabase auth settings. Enable the Google provider in your Supabase project and add your app redirect URL.');
      } else if (errorMessage.includes('redirect_uri_mismatch')) {
        setError(`Google redirect URI mismatch. Add ${getOAuthRedirectUrl()} to your Supabase redirect URLs and authorize ${import.meta.env.VITE_SUPABASE_URL}/auth/v1/callback in Google Cloud.`);
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 justify-center bg-white">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Mail size={40} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">Check your email</h3>
              <p className="text-zinc-500 mb-8">
                We&apos;ve sent a confirmation link to <span className="font-bold text-zinc-900">{email}</span>. Please verify your email to continue.
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setIsLogin(true);
                }}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm mx-auto w-full"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-500/20">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isLogin ? 'Sign in to book your next match' : 'Join the community and start playing'}
          </p>
        </div>

        {!isLogin && (
          <div className="flex gap-2 mb-6 bg-zinc-100 p-1 rounded-2xl">
            {['customer', 'owner'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                  role === r ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500"
                )}
              >
                {r === 'customer' ? <Users size={14} className="inline mr-1" /> : <Briefcase size={14} className="inline mr-1" />}
                {r}
              </button>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="text-left text-sm font-semibold text-zinc-600 mb-2">I am a</div>
          <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl">
            {['customer', 'owner'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                type="button"
                className={cn(
                  'flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all',
                  role === r ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500'
                )}
              >
                {r === 'customer' ? <Users size={14} className="inline mr-1" /> : <Briefcase size={14} className="inline mr-1" />}
                {r}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium px-2">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <div className="text-zinc-500 text-xs uppercase tracking-[0.25em] mb-3">or continue with</div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-zinc-200 bg-white text-zinc-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-emerald-500 transition-all disabled:opacity-50"
          >
            <Users size={18} />
            Continue with Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 text-sm font-medium hover:text-emerald-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
