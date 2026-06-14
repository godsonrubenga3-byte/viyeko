import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, UserPlus, Github, Chrome, Loader2, ArrowLeft, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface AuthScreenProps {
  onBack?: () => void;
}

export default function AuthScreen({ onBack }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success('Welcome back!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
              vehicle_info: {
                make: vehicleMake,
                model: vehicleModel,
                plate: vehiclePlate,
                color: vehicleColor
              }
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
              {isLogin ? 'Member Login' : 'Join Network'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {isLogin ? 'Secure access to assistance' : 'Experience Punjab\'s best service'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-subtle p-1 rounded-full border border-subtle shadow-inner">
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={cn(
              "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              isLogin ? "bg-slate-yellow text-charcoal shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={cn(
              "flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              !isLogin ? "bg-slate-yellow text-charcoal shadow-lg" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Register
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
          {!isLogin && (
            <div className="space-y-4 pt-2 border-b border-subtle pb-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                  <LogIn size={12} className="text-slate-yellow" />
                  Legal Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Godson Rubenga"
                  className="input-viyeko w-full h-14 text-sm tracking-tight"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                  <Phone size={12} className="text-slate-yellow" />
                  Primary Phone
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="input-viyeko w-full h-14 text-sm tracking-tight"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Make</label>
                  <input 
                    type="text" 
                    required
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Maruti"
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
                    placeholder="Swift"
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
                    placeholder="CH01-XX-0000"
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
              placeholder="e.g. rubenga@viyeko.com"
              className="input-viyeko w-full h-14 text-sm tracking-tight"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                <Lock size={12} className="text-slate-yellow" />
                Access Key
              </label>
              {isLogin && <button type="button" className="text-[9px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-tighter">Forgot?</button>}
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
                  {isLogin ? 'Authorize Entry' : 'Create Profile'}
                </span>
                <LogIn size={20} className="ml-1" />
              </div>
            )}
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="w-full text-[9px] font-black text-slate-700 hover:text-slate-500 uppercase tracking-[0.3em] py-2 transition-colors"
          >
            Bypass Authentication (Dev Mode)
          </button>
        </form>

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
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 p-4 bg-subtle border border-subtle rounded-full transition-all text-[10px] font-black text-slate-300 uppercase tracking-widest shadow-lg"
          >
            <Chrome size={18} className="text-slate-yellow" />
            Google
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-3 p-4 bg-subtle border border-subtle rounded-full transition-all text-[10px] font-black text-slate-300 uppercase tracking-widest shadow-lg"
          >
            <Github size={18} />
            GitHub
          </motion.button>
        </div>

        <div className="pt-2">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-full p-4 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-2 rounded-full">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <p className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-wider leading-relaxed">
              Your connection is secured with end-to-end encryption for Punjab region operations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
