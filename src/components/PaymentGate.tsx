import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Smartphone, Building2, CheckCircle2, ChevronRight, X, Loader2, ShieldCheck, Zap, Banknote } from 'lucide-react';
import { cn } from '../lib/utils';

type PaymentMethod = 'card' | 'm-pesa' | 'tigopesa' | 'cash';

interface PaymentGateProps {
  amount: number;
  serviceTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentGate({ amount, serviceTitle, onSuccess, onCancel }: PaymentGateProps) {
  const [method, setMethod] = useState<PaymentMethod>('m-pesa');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    // Simulate Tanzanian Payment Gateway (M-Pesa/TigoPesa Push)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(onSuccess, 1500);
  };

  const methods = [
    { id: 'm-pesa', label: 'Vodacom M-Pesa', icon: Smartphone, color: 'text-red-600' },
    { id: 'tigopesa', label: 'Tigo Pesa', icon: Smartphone, color: 'text-blue-600' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, color: 'text-emerald-500' },
    { id: 'cash', label: 'Pay with Cash', icon: Banknote, color: 'text-slate-yellow' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[130] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-charcoal w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-subtle relative"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="selection"
              exit={{ opacity: 0, x: -20 }}
              className="p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tight uppercase">Malipo ya Uhakika</h2>
                <button onClick={onCancel} className="p-2 bg-subtle rounded-full text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-subtle rounded-full p-4 flex justify-between items-center border border-subtle px-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rescue Job</p>
                  <p className="text-sm font-bold text-slate-100 uppercase italic">{serviceTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Cost</p>
                  <p className="text-xl font-black text-slate-yellow">TZS {amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Njia ya Malipo</p>
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as PaymentMethod)}
                    className={cn(
                      "w-full p-4 rounded-full px-6 border transition-all flex items-center gap-4 text-left group",
                      method === m.id 
                        ? "bg-slate-yellow/10 border-slate-yellow text-slate-yellow" 
                        : "bg-subtle border-subtle text-slate-400 hover:opacity-80"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full transition-colors",
                      method === m.id ? "bg-slate-yellow text-charcoal" : "bg-subtle group-hover:opacity-80"
                    )}>
                      <m.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest">{m.label}</p>
                    </div>
                    {method === m.id && <CheckCircle2 size={16} className="text-slate-yellow" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="btn-viyeko-primary w-full h-16 shadow-xl shadow-slate-yellow/10"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    <span>Lipa Sasa</span>
                    <ChevronRight size={20} />
                  </div>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500/30">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-100 italic uppercase">Malipo Tayari!</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Mechanic assigned. Help is on the way.
                </p>
              </div>
              <div className="bg-emerald-400/10 py-2 rounded-full px-4 inline-block">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Dispatching Rescue Now
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
