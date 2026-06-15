import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Car, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface MapContainerProps {
  userLocation?: { lat: number, lng: number, address: string };
  providerLocation?: { lat: number, lng: number };
  status: 'searching' | 'bidding' | 'assigned' | 'on-the-way' | 'arrived' | 'in-progress' | 'completed';
  className?: string;
}

export default function MapContainer({ userLocation, providerLocation, status, className }: MapContainerProps) {
  // Simulate coordinates for a 100x100 grid
  const userPos = { x: 50, y: 50 };
  
  const providerPos = useMemo(() => {
    switch (status) {
      case 'searching': 
      case 'bidding': return null;
      case 'assigned': return { x: 20, y: 20 };
      case 'on-the-way': return { x: 35, y: 35 };
      case 'arrived': return { x: 48, y: 48 };
      case 'in-progress': return { x: 50, y: 50 };
      case 'completed': return { x: 50, y: 50 };
      default: return null;
    }
  }, [status]);

  return (
    <div className={cn("relative w-full h-full bg-subtle rounded-[2.5rem] overflow-hidden border border-subtle map-grid", className)}>
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-slate-500/20" style={{ left: `${(i + 1) * 10}%` }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-slate-500/20" style={{ top: `${(i + 1) * 10}%` }} />
        ))}
      </div>

      {/* User Marker */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute"
        style={{ left: `${userPos.x}%`, top: `${userPos.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          <div className="pulse-ring absolute inset-0 -m-4" />
          <div className="w-6 h-6 bg-slate-yellow rounded-full shadow-[0_0_20px_rgba(230,208,93,0.6)] flex items-center justify-center relative z-10 border-2 border-charcoal">
            <MapPin size={12} className="text-charcoal" />
          </div>
        </div>
      </motion.div>

      {/* Provider Marker */}
      {providerPos && (
        <motion.div 
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            left: `${providerPos.x}%`, 
            top: `${providerPos.y}%`,
            opacity: 1
          }}
          transition={{ type: "spring", damping: 20, stiffness: 80 }}
          className="absolute"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            {status === 'on-the-way' && (
              <div className="absolute inset-0 -m-3 border-2 border-dashed border-emerald-500/50 rounded-full animate-spin-slow" />
            )}
            <div className={cn(
              "w-10 h-10 rounded-full shadow-xl flex items-center justify-center relative z-10 border-2 border-charcoal transition-colors duration-500",
              status === 'on-the-way' ? "bg-emerald-500" : "bg-viyeko-red"
            )}>
              <Car size={20} className="text-white" />
            </div>
            
            {/* ETA Tag */}
            {status === 'on-the-way' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-md px-2 py-1 rounded-lg border border-subtle whitespace-nowrap"
              >
                <span className="text-[8px] font-black text-slate-yellow uppercase tracking-tighter">ETA 8 MIN</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Path Line (Simulated) */}
      {status === 'on-the-way' && providerPos && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.line
            x1={`${providerPos.x}%`}
            y1={`${providerPos.y}%`}
            x2={`${userPos.x}%`}
            y2={`${userPos.y}%`}
            stroke="rgba(16, 185, 129, 0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        </svg>
      )}

      {/* Map Labels */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-1">
        <div className="flex items-center gap-2 bg-charcoal/60 backdrop-blur-md p-2 rounded-full border border-subtle px-4">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Secure Dispatch Region</span>
        </div>
      </div>

      <div className="absolute top-6 right-6">
        <div className="bg-charcoal/60 backdrop-blur-md p-2 rounded-full border border-subtle flex flex-col items-end px-4">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Satellite Active</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-200">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
