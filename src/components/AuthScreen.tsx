import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Github, 
  Chrome, 
  Loader2, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  ShieldCheck,
  Send,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface AuthScreenProps {
  onBypass?: (role: string) => void;
}

type AuthView = 'login' | 'register' | 'forgot-password';

export default function AuthScreen({ onBypass }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'provider'>('driver');
  const [error, setError] = useState<string | null>(null);

  // Tanzanian Phone Number Validation
  // Local: 07XXXXXXXX or 06XXXXXXXX (10 digits)
  // International: +2557XXXXXXXX or +2556XXXXXXXX (13 chars)
  const validateTZPhone = (num: string) => {
    const tzRegex = /^(?:\+255|0)[67]\d{8}$/;
    return tzRegex.test(num.replace(/\s/g, ''));
  };

  const handleGoogleSignIn = async (forcedRole?: string) => {
    setLoading(true);
    setError(null);

    // Developer Bypass Logic
    if (forcedRole && onBypass) {
      toast.info(`Bypassing as ${forcedRole}...`);
      setTimeout(() => {
        onBypass(forcedRole);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Failed to sign in with Google');
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      toast.success('Password reset link sent to your email!');
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
      toast.error('Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate Phone for Registration
    if (view === 'register' && !validateTZPhone(phone)) {
      setError('Invalid Tanzanian phone number. Use 07... or +255...');
      setLoading(false);
      return;
    }

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success('Karibu tena! Welcome back.');
      } else if (view === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              role: selectedRole,
              vehicle_info: selectedRole === 'driver' ? {
                make: vehicleMake,
                model: vehicleModel,
                plate: vehiclePlate,
                color: vehicleColor
              } : null
            }
          }
        });
        if (error) throw error;
        toast.success('Account created! Please check your email.');
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setError(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-slate-yellow rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.08, 0.05] 
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-viyeko-red rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 space-y-8 relative z-10 border border-subtle shadow-[0_0_50px_rgba(0,0,0,0.5)] edge-lighting"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black italic tracking-tighter text-slate-yellow drop-shadow-lg"
          >
            VIYEKO
          </motion.h1>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-100 italic uppercase tracking-tight">
              {view === 'login' ? 'Member Login' : view === 'register' ? 'Join Network' : 'Reset Access'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {view === 'login' ? 'Secure access to assistance' : view === 'register' ? 'Tanzania\'s best rescue network' : 'Enter your registered email'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        {view !== 'forgot-password' && (
          <div className="flex bg-subtle p-1 rounded-full border border-subtle shadow-inner">
            <button 
              onClick={() => { setView('login'); setError(null); }}
              className={cn(
                "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                view === 'login' ? "bg-slate-yellow text-charcoal shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setView('register'); setError(null); }}
              className={cn(
                "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                view === 'register' ? "bg-slate-yellow text-charcoal shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Register
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-viyeko-red/10 border border-viyeko-red/20 rounded-full p-3 flex items-center gap-3 text-viyeko-red"
            >
              <AlertCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'forgot-password' ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Mail size={12} className="text-slate-yellow" />
                Registered Email
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@viyeko.com"
                className="input-viyeko w-full h-14 text-sm tracking-tight"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-viyeko-primary w-full h-14 shadow-xl shadow-slate-yellow/10"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-widest">Send Reset Link</span>
                  <Send size={18} />
                </div>
              )}
            </button>
            <button 
              type="button"
              onClick={() => setView('login')}
              className="w-full text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            {view === 'register' && (
              <div className="space-y-6 pt-2 border-b border-subtle pb-6 mb-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Select Account Type</label>
                  <div className="flex bg-subtle p-1 rounded-2xl border border-subtle">
                    <button 
                      type="button"
                      onClick={() => setSelectedRole('driver')}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        selectedRole === 'driver' ? "bg-slate-yellow text-charcoal shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      Driver
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedRole('provider')}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        selectedRole === 'provider' ? "bg-slate-yellow text-charcoal shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      Rescue Garage
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                    <LogIn size={12} className="text-slate-yellow" />
                    {selectedRole === 'driver' ? 'Legal Full Name' : 'Garage / Business Name'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'driver' ? "e.g. Rahul Singh" : "e.g. Punjab Auto Care"}
                    className="input-viyeko w-full h-14 text-sm tracking-tight"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                    <Phone size={12} className="text-slate-yellow" />
                    TZ Phone Number
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07XXXXXXXX"
                    className="input-viyeko w-full h-14 text-sm tracking-tight"
                  />
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest ml-1">Must start with 06, 07 or +255</p>
                </div>

                {selectedRole === 'driver' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Make</label>
                        <input 
                          type="text" 
                          required
                          value={vehicleMake}
                          onChange={(e) => setVehicleMake(e.target.value)}
                          placeholder="Toyota"
                          className="input-viyeko w-full h-14 text-sm tracking-tight"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Model</label>
                        <input 
                          type="text" 
                          required
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="Land Cruiser"
                          className="input-viyeko w-full h-14 text-sm tracking-tight"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Plate</label>
                        <input 
                          type="text" 
                          required
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value)}
                          placeholder="T 123 ABC"
                          className="input-viyeko w-full h-14 text-sm tracking-tight uppercase"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Color</label>
                        <input 
                          type="text" 
                          required
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                          placeholder="White"
                          className="input-viyeko w-full h-14 text-sm tracking-tight"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                <Mail size={12} className="text-slate-yellow" />
                Email Identity
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@viyeko.com"
                className="input-viyeko w-full h-14 text-sm tracking-tight"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Lock size={12} className="text-slate-yellow" />
                  Access Key
                </label>
                {view === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setView('forgot-password'); setError(null); }}
                    className="text-[9px] font-black text-slate-600 hover:text-slate-yellow uppercase tracking-tighter transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-viyeko w-full h-14 text-sm tracking-tight"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-viyeko-primary w-full h-14 shadow-xl shadow-slate-yellow/10"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-widest">
                    {view === 'login' ? 'Authorize Entry' : 'Create Profile'}
                  </span>
                  <LogIn size={20} className="ml-1" />
                </div>
              )}
            </button>
          </form>
        )}

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-subtle"></div>
          </div>
          <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
            <span className="bg-charcoal px-6 text-slate-500">Digital Passport</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGoogleSignIn('driver')}
            className="flex items-center justify-center gap-3 p-4 bg-subtle border border-subtle rounded-full transition-all text-[10px] font-black text-slate-300 uppercase tracking-widest shadow-lg"
          >
            <Chrome size={18} className="text-slate-yellow" />
            Bypass Driver
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGoogleSignIn('provider')}
            className="flex items-center justify-center gap-3 p-4 bg-subtle border border-subtle rounded-full transition-all text-[10px] font-black text-slate-300 uppercase tracking-widest shadow-lg"
          >
            <ShieldCheck size={18} className="text-emerald-500" />
            Bypass Garage
          </motion.button>
        </div>

        <div className="pt-2">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-full p-4 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-2 rounded-full">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <p className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-wider leading-relaxed">
              Your connection is secured with end-to-end encryption for Tanzania operations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
