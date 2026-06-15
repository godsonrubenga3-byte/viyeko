import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Send, X, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface BidInputProps {
  requestId: string;
  serviceTitle: string;
  onSend: (price: number, eta: number) => void;
  onCancel: () => void;
}

export default function BidInput({ requestId, serviceTitle, onSend, onCancel }: BidInputProps) {
  const [price, setPrice] = useState<string>('');
  const [eta, setEta] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !eta) return;
    onSend(Number(price), parseInt(eta));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border-l-4 border-l-emerald-500 space-y-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-100 uppercase italic tracking-tight">Create Offer</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job: {serviceTitle} • {requestId}</p>
        </div>
        <button onClick={onCancel} className="p-2 bg-subtle rounded-full text-slate-500 hover:text-slate-300">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Price (TZS)</label>
            <div className="relative">
              <input
                type="number"
                required
                placeholder="e.g. 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-viyeko w-full pl-12"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-yellow">TZS</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Arrival Time</label>
            <div className="relative">
              <input
                type="number"
                required
                placeholder="Mins"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="input-viyeko w-full pl-12"
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-yellow text-charcoal h-14 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-slate-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span>Send Live Quote</span>
          <Send size={20} />
        </button>
      </form>

      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl flex items-center gap-3">
        <ShieldCheck size={16} className="text-emerald-500" />
        <p className="text-[8px] font-bold text-emerald-500/70 uppercase tracking-wider">
          Pricing is dynamic. Compete with nearby garages to secure this rescue job.
        </p>
      </div>
    </motion.div>
  );
}
