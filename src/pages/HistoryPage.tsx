import React from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, MapPin, Navigation, Loader2 } from 'lucide-react';
import { format, toZonedTime } from 'date-fns-tz';
import { Request, SERVICES } from '../types';
import { cn } from '../lib/utils';

interface HistoryPageProps {
  requests: Request[];
}

export default function HistoryPage({ requests }: HistoryPageProps) {
  const timeZone = 'Africa/Dar_es_Salaam';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-100 italic tracking-tight uppercase">Rescue History</h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{requests.length} Total</span>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="bg-subtle w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <HistoryIcon size={32} />
          </div>
          <p className="text-slate-500 font-medium italic">No rescues recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const service = SERVICES.find(s => s.id === req.serviceId);
            const zonedDate = toZonedTime(new Date(req.timestamp), timeZone);
            
            return (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg text-white shadow-sm", service?.color)}>
                      {service && <service.icon size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm uppercase tracking-tight italic">{service?.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {format(zonedDate, 'MMM d, h:mm a', { timeZone })} EAT
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                    req.status === 'searching' ? "bg-slate-yellow/10 text-slate-yellow border border-slate-yellow/20" : "bg-emerald-900/30 text-emerald-400 border border-emerald-500/20"
                  )}>
                    {req.status}
                  </div>
                </div>
                <div className="pt-2 border-t border-subtle space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin size={14} className="text-viyeko-red" />
                    <span className="truncate font-medium">{req.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Navigation size={14} className="text-slate-500" />
                    <span className="font-medium">Vehicle: {req.vehicleInfo}</span>
                  </div>
                  {req.addOnIds && req.addOnIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {req.addOnIds.map(id => (
                        <span key={id} className="bg-subtle text-[9px] px-2 py-0.5 rounded-full text-slate-400 font-bold uppercase tracking-tighter">
                          +{SERVICES.find(s => s.id === id)?.title}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-subtle">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount Paid</span>
                    <span className="text-sm font-black text-slate-yellow italic">TZS {req.totalCost.toLocaleString()}</span>
                  </div>
                  {req.status !== 'completed' && req.estimatedArrival !== undefined && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-yellow bg-slate-yellow/10 p-2 rounded-lg border border-slate-yellow/20 uppercase tracking-widest">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Estimated Arrival: {req.estimatedArrival} mins</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
