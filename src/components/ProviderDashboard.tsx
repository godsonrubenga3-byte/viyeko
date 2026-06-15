import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  MapPin, 
  Car, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Send,
  Bell
} from 'lucide-react';
import { Request, SERVICES, Bid } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useProvider } from '../hooks/useProvider';
import { ably, ABLY_CHANNELS } from '../lib/ably';
import BidInput from './BidInput';
import { toast } from 'sonner';

interface ProviderDashboardProps {
  requests: Request[];
  onAccept: (requestId: string) => void;
  onComplete: (requestId: string) => void;
  onSendBid: (requestId: string, bid: Bid) => void;
  userId: string;
}

export default function ProviderDashboard({ requests, onAccept, onComplete, onSendBid, userId }: ProviderDashboardProps) {
  const { profile, toggleOnlineStatus, updateLocation } = useProvider(userId);
  const [biddingRequestId, setBiddingRequestId] = useState<string | null>(null);
  const [localRequests, setLocalRequests] = useState<Request[]>([]);

  // ABLY INTEGRATION: Mechanics listen for regional broadcasts
  useEffect(() => {
    if (!ably || !profile?.is_online) return;

    // Mechanics listen for the primary Tanzania broadcast channel
    const channel = ably.channels.get(ABLY_CHANNELS.regionBroadcast('Tanzania'));

    channel.subscribe('new-breakdown', (message) => {
      const newReq: Request = message.data;
      setLocalRequests(prev => {
        if (prev.some(r => r.id === newReq.id)) return prev;
        return [newReq, ...prev];
      });
      toast('NEW RESCUE REQUEST NEARBY', {
        description: `${newReq.vehicleInfo} at ${newReq.location.address}`,
        icon: <Bell className="text-slate-yellow" />,
        duration: 8000
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.is_online, profile?.current_location]);

  // Combine DB requests with real-time Ably broadcasts
  const allAvailable = [...localRequests, ...requests.filter(r => r.status === 'searching' || r.status === 'bidding')];
  const uniqueAvailable = Array.from(new Map(allAvailable.map(r => [r.id, r])).values());
  
  const assignedJobs = requests.filter(r => r.status === 'assigned' || r.status === 'on-the-way' || r.status === 'arrived' || r.status === 'in-progress');
  
  const stats = [
    { label: 'Total Earnings', value: `TZS ${((profile?.total_jobs || 0) * 25000).toLocaleString()}`, icon: TrendingUp, trend: '+15%', color: 'text-emerald-400' },
    { label: 'Rating', value: profile?.rating?.toFixed(1) || '5.0', icon: Star, trend: 'Top Rated', color: 'text-slate-yellow' },
    { label: 'Live Requests', value: uniqueAvailable.length.toString(), icon: Activity, trend: 'Nearby', color: 'text-viyeko-red' },
  ];

  // Track provider location when online
  useEffect(() => {
    if (profile?.is_online && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [profile?.is_online, updateLocation]);

  const handleSendBid = (price: number, eta: number) => {
    if (!biddingRequestId || !profile) return;
    
    const newBid: Bid = {
      id: Math.random().toString(36).substr(2, 9),
      providerId: profile.id,
      providerName: profile.full_name,
      price,
      eta,
      timestamp: Date.now(),
      rating: profile.rating
    };

    onSendBid(biddingRequestId, newBid);
    setBiddingRequestId(null);
    toast.success('Bid sent to driver!');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Provider ID Card */}
      <div className="glass-card p-6 border-l-4 border-l-slate-yellow flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-yellow/10 border border-slate-yellow/20 flex items-center justify-center text-slate-yellow">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100 uppercase italic">{profile?.full_name}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certified Rescue Provider (TZ)</p>
          </div>
        </div>
        <button 
          onClick={toggleOnlineStatus}
          className={cn(
            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            profile?.is_online 
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
              : "bg-subtle text-slate-500 border border-subtle"
          )}
        >
          {profile?.is_online ? "ONLINE" : "OFFLINE"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col gap-2 border-subtle relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-subtle rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-slate-500/10 transition-colors" />
            <div className="flex justify-between items-start relative z-10">
              <div className="p-2 bg-subtle rounded-full text-slate-400">
                <stat.icon size={20} />
              </div>
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full bg-subtle", stat.color)}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-100">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {biddingRequestId ? (
          <BidInput 
            key="bid-input"
            requestId={biddingRequestId}
            serviceTitle={uniqueAvailable.find(r => r.id === biddingRequestId)?.serviceId || 'Service'}
            onSend={handleSendBid}
            onCancel={() => setBiddingRequestId(null)}
          />
        ) : (
          <div className="space-y-8">
            {/* 1. AVAILABLE TASKS (To Bid On) */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-100 italic tracking-tight uppercase">Rescue Opportunities</h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Nearby drivers needing immediate help</p>
                </div>
              </div>

              {uniqueAvailable.length === 0 ? (
                <div className="py-16 text-center space-y-4 glass-card border-dashed border-subtle bg-transparent">
                  <div className="bg-subtle w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Activity size={32} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-100 font-bold uppercase tracking-widest text-xs">Waiting for Broadcasts...</p>
                    <p className="text-slate-500 text-[10px]">New requests from Dar es Salaam and regions appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uniqueAvailable.map((req) => {
                    const service = SERVICES.find(s => s.id === req.serviceId);
                    const myBid = req.bids?.find(b => b.providerId === profile?.id);
                    
                    return (
                      <motion.div 
                        key={req.id} 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 space-y-4 border-l-4 border-l-slate-yellow group hover:border-l-emerald-500 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-full text-white shadow-lg", service?.color)}>
                              {service && <service.icon size={24} />}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-100 text-lg leading-tight italic uppercase tracking-tight">{service?.title}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{format(req.timestamp, 'h:mm a')} • {req.id}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-subtle">
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <MapPin size={16} className="text-viyeko-red" />
                            <span className="font-medium truncate">{req.location.address}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Car size={16} className="text-slate-500" />
                            <span className="font-medium">{req.vehicleInfo}</span>
                          </div>
                        </div>

                        <div className="pt-4">
                          {myBid ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex justify-between items-center px-4">
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Bid Active</span>
                              <span className="text-sm font-black text-slate-100">TZS {myBid.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setBiddingRequestId(req.id)}
                              className="w-full h-12 bg-slate-yellow text-charcoal rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-yellow/10"
                            >
                              Quote Your Price
                              <ArrowUpRight size={18} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. MY ACTIVE JOBS (Assigned to Me) */}
            {assignedJobs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">My Rescue Missions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedJobs.map((req) => {
                    const service = SERVICES.find(s => s.id === req.serviceId);
                    return (
                      <div key={req.id} className="glass-card p-6 border-l-4 border-l-emerald-500 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-full text-white shadow-lg", service?.color)}>
                              {service && <service.icon size={24} />}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-100 text-lg leading-tight uppercase tracking-tight">{service?.title}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{req.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-yellow italic">TZS {req.totalCost?.toLocaleString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onComplete(req.id)}
                          className="w-full h-12 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                          Mark as Completed
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
