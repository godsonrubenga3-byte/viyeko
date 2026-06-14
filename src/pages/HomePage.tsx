import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Car, 
  MapPin, 
  Phone, 
  ChevronRight, 
  X, 
  Loader2 
} from 'lucide-react';
import { Request, SERVICES, Service, Vehicle } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import LiveTracking from '../components/LiveTracking';
import PaymentGate from '../components/PaymentGate';

interface HomePageProps {
  requests: Request[];
  onAddRequest: (req: Request) => void;
  onCancelRequest: (id: string) => void;
  onAdvanceStatus: (id: string) => void;
}

const POPULAR_LOCATIONS = [
  "Chandigarh Sector 17",
  "Chandigarh Sector 35",
  "Mohali Phase 7",
  "Panchkula Sector 5",
  "Ludhiana Clock Tower",
  "Amritsar Golden Temple Area",
  "Jalandhar Model Town",
  "Patiala Leela Bhawan",
  "Zirakpur VIP Road",
  "Kharar Landran Road"
];

export default function HomePage({ requests, onAddRequest, onCancelRequest, onAdvanceStatus }: HomePageProps) {
  // UI State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [location, setLocation] = useState<{ lat?: number; lng?: number; address: string }>({ address: '' });
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const vehicles: Vehicle[] = [
    { id: '1', make: 'Maruti', model: 'Swift', plate: 'CH01-XX-0000', color: 'White' },
    { id: '2', make: 'Hyundai', model: 'i20', plate: 'PB65-YY-1111', color: 'Red' }
  ];

  const activeRequest = requests.find(r => r.status !== 'completed');

  // Actions
  const handleRequestInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setShowPayment(true);
  };

  const confirmAndDispatch = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalCost = (selectedService?.price || 0) + 
                     selectedAddOns.reduce((acc, id) => acc + (SERVICES.find(s => s.id === id)?.price || 0), 0);

    const newRequest: Request = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: selectedService!.id,
      addOnIds: selectedAddOns,
      status: 'searching',
      location,
      timestamp: Date.now(),
      vehicleInfo,
      notes,
      estimatedArrival: Math.floor(Math.random() * 10) + 10,
      totalCost
    };

    onAddRequest(newRequest);
    setIsSubmitting(false);
    resetForm();
    toast.success('Assistance is on the way!');
  };

  const resetForm = () => {
    setSelectedService(null);
    setSelectedAddOns([]);
    setVehicleInfo('');
    setNotes('');
    setShowPayment(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
          });
          setShowLocationPicker(false);
        },
        () => {
          setLocation({ address: 'Chandigarh Sector 17, Punjab' });
          setShowLocationPicker(false);
          toast.error("Location access denied. Using default.");
        }
      );
    }
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence mode="wait">
        {activeRequest ? (
          /* 1. ACTIVE TRACKING VIEW */
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LiveTracking 
              request={activeRequest} 
              onCancel={() => onCancelRequest(activeRequest.id)}
              onNextStep={() => onAdvanceStatus(activeRequest.id)}
            />
          </motion.div>
        ) : (
          /* 2. MAIN REQUEST FLOW */
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header Section */}
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-100 italic tracking-tight uppercase">VIYEKO Rescue</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Punjab & Chandigarh Emergency Network</p>
            </div>

            {/* STEP 1: Global Location Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Step 1: Your Location</h3>
                {location.address && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Coordinates Locked</span>}
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
                    "p-3 rounded-full transition-all",
                    location.address ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-viyeko-red/10 text-viyeko-red"
                  )}>
                    <MapPin size={24} />
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-slate-100 font-black text-sm italic tracking-tight truncate">
                      {location.address || "Search breakdown location..."}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      {location.address ? "Tap to change service area" : "Mandatory for dispatch"}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-700 group-hover:text-slate-yellow transition-colors" />
              </button>
            </div>

            {/* STEP 2: Service Selection */}
            <div className={cn("space-y-6 transition-all duration-500", !location.address && "opacity-30 grayscale pointer-events-none")}>
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Step 2: Required Assistance</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SERVICES.filter(s => !s.isAddOn).map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service)}
                    className="glass-card p-4 flex flex-col items-start gap-2 text-left transition-all hover:border-slate-yellow group relative overflow-hidden"
                  >
                    <div className={cn("p-2 rounded-full text-white shadow-sm group-hover:scale-110 transition-transform", service.color)}>
                      <service.icon size={20} />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between items-start w-full">
                        <h3 className="font-bold text-slate-100 text-sm leading-tight uppercase tracking-tight">{service.title}</h3>
                        <span className="text-[10px] font-black text-slate-yellow">₹{service.price}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{service.subtitle}</p>
                      <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        <Loader2 size={10} className="animate-spin text-slate-yellow" />
                        {service.eta}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* My Vehicles Quick Select */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quick Vehicle Profile</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {vehicles.map(v => (
                    <button 
                      key={v.id}
                      onClick={() => {
                        setVehicleInfo(`${v.color} ${v.make} ${v.model} (${v.plate})`);
                        toast.success(`Vehicle selected: ${v.make} ${v.model}`);
                      }}
                      className="glass-card p-3 flex flex-col gap-1 min-w-[140px] shrink-0 border-subtle hover:border-slate-yellow/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <Car size={14} className="text-slate-yellow" />
                        <span className="text-[8px] font-black bg-slate-yellow/10 text-slate-yellow px-1.5 py-0.5 rounded uppercase">{v.plate.split('-')[0]}</span>
                      </div>
                      <span className="text-xs font-black text-slate-100">{v.make} {v.model}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{v.color} • {v.plate}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact Always Visible */}
            <div className="bg-viyeko-red/10 border border-viyeko-red/20 rounded-full p-5 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-viyeko-red/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-viyeko-red p-3 rounded-full text-white shadow-lg shadow-viyeko-red/20">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-slate-100 font-black text-sm italic tracking-tight">EMERGENCY HOTLINE</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Immediate Police/Medical Response</p>
                </div>
              </div>
              <a href="tel:112" className="bg-viyeko-red text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-viyeko-red-dark transition-all shadow-lg shadow-viyeko-red/20 active:scale-95 relative z-10 uppercase">Call 112</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL OVERLAYS (Highest to Lowest Z-Index) */}

      {/* 1. LOCATION PICKER (Highest Priority) */}
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
                  className="p-2 bg-subtle rounded-full text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <button
                  onClick={getCurrentLocation}
                  className="w-full bg-slate-yellow text-charcoal rounded-full p-4 flex items-center gap-4 font-black uppercase tracking-widest hover:opacity-90 transition-all shrink-0 shadow-lg shadow-slate-yellow/20"
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    <Navigation size={20} />
                  </div>
                  <span>Use GPS Precision</span>
                </button>

                <div className="relative shrink-0">
                  <input 
                    type="text" 
                    placeholder="Search Chandigarh, Mohali, Ludhiana..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-subtle border border-subtle rounded-full py-4 px-6 pl-12 text-sm font-bold focus:outline-none focus:border-slate-yellow transition-all text-slate-100 placeholder:text-slate-600"
                  />
                  <MapPin className="absolute left-4 top-4.5 text-slate-yellow" size={18} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide pt-2">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-4 mb-2">Popular Regions</p>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocation({ address: loc });
                        setShowLocationPicker(false);
                        toast.success(`Dispatch region set: ${loc}`);
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

      {/* 2. PAYMENT GATEWAY */}
      <AnimatePresence>
        {showPayment && selectedService && (
          <PaymentGate 
            amount={(selectedService?.price || 0) + selectedAddOns.reduce((acc, id) => acc + (SERVICES.find(s => s.id === id)?.price || 0), 0)}
            serviceTitle={selectedService.title}
            onSuccess={confirmAndDispatch}
            onCancel={() => setShowPayment(false)}
          />
        )}
      </AnimatePresence>

      {/* 3. SERVICE REQUEST MODAL */}
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
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={cn("p-4 rounded-full text-white shadow-lg", selectedService.color)}>
                    <selectedService.icon size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100 italic uppercase">{selectedService.title}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Base Dispatch: ₹{selectedService.price}</p>
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
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vehicle Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. White Maruti Swift (CH01-XX-0000)"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    className="input-viyeko w-full font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rescue Add-ons</label>
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
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-black uppercase tracking-tight">{addon.title}</span>
                          <span className="text-[10px] font-black">₹{addon.price}</span>
                        </div>
                        <span className="text-[8px] opacity-70 font-bold uppercase">{addon.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-viyeko-primary w-full disabled:opacity-50 shadow-xl shadow-slate-yellow/10"
                >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                    <div className="flex items-center gap-3">
                      <span>Secure Checkout</span>
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
