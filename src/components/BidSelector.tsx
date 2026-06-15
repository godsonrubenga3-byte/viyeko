import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Star, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Bid } from '../types';
import { cn } from '../lib/utils';

interface BidSelectorProps {
  bids: Bid[];
  onAccept: (bid: Bid) => void;
}

export default function BidSelector({ bids, onAccept }: BidSelectorProps) {
  if (bids.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
        <Loader2 size={40} className="text-slate-yellow animate-spin" />
        <div className="space-y-1">
          <p className="text-slate-100 font-black italic uppercase tracking-tight">Broadcasting Request...</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-[200px]">
            Nearby garages are viewing your issue and calculating prices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-end px-2">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incoming Offers</h3>
          <p className="text-xs font-bold text-slate-100 italic">Select your preferred garage</p>
        </div>
        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full uppercase">
          {bids.length} Active Bids
        </span>
      </div>

      <div className="space-y-3">
        {bids.sort((a, b) => a.price - b.price).map((bid, i) => (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 border-l-4 border-l-slate-yellow hover:border-l-emerald-500 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-subtle border border-subtle flex items-center justify-center text-slate-yellow">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">{bid.providerName}</h4>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-slate-yellow text-slate-yellow" />
                    <span className="text-[9px] font-black text-slate-500 uppercase">{bid.rating.toFixed(1)} Garage Rating</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-yellow italic">TZS {bid.price.toLocaleString()}</p>
                <div className="flex items-center gap-1 justify-end text-slate-500 mt-1">
                  <Clock size={10} />
                  <span className="text-[9px] font-bold uppercase">{bid.eta} MINS</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onAccept(bid)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Accept Offer</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
