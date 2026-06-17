import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Car, 
  MapPin, 
  Phone, 
  ChevronRight, 
  X, 
  Loader2,
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react';
import { Request, SERVICES, Service, Vehicle, Bid } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LiveTracking from '../components/LiveTracking';
import PaymentGate from '../components/PaymentGate';
import BidSelector from '../components/BidSelector';

interface HomePageProps {
  requests: Request[];
  onAddRequest: (req: Request) => void;
  onCancelRequest: (id: string, role?: 'driver' | 'provider') => void;
  onAdvanceStatus: (id: string, role?: 'driver' | 'provider') => void;
  onAcceptBid: (requestId: string, bid: Bid) => void;
}

const POPULAR_LOCATIONS = [
  "Dar es Salaam - City Center",
  "Dar es Salaam - Masaki",
  "Dar es Salaam - Mbezi Beach",
  "Dodoma - City Center",
  "Arusha - Arusha Urban",
  "Mwanza - City Center",
  "Geita - Geita Urban",
  "Zanzibar - Stone Town",
  "Tanga - City Center",
  "Mbeya - City Center"
];

export default function HomePage({ requests, onAddRequest, onCancelRequest, onAdvanceStatus, onAcceptBid }: HomePageProps) {
  const { user } = useAuth();
  
  // UI State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Data State
  const [location, setLocation] = useState<{ lat?: number; lng?: number; address: string }>({ address: '' });
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);

  // OBJECTIVE 3: Dynamic State Migration
  useEffect(() => {
    if (user) {
      const fetchUserVehicles = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('vehicles')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching vehicles:", error);
        } else if (data?.vehicles) {
          setUserVehicles(data.vehicles as Vehicle[]);
          // Default to first vehicle if available
          if ((data.vehicles as Vehicle[]).length > 0) {
            const v = (data.vehicles as Vehicle[])[0];
            setVehicleInfo(`${v.make} ${v.model} (${v.plate})`);
          }
        }
      };
      fetchUserVehicles();
    }
  }, [user]);

  const activeRequest = requests.find(r => r.status !== 'completed' && r.status !== 'canceled');

  // OBJECTIVE 4: Geolocation Hardening
  const getCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude,
          address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        });
        setIsLocating(false);
        setShowLocationPicker(false);
        toast.success("GPS Lock Acquired!");
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = "Location access denied.";
        if (error.code === error.TIMEOUT) errorMsg = "Location request timed out.";
        
        toast.error(`${errorMsg} Using Dar es Salaam fallback.`);
        setLocation({ 
          lat: -6.7924, 
          lng: 39.2083, 
          address: 'Dar es Salaam, Tanzania (Fallback)' 
        });
        setShowLocationPicker(false);
      },
      options
    );
  };

  const handleRequestInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    confirmAndDispatch();
  };

  const confirmAndDispatch = async () => {
    setIsSubmitting(true);
    
    const newRequest: Request = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: selectedService!.id,
      addOnIds: selectedAddOns,
      status: 'searching',
      location,
      timestamp: Date.now(),
      vehicleInfo,
      notes,
      userId: user?.id,
      bids: []
    };

    onAddRequest(newRequest);
    setIsSubmitting(false);
    setSelectedService(null);
    setSelectedAddOns([]);
    toast.success('Broadcast sent! Nearby garages are being notified.');
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence mode="wait">
        {activeRequest ? (
          <div key="active-flow" className="space-y-6">
            {(activeRequest.status === 'searching' || activeRequest.status === 'bidding') ? (
              <BidSelector 
                bids={activeRequest.bids || []} 
                onAccept={(bid) => onAcceptBid(activeRequest.id, bid)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LiveTracking 
                  request={activeRequest} 
                  onCancel={() => onCancelRequest(activeRequest.id, 'driver')}
                />
                </motion.div>
                )}

                {(activeRequest.status === 'searching' || activeRequest.status === 'bidding') && (
                <button 
                onClick={() => onCancelRequest(activeRequest.id, 'driver')}
                className="w-full py-4 rounded-full bg-subtle text-rose-500 font-black uppercase text-[10px] tracking-widest border border-subtle hover:bg-rose-500/10 transition-all"
                >
                Cancel Broadcast
                </button>
                )}
          </div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-100 italic tracking-tight uppercase">VIYEKO Rescue</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Live Reverse-Bidding Marketplace</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Set Pickup Point</h3>
                {location.lat && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter italic">Precision GPS Active</span>}
              </div>
              <button
                onClick={() => setShowLocationPicker(true)}
                className={cn(
                  "w-full glass-card p-5 flex items-center justify-between group transition-all",
                  location.address ? "border-emerald-500/30" : "hover:border-slate-yellow"
                )}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={cn(
                    "p-3 rounded-full transition-all shadow-xl",
                    location.lat ? "bg-emerald-500 text-white" : "bg-viyeko-red/10 text-viyeko-red"
                  )}>
                    <MapPin size={24} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-slate-100 font-black text-sm italic tracking-tight truncate">
                      {location.address || "Tafuta mahali ulipo..."}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      {location.address ? "Tap to change service area" : "Mandatory for dispatch"}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-700 group-hover:text-slate-yellow transition-colors" />
              </button>
            </div>

            <div className={cn("space-y-6 transition-all duration-500", !location.address && "opacity-30 grayscale pointer-events-none")}>
              <div className="space-y-1 px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Select Assistance Type</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SERVICES.filter(s => !s.isAddOn).map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service)}
                    className="glass-card p-4 flex flex-col items-start gap-3 text-left transition-all hover:border-slate-yellow group relative overflow-hidden"
                  >
                    <div className={cn("p-2 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform", service.color)}>
                      <service.icon size={20} />
                    </div>
                    <div className="w-full space-y-1">
                      <h3 className="font-black text-slate-100 text-sm leading-tight uppercase tracking-tight">{service.title}</h3>
                      <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{service.subtitle}</p>
                      <div className="flex items-center gap-1.5 pt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Get Live Bids</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-viyeko-red/10 border border-viyeko-red/20 rounded-full p-5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-viyeko-red/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-viyeko-red p-3 rounded-full text-white shadow-lg shadow-viyeko-red/20">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-slate-100 font-black text-sm italic tracking-tight uppercase">Emergency Hotline</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Police / Ambulance</p>
                  </div>
                </div>
                <a href="tel:112" className="bg-viyeko-red text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-viyeko-red-dark transition-all shadow-lg shadow-viyeko-red/20 active:scale-95 relative z-10 uppercase">Call 112</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOCATION MODAL */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-charcoal w-full max-w-md rounded-t-[3rem] p-8 pb-12 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] h-[85vh] flex flex-col border-t border-subtle"
            >
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-black text-slate-100 italic uppercase">Find Location</h2>
                <button 
                  onClick={() => setShowLocationPicker(false)}
                  className="p-2 bg-subtle rounded-full text-slate-500 hover:text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <button
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="w-full bg-slate-yellow text-charcoal rounded-full p-4 flex items-center gap-4 font-black uppercase tracking-widest hover:opacity-90 transition-all shrink-0 shadow-lg shadow-slate-yellow/20 disabled:opacity-50"
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
                  </div>
                  <span>{isLocating ? "Acquiring GPS..." : "Use GPS Precision"}</span>
                </button>

                <div className="relative shrink-0">
                  <input 
                    type="text" 
                    placeholder="Dar es Salaam, Dodoma, Arusha..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-subtle border border-subtle rounded-full py-4 px-6 pl-12 text-sm font-bold focus:outline-none focus:border-slate-yellow transition-all text-slate-100"
                  />
                  <MapPin className="absolute left-4 top-4.5 text-slate-yellow" size={18} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide pt-2">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-4 mb-2">Mikoa / Regions</p>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocation({ address: loc });
                        setShowLocationPicker(false);
                        toast.success(`Eneo limewekwa: ${loc}`);
                      }}
                      className="w-full p-4 rounded-2xl border border-transparent hover:border-slate-yellow hover:bg-slate-yellow/5 flex items-center gap-4 transition-all text-left group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-yellow transition-colors" />
                      <span className="text-sm font-bold text-slate-300 group-hover:text-slate-100">{loc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REQUEST MODAL */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-charcoal w-full max-w-md rounded-t-[3rem] p-8 pb-12 space-y-6 shadow-2xl border-t border-subtle"
            >
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                  <div className={cn("p-4 rounded-full text-white shadow-lg", selectedService.color)}>
                    <selectedService.icon size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100 italic uppercase">{selectedService.title}</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Broadcast to nearby garages</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="p-2 bg-subtle rounded-full text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRequestInit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stranded Vehicle</label>
                  {userVehicles.length > 0 ? (
                    <select 
                      value={vehicleInfo}
                      onChange={(e) => setVehicleInfo(e.target.value)}
                      className="input-viyeko w-full font-bold bg-subtle appearance-none"
                    >
                      {userVehicles.map((v) => (
                        <option key={v.id} value={`${v.make} ${v.model} (${v.plate})`}>
                          {v.make} {v.model} - {v.plate}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Toyota Land Cruiser (T 123 ABC)"
                      value={vehicleInfo}
                      onChange={(e) => setVehicleInfo(e.target.value)}
                      className="input-viyeko w-full font-bold"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Extra Requirements</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.filter(s => s.isAddOn).map((addon) => (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => {
                          setSelectedAddOns(prev => 
                            prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]
                          );
                        }}
                        className={cn(
                          "p-3 rounded-2xl border text-left transition-all flex flex-col gap-1",
                          selectedAddOns.includes(addon.id) 
                            ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow" 
                            : "bg-subtle border-subtle text-slate-500 hover:border-slate-400"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-tight">{addon.title}</span>
                        <span className="text-[8px] opacity-70 font-bold uppercase">{addon.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-viyeko-primary w-full h-16 disabled:opacity-50 shadow-xl shadow-slate-yellow/10"
                >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Broadcast Rescue Request</span>
                      <ChevronRight size={20} />
                    </div>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
