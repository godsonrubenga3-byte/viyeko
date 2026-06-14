import React from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, MapPin, Navigation, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Request, SERVICES } from '../types';
import { cn } from '../lib/utils';

interface HistoryPageProps {
  requests: Request[];
}

export default function HistoryPage({ requests }: HistoryPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-100 italic tracking-tight uppercase">My Requests</h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{requests.length} Total</span>
      </div>

      {requests.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="bg-subtle w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <HistoryIcon size={32} />
          </div>
          <p className="text-slate-500 font-medium">No requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const service = SERVICES.find(s => s.id === req.serviceId);
            return (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 space-y-3"
              >
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
                    req.status === 'searching' ? "bg-slate-yellow/10 text-slate-yellow" : "bg-emerald-900/30 text-emerald-400"
                  )}>
                    {req.status}
                  </div>
                </div>
                <div className="pt-2 border-t border-subtle space-y-2">
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
                        <span key={id} className="bg-subtle text-[9px] px-2 py-0.5 rounded-full text-slate-500">
                          +{SERVICES.find(s => s.id === id)?.title}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-subtle">
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
