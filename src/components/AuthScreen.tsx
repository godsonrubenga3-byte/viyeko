import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle, 
  Phone, 
  ShieldCheck,
  Send,
  Chrome,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

type AuthView = 'login' | 'register';

export default function AuthScreen() {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Google Sign-In Failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back to VIYEKO!');
      } else {
        // REGISTER FLOW
        // 1. Auth Sign Up
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: name
            }
          }
        });

        if (authError) throw authError;
        toast.success('Account created! Please check your email for verification.');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Aesthetic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-1/2 h-1/2 bg-slate-yellow/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-1/2 h-1/2 bg-rose-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 space-y-8 relative z-10 border-slate-800/50"
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-yellow uppercase">VIYEKO</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Emergency Response Network</p>
        </div>

        {/* Unified View Toggles */}
        <div className="flex bg-slate-900/50 p-1 rounded-full border border-slate-800 shadow-inner">
          <button 
            onClick={() => setView('login')}
            className={cn(
              "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              view === 'login' ? "bg-slate-yellow text-slate-950 shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Sign In
          </button>
          <button 
            onClick={() => setView('register')}
            className={cn(
              "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              view === 'register' ? "bg-slate-yellow text-slate-950 shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {view === 'register' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Juma Makoye"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-viyeko w-full font-bold"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="e.g. juma@viyeko.tz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-viyeko w-full pl-12 font-bold"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-viyeko w-full pl-12 font-bold"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-viyeko-primary w-full h-16 shadow-xl shadow-slate-yellow/10"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase tracking-widest font-black">
                  {view === 'login' ? 'Authorize Access' : 'Initialize Profile'}
                </span>
                <LogIn size={20} />
              </div>
            )}
          </button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800/50"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="bg-slate-950 px-4 text-slate-600">Secure OAuth</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-14 bg-white text-slate-950 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors"
        >
          <Chrome size={20} />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
