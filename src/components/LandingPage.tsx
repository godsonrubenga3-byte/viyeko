import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  Truck, 
  Wrench, 
  Fuel, 
  Flame, 
  Users, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Lock, 
  PhoneCall, 
  Activity, 
  Sparkles,
  Compass,
  Zap,
  Award,
  Sun,
  Moon,
  ArrowLeft,
  Database,
  CloudLightning,
  AlertCircle,
  Search,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

// Define rescuers info for the landing page explanation
const EXPERT_PROVIDERS = [
  {
    name: 'Francis Masanja',
    phone: '+255747746619',
    specialty: 'Heavy towing & vehicle rescue',
    vehicle: 'Flatbed Tow Truck',
    distance: '1.5 km',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    experience: '8+ Years',
    bio: 'Specialist in complex highway recovery, heavy flatbed logistics, and vehicle extraction. Certified master of mechanical recovery.'
  },
  {
    name: 'Godson Martin',
    phone: '+255750057757',
    specialty: 'Emergency logistics & roadside assist',
    vehicle: 'Mechanical Response Van',
    distance: '2.8 km',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300',
    experience: '6 Years',
    bio: 'Expert in mobile diagnostics, electrical repairs, and rapid roadside logistics. Known for resolving critical breakdowns under 15 minutes.'
  },
  {
    name: 'Michael Temu',
    phone: '+255751234567',
    specialty: 'Tyres & battery jumpstart expert',
    vehicle: 'Quick Rescue Motorcycle',
    distance: '4.1 km',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    experience: '5 Years',
    bio: 'Mobile tyre service and high-speed electrical jumpstarts. Michael operates a fast response motorcycle to bypass heavy traffic in Dar es Salaam.'
  }
];

const POPULAR_REGIONS = [
  "Dar es Salaam",
  "Arusha",
  "Dodoma",
  "Mwanza",
  "Zanzibar City",
  "Mbeya",
  "Morogoro"
];

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan / Hatchback' },
  { value: 'suv', label: 'SUV / 4x4' },
  { value: 'truck', label: 'Pickup / Commercial Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'electric', label: 'Electric / Hybrid' }
];

