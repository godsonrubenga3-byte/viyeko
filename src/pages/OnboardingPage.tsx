import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  ShieldCheck, 
  Phone as PhoneIcon, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Globe,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { COUNTRIES, getCountryByCode, Country } from '../lib/countries';
import { AsYouType, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

type OnboardingStep = 'role' | 'phone' | 'details' | 'success';

export default function OnboardingPage() {
  const { user, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('role');
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Data State
  const [role, setRole] = useState<'driver' | 'provider' | null>(null);
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [vehicle, setVehicle] = useState({ make: '', model: '', plate: '', color: '' });

  // IP Detection: Auto-detect country on mount
  React.useEffect(() => {
    const detectCountry = async () => {
      setIsDetecting(true);
      try {
        // Switching to ipwho.is which has better CORS support for free tier
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        if (data && data.country_code) {
          const country = getCountryByCode(data.country_code);
          setSelectedCountry(country);
        }
      } catch (err) {
        console.error('IP Detection failed (CORS or Network):', err);
        // Fallback to Tanzania if detection fails
        setSelectedCountry(COUNTRIES[0]);
      } finally {
        setIsDetecting(false);
      }
    };
    detectCountry();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Format as user types based on selected country
    const formatter = new AsYouType(selectedCountry.code as any);
    const formatted = formatter.input(input);
    setPhone(formatted);
  };

  const handleComplete = async () => {
    if (!user || !role) return;
    setLoading(true);

    try {
      // Validate with libphonenumber-js
      if (!isValidPhoneNumber(phone, selectedCountry.code as any)) {
        throw new Error(`Invalid phone number for ${selectedCountry.name}`);
      }

      // Parse to E.164 format for database consistency (+255712345678)
      const phoneNumber = parsePhoneNumberFromString(phone, selectedCountry.code as any);
      const e164Phone = phoneNumber?.format('E.164') || phone;

      // JSON Fix: Ensure vehicles is a structured array of objects
      const vehicleData = role === 'driver' ? [{
        id: crypto.randomUUID(),
        make: vehicle.make.trim(),
        model: vehicle.model.trim(),
        plate: vehicle.plate.trim().toUpperCase(),
        color: vehicle.color.trim()
      }] : [];

      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Member',
          role: role,
          phone: e164Phone,
          vehicles: vehicleData, // Sent as a clean object
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await refreshProfile();
      setStep('success');
      setTimeout(() => navigate(role === 'provider' ? '/provider' : '/'), 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps: Record<OnboardingStep, React.ReactNode> = {
    role: (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic uppercase text-slate-100">Pick Your Path</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">How will you use VIYEKO today?</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => { setRole('driver'); setStep('phone'); }}
            className="glass-card p-6 flex items-center gap-6 group hover:border-slate-yellow transition-all text-left"
          >
            <div className="p-4 rounded-2xl bg-slate-yellow/10 text-slate-yellow group-hover:scale-110 transition-transform">
              <Car size={32} />
            </div>
            <div>
              <h3 className="font-black text-slate-100 uppercase italic">I am a Driver</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">I need roadside assistance & rescue</p>
            </div>
          </button>
          <button 
            onClick={() => { setRole('provider'); setStep('phone'); }}
            className="glass-card p-6 flex items-center gap-6 group hover:border-emerald-500 transition-all text-left"
          >
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="font-black text-slate-100 uppercase italic">I am a Garage</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">I provide professional rescue services</p>
            </div>
          </button>
        </div>

        <div className="pt-4 text-center">
          <button 
            onClick={() => signOut()}
            className="text-[10px] font-black text-slate-700 hover:text-rose-500 uppercase tracking-[0.3em] transition-colors"
          >
            Not you? Log Out
          </button>
        </div>
      </div>
    ),
    phone: (
      <div className="space-y-8">
        <button onClick={() => setStep('role')} className="text-slate-500 hover:text-slate-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase text-slate-100">Contact Info</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isDetecting ? 'Detecting region...' : `International Rescue: ${selectedCountry.name}`}
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative flex gap-2">
              {/* Country Selector */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="h-14 bg-subtle border border-subtle rounded-2xl px-4 flex items-center gap-2 hover:border-slate-yellow transition-all min-w-[100px]"
                >
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span className="text-xs font-black text-slate-100 tracking-tighter">{selectedCountry.dialCode}</span>
                  <ChevronDown size={14} className={cn("text-slate-600 transition-transform", showCountryPicker && "rotate-180")} />
                </button>

                {showCountryPicker && (
                  <div className="absolute top-full left-0 mt-2 w-64 max-h-60 bg-charcoal border border-subtle rounded-2xl shadow-2xl overflow-y-auto z-[200] p-2 scrollbar-hide">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountryPicker(false);
                          setPhone(''); // Reset on country change
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl hover:bg-subtle transition-all text-left group",
                          selectedCountry.code === c.code && "bg-slate-yellow/10"
                        )}
                      >
                        <span className="text-xl">{c.flag}</span>
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-100 uppercase tracking-tight">{c.name}</p>
                          <p className="text-[9px] font-bold text-slate-500">{c.dialCode}</p>
                        </div>
                        {selectedCountry.code === c.code && <CheckCircle2 size={14} className="text-slate-yellow" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div className="relative flex-1">
                <input 
                  type="tel" 
                  autoFocus
                  placeholder="e.g. 07XXXXXXXX"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="input-viyeko w-full pl-12 font-bold"
                />
                <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-yellow" size={18} />
              </div>
            </div>
          </div>
          <button 
            onClick={() => role === 'driver' ? setStep('details') : handleComplete()}
            disabled={!phone || loading}
            className="btn-viyeko-primary w-full h-16 shadow-xl shadow-slate-yellow/10"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase tracking-widest font-black">
                  {role === 'driver' ? 'Next: Vehicle Info' : 'Complete Setup'}
                </span>
                <ChevronRight size={20} />
              </div>
            )}
          </button>
        </div>
      </div>
    ),
    details: (
      <div className="space-y-8">
        <button onClick={() => setStep('phone')} className="text-slate-500 hover:text-slate-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase text-slate-100">Vehicle Profile</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">What are you driving?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Make</label>
            <input placeholder="Toyota" value={vehicle.make} onChange={e => setVehicle({...vehicle, make: e.target.value})} className="input-viyeko text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model</label>
            <input placeholder="Rav4" value={vehicle.model} onChange={e => setVehicle({...vehicle, model: e.target.value})} className="input-viyeko text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plate #</label>
            <input placeholder="T 123 ABC" value={vehicle.plate} onChange={e => setVehicle({...vehicle, plate: e.target.value.toUpperCase()})} className="input-viyeko text-xs uppercase" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Color</label>
            <input placeholder="Silver" value={vehicle.color} onChange={e => setVehicle({...vehicle, color: e.target.value})} className="input-viyeko text-xs" />
          </div>
        </div>
        <button 
          onClick={handleComplete}
          disabled={loading || !vehicle.make || !vehicle.plate}
          className="btn-viyeko-primary w-full h-16 shadow-xl shadow-slate-yellow/10"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (
            <div className="flex items-center gap-3">
              <span className="text-sm uppercase tracking-widest font-black">Finalize Onboarding</span>
              <CheckCircle2 size={20} />
            </div>
          )}
        </button>
      </div>
    ),
    success: (
      <div className="text-center space-y-6 py-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20"
        >
          <CheckCircle2 size={48} className="text-white" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic uppercase text-slate-100">Mission Ready</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Redirecting to command center...</p>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-slate-yellow/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        layout
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 min-h-[500px] flex flex-col justify-center border-slate-800/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Progress Dots */}
        {step !== 'success' && (
          <div className="flex justify-center gap-2 mt-8">
            {(['role', 'phone', 'details'] as OnboardingStep[]).map((s, i) => (
              role !== 'provider' || s !== 'details' ? (
                <div 
                  key={s}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    step === s ? "bg-slate-yellow w-6" : "bg-slate-800"
                  )}
                />
              ) : null
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
