import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Request, SERVICES } from '../types';
import { Bell, CheckCircle2, Car, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

interface NotificationSystemProps {
  requests: Request[];
}

export default function NotificationSystem({ requests }: NotificationSystemProps) {
  useEffect(() => {
    // This would normally be a Firestore listener
    // For now, we'll watch the requests array for status changes
    const activeRequests = requests.filter(r => r.status !== 'completed');
    
    activeRequests.forEach(req => {
      const service = SERVICES.find(s => s.id === req.serviceId);
      
      // Simulate checking for "new" status changes
      // In a real app, you'd compare against previous state or use Firestore onSnapshot
    });
  }, [requests]);

  // Static helper to trigger themed notifications
  const notifyStatusUpdate = (status: Request['status'], serviceTitle: string) => {
    const config = {
      searching: { title: 'Searching...', icon: Bell, color: 'text-slate-yellow' },
      assigned: { title: 'Provider Assigned!', icon: ShieldCheck, color: 'text-emerald-500' },
      'on-the-way': { title: 'On the Way!', icon: Car, color: 'text-blue-500' },
      arrived: { title: 'Provider Arrived!', icon: MapPin, color: 'text-rose-500' },
      'in-progress': { title: 'Service Started', icon: AlertCircle, color: 'text-slate-yellow' },
      completed: { title: 'Service Completed', icon: CheckCircle2, color: 'text-emerald-500' },
    };

    const current = config[status];

    toast.custom((t) => (
      <div className="glass-card p-4 flex items-center gap-4 border-subtle shadow-2xl min-w-[300px]">
        <div className={`p-2 rounded-full bg-subtle ${current.color}`}>
          <current.icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{serviceTitle}</p>
          <p className="text-xs font-black text-slate-100 italic uppercase">{current.title}</p>
        </div>
        <button 
          onClick={() => toast.dismiss(t)}
          className="text-[10px] font-bold text-slate-600 uppercase hover:text-slate-400"
        >
          Dismiss
        </button>
      </div>
    ), { duration: 4000 });
  };

  // Expose helper globally for demo purposes
  (window as any).notifyStatusUpdate = notifyStatusUpdate;

  return null; // This component doesn't render anything itself
}
