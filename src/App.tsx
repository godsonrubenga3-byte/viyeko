import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  Phone, 
  History, 
  MapPin, 
  ChevronRight, 
  X, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Moon,
  Sun,
  Car,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { SERVICES, ServiceType, Request, Service, User as UserType, Vehicle } from './types';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { Toaster, toast } from 'sonner';

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

const MockMap = ({ className, showProviders = false }: { className?: string, showProviders?: boolean }) => (
  <div className={cn("relative w-full h-48 bg-charcoal-light/20 rounded-3xl overflow-hidden map-grid border border-white/5", className)}>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-12 h-12">
        <div className="pulse-ring" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-slate-yellow rounded-full shadow-[0_0_15px_rgba(230,208,93,0.6)]" />
        </div>
      </div>
    </div>
    {showProviders && (
      <>
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-viyeko-red rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-viyeko-blue rounded-full opacity-50 animate-pulse" />
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-slate-yellow rounded-full opacity-30 animate-ping" />
      </>
    )}
    <div className="absolute top-10 left-10 text-[8px] font-bold text-slate-600 uppercase tracking-widest">Chandigarh Sector 17</div>
    <div className="absolute bottom-10 right-10 text-[8px] font-bold text-slate-600 uppercase tracking-widest">Mohali Phase 7</div>
  </div>
);

