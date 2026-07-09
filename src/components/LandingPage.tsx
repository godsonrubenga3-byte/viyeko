import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Award
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
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

interface LandingPageProps {
  onAccessPrototype: () => void;
}

export default function LandingPage({ onAccessPrototype }: LandingPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'sedan',
    region: 'Dar es Salaam'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Tafadhali jaza taarifa zote muhimu (Please fill in all fields)');
      return;
    }

    setIsSubmitting(true);
    const leadId = `lead-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    try {
      const leadDoc = {
        id: leadId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        vehicleType: formData.vehicleType,
        region: formData.region,
        createdAt: Date.now()
      };

      await setDoc(doc(collection(db, 'leads'), leadId), leadDoc);
      toast.success('Asante! Tumepokea taarifa zako. (Thank you! We received your details.)');
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'sedan',
        region: 'Dar es Salaam'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `leads/${leadId}`);
      toast.error('Imeshindikana kutuma taarifa. Tafadhali jaribu tena. (Failed to submit.)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-slate-100 flex flex-col font-sans selection:bg-slate-yellow/30 selection:text-slate-yellow" id="landing-page-root">
      
      {/* Top Floating Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-yellow/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-slate-yellow/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Modern Header */}
      <header className="border-b border-white/5 py-5 px-6 backdrop-blur-md sticky top-0 z-50 bg-charcoal/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-slate-yellow flex items-center justify-center text-charcoal shadow-lg shadow-slate-yellow/20">
                <Truck size={20} className="stroke-[2.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-charcoal animate-pulse" />
            </div>
            <div>
              <span className="font-black text-xl italic tracking-tight uppercase text-white leading-none block">
                VIYEKO
              </span>
              <span className="text-[9px] font-mono font-black text-slate-yellow tracking-widest uppercase">
                Rescue & Care
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#features" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors hidden md:inline-block">Features</a>
            <a href="#rescuers" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors hidden md:inline-block">The Rescuers</a>
            <a href="#waitlist" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Join Waitlist</a>
            
            <button 
              onClick={onAccessPrototype}
              className="bg-slate-yellow/10 hover:bg-slate-yellow text-slate-yellow hover:text-charcoal border border-slate-yellow/20 font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-1.5"
              id="header-prototype-btn"
            >
              <Zap size={11} />
              <span>Try Prototype</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12 z-10">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-slate-yellow/10 border border-slate-yellow/20 text-slate-yellow text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
            <Sparkles size={11} className="animate-spin" />
            <span>Pre-Launch Waitlist & Prototype Active</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-100 leading-[1.05] italic tracking-tight uppercase">
            Stranded in <span className="text-slate-yellow">Tanzania?</span> <br />
            Meet Your Instant <br />
            Rescue Team.
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg font-medium">
            VIYEKO is the next-generation digital garage and on-demand roadside assistance dispatcher. 
            From tire swaps in Kigamboni to complex heavy towing in Mikocheni, connect with local vetted 
            specialists equipped with precision GPS, live barometer telemetry, and transparent pricing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
            <a 
              href="#waitlist"
              className="w-full sm:w-auto bg-slate-yellow text-charcoal font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-slate-yellow/10 hover:shadow-slate-yellow/20 transition-all text-center flex items-center justify-center gap-2 group hover:scale-[1.02]"
            >
              <span>Secure Early Access</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <button 
              onClick={onAccessPrototype}
              className="w-full sm:w-auto bg-white/5 border border-white/10 hover:border-slate-yellow/30 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl transition-all hover:bg-white/10 text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <Activity size={14} className="text-slate-yellow animate-pulse" />
              <span>Explore Live Prototype</span>
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-6 pt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-slate-yellow" /> 100% Vetted</span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-yellow" /> Avg. 12 Min Arrival</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-yellow" /> Dar es Salaam & Regions</span>
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-yellow/10 to-transparent rounded-[3rem] blur-2xl pointer-events-none -z-10" />
          
          {/* Custom Stylized Preview Window */}
          <div className="bg-charcoal-light/35 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-mono text-slate-500 font-bold ml-2 uppercase">Live Dispatch Telemetry</span>
              </div>
              <span className="text-[10px] font-mono font-black text-slate-yellow bg-slate-yellow/10 px-2.5 py-0.5 rounded-full">TSh Active</span>
            </div>

            {/* Simulated Live Rescue Box */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-white text-sm">Francis Masanja</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Heavy Towing Specialist</p>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full uppercase">On the Way</span>
                </div>
                
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-yellow w-2/3 rounded-full animate-pulse" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span>Mbezi, Dar es Salaam</span>
                  <span className="text-slate-yellow">ETA: 8 mins</span>
                </div>
              </div>

              {/* Cool Sensor Simulation Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Compass size={12} className="text-slate-yellow" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Heading / GPS</span>
                  </div>
                  <p className="text-sm font-black font-mono text-white">6° 48' S • 39° 17' E</p>
                </div>
                
                <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Activity size={12} className="text-slate-yellow animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Alt / Pressure</span>
                  </div>
                  <p className="text-sm font-black font-mono text-white">1,013 hPa (Sea Lvl)</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onAccessPrototype}
              className="w-full bg-slate-yellow text-charcoal font-black text-[10px] py-3 rounded-2xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-slate-yellow/5"
            >
              <span>Launch Interactive Prototype</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </section>

      {/* App Features Grid */}
      <section id="features" className="bg-charcoal-light/20 border-y border-white/5 py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-yellow">Precision Roadside Logistics</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-100 uppercase italic tracking-tight">The Modern Rescue Ecosystem</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">
              We took everything frustrating about traditional roadside towing and rebuild it from the soil up for Tanzania's growing automotive network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-charcoal-light/40 border border-white/5 p-8 rounded-[2rem] space-y-4 hover:border-slate-yellow/20 transition-all group">
              <div className="w-12 h-12 bg-slate-yellow/10 rounded-2xl flex items-center justify-center text-slate-yellow group-hover:scale-110 transition-transform">
                <Truck size={22} />
              </div>
              <h3 className="font-black text-lg text-slate-100 uppercase tracking-tight">On-Demand Dispatches</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Flatbed towing, emergency diesel/petrol delivery, tire dynamic swaps, battery jumpstarts, and complete mobile detailing. Ordered in 3 taps.
              </p>
            </div>

            <div className="bg-charcoal-light/40 border border-white/5 p-8 rounded-[2rem] space-y-4 hover:border-slate-yellow/20 transition-all group">
              <div className="w-12 h-12 bg-slate-yellow/10 rounded-2xl flex items-center justify-center text-slate-yellow group-hover:scale-110 transition-transform">
                <Wrench size={22} />
              </div>
              <h3 className="font-black text-lg text-slate-100 uppercase tracking-tight">Digital Service Garage</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Add your fleet vehicles, track complete maintenance dates, calculate exact service costs, and plan future checkups through our digital ledger.
              </p>
            </div>

            <div className="bg-charcoal-light/40 border border-white/5 p-8 rounded-[2rem] space-y-4 hover:border-slate-yellow/20 transition-all group">
              <div className="w-12 h-12 bg-slate-yellow/10 rounded-2xl flex items-center justify-center text-slate-yellow group-hover:scale-110 transition-transform">
                <Activity size={22} />
              </div>
              <h3 className="font-black text-lg text-slate-100 uppercase tracking-tight">Telemetry Sync</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                High-precision GPS sensors coupled with localized barometric pressure calculators adjust ETA and mechanics tools dynamically to current climate and altitude.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Rescuers / The People Explainer */}
      <section id="rescuers" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-yellow">Vetted, Reliable, Responsive</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100 uppercase italic tracking-tight">Meet the Rescuers</h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium">
            Trained and certified logistics experts ready to service your car anytime. Real people, premium vehicles, and precise performance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXPERT_PROVIDERS.map((provider) => (
            <div 
              key={provider.name} 
              className="bg-charcoal-light/30 border border-white/5 rounded-[2.5rem] p-6 space-y-5 hover:border-slate-yellow/15 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={provider.avatar} 
                      alt={provider.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-yellow" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-slate-yellow text-charcoal rounded-full p-1 border border-charcoal">
                      <Award size={8} className="stroke-[3]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-100 text-base leading-tight">{provider.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{provider.specialty}</p>
                    <div className="flex items-center gap-1 text-slate-yellow mt-0.5">
                      <Star size={10} className="fill-slate-yellow" />
                      <Star size={10} className="fill-slate-yellow" />
                      <Star size={10} className="fill-slate-yellow" />
                      <Star size={10} className="fill-slate-yellow" />
                      <Star size={10} className="fill-slate-yellow" />
                      <span className="text-[9px] font-black font-mono text-slate-300 ml-1">5.0 Rating</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-b border-white/5 py-3 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Response Vehicle</span>
                    <span className="text-[10px] font-black text-slate-200 uppercase">{provider.vehicle}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Experience</span>
                    <span className="text-[10px] font-black text-slate-yellow font-mono">{provider.experience}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  "{provider.bio}"
                </p>
              </div>

              <div className="pt-4 mt-auto">
                <div className="bg-white/5 p-3 rounded-2xl flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="uppercase tracking-wider">Tanzania Region</span>
                  <span className="font-mono text-slate-200">{provider.distance} Away</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-launch Waitlist Submission Form */}
      <section id="waitlist" className="bg-charcoal-light/20 border-t border-white/5 py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-yellow">Exclusive Pre-Launch Opportunity</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-100 uppercase italic tracking-tight leading-none">
              Get <span className="text-slate-yellow">Priority</span> <br />
              Rescue Booking.
            </h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
              We are officially launching the app soon. By joining the priority waitlist, you will receive zero-fee bookings for your first month, early invite access to the fully deployed smartphone app, and a voucher for a complimentary high-detail interior wash at our service garage.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 size={16} className="text-slate-yellow shrink-0 mt-0.5" />
                <span>Zero service dispatch fee for 30 days after launch</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 size={16} className="text-slate-yellow shrink-0 mt-0.5" />
                <span>Priority mechanics allocation during monsoon rain seasons</span>
              </div>
              <div className="flex items-start gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 size={16} className="text-slate-yellow shrink-0 mt-0.5" />
                <span>Full access to the interactive prototype instantly below</span>
              </div>
            </div>
          </div>

          <div className="bg-charcoal border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-yellow/5 rounded-full blur-2xl" />
            
            {isSuccess ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 space-y-4"
              >
                <div className="w-16 h-16 bg-slate-yellow/10 border border-slate-yellow/20 rounded-full flex items-center justify-center mx-auto text-slate-yellow">
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xl uppercase tracking-tight">You're on the list!</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Asante sana! We've secured your priority early-access spot. You will be notified the minute our certified rescuers go live.
                  </p>
                </div>
                <button 
                  onClick={onAccessPrototype}
                  className="w-full bg-slate-yellow text-charcoal font-black text-xs py-3.5 rounded-2xl uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
                >
                  Go to Live Prototype
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-white uppercase tracking-tight">Join Priority Waitlist</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Enter your vehicle & contact info</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Godson Rubenga"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-slate-yellow/40 transition-colors placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g., godson@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-slate-yellow/40 transition-colors placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Phone Number (WhatsApp Preferred) *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g., +255 750 057 757"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-slate-yellow/40 transition-colors placeholder:text-slate-600 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Vehicle Class</label>
                      <select 
                        value={formData.vehicleType}
                        onChange={(e) => setFormData(p => ({ ...p, vehicleType: e.target.value }))}
                        className="w-full bg-charcoal border border-white/10 p-3 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-slate-yellow/40 transition-colors font-semibold"
                      >
                        {VEHICLE_TYPES.map(vt => (
                          <option key={vt.value} value={vt.value}>{vt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Your Region</label>
                      <select 
                        value={formData.region}
                        onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                        className="w-full bg-charcoal border border-white/10 p-3 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-slate-yellow/40 transition-colors font-semibold"
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
                  className="w-full bg-slate-yellow text-charcoal font-black text-xs py-4 rounded-2xl uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 text-center flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin border-2 border-charcoal border-t-transparent w-4 h-4 rounded-full" />
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    <span>Register for Launch</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-black/40 border-t border-white/5 py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-yellow/10 flex items-center justify-center text-slate-yellow border border-slate-yellow/20">
              <Truck size={14} />
            </div>
            <div>
              <span className="font-black text-sm italic tracking-tight uppercase text-white leading-none block">
                VIYEKO
              </span>
              <span className="text-[7px] font-mono text-slate-yellow tracking-widest uppercase">
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
