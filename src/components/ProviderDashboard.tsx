import React, { useEffect } from 'react';
import { motion } from 'motion/react';
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
  Star
} from 'lucide-react';
import { Request, SERVICES } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useProvider } from '../hooks/useProvider';

interface ProviderDashboardProps {
  requests: Request[];
  onAccept: (requestId: string) => void;
  onComplete: (requestId: string) => void;
  userId: string;
}

export default function ProviderDashboard({ requests, onAccept, onComplete, userId }: ProviderDashboardProps) {
  const { profile, toggleOnlineStatus, updateLocation } = useProvider(userId);
  const activeJobs = requests.filter(r => r.status !== 'completed');
  
  const stats = [
    { label: 'Total Earnings', value: `₹${(profile?.total_jobs || 0) * 1250}`, icon: TrendingUp, trend: '+15%', color: 'text-emerald-400' },
    { label: 'Rating', value: profile?.rating?.toFixed(1) || '5.0', icon: Star, trend: 'Top Rated', color: 'text-slate-yellow' },
    { label: 'Active Requests', value: activeJobs.length.toString(), icon: Activity, trend: 'Nearby', color: 'text-viyeko-red' },
  ];

  // Track provider location when online
  useEffect(() => {
    if (profile?.is_online && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [profile?.is_online]);

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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certified Rescue Provider</p>
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
              <p className="text-3xl font-black text-slate-100">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Jobs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-100 italic tracking-tight uppercase">Incoming Requests</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Real-time alerts for Punjab & Chandigarh</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
          </div>
        </div>

        {activeJobs.length === 0 ? (
          <div className="py-20 text-center space-y-4 glass-card border-dashed border-subtle">
            <div className="bg-subtle w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-600">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-100 font-bold uppercase tracking-widest text-xs">No active requests</p>
              <p className="text-slate-500 text-[10px]">We'll notify you when a driver needs help nearby.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeJobs.map((req) => {
              const service = SERVICES.find(s => s.id === req.serviceId);
              return (
                <motion.div 
                  key={req.id} 
                  layout
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
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payout</p>
                      <p className="text-xl font-black text-slate-yellow">₹{req.totalCost}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-subtle">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center text-slate-500 shrink-0">
                        <MapPin size={16} />
                      </div>
                      <span className="font-medium truncate">{req.location.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center text-slate-500 shrink-0">
                        <Car size={16} />
                      </div>
                      <span className="font-medium">{req.vehicleInfo}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {req.status === 'searching' || req.status === 'assigned' ? (
                      <button 
                        onClick={() => onAccept(req.id)}
                        className="flex-1 h-12 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        Accept Job
                        <ArrowUpRight size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => onComplete(req.id)}
                        className="flex-1 h-12 bg-slate-yellow text-charcoal rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-yellow/90 transition-all flex items-center justify-center gap-2"
                      >
                        Complete Job
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button className="w-12 h-12 bg-subtle border border-subtle text-slate-400 rounded-full flex items-center justify-center hover:opacity-80 transition-colors">
                      <Phone size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