const LiveTracking = ({ request, onCancel, onNextStep }: { request: Request, onCancel: () => void, onNextStep?: () => void }) => {
  const service = SERVICES.find(s => s.id === request.serviceId);
  const steps = [
    { id: 'searching', label: 'Searching', icon: Zap },
    { id: 'assigned', label: 'Assigned', icon: ShieldCheck },
    { id: 'on-the-way', label: 'On the Way', icon: Car },
    { id: 'arrived', label: 'Arrived', icon: MapPin },
    { id: 'in-progress', label: 'In Progress', icon: Activity },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === request.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6 border-l-4 border-l-slate-yellow relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-yellow/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl text-white shadow-lg", service?.color)}>
            {service && <service.icon size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100">{service?.title}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Request • {request.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onNextStep && request.status !== 'completed' && (
            <button 
              onClick={onNextStep}
              className="p-2 bg-slate-yellow/10 text-slate-yellow rounded-full hover:bg-slate-yellow/20 transition-colors"
              title="Simulate Progress"
            >
              <ChevronRight size={20} />
            </button>
          )}
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <MockMap showProviders={request.status === 'searching'} />

      <div className="relative pl-8 space-y-6 relative z-10">
        <div className="timeline-line" />
        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div key={step.id} className="relative flex items-center gap-4">
              <div className={cn("timeline-dot", isActive && "timeline-dot-active")}>
                <step.icon size={12} />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-slate-100" : "text-slate-600")}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-slate-yellow font-medium animate-pulse">
                    {request.status === 'searching' ? 'Finding nearby providers...' : 
                     request.status === 'assigned' ? 'Provider assigned! Preparing to move...' :
                     request.status === 'on-the-way' ? 'Provider is moving to your location' :
                     request.status === 'arrived' ? 'Provider has arrived!' :
                     request.status === 'in-progress' ? 'Service is being performed' :
                     'Service completed!'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-charcoal-light border border-white/10 flex items-center justify-center text-slate-400">
            <Phone size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Support</span>
            <span className="text-xs font-bold text-slate-200">Dispatch Center</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none block">ETA</span>
          <span className="text-lg font-black text-slate-yellow">{request.estimatedArrival} MINS</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat?: number; lng?: number; address: string }>({ address: '' });
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProviderMode, setIsProviderMode] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);
  const [user, setUser] = useState<UserType>({
    name: 'Godson Rubenga',
    phone: '+91 98765 43210',
    email: 'godsonrubenga3@gmail.com',
    avatar: 'https://picsum.photos/seed/user/200/200'
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', make: 'Maruti', model: 'Swift', plate: 'CH01-XX-0000', color: 'White' },
    { id: '2', make: 'Hyundai', model: 'i20', plate: 'PB65-YY-1111', color: 'Red' }
  ]);

  const activeRequest = requests.find(r => r.status !== 'completed');

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('viyeko_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('viyeko_theme', 'light');
    }
  };

  const toggleProviderMode = () => {
    setIsProviderMode(!isProviderMode);
    setActiveTab('home');
  };

  // Load requests from localStorage for offline support
  useEffect(() => {
    const saved = localStorage.getItem('viyeko_requests');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load requests', e);
      }
    }
    
    const theme = localStorage.getItem('viyeko_theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save requests to localStorage
  useEffect(() => {
    localStorage.setItem('viyeko_requests', JSON.stringify(requests));
  }, [requests]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const requestId = Math.random().toString(36).substr(2, 9);
    const totalCost = (selectedService.price || 0) + 
                     selectedAddOns.reduce((acc, id) => acc + (SERVICES.find(s => s.id === id)?.price || 0), 0);

    const newRequest: Request = {
      id: requestId,
      serviceId: selectedService.id,
      addOnIds: selectedAddOns,
      status: 'searching',
      location,
      timestamp: Date.now(),
      vehicleInfo,
      notes,
      estimatedArrival: Math.floor(Math.random() * 10) + 10, // 10-20 mins
      totalCost
    };

    setRequests([newRequest, ...requests]);
    setIsSubmitting(false);
    setSelectedService(null);
    setSelectedAddOns([]);
    setVehicleInfo('');
    setNotes('');
    setLastRequestId(requestId);
    toast.success('Request sent successfully!');
  };

  const advanceStatus = (requestId: string) => {
    const statusOrder: Request['status'][] = ['searching', 'assigned', 'on-the-way', 'arrived', 'in-progress', 'completed'];
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        const currentIndex = statusOrder.indexOf(r.status);
        const nextStatus = statusOrder[currentIndex + 1] || 'completed';
        
        if (nextStatus === 'assigned') toast.info('Provider assigned!');
        if (nextStatus === 'on-the-way') toast.info('Provider is on the way!');
        if (nextStatus === 'arrived') toast.success('Provider has arrived!');
        if (nextStatus === 'completed') toast.success('Service completed!');

        return { 
          ...r, 
          status: nextStatus,
          estimatedArrival: nextStatus === 'completed' ? 0 : Math.max(0, (r.estimatedArrival || 0) - 3)
        };
      }
      return r;
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)} (Punjab/Chandigarh Region)`
          });
          setShowLocationPicker(false);
        },
        (error) => {
          console.error('Error getting location', error);
          setLocation({ address: 'Chandigarh Sector 17, Punjab' }); // Fallback
          setShowLocationPicker(false);
        }
      );
    }
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-charcoal flex flex-col md:flex-row w-full max-w-md md:max-w-6xl mx-auto shadow-2xl relative overflow-hidden font-sans transition-colors duration-300 edge-lighting">
      <Toaster position="top-center" richColors />
      {/* Header / Sidebar */}
      <header className="bg-charcoal text-white p-6 pt-8 md:pt-16 md:w-80 md:rounded-b-none md:rounded-r-[3rem] shadow-lg z-10 relative overflow-hidden flex flex-col shrink-0 border-r border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-yellow/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex md:flex-col justify-between items-center md:items-start mb-2 md:mb-8 relative z-10 gap-6">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic text-slate-yellow">VIYEKO</h1>
          
          {/* User Profile Summary */}
          <div className="hidden md:flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 w-full">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-yellow/50" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-100">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-bold">{user.phone}</span>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-start gap-3 w-full">
            <button 
              onClick={toggleProviderMode}
              className={cn(
                "px-3 py-1.5 md:w-full md:text-center rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                isProviderMode ? "bg-slate-yellow text-charcoal" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {isProviderMode ? "Provider Mode" : "User Mode"}
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 md:w-full md:justify-center"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-sm font-medium relative z-10 mb-8 hidden md:block">Reliable Roadside Assistance in Punjab & Chandigarh</p>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-col gap-2 relative z-10">
          <button 
            onClick={() => setActiveTab('home')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
              activeTab === 'home' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-white/5"
            )}
          >
            <Navigation size={20} />
            Home
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
              activeTab === 'history' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-white/5"
            )}
          >
            <History size={20} />
            History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs",
              activeTab === 'profile' ? "bg-slate-yellow text-charcoal shadow-lg shadow-slate-yellow/20" : "text-slate-400 hover:bg-white/5"
            )}
          >
            <Activity size={20} />
            Profile
          </button>
        </div>

        <div className="mt-auto relative z-10 hidden md:block">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Support</p>
            <p className="text-xs text-slate-300">Need help? Call our 24/7 dispatch center.</p>
            <a href="tel:112" className="mt-3 block text-center bg-white/10 hover:bg-white/20 py-2 rounded-xl text-xs font-bold transition-colors">112 Emergency</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-0 px-6 pb-24 md:pt-4 md:px-12 md:pb-12 scrollbar-hide">
        <AnimatePresence mode="wait">
          {isProviderMode ? (
            <motion.div
              key="provider"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-500">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Earnings</span>
                  </div>
                  <span className="text-2xl font-black text-slate-yellow">₹12,450</span>
                  <p className="text-[9px] text-emerald-400 font-bold">+12% from yesterday</p>
                </div>
                <div className="glass-card p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Activity size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Jobs</span>
                  </div>
                  <span className="text-2xl font-black text-slate-100">{requests.filter(r => r.status !== 'completed').length}</span>
                  <p className="text-[9px] text-slate-500 font-bold">Punjab & Chandigarh</p>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tight">INCOMING REQUESTS</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Real-time alerts nearby</p>
              </div>

              {requests.filter(r => r.status !== 'completed').length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="bg-charcoal-light w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No active requests nearby</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.filter(r => r.status !== 'completed').map((req) => {
                    const service = SERVICES.find(s => s.id === req.serviceId);
                    return (
                      <div key={req.id} className="glass-card p-5 space-y-4 border-l-4 border-l-amber-500">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg text-white", service?.color)}>
                              {service && <service.icon size={18} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{service?.title}</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">{format(req.timestamp, 'MMM d, h:mm a')}</p>
                            </div>
                          </div>
                          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            {req.status}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="font-medium">{req.location.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Car size={14} className="text-slate-400" />
                            <span>Vehicle: {req.vehicleInfo}</span>
                          </div>
                          {req.addOnIds && req.addOnIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {req.addOnIds.map(id => (
                                <span key={id} className="bg-charcoal-light text-[9px] px-2 py-0.5 rounded-full text-slate-400 border border-white/5">
                                  +{SERVICES.find(s => s.id === id)?.title}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Payout</span>
                            <span className="text-sm font-black text-slate-yellow">₹{req.totalCost}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => {
                              const updated = requests.map(r => 
                                r.id === req.id ? { 
                                  ...r, 
                                  status: 'on-the-way' as const,
                                  estimatedArrival: r.estimatedArrival ? Math.max(5, Math.floor(r.estimatedArrival * 0.6)) : 15
                                } : r
                              );
                              setRequests(updated);
                            }}
                            className="flex-1 bg-slate-900 dark:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                          >
                            Accept Job
                          </button>
                          <button 
                            onClick={() => {
                              const updated = requests.map(r => 
                                r.id === req.id ? { ...r, status: 'completed' as const, estimatedArrival: 0 } : r
                              );
                              setRequests(updated);
                            }}
                            className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                          >
                            Mark Done
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {activeRequest ? (
                <LiveTracking 
                  request={activeRequest} 
                  onCancel={() => {
                    const updated = requests.map(r => r.id === activeRequest.id ? { ...r, status: 'completed' as const } : r);
                    setRequests(updated);
                    toast.error('Request cancelled');
                  }}
                  onNextStep={() => advanceStatus(activeRequest.id)}
                />
              ) : (
                <>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-100 italic tracking-tight">HOW CAN WE HELP?</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Select a service to get started</p>
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
                          <div className={cn("p-2 rounded-xl text-white shadow-sm group-hover:scale-110 transition-transform", service.color)}>
                            <service.icon size={20} />
                          </div>
                          <div className="w-full">
                            <div className="flex justify-between items-start w-full">
                              <h3 className="font-bold text-slate-100 text-sm leading-tight">{service.title}</h3>
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
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">My Vehicles</h3>
                      <button onClick={() => setActiveTab('profile')} className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest hover:underline">Manage</button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {vehicles.map(v => (
                        <button 
                          key={v.id}
                          onClick={() => {
                            setVehicleInfo(`${v.color} ${v.make} ${v.model} (${v.plate})`);
                            toast.success(`Selected ${v.make} ${v.model}`);
                          }}
                          className="glass-card p-3 flex flex-col gap-1 min-w-[140px] shrink-0 border-white/5 hover:border-slate-yellow/50 transition-all"
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

                  {/* Emergency Contact */}
                  <div className="bg-viyeko-red/10 border border-viyeko-red/20 rounded-3xl p-5 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-viyeko-red/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="bg-viyeko-red p-3 rounded-2xl text-white shadow-lg shadow-viyeko-red/20">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-slate-100 font-black text-sm italic tracking-tight">EMERGENCY HOTLINE</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Available 24/7 in Chandigarh</p>
                      </div>
                    </div>
                    <a href="tel:112" className="bg-viyeko-red text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-viyeko-red-dark transition-all shadow-lg shadow-viyeko-red/20 active:scale-95 relative z-10">CALL 112</a>
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tight">MY REQUESTS</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{requests.length} Total</span>
              </div>

              {requests.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="bg-charcoal-light w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <History size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => {
                    const service = SERVICES.find(s => s.id === req.serviceId);
                    return (
                      <div key={req.id} className="glass-card p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg text-white", service?.color)}>
                              {service && <service.icon size={18} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-100 text-sm">{service?.title}</h4>
                              <p className="text-[10px] text-slate-500">{format(req.timestamp, 'MMM d, h:mm a')}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                            req.status === 'pending' ? "bg-slate-yellow/10 text-slate-yellow" : "bg-emerald-900/30 text-emerald-400"
                          )}>
                            {req.status}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin size={14} className="text-slate-500" />
                            <span className="truncate">{req.location.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Navigation size={14} className="text-slate-500" />
                            <span>Vehicle: {req.vehicleInfo}</span>
                          </div>
                          {req.addOnIds && req.addOnIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {req.addOnIds.map(id => (
                                <span key={id} className="bg-white/5 text-[9px] px-2 py-0.5 rounded-full text-slate-500">
                                  +{SERVICES.find(s => s.id === id)?.title}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Paid</span>
                            <span className="text-sm font-black text-slate-yellow">₹{req.totalCost}</span>
                          </div>
                          {req.status !== 'completed' && req.estimatedArrival !== undefined && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-yellow bg-slate-yellow/10 p-2 rounded-lg">
                              <Loader2 size={14} className="animate-spin" />
                              <span>Estimated Arrival: {req.estimatedArrival} mins</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="relative">
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-2 border-slate-yellow shadow-xl shadow-slate-yellow/20" />
                  <div className="absolute bottom-0 right-0 bg-slate-yellow text-charcoal p-1.5 rounded-full border-2 border-charcoal">
                    <Zap size={14} />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-100 italic tracking-tight">{user.name}</h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Premium Member since 2024</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Account Information</h3>
                  <div className="glass-card p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">{user.phone}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">{user.email}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">My Vehicles</h3>
                    <button className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest">+ Add New</button>
                  </div>
                  <div className="space-y-3">
                    {vehicles.map(v => (
                      <div key={v.id} className="glass-card p-4 flex items-center justify-between group hover:border-slate-yellow/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-white/5 p-3 rounded-2xl text-slate-yellow">
                            <Car size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-100 text-sm leading-none mb-1">{v.make} {v.model}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{v.color} • {v.plate}</p>
                          </div>
                        </div>
                        <button className="text-slate-600 hover:text-slate-400 transition-colors">
                          <History size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Settings</h3>
                  <div className="glass-card p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">Privacy & Security</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-500" />
                        <span className="text-sm font-bold text-slate-300">Emergency Contacts</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 rounded-2xl bg-white/5 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all">
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="bg-charcoal border-t border-white/5 p-4 flex justify-around items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20 transition-colors duration-300 md:hidden">
        <button 
          onClick={() => setActiveTab('home')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'home' ? "text-slate-yellow" : "text-slate-500"
          )}
        >
          <Navigation size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'history' ? "text-slate-yellow" : "text-slate-500"
          )}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'profile' ? "text-slate-yellow" : "text-slate-500"
          )}
        >
          <Activity size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-charcoal w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 space-y-6 shadow-2xl h-[80vh] flex flex-col border-t border-white/5"
            >
              <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-black text-slate-100">Select Location</h2>
                <button 
                  onClick={() => setShowLocationPicker(false)}
                  className="p-2 bg-charcoal-light rounded-full text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <button
                  onClick={getCurrentLocation}
                  className="w-full bg-slate-yellow/10 border border-slate-yellow/20 rounded-2xl p-4 flex items-center gap-4 text-slate-yellow font-bold hover:bg-slate-yellow/20 transition-all shrink-0"
                >
                  <div className="bg-slate-yellow p-2 rounded-xl text-charcoal">
                    <Navigation size={20} />
                  </div>
                  <span>Use Current Location</span>
                </button>

                <div className="relative shrink-0">
                  <input 
                    type="text" 
                    placeholder="Search areas in Punjab/Chandigarh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-charcoal-light border border-white/10 rounded-xl py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-yellow/20 focus:border-slate-yellow transition-all text-slate-100"
                  />
                  <MapPin className="absolute left-3 top-3.5 text-slate-yellow" size={18} />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2">Popular Areas</p>
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocation({ address: loc });
                        setShowLocationPicker(false);
                      }}
                      className="w-full p-4 rounded-xl border border-white/5 hover:border-slate-yellow hover:bg-slate-yellow/5 flex items-center gap-3 transition-all text-left"
                    >
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                      <span className="text-sm font-medium text-slate-300">{loc}</span>
                    </button>
                  ))}
                  {filteredLocations.length === 0 && (
                    <div className="py-10 text-center text-slate-400 dark:text-slate-600 text-sm">
                      No matching locations found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-charcoal w-full max-w-md rounded-t-[2.5rem] p-8 pb-12 space-y-6 shadow-2xl border-t border-white/5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl text-white shadow-lg", selectedService.color)}>
                    <selectedService.icon size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100">{selectedService.title}</h2>
                    <p className="text-slate-400 text-[10px] font-medium">Base Price: ₹{selectedService.price}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedService(null);
                    setSelectedAddOns([]);
                  }}
                  className="p-2 bg-charcoal-light rounded-full text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full bg-charcoal-light/50 border border-white/10 rounded-2xl py-4 px-4 flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-viyeko-red/50 focus:border-viyeko-red transition-all text-slate-100"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MapPin className="text-viyeko-red shrink-0" size={18} />
                      <span className={cn("truncate", !location.address && "text-slate-500")}>
                        {location.address || "Select your location"}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vehicle Details</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. White Maruti Swift (CH01-XX-0000)"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    className="input-viyeko w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Add-ons (Optional)</label>
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
                          "p-3 rounded-xl border text-left transition-all flex flex-col gap-1",
                          selectedAddOns.includes(addon.id) 
                            ? "bg-viyeko-red/10 border-viyeko-red text-viyeko-red" 
                            : "bg-charcoal-light/30 border-white/5 text-slate-400 hover:border-white/20"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{addon.title}</span>
                          <span className="text-[10px] font-black">₹{addon.price}</span>
                        </div>
                        <span className="text-[9px] opacity-70">{addon.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Additional Notes</label>
                  <textarea 
                    placeholder="Describe the issue..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-viyeko w-full h-20 resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Cost</span>
                    <span className="text-xl font-black text-slate-yellow">
                      ₹{(selectedService.price || 0) + selectedAddOns.reduce((acc, id) => acc + (SERVICES.find(s => s.id === id)?.price || 0), 0)}
                    </span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-viyeko-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Request
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {lastRequestId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-charcoal w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl text-center border border-white/5"
            >
                <div className="bg-emerald-100/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-2">
                  <CheckCircle2 size={40} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-100">Request Confirmed!</h2>
                  <p className="text-slate-400 text-sm">We've received your request and are assigning a provider.</p>
                </div>

                {requests.find(r => r.id === lastRequestId) && (
                  <div className="bg-slate-yellow/10 border border-slate-yellow/20 rounded-2xl p-6 space-y-2">
                    <p className="text-[10px] font-bold text-slate-yellow uppercase tracking-widest">Estimated Arrival</p>
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={24} className="text-slate-yellow animate-spin" />
                      <span className="text-3xl font-black text-slate-100">
                        {requests.find(r => r.id === lastRequestId)?.estimatedArrival} mins
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">This will update as the provider moves</p>
                  </div>
                )}

              <button 
                onClick={() => {
                  setLastRequestId(null);
                  setActiveTab('history');
                }}
                className="btn-viyeko-primary w-full"
              >
                Track Progress
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