export default function LandingPage() {
  const [view, setView] = useState<'home' | 'register' | 'leads'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('viyeko-theme');
    return (stored as 'light' | 'dark') || 'dark';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'sedan',
    region: 'Dar es Salaam'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFallbackDb, setIsFallbackDb] = useState(false);

  // Leads table states
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterVehicle, setFilterVehicle] = useState('All');

  const fetchLeads = async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch lead responses');
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        throw new Error(data.error || 'Unknown response format');
      }
    } catch (err: any) {
      console.error(err);
      setLeadsError(err.message || 'Failed to load submissions.');
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'leads') {
      fetchLeads();
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('viyeko-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    toast.info(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, { duration: 1500 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Tafadhali jaza taarifa zote muhimu (Please fill in all fields)');
      return;
    }

    setIsSubmitting(true);
    const leadId = `lead-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: leadId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          vehicleType: formData.vehicleType,
          region: formData.region,
          createdAt: Date.now()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit data');
      }

      const result = await response.json();
      setIsFallbackDb(!!result.isFallback);
      
      toast.success(
        result.isFallback 
          ? 'Registered in local fallback database!' 
          : 'Successfully registered in Turso DB!'
      );
      
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'sedan',
        region: 'Dar es Salaam'
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(`Imeshindikana kutuma taarifa: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styled helper classes based on theme
  const isDark = theme === 'dark';
  
  const bgClass = isDark ? 'bg-[#0b0c10] text-slate-100' : 'bg-[#f8fafc] text-slate-900';
  const headerBg = isDark ? 'bg-[#0b0c10]/80 border-white/5' : 'bg-[#f8fafc]/80 border-slate-200/80';
  const cardBg = isDark ? 'bg-[#15171e] border-white/5' : 'bg-white border-slate-200/80 shadow-md shadow-slate-100';
  const inputBg = isDark ? 'bg-white/5 border-white/10 text-white focus:border-slate-yellow/40' : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-amber-500';
  const brandYellow = isDark ? 'text-slate-yellow' : 'text-amber-500';
  const secondaryText = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderTint = isDark ? 'border-white/5' : 'border-slate-200/80';
  const labelText = isDark ? 'text-slate-500' : 'text-slate-500';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-slate-yellow/30 transition-colors duration-300 ${bgClass}`} id="landing-page-root">
      
      {/* Top Floating Glow Accent */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${isDark ? 'bg-slate-yellow/5' : 'bg-amber-500/5'} rounded-full blur-[120px] pointer-events-none`} />

      {/* Header */}
      <header className={`border-b py-5 px-6 backdrop-blur-md sticky top-0 z-50 transition-colors ${headerBg}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>
                <Truck size={20} className="stroke-[2.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-charcoal animate-pulse" />
            </div>
            <div>
              <span className={`font-black text-xl italic tracking-tight uppercase leading-none block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                VIYEKO
              </span>
              <span className={`text-[9px] font-mono font-black tracking-widest uppercase ${brandYellow}`}>
                Rescue & Care
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {view === 'home' && (
              <>
                <a href="#features" className={`text-xs font-bold uppercase tracking-wider transition-colors hidden md:inline-block ${secondaryText} hover:text-amber-500`}>Features</a>
                <a href="#rescuers" className={`text-xs font-bold uppercase tracking-wider transition-colors hidden md:inline-block ${secondaryText} hover:text-amber-500`}>The Rescuers</a>
              </>
            )}


            
            {/* Theme Toggler */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-300 ${isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'}`}
              aria-label="Toggle Theme"
              id="theme-toggler-btn"
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-700" />}
            </button>

            {view === 'home' ? (
              <button 
                onClick={() => setView('register')}
                className={`font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${isDark ? 'bg-slate-yellow/10 hover:bg-slate-yellow text-slate-yellow hover:text-charcoal border border-slate-yellow/20' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                id="header-waitlist-btn"
              >
                <Zap size={11} />
                <span>Secure Early Access</span>
              </button>
            ) : view === 'register' ? (
              <button 
                onClick={() => setView('home')}
                className={`font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'}`}
              >
                <ArrowLeft size={11} />
                <span>Back to Home</span>
              </button>
            ) : (
              <button 
                onClick={() => setView('register')}
                className={`font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5 ${isDark ? 'bg-slate-yellow/10 hover:bg-slate-yellow text-slate-yellow hover:text-charcoal border border-slate-yellow/20' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
              >
                <Zap size={11} />
                <span>Register</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Page View Switcher */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 z-10">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className={`inline-flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full ${isDark ? 'bg-slate-yellow/10 border-slate-yellow/20 text-slate-yellow' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                    <Sparkles size={11} className="animate-spin text-amber-500" />
                    <span>Pre-Launch Priority Waitlist Active</span>
                  </div>
                  
                  <h1 className={`text-4xl md:text-6xl font-black leading-[1.05] italic tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Stranded in <span className={brandYellow}>Tanzania?</span> <br />
                    Meet Your Instant <br />
                    Rescue Team.
                  </h1>

                  <p className={`text-sm md:text-base leading-relaxed max-w-lg font-medium ${secondaryText}`}>
                    VIYEKO is the next-generation digital garage and on-demand roadside assistance dispatcher. 
                    From tire swaps in Kigamboni to complex heavy towing in Mikocheni, connect with local vetted 
                    specialists equipped with precision GPS, live barometer telemetry, and transparent pricing.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                    <button 
                      onClick={() => setView('register')}
                      className={`w-full sm:w-auto font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl transition-all text-center flex items-center justify-center gap-2 group hover:scale-[1.02] ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/10 hover:shadow-slate-yellow/20' : 'bg-amber-500 text-white shadow-amber-500/10 hover:shadow-amber-500/20 hover:bg-amber-600'}`}
                    >
                      <span>Secure Early Access</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => setView('register')}
                      className={`w-full sm:w-auto border font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all text-center flex items-center justify-center gap-2 active:scale-95 ${isDark ? 'bg-white/5 border-white/10 hover:border-slate-yellow/30 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'}`}
                    >
                      <Activity size={14} className={`${brandYellow} animate-pulse`} />
                      <span>Join Priority Waitlist</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} className={brandYellow} /> 100% Vetted</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className={brandYellow} /> Avg. 12 Min Arrival</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} className={brandYellow} /> Dar es Salaam & Regions</span>
                  </div>
                </div>

                <div className="flex-1 w-full relative">
                  <div className={`absolute inset-0 rounded-[3rem] blur-2xl pointer-events-none -z-10 ${isDark ? 'bg-gradient-to-tr from-slate-yellow/10 to-transparent' : 'bg-gradient-to-tr from-amber-500/10 to-transparent'}`} />
                  
                  {/* Custom Stylized Preview Window */}
                  <div className={`border rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-sm ${cardBg}`}>
                    <div className={`flex items-center justify-between border-b pb-4 ${borderTint}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-mono text-slate-400 font-bold ml-2 uppercase">Live Dispatch Telemetry</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full`}>TSh Active</span>
                    </div>

                    {/* Simulated Live Rescue Box */}
                    <div className="space-y-4">
                      <div className={`border p-4 rounded-3xl space-y-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Francis Masanja</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Heavy Towing Specialist</p>
                          </div>
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full uppercase">On the Way</span>
                        </div>
                        
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                          <div className={`h-full w-2/3 rounded-full animate-pulse ${isDark ? 'bg-slate-yellow' : 'bg-amber-500'}`} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                          <span>Mbezi, Dar es Salaam</span>
                          <span className={brandYellow}>ETA: 8 mins</span>
                        </div>
                      </div>

                      {/* Cool Sensor Simulation Display */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`border p-3.5 rounded-2xl space-y-1 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Compass size={12} className={brandYellow} />
                            <span className="text-[8px] font-black uppercase tracking-wider">Heading / GPS</span>
                          </div>
                          <p className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>6° 48' S • 39° 17' E</p>
                        </div>
                        
                        <div className={`border p-3.5 rounded-2xl space-y-1 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Activity size={12} className={`${brandYellow} animate-pulse`} />
                            <span className="text-[8px] font-black uppercase tracking-wider">Alt / Pressure</span>
                          </div>
                          <p className={`text-xs font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>1,013 hPa (Sea Lvl)</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setView('register')}
                      className={`w-full font-black text-[10px] py-3.5 rounded-2xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/5' : 'bg-amber-500 text-white shadow-amber-500/5'}`}
                    >
                      <span>Secure Early Access</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </section>

              {/* App Features Grid */}
              <section id="features" className={`border-y py-20 px-6 ${isDark ? 'bg-white/2' : 'bg-slate-100/50'} ${borderTint}`}>
                <div className="max-w-6xl mx-auto space-y-12">
                  <div className="text-center max-w-xl mx-auto space-y-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${brandYellow}`}>Precision Roadside Logistics</span>
                    <h2 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>The Modern Rescue Ecosystem</h2>
                    <p className={`text-xs md:text-sm font-medium ${secondaryText}`}>
                      We took everything frustrating about traditional roadside towing and rebuild it from the soil up for Tanzania's growing automotive network.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`border p-8 rounded-[2rem] space-y-4 hover:border-amber-500/20 transition-all group ${cardBg}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Truck size={22} />
                      </div>
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>On-Demand Dispatches</h3>
                      <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                        Flatbed towing, emergency diesel/petrol delivery, tire dynamic swaps, battery jumpstarts, and complete mobile detailing. Ordered in 3 taps.
                      </p>
                    </div>

                    <div className={`border p-8 rounded-[2rem] space-y-4 hover:border-amber-500/20 transition-all group ${cardBg}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Wrench size={22} />
                      </div>
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Digital Service Garage</h3>
                      <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                        Add your fleet vehicles, track complete maintenance dates, calculate exact service costs, and plan future checkups through our digital ledger.
                      </p>
                    </div>

                    <div className={`border p-8 rounded-[2rem] space-y-4 hover:border-amber-500/20 transition-all group ${cardBg}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-slate-yellow/10 text-slate-yellow' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Activity size={22} />
                      </div>
                      <h3 className={`font-black text-lg uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Telemetry Sync</h3>
                      <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                        High-precision GPS sensors coupled with localized barometric pressure calculators adjust ETA and mechanics tools dynamically to current climate and altitude.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* The Rescuers Section */}
              <section id="rescuers" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${brandYellow}`}>Vetted, Reliable, Responsive</span>
                  <h2 className={`text-3xl md:text-4xl font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Meet the Rescuers</h2>
                  <p className={`text-xs md:text-sm font-medium ${secondaryText}`}>
                    Trained and certified logistics experts ready to service your car anytime. Real people, premium vehicles, and precise performance metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {EXPERT_PROVIDERS.map((provider) => (
                    <div 
                      key={provider.name} 
                      className={`border rounded-[2.5rem] p-6 space-y-5 transition-all flex flex-col justify-between ${cardBg} hover:border-amber-500/20`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={provider.avatar} 
                              alt={provider.name} 
                              className={`w-14 h-14 rounded-full object-cover border-2 ${isDark ? 'border-slate-yellow' : 'border-amber-500'}`} 
                              referrerPolicy="no-referrer"
                            />
                            <div className={`absolute -bottom-1 -right-1 rounded-full p-1 border ${isDark ? 'bg-slate-yellow text-charcoal border-charcoal' : 'bg-amber-500 text-white border-white'}`}>
                              <Award size={8} className="stroke-[3]" />
                            </div>
                          </div>
                          <div>
                            <h3 className={`font-black text-base leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{provider.name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{provider.specialty}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              <span className="text-[9px] font-black font-mono ml-1">5.0 Rating</span>
                            </div>
                          </div>
                        </div>

                        <div className={`border-t border-b py-3 grid grid-cols-2 gap-4 text-center ${borderTint}`}>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Response Vehicle</span>
                            <span className={`text-[10px] font-black uppercase ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{provider.vehicle}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Experience</span>
                            <span className={`text-[10px] font-black font-mono ${brandYellow}`}>{provider.experience}</span>
                          </div>
                        </div>

                        <p className={`text-xs leading-relaxed font-medium ${secondaryText}`}>
                          "{provider.bio}"
                        </p>
                      </div>

                      <div className="pt-4 mt-auto">
                        <div className={`p-3 rounded-2xl flex items-center justify-between text-[10px] font-bold ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                          <span className="uppercase tracking-wider">Tanzania Region</span>
                          <span className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{provider.distance} Away</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Secure Call-To-Action Banner at the bottom instead of form */}
              <section className={`py-16 px-6 border-t ${borderTint} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}`}>
                <div className="max-w-4xl mx-auto text-center space-y-6">
                  <h2 className={`text-3xl md:text-5xl font-black uppercase italic tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Ready to secure <span className={brandYellow}>Priority</span> early access?
                  </h2>
                  <p className={`max-w-xl mx-auto text-sm font-medium ${secondaryText}`}>
                    Get priority dispatcher queues, zero-fee towing for the first month, and early updates. Register your vehicle now on our secure waitlist.
                  </p>
                  <div>
                    <button 
                      onClick={() => setView('register')}
                      className={`font-black text-xs uppercase tracking-widest px-10 py-4.5 rounded-2xl transition-all hover:scale-[1.02] shadow-lg ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/10 hover:bg-slate-yellow/90' : 'bg-amber-500 text-white shadow-amber-500/10 hover:bg-amber-600'}`}
                    >
                      Go to Registration Page
                    </button>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto px-6 py-12 md:py-16"
            >
              {/* Back to Home Button */}
              <button 
                onClick={() => setView('home')}
                className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-8 transition-colors ${secondaryText} hover:text-amber-500`}
              >
                <ArrowLeft size={14} />
                <span>Back to Overview</span>
              </button>

              <div className={`border rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden ${cardBg}`}>

                {isSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${isDark ? 'bg-slate-yellow/10 border-slate-yellow/20 text-slate-yellow' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                      <CheckCircle2 size={32} className="stroke-[2.5]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className={`font-black text-2xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>You're on the list!</h3>
                      <p className={`text-xs font-semibold leading-relaxed max-w-md mx-auto ${secondaryText}`}>
                        Asante sana! We've secured your priority early-access spot. Your submission was logged in our Turso cloud database. You will be notified the minute our certified rescuers go live.
                      </p>
                    </div>

                    {isFallbackDb && (
                      <div className={`max-w-md mx-auto p-3.5 rounded-2xl text-left border flex gap-3 text-xs ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50/90 border-amber-200 text-amber-700'}`}>
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Developer Notice</p>
                          <p className="text-[10px] leading-relaxed opacity-90 mt-0.5">
                            This registration was written to the local SQLite fallback database because `TURSO_CONNECTION_URL` is not configured in secrets. Fill it in to sync to your production database.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => {
                          setIsSuccess(false);
                          setIsFallbackDb(false);
                        }}
                        className={`flex-1 font-black text-xs py-4 rounded-2xl uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200'}`}
                      >
                        Register another vehicle
                      </button>
                      <button 
                        onClick={() => setView('home')}
                        className={`flex-1 font-black text-xs py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg ${isDark ? 'bg-slate-yellow text-charcoal shadow-slate-yellow/10' : 'bg-amber-500 text-white shadow-amber-500/10 hover:bg-amber-600'}`}
                      >
                        Back to Overview
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <h3 className={`font-black text-2xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure Early Access</h3>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${secondaryText}`}>Enter your vehicle and dispatch details below</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>Full Name *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g., Godson Rubenga"
                          value={formData.name}
                          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                          className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>Email Address *</label>
                        <input 
                          type="email" 
                          required
                          placeholder="e.g., godson@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                          className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>Phone Number (WhatsApp Preferred) *</label>
                        <input 
                          type="tel" 
                          required
                          placeholder="e.g., +255 750 057 757"
                          value={formData.phone}
                          onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                          className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>Vehicle Class</label>
                          <select 
                            value={formData.vehicleType}
                            onChange={(e) => setFormData(p => ({ ...p, vehicleType: e.target.value }))}
                            className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'}`}
                          >
                            {VEHICLE_TYPES.map(vt => (
                              <option key={vt.value} value={vt.value}>{vt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ${labelText}`}>Your Region</label>
                          <select 
                            value={formData.region}
                            onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                            className={`w-full p-3.5 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'}`}
                          >
                            {POPULAR_REGIONS.map(reg => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`w-full font-black text-xs py-4.5 rounded-2xl uppercase tracking-widest transition-all disabled:opacity-50 text-center flex items-center justify-center gap-2 mt-6 ${isDark ? 'bg-slate-yellow text-charcoal' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className={`animate-spin border-2 border-t-transparent w-4 h-4 rounded-full ${isDark ? 'border-charcoal' : 'border-white'}`} />
                          <span>Recording Lead...</span>
                        </span>
                      ) : (
                        <span>Register Securely</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {view === 'leads' && (
            <motion.div
              key="leads-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setView('home')}
                      className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${secondaryText} hover:text-amber-500`}
                    >
                      <ArrowLeft size={14} />
                      <span>Home</span>
                    </button>
                    <span className="text-slate-500">/</span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-500">Database Leads Console</span>
                  </div>
                  <h2 className={`text-3xl font-black uppercase italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Registered Responses
                  </h2>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${secondaryText}`}>
                    Real-time Turso Database synchronization engine
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchLeads}
                    disabled={leadsLoading}
                    className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest ${
                      isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <RefreshCw size={13} className={leadsLoading ? "animate-spin" : ""} />
                    <span>{leadsLoading ? "Syncing..." : "Refresh Database"}</span>
                  </button>
                  
                  <button 
                    onClick={() => setView('register')}
                    className={`font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl transition-all shadow-lg flex items-center gap-2 ${
                      isDark ? 'bg-slate-yellow text-charcoal' : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    <Zap size={13} />
                    <span>Register New Lead</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Control Bar */}
              <div className={`border p-4 md:p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 ${cardBg}`}>
                {/* Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none transition-all placeholder:text-slate-500 ${inputBg}`}
                  />
                </div>

                {/* Filter Region */}
                <div>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${
                      isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <option value="All">All Regions (Mikoa Yote)</option>
                    {POPULAR_REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Vehicle */}
                <div>
                  <select
                    value={filterVehicle}
                    onChange={(e) => setFilterVehicle(e.target.value)}
                    className={`w-full p-3 rounded-xl text-xs font-semibold focus:outline-none transition-all border ${
                      isDark ? 'bg-[#15171e] text-slate-300 border-white/10' : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <option value="All">All Vehicle Classes (Madaraja Yote)</option>
                    {VEHICLE_TYPES.map(vt => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Tables Section */}
              <div className={`border rounded-[2rem] overflow-hidden ${cardBg}`}>
                {leadsLoading ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className={`absolute inset-0 border-4 rounded-full opacity-20 ${isDark ? 'border-slate-yellow' : 'border-amber-500'}`} />
                      <div className={`absolute inset-0 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-slate-yellow' : 'border-amber-500'}`} />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>
                      Fetching certified leads from Turso...
                    </p>
                  </div>
                ) : leadsError ? (
                  <div className="py-16 px-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                      <AlertCircle size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-sm uppercase">Connection Error</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">{leadsError}</p>
                    </div>
                    <button 
                      onClick={fetchLeads}
                      className="text-xs font-black uppercase tracking-wider text-amber-500 hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header stat block */}
                    <div className={`border-b px-6 py-4 flex items-center justify-between ${borderTint} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Database Entries
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-black ${brandYellow}`}>
                        {
                          leads.filter(lead => {
                            const matchesSearch = 
                              lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesRegion = filterRegion === 'All' || lead.region === filterRegion;
                            const matchesVehicle = filterVehicle === 'All' || lead.vehicleType === filterVehicle;
                            return matchesSearch && matchesRegion && matchesVehicle;
                          }).length
                        } / {leads.length} Records Found
                      </span>
                    </div>

                    {/* Table markup */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[9px] font-black uppercase tracking-widest text-slate-500 ${borderTint} ${isDark ? 'bg-white/[0.02]' : 'bg-slate-100/50'}`}>
                            <th className="py-4 px-6">Lead Name / Client</th>
                            <th className="py-4 px-6">Contact details</th>
                            <th className="py-4 px-6">Vehicle Type</th>
                            <th className="py-4 px-6">Region</th>
                            <th className="py-4 px-6">Registered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {leads
                            .filter(lead => {
                              const matchesSearch = 
                                lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
                              const matchesRegion = filterRegion === 'All' || lead.region === filterRegion;
                              const matchesVehicle = filterVehicle === 'All' || lead.vehicleType === filterVehicle;
                              return matchesSearch && matchesRegion && matchesVehicle;
                            })
                            .map((lead) => (
                              <tr 
                                key={lead.id} 
                                className={`text-xs font-semibold group transition-colors hover:${isDark ? 'bg-white/[0.01]' : 'bg-slate-50'}`}
                              >
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                                      isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                      {lead.name ? lead.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{lead.name || 'Anonymous'}</p>
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 space-y-0.5">
                                  <p className="font-medium text-slate-400">{lead.email}</p>
                                  <p className={`font-mono text-[10px] ${brandYellow}`}>{lead.phone}</p>
                                </td>
                                <td className="py-4.5 px-6">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {VEHICLE_TYPES.find(vt => vt.value === lead.vehicleType)?.label || lead.vehicleType || 'sedan'}
                                  </span>
                                </td>
                                <td className="py-4.5 px-6">
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <MapPin size={11} className={brandYellow} />
                                    <span>{lead.region || 'Dar es Salaam'}</span>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6 font-mono text-[10px] text-slate-500">
                                  {lead.createdAt ? new Date(Number(lead.createdAt)).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Just now'}
                                </td>
                              </tr>
                            ))}
                          
                          {leads.filter(lead => {
                            const matchesSearch = 
                              lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              lead.phone?.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesRegion = filterRegion === 'All' || lead.region === filterRegion;
                            const matchesVehicle = filterVehicle === 'All' || lead.vehicleType === filterVehicle;
                            return matchesSearch && matchesRegion && matchesVehicle;
                          }).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-16 text-center">
                                <div className="text-slate-500 space-y-1">
                                  <Database size={20} className="mx-auto opacity-40 mb-2" />
                                  <p className="font-black text-xs uppercase tracking-wider">No matching database records</p>
                                  <p className="text-[10px] opacity-80">Try adjusting your filters or search keywords.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 px-6 transition-colors ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDark ? 'bg-slate-yellow/10 border-slate-yellow/20 text-slate-yellow' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              <Truck size={14} />
            </div>
            <div>
              <span className={`font-black text-sm italic tracking-tight uppercase leading-none block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                VIYEKO
              </span>
              <span className={`text-[7px] font-mono tracking-widest uppercase ${brandYellow}`}>
                Rescue & Care
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center md:text-right">
            © 2026 VIYEKO. Engineered with absolute precision in Dar es Salaam, Tanzania. All Rights Reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
