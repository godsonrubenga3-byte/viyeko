import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Request, SERVICES } from '../types';
import { Bell, CheckCircle2, Car, MapPin, ShieldCheck, AlertCircle, WifiOff, Wifi } from 'lucide-react';
import { ably } from '../lib/ably';

interface NotificationSystemProps {
  requests: Request[];
}

export default function NotificationSystem({ requests }: NotificationSystemProps) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [ablyState, setAblyState] = useState<string>('initialized');

  // OBJECTIVE: Connectivity & Networking Resilience
  useEffect(() => {
    // 1. Browser Network State
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Internet Connection Restored', {
        icon: <Wifi className="text-emerald-500" />,
        duration: 3000
      });
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('Internet Connection Lost', {
        description: 'You are currently offline. Real-time updates are paused.',
        icon: <WifiOff className="text-rose-500" />,
        duration: Infinity
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Ably WebSocket State
    if (ably) {
      const handleAblyState = (stateChange: any) => {
        setAblyState(stateChange.current);
        if (stateChange.current === 'disconnected' || stateChange.current === 'suspended' || stateChange.current === 'failed') {
          toast.error('Dispatch Network Disconnected', {
            description: 'Attempting to reconnect to the live marketplace...',
            icon: <AlertCircle className="text-rose-500" />,
            duration: Infinity,
            id: 'ably-disconnect'
          });
        } else if (stateChange.current === 'connected') {
          toast.dismiss('ably-disconnect');
          if (stateChange.previous !== 'initialized') {
             toast.success('Dispatch Network Connected', { duration: 2000 });
          }
        }
      };

      ably.connection.on(handleAblyState);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        ably.connection.off(handleAblyState);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rest of the existing code...
  // Static helper to trigger themed notifications
  const notifyStatusUpdate = (status: Request['status'], serviceTitle: string) => {
    const config = {
      searching: { title: 'Searching...', icon: Bell, color: 'text-slate-yellow' },
      bidding: { title: 'Bids Incoming...', icon: Bell, color: 'text-slate-yellow' },
      assigned: { title: 'Provider Assigned!', icon: ShieldCheck, color: 'text-emerald-500' },
      'on-the-way': { title: 'On the Way!', icon: Car, color: 'text-blue-500' },
      arrived: { title: 'Provider Arrived!', icon: MapPin, color: 'text-rose-500' },
      'in-progress': { title: 'Service Started', icon: AlertCircle, color: 'text-slate-yellow' },
      completed: { title: 'Service Completed', icon: CheckCircle2, color: 'text-emerald-500' },
    };

    const current = config[status] || config['searching'];

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

  (window as any).notifyStatusUpdate = notifyStatusUpdate;

  return null; 
}
