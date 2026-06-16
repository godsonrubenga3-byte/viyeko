import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Car, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Phone 
} from 'lucide-react';
import { Request, SERVICES } from '../types';
import { cn } from '../lib/utils';
import MapContainer from './MapContainer';

interface LiveTrackingProps {
  request: Request;
  onCancel: () => void;
  onNextStep?: () => void;
}

export default function LiveTracking({ request, onCancel, onNextStep }: LiveTrackingProps) {
  const service = SERVICES.find(s => s.id === request.serviceId);
  const steps = [
    { id: 'searching', label: 'Searching', icon: Zap },
    { id: 'assigned', label: 'Assigned', icon: ShieldCheck },
    { id: 'on-the-way', label: 'On the Way', icon: Car },
    { id: 'arrived', label: 'Arrived', icon: MapPin },
    { id: 'in-progress', label: 'In Progress', icon: Activity },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'canceled', label: 'Canceled', icon: X },
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
          <div className={cn("p-3 rounded-full text-white shadow-lg", service?.color)}>
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
          <button onClick={onCancel} className="p-2 hover:bg-subtle rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <MapContainer 
        status={request.status} 
        className="h-64" 
      />

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
                     request.status === 'canceled' ? 'This request was canceled.' :
                     'Service completed!'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-subtle flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-subtle border border-subtle flex items-center justify-center text-slate-400">
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
}
